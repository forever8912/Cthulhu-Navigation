# -*- coding: utf-8 -*-
"""配置导出器的阻断级校验测试。

每个用例在临时目录里现造 xlsx，不依赖也不修改 data/配置表 的真实数据。
运行：python -m unittest discover -s tools/配置导出/tests -v
"""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from openpyxl import Workbook

EXPORTER = Path(__file__).resolve().parents[1] / "export_config.py"

PARAM_HEADER = ["param_key", "value", "type", "desc"]
PARAM_DESC = [
    "参数唯一key（程序按此读取）[string]",
    "参数值（按type解析）[string]",
    "值类型 [enum] int / float / bool / string",
    "参数说明 [string]",
]

SIMPLE_HEADER = ["id", "name"]
SIMPLE_DESC = ["唯一id [int]", "名称 [string]"]


def write_workbook(path, sheet_title, header, desc, rows):
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = sheet_title
    sheet.append(header)
    sheet.append(desc)
    for row in rows:
        sheet.append(row)
    workbook.save(path)
    workbook.close()


class ExportConfigTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        root = Path(self._tmp.name)
        self.src = root / "src"
        self.out = root / "out"
        self.src.mkdir()

    def tearDown(self):
        self._tmp.cleanup()

    def make_param_book(self, rows, name="09_全局参数"):
        write_workbook(self.src / (name + ".xlsx"), "全局参数表", PARAM_HEADER, PARAM_DESC, rows)

    def run_export(self, *extra):
        env = dict(os.environ, PYTHONIOENCODING="utf-8")
        return subprocess.run(
            [sys.executable, str(EXPORTER), "--src", str(self.src), "--out", str(self.out), *extra],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
        )

    def param_json(self):
        return self.out / "09_全局参数" / "全局参数表.json"

    # --- 正常路径 -----------------------------------------------------

    def test_converts_param_value_by_declared_type(self):
        self.make_param_book([
            ["main_stat_k", "1.0", "float", "系数K"],
            ["offline_hours_max", "8", "int", "离线时长上限"],
            ["some_switch", "true", "bool", "开关"],
            ["some_label", "abc", "string", "文本"],
        ])
        result = self.run_export()

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        data = json.loads(self.param_json().read_text(encoding="utf-8"))
        self.assertEqual(len(data), 4)
        self.assertEqual(data[0]["value"], 1.0)
        self.assertIsInstance(data[0]["value"], float)
        self.assertEqual(data[1]["value"], 8)
        self.assertIsInstance(data[1]["value"], int)
        self.assertIs(data[2]["value"], True)
        self.assertEqual(data[3]["value"], "abc")

    def test_output_is_byte_stable_across_runs(self):
        self.make_param_book([["a", "1", "int", "x"], ["b", "2.5", "float", "y"]])
        self.assertEqual(self.run_export().returncode, 0)
        first = self.param_json().read_bytes()
        first_index = (self.out / "index.json").read_bytes()

        self.assertEqual(self.run_export().returncode, 0)
        self.assertEqual(first, self.param_json().read_bytes())
        self.assertEqual(first_index, (self.out / "index.json").read_bytes())
        self.assertNotIn(b"\r\n", first)

    # --- 阻断路径（必须非零退出，且不产出 JSON）-------------------------

    def assert_blocked(self, keyword):
        result = self.run_export()
        self.assertNotEqual(result.returncode, 0, "应返回非零退出码\n" + result.stdout)
        self.assertIn("[ERROR]", result.stdout)
        self.assertIn(keyword, result.stdout)
        self.assertFalse(self.param_json().exists(), "校验失败时不应写出 JSON")

    def test_duplicate_key_blocks(self):
        self.make_param_book([
            ["crit_rate_base", "0.05", "float", "基础暴击率"],
            ["crit_rate_base", "0.06", "float", "重复定义"],
        ])
        self.assert_blocked("重复")

    def test_blank_key_blocks(self):
        self.make_param_book([
            ["", "1", "int", "缺 key"],
            ["ok_key", "2", "int", "正常"],
        ])
        self.assert_blocked("为空")

    def test_unknown_type_blocks(self):
        self.make_param_book([["odd", "1", "vec3", "非法 type"]])
        self.assert_blocked("type 非法")

    def test_unparsable_value_blocks(self):
        self.make_param_book([["broken", "abc", "int", "值无法解析"]])
        self.assert_blocked("无法按 [int] 解析")

    def test_declared_int_with_fraction_blocks(self):
        self.make_param_book([["half", "1.5", "int", "声明 int 却有小数"]])
        self.assert_blocked("含小数")

    def test_duplicate_column_blocks(self):
        write_workbook(
            self.src / "09_全局参数.xlsx", "全局参数表",
            ["param_key", "value", "value", "type"],
            ["key [string]", "值 [string]", "重复列 [string]", "类型 [enum] int"],
            [["k", "1", "2", "int"]],
        )
        self.assert_blocked("表头列名重复")

    # --- 单本重导不破坏其他工作簿的索引 --------------------------------

    def test_book_filter_keeps_other_index_entries(self):
        write_workbook(self.src / "01_海域与关卡.xlsx", "海域表",
                       SIMPLE_HEADER, SIMPLE_DESC, [[1, "近海"], [2, "远海"]])
        self.make_param_book([["a", "1", "int", "x"]])

        self.assertEqual(self.run_export().returncode, 0)
        full_index = json.loads((self.out / "index.json").read_text(encoding="utf-8"))
        self.assertEqual(len(full_index), 2)

        # 只重导 09：01 的条目必须保留，09 的条目被刷新
        self.assertEqual(self.run_export("--book", "09_全局参数").returncode, 0)
        partial_index = json.loads((self.out / "index.json").read_text(encoding="utf-8"))
        self.assertIn("01_海域与关卡/海域表", partial_index)
        self.assertIn("09_全局参数/全局参数表", partial_index)
        self.assertEqual(partial_index["01_海域与关卡/海域表"]["rows"], 2)


if __name__ == "__main__":
    unittest.main()
