# -*- coding: utf-8 -*-
"""生成《恐惧之海》1阶船体第一章 · AI 生图提示词总表【厚涂版 v2】"""
import sys, os, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

import v2_data_a, v2_data_b

D = {}
D.update(v2_data_a.D)
D.update(v2_data_b.D)

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ASSET_DIR = os.path.join(REPO_ROOT, "assets", "生图提示词")
SRC = os.path.join(ASSET_DIR, "恐惧之海_1阶船体第一章_AI生图提示词总表.xlsx")

# ---------- 全局前缀 ----------
P_ASSET_CN = ("暗黑厚涂插画风格的游戏美术资源，克苏鲁恐怖航海题材；可见的油画笔触与干刷质感，低饱和深冷色调；"
              "单一主光源自左上方向下散射，明暗交界线清晰、暗部压至近黑、窄边高光；以明暗塑造体积而非描边，"
              "无硬描边、无平涂色块、无像素颗粒；材质写实：斑驳木纹、锈蚀铁件、藤壶盐渍、补丁帆布、湿透麻绳；"
              "自发光仅用磷光青 #4FD1C5 与灵紫 #A78BFA 点缀；纯中性灰背景 #808080，主体完整不裁切、"
              "四周留 5% 边距、无地面投影、无环境元素。主体内容：")
P_ASSET_EN = ("dark painterly illustration, game asset, Lovecraftian nautical horror; visible oil brushwork and dry-brush texture, "
              "desaturated deep cold palette; single light source from upper left, crisp shadow terminator, shadows crushed near "
              "black, narrow rim highlights; form built by value not outline, no hard outline, no flat fills, no pixel grain; "
              "realistic materials - weathered wood grain, rusted iron, barnacle and salt stains, patched canvas, soaked hemp rope; "
              "self-illumination only in phosphorescent teal #4FD1C5 and spirit purple #A78BFA; flat neutral gray background #808080, "
              "subject fully in frame with 5% margin, no cast shadow, no environment. SUBJECT: ")

P_SCENE_CN = ("暗黑厚涂插画风格的游戏画面，克苏鲁恐怖航海题材；可见的油画笔触与干刷质感，低饱和深冷色调，浓雾分层；"
              "单一主光源自左上方向下散射，明暗交界线清晰、暗部压至近黑；以明暗塑造体积而非描边，无硬描边、"
              "无平涂色块、无像素颗粒；材质写实：斑驳木纹、锈蚀铁件、藤壶盐渍、补丁帆布；"
              "自发光仅用磷光青 #4FD1C5 与灵紫 #A78BFA 点缀。画面内容：")
P_SCENE_EN = ("dark painterly game illustration, Lovecraftian nautical horror; visible oil brushwork and dry-brush texture, "
              "desaturated deep cold palette, layered fog; single light source from upper left, crisp shadow terminator, "
              "shadows crushed near black; form built by value not outline, no hard outline, no flat fills, no pixel grain; "
              "realistic materials - weathered wood grain, rusted iron, barnacle and salt stains, patched canvas; "
              "self-illumination only in phosphorescent teal #4FD1C5 and spirit purple #A78BFA. SCENE: ")

NEG_CN = ("负面词：像素风，像素块，16 色，低分辨率，卡通粗描边，矢量扁平，平涂色块，Q 版，可爱，日式动画，赛璐璐，"
          "3D 渲染，照片写实，过饱和，霓虹赛博，塑料感，渐变网格，文字，数字，水印，签名，重复人物，镜像对称，"
          "多余肢体，背景环境，地面投影，主体裁切，模糊")
NEG_EN = ("negative: pixel art, pixel blocks, 16 colors, low resolution, thick cartoon outline, vector flat, flat fills, chibi, cute, "
          "anime, cel shading, 3D render, photorealistic, oversaturated, neon cyberpunk, plastic, gradient mesh, text, numbers, "
          "watermark, signature, duplicate figures, mirrored symmetry, extra limbs, environment background, cast shadow, cropped "
          "subject, blurry")

wb = load_workbook(SRC)
ws = wb["生图提示词总表"]

hdr = [c.value for c in ws[1]]
# 定位列
CI = {name: i + 1 for i, name in enumerate(hdr)}
COL_CODE = CI["资源编号"]
COL_CN = CI["生图提示词（中文）"]
COL_EN = CI["生图提示词（English）"]
COL_SIZE = CI["出图尺寸（设计×2）"]
COL_FR = CI["帧数/张数"]
COL_NOTE = CI["备注（补充负面/验收）"]
COL_TYPE = CI["类型"]

ws.cell(row=1, column=COL_SIZE).value = "出图尺寸·厚涂版"
ws.cell(row=1, column=COL_EN).value = "生图提示词（English）"
ws.cell(row=1, column=COL_NOTE).value = "备注（厚涂版·验收/实现）"

missing, total_imgs = [], 0
for r in range(2, ws.max_row + 1):
    code = ws.cell(row=r, column=COL_CODE).value
    if code not in D:
        missing.append(code)
        continue
    t = D[code]
    cn, en, size, frames, note = t[0], t[1], t[2], t[3], t[4]
    scene = t[5] if len(t) > 5 else False

    if size == "—" or frames == 0:
        # 组件类，不生图
        ws.cell(row=r, column=COL_CN).value = "【组件·程序处理，不生图】" + note
        ws.cell(row=r, column=COL_EN).value = "[handled in engine, no image generation] " + note
        ws.cell(row=r, column=COL_SIZE).value = "—"
        ws.cell(row=r, column=COL_FR).value = 0
        ws.cell(row=r, column=COL_NOTE).value = note
        if code == "F11":
            ws.cell(row=r, column=4).value = "字体方案（系统字 + 描边/投影）"
        continue

    ws.cell(row=r, column=COL_CN).value = (P_SCENE_CN if scene else P_ASSET_CN) + cn
    ws.cell(row=r, column=COL_EN).value = (P_SCENE_EN if scene else P_ASSET_EN) + en
    ws.cell(row=r, column=COL_SIZE).value = size
    ws.cell(row=r, column=COL_FR).value = frames
    old = ws.cell(row=r, column=COL_NOTE).value or ""
    ws.cell(row=r, column=COL_NOTE).value = note + ("｜原备注：" + str(old) if old and str(old) != "None" else "")
    total_imgs += frames

# 行高与折行
for r in range(2, ws.max_row + 1):
    ws.row_dimensions[r].height = 132
    for c in (COL_CN, COL_EN, COL_NOTE):
        cell = ws.cell(row=r, column=c)
        cell.alignment = Alignment(wrap_text=True, vertical="top")
ws.column_dimensions[get_column_letter(COL_CN)].width = 78
ws.column_dimensions[get_column_letter(COL_EN)].width = 62
ws.column_dimensions[get_column_letter(COL_NOTE)].width = 40
ws.column_dimensions[get_column_letter(COL_SIZE)].width = 18

# ---------- 汇总 ----------
ws2 = wb["汇总"]
for row in ws2["A1:C30"]:
    for cell in row:
        cell.value = None

from collections import OrderedDict
batches = OrderedDict()
types = OrderedDict()
for r in range(2, ws.max_row + 1):
    b = ws.cell(row=r, column=2).value
    ty = ws.cell(row=r, column=COL_TYPE).value
    fr = ws.cell(row=r, column=COL_FR).value or 0
    if b not in batches:
        batches[b] = [0, 0]
    batches[b][0] += 1
    batches[b][1] += fr
    if ty not in types:
        types[ty] = 0
    types[ty] += 1

thin = Side(style="thin", color="BFBFBF")
bd = Border(left=thin, right=thin, top=thin, bottom=thin)
head_fill = PatternFill("solid", fgColor="2F4F4F")
head_font = Font(bold=True, color="FFFFFF", size=11)

ws2["A1"] = "厚涂版 v2 · 按生成批次统计"
ws2["A1"].font = Font(bold=True, size=13)
for i, h in enumerate(["批次", "条目数", "出图张数（厚涂压缩后）"]):
    c = ws2.cell(row=2, column=1 + i, value=h)
    c.fill, c.font, c.border = head_fill, head_font, bd
    c.alignment = Alignment(horizontal="center")

r = 3
for b, (cnt, imgs) in batches.items():
    ws2.cell(row=r, column=1, value=b).border = bd
    ws2.cell(row=r, column=2, value=cnt).border = bd
    ws2.cell(row=r, column=3, value=imgs).border = bd
    r += 1
ws2.cell(row=r, column=1, value="合计").font = Font(bold=True)
ws2.cell(row=r, column=1).border = bd
ws2.cell(row=r, column=2, value=sum(v[0] for v in batches.values())).font = Font(bold=True)
ws2.cell(row=r, column=2).border = bd
ws2.cell(row=r, column=3, value=total_imgs).font = Font(bold=True)
ws2.cell(row=r, column=3).border = bd
total_row = r

r += 2
ws2.cell(row=r, column=1, value="按类型").font = Font(bold=True, size=12)
r += 1
for i, h in enumerate(["类型", "条目数", "占比"]):
    c = ws2.cell(row=r, column=1 + i, value=h)
    c.fill, c.font, c.border = head_fill, head_font, bd
    c.alignment = Alignment(horizontal="center")
r += 1
tot = sum(types.values())
for ty, cnt in types.items():
    ws2.cell(row=r, column=1, value=ty).border = bd
    ws2.cell(row=r, column=2, value=cnt).border = bd
    c = ws2.cell(row=r, column=3, value=cnt / tot)
    c.number_format = "0.0%"
    c.border = bd
    r += 1

ws2.column_dimensions["A"].width = 30
ws2.column_dimensions["B"].width = 12
ws2.column_dimensions["C"].width = 26

# ---------- 风格与使用说明 ----------
ws3 = wb["风格与使用说明"]
ws3.delete_rows(1, ws3.max_row + 1)

rows = [
    ("厚涂风格规格与产线说明（v2）", ""),
    ("版本", "v2.0 · 2026-10-30 · 由像素风全面切换为暗黑厚涂插画风"),
    ("切换依据", "实测 GPT/DALL·E 类模型在《黑暗厚涂写实》上开箱可用度最高；像素风三次尝试均退化为“高分辨率插画 + 像素滤镜”，不值得继续对抗"),
    ("", ""),
    ("一、风格定义（写进每条提示词前缀）", ""),
    ("画法", "手绘厚涂：可见油画笔触、干刷质感、厚堆颜料；以明暗塑造体积，不用描边"),
    ("色调", "低饱和深冷：深墨蓝、旧木褐、苔绿、骨白；暗部压至近黑，亮部只留窄边高光"),
    ("光照", "单一主光源自左上方向下散射；舱内暖黄提灯 3 处 vs 舱外冷蓝灰雾，冷暖分界在水线与舷墙"),
    ("发光色", "仅两处：磷光青 #4FD1C5（水母/蟹壳裂隙/水线反光）、灵紫 #A78BFA（远处魔法微光/深渊凝视）"),
    ("材质", "斑驳木纹、锈蚀铁件、藤壶盐渍、补丁帆布、湿透麻绳、油渍与霉斑"),
    ("禁止", "像素颗粒、硬描边、平涂色块、矢量扁平、日式赛璐璐、3D 渲染、写实照片"),
    ("", ""),
    ("二、与像素版的关键规格差异", ""),
    ("出图尺寸", "由「设计尺寸×2」改为「设计尺寸×4」。厚涂细节吃分辨率，缩到游戏尺寸才不糊（如 128×128 的船员出 512×512）"),
    ("背景", "由「纯透明 PNG」改为「纯中性灰 #808080」。AI 画不出真透明，会画棋盘格；灰底最利于抠图，暗部与亮部边界都清楚"),
    ("描边", "取消 1px 断线描边。厚涂靠明暗交界塑形，加描边会立刻退化成卡通"),
    ("色数", "不限制色数；后期统一降到 48~64 色 + 加颗粒，用于压 AI 味与减包体"),
    ("帧数", "全面压缩：怪物 21→6 帧、精英 24→8、Boss 34→10、房间 7→6、船员待机 4→2。总张数由 336 降到 " + str(total_imgs)),
    ("", ""),
    ("三、三条产线铁律", ""),
    ("1. 垫图", "B0-1 定稿后必须作为全表垫图（图生图），否则 67 条会出现 67 种笔触。这是厚涂风格唯一的风格锁"),
    ("2. 抠图", "纯灰底 #808080 出图 → 色键/魔棒去底 → 手动修边缘 2~3px → 输出 PNG-24。禁止直接用 AI 的“透明”结果"),
    ("3. 降色", "游戏内统一降到 48~64 色 + 轻微颗粒降噪，既是包体优化，也是抹掉 AI 味的最后一道工序"),
    ("", ""),
    ("四、动画方案（厚涂的真正成本黑洞）", ""),
    ("问题", "厚涂逐帧 = AI 每帧重画 = 帧间主体漂移 + 笔触不连续，21 帧怪物动画几乎不可能一致"),
    ("方案A·骨骼", "推荐。只出「部件分解图」（躯干/螯/足/眼/雾），用 Spine/DragonBones 驱动，零逐帧成本，动作反而更顺"),
    ("方案B·关键帧", "只出 2~4 张关键姿态，中间由程序补间 + 形变（缩放/倾斜/位移），适用于水母、雾团等软体"),
    ("方案C·序列帧", "仅用于 2~4 帧的短特效（命中、水花、枪口焰）。超过 5 帧一律不用逐帧"),
    ("", ""),
    ("五、风险与对策", ""),
    ("包体", "厚涂单张 1280×720 背景约 1.5~3MB，是像素版的 5~10 倍。对策：场景拆三层 + 复用 + 降色 + 按需分包"),
    ("AI 味", "TapTap 用户会放大看笔触逻辑。对策：坦承用 AI + 人工统一描边与光照方向，比藏着掖着安全"),
    ("一致性", "67 条 × 人工修 = 排期黑洞。对策：先做 B0-1 + 5 只怪物 + 7 间房共 13 条核心资产，验证成本再铺开"),
    ("", ""),
    ("六、全局负面词（每条提示词末尾追加）", ""),
    ("中文", NEG_CN),
    ("English", NEG_EN),
]
for i, (k, v) in enumerate(rows, start=1):
    ws3.cell(row=i, column=1, value=k)
    ws3.cell(row=i, column=2, value=v)
    if k in ("画法", "出图尺寸", "背景", "描边", "色数", "帧数", "1. 垫图", "2. 抠图", "3. 降色", "问题", "方案A·骨骼", "包体", "AI 味", "一致性", "中文", "English"):
        pass
    ws3.cell(row=i, column=1).alignment = Alignment(wrap_text=True, vertical="top")
    ws3.cell(row=i, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws3.cell(row=1, column=1).font = Font(bold=True, size=14)
for i in (5, 13, 20, 25, 31, 37):
    ws3.cell(row=i, column=1).font = Font(bold=True, size=12, color="1F4E5F")
ws3.column_dimensions["A"].width = 20
ws3.column_dimensions["B"].width = 110

out = os.path.join(ASSET_DIR, "恐惧之海_1阶船体第一章_AI生图提示词总表_厚涂v2.xlsx")
wb.save(out)
print("saved:", out)
print("missing codes:", missing)
print("total images (厚涂压缩后):", total_imgs)
print("rows:", ws.max_row - 1)
