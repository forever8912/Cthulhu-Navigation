// Gate A 审核文档生成器。只叠加矢量标注，不编辑参考图像素。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../../../..');
const review = path.join(root, 'assets/production/review/vs_art_master_01');
const manifests = path.join(root, 'assets/production/manifests');
fs.mkdirSync(review, {recursive:true}); fs.mkdirSync(manifests, {recursive:true});
const ref = fs.readFileSync(path.join(root, 'assets/风格定稿/风格定稿.png'));
const sha = crypto.createHash('sha256').update(ref).digest('hex');
const layers = [
 ['010','bg_sky','天空/月亮','全画布','静态远景；无 UI 烘焙'],
 ['020','bg_silhouette','远船/岛影','全画布','低对比视差层'],
 ['030','bg_fog_mid','中景雾','全画布','独立透明雾；限制于世界层'],
 ['040','sea_back','后侧海面','水线以下','平铺；不覆盖船员'],
 ['050','ship_rig_back','后索具/帆','船体原点','桅杆后方；帆独立摆动'],
 ['060','ship_hull_back','船壳后板/舱底','船体原点','完整补绘；不带房间家具'],
 ['070','room_shell','六舱格壳体 ×6','各舱格左下','空壳/地板/后墙；共用尺寸'],
 ['080','room_power','动力舱陈设','对应舱格','轮机主体/活动轮/灯光分离'],
 ['081','room_water','水源房陈设','对应舱格','储罐/管道/水位独立'],
 ['082','room_fishing','钓鱼房陈设','对应舱格','工作台/钓具活动件；绳线独立'],
 ['083','room_harpoon','2001 鱼叉炮','底座中心','底座/炮身/鱼叉/绳索；唯一可建塔示例，建造前隐藏'],
 ['084','room_workshop','工坊陈设','对应舱格','台面/工具活动件；不增加锻造玩法'],
 ['085','room_medical','医务室陈设','对应舱格','床架/帘布/灯；无人物烘焙'],
 ['090','crew_shadow','船员接触影','脚底中心','船员共用画布，透明 PNG'],
 ['091','crew_back_limb','船员后肢','脚底中心','旋转关节补足遮挡区'],
 ['092','crew_body','船员主体','脚底中心','默认向右；4~8 活动部件预算'],
 ['093','crew_head','船员头部','脚底中心','头部枢轴另记录'],
 ['094','crew_front_limb','船员前肢','脚底中心','接缝补绘'],
 ['095','crew_weapon','船员武器/工具','脚底中心','仅持有配置对应装备时显示'],
 ['100','ship_frame_front','前梁/舱格立柱','船体原点','不得遮住角色头部与拖拽目标'],
 ['110','ship_deck_front','甲板/栏杆/船首尾','船体原点','栏杆/梯子/舵轮分离；梯子不烘焙进房间'],
 ['120','ship_rig_front','前索具/桅杆','船体原点','遮挡路径须验证；不要挡角色脸'],
 ['130','ship_lantern','提灯实体','局部挂点','实体与光晕独立'],
 ['140','ship_light','舱内暖光','局部挂点','局部透明叠加；左上主光一致'],
 ['150','monster_contact','怪物接触影/水纹','海面接触点','普通怪/精英/Boss 分组；不代表内容 ID'],
 ['151','monster_back_limb','怪物后肢/触手','接触点','同组共同画布；补全遮挡'],
 ['152','monster_body','怪物主体','接触点','默认朝船；登船后用脚底接触点'],
 ['153','monster_head','怪物头部（可选）','接触点','可无；按剪影决定'],
 ['154','monster_front_limb','怪物前肢/触手','接触点','攀爬路径不得被雾覆盖'],
 ['155','monster_weapon','攻击器官','接触点','独立前摇/攻击/回收'],
 ['156','monster_glow','怪物局部发光（可选）','接触点','保持局部；不整身霓虹'],
 ['160','sea_contact','贴船水线/浪花','水线原点','薄层；禁止厚浪盖住舱内'],
 ['170','sea_front','前海/水下雾','水线以下','透明可调；敌方轮廓仍可读'],
 ['180','fx_projectile','鱼叉弹体/绳线','炮口/目标纯坐标','独立池化对象；不烘焙进炮身'],
 ['181','fx_hit','命中/短水花','命中点','2~4 帧短特效；无血浆'],
 ['182','fx_damage','受击遮罩','对应主体','短时高光；禁止全屏红闪'],
 ['190','world_overlay','血条/选中框/拖拽提示','目标跟随点','不与角色共图；必要时提升至 UI 层'],
 ['200','ui_top','资源栏/航程/设置','屏幕安全区','边框/图标/文本独立；数值由运行时绘制'],
 ['210','ui_side','地图/背包/船员入口','屏幕安全区','各按钮底板与图标独立'],
 ['220','ui_bottom','操作/技能按钮','屏幕安全区','底板/图标/冷却遮罩/文本独立'],
 ['230','ui_event','事件弹窗与遮罩','屏幕中心','底板/插画/选项/动态文字；只定分层，不生成内容'],
 ['240','ui_drag','拖拽角色/悬浮提示','屏幕坐标','最高交互层；取消后清理']
];
const rooms=['动力舱','水源房','钓鱼房','鱼叉炮 2001','工坊','医务室'];
let marks = `<g font-family="Microsoft YaHei, sans-serif" font-size="18" font-weight="bold">`;
const rect=(x,y,w,h,color,label)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity=".10" stroke="${color}" stroke-width="3"/><text x="${x+6}" y="${y+25}" fill="${color}" stroke="#111" stroke-width=".7">${label}</text>`;
marks+=rect(16,12,1640,64,'#8ce5ff','U1 顶部 HUD：低对比背景 / 动态文字独立');
marks+=rect(16,112,100,410,'#8ce5ff','U2');
marks+=rect(1360,778,296,147,'#8ce5ff','U3 操作区');
marks+=`<path d="M120 730 H1660" stroke="#ffca61" stroke-width="4" stroke-dasharray="14 8"/><text x="130" y="720" fill="#ffca61">W 水线 y=730（世界基准；浪峰不是基准）</text>`;
rooms.forEach((r,i)=>marks+=rect(550+140*i,570,140,160,'#7dffa1',`C${i+1} ${r}`));
marks+=rect(486,344,52,146,'#ffb8ee','P');
marks+=`<text x="550" y="372" fill="#ffb8ee">P：112px 逻辑高 / 146px 图上高</text><text x="550" y="400" fill="#ffb8ee">原角色约 96px 图上高，需统一放大约 1.52 倍</text>`;
marks+=rect(790,540,160,58,'#ff8176','R1 移除重复炮');
marks+=rect(712,614,160,110,'#ff8176','R2 替换种植');
marks+=`<text x="560" y="556" fill="#7dffa1">绿色为重绘提案：六格 × 140×160；不是原图现成可裁切边界</text></g>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941"><image width="1672" height="941" href="data:image/png;base64,${ref.toString('base64')}"/>${marks}</svg>`;
fs.writeFileSync(path.join(review,'gate_a_overlay_v001.svg'),svg);
const table='| Z | 层键（非配置 ID） | 内容 | 原点 | 拆分 / 遮挡要求 |\n|---|---|---|---|---|\n'+layers.map(l=>'| '+l.join(' | ')+' |').join('\n');
const report=`# VS-ART-MASTER-01 · Gate A v001\n\n状态：REVIEW，等待用户审核。仅完成审核包，不代表 Gate A 已通过。日期：2026-10-31。\n\n## 基线与坐标\n\n任务池未检索到同名任务卡，本轮以用户明确指定的五项作为 Gate A 范围。参考 assets/风格定稿/风格定稿.png，仅引用构图与材质；不认定其中每个内容均已获玩法批准。SHA-256：${sha}。\n\n画布 1672×941，左上为 (0,0)，x 向右、y 向下。逻辑预览 1280×720，等比系数 720/941=0.76514，横向不足 1px 以留边处理，不拉伸。图上尺寸不是纹理导出尺寸。以下布局均为 Gate A 提案，未修改 SSOT。\n\n| 标记 | 图上坐标 / 尺寸 | 逻辑意义 |\n|---|---|---|\n| W 水线 | y=730（77.58% 高）；视觉浪峰可围绕基线上下浮动 | 逻辑 y≈558.6；船体、水纹、海中怪共享基准 |\n| C1~C6 | 左上 (550+140i,570)，i=0..5；各 140×160；脚底 y=730 | 每格约 107.1×122.4 逻辑像素；只是布局占位，不是 Lv1 默认全部解锁/建满 |\n| P 船员 | 目标高 146 图上像素≈112 逻辑像素；脚底中心锚点，默认向右 | 允许范围 96~128 逻辑高；母版锁定 112。普通怪同级比例另设 96~128；不统一拉伸 Boss |\n| U1 | (16,12,1640,64) | 顶部资源栏；文本与边框独立 |\n| U2 | (16,112,100,410) | 左侧入口；世界拖拽不得穿透按钮 |\n| U3 | (1360,778,296,147) | 底部操作区；怪物重要信息避让该区 |\n| 设备留边 | 四周至少 16 图上像素，顶部 12 为当前图稿示意 | 临时审核留边，不是已实测机型安全区；运行时须叠加设备 safe-area |\n\n## 必须修正后才能生产\n\n1. 原画上舷炮与舱内炮形成重复火力语义。移除上舷炮（R1），只保留可建造的 2001 房间示例；未建造状态为空位，不存在免费固定炮。\n2. 原图种植内容（R2）不属于切片六房。绿色六舱格是重绘规划，替换为动力舱、水源房、钓鱼房、鱼叉炮、工坊、医务室。六格不是六间在 Lv1 同时开放的玩法声明；真实解锁按配置。\n3. 原画人物约 96 图上像素，缩至逻辑预览约 73px，低于 96~128 要求。母版改为 112 逻辑高；舱格净高同步改为 122.4。原立柱、侧板需配合重绘，不能直接等格裁剪。\n\n原图局部有像素化边缘，后续仍严格按暗黑厚涂 SSOT 修整，不将其放大为新风格规则。\n\n## 完整分层表（后 → 前）\n\n${table}\n\n层键是生产分组，不冒充内容 ID。房间除已确定的 2001 外，在正式生产前由配置映射确认 ID；怪物同理。船体统一以 (970,730) 为提案原点；六舱格各自脚底左端。所有角色部件共享画布、脚底主锚点及缩放；局部枢轴另记，不能裁图后丢失偏移。海怪可在 150~156 海中组与登船单位组间切换排序，需由状态决定；不固定压在船体前。\n\n## 后续拆件合同\n\n每个图层独立透明 PNG 或可编辑分层文件；覆盖关系下的后墙、肢体、炮身必须补绘，不接受从合成图硬抠出透明洞。源/审核/运行时分开保存；审核标注与任何文本不得进入运行时。背景至少远、中、近三层。普通角色与怪物控制 4~8 活动部件，超过 10 必须另评审。\n\n正式生成时逐件记录 prompt、negative prompt、模型、seed 或任务 ID、参考来源、时间与人工修改；本轮无 AI 生成，相关字段不伪造。原图仅有项目内部来源，外部授权记录未核验，正式发布前须补齐追溯。\n\n## 验收与审核\n\n- [x] 水线、六舱格、角色比例、UI 安全区在同一坐标系标注。\n- [x] 分层包含背景、海、船体、六房、角色、怪物、特效、HUD、弹窗和拖拽；记录排序、原点、遮挡及透明输出要求。\n- [x] 记录重复炮、范围不符及角色缩放问题，不把参考图缺陷批准为生产口径。\n- [ ] 用户批准上述重绘布局、112px 角色比例及 UI 提案。\n- [ ] 后续素材在实际尺寸、灰底、游戏底、剪影四视图及动画中验证。\n\n审核人：待定；审核结论：待定；正式生成许可：否。Gate A 通过后才进入正式生成与拆件，资产仍需独立 APPROVED 才能进入游戏。\n\n## 影响\n\n不改配置、存档、玩法与 SSOT；无运行时包体、Draw Call、节点变化。图稿为提案，设备安全区、手机可读性及动画接缝尚未实测。文档仓库本轮仅新增 assets/production 下文件，未提交；工程仓库只读未修改。原有配置导出修改与 .v* 文件、工程设置/扩展变更均保留。\n`;
fs.writeFileSync(path.join(review,'gate_a_review_v001.md'),report);
fs.writeFileSync(path.join(review,'gate_a_layers_v001.json'),JSON.stringify(layers.map(([z,key,content,origin,requirements])=>({z:Number(z),key,content,origin,requirements})),null,2));
fs.writeFileSync(path.join(manifests,'vs_art_master_01_gate_a_v001.json'),JSON.stringify({asset_id:'vs_art_master_01_gate_a',version:1,status:'REVIEW',purpose:'Gate A annotation and layering proposal',generator:'deterministic SVG annotation; no AI image generation',prompt:null,negative_prompt:null,model:null,model_version:null,seed:null,generated_at:new Date().toISOString(),references:[{path:'assets/风格定稿/风格定稿.png',sha256:sha,rights:'project internal reference; external provenance unverified'}],manual_edits:['Added vector annotation overlay; reference pixels unchanged'],reviewer:'',review_notes:'Pending user Gate A approval; formal generation prohibited'},null,2));
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>VS-ART-MASTER-01 Gate A</title><style>body{background:#101923;color:#eee;font:16px/1.7 'Microsoft YaHei',sans-serif;margin:24px}svg{width:100%;height:auto}a{color:#8ce5ff}h1{font-size:24px}.legend{padding:16px;background:#20313d}</style><h1>Gate A · v001 · 待审核</h1><p class="legend">黄色：水线　绿色：重绘后的六舱格提案　粉色：112px 角色比例　蓝色：UI 安全区　红色：必须修正。原图保持原样；标注为提案，尚未批准生成。</p>${svg}<p><a href="gate_a_review_v001.md">完整坐标、修正项与分层表</a> · <a href="gate_a_layers_v001.json">分层结构数据</a></p></html>`;
fs.writeFileSync(path.join(review,'gate_a_board_v001.html'),html);
// 保留后续用户授权，重新生成审核板不得把已通过的 Gate A 重置为待审核。
const authorizationPath=path.join(manifests,'vs_art_master_01_authorization_v001.json');
if(fs.existsSync(authorizationPath)){
 const approval=JSON.parse(fs.readFileSync(authorizationPath,'utf8'));
 if(approval.gate_a==='APPROVED'){
  const reportPath=path.join(review,'gate_a_review_v001.md');
  let approved=fs.readFileSync(reportPath,'utf8')
   .replace('状态：REVIEW，等待用户审核。仅完成审核包，不代表 Gate A 已通过。','状态：APPROVED。用户已批准 Gate A，授权范围详见授权记录。')
   .replace('- [ ] 用户批准上述重绘布局、112px 角色比例及 UI 提案。','- [x] 用户批准上述重绘布局、112px 角色比例及 UI 提案。')
   .replace('审核人：待定；审核结论：待定；正式生成许可：否。','审核人：用户；审核结论：Gate A 通过；正式生成许可：仅 Gate B 母版，禁止 Cocos 导入和房间怪物批量扩展。');
  fs.writeFileSync(reportPath,approved);
  const manifestPath=path.join(manifests,'vs_art_master_01_gate_a_v001.json');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  manifest.status='APPROVED';manifest.reviewer='user';manifest.review_notes='Gate A approved; only Gate B masters authorized. No Cocos import or bulk room/monster expansion.';
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
  fs.writeFileSync(path.join(review,'gate_a_board_v001.html'),html.replace('Gate A · v001 · 待审核','Gate A · v001 · 已批准').replace('标注为提案，尚未批准生成。','Gate A 标注已批准；仅授权 Gate B 母版，禁止 Cocos 导入与房间怪物批量扩展。'));
 }
}
console.log(JSON.stringify({reference:[ref.readUInt32BE(16),ref.readUInt32BE(20)],layers:layers.length,review,status:JSON.parse(fs.readFileSync(path.join(manifests,'vs_art_master_01_gate_a_v001.json'),'utf8')).status,sha256:sha},null,2));
