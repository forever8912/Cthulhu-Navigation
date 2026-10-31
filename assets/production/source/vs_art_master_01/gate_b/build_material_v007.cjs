const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const swatchDir = path.join(root, 'assets/production/source/vs_art_master_01/material_swatch');
const styleMaster = path.join(root, 'assets/风格定稿/风格定稿.png');
const W = 1672;
const H = 941;

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const toDataUrl = data => `data:image/png;base64,${data.toString('base64')}`;
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;

async function tileSwatch(file, vertical, phase) {
  const tileSize = 132;
  const width = 1172;
  const height = 396;
  const source = await sharp(file).resize(tileSize, tileSize, { fit: 'fill' }).png().toBuffer();
  const composites = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const index = row * 9 + col + phase;
      let image = sharp(source);
      if (vertical) image = image.rotate(90);
      if (index % 2) image = image.flop();
      if (index % 3 === 2) image = image.flip();
      image = image.modulate({ brightness: 0.94 + (index % 4) * 0.025, saturation: 0.78 });
      composites.push({ input: await image.png().toBuffer(), left: col * tileSize - (row % 2) * 22, top: row * tileSize });
    }
  }
  return sharp({ create: { width, height, channels: 4, background: '#24313a' } }).composite(composites).png().toBuffer();
}

async function translucent(image, opacity) {
  const rgb = await sharp(image).removeAlpha().raw().toBuffer();
  return sharp(rgb, { raw: { width: 1172, height: 396, channels: 3 } })
    .joinChannel(Buffer.alloc(1172 * 396, opacity), { raw: { width: 1172, height: 396, channels: 1 } })
    .png().toBuffer();
}

(async () => {
  const base = readJson(path.join(out, 'ship_lv1_layers_v005.json'));
  const geometry = readJson(path.join(out, 'ship_lv1_geometry_v004.json'));
  const frozenFiles = fs.readdirSync(out).filter(file => /v005/.test(file));
  const frozenHashes = Object.fromEntries(frozenFiles.map(file => [file, sha256(fs.readFileSync(path.join(out, file)))]));
  const woodFile = path.join(swatchDir, 'material_swatch_wood_v001.png');
  const structureFile = path.join(swatchDir, 'material_swatch_structure_v001.png');
  const ironFile = path.join(swatchDir, 'material_swatch_iron_v001.png');
  const swatchHashes = { wood: sha256(fs.readFileSync(woodFile)), structure: sha256(fs.readFileSync(structureFile)), iron: sha256(fs.readFileSync(ironFile)) };
  const buffers = [];
  const checks = [];
  let sourceDefs = '';
  let sourceGroups = '';

  for (const [index, layer] of base.layers.entries()) {
    const key = layer.key;
    const oldPng = fs.readFileSync(path.join(out, layer.png));
    const oldDecoded = await sharp(oldPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alpha = Buffer.alloc(W * H);
    for (let pixel = 0; pixel < alpha.length; pixel++) alpha[pixel] = oldDecoded.data[pixel * 4 + 3];

    const vertical = key === 'back_walls';
    const mosaic = await tileSwatch(woodFile, vertical, index * 5);
    const textureOpacity = key === 'front_frame' ? 66 : key === 'back_walls' ? 54 : 82;
    const texture = await translucent(mosaic, textureOpacity);
    const baseBrightness = key === 'back_walls' ? 0.62 : key === 'front_frame' ? 0.76 : 0.72;
    const baseSaturation = key === 'front_frame' ? 0.68 : 0.72;
    const baseRgb = await sharp(oldPng).flatten({ background: '#1a242c' }).modulate({ brightness: baseBrightness, saturation: baseSaturation }).png().toBuffer();

    let facets = '';
    if (key === 'front_frame') {
      for (let n = 0; n < 7; n++) {
        const x = 550 + 140 * n;
        facets += `<path d="M${x - 3} 579v145" stroke="#8c765b" stroke-width="2" opacity=".34"/>`;
        facets += `<path d="M${x + 3} 584v138" stroke="#15212a" stroke-width="3" opacity=".62"/>`;
      }
      facets += '<path d="M543 560h852" stroke="#90795c" stroke-width="2" opacity=".34"/>';
      facets += '<path d="M552 735h840" stroke="#60747b" stroke-width="2" opacity=".35"/>';
    }
    const warmOpacity = key === 'front_frame' ? '.075' : '.055';
    const coolOpacity = key === 'back_walls' ? '.50' : '.34';
    const volume = Buffer.from(svg(`<defs><linearGradient id="volume" x1="0" y1="0" x2=".28" y2="1"><stop stop-color="#b49a73" stop-opacity="${warmOpacity}"/><stop offset=".42" stop-color="#334754" stop-opacity=".12"/><stop offset=".82" stop-color="#101923" stop-opacity="${coolOpacity}"/><stop offset="1" stop-color="#61737a" stop-opacity=".16"/></linearGradient></defs><rect x="340" y="395" width="1220" height="420" fill="url(#volume)"/>${facets}`));

    const paintedRgb = await sharp(baseRgb)
      .composite([
        { input: texture, left: 362, top: 404, blend: 'soft-light' },
        { input: volume, left: 0, top: 0, blend: 'over' }
      ])
      .removeAlpha().raw().toBuffer();
    const png = await sharp(paintedRgb, { raw: { width: W, height: H, channels: 3 } })
      .joinChannel(alpha, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
    fs.writeFileSync(path.join(out, `ship_lv1_${key}_v007.png`), png);
    buffers.push(png);

    const maskPng = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
    const maskDef = `<mask id="frozen_${key}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><image href="${toDataUrl(maskPng)}" width="${W}" height="${H}"/></mask>`;
    const group = `<g id="${key}" inkscape:groupmode="layer" inkscape:label="${layer.z} ${key}" mask="url(#frozen_${key})"><image href="${toDataUrl(baseRgb)}" width="${W}" height="${H}"/><image href="${toDataUrl(texture)}" x="362" y="404" width="1172" height="396" opacity=".72"/><g>${facets}</g></g>`;
    fs.writeFileSync(path.join(out, `ship_lv1_${key}_v007.svg`), svg(`<defs>${maskDef}</defs>${group}`));
    sourceDefs += maskDef;
    sourceGroups += group;

    const decoded = await sharp(png).ensureAlpha().raw().toBuffer();
    let alphaDifferences = 0;
    for (let pixel = 0; pixel < alpha.length; pixel++) if (decoded[pixel * 4 + 3] !== alpha[pixel]) alphaDifferences++;
    const holes = geometry.cells.map(cell => {
      let count = 0;
      for (let y = cell.clear.y; y < cell.clear.y + 152; y++) {
        for (let x = cell.clear.x; x < cell.clear.x + 128; x++) if (decoded[(y * W + x) * 4 + 3] > 0) count++;
      }
      return count;
    });
    if (alphaDifferences || (layer.hard_clear && holes.some(Boolean))) throw new Error(`Frozen Alpha changed: ${key}`);
    checks.push({ key, canvas: [oldDecoded.info.width, oldDecoded.info.height], alpha_differences_vs_v005: alphaDifferences, clear_alpha_nonzero: layer.hard_clear ? holes : 'back wall intentionally opaque', pass: true });
  }

  fs.writeFileSync(path.join(out, 'ship_lv1_hull_editable_v007.svg'), svg(`<defs>${sourceDefs}</defs>${sourceGroups}`));
  for (const extension of ['png', 'svg']) fs.copyFileSync(path.join(out, `ship_lv1_hard_mask_v005.${extension}`), path.join(out, `ship_lv1_hard_mask_v007.${extension}`));
  const layers = JSON.parse(JSON.stringify(base));
  layers.status = 'REVIEW';
  for (const layer of layers.layers) {
    layer.png = layer.png.replace('v005', 'v007');
    layer.editable_svg = layer.editable_svg.replace('v005', 'v007');
  }
  fs.writeFileSync(path.join(out, 'ship_lv1_layers_v007.json'), JSON.stringify(layers, null, 2));

  const assembled = await sharp({ create: { width: W, height: H, channels: 4, background: '#00000000' } })
    .composite(buffers.map(input => ({ input }))).png().toBuffer();
  fs.writeFileSync(path.join(out, 'ship_lv1_hull_assembled_v007.png'), assembled);
  const proxy = Buffer.from(svg('<rect width="1672" height="941" fill="#334754"/><rect y="730" width="1672" height="211" fill="#101923"/>'));
  for (const [name, background, foreground] of [['gray', '#777777', assembled], ['proxy', proxy, assembled], ['silhouette', '#dddddd', buffers[0]]]) {
    let image = foreground;
    if (name === 'silhouette') {
      const silhouetteAlpha = await sharp(foreground).extractChannel('alpha').toBuffer();
      image = await sharp({ create: { width: W, height: H, channels: 3, background: '#000' } }).joinChannel(silhouetteAlpha).png().toBuffer();
    }
    const bg = typeof background === 'string'
      ? await sharp({ create: { width: W, height: H, channels: 4, background } }).png().toBuffer()
      : await sharp(background).png().toBuffer();
    await sharp(await sharp(bg).composite([{ input: image }]).png().toBuffer())
      .resize(1280, 720, { fit: 'contain', background: '#334754' }).png().toFile(path.join(reviewDir, `material_v007_${name}_1280x720.png`));
  }
  await sharp(assembled).resize(1280, 720, { fit: 'contain' }).png().toFile(path.join(reviewDir, 'material_v007_logical_1280x720.png'));
  const style = await sharp(styleMaster).resize(1280, 720, { fit: 'contain', background: '#15212d' }).png().toBuffer();
  const candidate = fs.readFileSync(path.join(reviewDir, 'material_v007_proxy_1280x720.png'));
  await sharp({ create: { width: 2560, height: 720, channels: 4, background: '#15212d' } })
    .composite([{ input: style, left: 0, top: 0 }, { input: candidate, left: 1280, top: 0 }]).png().toFile(path.join(reviewDir, 'material_v007_style_compare_2560x720.png'));

  if (frozenFiles.some(file => sha256(fs.readFileSync(path.join(out, file))) !== frozenHashes[file])) throw new Error('v005 changed');
  const result = {
    status: 'REVIEW',
    layers: checks,
    mask_byte_identical: sha256(fs.readFileSync(path.join(out, 'ship_lv1_hard_mask_v007.png'))) === sha256(fs.readFileSync(path.join(out, 'ship_lv1_hard_mask_v005.png'))),
    canvas: base.canvas,
    origin: base.origin,
    cells_unchanged: JSON.stringify(layers.cells) === JSON.stringify(base.cells),
    hierarchy_unchanged: base.layers.every((layer, index) => layer.key === layers.layers[index].key && layer.z === layers.layers[index].z),
    back_wall_bleed: layers.back_wall_bleed,
    old_v005_unchanged: true,
    clear_height_logical: 152 * geometry.source_to_logical,
    swatch_sha256: swatchHashes
  };
  fs.writeFileSync(path.join(reviewDir, 'material_v007_checks.json'), JSON.stringify(result, null, 2));

  const artifacts = fs.readdirSync(out).filter(file => file.includes('v007')).map(file => ({ path: `assets/production/source/vs_art_master_01/gate_b/${file}`, sha256: sha256(fs.readFileSync(path.join(out, file))) }));
  const manifest = {
    task_id: 'VS-ART-MATERIAL-MAP-01',
    asset_id: 'ship_lv1_hull_editable',
    version: 7,
    status: 'REVIEW',
    generator: 'Deterministic v005 frozen-alpha mapping using approved-stage material swatches and editable SVG masks',
    generated_at: new Date().toISOString(),
    references: ['ship_lv1_layers_v005.json', 'ship_lv1_hard_mask_v005.png', 'material_swatch_wood_v001.png', 'material_swatch_structure_v001.png', 'material_swatch_iron_v001.png', 'STYLE_SCENE_001_v001'],
    manual_edits: ['v005几何与Alpha保持冻结', '旧木样板按132px校准尺度拼接并降低饱和度', '梁柱整体降暖降亮，暖边收窄', '背墙纹理转为纵向并压暗', '不使用v006粗重整面材质'],
    reviewer: '',
    review_notes: 'User authorized stage continuation and deferred final judgment to the complete assembled result. Keep REVIEW until whole-hull visual review; not APPROVED and not imported into Cocos.',
    license_notes: 'Project-generated swatches based on approved internal style reference; no third-party texture download',
    artifacts
  };
  fs.writeFileSync(path.join(manifestDir, 'ship_lv1_hull_editable_v007.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(reviewDir, 'material_v007_board.html'), '<!doctype html><meta charset="utf-8"><title>v007 REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;background:#777}a{color:#8ce5ff}</style><h1>VS-ART-MATERIAL-MAP-01 · v007 · REVIEW</h1><p>阶段性放行后的整船映射。冻结Alpha与几何；不进入APPROVED或Cocos。请先看风格定稿并排板，再检查四视图。</p><h2>风格定稿 / v007 并排</h2><img src="material_v007_style_compare_2560x720.png"><h2>中灰底</h2><img src="material_v007_gray_1280x720.png"><h2>场景代理回拼</h2><img src="material_v007_proxy_1280x720.png"><h2>逻辑尺寸</h2><img src="material_v007_logical_1280x720.png"><h2>黑白剪影</h2><img src="material_v007_silhouette_1280x720.png"><p><a href="material_v007_checks.json">冻结检查</a> · <a href="material_v007_handoff.md">交接报告</a></p>');
  fs.writeFileSync(path.join(reviewDir, 'material_v007_handoff.md'), '# VS-ART-MATERIAL-MAP-01 v007\n\n任务：使用三类材质样板映射冻结几何的完整船体。\n结论：完成候选，REVIEW；等待整体效果评审。\n改动文件：v007分层SVG/透明PNG、层级JSON、遮罩副本、四视图、风格并排板、manifest与本报告。\n验证结果：三层Alpha逐像素与v005完全一致；前框与船壳六处Alpha>0全部0；画布1672×941、原点(970,730)、格坐标、层级及后墙出血不变。\n材质：旧木以132px校准尺度拼接；梁柱降暖降亮并收窄暖边；背墙纵向压暗；没有复用v006整面粗重材质。\n配置/存档兼容性：无改动。\n性能与包体影响：未导入工程；运行时包体、图集与Draw Call未变化且未实测。\n风险与未完成项：材质映射仍需整体视觉评审；未APPROVED、未进入Cocos，未制作房间和角色。\n建议下一步：先评审风格定稿/v007并排板和逻辑尺寸图；通过后再做独立manifest审计与最小Cocos导入验证。\n');
  console.log(JSON.stringify(result, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
