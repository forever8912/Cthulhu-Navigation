# -*- coding: utf-8 -*-
# 批次 4~7 的厚涂版提示词
# 字段：code -> (中文主体, 英文主体, 出图尺寸, 帧数, 备注补充, 是否满幅场景)

D = {}

# ---------------- 批次4 怪物 ----------------
D["D2"] = (
    "怪物·腐化螃蟹（怪物风格母版）：一只被深海腐蚀的巨型螃蟹，甲壳上覆着藤壶与裂纹、裂缝里渗出磷光青黏液，"
    "一只螯明显畸变肥大且关节错位，步足细长带倒刺，眼柄突出并多出一对畸形小眼；整体低沉笨重、有压迫感。"
    "六张关键姿态——待机、横行、举螯威吓、挥螯攻击、受击后缩、濒死瘫软。",
    "monster, corrupted crab (style master): a giant deep-sea-corrupted crab, barnacles and cracks on the shell, teal phosphorescent "
    "slime seeping from the fissures, one claw grossly overgrown with a misaligned joint, long spined walking legs, protruding eye "
    "stalks with an extra pair of malformed eyes; heavy, low and oppressive. Six key poses - idle, sidling, threat display, claw strike, "
    "recoiling hit, collapsing death.",
    "512×512", 6, "★怪物母版：其余四只怪物的材质/光比/描边逻辑以此为准")

D["D1"] = (
    "怪物·迷雾水母：半透明伞状水母，伞体内部透出磷光青脉络，伞缘垂下细长触须并带灵紫微光，"
    "体内悬浮着模糊杂质与气泡，伞体边缘柔软摆动；六张关键姿态——漂浮收拢、伞体张开推进、触须伸展、放电攻击、受击缩伞、消散。",
    "monster, mist jellyfish: translucent bell with teal phosphorescent veins inside, long thin tentacles hanging from the rim with "
    "faint purple glow, blurred impurities and bubbles suspended within, rim undulating softly; six key poses - drifting contracted, "
    "bell pulsing forward, tentacles extended, discharging, contracting on hit, dissipating.",
    "512×512", 6, "厚涂压缩：原 21 帧→6 帧；其余姿态由程序形变补")

D["D3"] = (
    "怪物·幽灵水手：一具被海水泡胀的水手尸体，皮肤灰绿发亮、衣物破烂黏在身上、面部被海藻与藤壶覆盖、"
    "一只手仍死握着断刀，动作僵硬却迅捷；六张关键姿态——直立待机、蹒跚逼近、举刀、劈砍、受击后仰、崩解。",
    "monster, drowned sailor: a water-bloated corpse, gray-green glistening skin, tattered clothes clinging to the body, face covered "
    "in weed and barnacles, one hand still gripping a broken blade, stiff but fast movement; six key poses - standing idle, lurching "
    "forward, raising the blade, slashing, reeling from a hit, collapsing into pieces.",
    "512×512", 6, "厚涂压缩：原 21 帧→6 帧")

D["D4"] = (
    "怪物·迷雾领主（精英）：一个由浓雾与水手残骸构成的精英怪物，主体是裹在破斗篷里的高大身影、斗篷下伸出多只苍白手臂，"
    "头部是一团翻滚的雾与两点灵紫眼光，身体边缘不断逸散雾气；八张关键姿态——雾中凝聚、站立、前行、多臂横扫、"
    "隐入雾中、自雾中突现、受击散形、彻底溃散。",
    "monster, mist lord (elite): a tall figure wrapped in a torn cloak built from fog and sailor remains, several pale arms reaching "
    "from under the cloak, head a churning mass of fog with two purple-lit eyes, fog constantly bleeding off its edges; eight key poses - "
    "coalescing, standing, advancing, multi-arm sweep, dissolving into fog, bursting out of fog, scattering on hit, fully dispersed.",
    "768×768", 8, "厚涂压缩：原 24 帧→8 帧");

D["D5"] = (
    "怪物·迷雾守望者（Boss）：只画腰部以下、上半身没入浓雾——庞大的类人躯干下半段，湿透的破袍紧贴身体、"
    "腰部以下逐渐化为触须与雾，皮肤呈灰白腐色、表面覆着藤壶与珊瑚状增生；体量远超小船，腿部抬起时带起海水。"
    "十张关键姿态——雾中浮现、转身、挥臂横扫、跺踏、召唤（手臂探向海面）、受击震颤、半血狂暴、深渊凝视（雾中亮起灵紫巨眼）、"
    "崩解、沉没。",
    "boss monster, mist watcher: only from the waist down, upper body lost in thick fog - a colossal humanoid lower torso, soaked torn "
    "robes clinging, dissolving into tendrils and fog below the waist, gray-white necrotic skin covered in barnacles and coral growth; far "
    "larger than the boat, water thrown up when a leg lifts. Ten key poses - emerging from fog, turning, arm sweep, stomping, summoning "
    "with an arm reaching into the sea, shuddering on hit, half-health enrage, abyssal gaze with a huge purple eye lighting up in the fog, "
    "breaking apart, sinking.",
    "1536×1536", 10, "厚涂压缩：原 34 帧→10 帧；腰部以上不入画是硬约束")

D["D6"] = (
    "通用攀爬叠加层：用于叠加在怪物身上的攀爬肢体——两只抓住船舷板的手与螯、一条扒住木板的肢体，"
    "表面带水渍、黏液与海藻；两张关键帧（抓握、用力撑起）。纯色底，便于叠加到任何怪物身上。",
    "generic climbing overlay: limbs meant to composite onto any monster - two hands or claws gripping the gunwale plank plus one limb "
    "hooked over it, wet, slimy, with weed; two key frames, grab and heave. Flat background for compositing.",
    "384×512", 2, "叠在 4 只陆行怪的背部与足部，零新增模型")

# ---------------- 批次5 特效 ----------------
D["E1-1"] = (
    "战斗特效·物理命中：木屑与海水碎末向外溅射，中心一击白热闪光，外围一圈快速扩张的冲击环，边缘有细碎火星。三张关键帧——起、盛、散。",
    "combat vfx, physical hit: splinters and spray blasted outward, a white-hot flash at the center, a fast expanding shock ring, fine "
    "sparks at the edges. Three key frames - start, peak, dissipate.",
    "384×384", 3, "厚涂压缩：原 4 帧→3 帧")

D["E1-2"] = (
    "战斗特效·魔法命中：灵紫与磷光青交织的同心涟漪向外扩散，中心一团不稳定的光斑，边缘浮着细碎光尘，"
    "整体偏冷且带轻微扭曲感。三张关键帧。",
    "combat vfx, arcane hit: concentric ripples of spirit purple and teal spreading outward, an unstable blot of light at the center, fine "
    "glowing dust floating at the edges, cold overall with slight distortion. Three key frames.",
    "384×384", 3, "厚涂压缩：原 4 帧→3 帧")

D["E2-1"] = (
    "死亡特效·水中消散：怪物形体崩解为大量气泡与浑浊悬浮物，整体向水面上升并逐渐稀释，最后只剩几点散开的光斑。四张关键帧。",
    "death vfx, dissolve in water: the body breaking into bubbles and murky suspended matter rising toward the surface and thinning out, "
    "ending in a few scattered specks of light. Four key frames.",
    "512×512", 4, "厚涂压缩：原 5 帧→4 帧")

D["E2-2"] = (
    "死亡特效·亡灵灰化：躯体自下而上化为灰白粉尘并向上飘散，边缘有暗色余烬明灭，最后一帧只剩地面一层薄灰。四张关键帧。",
    "death vfx, ashen collapse: the body turning to gray-white dust from the bottom up and drifting away, dim embers flickering at the "
    "edges, final frame leaving a thin layer of ash. Four key frames.",
    "512×512", 4, "厚涂压缩：原 5 帧→4 帧")

D["E3"] = (
    "鱼叉飞行弹道：一根带麻绳拖尾的鱼叉横向飞行，后方拖出一条绷直的细绳，绳索末端连着水花与震颤的浪线；"
    "两张关键帧——飞行中、入水。",
    "harpoon projectile: a harpoon flying horizontally with a hemp line trailing, the line taut behind it, a splash and trembling wake at "
    "its end. Two key frames - in flight, entering water.",
    "384×128", 2, "弹道低平，几乎贴水面")

D["E4"] = (
    "火枪射击特效：枪口喷出的短促黄白火焰、浓黑火药烟团与几点飘散火星，另附一个弹着点的木屑迸裂与焦痕。三张关键帧——喷发、烟团膨胀、消散。",
    "musket shot vfx: a short yellow-white muzzle flame, a dense black powder smoke ball and drifting sparks, plus a separate impact with "
    "splintering wood and a scorch mark. Three key frames - flash, smoke expanding, dissipating.",
    "256×256", 3, "需与 C2-2 枪口位置对齐")

D["E5-1"] = (
    "怪物游动尾迹：海面上被划开的一道 V 形白色浪迹，末端有气泡翻涌与少量浑浊泥沙，两侧水面向外推挤。两张关键帧。",
    "swimming wake: a V-shaped white trail cut across the sea surface, bubbles churning at the tail with a little stirred-up silt, water "
    "pushed out on both sides. Two key frames.",
    "384×256", 2, "贴在怪物移动路径上")

D["E5-2"] = (
    "入水水花：一团向上炸开的水柱、向外扩散的环形波纹、四溅的细碎水珠，中心短暂泛出磷光青。两张关键帧——炸开、回落。",
    "water entry splash: a column of water bursting upward, rings spreading outward, fine droplets flying, a brief teal glow at the center. "
    "Two key frames - burst, settling.",
    "384×256", 2, "攀爬起点与鱼叉入水共用")

D["E6-1"] = (
    "技能特效·雾隐突袭：一团浓雾骤然聚拢包住目标，雾中闪过两点灵紫眼光与一道快速划过的爪痕，"
    "雾的轮廓被高速运动拉扯出尖锐的尾迹。三张关键帧。",
    "skill vfx, mist ambush: a thick fog suddenly collapsing around the target, two purple eyes flashing inside, a fast claw streak "
    "cutting through, the fog silhouette stretched into sharp trails by the speed. Three key frames.",
    "768×768", 3, "104 精英技能，靠 VFX 层叠，不新增怪物帧")

D["E6-2"] = (
    "技能特效·半血召唤：Boss 手臂探入海面，海面裂开一圈灵紫光环，数只半透明小水母从光环中缓缓升起，"
    "光带向上牵引并带气泡。五张关键帧。",
    "skill vfx, half-health summon: the boss arm plunging into the sea, a ring of purple light opening on the surface, several translucent "
    "small jellyfish rising slowly out of the ring, light pulled upward with bubbles. Five key frames.",
    "768×768", 5, "厚涂压缩：原 6 帧→5 帧")

D["E6-3"] = (
    "全屏技能特效·深渊凝视：画面四周向内压入深紫黑雾，正中缓缓浮现一只巨大的竖瞳，瞳孔边缘泛灵紫光，"
    "画面带有轻微扭曲与颗粒噪点，四角最暗、中心最亮。五张关键帧——雾压入、瞳孔睁开、注视、收缩、退去。",
    "full-screen skill vfx, abyssal gaze: deep purple-black fog pressing in from all edges, a huge vertical slit pupil slowly opening in "
    "the center with purple light along its rim, slight image distortion and grain, darkest at the corners and brightest at the center. "
    "Five key frames - fog closing in, eye opening, staring, contracting, receding.",
    "1280×720", 5, "全屏叠加层，透明可叠；不得遮挡 HUD")

D["E6-4"] = (
    "技能特效·传送读条：地面浮现一圈缓慢旋转的磷光青法阵，符文逐段点亮、中心升起一道细小光柱，边缘有上升的光尘。五张关键帧——起始、渐亮、满、闪烁、消散。",
    "skill vfx, teleport cast bar: a slowly rotating teal circle on the ground, runes igniting segment by segment, a thin light column "
    "rising at the center, light dust floating up. Five key frames - start, brightening, full, flicker, fade.",
    "768×768", 5, "厚涂压缩：原 6 帧→5 帧")

D["E7"] = (
    "集结标记：一个悬浮的暖黄色箭头与一圈脉动光环，箭头指向甲板方向，光环外缘有细微上升的光点。两张关键帧——淡入脉动、强亮。",
    "rally marker: a floating warm yellow arrow with a pulsing ring, pointing toward the deck, small light motes rising from the ring "
    "edge. Two key frames - fading in with pulse, full bright.",
    "384×384", 2, "全员参战技能的落点提示")

D["E8"] = (
    "低 SAN 表现：视野边缘渗出暗紫黑色气雾与缓慢蠕动的触须状阴影，中心区域保持清晰，"
    "阴影边缘有轻微呼吸般的伸缩。两张关键帧。",
    "low sanity effect: dark purple-black fog seeping in from the screen edges with slowly writhing tendril shadows, center kept clear, "
    "edges breathing in and out slightly. Two key frames.",
    "256×256", 2, "屏幕边缘叠加，四边各贴一份")

# ---------------- 批次6 UI ----------------
D["F1"] = (
    "游戏资源图标一套七个，同一构图与光比：能源（黄铜蒸汽齿轮）、食物（穿绳的鱼干）、淡水（带铜箍的木水桶）、"
    "弹药（堆叠的鱼叉头）、木材（捆扎的原木）、贝壳币（打磨过的螺旋贝壳）、SAN（一只螺旋状的苍白眼球）。"
    "每个图标为深色木底嵌黄铜边的小方牌，物件半浮雕凸起，左上冷光、右下压暗，边缘有磨损与盐渍。",
    "resource icon set of seven, same composition and lighting: energy (brass steam gear), food (dried fish on a string), water "
    "(brass-hooped wooden bucket), ammo (stacked harpoon heads), wood (bundled logs), shell coin (polished spiral shell), sanity (a "
    "spiral pale eyeball). Each icon is a small square plaque of dark wood with a brass rim, object in half-relief, cool light from upper "
    "left, darkened lower right, worn edges and salt stains.",
    "384×384", 7, "七枚同批出图以保光比一致；程序做九宫格切分")

D["F2"] = (
    "属性图标四个，同一风格：攻击（交叉的弯刀与鱼叉）、防御（锈蚀的船锚当作盾）、速度（带风纹的船帆）、"
    "技巧（绞紧的绳结与扳手）；深色木底嵌黄铜边，半浮雕凸起。",
    "attribute icons, four in one style: attack (crossed cutlass and harpoon), defense (rusted anchor as a shield), speed (sail with "
    "wind streaks), skill (taut knot and wrench); dark wood plaque with brass rim, half-relief.",
    "384×384", 4, "同批出图")

D["F3-1"] = (
    "技能按钮·全员参战：圆形黄铜镶边底座，中央一只握紧的拳头与交叉弯刀，边缘刻有绳纹，"
    "按下态加一圈暖黄外发光与轻微内凹阴影。",
    "skill button, all hands on deck: round brass-rimmed base, a clenched fist with crossed cutlasses at the center, rope patterning on "
    "the rim, pressed state adds a warm yellow outer glow and slight inner shadow.",
    "768×768", 2, "两态：常态 + 按下")

D["F3-2"] = (
    "技能按钮·传送逃跑：圆形黄铜镶边底座，中央一个旋转的磷光青法阵与向上的箭头，边缘刻着细密符文，"
    "按下态加一圈青色外发光。",
    "skill button, teleport escape: round brass-rimmed base, a rotating teal sigil with an upward arrow at the center, dense runes on the "
    "rim, pressed state adds a teal outer glow.",
    "768×768", 2, "两态：常态 + 按下")

D["F4"] = (
    "复活选项图标三个，同一底座风格：看广告（一只木质沙漏旁一个播放三角）、花贝壳币（一叠螺旋贝壳币）、"
    "等待（一个正在走的旧怀表）；深色木底嵌黄铜边。",
    "revive option icons, three on one base style: watch ad (wooden hourglass with a play triangle), spend shells (a stack of spiral "
    "shell coins), wait (a ticking old pocket watch); dark wood plaque with brass rim.",
    "384×384", 3, "同批出图")

D["F5"] = (
    "通用小图标八个，同一套极简厚涂语言：加号、叉号、锁、刷新箭头、喇叭、设置齿轮、问号、返回箭头；"
    "深色木底嵌黄铜边，线条厚重。",
    "generic small icons, eight in one minimal painterly language: plus, cross, lock, refresh arrow, speaker, gear, question mark, back "
    "arrow; dark wood plaque with brass rim, heavy strokes.",
    "192×192", 8, "同批出图以保一套")

D["F6"] = (
    "九宫格可拉伸面板底三张（小/中/大）：深色斑驳木板拼接、四角黄铜包角、边缘密布铆钉与磨损痕、"
    "中间区域平整可拉伸，不得有任何文字、图案或装饰占据中段。",
    "nine-slice stretchable panel bases, three sizes: patchy dark planks, brass corner caps, dense rivets and wear along the edges, flat "
    "stretchable middle area with no text, pattern or ornament intruding into the center.",
    "768×768", 3, "组件：供程序九宫格拉伸")

D["F7"] = (
    "HUD 长条底与填充四条，同一套风格：① 木质凹槽底（内壁有盐渍与钉痕）② 暖黄填充条（内部有细微流动高光）"
    "③ 灵紫填充条（SAN 用，边缘有微弱脉动光）④ 黄铜刻度条（等距刻线，无数字）。",
    "HUD bar bases and fills, four in one style: (1) wooden trough base with salt stains and nail marks inside (2) warm yellow fill with "
    "subtle flowing highlights (3) spirit purple fill for sanity with faint pulsing glow at the edges (4) brass tick strip with even "
    "engraved lines and no numbers.",
    "2560×256", 4, "组件：条底与填充分层，程序裁切")

D["F8"] = (
    "Boss 血条皮肤（海域1）：一条加宽的深色木与珊瑚增生混合的长条，左端嵌一枚苍白眼球浮雕，"
    "条身有裂纹并透出灵紫微光，边缘挂着藤壶与海藻；不含任何文字与数字。",
    "boss health bar skin (region 1): a widened bar blending dark wood with coral overgrowth, a pale eyeball relief set into the left "
    "end, cracks in the body leaking faint purple light, barnacles and weed hanging from the edges; no text, no numbers.",
    "2560×160", 1, "同阵营怪物共用；换皮可后续复用到海域2/3")

D["F9"] = (
    "来袭预警箭头：一个从画面边缘向内递进的半透明暗红箭头，带轻微抖动与渐隐，箭头内部有缓慢流动的雾气。两张关键帧——出现、消退。",
    "incoming warning arrow: a translucent dark red arrow advancing inward from the screen edge, slight jitter and fade, slowly drifting "
    "fog inside it. Two key frames - appearing, receding.",
    "256×256", 2, "对应瞭望台预警，提前 10 秒")

D["F10-1"] = (
    "漂流物交互气泡：一个从水面浮起的半透明气泡，内含一只简化的木箱剪影，外圈一圈细光与几粒上浮的小气泡。两张关键帧——浮起、轻微摇晃。",
    "flotsam interaction bubble: a translucent bubble rising from the water containing a simplified crate silhouette, a thin ring of "
    "light and a few rising bubbles around it. Two key frames - rising, gently swaying.",
    "384×384", 2, "点击打捞提示")

D["F10-2"] = (
    "钓鱼咬钩提示：浮标猛地下沉、水面炸开一圈涟漪，上方弹出一个小小的感叹号形状的暖黄光斑。两张关键帧——下沉、光斑弹出。",
    "fishing bite cue: the float plunging down, a ring of ripples bursting on the surface, a small warm yellow exclamation-shaped spark "
    "popping above. Two key frames - plunge, spark pop.",
    "384×384", 2, "钓鱼系统用")

D["F11"] = ("", "", "—", 0, "厚涂风格不适配位图字，改用系统字 + 描边/投影，或现成商用字体", False)

# ---------------- 批次7 漂浮物 ----------------
D["G1"] = (
    "漂浮物浮动骨架：同一个木箱的三张关键帧——水面正浮、随浪上抬、随浪下沉；箱体浸水部分颜色明显加深，"
    "水面处有细小泡沫，箱角挂着水草。三张作为全部换皮物的公用浮动节奏。",
    "flotsam float skeleton: one wooden crate in three key frames - level, lifted by a swell, dropped by a trough; the submerged part "
    "clearly darker, fine foam at the waterline, weed caught on a corner. These three define the shared bobbing rhythm for all reskins.",
    "384×256", 3, "骨架：全部换皮物共用这组位移节奏")

D["G2"] = (
    "漂浮物换皮十种，共用同一木箱骨架与光比：① 捆扎木箱 ② 破木桶 ③ 缠着海藻的渔网团 ④ 断裂的船桨 ⑤ 漂浮的酒瓶 "
    "⑥ 木箱里的罐头 ⑦ 半沉的救生圈 ⑧ 泡烂的航海图卷 ⑨ 一只旧靴子 ⑩ 缠着绳的小船锚。每一件都湿透、带盐渍与附着物。",
    "flotsam reskins, ten sharing one crate skeleton and lighting: bundled crate, broken barrel, weed-tangled net ball, snapped oar, "
    "floating bottle, canned goods in a crate, half-sunk life ring, waterlogged chart scroll, an old boot, a small anchor fouled with rope. "
    "Each soaked, salt-stained and encrusted.",
    "384×256", 10, "同一骨架出 10 张，程序套用 G1 的浮动节奏")
