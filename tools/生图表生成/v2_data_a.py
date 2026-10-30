# -*- coding: utf-8 -*-
# 批次 0~3 的厚涂版提示词（中文主体 + 英文主体），由 build.py 拼装全局前缀
# 字段：code -> (中文主体, 英文主体, 出图尺寸, 帧数, 备注补充, 是否满幅场景)

D = {}

D["B0-1"] = (
    "游戏主界面全景示意图，16:9 横版侧视。画面右侧 68% 是一艘近海小渔船的完整侧视横剖面：单桅、单层甲板、带艉楼；"
    "前倾的艏柱、艏艉微翘的甲板弧线、向外鼓起的舷侧、方形艉板、平底带龙骨；船身斑驳木纹、补丁帆布、锈铁件、藤壶与海藻。"
    "甲板上三名水手：船首一人持弯刀警戒、主甲板一人正在绞盘旁、艉楼一人持火枪朝左瞄准。甲板中央有半开的木舱口，露出下行梯子；"
    "桅顶有一个可站人的木吊斗。左舷三个方形炮门，中间一个伸出鱼叉炮的长炮管，左右两个用木板斜钉封死。"
    "船首垂下粗铁锚链入水，一只腐化螃蟹正扒在链上攀爬；船中舷外挂着湿拖网与木绳梯；船尾舵叶旁垂一根旧缆绳浸在水里。"
    "船体剖面内部为两行四列共八个等大舱格，模块之间有缝、互不连通：上排从左到右是动力舱（四人脚踏轮）、种植房、雨水收集器、"
    "手掷鱼叉炮（炮管穿出舷外）；下排四格是干净空槽——木地板、两条地板滑轨、墙上一个空挂钩、角落少量积灰，"
    "不得堆放任何箱子木桶。画面左侧 32% 是开阔雾海，从近处延伸到远处雾中的怪物出现线，该区域空旷，"
    "只有极淡的沉船桅杆与礁石剪影，不出现任何巨物或触手。水面线位于画面高度 65%。顶部 HUD 为深色木质与黄铜："
    "从左到右依次是一个圆形船长头像框、七个等大方槽、一段带两个刻度的长航程条，槽内不放文字与数字。"
    "画面左缘竖排四个方形功能按钮，右下角两个圆形技能按钮。舱内三处暖黄提灯，舱外冷蓝灰雾，灯光透过舷侧微微漏进水里。",
    "game main screen full mockup, 16:9 side view. Right 68% is a complete side cross-section of a small coastal fishing sloop: "
    "single mast, single deck, raised quarterdeck, raked stem, sheer line rising at bow and stern, flared topsides, square transom, "
    "flat bottom with keel; weathered planking, patched canvas, rusted iron, barnacles and weed. Three sailors on deck: one with a "
    "cutlass at the bow, one at the capstan amidships, one aiming a musket left on the quarterdeck. Half-open deck hatch with a ladder "
    "going down; standable wooden crow's nest. Three square gun ports on the port side, the middle one with a long harpoon barrel "
    "protruding, the other two boarded shut. Heavy anchor chain into the water with a corrupted crab climbing it; wet dragnet and rope "
    "ladder over the side; old mooring rope trailing from the stern rudder. Below deck a 2x4 grid of eight equal room slots with gaps: "
    "top row rowing engine, planter, rain catcher, harpoon turret; bottom row four clean empty slots with floor rails, one empty hook "
    "and a little dust, absolutely no crates or barrels. Left 32% is open fog sea reaching a distant monster spawn line, kept empty with "
    "only faint wreck masts and reef silhouettes, no leviathan, no tentacles. Waterline at 65% height. Top HUD in dark wood and brass: "
    "one round captain portrait frame, seven equal square sockets, one long voyage bar with two ticks, no text or numbers. Four square "
    "buttons on the left edge, two round skill buttons bottom right. Three warm lanterns inside, cold blue-gray fog outside, light "
    "leaking through the hull into the water.",
    "2560×1440", 1, "★风格母版①：本图定稿后作为全表垫图。八格/出现线/三战斗岗/HUD七槽为硬约束", True)

D["B0-2"] = (
    "横版塔防战斗示意图：小渔船位于画面右侧，鱼叉炮正发射一枚鱼叉，弹道低平掠过海面并带起一道水线；"
    "左侧海面下一只半透明发光水母浮起、一只腐化螃蟹正扒着船首锚链向上攀爬、螯上带着磷光青黏液；"
    "甲板上三名水手分别持弯刀、火枪、守绞盘，动作紧绷；雾在怪物身后翻涌，水花四溅，水面被扰动的区域泛着微光。",
    "side-view tower defense battle mockup: fishing sloop at right, harpoon turret firing a low flat projectile skimming the water and "
    "raising a wake; at left a translucent glowing jellyfish surfacing and a corrupted crab climbing the bow anchor chain with teal slime "
    "on its claw; three sailors on deck with cutlass, musket and capstan, tense poses; fog churning behind the monsters, splashes, "
    "disturbed water glowing faintly.",
    "2560×1440", 1, "★风格母版②：锁定怪物/船员/船体的同屏比例关系", True)

D["A1-1"] = (
    "游戏背景远景层，横版全景：浓密的冷灰蓝雾墙，雾中只有极淡的沉船桅杆与礁石剪影，没有任何具体物体，"
    "雾的上缘自然消散、下缘与海面融合；用于叠加在最底层，左右需可无缝平铺，画面不得出现船、生物或光源。",
    "far background layer, panoramic: dense cold gray-blue fog wall, only the faintest silhouettes of wrecked masts and reefs inside, "
    "no specific objects, fog dissolving upward and merging into the sea below; for the bottom-most layer, seamlessly tileable left to "
    "right, no ship, no creatures, no light source.",
    "2560×1440", 1, "背景层，满幅无灰底；左右可无缝平铺", True)

D["A1-2"] = (
    "游戏背景中景层：远处海平线与灰蓝海面的交界，几道极淡的长浪涌，海面有低对比的月光碎反光；"
    "不出现船只、生物与礁石，左右可无缝平铺，整体压暗以衬托前景。",
    "mid background layer: distant horizon meeting a gray-blue sea, a few very faint long swells, low-contrast broken moonlight "
    "reflection on the water; no ships, no creatures, no rocks, seamlessly tileable, darkened overall to support the foreground.",
    "2560×1440", 1, "背景层，满幅无灰底", True)

D["A1-3"] = (
    "近景海面浪层：暗蓝发绿的海水表面，厚重笔触堆叠的碎浪与白沫，浪尖带少量磷光青反光与水膜高光；"
    "用于铺在画面最前方底部，左右可无缝平铺的循环浪纹序列，首尾帧需能衔接。",
    "foreground sea layer: dark blue-green water surface, broken waves and white foam built from thick stacked strokes, a little teal "
    "glow on the crests and wet-film highlights; sits at the very front bottom of the screen, seamlessly tileable looping wave "
    "sequence, first and last frame must connect.",
    "2560×720", 3, "厚涂压缩：原 4 帧→3 帧（首中尾），程序横向平移循环", True)

D["A2-1"] = (
    "游戏资源图·船体完好态：一艘近海小渔船的完整侧视横剖面，单桅、单层甲板、带艉楼；前倾艏柱、艏艉微翘的甲板弧线、"
    "向外鼓起的舷侧、方形艉板、平底带龙骨；左舷三个方形炮门（中间开口、左右封板）；甲板中央半开的木舱口与下行梯子；"
    "桅顶木吊斗；舱内两行四列八个等大木框舱格，模块间留缝，船首与船尾各一格被船体弧线切角；"
    "船身斑驳木纹、补丁帆布、锈铁件、藤壶盐渍。不含船员、怪物、HUD 与背景。",
    "game asset, hull intact: complete side cross-section of a small coastal fishing sloop, single mast, single deck, raised "
    "quarterdeck, raked stem, sheer line, flared topsides, square transom, flat keel; three square gun ports on the port side with the "
    "middle open and the others boarded; half-open deck hatch with ladder; wooden crow's nest; below deck a 2x4 grid of eight equal "
    "wooden frame slots with gaps, the bow-top and stern-bottom slots clipped by the hull curve; weathered planking, patched canvas, "
    "rusted iron, barnacles. No crew, no monsters, no HUD, no background.",
    "2880×1440", 1, "厚涂核心资产：8 格必须可数、炮门必须能伸出炮管")

D["A2-2"] = (
    "同一艘小渔船的受损态：舷侧板断裂三处、露出内部肋材与舱格边缘，船首护栏折断垂落，帆布从中间撕裂下垂，"
    "甲板有一处焦黑灼痕与散落木屑，艉楼栏杆歪斜，但整体结构仍完整、可辨认；格位与炮门位置不变。",
    "same sloop, damaged: three hull plank breaks exposing internal ribs and slot edges, bow rail snapped and hanging, canvas torn and "
    "drooping, a scorched burn mark on deck with scattered splinters, quarterdeck rail askew; structure still complete and readable, "
    "same slot and gun port positions.",
    "2880×1440", 1, "受损态与完好态必须严格对齐（同锚点同尺寸）")

D["A2-3"] = (
    "同一艘小渔船的严重受损态：舷侧大面积破洞可见舱内，甲板塌陷一角，桅杆断去上段、断口有木刺，艉楼护栏缺失，"
    "船身向一侧倾斜约 0.2 格，水线处正在涌入海水并带气泡，接近沉没但仍能辨认船型。",
    "same sloop, heavily damaged: large hull breach revealing the interior, one deck corner collapsed, mast broken above mid-height with "
    "splintered end, quarterdeck rail gone, hull listing about 0.2 slot, seawater pouring in at the waterline with bubbles, near "
    "foundering but still readable as the same boat.",
    "2880×1440", 1, "战败演出用；与完好态同锚点")

D["A3"] = (
    "船舱房间空槽位，正视：一个方形木框舱位，干净的木地板、两条纵向地板滑轨、后壁一个空挂钩，角落有少量积灰与蛛网，"
    "内部空旷、不得有任何箱子木桶或家具；出两张，普通态与选中态，选中态加一圈暖黄内发光与四角黄铜卡扣。",
    "room empty slot, front view: one square wooden frame, clean plank floor, two longitudinal floor rails, one empty hook on the back "
    "wall, a little dust and cobweb in the corner, interior completely empty with no crates, barrels or furniture; two versions, idle and "
    "selected, selected adds a warm yellow inner glow and four brass corner clips.",
    "512×512", 2, "空槽必须“看起来能装”，堆杂物即判废")

D["A4"] = (
    "海面水线长条：舷侧吃水线与海水的交界，暗色海水中带碎浪、白色泡沫、少许油膜虹彩与漂浮碎屑，"
    "上缘是船壳的湿木与锈迹，下缘是深色水体；横向可无缝平铺，用于贴在船体腰部。",
    "waterline strip: the junction where the hull meets the sea, dark water with broken waves, white foam, a hint of oil-film "
    "iridescence and floating debris, wet planking and rust along the upper edge, dark water below; seamlessly tileable horizontally, "
    "applied along the hull waist.",
    "2880×512", 3, "首中尾 3 帧，程序循环滚动")

D["A5"] = (
    "横版航程进度条底图：深色木质长条凹槽，两端嵌黄铜包角，条身有磨损、盐渍与钉痕，右端一个简化的锚形装饰，"
    "条内为空槽，不带任何文字、数字与刻度。",
    "horizontal voyage progress bar base: dark wooden trough, brass corner caps at both ends, wear, salt stains and nail marks on the "
    "body, a simplified anchor ornament at the right end, empty inside, no text, numbers or tick marks.",
    "2400×288", 1, "组件：填充条与刻度由程序叠加")

D["C1-1"] = (
    "游戏角色资源·基础水手待机：低细节厚涂小人，身高约一个舱格宽度的三分之一；深色油布雨衣、宽檐雨帽、绑腿、腰间绳索，"
    "面部只用极简明暗交代，不画清晰五官；姿态微驼、一手扶着刀柄、重心偏向一侧；侧视，面朝右。",
    "character asset, sailor idle: low-detail painterly figure about one third of a room slot wide; dark oilskin coat, wide rain hat, "
    "leg wraps, rope belt, face suggested only by simple light and shade with no clear features; slightly hunched, one hand on a "
    "cutlass hilt, weight shifted; side view facing right.",
    "512×512", 2, "待机只出 2 张（呼气/吸气），中间由程序补间")

D["C1-2"] = (
    "基础水手行走：同一角色的行走循环关键姿态四张——迈步、过渡、换步、过渡；雨衣下摆与腰间绳索随步伐摆动，"
    "重心上下起伏，帽檐压低；侧视面朝右，四张保持完全相同的角色比例与服饰细节。",
    "sailor walk cycle, four key poses: step, passing, opposite step, passing; coat hem and rope belt swinging, weight bobbing, hat brim "
    "low; side view facing right, identical proportions and costume across all four.",
    "512×512", 4, "厚涂压缩：原 6 帧→4 帧")

D["C1-3"] = (
    "基础水手攻击：三张关键姿态——举刀后引、挥砍至中段、收势回位；肩背明显发力、雨衣被身体带动扬起，"
    "握刀的手腕有细微扭转；侧视面朝右，保持同一角色。",
    "sailor attack, three key poses: wind-up, mid-swing, recovery; clear shoulder and back effort, coat thrown by the motion, slight "
    "wrist twist; side view facing right, same character.",
    "512×512", 3, "近战攻击骨架；弯刀为独立挂件")

D["C1-4"] = (
    "基础水手劳作：用力蹬踏或拉绳的姿态四张——下压、最低点、回升、最高点；面部紧绷、脖颈青筋、雨衣被汗浸透贴在背上，"
    "双手抓握姿势明确；侧视面朝右，同一角色。",
    "sailor labor, four poses: push down, bottom, rise, top; strained face, tense neck, sweat-soaked coat clinging to the back, clear "
    "gripping hands; side view facing right, same character.",
    "512×512", 3, "厚涂压缩：原 4 帧→3 帧；用于动力舱/绞盘")

D["C1-5"] = (
    "基础水手受击：单帧，身体后仰、一手护住胸腹、雨帽向后滑落、双脚离地少许；整体轮廓有被冲击推开的动势。",
    "sailor hit reaction, single frame: torso thrown back, one arm guarding chest, hat slipping off, feet slightly lifted; silhouette "
    "pushed by the impact.",
    "512×512", 1, "单帧 + 程序闪白/抖动，不再逐帧")

D["C1-6"] = (
    "基础水手死亡倒地：三张关键姿态——双膝跪倒、侧向倾倒、完全伏地；雨衣铺散在地面、武器脱手落在身旁、一只手仍向前伸。",
    "sailor death, three poses: knees buckle, falling sideways, fully prone; coat spread on the floor, weapon dropped beside, one hand "
    "still reaching forward.",
    "512×512", 3, "厚涂压缩：原 4 帧→3 帧")

D["C2-1"] = (
    "单件装备·水手弯刀：刃口有多处豁口与锈斑，刀身有暗色血渍与盐蚀，木柄缠麻绳、护手为粗糙铁片；"
    "侧视，刀尖朝右，单件居中摆放，无手、无背景。",
    "equipment item, cutlass: chipped edge with rust spots, dark stains and salt corrosion on the blade, rope-wrapped wooden grip, "
    "crude iron guard; side view, tip pointing right, isolated, no hand, no background.",
    "256×256", 1, "挂件：与攻击动画的握持点对齐")

D["C2-2"] = (
    "单件装备·前装燧发火枪：长枪管带锈、木质枪托开裂并有修补钉，黄铜箍件氧化发绿，枪口有火药残渣，击锤半张；"
    "侧视，枪口朝右，单件居中，无手、无背景。",
    "equipment item, flintlock musket: rusted long barrel, cracked stock with repair nails, verdigrised brass fittings, powder residue "
    "at the muzzle, hammer at half cock; side view, muzzle right, isolated, no hand, no background.",
    "256×256", 1, "挂件：枪口位置需与 E4 枪口焰对齐")

D["C2-3"] = (
    "单件装备·水手工具组：羊角锤、卷尺、一段麻绳与两枚木楔堆叠摆放，铁件锈蚀、木柄有使用磨损，麻绳末端散开；"
    "俯侧视，单件居中，无背景。",
    "equipment item, sailor tool set: claw hammer, measuring tape, coil of hemp rope and two wooden wedges stacked together, rusted "
    "iron, worn wooden handles, frayed rope end; three-quarter view, isolated, no background.",
    "256×256", 1, "维修动作挂件")

D["C3"] = ("", "", "—", 0, "用色相偏移把雨衣分别调成深蓝/暗红/橄榄绿，对应动力/战斗/后勤岗", False)

D["C4"] = (
    "落难船员·漂流：一个人抱着一块断裂船板浮在海上，衣物破烂湿透贴身、面色苍白发青、嘴唇发紫、眼神惊惶；"
    "两张关键帧——抬头朝船呼救、低头力竭下沉。",
    "castaway adrift: a person clinging to a broken plank, clothes torn and soaked, skin pale and bluish, lips purple, panicked eyes; "
    "two key frames, one looking up shouting toward the ship, one head down exhausted and sinking.",
    "512×512", 2, "海面奇遇事件用；需与船员同一形体语言")

D["C5"] = (
    "被拖拽状态的船员：身体前倾被拎起、双臂自然下垂、脚尖离地微屈、头微微后仰，整体松弛无力；单帧，侧视面朝右。",
    "crew being dragged: body pulled forward and lifted, arms hanging, toes off the ground and slightly bent, head tilted back, limp "
    "and unresisting; single frame, side view facing right.",
    "512×512", 1, "拖拽反馈；可复用待机帧加形变")

D["B1"] = (
    "船舱房间·动力舱：方形舱室内部，一座四人脚踏轮连着横向传动轴与舷侧桨轮轴；脚踏轮为粗木辐条外包铁箍、"
    "轴上有油渍与麻绳缠绕；舱内一盏暖黄壁灯、地面有木屑与积油；六张关键帧——静止、四人齐踏、加速、减速、单侧发力、传动轴卡顿。",
    "room asset, rowing engine: square cabin interior with a four-man pedal wheel driving a transverse shaft to the side paddle axle; "
    "thick wooden spokes with iron bands, oil stains and rope wrapped on the shaft; one warm wall lantern, wood shavings and oil on the "
    "floor; six key frames - idle, four men pedaling, accelerating, slowing, one side straining, shaft jamming.",
    "1024×768", 6, "厚涂压缩：原 7 帧→6 帧")

D["B2"] = (
    "船舱房间·钓鱼房：舱室靠舷侧开一个方窗，窗内伸出两根钓竿架在木托上、鱼线垂向海面；舱内有鱼篓、绕线轮、"
    "钉子上挂着风干的鱼；六张关键帧——空放、浮标下沉、收线、起鱼、空钩、断线。",
    "room asset, fishing room: square cabin with a window on the hull side, two rods on wooden rests with lines down to the sea; creel, "
    "reel and dried fish hanging on nails; six key frames - idle cast, float dips, reeling, fish landed, empty hook, line snapped.",
    "1024×768", 6, "厚涂压缩：原 7 帧→6 帧")

D["B3"] = (
    "船舱房间·种植房：木箱苗床分三层，种着发黄打蔫的叶菜与细弱藤蔓，一盏低垂的暖黄灯照着苗床，泥土潮湿、"
    "墙面有水痕与霉斑，整体昏暗压抑、不像温室；六张关键帧——空苗床、发芽、生长、成熟、枯萎、补种。",
    "room asset, planter: three tiers of wooden crates with yellowed wilting greens and thin vines, one low-hanging warm lamp over the "
    "beds, damp soil, water streaks and mold on the walls, dim and oppressive, definitely not a greenhouse; six key frames - empty bed, "
    "sprouting, growing, mature, withered, replanting.",
    "1024×768", 6, "厚涂压缩：原 7 帧→6 帧。禁止画成明亮温室")

D["B4"] = (
    "船舱房间·雨水收集器：舱顶开一个斜向木斗接雨水，导管接向一只半满的木桶，桶身有铜箍与青苔，"
    "桶边地面湿滑、有积水；六张关键帧——干燥、接水、注满、溢流、桶身漏水、修补。",
    "room asset, rain catcher: a tilted wooden funnel under a deck opening, pipe running to a half-full barrel with brass hoops and "
    "moss, wet floor and puddles around it; six key frames - dry, catching, filling, overflowing, leaking, repaired.",
    "1024×768", 6, "厚涂压缩：原 7 帧→6 帧")

D["B5-1"] = (
    "船舱房间·手掷鱼叉炮：木制炮架带可旋转仰角机构、成捆鱼叉斜插在架侧、绞紧的麻绳拉索与扳机；"
    "长炮管穿过舷侧炮门伸向舷外，炮口带铁环；四张关键帧——建成、上弦待发、发射瞬间（绳索回弹、炮架后坐）、复位装填。",
    "room asset, hand harpoon turret: wooden carriage with a rotatable elevation mount, harpoon bundle racked at the side, taut hemp "
    "cord and trigger; long barrel running out through the gun port with an iron ring at the muzzle; four key frames - built, cocked, "
    "firing with cord recoil and carriage kick, reset and reloading.",
    "768×768", 4, "厚涂压缩：原 5 帧→4 帧。炮管必须穿出舷外")

D["B5-2"] = (
    "同一鱼叉炮的哑火与受损：三张关键帧——卡壳（绳索松弛、鱼叉歪卡在架上、操作者徒手拉扯）、"
    "部分损毁（炮架断一只脚、鱼叉散落地面）、完全损毁（只剩焦黑木架与几根断叉）。",
    "same harpoon turret, misfire and damage: three key frames - jammed with slack cord and a harpoon wedged crooked, partially "
    "destroyed with one carriage leg broken and harpoons on the floor, fully destroyed leaving a scorched frame and broken shafts.",
    "768×768", 3, "哑火是 F3 表现，需可读")

D["B6"] = (
    "船舱房间·瞭望台：桅杆中段的木制平台，一圈矮护栏、挂着一只铜铃与一盏风灯、木梯从下方接入、平台上有可站立的空位；"
    "六张关键帧——空置、有人值守、举镜远望、摇铃预警、风灯被吹灭、护栏断裂。",
    "room asset, lookout post: wooden platform mid-mast, low railing, brass bell and storm lantern hanging, ladder entering from below, "
    "empty standing space; six key frames - empty, manned, scanning with a spyglass, ringing the bell, lantern blown out, railing broken.",
    "1024×768", 6, "厚涂压缩：原 7 帧→6 帧")

D["B7"] = (
    "船舱房间·医务室：狭小舱室，一张木床铺着脏污布单、墙上木架排着药瓶与绷带卷、一盆血水、一盏带遮罩的油灯，"
    "光线只照在床面；六张关键帧——空床、伤者躺卧、包扎、换药、濒死、死亡盖上布。",
    "room asset, infirmary: cramped cabin, wooden cot with a soiled sheet, shelf of bottles and bandage rolls, basin of bloody water, "
    "masked oil lamp lighting only the cot; six key frames - empty, patient lying, bandaging, changing dressing, dying, covered with a cloth.",
    "768×768", 6, "厚涂压缩：原 7 帧→6 帧")

D["B8"] = (
    "建造与升级共用特效：木屑与尘土从下方涌起、几根木梁的轮廓由虚到实逐渐成形、末端一圈暖黄闪光并带少量火星，"
    "整体呈从地面向上生长之势；五张关键帧。",
    "shared build and upgrade effect: splinters and dust surging up from below, timber outlines resolving from ghost to solid, ending in "
    "a warm yellow flash with a few sparks, growth rising from the ground; five key frames.",
    "768×768", 5, "厚涂压缩：原 6 帧→5 帧；必须透明可叠")
