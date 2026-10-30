# 04 - 《恐惧之海》Agent 职责与任务池

> 版本：v1.0（2026-10-31）
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
| VS-W1-DATA-01 | WorkBuddy | W1 | 待领取 | `tools/配置导出/export_config.py`、`tools/配置导出/tests/`、`data/配置导出/09_全局参数/` |
| VS-W2-INPUT-01 | Trae | W2预备 | 可领取（独立开发，W1闸门前不合并） | `assets/scripts/view/input/`、`assets/scenes/sandbox/DragGestureSandbox.scene`、`tests/view/input/` |
| VS-W1-INTEGRATION-01 | GPT / Codex | W1 | 等待并行产出 | WorkBuddy产出审查、运行时JSON接入、手机验证、W1闸门结论 |

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

## 五、集成与额度控制

- WorkBuddy 交付后，GPT / Codex 只审查和接入，不重写整个导出器；若结果不合格，返回精确失败用例。
- Trae 交付前，GPT / Codex 先冻结拖拽数据接口；交付后只处理跨层适配，不在其目录另写第二套输入系统。
- 单个外部 Agent 连续两次未通过同一验收项，暂停追加任务，改由 GPT / Codex 收敛问题后再派发。
- GPT / Codex 的高额度优先留给：战斗确定性、存档迁移、复杂调试、美术母版、性能分析和最终集成测试。
- WorkBuddy 的额度优先用于：大批量数据、配置审计、文案与文档一致性。
- Trae 的额度优先用于：模块内部的常规编码、UI交互和可视化灰盒。
