const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require(process.env.CODEX_NODE_MODULES?path.join(process.env.CODEX_NODE_MODULES,'sharp'):'C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const out=__dirname,root=path.resolve(out,'../../../../..'),rev=path.join(root,'assets/production/review/vs_art_master_01'),man=path.join(root,'assets/production/manifests');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const W=1672,H=941,base=read(path.join(out,'ship_lv1_layers_v005.json')),spec=read(path.join(out,'ship_lv1_geometry_v004.json'));
const oldFiles=fs.readdirSync(out).filter(f=>/v005/.test(f));const oldHashes=Object.fromEntries(oldFiles.map(f=>[f,hash(fs.readFileSync(path.join(out,f)))]));
const svg=b=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="1672" height="941" viewBox="0 0 1672 941">${b}</svg>`;
const data=b=>'data:image/png;base64,'+b.toString('base64');
(async()=>{
 const tex=await sharp(path.join(out,'ship_lv1_material_study_v006.png')).resize(1172,385,{fit:'fill'}).png().toBuffer();
 const texUrl=data(tex);let sourceDefs='',sourceGroups='',buffers=[],checks=[];
 for(const [i,layer] of base.layers.entries()){
  const key=layer.key,oldPng=fs.readFileSync(path.join(out,layer.png));
  const {data:old,info}=await sharp(oldPng).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const alpha=Buffer.alloc(W*H);for(let n=0;n<alpha.length;n++)alpha[n]=old[n*4+3];
  const mask=data(await sharp(alpha,{raw:{width:W,height:H,channels:1}}).png().toBuffer());
  const maskDef=`<mask id="frozen_${key}" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><image href="${mask}" width="1672" height="941"/></mask>`;
  // 只有色彩和光照图变化；最终Alpha直接从v005复制，含亚像素边缘。
  const shade=i===1?'.60':i===2?'.18':'.36';
  const localDefs=`<linearGradient id="volume_${key}" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="#e4bd7b" stop-opacity=".18"/><stop offset=".4" stop-color="#263946" stop-opacity="${shade}"/><stop offset=".85" stop-color="#0c1924" stop-opacity=".58"/><stop offset="1" stop-color="#61737a" stop-opacity=".32"/></linearGradient>`;
  let facets='';
  if(i===2){for(let n=0;n<7;n++){const x=550+140*n;facets+=`<path d="M${x-4} 580l2 43 -1 27 1 42" stroke="#c4a376" stroke-width="${n%2?2:3}" opacity=".5"/><path d="M${x+3} 589v${70+n*5}" stroke="#18232b" stroke-width="4" opacity=".6"/>`;}
   facets+='<path d="M543 560l196 1 74 -2 110 3 96 -1 211 1" stroke="#d5b17a" stroke-width="3" opacity=".6"/><path d="M564 735l107 -1 84 2 214 -1 106 2 190 -2" stroke="#7e9495" stroke-width="3" opacity=".5"/>';
  }
  const layerTexture=i===1?data(await sharp(tex).rotate(90).resize(1172,385).png().toBuffer()):texUrl;
  const paint=`<image href="${layerTexture}" x="362" y="410" width="1172" height="385"/><rect x="350" y="400" width="1200" height="410" fill="url(#volume_${key})"/>${i===1?'<rect x="550" y="570" width="840" height="163" fill="#111b23" opacity=".43"/>':i===2?'<rect x="535" y="550" width="870" height="198" fill="#b28a56" opacity=".25"/>':""}${facets}`;
  const painted=await sharp(Buffer.from(svg(`<defs>${localDefs}</defs>${paint}`))).removeAlpha().raw().toBuffer();
  const png=await sharp(painted,{raw:{width:W,height:H,channels:3}}).joinChannel(alpha,{raw:{width:W,height:H,channels:1}}).png().toBuffer();
  fs.writeFileSync(path.join(out,`ship_lv1_${key}_v006.png`),png);buffers.push(png);
  const raw=await sharp(png).ensureAlpha().raw().toBuffer();let differences=0;for(let n=0;n<alpha.length;n++)if(raw[n*4+3]!==alpha[n])differences++;
  const holes=spec.cells.map(c=>{let bad=0;for(let y=c.clear.y;y<c.clear.y+152;y++)for(let x=c.clear.x;x<c.clear.x+128;x++)if(raw[(y*W+x)*4+3]>0)bad++;return bad;});
  if(differences||layer.hard_clear&&holes.some(n=>n))throw Error('Frozen Alpha changed: '+key);
  checks.push({key,canvas:[info.width,info.height],alpha_differences_vs_v005:differences,clear_alpha_nonzero:layer.hard_clear?holes:'back wall intentionally opaque',pass:true});
  const group=`<g id="${key}" inkscape:groupmode="layer" inkscape:label="${layer.z} ${key}" mask="url(#frozen_${key})">${paint}</g>`;
  sourceDefs+=maskDef+localDefs;sourceGroups+=group;
  fs.writeFileSync(path.join(out,`ship_lv1_${key}_v006.svg`),svg(`<defs>${maskDef}${localDefs}</defs>${group}`));
 }
 fs.writeFileSync(path.join(out,'ship_lv1_hull_editable_v006.svg'),svg(`<defs>${sourceDefs}</defs>${sourceGroups}`));
 for(const ext of ['png','svg'])fs.copyFileSync(path.join(out,'ship_lv1_hard_mask_v005.'+ext),path.join(out,'ship_lv1_hard_mask_v006.'+ext));
 const layers=JSON.parse(JSON.stringify(base));layers.status='REVIEW';for(const l of layers.layers){l.png=l.png.replace('v005','v006');l.editable_svg=l.editable_svg.replace('v005','v006');}fs.writeFileSync(path.join(out,'ship_lv1_layers_v006.json'),JSON.stringify(layers,null,2));
 const assembled=await sharp({create:{width:W,height:H,channels:4,background:'#00000000'}}).composite(buffers.map(input=>({input}))).png().toBuffer();fs.writeFileSync(path.join(out,'ship_lv1_hull_assembled_v006.png'),assembled);
 const proxy=Buffer.from(svg('<rect width="1672" height="941" fill="#334754"/><rect y="730" width="1672" height="211" fill="#101923"/>'));
 for(const [name,bg,body]of [['gray','#777777',assembled],['proxy',proxy,assembled],['silhouette','#dddddd',buffers[0]]]){
  let fg=body;if(name==='silhouette'){const a=await sharp(body).extractChannel('alpha').toBuffer();fg=await sharp({create:{width:W,height:H,channels:3,background:'#000'}}).joinChannel(a).png().toBuffer();}
  const b=typeof bg==='string'?await sharp({create:{width:W,height:H,channels:4,background:bg}}).png().toBuffer():await sharp(bg).png().toBuffer();
  await sharp(await sharp(b).composite([{input:fg}]).png().toBuffer()).resize(1280,720,{fit:'contain',background:'#334754'}).png().toFile(path.join(rev,`material_v006_${name}_1280x720.png`));
 }
 await sharp(assembled).resize(1280,720,{fit:'contain'}).png().toFile(path.join(rev,'material_v006_logical_1280x720.png'));
 if(oldFiles.some(f=>hash(fs.readFileSync(path.join(out,f)))!==oldHashes[f]))throw Error('v005 changed');
 const result={status:'REVIEW',layers:checks,mask_byte_identical:hash(fs.readFileSync(path.join(out,'ship_lv1_hard_mask_v006.png')))===hash(fs.readFileSync(path.join(out,'ship_lv1_hard_mask_v005.png'))),canvas:base.canvas,origin:base.origin,cells_unchanged:JSON.stringify(layers.cells)===JSON.stringify(base.cells),hierarchy_unchanged:base.layers.every((l,i)=>l.key===layers.layers[i].key&&l.z===layers.layers[i].z),back_wall_bleed:layers.back_wall_bleed,old_v005_unchanged:true,clear_height_logical:152*spec.source_to_logical};
 fs.writeFileSync(path.join(rev,'material_v006_checks.json'),JSON.stringify(result,null,2));
 const artifacts=fs.readdirSync(out).filter(f=>f.includes('v006')).map(f=>({path:'assets/production/source/vs_art_master_01/gate_b/'+f,sha256:hash(fs.readFileSync(path.join(out,f)))}));
 fs.writeFileSync(path.join(man,'ship_lv1_hull_editable_v006.json'),JSON.stringify({task_id:'VS-ART-MATERIAL-01',asset_id:'ship_lv1_hull_editable',version:6,status:'REVIEW',generator:'Frozen v005 alpha plus painted material study, editable SVG masks and light overlays',generated_at:new Date().toISOString(),references:['ship_lv1_layers_v005.json','ship_lv1_hard_mask_v005.png','ship_lv1_material_study_v006.png','STYLE_SCENE_001_v001'],material_generation_manifest:'ship_lv1_material_study_v006.json',manual_edits:['仅RGB材质替换，逐层复制冻结Alpha','替换等距木纹与铆钉网格','左上暖面/船腹冷暗/水线湿反光','梁柱断续亮面，不改原有轮廓'],reviewer:'',review_notes:'Geometry pass. User material review pending; not APPROVED.',license_notes:'Generated material study based on internal style reference, no third-party texture download',artifacts},null,2));
 fs.writeFileSync(path.join(rev,'material_v006_board.html'),`<!doctype html><meta charset="utf-8"><title>v006 REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;background:#777}a{color:#8ce5ff}</style><h1>VS-ART-MATERIAL-01 · v006 · REVIEW</h1><p>只改材质与明暗。冻结Alpha逐像素一致，几何通过，材质待人工审核。100%缩放查看逻辑尺寸。</p><h2>中灰底</h2><img src="material_v006_gray_1280x720.png"><h2>场景代理回拼</h2><img src="material_v006_proxy_1280x720.png"><h2>逻辑尺寸</h2><img src="material_v006_logical_1280x720.png"><h2>黑白剪影</h2><img src="material_v006_silhouette_1280x720.png"><h2>v005 对照</h2><img src="editable_v005_gray_1280x720.png"><p><a href="material_v006_checks.json">冻结检查</a> · <a href="material_v006_handoff.md">交接报告</a></p>`);
 fs.writeFileSync(path.join(rev,'material_v006_handoff.md'),'# VS-ART-MATERIAL-01 v006\n\n任务：冻结几何下的暗黑厚涂材质迭代。\n结论：完成交付，REVIEW；材质待用户批准。\n改动文件：仅v006材质参考、分层SVG/透明PNG、层级JSON、遮罩副本、四视图、manifest与本报告。\n验证结果：三层Alpha逐像素与v005完全一致；前框与船壳六处Alpha>0全部0；画布1672×941、原点(970,730)、格坐标、中心距、底线、层级及3px后墙出血不变。硬遮罩PNG/SVG原样复制，旧v005哈希不变。\n材质：消除原等距线条和铆钉网格，采用厚涂材质参考与可编辑左上暖光、下腹冷暗、水线反光叠加。材质图仅作为颜色参考，不提供船框拓扑。\n配置/存档兼容性：无改动；SSOT无变化。\n性能与包体影响：未导入工程；源文件内嵌材质会增加源包大小，运行时包体/图集/Draw Call未变化且未实测。\n风险与未完成项：未APPROVED；材质/小尺寸可读性待人工评审，未做真机与动画验证。\n建议下一步：审核四视图和v005对照，再决定材质批准或明确返工项；不提前进入Cocos。\n');
 console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
