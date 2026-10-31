const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../../..');
const review=path.join(root,'assets/production/review/vs_art_master_01');
const source=path.join(root,'assets/production/source/vs_art_master_01/gate_b');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const ids=['ship_lv1_hull_shell_v001','ship_lv1_hull_frame_v001','ship_lv1_hull_frame_v002','ship_lv1_hull_frame_v003'];
for(const id of ids){
 const m=path.join(root,'assets/production/manifests',id+'.json'),j=read(m),b=fs.readFileSync(path.join(source,id+'.png'));
 j.status='REWORK';j.sha256=crypto.createHash('sha256').update(b).digest('hex');j.pixel_size=[b.readUInt32BE(16),b.readUInt32BE(20)];
 if(id.endsWith('frame_v003')){
  j.negative_prompt='No pixel art, 3D, photography, fake checkerboard, text, UI, characters, monsters, cannons, vegetation, machinery, ocean, mast, rope';
  j.task_id='exec-8fda3d21-c57a-4922-9d06-bd008b25218e';j.task_id_kind='tool output artifact identifier; provider task ID not exposed';
  j.references=['assets/production/source/vs_art_master_01/gate_b/ship_lv1_hull_frame_v002.png'];
  j.source_path='assets/production/source/vs_art_master_01/gate_b/'+id+'.png';
  j.model=null;j.model_version=null;j.seed=null;j.generated_at=null;j.recorded_at=new Date().toISOString();j.manual_edits=[];
  j.reviewer='Codex initial QA';j.review_notes='六舱口真实透明，但按 Gate A 舱格宽度缩放后净高不足 112 逻辑像素。三轮仍未通过，停止文字微调，改用精确几何底稿再生产。';
  j.license_notes='Self-generated with internal project reference; external reference provenance unverified; no protected IP requested';
 }
 fs.writeFileSync(m,JSON.stringify(j,null,2));
}
const diag=read(path.join(review,'gate_b_frame_v003_alpha.json'));
const centers=diag.bays.map(b=>(b.left+b.right)/2);
const pitch=(centers[5]-centers[0])/5;
const scale=(140*720/941)/pitch;
const logicalHeights=diag.bays.map(b=>+(b.height*scale).toFixed(2));
const b=fs.readFileSync(path.join(source,'ship_lv1_hull_frame_v003.png'));
const img='data:image/png;base64,'+b.toString('base64');
const image=`<image width="${diag.width}" height="${diag.height}" href="${img}"/>`;
const silhouette=`<svg viewBox="0 0 ${diag.width} ${diag.height}" width="100%"><defs><filter id="sil"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter></defs><g filter="url(#sil)">${image}</g></svg>`;
const actor=centers.map((x,i)=>`<rect x="${x-15}" y="${diag.bays[i].bottom-112/scale}" width="30" height="${112/scale}" fill="#fae98a" fill-opacity=".3" stroke="#fae98a" stroke-width="3"/>`).join('');
const atScale=`<svg width="${diag.width*scale}" height="${diag.height*scale}" viewBox="0 0 ${diag.width} ${diag.height}">${image}${actor}</svg>`;
let html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>Gate B 船体母版审核</title><style>body{font:16px/1.7 'Microsoft YaHei',sans-serif;background:#14212c;color:#eee;margin:24px}h1{font-size:24px}h2{font-size:19px}.view{padding:16px;margin:16px 0;overflow:auto}.gray{background:#777}.scene{background:linear-gradient(#334754 70%,#101923 71%)}.white{background:#ddd}img{max-width:100%}a{color:#8ce5ff}.warn{color:#ffb785}</style><h1>VS-ART-MASTER-01 · Gate B · 船体空壳母版</h1><p>Gate A 已批准；Gate B 获授权。当前素材状态：<b class="warn">REWORK，未通过</b>。无 Cocos 导入，无房间或怪物批量扩展。</p><h2>1 / 中灰底</h2><div class="view gray"><img src="${img}"></div><h2>2 / 场景明暗代理底</h2><p>仅检查深色背景分离度；不是实际游戏截图。</p><div class="view scene"><img src="${img}"></div><h2>3 / 逻辑尺寸检查</h2><p>1 CSS px = 1 逻辑 px，请以浏览器 100% 缩放查看。黄色框高 112px，仅是比例尺，不是船员素材。源舱格平均节距 ${pitch.toFixed(2)}px；按 Gate A 的 107.12 逻辑像素格宽等比缩放。舱口中心线净高为 ${logicalHeights.join(' / ')}px，尚低于 112px。</p><div class="view gray">${atScale}</div><h2>4 / 黑白剪影</h2><div class="view white">${silhouette}</div><h2>候选记录</h2>`;
for(const id of ids){html+=`<p>${id} · REWORK · <a href="../../source/vs_art_master_01/gate_b/${id}.png">原始透明 PNG</a> · <a href="../../manifests/${id}.json">完整提示词和生成记录</a></p>`;}
html+='<p><a href="gate_b_review_v001.md">验收与下一步</a></p></html>';
fs.writeFileSync(path.join(review,'gate_b_board_v001.html'),html);
const report=`# Gate B 首轮船体母版 · 2026-10-31\n\n结论：部分完成，素材 REWORK；Gate B 尚未通过。\n\n## 已执行\n\n- Gate A 批准与 Gate B 授权记录已保存，重新生成 Gate A 审核板也不会重置授权。\n- 使用内置 image_gen，生成船壳合成母版 1 张、透明前景框架 3 个版本，均保留原始文件，无像素后处理。未生产全部房间或怪物。\n- 每个版本保存完整提示词、参考链、SHA-256、输出标识和评审状态；工具未公开模型版本、seed、供应商任务 ID 与精确生成时间，相关项留空并记录缺口，不伪造。输出文件标识不是供应商任务 ID。\n- v003 四视图审核板已制作：灰底、场景明暗代理底、逻辑尺寸、剪影。场景代理底不替代真实游戏验收。\n\n## 验收\n\n| 项目 | 证据 / 结果 |\n|---|---|\n| 六舱口 | 图像目视六格；六处中心 Alpha 均为 0 |\n| 外部真实透明 | 原图边角 Alpha=0，非绘制棋盘格 |\n| 干净空壳 | 无人物、种植、炮、UI、家具，目视通过 |\n| v003 尺寸 | ${diag.width}×${diag.height}，源文件保存 |\n| 舱格等距 | 透明孔中心平均间距 ${pitch.toFixed(2)}px，仍存在偏差；非精确网格 |\n| 船员净高 | 以批准格宽等比缩放后，中心线净高 ${logicalHeights.join(' / ')} 逻辑像素，低于 112，未通过 |\n| 分层交付 | 前框架透明孔已形成；六舱后墙补板、前后结构拆分及全组装仍未完成 |\n| 母版完整性 | 当前仅船体结构候选，不能代表全套 Gate B（背景、角色、怪物、房间、UI 等）完成 |\n\nAlpha 检查脚本只读；中心线透明跨度不能替代全矩形净空、锚点、接缝或游戏内验证。每版像素尺寸变化也证明不能直接把不同版本叠放当作已对齐部件。\n\n## 收敛决定\n\n厚涂美术规范 §9：连续 3 轮仍无法通过时，停止微调并重新审视 Brief 或生成路线。本轮三版前框架均未通过角色净高，停止继续堆叠文字提示。下一步先制作精确几何底稿：六格 140×160、同一底线、112px 角色净空、遮挡梁柱避让，再以底稿作图像约束生成；不得通过缩小角色或非等比拉伸默默降低已批准标准。\n\n## 兼容与工作区\n\n配置/存档：无变化。性能/包体：无运行时变化，未执行引擎构建或真机测试。SSOT 无需变更，批准布局仍有效。文档仓库仅 assets/production 新增与修改，未提交；工程仓库未写入，既有 settings/扩展变更保留。未复制任何素材到 approved 或工程 assets/art。\n`;
fs.writeFileSync(path.join(review,'gate_b_review_v001.md'),report);
console.log(JSON.stringify({status:'REWORK',candidates:ids.length,pitch,logicalHeights,board:path.join(review,'gate_b_board_v001.html')},null,2));
