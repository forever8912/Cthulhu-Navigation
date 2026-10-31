// 固定几何的正向矢量母版。没有从失败候选或场景中裁切像素。
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require(process.env.CODEX_NODE_MODULES?path.join(process.env.CODEX_NODE_MODULES,'sharp'):'C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../../../../..'),out=__dirname,review=path.join(root,'assets/production/review/vs_art_master_01'),man=path.join(root,'assets/production/manifests');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const spec=read(path.join(out,'ship_lv1_geometry_v004.json'));
const W=1672,H=941,origin={x:970,y:730};
const holes=spec.cells.map(c=>`<rect x="${c.clear.x}" y="${c.clear.y}" width="128" height="152" fill="black"/>`).join('');
const hull='M362 435 Q415 457 540 510 L1230 510 L1230 410 L1534 410 L1510 740 Q1460 785 1390 795 L550 795 Q468 772 440 730 Q398 596 362 435Z';
const defs=`<defs><mask id="hard_clear" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><rect width="1672" height="941" fill="white"/>${holes}</mask><clipPath id="hull_clip"><path d="${hull}"/></clipPath><linearGradient id="wood" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#8b7053"/><stop offset=".38" stop-color="#574333"/><stop offset="1" stop-color="#27313a"/></linearGradient><linearGradient id="wall" x2=".8" y2="1"><stop stop-color="#534637"/><stop offset="1" stop-color="#242b2e"/></linearGradient></defs>`;
const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}</svg>`;
let seed=5001;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let grain='';for(let i=0;i<2100;i++){const x=360+random()*1180,y=410+random()*390,l=5+random()*85;grain+=`<path d="M${x.toFixed(2)} ${y.toFixed(2)} q${(l*.45).toFixed(2)} ${(random()*4-2).toFixed(2)} ${l.toFixed(2)} ${(random()*3-1.5).toFixed(2)}" fill="none" stroke="${i%3?'#ba9767':'#14232c'}" stroke-width="${(.5+random()*2.2).toFixed(2)}" opacity="${(.04+random()*.15).toFixed(2)}"/>`;}
let planks='';for(let y=423;y<800;y+=23){planks+=`<path d="M350 ${y} Q900 ${y+9} 1540 ${y-2}" fill="none" stroke="#182126" stroke-width="3"/><path d="M350 ${y+3} Q900 ${y+12} 1540 ${y+1}" fill="none" stroke="#b08c5e" opacity=".3"/>`;for(let x=390+(y%3)*56;x<1540;x+=180)planks+=`<path d="M${x} ${y+2}l-3 20" stroke="#1f292e" stroke-width="2"/><circle cx="${x+7}" cy="${y+9}" r="2" fill="#b39770" opacity=".5"/>`;}
const timber=`<path d="${hull}" fill="url(#wood)"/><g clip-path="url(#hull_clip)">${planks}${grain}</g>`;
let beams='<path d="M535 566H1400M550 737H1395" stroke="#211f1c" stroke-width="16"/><path d="M535 560H1400M550 732H1395" stroke="#8c6c48" stroke-width="6"/>';
for(let x=550;x<=1390;x+=140)beams+=`<path d="M${x} 570V730" stroke="#302b24" stroke-width="12"/><path d="M${x-3} 570V730" stroke="#a08057" stroke-width="3"/><rect x="${x-5}" y="570" width="10" height="8" fill="#493a35"/><circle cx="${x}" cy="574" r="2" fill="#ac9170"/>`;
const front=`<g id="front_frame" inkscape:groupmode="layer" inkscape:label="100 前框：硬净空遮罩" mask="url(#hard_clear)">${beams}</g>`;
const shell=`<g id="hull_body" inkscape:groupmode="layer" inkscape:label="050 船壳主体" mask="url(#hard_clear)">${timber}</g>`;
let back='';for(const c of spec.cells){let lines='';for(let x=c.clear.x;x<c.clear.x+128;x+=16)lines+=`<path d="M${x} 575V733" stroke="#192226" stroke-width="2"/><path d="M${x+3} 575V733" stroke="#a4865e" opacity=".18"/>`;back+=`<g id="back_wall_${c.index}" inkscape:groupmode="layer" inkscape:label="060 后墙${c.index}"><rect x="${c.clear.x-3}" y="575" width="134" height="158" fill="url(#wall)"/>${lines}</g>`;}
const structural=svg(`<g mask="url(#hard_clear)"><path d="${hull}" fill="#635548"/></g>`);
async function png(name,xml){await sharp(Buffer.from(xml)).png().toFile(path.join(out,name));}
async function check(name){const {data,info}=await sharp(path.join(out,name)).ensureAlpha().raw().toBuffer({resolveWithObject:true});const counts=spec.cells.map(c=>{let bad=0;for(let y=c.clear.y;y<c.clear.y+152;y++)for(let x=c.clear.x;x<c.clear.x+128;x++)if(data[(y*W+x)*4+3]>0)bad++;return bad;});if(info.width!==W||info.height!==H||counts.some(n=>n))throw Error(name+' violates hard alpha');return {file:name,canvas:[info.width,info.height],alpha_greater_than_zero:counts,pass:true};}
(async()=>{
 // 结构检查是材质导出的前置条件。
 await png('ship_lv1_hull_structure_v005.png',structural);
 const structure=await check('ship_lv1_hull_structure_v005.png');
 fs.writeFileSync(path.join(out,'ship_lv1_hull_structure_v005.svg'),structural);
 fs.writeFileSync(path.join(out,'ship_lv1_hull_editable_v005.svg'),svg(shell+back+front));
 fs.writeFileSync(path.join(out,'ship_lv1_hard_mask_v005.svg'),svg(`<rect width="1672" height="941" fill="white" mask="url(#hard_clear)"/>`));
 await png('ship_lv1_hard_mask_v005.png',svg(`<rect width="1672" height="941" fill="white" mask="url(#hard_clear)"/>`));
 const layers=[['hull_body',shell,50],['back_walls',back,60],['front_frame',front,100]];
 for(const [key,body] of layers){fs.writeFileSync(path.join(out,`ship_lv1_${key}_v005.svg`),svg(body));await png(`ship_lv1_${key}_v005.png`,svg(body));}
 await png('ship_lv1_hull_assembled_v005.png',svg(shell+back+front));
 const checks={status:'REVIEW',structure,frame:await check('ship_lv1_front_frame_v005.png'),hull:await check('ship_lv1_hull_body_v005.png'),mask:await check('ship_lv1_hard_mask_v005.png'),geometry_match:spec.cells.every((c,i)=>c.x===550+140*i&&c.y===570&&c.width===140&&c.height===160&&c.foot.y===730),origin,source_to_logical:spec.source_to_logical,clear_height_logical:152*spec.source_to_logical,note:'后墙及合成图按设计填入背景，不适用前框零Alpha断言。仅几何通过；材质尚待用户评审。'};
 fs.writeFileSync(path.join(review,'editable_v005_checks.json'),JSON.stringify(checks,null,2));
 const layerJson={status:'REVIEW',canvas:spec.canvas,origin,source_geometry:'ship_lv1_geometry_v004.json',cells:spec.cells,layers:layers.map(([key,,z])=>({key,z,canvas:spec.canvas,origin,png:`ship_lv1_${key}_v005.png`,editable_svg:`ship_lv1_${key}_v005.svg`,hard_clear:key!=='back_walls'})),back_wall_bleed:3};
 fs.writeFileSync(path.join(out,'ship_lv1_layers_v005.json'),JSON.stringify(layerJson,null,2));
 const neutral='<rect width="1672" height="941" fill="#777"/>',proxy='<rect width="1672" height="941" fill="#334754"/><path d="M0 730H1672V941H0Z" fill="#101923"/>';
 for(const [name,bg,body] of [['gray',neutral,shell+back+front],['proxy',proxy,shell+back+front],['silhouette','<rect width="1672" height="941" fill="white"/>',`<g mask="url(#hard_clear)"><path d="${hull}" fill="black"/></g>`]])await sharp(Buffer.from(svg(bg+body))).resize(1280,720,{fit:'contain',background:'#334754'}).png().toFile(path.join(review,`editable_v005_${name}_1280x720.png`));
 const refs=['assets/风格定稿/风格定稿.png','assets/production/source/vs_art_master_01/gate_b/ship_lv1_geometry_v004.json'];
 const artifacts=fs.readdirSync(out).filter(f=>f.includes('v005')).map(f=>({path:'assets/production/source/vs_art_master_01/gate_b/'+f,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(out,f))).digest('hex')}));
 fs.writeFileSync(path.join(man,'ship_lv1_hull_editable_v005.json'),JSON.stringify({task_id:'VS-ART-EDITABLE-01',asset_id:'ship_lv1_hull_editable',version:5,status:'REVIEW',generator:'deterministic editable SVG; sharp PNG rasterization',model:null,seed:5001,prompt:null,negative_prompt:null,generated_at:new Date().toISOString(),references:refs,manual_edits:['正向构建固定几何','结构版检查通过后绘制独立木纹笔触与明暗','前框与船壳统一应用硬遮罩','未裁切任何旧候选'],license_notes:'Project-authored vector geometry and procedural strokes. Internal style reference only; no sampled third-party pixels.',reviewer:'',review_notes:'Geometry PASS; material review pending. No Cocos or approved writes.',artifacts},null,2));
 const html=`<!doctype html><meta charset="utf-8"><title>v005 REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;background:#777}a{color:#8de6ff}</style><h1>VS-ART-EDITABLE-01 · v005 · REVIEW</h1><p>几何与硬Alpha通过；材质为可编辑木纹/明暗初稿，待人工风格审核。无角色或房间内容烘焙。</p><h2>中灰底 / 逻辑尺寸 1280×720</h2><img src="editable_v005_gray_1280x720.png"><h2>场景代理回拼</h2><img src="editable_v005_proxy_1280x720.png"><h2>黑白剪影（六孔）</h2><img src="editable_v005_silhouette_1280x720.png"><p><a href="../../source/vs_art_master_01/gate_b/ship_lv1_hull_editable_v005.svg">可编辑分层母版</a> · <a href="editable_v005_checks.json">自动检查</a></p>`;
 fs.writeFileSync(path.join(review,'editable_v005_board.html'),html);
 fs.writeFileSync(path.join(review,'editable_v005_handoff.md'),`# VS-ART-EDITABLE-01 v005\n\n任务：固定几何分层母版。\n结论：完成交付，状态 REVIEW（非 APPROVED）。\n改动文件：v005 SVG、同画布结构/船壳/后墙/前框/遮罩PNG、层级JSON、审核PNG/HTML、manifest。\n验证结果：先结构检查，再材质导出；结构、前框、船壳、硬遮罩六孔 Alpha>0 计数均为0；画布1672×941，共同原点(970,730)，六格140×160源px、中心距140、底线730。净空128×152源px，逻辑高116.30≥112。后墙独立且有3px出血，合成图显示后墙是预期。\n配置/存档兼容性：无改动，Gate A及v004坐标未改变。\n性能与包体影响：未导入游戏；运行时无变化，图集/Draw Call/帧率尚未验证。\n风险与未完成项：木纹与明暗为原生矢量笔触初稿，厚涂观感仍需人工审核，不能以几何通过替代风格批准。未执行真机、动画接缝验收。未覆盖v004及更早文件；文档新增文件未提交，代码仓库未写入。\n建议下一步：交WorkBuddy审计manifest，用户评审材质与回拼；未APPROVED前不启动工程导入。\n`);
 console.log(JSON.stringify(checks,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
