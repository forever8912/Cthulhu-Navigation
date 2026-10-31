# v005 可编辑母版 · manifest 独立审计

> 任务：`VS-ART-AUDIT-01`
> 审计对象：`ship_lv1_hull_editable_v005`（提交 `5f94b3a` + `ca188d5`，HEAD `ca188d5`）
> 审计者：WorkBuddy（独立审计，未参与该素材制作）
> 审计时间：2026-10-31 17:30
> **结论：FAIL**

FAIL 的原因不是画面质量，而是**记录不可追溯**：授权来源没有写入 manifest、两个规范必填字段缺失、同一交付包对状态给出两种说法。素材本身哈希完整，这一点已逐项验证通过。

## 一、审计范围与边界

审计对象为 HEAD `ca188d5` 中已提交的 v005 交付包：

- manifest：`assets/production/manifests/ship_lv1_hull_editable_v005.json`
- 源资产：`assets/production/source/vs_art_master_01/gate_b/*_v005.*`（14 项）
- 审核包：`assets/production/review/vs_art_master_01/editable_v005_*`
- 依据：`07-厚涂美术生产规范.md` §五/§六、`08-风格定稿与拆分素材制作计划.md` §五

不在本次范围：

- 材质是否达到厚涂语言（已由 `editable_v005_material_review.md` 判 REWORK，本审计不重复评价）
- 六区 Alpha、原点、净空的几何复算（上游 `editable_v005_checks.json` 已记录，本审计仅核对文件存在与哈希）
- **工作区未提交的 v006 两个文件**（`ship_lv1_material_study_v006.json`、`build_material_v006.cjs`，17:20 生成）不属于 v005 交付包，未纳入审计，也未改动

## 二、逐项结果

| # | 审计项 | 结论 | 依据 |
|---|---|---|---|
| 1 | 命名 | **PASS** | 资产 id `ship_lv1_hull_editable` + `_v005` 后缀；14 个产物命名一致；无「最终版 / 新版2 / ok」类命名；目录符合 `source/` `manifests/` `review/` 约定 |
| 2 | 版本 | **PASS** | `version: 5` ↔ 文件名 `v005` ↔ `ship_lv1_layers_v005.json` 三处一致；v001~v004 共 5 个旧 manifest 与配套文件均未被覆盖（`5f94b3a` 全为新增） |
| 3 | 状态 | **FAIL** | 同一交付包内 4 个文件写 `REVIEW`、2 个写 `REWORK`，详见 §三 |
| 4 | SHA-256 | **PASS** | 14/14 逐字节一致，0 不符、0 缺失，详见 §四 |
| 5 | 参考来源 | **FAIL** | 2 个 references 文件均真实存在，但**未记录使用权限**（规范 §六：使用参考图时必须记录来源和使用权限） |
| 6 | 授权 | **FAIL** | 授权文件存在且 `gate_b: AUTHORIZED`，但 manifest **无任何字段指向它**，无法从 manifest 追溯授权 |
| 7 | 人工修改记录 | **FAIL** | `manual_edits` 4 条只有阶段描述，无执行者、无时间，无法回答「谁在何时改了什么」 |

## 三、状态不一致明细（审计项 3）

| 文件 | `status` 字段 | 判定 |
|---|---|---|
| `manifests/ship_lv1_hull_editable_v005.json` | `REWORK` | 与评审结论一致 |
| `review/.../editable_v005_material_review.md` | `REWORK（几何通过并冻结，材质未通过）` | 与评审结论一致 |
| `review/.../gate_b_review_v001.md` | `素材 REWORK；Gate B 尚未通过` | 一致 |
| `source/.../ship_lv1_layers_v005.json` | `REVIEW` | **不一致** |
| `review/.../editable_v005_checks.json` | `REVIEW` | **不一致** |
| `review/.../editable_v005_handoff.md` | `状态 REVIEW（非 APPROVED）` | **不一致** |

`manifest` 在 `5f94b3a` 首次提交时即为 `REWORK`，`layers_v005.json` 与 `checks.json` 同在 `ca188d5` 提交时仍写 `REVIEW`。因此不是时序造成的过期快照，而是同一批次交付内未统一口径。

风险：程序或后续 Agent 若按 `checks.json.status` 判断资产状态，会误认为仍处于待评审而非待返工。

## 四、SHA-256 逐项核对（审计项 4）

对 manifest `artifacts` 的 14 条记录逐个重算：

```text
哈希一致: 14 | 不符: 0 | 文件缺失: 0
```

构成：1 个构建脚本 + 6 个 PNG + 6 个 SVG + 1 个层级 JSON。

反查目录，`gate_b/` 下全部 v005 源文件均已在 manifest 登记，**无遗漏、无多登记**。

## 五、缺失字段清单（精确到文件与字段）

### 5.1 `manifests/ship_lv1_hull_editable_v005.json`

| 缺失字段 | 规范依据 | 影响 |
|---|---|---|
| `purpose` | 07 §六 manifest 必填示例 | 无法说明该版本要解决什么（结构稿？材质稿？），只能从 `review_notes` 反推 |
| `model_version` | 07 §六 manifest 必填示例 | 若后续改用生图路线，无法判断是否同一模型版本；当前 `generator` 为确定性 SVG，可填 `"n/a (deterministic SVG)"` 而非省略 |
| 授权引用（建议键名 `authorization_ref`） | 任务卡审计项「授权」 | 授权文件 `vs_art_master_01_authorization_v001.json` 存在且 `gate_b: AUTHORIZED`，但 manifest 与其无任何链接 |
| `references` 的使用权限 | 07 §六「使用参考图时必须记录来源和使用权限」 | 两个参考均未注明可用范围（内部风格参考 / 几何基准） |
| `manual_edits` 的执行者与时间 | 任务卡审计项「人工修改记录」 | 4 条记录均为无主描述 |

### 5.2 审核产物未登记（7 个）

以下 v005 审核包文件未进入 manifest `artifacts`，导致审核证据无法按哈希核验：

```text
review/vs_art_master_01/editable_v005_board.html          (782 B)
review/vs_art_master_01/editable_v005_checks.json        (1,191 B)
review/vs_art_master_01/editable_v005_gray_1280x720.png  (152,111 B)
review/vs_art_master_01/editable_v005_handoff.md         (1,115 B)
review/vs_art_master_01/editable_v005_material_review.md (2,069 B)
review/vs_art_master_01/editable_v005_proxy_1280x720.png (151,565 B)
review/vs_art_master_01/editable_v005_silhouette_1280x720.png (16,549 B)
```

`editable_v005_handoff.md` §改动文件自述包含「审核PNG/HTML」，说明这些是交付承诺的一部分，但未落到 manifest。

## 六、已确认无问题的部分（不需返工）

- **哈希完整**：14/14 一致，且 manifest 自带 SHA-256 而非事后补记，这是本项目目前最扎实的一环。
- **旧版本未被覆盖**：v001~v004 的 manifest 与源文件全部保留，符合「资产升级不覆盖旧文件」。
- **未越权**：不存在 `approved/` 目录，无任何文件被复制到 Cocos 工程 `assets/art/`，符合授权文件 `prohibited` 项。
- **分层可编辑成立**：`ship_lv1_hull_editable_v005.svg` 含 8 个具名图层（`hull_body` + `back_wall_1..6` + `front_frame`），落在 §五「6~10 层」区间；`back_walls` 独立 6 层、`front_frame` 独立 1 层，拆分协议自洽。
- **编号可追溯**：`task_id: VS-ART-EDITABLE-01` 在 `04-Agent职责与任务池.md` 有登记，非自造编号。

## 七、最小修复清单（由美术侧执行，本审计不代改）

按代价从低到高：

1. **统一状态口径**：把 `ship_lv1_layers_v005.json`、`editable_v005_checks.json`、`editable_v005_handoff.md` 的 `REVIEW` 改为 `REWORK`（或在这三处显式标注「生成时状态快照，当前状态见 manifest」）。约 10 分钟。
2. **补 3 个字段**：`purpose`、`model_version: "n/a (deterministic SVG)"`、`authorization_ref: "assets/production/manifests/vs_art_master_01_authorization_v001.json"`。约 5 分钟。
3. **补 references 权限**：每条参考注明「内部风格参考，无第三方像素采样」/「几何基准，冻结只读」。约 5 分钟。
4. **registry 审核产物**：把 §5.2 的 7 个文件追加进 `artifacts` 并补哈希。约 15 分钟。
5. **manual_edits 结构化**：改为 `{"action": "...", "by": "Codex", "at": "2026-10-31T09:12Z"}` 形式，或至少在 `review_notes` 记明各步执行者。

上述 1~4 项纯属记录补全，**不需要重新生成任何像素**，也不影响已冻结的几何。

## 八、可复算方式

哈希核对（只读，不写产物）：

```bash
python - <<'EOF'
import hashlib, json
from pathlib import Path
m = json.loads(Path('assets/production/manifests/ship_lv1_hull_editable_v005.json').read_text(encoding='utf-8'))
for a in m['artifacts']:
    p = Path(a['path'])
    h = hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
    print('OK ' if h == a['sha256'] else 'BAD', a['path'])
EOF
```

状态汇总：

```bash
grep -l '"status"' assets/production/manifests/ship_lv1_hull_editable_v005.json \
  assets/production/source/vs_art_master_01/gate_b/ship_lv1_layers_v005.json \
  assets/production/review/vs_art_master_01/editable_v005_checks.json
grep -o '"status": "[A-Z]*"' <上述三个文件>
```

## 九、边界声明

本审计**只新增本文件**，未修改：

- 任何 PNG / SVG / JSON 美术资产
- `ship_lv1_hull_editable_v005.json` 及任一 manifest
- `07-厚涂美术生产规范.md`、`08-风格定稿与拆分素材制作计划.md`
- 工作区中未提交的 v006 文件

审计期间未运行任何构建脚本、未重新生成素材、未导入 Cocos。

**给用户的建议**：v005 可以按 REWORK 继续进入 v006 材质轮，不必因为本审计 FAIL 而回退；但在 v006 提交前应把 §七 的 1~4 项补齐，否则 v006 会继承同一套记录缺陷，到 Gate D 回拼批准时会缺少可核验的授权链。
