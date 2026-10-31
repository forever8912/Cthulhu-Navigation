# -*- coding: utf-8 -*-
"""
《恐怖大航海》配置表导出器：xlsx -> JSON

用法：
    pip install -r requirements.txt
    python tools/配置导出/export_config.py
    python tools/配置导出/export_config.py --book 09_全局参数     # 只重导一本
    python tools/配置导出/export_config.py --src data/配置表 --out data/配置导出

表头规则（双行表头）：
    第1行：英文 key（程序字段名）
    第2行：中文说明，可含类型标记 [int]/[float]/[bool]/[list]/[json]/[string]/[enum]
    第3行起：数据行

单元格解析规则（说明行标记优先，无标记时按原文保留）：
    [int]    -> int，允许 "8" / "8.0"，小数部分非零视为错误
    [float]  -> float
    [bool]   -> 1/0、true/false、yes/no，其余视为错误
    [list]   -> 按 | 拆分为数组（空 -> []）
    [json]   -> JSON 解析
    [string] / [enum] / 无标记 -> 去空白后的字符串

表内自描述类型（全局参数表）：
    该表的 value 列在说明行只标注 [string]，真实类型由同一行的 type 列声明。
    因此导完原始值后，用 type 列二次转换 value，保证运行时拿到的是数字/布尔而不是字符串。

阻断级校验（任一失败 -> 退出码 1，且不写出任何 JSON）：
    - 主键为空 / 主键重复 / 声明的主键列不存在
    - 表头列名重复
    - 全局参数表：type 不在 int/float/bool/string、value 无法按 type 解析
    - [int]/[float]/[bool]/[json] 单元格解析失败

非阻断警告（退出码 0，仅提示）：
    - min/max 区间倒挂、概率或抖动超出 0~1、掉落条目外键缺失

输出：
    <out>/<工作簿名>/<Sheet名>.json   （数组，保持源表行序）
    <out>/index.json                  （表清单与行数，键排序稳定）

幂等性：
    相同输入的重复运行产生逐字节相同的结果（LF 换行、键排序、无时间戳）。
"""
import argparse
import json
import re
import sys
from pathlib import Path

try:
    from openpyxl import load_workbook
except ImportError:
    print("缺少依赖：pip install -r requirements.txt")
    sys.exit(1)

EXIT_OK = 0
EXIT_ERROR = 1

# 全局参数表：key/value/type 三列的表内自描述类型
PARAM_SHEET = "全局参数表"
PARAM_KEY = "param_key"
PARAM_VALUE = "value"
PARAM_TYPE = "type"
PARAM_TYPES = ("int", "float", "bool", "string")

# 主键列覆盖：这些表的主键不叫 id。
# 只登记单主键表；复合主键表（事件结果表 group_id+seq、房间等级表 room_id+level 等）
# 不在此列，它们的第一列天然重复，不能当唯一键用。
PRIMARY_KEY_OVERRIDES = {
    PARAM_SHEET: PARAM_KEY,
    "通用消耗表": "cost_id",
    "广告点位表": "ad_id",
}

# 非阻断区间校验：成对字段必须 min <= max
RANGE_PAIRS = (
    ("count_min", "count_max"),
    ("pick_min", "pick_max"),
    ("event_count_min", "event_count_max"),
    ("event_distance_min", "event_distance_max"),
    ("item_count_min", "item_count_max"),
    ("stock_min", "stock_max"),
)
# 非阻断区间校验：单字段必须落在 0~1
UNIT_FIELDS = ("interval_jitter", "probability")

# 说明行里的类型标记。必须只认第一个标记：
# 部分说明文字会在解释格式时提到另一个类型（如 option_id 说明里既有 [string] 又有 [int]），
# 用 `"[int]" in desc` 判断会误判，把字符串 id 当整数解析。
TYPE_MARKER_RE = re.compile(r"\[(int|float|bool|list|json|string|enum)\]")

_errors = []
_warnings = []


def fail(msg):
    _errors.append(msg)
    print("[ERROR] " + msg)


def warn(msg):
    _warnings.append(msg)
    print("[WARN] " + msg)


def reset_issues():
    _errors.clear()
    _warnings.clear()


def is_blank(raw):
    return raw is None or (isinstance(raw, str) and raw.strip() == "")


def is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def parse_bool(raw, ctx):
    if is_blank(raw):
        return False
    if isinstance(raw, bool):
        return raw
    text = str(raw).strip().lower()
    if text in ("1", "true", "yes", "y"):
        return True
    if text in ("0", "false", "no", "n"):
        return False
    fail("%s 无法按 [bool] 解析：%r" % (ctx, raw))
    return None


def parse_int(raw, ctx):
    if is_blank(raw):
        return 0
    if isinstance(raw, bool):
        return int(raw)
    try:
        number = float(str(raw).strip())
    except (TypeError, ValueError):
        fail("%s 无法按 [int] 解析：%r" % (ctx, raw))
        return None
    if number != int(number):
        fail("%s 声明 [int] 但含小数：%r" % (ctx, raw))
        return None
    return int(number)


def parse_float(raw, ctx):
    if is_blank(raw):
        return 0.0
    if isinstance(raw, bool):
        return float(raw)
    try:
        return float(str(raw).strip())
    except (TypeError, ValueError):
        fail("%s 无法按 [float] 解析：%r" % (ctx, raw))
        return None


def parse_json(raw, ctx):
    if is_blank(raw):
        return None
    text = str(raw)
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        fail("%s JSON 解析失败（%s）：%r" % (ctx, exc.msg, text))
        return None


def parse_list(raw):
    if is_blank(raw):
        return []
    return [part.strip() for part in str(raw).split("|") if part.strip()]


def parse_cell(raw, desc, ctx):
    """按说明行第一个类型标记解析单元格。没标类型时保留原文。"""
    match = TYPE_MARKER_RE.search(desc or "")
    marker = match.group(1) if match else ""
    if marker == "int":
        return parse_int(raw, ctx)
    if marker == "float":
        return parse_float(raw, ctx)
    if marker == "bool":
        return parse_bool(raw, ctx)
    if marker == "list":
        return parse_list(raw)
    if marker == "json":
        return parse_json(raw, ctx)
    if is_blank(raw):
        return ""
    return str(raw).strip() if isinstance(raw, str) else raw


def coerce_param_value(raw, type_name, ctx):
    """全局参数表：按同一行 type 列的声明，把 value 转成真正的基础类型。"""
    name = str(type_name or "").strip().lower()
    if name not in PARAM_TYPES:
        fail("%s type 非法：%r（允许 %s）" % (ctx, type_name, " / ".join(PARAM_TYPES)))
        return None
    if name == "int":
        return parse_int(raw, ctx)
    if name == "float":
        return parse_float(raw, ctx)
    if name == "bool":
        return parse_bool(raw, ctx)
    return "" if is_blank(raw) else str(raw).strip()


def resolve_primary_key(sheet_title, keys):
    """决定一张表的主键列；返回 None 表示不做唯一性校验。

    只认两种来源：显式声明的表，以及列名恰好叫 id 的表。
    不按“第一列是 xxx_id 就当主键”猜测——本项目存在复合主键表
    （事件结果表 group_id+seq、房间等级表 room_id+level），
    它们的第一列天然重复，猜错会把正常数据判成重复主键。
    """
    override = PRIMARY_KEY_OVERRIDES.get(sheet_title)
    if override:
        return override
    return "id" if "id" in keys else None


def check_ranges(obj, ctx):
    for low_key, high_key in RANGE_PAIRS:
        low, high = obj.get(low_key), obj.get(high_key)
        if is_number(low) and is_number(high) and low > high:
            warn("%s %s > %s（%r > %r）" % (ctx, low_key, high_key, low, high))
    for key in UNIT_FIELDS:
        value = obj.get(key)
        if is_number(value) and not (0 <= value <= 1):
            warn("%s %s 超出 0~1：%r" % (ctx, key, value))


def export_sheet(ws, tag):
    """导出一个 Sheet，返回 dict 列表。行序与源表一致。"""
    rows = list(ws.iter_rows(values_only=True))
    if len(rows) < 2:
        fail("%s 行数不足（至少需要双行表头）" % tag)
        return []

    keys = [str(k).strip() if k is not None else "" for k in rows[0]]
    descs = [str(d) if d is not None else "" for d in rows[1]]

    seen_columns = {}
    for index, key in enumerate(keys):
        if not key:
            continue
        if key in seen_columns:
            fail("%s 表头列名重复：%r（第%d列与第%d列）"
                 % (tag, key, seen_columns[key] + 1, index + 1))
        seen_columns[key] = index

    named_keys = [k for k in keys if k]
    primary_key = resolve_primary_key(ws.title, named_keys)
    is_param_sheet = ws.title == PARAM_SHEET

    if primary_key is None:
        warn("%s 未识别主键列，跳过唯一性校验" % tag)
    elif primary_key not in keys:
        fail("%s 声明的主键列 %r 不存在" % (tag, primary_key))
        primary_key = None

    data = []
    seen_keys = {}
    for row_no, row in enumerate(rows[2:], start=3):
        if all(is_blank(cell) for cell in row):
            continue
        ctx = "%s 第%d行" % (tag, row_no)
        obj = {}
        for index, key in enumerate(keys):
            if not key:
                continue
            desc = descs[index] if index < len(descs) else ""
            obj[key] = parse_cell(row[index] if index < len(row) else None, desc, "%s %s" % (ctx, key))

        if is_param_sheet:
            obj[PARAM_VALUE] = coerce_param_value(
                obj.get(PARAM_VALUE), obj.get(PARAM_TYPE), "%s %s" % (ctx, PARAM_VALUE)
            )

        if primary_key:
            key_value = obj.get(primary_key)
            if is_blank(key_value):
                fail("%s 主键 %s 为空" % (ctx, primary_key))
            else:
                key_text = str(key_value)
                if key_text in seen_keys:
                    fail("%s 主键 %s 重复：%r（首次出现在第%d行）"
                         % (ctx, primary_key, key_text, seen_keys[key_text]))
                else:
                    seen_keys[key_text] = row_no

        check_ranges(obj, ctx)
        data.append(obj)
    return data


def collect_books(src, wanted):
    books = sorted(p for p in src.glob("*.xlsx") if not p.name.startswith("~$"))
    if not wanted:
        return books
    available = {p.stem: p for p in books}
    for name in sorted(wanted):
        if name not in available:
            fail("找不到工作簿：%s" % name)
    return [available[name] for name in sorted(available) if name in wanted]


def cross_check(results):
    """掉落条目表引用物品表的外键检查：两表都导出时才校验。"""
    item_ids = set()
    for tag, _rel, _count, rows in results:
        if tag.endswith("/物品表"):
            item_ids.update(str(row.get("item_id", "")) for row in rows)
    if not item_ids:
        return
    for tag, _rel, _count, rows in results:
        if not tag.endswith("/掉落条目表"):
            continue
        for row in rows:
            if row.get("target_type") == "item" and str(row.get("target_id", "")) not in item_ids:
                warn("%s 掉落条目引用不存在的 item_id：%s" % (tag, row.get("target_id")))


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    path.write_text(text, encoding="utf-8", newline="\n")


def load_index(path):
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        warn("index.json 无法解析，将重建")
        return {}


def main(argv=None):
    repo_root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description="配置表导出器：xlsx -> JSON")
    parser.add_argument("--src", default=str(repo_root / "data" / "配置表"))
    parser.add_argument("--out", default=str(repo_root / "data" / "配置导出"))
    parser.add_argument("--book", action="append", default=None,
                        help="只导出指定工作簿名（可重复），index 保留其他工作簿条目")
    args = parser.parse_args(argv)

    reset_issues()
    src, out = Path(args.src), Path(args.out)
    if not src.is_dir():
        print("[ERROR] 源目录不存在：%s" % src)
        return EXIT_ERROR

    books = collect_books(src, set(args.book or []))
    if not books:
        fail("没有可导出的 xlsx：%s" % src)
    if _errors:
        return report_and_exit()

    results = []
    for xlsx in books:
        workbook = load_workbook(xlsx, read_only=True, data_only=True)
        try:
            for ws in workbook.worksheets:
                tag = "%s/%s" % (xlsx.stem, ws.title)
                rows = export_sheet(ws, tag)
                results.append((tag, "%s/%s.json" % (xlsx.stem, ws.title), len(rows), rows))
                print("OK %s (%d 行)" % (tag, len(rows)))
        finally:
            workbook.close()

    cross_check(results)

    # 校验失败时一个文件都不写，避免半成品被当成可用配置
    if _errors:
        return report_and_exit()

    index = load_index(out / "index.json") if args.book else {}
    for tag, rel, count, rows in results:
        write_json(out / rel, rows)
        index[tag] = {"file": rel, "rows": count}
    write_json(out / "index.json", dict(sorted(index.items())))

    print("\n导出完成 -> %s" % out)
    if _warnings:
        print("共 %d 条警告，请检查上方 [WARN] 输出" % len(_warnings))
    else:
        print("校验通过，无警告")
    return EXIT_OK


def report_and_exit():
    print("\n导出中止：%d 个阻断错误，未写出任何 JSON" % len(_errors))
    return EXIT_ERROR


if __name__ == "__main__":
    sys.exit(main())
