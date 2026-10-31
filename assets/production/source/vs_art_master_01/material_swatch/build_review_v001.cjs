const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const out=__dirname,root=path.resolve(out,'../../../../..'),rev=path.join(root,'assets/production/review/vs_art_master_01'),man=path.join(root,'assets/production/manifests');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const keys=['wood','structure','iron'],titles=['旧木板材','梁柱 / 结构边','少量锈铁'];
const ids=read(path.join(out,'generation_outputs_v001.json'));
(async()=>{
 const overlays=[];let texts='<text x="24" y="34" font-size="22">材质样板 v001 · REVIEW · 等尺度对照</text><text x="24" y="62" font-size="14">左：风格定稿原生192px裁切　右：按构件宽度估测缩放；不用于整船映射</text>';
 let html='<!doctype html><meta charset="utf-8"><title>Material Swatches v001</title><style>body{background:#15212d;color:#eee;font:16px/1.7 "Microsoft YaHei",sans-serif;margin:24px}h1{font-size:24px}.row{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0}img{image-rendering:auto}a{color:#8ce5ff}.detail{max-width:640px;width:100%}</style><h1>VS-ART-MATERIAL-SWATCH-01 · REVIEW</h1><p>以浏览器100%缩放查看。左图为定稿原生192×192像素裁切，右图为按构件宽度估测缩放后置入192×192窗口的样板：旧木132px、梁柱72px、铁件81px。分别参照约20px板高、15px梁厚、19px铁条宽。该校准为目视估测，需人工复核，不是几何验收数据。裁切仅用于评审。</p>';
 for(let i=0;i<keys.length;i++){
  const key=keys[i],src=path.join(out,'material_swatch_'+key+'_v001.png'),ref=path.join(out,'reference_'+key+'_v001.png');
  const source=fs.readFileSync(src),meta=await sharp(source).metadata();
  const size=[132,72,81][i];
  const reduced=await sharp(source).resize(size,size,{fit:'contain',background:'#243340'}).png().toBuffer();
  const sample=await sharp({create:{width:192,height:192,channels:4,background:'#243340'}}).composite([{input:reduced,left:Math.floor((192-size)/2),top:Math.floor((192-size)/2)}]).png().toBuffer();
  fs.writeFileSync(path.join(rev,'swatch_'+key+'_192_v001.png'),sample);
  const y=120+i*258;texts+=`<text x="24" y="${y-20}" font-size="18">${i+1}. ${titles[i]}</text><text x="24" y="${y+216}" font-size="13">定稿：192×192原生裁切</text><text x="252" y="${y+216}" font-size="13">候选内容：${size}px；192px窗口</text>`;
  overlays.push({input:fs.readFileSync(ref),left:24,top:y},{input:sample,left:252,top:y});
  html+=`<h2>${titles[i]}</h2><div class="row"><figure><img width="192" height="192" src="../../source/vs_art_master_01/material_swatch/reference_${key}_v001.png"><figcaption>风格定稿局部 / 原生尺寸</figcaption></figure><figure><img width="192" height="192" src="swatch_${key}_192_v001.png"><figcaption>样板 / 按构件宽度校准</figcaption></figure></div><details><summary>查看候选细节（放大，仅供辅助）</summary><img class="detail" src="../../source/vs_art_master_01/material_swatch/material_swatch_${key}_v001.png"></details>`;
  const m=path.join(man,'material_swatch_'+key+'_v001.json'),j=read(m);Object.assign(j,{status:'REVIEW',output_artifact_id:ids[key],provider_task_id:null,sha256:hash(source),reference_sha256:hash(fs.readFileSync(ref)),pixel_size:[meta.width,meta.height],source_path:'assets/production/source/vs_art_master_01/material_swatch/material_swatch_'+key+'_v001.png',manual_edits:['源图未做像素修改；仅审核副本缩至192×192'],review_notes:'Pending user style review. No full-hull mapping. Tool does not expose model/version/seed/provider task ID; output artifact ID retained, not presented as provider ID.'});fs.writeFileSync(m,JSON.stringify(j,null,2));
 }
 const labels=Buffer.from(`<svg width="480" height="900" xmlns="http://www.w3.org/2000/svg"><g fill="#eee" font-family="Microsoft YaHei,sans-serif">${texts}</g></svg>`);
 await sharp({create:{width:480,height:900,channels:4,background:'#15212d'}}).composite([...overlays,{input:labels}]).png().toFile(path.join(rev,'material_swatch_comparison_v001.png'));
 html+='<p>审核重点：灰褐/蓝灰基调、结构边粗细变化、笔触服从板材、小范围锈蚀与暖光。当前三个样板均为 REVIEW；用户批准前，v007整船映射关闭。</p>';
 fs.writeFileSync(path.join(rev,'material_swatch_board_v001.html'),html);
 fs.writeFileSync(path.join(rev,'material_swatch_review_v001.md'),'# VS-ART-MATERIAL-SWATCH-01\n\n任务：三种小块材质样板与定稿同尺度对照。\n结论：样板交付完成，全部REVIEW，等待用户逐项评审，不预判PASS。\n改动文件：三张独立原始样板、三张定稿评审裁切、裁切坐标JSON、192px审核副本、PNG/HTML并排板、三个manifest及本报告。\n验证结果：三图可解码，源尺寸/提示词/参考/输出标识/SHA-256已保存；对照板参考保持原生192px，候选按主构件宽度估测等比校准后放入192px窗口；校准依据为约20px板高、15px梁厚、19px铁条宽。源图未做像素修改。参考局部含少量场景元素，不是纯材质测量图；同窗口对照仍需人工核对板材宽度和笔触尺度。\n评审项：1.旧木是否以灰褐、蓝灰为主且纹理不跨结构；2.梁柱转折是否清楚且结构边有粗细变化；3.铁件锈蚀是否局部且无大片橙金色。任何一项未获用户批准，保持REVIEW或转REWORK。\n配置/存档兼容性：无改动，冻结几何及层级未修改。\n性能与包体影响：没有运行时资源导入；无包体、Draw Call变化。\n风险与未完成项：风格一致性尚待用户判定；工具未公开模型版本、seed和供应商任务ID，输出标识不能替代供应商任务ID，已如实保留缺口。\n建议下一步：用户评审三个样板；明确批准后才开放v007完整映射。未进入approved、Cocos或扩展内容。此前v006评审板与交接修正保留。新增样板未提交。\n');
 console.log('PASS: 3 source images, 3 manifests, 192px comparison board; status REVIEW; full mapping closed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
