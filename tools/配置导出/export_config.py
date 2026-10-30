# -*- coding: utf-8 -*-
"""
《恐怖大航海》配置表导出器：xlsx -> JSON

用法：
    pip install openpyxl
    python tools/配置导出/export_config.py
    python tools/配置导出/export_config.py --src data/配置表 --out data/配置导出

表头规则（双行表头）：
    第1行：英文 key（程序字段名）
    第2行：中文说明（可含类型标记 [int]/[float]/[bool]/[list]/[json]），导出时跳过
    第3行起：数据行

单元格解析规则：
    - 说明行含 [int]    -> 转 int
    - 说明行含 [float]  -> 转 float
    - 说明行含 [bool]   -> 0/1 转 bool
    - 说明行含 [list]   -> 按 | 拆分为数组（空字符串 -> []）
    - 说明行含 [json]   -> 按 JSON 解析
    - 未标注            -> 自动推断（int/float/字符串），空单元格 -> 空字符串

校验：
    - id 字段唯一性（同 Sheet 内）
    - count_min <= count_max、probability 在 0~1
    - 掉落条目表 target_type=item 时 target_id 必须存在于物品表
    校验失败打印警告，不中断导出。

输出：
    <out>/<工作簿名>/<Sheet名>.json   （数组，每行一个对象）
    <out>/index.json                  （表清单与行数）
"""
import argparse
import json
import sys
from pathlib import Path

try:
    from openpyxl import load_workbook
except ImportError:
    print("缺少依赖：pip install openpyxl")
    sys.exit(1)

WARNINGS = []


def warn(msg):
    WARNINGS.append(msg)
    print("[WARN] " + msg)


def parse_cell(raw, desc):
    """按说明行类型标记解析单元格"""
    if raw is None:
        raw = ""
    if isinstance(raw, str):
        raw = raw.strip()
    d = desc or ""
    if "[int]" in d:
        return int(raw) if raw != "" else 0
    if "[float]" in d:
        return float(raw) if raw != "" else 0.0
    if "[bool]" in d:
        return bool(int(raw)) if raw != "" else False
    if "[list]" in d:
        return [s for s in str(raw).split("|") if s] if raw != "" else []
    if "[json]" in d:
        if raw == "":
            return None
        try:
            return json.loads(str(raw))
        except json.JSONDecodeError:
            warn("JSON 解析失败：%r" % raw)
            return None
    return raw


def export_sheet(ws, sheet_tag):
    """导出一个 Sheet 为 dict 列表"""
    rows = list(ws.iter_rows(values_only=True))
    if len(rows) < 2:
        warn("%s 行数不足（至少需要双行表头）" % sheet_tag)
        return []
    keys = [str(k).strip() if k is not None else "" for k in rows[0]]
    descs = [str(d) if d is not None else "" for d in rows[1]]
    keys = [k for k in keys]
    data = []
    seen_ids = set()
    for r_idx, row in enumerate(rows[2:], start=3):
        if all(c is None or str(c).strip() == "" for c in row):
            continue  # 跳过空行
        obj = {}
        for i, k in enumerate(keys):
            if not k:
                continue
            obj[k] = parse_cell(row[i] if i < len(row) else None, descs[i] if i < len(descs) else "")
        # 通用校验
        if "id" in obj and obj["id"] != "":
            if obj["id"] in seen_ids:
                warn("%s 第%d行 id 重复：%r" % (sheet_tag, r_idx, obj["id"]))
            seen_ids.add(obj["id"])
        for a, b in (("count_min", "count_max"), ("pick_min", "pick_max"),
                     ("event_count_min", "event_count_max"),
                     ("event_distance_min", "event_distance_max"),
                     ("item_count_min", "item_count_max"),
                     ("stock_min", "stock_max")):
            if a in obj and b in obj and isinstance(obj[a], (int, float)) and isinstance(obj[b], (int, float)):
                if obj[b] and obj[a] > obj[b]:
                    warn("%s 第%d行 %s>%s" % (sheet_tag, r_idx, a, b))
        if "interval_jitter" in obj and isinstance(obj["interval_jitter"], (int, float)):
            if not (0 <= obj["interval_jitter"] <= 1):
                warn("%s 第%d行 interval_jitter 超出 0~1：%r" % (sheet_tag, r_idx, obj["interval_jitter"]))
        if "probability" in obj and isinstance(obj["probability"], (int, float)):
            if not (0 <= obj["probability"] <= 1):
                warn("%s 第%d行 probability 超出 0~1：%r" % (sheet_tag, r_idx, obj["probability"]))
        data.append(obj)
    return data


def main():
    repo_root = Path(__file__).resolve().parents[2]
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=str(repo_root / "data" / "配置表"))
    ap.add_argument("--out", default=str(repo_root / "data" / "配置导出"))
    args = ap.parse_args()
    src, out = Path(args.src), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    index = {}
    item_ids = set()
    drop_item_refs = []  # (sheet_tag, row_idx, target_id)

    for xlsx in sorted(src.glob("*.xlsx")):
        if xlsx.name.startswith("~$"):
            continue
        wb = load_workbook(xlsx, read_only=True, data_only=True)
        book_dir = out / xlsx.stem
        book_dir.mkdir(exist_ok=True)
        for ws in wb.worksheets:
            tag = "%s/%s" % (xlsx.stem, ws.title)
            data = export_sheet(ws, tag)
            fp = book_dir / (ws.title + ".json")
            fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            index[tag] = {"file": str(fp.relative_to(out)), "rows": len(data)}
            print("OK %s (%d 行)" % (tag, len(data)))
            # 收集外键校验数据
            if ws.title == "物品表":
                item_ids.update(str(o.get("item_id", "")) for o in data)
            if ws.title == "掉落条目表":
                for i, o in enumerate(data):
                    if o.get("target_type") == "item":
                        drop_item_refs.append((tag, i, str(o.get("target_id", ""))))
        wb.close()

    # 跨表校验：掉落条目 item 引用必须在物品表
    for tag, i, tid in drop_item_refs:
        if tid not in item_ids:
            warn("%s 掉落条目引用不存在的 item_id：%s" % (tag, tid))

    (out / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print("\n导出完成 -> %s" % out)
    if WARNINGS:
        print("共 %d 条警告，请检查上方 [WARN] 输出" % len(WARNINGS))
    else:
        print("校验通过，无警告")


if __name__ == "__main__":
    main()
