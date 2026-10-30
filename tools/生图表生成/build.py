# -*- coding: utf-8 -*-
"""恐惧之海·1阶船体第一章 AI生图提示词总表 建表脚本"""
try:
    import openpyxl
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet", "openpyxl>=3.1.0"])
    import openpyxl

import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

def xl_color(css_hex: str) -> str:
    value = css_hex.removeprefix("#").upper()
    if len(value) != 6:
        raise ValueError(f"Expected #RRGGBB, got: {css_hex}")
    return "FF" + value

# ── 配色（商务蓝） ──────────────────────────────
XL_PRIMARY = xl_color("#4472C4")
XL_BORDER = xl_color("#BFBFBF")
XL_LIGHT = xl_color("#D9E2F3")
XL_SUM = xl_color("#2F5597")
thin_side = Side(style="thin", color=XL_BORDER)
BORDER_ALL = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

HDR_FILL = PatternFill("solid", fgColor=XL_PRIMARY)
HDR_FONT = Font(bold=True, color="FFFFFF", size=11)
LIGHT_FILL = PatternFill("solid", fgColor=XL_LIGHT)
SUM_FILL = PatternFill("solid", fgColor=XL_SUM)
SUM_FONT = Font(bold=True, color="FFFFFF")

TITLE = "恐惧之海·1阶船体第一章 AI生图提示词总表"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR = os.path.join(REPO_ROOT, "assets", "生图提示词")
os.makedirs(OUT_DIR, exist_ok=True)
OUT = os.path.join(OUT_DIR, "恐惧之海_1阶船体第一章_AI生图提示词总表.xlsx")
if os.path.exists(OUT):
    import time
    OUT = OUT.replace(".xlsx", f"_{time.strftime('%Y%m%d_%H%M%S')}.xlsx")

# ── 全局提示词前缀 ──────────────────────────────
PFX_CN = ("像素艺术，16-bit复古游戏美术，横版侧面视角，克苏鲁恐怖航海题材，阴森深海氛围，"
          "16色有限色板，点缀磷光青(#4FD1C5)与灵紫(#A78BFA)，1像素深色描边(#0B0E14)，光源左上45度，纯透明背景，")
PFX_EN = ("pixel art, 16-bit retro game asset, side view, Lovecraftian dark nautical horror theme, "
          "eerie deep-sea atmosphere, limited 16-color palette with phosphorescent teal #4FD1C5 and "
          "spirit purple #A78BFA accents, 1px dark outline #0B0E14, top-left lighting, transparent background, ")
NEG_CN = "3D渲染，写实，照片，模糊，抗锯齿，平滑渐变阴影，高饱和度，文字，水印，签名，多余肢体，变形，Q版可爱风，儿童插画"
NEG_EN = "3D render, realistic, photo, blurry, antialiasing, smooth gradient shading, oversaturated, text, watermark, signature, extra limbs, deformed, chibi, cute, children illustration"

B0 = "批次0·风格定调"; B1 = "批次1·场景与船体"; B2 = "批次2·船员与装备"; B3 = "批次3·船舱房间"
B4 = "批次4·怪物"; B5 = "批次5·动作特效"; B6 = "批次6·UI与图标"; B7 = "批次7·漂浮物"
BATCHES = [B0, B1, B2, B3, B4, B5, B6, B7]

# ── 数据：(批次, 编号, 名称, 类型, 出图尺寸, 帧数/张数, 前置依赖, 中文提示词, 英文提示词, 备注) ──
D = [
# ═══ 批次0 风格定调 ═══
(B0, "B0-1", "主界面示意图·经营层（风格母版①）", "图片", "2560×1440", 1, "无",
 PFX_CN + "游戏主界面全景概念示意图：横版画面，右侧为一艘木筏的舱室横剖面（侧面剖开视角），剖面内可见划桨动力舱、钓鱼房、种植房、雨水收集器等木制舱室与管线细节，甲板上站着三名水手像素小人；左侧海面延伸至远处迷雾；画面顶部横排HUD：资源图标条（能源、食物、淡水、弹药）、SAN紫色条、航段进度条；UI面板深色木纹+黄铜镶边",
 PFX_EN + "game main screen full concept mockup, landscape: right side shows a wooden raft room cross-section (side cutaway) with wooden rooms inside — rowing engine, fishing room, planting room, rain collector — pipes and details, three pixel sailors on deck; sea on the left fading into distant fog; top HUD bar with resource icons (energy, food, water, ammo), purple SAN meter, voyage progress bar; dark wood and brass pixel UI panels",
 "★全表优先级最高：先出这张定色板/光照/UI骨架；定稿后作为所有后续生图的风格参考图（垫图）"),
(B0, "B0-2", "战斗示意图·横版塔防（风格母版②）", "图片", "2560×1440", 1, "B0-1",
 PFX_CN + "横版塔防战斗示意图：木筏居中偏右，一名水手持弯刀警戒、一名持火枪瞄准，船舷鱼叉炮正发射一枚鱼叉、弹道低平掠过海面；左侧海面下一只半透明发光水母浮出水面、一只巨大腐化螃蟹举螯逼近，水花四溅，雾气在怪物身后翻涌",
 PFX_EN + "side-view tower defense battle mockup: wooden raft center-right, one sailor with cutlass on guard, one aiming a musket, gunwale harpoon turret firing a low flat projectile across the water; on the left a translucent glowing jellyfish surfacing and a huge corrupted crab raising its claw, splashes, fog rolling behind the monsters",
 "锁定怪物/船员/船体的同屏比例关系；定稿后可与批次1并行开各批次"),

# ═══ 批次1 场景与船体 ═══
(B1, "A1-1", "背景层·远景雾墙", "图片", "1280×720", 1, "B0-1",
 PFX_CN + "远景背景层，横向无缝平铺：浓雾中的海平线，雾墙深处隐约有巨大剪影（沉船桅杆或巨兽轮廓），整体极低对比，蓝灰冷色调",
 PFX_EN + "distant background layer, seamless horizontal tile: foggy horizon, faint huge silhouettes deep in the fog (sunken masts or leviathan outline), very low contrast, cold blue-gray tones",
 "注意平铺接缝；迷雾是第一章视觉主题"),
(B1, "A1-2", "背景层·中景海平线与远海", "图片", "1280×720", 1, "B0-1",
 PFX_CN + "中景背景层，横向无缝平铺：阴沉海面延伸至雾中，零星漂浮碎木与暗礁剪影，色相较远景略亮一档",
 PFX_EN + "midground layer, seamless horizontal tile: gloomy sea stretching into fog, scattered driftwood and reef silhouettes, one step brighter than the far layer",
 ""),
(B1, "A1-3", "背景层·近景浪面", "动作", "1280×720", 4, "B0-1",
 PFX_CN + "近景浪面层，横向无缝平铺：深色海水浪涌起伏循环，浪尖带少量磷光青反光",
 PFX_EN + "foreground wave layer, seamless horizontal tile: dark rolling sea loop with subtle phosphorescent teal glints on crests",
 "4帧：涌起-推进-落下-回落"),
(B1, "A2-1", "船体木筏·完好态", "图片", "1440×720", 1, "B0-1",
 PFX_CN + "木筏船体横剖面，完好态：粗木与绳索捆扎的大型筏体，甲板上有简易护栏与两根桅杆，剖面可见8个方形空舱格木架、船舷两侧有可攀爬边缘，木板磨损但结构完整",
 PFX_EN + "wooden raft hull cross-section, intact: large raft of thick logs lashed with ropes, simple deck railing and two masts, 8 empty square room frame slots in cross-section, climbable hull edges both sides, worn but intact planks",
 "舱格位置须与批次3房间落位一致；承载8格槽位/甲板岗/攀爬路径"),
(B1, "A2-2", "船体木筏·受损态", "图片", "1440×720", 1, "A2-1",
 PFX_CN + "同一木筏横剖面，受损态：部分木板碎裂缺失、护栏断裂、缆绳松脱，明显焦黑与裂纹，整体结构仍站立",
 PFX_EN + "same raft cross-section, damaged: broken missing planks, cracked railings, loose ropes, scorch marks and cracks, structure still standing",
 "耐久<50%时切换"),
(B1, "A2-3", "船体木筏·严重受损态", "图片", "1440×720", 1, "A2-1",
 PFX_CN + "同一木筏横剖面，严重受损战败态：大面积木板缺失、桅杆折断倾斜、船体下沉侧倾、渗水，濒临解体",
 PFX_EN + "same raft cross-section, heavily destroyed defeat state: large missing sections, broken tilted mast, listing and half-sinking, near collapse",
 "船体耐久归零的战败表现"),
(B1, "A3", "舱格空槽位（普通+选中）", "图片", "128×128", 2, "A2-1",
 PFX_CN + "木质空舱格框架：钉着木条的方形空架子，内部深色，边框有钉子与绳结细节、略带霉斑；另出选中态一版，边框微微发光",
 PFX_EN + "empty wooden room frame slot: square scaffold of planks and nails, dark interior, rope knots and mildew details; plus a selected variant with subtly glowing border",
 "生产2格/战斗功能1格共用，程序缩放"),
(B1, "A4", "海面水线", "动作", "1440×128", 4, "A2-1",
 PFX_CN + "船体吃水线动画：木筏与海面交界的波纹、泡沫与轻微起伏循环，船的漂浮感全靠它",
 PFX_EN + "waterline animation: ripple, foam and gentle bobbing at raft hull waterline, loop",
 ""),
(B1, "A5", "航段进度条底图", "组件", "800×96", 1, "B0-1",
 PFX_CN + "海图卷轴风格进度条底图：羊皮纸长条+两端黄铜卷轴头，附两个检查点锚位与小船标记",
 PFX_EN + "nautical chart scroll progress bar base: parchment strip with brass roller ends, two checkpoint anchors and a tiny ship marker",
 "第一章2个航段（500里/段）"),

# ═══ 批次2 船员与装备 ═══
(B2, "C1-1", "基础水手·待机", "动作", "128×128", 4, "B0-1",
 PFX_CN + "一名普通水手像素小人（32×32设计）：粗布衣裤、头巾、赤脚，面朝右站立呼吸起伏待机循环，剪影清晰易读",
 PFX_EN + "common sailor pixel character (32x32 design): rough cloth clothes, bandana, barefoot, facing right, subtle breathing idle loop, clean readable silhouette",
 "全船员共用的唯一基础模型；逐帧生成须固定参考图/种子保证主体一致"),
(B2, "C1-2", "基础水手·移动", "动作", "128×128", 6, "C1-1",
 PFX_CN + "同一名水手的奔跑循环，面朝右，衣摆与头巾随风摆动",
 PFX_EN + "same sailor run cycle facing right, cloth and bandana fluttering",
 ""),
(B2, "C1-3", "基础水手·攻击骨架", "动作", "128×128", 4, "C1-1",
 PFX_CN + "同一名水手的挥击攻击动作（近战/远程共用骨架，手部留空武器挂点），发力前摇-挥出-收势",
 PFX_EN + "same sailor attack swing (shared melee/ranged rig with empty weapon socket), anticipation-strike-recover",
 "武器由C2挂件叠加"),
(B2, "C1-4", "基础水手·劳作", "动作", "128×128", 4, "C1-1",
 PFX_CN + "同一名水手的劳作循环：弯腰-发力-起身-喘息，适用于划桨/搬运/维修等岗位",
 PFX_EN + "same sailor labor loop: bend-pull-rise-pant, fits rowing/carrying/repair jobs",
 ""),
(B2, "C1-5", "基础水手·受击", "动作", "128×128", 2, "C1-1",
 PFX_CN + "同一名水手受击后仰+一帧白闪",
 PFX_EN + "same sailor hit recoil with one white flash frame",
 ""),
(B2, "C1-6", "基础水手·死亡倒地", "动作", "128×128", 4, "C1-1",
 PFX_CN + "同一名水手踉跄-跪倒-伏地-不动，末帧保持倒地姿态供程序淡出",
 PFX_EN + "same sailor death: stagger-kneel-collapse-motionless, final pose frame for engine fade-out",
 "死亡复活三选一面板的触发点"),
(B2, "C2-1", "装备挂件·弯刀", "图片", "64×64", 1, "C1-3",
 PFX_CN + "锈迹斑斑的短弯刀，斜置武器挂件，握柄角度与水手手部挂点匹配，刃口有缺口",
 PFX_EN + "rusted short cutlass, angled weapon attachment matching hand socket, notched blade",
 "近战岗装备"),
(B2, "C2-2", "装备挂件·火枪", "图片", "64×64", 1, "C1-3",
 PFX_CN + "老式燧发火枪，木质枪托与长枪管，枪口朝右，枪口位置预留枪口焰挂点",
 PFX_EN + "old flintlock musket, wooden stock, long barrel pointing right, muzzle socket reserved for flash effect",
 "远程岗装备"),
(B2, "C2-3", "装备挂件·工具", "图片", "64×64", 1, "C1-3",
 PFX_CN + "水手工具组合挂件：锤子与绳钩",
 PFX_EN + "sailor tools attachment: hammer and rope hook combo",
 "生产岗装备"),
(B2, "C3", "岗位调色板×3", "组件", "—", 0, "C1-1",
 "不生成图片：战斗岗（暗红头巾）/生产岗（土黄）/功能岗（灰蓝）三套换色参数，由程序对C1换色",
 "no image: three palette tints (combat dark-red bandana / production ochre / support gray-blue) applied programmatically",
 "拖拽时头像与小人同色，玩家一眼对上岗位"),
(B2, "C4", "落难船员·漂流", "动作", "128×128", 2, "C1-1",
 PFX_CN + "落难船员抱着碎木板在海上浮沉，只露头与手臂，随浪起伏循环",
 PFX_EN + "shipwrecked sailor clinging to a plank, only head and arms above water, bobbing loop",
 "免费船员获取线，三选一事件触发"),
(B2, "C5", "拖拽跟随小人", "图片", "128×128", 1, "C1-1",
 PFX_CN + "取水手待机姿单帧，用于拖拽半透明跟随（透明度程序处理）",
 PFX_EN + "single idle pose frame for drag-follow ghost (transparency handled by engine)",
 ""),

# ═══ 批次3 船舱房间 ═══
(B3, "B1", "1001 动力舱·划桨位", "动作", "256×192", 7, "A2-1",
 PFX_CN + "木筏舱室·动力舱划桨位：横置多人划桨装置，木架滑轨、绳索与滑轮，前后摇明显的划桨循环，桨叶入水带水花",
 PFX_EN + "raft room, rowing engine: horizontal multi-oar rig with wooden rails, ropes and pulleys, pronounced rowing cycle with splash at blade entry",
 "新手看到的第一个生产动画；建成1+工作4+受损2"),
(B3, "B2", "1101 钓鱼房", "动作", "256×192", 7, "A2-1",
 PFX_CN + "钓鱼房：伸向船舷外的木质钓台与绞盘渔线，甩竿-等待-收线循环，线上偶有鱼形剪影",
 PFX_EN + "fishing room: wooden platform extending overboard with winch and line, cast-wait-reel loop, occasional fish silhouette on the line",
 "竿/线元素与主动钓鱼共用"),
(B3, "B3", "1102 种植房", "动作", "256×192", 7, "A2-1",
 PFX_CN + "种植房：木箱苗床与藤蔓支架，浇水壶洒水循环，嫩芽在微光下轻微生长",
 PFX_EN + "planting room: crate seedbeds with vine trellis, watering can pour loop, sprouts growing slightly in faint light",
 ""),
(B3, "B4", "1201 雨水收集器", "动作", "256×192", 7, "A2-1",
 PFX_CN + "雨水收集器：倾斜接水斗与导管连到木桶，水滴规律滴落并激起涟漪，滴落频率即产出节奏的可视化",
 PFX_EN + "rain collector: tilted funnel and pipe into a wooden barrel, regular dripping with ripples, drip rate visualizing production",
 ""),
(B3, "B5-1", "2001 手掷鱼叉·建成与开火", "动作", "192×192", 5, "A2-1",
 PFX_CN + "手掷鱼叉炮台（玩家的第一座塔）：船舷边的木制发射架与成捆鱼叉，掷手蓄力后仰-掷出前冲-空架回位循环",
 PFX_EN + "hand harpoon turret (player's first tower): wooden launcher rack and harpoon bundle on gunwale, throw windup-release-recover cycle",
 "★新手5分钟硬节点「亲手立塔开火」的核心资产；建成1+开火4"),
(B3, "B5-2", "2001 手掷鱼叉·哑火与受损", "动作", "192×192", 3, "B5-1",
 PFX_CN + "同一鱼叉炮台：哑火态（发射口冒灰烟）与受损两帧（木架裂纹、部件散落）",
 PFX_EN + "same turret: misfire state (gray smoke at muzzle) and two damaged frames (cracked rack, scattered parts)",
 "弹药耗尽→哑火的表现"),
(B3, "B6", "3101 瞭望台", "动作", "256×192", 7, "A2-1",
 PFX_CN + "瞭望台：高木架上的瞭望斗，挂一盏风灯与一面小旗，灯光摆动与旗帜翻卷循环，风灯即预警表现载体",
 PFX_EN + "lookout platform: crow's nest on a tall wooden frame with swinging lantern and small flag, lantern sway and flag flutter loop",
 "预警方向箭头另见F9"),
(B3, "B7", "3102 医务室", "动作", "192×192", 7, "A2-1",
 PFX_CN + "医务室：担架、药罐与吊瓶架的角落布置，治疗时吊瓶架轻晃、药罐微光",
 PFX_EN + "sick bay: stretcher, medicine jars and an IV stand in a corner, gentle sway and faint glow when healing",
 ""),
(B3, "B8", "建造尘土与升级闪光（共用）", "动作", "192×192", 6, "B1",
 PFX_CN + "建造特效两套：木屑尘埃爆开（建造）与金色星光上升（升级），全部房间复用",
 PFX_EN + "two build effects: wood-dust burst (construction) and rising golden sparks (upgrade), shared by all rooms",
 ""),

# ═══ 批次4 怪物 ═══
(B4, "D2", "102 腐化螃蟹（怪物风格母版）", "动作", "128×128", 21, "B0-2",
 PFX_CN + "腐化螃蟹：甲壳长满藤壶与腐化苔藓的大螃蟹，螯肢不对称，口器滴落黑色黏液，横行移动循环、举螯攻击、受击、死亡翻壳，苔藓裂纹中隐现磷光青",
 PFX_EN + "corrupted crab: large crab with barnacle and rot-moss encrusted shell, asymmetric claws, black drool from mouthparts, scuttle cycle, claw-raising attack, hit, death shell-flip, faint teal glow in moss cracks",
 "★第一只制作、锁怪物风格母版；21帧=idle4/move6/atk4/hit3/die4；海面奇遇8104复用"),
(B4, "D1", "101 迷雾水母", "动作", "128×128", 21, "D2",
 PFX_CN + "迷雾水母：半透明伞体海母，体内有幽幽磷光青光核与垂落触须，触须在雾中若隐若现，游动时伞体收缩推进",
 PFX_EN + "mist jellyfish: translucent bell with glowing phosphorescent core and trailing tentacles fading into fog, bell-contraction propulsion",
 "海中怪；海面奇遇8101/8105低语具现复用"),
(B4, "D3", "103 幽灵水手", "动作", "128×128", 21, "D2",
 PFX_CN + "幽灵水手：半透明溺亡水手，破烂水手服、湿发遮面、无腿下身化为雾尾，举锈刀攻击，移动为漂浮贴近船舷",
 PFX_EN + "ghost sailor: translucent drowned sailor, tattered uniform, hair over face, legs dissolved into mist tail, rusted knife attack, floating movement toward hull",
 "登船怪；攀爬表现=move帧+程序位移，不新增climb帧；海面奇遇8103复用"),
(B4, "D4", "104 迷雾领主（精英）", "动作", "192×192", 24, "D2",
 PFX_CN + "迷雾领主：由浓雾凝成的高大巨头怪物，面部只有一道裂缝般的巨口与数只空眼窝，体表不断散落雾粒子，攻击为双臂雾爪横扫",
 PFX_EN + "mist lord (elite): towering head-like monster condensed from fog, a crack-like maw and several empty eye sockets, fog particles shedding, twin fog-claw swipe attack",
 "24帧（atk6两段式）；6141雾隐突袭靠E6-1特效；海面奇遇8102/8104复用"),
(B4, "D5", "105 迷雾守望者（Boss）", "动作", "384×384", 34, "D4",
 PFX_CN + "迷雾守望者（海域Boss）：半沉入海的巨像，只露出胸部以上、腰部以下永远没入海面，石质躯体缠满锁链与海藻，额前一只竖眼（眼睑缓慢开合是待机核心），攻击为整臂横扫与俯压",
 PFX_EN + "mist watcher (boss): colossal half-sunken idol, chest-up only, waist forever below the sea line, stone body wrapped in chains and seaweed, vertical third eye with slow eyelid idle, sweeping arm and crushing press attacks",
 "34帧；6103半血召唤/6131深渊凝视全靠特效（E6-2/E6-3）"),
(B4, "D6", "通用攀爬姿态 overlay", "动作", "96×128", 2, "D2",
 PFX_CN + "通用扒船舷姿态overlay：两只爪臂扣住木舷边缘入画，叠在任意登船怪身上",
 PFX_EN + "generic hull-climb overlay: two clawed hands gripping the gunwale edge, layered on any boarding monster",
 "登船时刻=漏怪的视觉信号；103可省，后续海域共用，先做"),

# ═══ 批次5 动作特效 ═══
(B5, "E1-1", "命中特效·物理溅射", "动作", "96×96", 4, "B0-2",
 PFX_CN + "物理命中特效：木质碎屑与白色溅射快速爆开消散",
 PFX_EN + "physical hit effect: wood splinters and white splash bursting out quickly",
 "覆盖鱼叉/弯刀/火枪"),
(B5, "E1-2", "命中特效·魔法涟漪", "动作", "96×96", 4, "B0-2",
 PFX_CN + "魔法命中特效：磷光青与灵紫的同心圆涟漪扩散，中心闪烁",
 PFX_EN + "magic hit effect: teal and purple concentric ripple expanding with flickering core",
 "覆盖水母/领主"),
(B5, "E2-1", "死亡特效·水中消散", "动作", "128×128", 5, "E1-1",
 PFX_CN + "海中怪死亡：怪物轮廓化作气泡与泡沫沉散",
 PFX_EN + "sea monster death: silhouette dissolving into bubbles and foam, sinking",
 ""),
(B5, "E2-2", "死亡特效·亡灵灰化", "动作", "128×128", 5, "E1-1",
 PFX_CN + "亡灵死亡：形体自下而上灰化碎裂成雾",
 PFX_EN + "undead death: body graying and crumbling upward into mist",
 ""),
(B5, "E3", "鱼叉弹道", "动作", "96×32", 3, "B5-1",
 PFX_CN + "鱼叉飞行弹道：尖头绳索鱼叉水平自旋飞行两帧+出手拖尾一帧",
 PFX_EN + "harpoon projectile: rope-tailed harpoon spinning in flight, 2 flight frames + 1 launch trail",
 ""),
(B5, "E4", "枪口焰与弹痕", "动作", "64×64", 4, "C2-2",
 PFX_CN + "燧发火枪枪口焰两帧与木板弹痕两帧",
 PFX_EN + "flintlock muzzle flash 2 frames and plank bullet-hole 2 frames",
 ""),
(B5, "E5-1", "游动尾迹水花", "动作", "96×64", 3, "B0-2",
 PFX_CN + "海面游动尾迹：V形水纹与泡沫尾迹三帧循环",
 PFX_EN + "swim wake: V-shaped ripple and foam trail, 3-frame loop",
 ""),
(B5, "E5-2", "攀爬入水水花", "动作", "96×64", 3, "B0-2",
 PFX_CN + "怪物抵达船舷开始攀爬时的拍水水花三帧，幅度要大，是漏怪时刻的视觉信号",
 PFX_EN + "big splash when a monster reaches the hull to climb, 3 frames, exaggerated as the breach signal",
 ""),
(B5, "E6-1", "技能特效·雾隐突袭（104）", "动作", "192×192", 4, "D4",
 PFX_CN + "精英技能特效：怪物周身雾粒子骤然加浓旋转后向前爆开",
 PFX_EN + "elite skill effect: fog around the monster thickens and swirls then bursts forward",
 "叠在D4已有帧上"),
(B5, "E6-2", "技能特效·半血召唤（105）", "动作", "192×192", 6, "D5",
 PFX_CN + "Boss技能特效：海面翻涌发光，一只小水母自水下升起登场",
 PFX_EN + "boss skill effect: sea surface churns and glows, a small jellyfish rises from below",
 "召唤物引用D1"),
(B5, "E6-3", "技能特效·深渊凝视（105）", "动作", "640×360", 6, "D5",
 PFX_CN + "Boss技能全屏层：画面四周暗角收缩，中央一双竖瞳虚影睁开，灵紫为主色",
 PFX_EN + "boss full-screen skill overlay: vignette closing in, a ghostly pair of vertical pupils opening at center, spirit purple dominant",
 "全屏层，非单位特效"),
(B5, "E6-4", "技能特效·传送逃跑读条", "动作", "192×192", 6, "C1-1",
 PFX_CN + "传送逃跑技能：蓝色传送阵法圆环在甲板展开旋转，粒子向中心汇聚",
 PFX_EN + "escape teleport skill: blue arcane circle unfolding and rotating on deck, particles converging",
 "读条8s，持续耗能源"),
(B5, "E7", "全员参战集结标记", "动作", "96×96", 2, "C1-1",
 PFX_CN + "集结旗标：船员头顶小红旗挥动两帧，表示正跑向甲板",
 PFX_EN + "rally flag: small red flag waving above a crew member's head, 2 frames",
 "集结跑动5s期间显示"),
(B5, "E8", "SAN低落气雾", "动作", "64×64", 3, "C1-1",
 PFX_CN + "角色头顶低SAN状态气雾：紫色雾气缭绕三帧循环",
 PFX_EN + "low-SAN aura: purple haze hovering above the head, 3-frame loop",
 "SAN值的最小可视表达"),

# ═══ 批次6 UI与图标 ═══
(B6, "F1", "资源图标×7", "图片", "96×96", 7, "B0-1",
 PFX_CN + "游戏资源图标模板（替换【对象】生成7枚）：能源=黄铜蒸汽齿轮、食物=一条风干鱼、淡水=木桶水滴、弹药=一捆炮弹、木材=木堆、贝壳币=发光珍珠贝壳、SAN=一只竖瞳之眼，统一深底方形+黄铜描边",
 PFX_EN + "resource icon template (generate 7 by swapping subject): energy=brass steam gear, food=dried fish, water=barrel with droplet, ammo=shell bundle, wood=log pile, coin=glowing pearl shell, SAN=vertical-pupil eye; unified dark square with brass border",
 "每枚单独生成替换【对象】；弹药池HUD必用"),
(B6, "F2", "属性图标×4", "图片", "96×96", 4, "B0-1",
 PFX_CN + "属性图标模板（替换【对象】生成4枚）：力量=断锚、技巧=罗盘与扳手、智力=发光之眼、精神=烛光圣徽，风格同资源图标",
 PFX_EN + "stat icon template (generate 4 by swapping subject): power=broken anchor, dexterity=compass and wrench, intellect=glowing eye, spirit=candle holy emblem, same style as resource icons",
 "拖拽决策前看属性"),
(B6, "F3-1", "技能按钮·全员参战", "图片", "192×192", 1, "B0-1",
 PFX_CN + "圆形技能按钮：交叉的弯刀与号角图案，木质底座黄铜环边，史诗感",
 PFX_EN + "round skill button: crossed cutlass and horn emblem, wooden base with brass ring, epic feel",
 ""),
(B6, "F3-2", "技能按钮·传送逃跑", "图片", "192×192", 1, "B0-1",
 PFX_CN + "圆形技能按钮：蓝色传送阵法与奔跑小人剪影，风格同全员参战按钮",
 PFX_EN + "round skill button: blue teleport sigil with a running silhouette, same style as the rally button",
 ""),
(B6, "F4", "复活三选一图标×3", "图片", "96×96", 3, "B0-1",
 PFX_CN + "复活选项图标模板（替换【对象】生成3枚）：广告=播放三角礼盒、贝壳币=金币贝壳堆、等待=沙漏，统一深底黄铜风格",
 PFX_EN + "revive option icon template (generate 3 by swapping subject): ad=play-triangle gift box, coins=shell coin stack, wait=hourglass; unified dark brass style",
 ""),
(B6, "F5", "通用小图标×8", "图片", "48×48", 8, "B0-1",
 PFX_CN + "通用小图标模板（替换【对象】生成8枚）：关闭×、锁、加号、左右箭头、警告叹号、对勾、齿轮、弹壳，深底黄铜线条风",
 PFX_EN + "common small icon template (generate 8 by swapping subject): close X, lock, plus, left/right arrows, warning, check, gear, shell casing; dark base brass line style",
 ""),
(B6, "F6", "九宫格面板底×3", "图片", "视面板而定", 3, "B0-1",
 PFX_CN + "九宫格面板底图模板（对话框/建造菜单/结算各一张）：深色木纹+黄铜包角，可拉伸的边框结构",
 PFX_EN + "nine-patch panel base template (dialog / build menu / result): dark wood grain with brass corners, stretchable border structure",
 "复活面板/漂流物三选一/建造菜单共用"),
(B6, "F7", "HUD条底×4（底槽+填充）", "图片", "视条而定", 4, "B0-1",
 PFX_CN + "状态条底图模板（各出底槽+填充两部分）：SAN=紫、船体耐久=棕、弹药=灰、航段进度=羊皮纸",
 PFX_EN + "status bar base template (base slot + fill for each): SAN purple, hull durability brown, ammo gray, voyage parchment",
 ""),
(B6, "F8", "Boss血条皮肤（海域1）", "图片", "1280×80", 1, "D5",
 PFX_CN + "Boss血条：粗糙石纹长条，两端雕刻眼窝纹样，中央留Boss头像框位置",
 PFX_EN + "boss HP bar: rough stone strip with carved eye-socket motifs at both ends, central portrait slot",
 ""),
(B6, "F9", "来袭预警箭头", "动作", "64×64", 2, "B0-1",
 PFX_CN + "来袭预警箭头：黄铜罗盘箭头闪烁两帧，旋转指向由程序处理",
 PFX_EN + "incoming warning arrow: brass compass arrow flashing, 2 frames, rotation handled by engine",
 "瞭望台提前10s预警的表现载体"),
(B6, "F10-1", "漂流物交互气泡", "动作", "96×96", 2, "B0-1",
 PFX_CN + "漂浮物上方点击气泡：小手点击+感叹号浮起两帧",
 PFX_EN + "tap bubble above a drift object: hand tap + exclamation rising, 2 frames",
 ""),
(B6, "F10-2", "钓鱼咬钩提示", "动作", "96×96", 2, "B0-1",
 PFX_CN + "钓鱼咬钩提示：浮漂猛地下沉+惊叹号抖动两帧",
 PFX_EN + "fish bite prompt: float suddenly dips + shaking exclamation mark, 2 frames",
 ""),
(B6, "F11", "像素字体", "组件", "—", 0, "—",
 "不生图：选用开源像素字体（如 Fusion Pixel / Zpix）或引擎位图字渲染，需覆盖简体中文常用字集",
 "no image: use an open-source pixel font (e.g. Fusion Pixel / Zpix) or engine bitmap font, must cover common simplified Chinese glyphs",
 ""),

# ═══ 批次7 漂浮物 ═══
(B7, "G1", "漂浮物浮动骨架（换皮用）", "动作", "96×64", 3, "B0-2",
 PFX_CN + "漂浮物通用浮动动画骨架：物体在水面随浪起伏+轻微左右摇摆三帧循环，供换皮",
 PFX_EN + "generic drift-object bobbing rig: object bobbing and rocking gently on water, 3-frame loop for skin swapping",
 "一张骨架×10张贴图，性价比最高"),
(B7, "G2", "漂浮物换皮×10", "图片", "96×64", 10, "G1",
 PFX_CN + "漂浮物贴图模板（替换【对象】生成10枚）：木材捆、物资箱、木桶、残骸帆布、漂流信瓶、小宝箱、救生圈、空酒桶、渔网团、怪卵簇",
 PFX_EN + "drift object skin template (generate 10 by swapping subject): log bundle, supply crate, barrel, wreck sail, message bottle, small chest, lifebuoy, empty cask, fishing net ball, egg cluster",
 "浮尸复用C4、怪卵孵化程序引用D1，不单独生成"),
]

wb = Workbook()

# ══════════ Sheet1 汇总 ══════════
ws = wb.active
ws.title = "汇总"
ws["A1"] = "批次"; ws["B1"] = "条目数"; ws["C1"] = "帧数/张数合计"
for c in "ABC":
    ws[f"{c}1"].fill = HDR_FILL; ws[f"{c}1"].font = HDR_FONT
    ws[f"{c}1"].alignment = Alignment(horizontal="center"); ws[f"{c}1"].border = BORDER_ALL
# 数据区 2~9（8个批次），合计行 10；环境无 LibreOffice/formulas 引擎，统计值由脚本内计算为静态值
from collections import Counter
batch_cnt = Counter(r[0] for r in D)
batch_sum = Counter()
for r in D:
    batch_sum[r[0]] += r[5]
type_cnt = Counter(r[3] for r in D)
total_cnt = len(D)
for i, b in enumerate(BATCHES):
    r = 2 + i
    ws[f"A{r}"] = b
    ws[f"B{r}"] = batch_cnt.get(b, 0)
    ws[f"C{r}"] = batch_sum.get(b, 0)
ws["A10"] = "合计"
ws["B10"] = total_cnt
ws["C10"] = sum(batch_sum.values())
for r in range(2, 11):
    for c in "ABC":
        cell = ws[f"{c}{r}"]
        cell.border = BORDER_ALL
        if r == 10:
            cell.fill = SUM_FILL; cell.font = SUM_FONT
# 类型区块：表头12行，数据13~15，含占比（除零保护）
ws["A12"] = "类型"; ws["B12"] = "条目数"; ws["C12"] = "占比"
for c in "ABC":
    ws[f"{c}12"].fill = HDR_FILL; ws[f"{c}12"].font = HDR_FONT
    ws[f"{c}12"].alignment = Alignment(horizontal="center"); ws[f"{c}12"].border = BORDER_ALL
for i, t in enumerate(["图片", "动作", "组件"]):
    r = 13 + i
    ws[f"A{r}"] = t
    ws[f"B{r}"] = type_cnt.get(t, 0)
    ws[f"C{r}"] = (type_cnt.get(t, 0) / total_cnt) if total_cnt else ""
    ws[f"C{r}"].number_format = "0.0%"
    for c in "ABC":
        ws[f"{c}{r}"].border = BORDER_ALL
for col, w in zip("ABC", (22, 12, 18)):
    ws.column_dimensions[col].width = w

# ══════════ Sheet2 生图提示词总表 ══════════
ws2 = wb.create_sheet("生图提示词总表")
headers = ["序号", "批次（生成顺序）", "资源编号", "资源名称", "类型",
           "出图尺寸（设计×2）", "帧数/张数", "前置依赖", "生图提示词（中文）", "生图提示词（English）", "备注（补充负面/验收）"]
for ci, h in enumerate(headers, 1):
    cell = ws2.cell(row=1, column=ci, value=h)
    cell.fill = HDR_FILL; cell.font = HDR_FONT
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = BORDER_ALL
for ri, row in enumerate(D, 2):
    batch, code, name, typ, size, cnt, dep, cn, en, note = row
    values = [ri - 1, batch, code, name, typ, size, cnt, dep, cn, en, note]
    for ci, v in enumerate(values, 1):
        cell = ws2.cell(row=ri, column=ci, value=v)
        cell.border = BORDER_ALL
        cell.alignment = Alignment(vertical="top",
                                   horizontal="center" if ci in (1, 3, 5, 7) else "left",
                                   wrap_text=(ci >= 9 or ci in (2, 4, 6, 8)))
        if ci == 7:
            cell.number_format = "0"
    if ri % 2 == 0:
        for ci in range(1, 12):
            ws2.cell(row=ri, column=ci).fill = LIGHT_FILL
widths = {"A": 6, "B": 16, "C": 9, "D": 28, "E": 8, "F": 15, "G": 10, "H": 10, "I": 48, "J": 48, "K": 32}
for col, w in widths.items():
    ws2.column_dimensions[col].width = w
ws2.freeze_panes = "E2"
ws2.auto_filter.ref = f"A1:K{1 + len(D)}"
dv_type = DataValidation(type="list", formula1='"图片,动作,组件"', allow_blank=True)
ws2.add_data_validation(dv_type); dv_type.add(f"E2:E{1 + len(D)}")
dv_batch = DataValidation(type="list", formula1='"' + ",".join(BATCHES) + '"', allow_blank=True)
ws2.add_data_validation(dv_batch); dv_batch.add(f"B2:B{1 + len(D)}")

# ══════════ Sheet3 风格与使用说明 ══════════
ws3 = wb.create_sheet("风格与使用说明")
for ci, h in enumerate(["项目", "内容"], 1):
    cell = ws3.cell(row=1, column=ci, value=h)
    cell.fill = HDR_FILL; cell.font = HDR_FONT
    cell.alignment = Alignment(horizontal="center"); cell.border = BORDER_ALL
info = [
    ("全局正面提示词前缀（中文）", PFX_CN.rstrip("，") + "（每行提示词已含此前缀，可整段复制使用）"),
    ("全局正面提示词前缀（English）", PFX_EN.rstrip(", ") + " (already included in every prompt cell)"),
    ("全局负面提示词（中文）", NEG_CN),
    ("全局负面提示词（English）", NEG_EN),
    ("统一规格", "像素风；横版，设计分辨率1280×720（微信小游戏安全区1334×750内）；全部×2出图、游戏内50%显示；PNG透明底；16+2色板（磷光青#4FD1C5 / 灵紫#A78BFA，描边#0B0E14）；角色面朝右、锚点脚底中心；光源左上45°；每张图≤6色+≤1发光色，S≤70%"),
    ("类型说明", "图片=静态单图；动作=动画多帧（逐帧生成后拼帧表+配 .json：帧宽高/帧数/锚点/时长）；组件=程序处理不生图（调色板/字体）"),
    ("生成顺序", "批次0 风格母版（主界面+战斗示意图）定稿 → 批次1 场景与船体 → 批次2 船员与装备 → 批次3 船舱房间 → 批次4 怪物 → 批次5 动作特效 → 批次6 UI图标 → 批次7 漂浮物。批次0定稿后，1/2/3/4可并行"),
    ("动作帧生成方法", "每帧单独生成：用上一帧当参考图（垫图）或固定seed+低扰动，保证主体一致；生成后人工清理到16+2色板（降色），再按帧序拼合"),
    ("命名规范", "monster/<编号>/<状态>、room/<编号>/<状态>、crew/<编号>/<状态>、ui/<分类>/<名>、scene/<层>；导出PNG-8+json"),
    ("范围口径", "仅覆盖1阶船体（木筏8格）×第一章（海域1迷雾海峡）核心循环；火炮房/工坊/打捞房/忏悔室/魔法线/图鉴卡面均不在本表，详见《05-MVP第一章·1阶船体最小美术资源需求表.md》"),
]
for ri, (k, v) in enumerate(info, 2):
    ws3.cell(row=ri, column=1, value=k).border = BORDER_ALL
    c = ws3.cell(row=ri, column=2, value=v)
    c.border = BORDER_ALL
    c.alignment = Alignment(vertical="top", wrap_text=True)
    ws3.cell(row=ri, column=1).fill = LIGHT_FILL
ws3.column_dimensions["A"].width = 26
ws3.column_dimensions["B"].width = 100

wb.properties.title = TITLE
wb.save(OUT)
print("saved:", OUT)
