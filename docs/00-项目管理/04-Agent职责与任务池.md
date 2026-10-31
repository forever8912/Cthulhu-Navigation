# 04 - 《恐惧之海》Agent 职责与任务池

> 版本：v1.9（2026-10-31）
> 状态：现行任务路由表
> 上位规则：根目录 `AGENTS.md` 与 `03-多Agent协作手册.md`

## 一、分工原则

本项目同时使用 GPT / Codex、WorkBuddy 和 Trae。目标是让每个 Agent 在最合适的任务上消耗额度，并保持文件写入互不重叠。

| Agent | 核心定位 | 典型任务 | 交付要求 |
|---|---|---|---|
| GPT / Codex | 架构与集成负责人 | 项目框架、公共接口、重难点逻辑、美术资源、自动化测试、性能与最终验收 | 给出验证证据；审查另外两个 Agent 的 diff；维护稳定基线 |
| WorkBuddy | 内容与数据负责人 | 文本整理、数值配置、xlsx/JSON、导出器、校验器、批量文档一致性 | 数据可重复生成；错误返回非零；不静默改变玩法口径 |
| Trae | 常规功能实现负责人 | 已冻结接口下的 UI、输入、模块内部功能、灰盒场景、常规适配 | 不越过模块边界；类型检查通过；提供可运行灰盒或测试 |

额度使用顺序：

1. 先由 GPT / Codex 冻结接口、任务卡和验收标准。
2. 将批量文本/配置任务交给 WorkBuddy，将常规编码交给 Trae。
3. GPT / Codex 在等待并行产出时继续做美术、核心内核、构建和测试，不重复实现已派发任务。
4. 两个外部 Agent 只提交各自分支和交接报告，由 GPT / Codex 统一审查、修复边界问题并集成。

## 二、当前并行任务池

| 任务号 | Owner | 阶段 | 状态 | 独占写入范围 |
|---|---|---|---|---|
| VS-W1-GPT-02 | GPT / Codex | W1 | 已完成（`ae9e652`） | `build-config/`、`assets/art/_import_test/`、`assets/scripts/view/W1ImportProbe.ts`、`Main.scene`、W1计划状态 |
| VS-W1-DATA-01 | WorkBuddy | W1 | 已完成并合入文档 `main`（最新 `16ddb71`） | `tools/配置导出/`、`data/配置导出/` |
| VS-W2-INPUT-01 | Trae | W2预备 | 已完成（`655a937`），已进入 W2 集成基线 | `assets/scripts/view/input/`、`DragGestureSandbox.scene`、`tests/view/input/` |
| VS-W2-BATTLE-CORE-01 | GPT / Codex | W2 | 已完成（`41a0396` + `cb21e0e`） | `assets/scripts/logic/battle/`、`W2BattleGrayboxConfig.ts`、对应测试 |
| VS-W2-VIEW-01 | Trae | W2 | 可领取，依赖工程提交 `cb21e0e` | `assets/scripts/view/battle/`、`BattleGraybox.scene`、`tests/view/battle/` |
| VS-ART-MASTER-01 | GPT / Codex | W1/W2并行 | v006 几何技术检查 PASS；材质与风格定稿不一致，已更正为 REWORK | `source/vs_art_master_01/`、`manifests/ship_lv1_*`、`review/vs_art_master_01/` |
| VS-ART-GEOMETRY-01 | GPT / Codex | W2并行 | 部分完成：精确底稿通过；唯一 v004 六处净空均被梁柱侵入，已标记 REWORK | v004 底稿、候选、审核板、检查 JSON 与 manifest |
| VS-ART-EDITABLE-01 | GPT / Codex | W2并行 | 部分完成：v005 分层与硬遮罩通过；材质评审 REWORK，旧版保留 | v005 SVG/PNG、层级 JSON、检查结果、manifest 与评审报告 |
| VS-ART-MATERIAL-01 | GPT / Codex | W2并行 | 部分完成：v006 几何零漂移，但材质尺度、色彩和笔触语言偏离风格定稿，结论 REWORK | v006 分层源文件、审核板、manifest 与材质评审报告 |
| VS-ART-MATERIAL-SWATCH-01 | GPT / Codex | W2并行 | 部分完成：三张样板已交付；旧木/铁件内部 PASS 待用户批准，梁柱偏暖偏亮需 REWORK；v007 仍关闭 | 材质样板、同尺度对照板、manifest 与样板评审报告 |
| VS-ART-AUDIT-01 | WorkBuddy | W2并行 | 待材质方向冻结后领取：独立审计最终候选 manifest、命名、哈希、授权和状态一致性 | `assets/production/review/vs_art_master_01/manifest_audit_v001.md` |
| VS-ART-INGAME-01 | Trae | W2后续 | 阻塞：仅在资产 APPROVED 且 W2 灰盒视图交付后开放 | 工程内限定美术验证场景与导入报告，具体范围届时冻结 |
| VS-W1-INTEGRATION-01 | GPT / Codex | W1 | 已完成：运行时 JSON（`aa42508`）、Web Mobile（`30a4ba3`）、真实手机同网段启动均通过 | 配置运行时接入、手机验证、W1闸门结论 |

禁止事项：

- WorkBuddy 不修改 Cocos 场景、TypeScript 公共接口或玩法数值本身。
- Trae 不修改 `core/`、`config/`、`logic/GameSimulation.ts`、`GameBootstrap.ts`、`Main.scene` 和文档仓库。
- GPT / Codex 在两个任务交付前不进入其独占目录重复实现。

## 三、WorkBuddy 任务卡

```text
任务编号：VS-W1-DATA-01
角色：数据 Agent（WorkBuddy）
目标：把现有 xlsx→JSON 导出器改成可阻断失败的 W1 配置流水线，并稳定导出 09_全局参数/全局参数表。

必读文件（最多4份）：
1. AGENTS.md
2. docs/00-项目管理/00-文档索引与协作规范.md
3. docs/00-项目管理/02-垂直切片开发计划.md
4. docs/00-项目管理/03-多Agent协作手册.md

允许写入：
- tools/配置导出/export_config.py
- tools/配置导出/tests/
- data/配置导出/09_全局参数/
- data/配置导出/index.json（仅由导出器重新生成）

禁止写入：
- E:\devfearfulsea\NewProject 全部文件
- data/配置表/*.xlsx（本任务不改策划源数据）
- 任何玩法SSOT与公共TypeScript接口

实现要求：
1. 重复主键、必填 key 缺失、未知 type、值无法按 type 解析时必须返回非零退出码。
2. 为“全局参数表”使用 key 作为唯一主键；至少校验 key/type/value 三列。
3. 输出顺序稳定；相同输入重复运行不得产生无意义 diff。
4. 增加最小测试夹具：正常、重复 key、缺失 key、非法 type 各1例。
5. 保持现有批量导出能力，不手改生成JSON。

验收条件：
- 正常配置导出退出码0。
- 三类错误夹具均返回非零。
- data/配置导出/09_全局参数/全局参数表.json 可重复生成且内容一致。
- 提交中不包含xlsx二进制变化。

交付：独立分支 agent/VS-W1-DATA-01-config-validation、提交哈希、运行命令和结果摘要。
非目标：不设计新字段、不调整现有数值、不接入Cocos运行时。
```

## 四、Trae 任务卡

```text
任务编号：VS-W2-INPUT-01
角色：UI Agent（Trae）
依赖：从工程提交 `ae9e652`（分支 `agent/vs-w1-framework`）创建任务分支；若基线已被集成到更新分支，以集成负责人通知为准。
目标：实现与玩法无关的通用拖拽输入适配器，并提供独立灰盒场景验证触摸与鼠标路径。

必读文件（最多4份）：
1. E:\devfearfulsea\NewProject\AGENTS.md
2. docs/00-项目管理/02-垂直切片开发计划.md
3. docs/00-项目管理/03-多Agent协作手册.md
4. docs/02-系统设计/战斗系统.md（只读拖拽调度相关段落）

允许写入：
- assets/scripts/view/input/
- assets/scenes/sandbox/DragGestureSandbox.scene 及对应.meta
- tests/view/input/

禁止写入：
- assets/scripts/core/
- assets/scripts/config/
- assets/scripts/logic/
- assets/scripts/view/GameBootstrap.ts
- assets/scenes/Main.scene
- settings/、build-config/、文档仓库

接口边界：
- 输出纯数据 DragGestureSnapshot：pointerId、phase、start、current、delta、elapsedMs。
- phase 仅允许 start/move/end/cancel。
- 组件只解释输入，不决定船员、房间、岗位或战斗结果。
- 必须在 disable/destroy 时注销全部事件。

验收条件：
- 鼠标与单指触摸都能完成拖拽；取消路径会发出 cancel。
- 连续拖拽20次无重复监听和残留节点。
- TypeScript strict诊断为0错误。
- 灰盒场景显示起点、当前位置和phase，但不修改Main.scene。

交付：独立分支 agent/VS-W2-INPUT-01-drag-input、提交哈希、场景验证步骤、已知风险。
非目标：不实现船员换岗判定、吸附规则、战斗逻辑和正式UI美术。
```

### 4.2 W2 战斗灰盒视图任务卡

```text
任务编号：VS-W2-VIEW-01
角色：UI Agent（Trae）
依赖：从工程提交 cb21e0e（分支 codex/w2-battle-graybox）创建独立任务分支。
目标：把已冻结的拖拽输入与确定性战斗内核组合成可运行的 W2 方块灰盒，验证“拖人换岗 → 火力改变 → 自动结算”。

必读文件（最多4份）：
1. E:\devfearfulsea\NewProject\AGENTS.md
2. docs/00-项目管理/02-垂直切片开发计划.md
3. docs/02-系统设计/战斗系统.md（只读 §1、§2、§4、§9）
4. docs/00-项目管理/03-多Agent协作手册.md

允许写入：
- assets/scripts/view/battle/
- assets/scenes/sandbox/BattleGraybox.scene 及对应 .meta
- tests/view/battle/

允许只读调用：
- assets/scripts/view/input/DragGesture*.ts
- assets/scripts/logic/battle/BattleGraybox*.ts
- assets/scripts/config/W2BattleGrayboxConfig.ts
- assets/scripts/core/time/FixedStepClock.ts

禁止写入：
- assets/scripts/logic/、assets/scripts/config/、assets/scripts/core/
- assets/scripts/view/input/
- assets/scripts/view/GameBootstrap.ts、assets/scenes/Main.scene
- settings/、build-config/、正式美术目录和文档仓库

接口边界：
1. 用 W2_BATTLE_GRAYBOX_CONFIG 创建 BattleGrayboxSimulation；不得在视图重复写一套数值。
2. 通过 FixedStepClock 或等价固定步长，以 20Hz 调用 simulation.step()；渲染可逐帧插值。
3. 只在 DragGestureSnapshot.phase=end 时做命中区判断；命中炮位后调用 assignCrew(crewId, turretId)。
4. 视图只读 BattleGrayboxSnapshot，不直接修改怪物HP、位置、炮位冷却或胜负状态。
5. 不提供手动开炮、瞄准或点击伤害操作。

灰盒表现：
- 3 个炮位方块、3 个可拖拽船员标记。
- 1 个海中怪方块、1 个登船怪方块，按 progress 从远海移动到船体。
- 显示炮位占用、怪物HP、船体HP、时间、胜负和最近事件。
- 用线或短闪烁表示自动攻击；不使用正式美术资源。

验收条件：
- 鼠标和单指触摸均可拖拽船员换炮位，连续20次无监听或节点残留。
- 换岗后旧炮位释放、目标炮位占用，火力变化来自同一个 BattleGrayboxSimulation。
- 默认配置自动战斗在25~40秒内胜利；不配置炮手时最终失败。
- TypeScript strict诊断0错误，场景引用有效，无运行时异常。
- 提供一次浏览器预览截图和复现步骤，不修改Main.scene。

交付：分支 agent/VS-W2-VIEW-01-battle-graybox、提交哈希、预览截图、验证结果和已知风险。
非目标：不实现正式战斗公式、房间受损、登船AI、正式HUD或美术替换。
```

## 五、GPT / Codex 美术母版任务卡

```text
任务编号：VS-ART-MASTER-01
角色：美术 Agent 与集成负责人（GPT / Codex）
目标：以 STYLE_SCENE_001_v001 为视觉蓝图，正向制作可动画、可复用、可回拼的第一批拆分母版；不直接抠取扁平场景图充当正式资产。

必读文件（最多4份）：
1. AGENTS.md
2. docs/03-美术方案/07-厚涂美术生产规范.md
3. docs/03-美术方案/08-风格定稿与拆分素材制作计划.md
4. docs/00-项目管理/02-垂直切片开发计划.md

视觉参考：
- assets/风格定稿/风格定稿.png（STYLE_SCENE_001_v001）

允许写入：
- assets/production/source/vs_art_master_01/
- assets/production/manifests/（仅 VS-ART-MASTER-01 对应 manifest）
- assets/production/review/vs_art_master_01/
- 本任务的美术交接记录

禁止写入：
- E:\devfearfulsea\NewProject\assets\art\（APPROVED 前不得入工程）
- Cocos 场景、脚本、Prefab、配置与其他 Agent 独占目录
- assets/风格定稿/风格定稿.png（不得原地覆盖）

首批范围：
1. 分层海天背景与前景海水。
2. 船体 Lv1 的完整后层/主体/前挡板结构。
3. 第一座塔 2001 鱼叉炮及一间代表性房间。
4. 1 名普通船员和 1 只普通海怪的部件化母版。
5. 铜木 UI 框架与 1 组按钮样式板；不制作最终文字。

验收条件：
- 回拼审核图在构图、冷暖、材质与信息层级上延续 STYLE_SCENE_001_v001。
- 所有可动部件补全遮挡区域，共享画布/原点，并在实际显示尺寸下无接缝闪烁。
- 每项资产有源图、透明部件、审核图和 manifest；状态止于 REVIEW，用户批准后才能升为 APPROVED。
- 不批量扩展 6 房、5 怪或 Lv2/Lv3；先通过最小母版闸门。

交付：候选对照板、分层清单、回拼图、manifest、风险与建议；无需改动代码仓库。
非目标：不实现动画代码、正式 HUD 逻辑、配置 ID 调整或批量全量美术。
```

### 5.1 美术下一阶段任务卡

```text
任务编号：VS-ART-GEOMETRY-01
Owner：GPT / Codex
目标：终止船框提示词盲抽，建立精确六舱几何约束，并只生产一个受约束的 v004 候选。

输入：
- STYLE_SCENE_001_v001
- ship_lv1_hull_shell_v001 与 ship_lv1_hull_frame_v001~v003（仅作失败证据）
- Gate A 批准布局：1672×941 源画布；六格左上 `(550+140i,570)`、每格 140×160 源像素、共同底线 y=730；112px 逻辑船员净空

交付：
1. 可测量的逻辑坐标底稿、透明遮罩与尺寸 JSON。
2. v004 船体框架候选及匹配的后墙/船壳分层方案。
3. 中灰底、场景代理底、逻辑尺寸、黑白剪影和 1280×720 回拼审核板。
4. 更新后的 manifest；状态只能为 REVIEW 或 REWORK。

验收：
- 六格尺寸、中心距与共同底线为精确值，源像素误差不超过 1px。
- 每格按统一缩放换算后的可见净高 ≥112 逻辑像素。
- 六个开口为真实 Alpha，无遮头梁柱；不得缩小角色规避净高要求。
- 通过几何自动检查后才进入材质/气氛评审。

非目标：不生产六房、五怪、Lv2/Lv3，不写入 approved 或 Cocos assets/art。

执行结果：精确底稿通过；v004 画布通过，但六个 128×152 源像素净空区均检测到非透明梁柱，候选 REWORK，任务停止追加生成。
```

```text
任务编号：VS-ART-EDITABLE-01
Owner：GPT / Codex
目标：基于已通过的 v004 精确底稿建立固定几何、分层可编辑的船体母版；不再让生成模型决定船框拓扑。

实现边界：
1. 画布固定 1672×941，坐标、中心距、底线与 geometry_v004 JSON 完全一致。
2. 六个 128×152 净空矩形作为不可侵犯的硬 Alpha 遮罩，梁柱、斜撑、纹理和抗锯齿均不得写入。
3. 前框、后墙、船壳主体、房间遮罩使用同画布和共同原点；先完成无材质结构版，再在遮罩约束下添加厚涂材质。
4. 不生成整张船框候选；生图若继续使用，只能提供可裁切材质参考，不能改变几何或直接成为正式层。

交付：
- ship_lv1_hull_editable_v005.svg（或等价分层可编辑源文件）
- 同画布透明 PNG 导出、层级 JSON、硬遮罩与自动检查结果
- 中灰底、逻辑尺寸、黑白剪影、1280×720 回拼审核板
- v005 manifest 与交接报告；状态止于 REVIEW/REWORK

阻断验收：
- 六处净空 Alpha>8 的像素计数必须全部为 0。
- 画布、格坐标、底线和共同原点逐项精确匹配，误差≤1源像素。
- 结构版通过前禁止材质评审；材质版不得破坏结构版检查结果。
- v004 及更早文件不得覆盖，不进入 approved 或 Cocos。

执行结果：v005 结构和材质初稿六处净空均为 0 侵入，坐标/原点/净高通过；材质仍为规则矢量初稿，评审转 REWORK，几何冻结。
```

```text
任务编号：VS-ART-MATERIAL-01
Owner：GPT / Codex
目标：在不改变 v005 几何协议的前提下制作 v006 暗黑厚涂材质版。

冻结项：1672×941 画布、共同原点、六格坐标、128×152 净空、硬遮罩、层级和后墙出血。
只允许修改：木/铁材质、左上体积光、冷暖层次、盐渍/锈蚀/补丁木和克制的边缘磨损。

必须修改：
1. 消除等距矢量木纹，改为大色块、干刷断边和不规则笔触。
2. 强化左上主光、梁柱转折、船腹冷暗与水线潮湿反光。
3. 打破梁柱/铆钉/横板机械重复，不得侵入净空或制造小尺寸噪点。

交付：v006 分层可编辑源文件、透明 PNG、同一几何检查、四视图审核板、manifest 和交接报告。
状态止于 REVIEW/REWORK；用户批准前不得进入 approved 或 Cocos。

执行结果：v006 三层 Alpha 与 v005 逐像素一致，几何技术检查 PASS；但与 `STYLE_SCENE_001_v001` 并排评审后，发现材质尺度过大、橙锈/金色高光过强、粗重笔触像整张贴片覆盖，材质结论更正为 REWORK。几何继续冻结，不进入批准与 Cocos 导入。
```

```text
任务编号：VS-ART-MATERIAL-SWATCH-01
Owner：GPT / Codex
目标：在冻结船体几何的前提下，先用小块材质样板对齐 `STYLE_SCENE_001_v001`，避免再次制作整船后才发现风格偏差。

交付：
1. 一块旧木板材样板、一块梁柱/结构边样板、一块少量锈铁样板。
2. 与风格定稿局部在相同观察尺度下并排的审核板；参考裁切只用于评审，不进入运行时资产。
3. 样板 manifest 与评审报告；状态只能为 REVIEW/REWORK。

验收：
- 使用克制的游戏化手绘旧木语言：灰褐/蓝灰为主，暖色只作局部受光。
- 笔触尺度服从木板、梁柱和金属结构，不出现跨结构的大块粗重油彩贴片感。
- 木纹和磨损沿结构走向，锈蚀、盐渍与边缘磨损局部化；结构边清楚但不是均匀粗黑描边。
- 用户明确批准样板后，才开放 v007 全船映射；样板未通过时不得生成下一版完整船体。

非目标：不改几何、不制作完整船体、不进入 approved 或 Cocos、不扩展房间和怪物。
```

```text
任务编号：VS-ART-AUDIT-01
Owner：WorkBuddy
目标：材质方向冻结后，独立检查最终候选可编辑母版的命名、版本、状态、SHA-256、参考来源、授权与人工修改记录。
只允许新增 manifest_audit_v001.md；不得修改 PNG、manifest 或美术规范。
结论只允许 PASS / FAIL，并逐项列出缺失字段和目标文件。
```

```text
任务编号：VS-ART-INGAME-01
Owner：Trae（暂不启动）
开放条件：船壳最小套件达到 APPROVED，且 VS-W2-VIEW-01 已交付。
目标：只做导入、锚点、缩放、遮挡、Alpha 边缘与 50fps 验证；不得修改美术源文件。
```

该任务与 WorkBuddy 的配置流水线、Trae 的拖拽输入目录无文件重叠，可同步进行。新窗口开工时必须先复述允许写入范围和验收条件。

## 六、集成与额度控制

- WorkBuddy 交付后，GPT / Codex 只审查和接入，不重写整个导出器；若结果不合格，返回精确失败用例。
- Trae 交付前，GPT / Codex 先冻结拖拽数据接口；交付后只处理跨层适配，不在其目录另写第二套输入系统。
- 单个外部 Agent 连续两次未通过同一验收项，暂停追加任务，改由 GPT / Codex 收敛问题后再派发。
- GPT / Codex 的高额度优先留给：战斗确定性、存档迁移、复杂调试、美术母版、性能分析和最终集成测试。
- WorkBuddy 的额度优先用于：大批量数据、配置审计、文案与文档一致性。
- Trae 的额度优先用于：模块内部的常规编码、UI交互和可视化灰盒。
