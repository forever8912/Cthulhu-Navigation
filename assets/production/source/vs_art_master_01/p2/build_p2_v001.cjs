const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const gateB = path.join(root, 'assets/production/source/vs_art_master_01/gate_b');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const roomSheet = path.join(out, 'room_1001_power_v001.png');
const harpoonSheet = path.join(out, 'room_2001_harpoon_parts_v001.png');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function cropTrim(source, rect, target) {
  try {
    const cropped = rect ? await sharp(source).extract(rect).png().toBuffer() : fs.readFileSync(source);
    await sharp(cropped).trim({ background: '#00000000', threshold: 8 }).png().toFile(target);
  } catch (error) {
    throw new Error(`crop failed: ${path.basename(target)} ${JSON.stringify(rect)}: ${error.message}`);
  }
}

async function fit(file, width, height) {
  return sharp(file).resize(width, height, { fit: 'contain', background: '#00000000' }).png().toBuffer();
}

(async () => {
  const roomModule = path.join(out, 'room_1001_power_module_v001.png');
  const parts = {
    base: { rect: { left: 100, top: 120, width: 780, height: 390 }, file: path.join(out, 'room_2001_base_v001.png') },
    launcher: { rect: { left: 830, top: 70, width: 900, height: 350 }, file: path.join(out, 'room_2001_launcher_v001.png') },
    harpoon: { rect: { left: 460, top: 450, width: 1190, height: 220 }, file: path.join(out, 'room_2001_harpoon_v001.png') },
    rope: { rect: { left: 40, top: 600, width: 1440, height: 230 }, file: path.join(out, 'room_2001_rope_v001.png') },
    effect: { rect: { left: 1320, top: 620, width: 454, height: 267 }, file: path.join(out, 'room_2001_effect_v001.png') }
  };
  await cropTrim(roomSheet, null, roomModule);
  for (const part of Object.values(parts)) await cropTrim(harpoonSheet, part.rect, part.file);

  const hullBody = fs.readFileSync(path.join(gateB, 'ship_lv1_hull_body_v007.png'));
  const backWalls = fs.readFileSync(path.join(gateB, 'ship_lv1_back_walls_v007.png'));
  const frontFrame = fs.readFileSync(path.join(gateB, 'ship_lv1_front_frame_v007.png'));
  const room = await fit(roomModule, 272, 152);
  const base = await fit(parts.base.file, 110, 70);
  const launcher = await fit(parts.launcher.file, 118, 48);
  const harpoon = await fit(parts.harpoon.file, 105, 27);
  const rope = await fit(parts.rope.file, 100, 22);
  const effect = await fit(parts.effect.file, 44, 32);
  const blank = await sharp({ create: { width: 1672, height: 941, channels: 4, background: '#00000000' } }).png().toBuffer();

  const common = [
    { input: hullBody, left: 0, top: 0 },
    { input: backWalls, left: 0, top: 0 },
    { input: room, left: 554, top: 574 },
    { input: base, left: 845, top: 655 },
    { input: launcher, left: 842, top: 620 },
    { input: harpoon, left: 858, top: 620 },
    { input: rope, left: 850, top: 665 },
    { input: frontFrame, left: 0, top: 0 }
  ];
  const idle = await sharp(blank).composite(common).png().toBuffer();
  const action = await sharp(blank).composite([
    { input: hullBody, left: 0, top: 0 },
    { input: backWalls, left: 0, top: 0 },
    { input: room, left: 554, top: 574 },
    { input: base, left: 845, top: 655 },
    { input: launcher, left: 842, top: 620 },
    { input: rope, left: 885, top: 630 },
    { input: harpoon, left: 1000, top: 612 },
    { input: effect, left: 1100, top: 606 },
    { input: frontFrame, left: 0, top: 0 }
  ]).png().toBuffer();
  fs.writeFileSync(path.join(out, 'p2_assembled_idle_v001.png'), idle);
  fs.writeFileSync(path.join(out, 'p2_assembled_action_v001.png'), action);

  const proxy = await sharp({ create: { width: 1672, height: 941, channels: 4, background: '#334754' } })
    .composite([{ input: Buffer.from('<svg width="1672" height="941"><rect y="730" width="1672" height="211" fill="#101923"/></svg>') }]).png().toBuffer();
  const idleComposite = await sharp(proxy).composite([{ input: idle }]).png().toBuffer();
  const actionComposite = await sharp(proxy).composite([{ input: action }]).png().toBuffer();
  const idleReview = await sharp(idleComposite).resize(1280, 720, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const actionReview = await sharp(actionComposite).resize(1280, 720, { fit: 'contain', background: '#334754' }).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'p2_assembled_idle_1280x720_v001.png'), idleReview);
  fs.writeFileSync(path.join(reviewDir, 'p2_assembled_action_1280x720_v001.png'), actionReview);
  const style = await sharp(path.join(root, 'assets/风格定稿/风格定稿.png')).resize(1280, 720, { fit: 'contain', background: '#15212d' }).png().toBuffer();
  await sharp({ create: { width: 2560, height: 720, channels: 4, background: '#15212d' } })
    .composite([{ input: style, left: 0, top: 0 }, { input: idleReview, left: 1280, top: 0 }]).png().toFile(path.join(reviewDir, 'p2_style_compare_2560x720_v001.png'));

  const generated = [roomSheet, harpoonSheet, roomModule, ...Object.values(parts).map(part => part.file), path.join(out, 'p2_assembled_idle_v001.png'), path.join(out, 'p2_assembled_action_v001.png')];
  const manifest = {
    task_id: 'VS-ART-P2-01',
    status: 'REVIEW',
    generated_at: new Date().toISOString(),
    purpose: 'minimum runtime split sample: Lv1 power room plus room/tower 2001 harpoon launcher',
    references: ['STYLE_SCENE_001_v001', 'ship_lv1_hull_editable_v007'],
    generation_records: [
      {
        asset_id: 'room_1001_power',
        output_artifact_id: 'exec-291340eb-bd62-4b64-a3a5-d3433eb85da9',
        provider_task_id: null,
        model: null,
        model_version: null,
        seed: null,
        generator: 'built-in image_gen',
        prompt: 'Use case: stylized-concept. Asset type: game production asset, representative Lv1 power room module for a side-view ship cutaway. Input images: Image 1 is the authoritative approved project style reference; Image 2 is the frozen v007 hull candidate for scale/context only. Primary request: Create one complete rectangular Lv1 power-room interior module designed to fit a single 140x160 source-grid opening when later scaled, shown straight side-on with no perspective. It is a dark old wooden ship compartment containing a compact hand-built flywheel, belt drive, small iron boiler/generator, two pipes, one operator standing area, and a small warm oil lamp. The room is unoccupied. Style/medium: restrained dark hand-painted game illustration matching the reference; crisp variable dark structural edges; compact controlled brushwork; grey-brown old wood, blue-grey shadow, muted iron, localized dull rust. Composition/framing: centered front elevation, complete room boundaries visible, readable silhouette at 96-128px logical scale, clear floor and empty operator zone. Lighting/mood: cool ambient darkness with one small localized warm lamp; no broad golden wash. Constraints: transparent background outside the rectangular room module; no ship exterior, no characters, no UI, no text, no watermark; no perspective camera; no pipes or decoration crossing outside the module; keep machinery clear but not overly detailed. Avoid: photorealism, 3D render, pixel art, flat vector, giant impasto strokes, bright orange rust, steampunk ornament overload, horror gore.',
        negative_prompt: 'photorealism, 3D render, pixel art, flat vector, giant impasto strokes, bright orange rust, steampunk ornament overload, horror gore, text, watermark',
        prompt_summary: 'Side-view two-grid Lv1 power room; flywheel, belt drive, compact boiler/generator, localized lamp; transparent exterior; approved style reference.'
      },
      {
        asset_id: 'room_2001_harpoon',
        output_artifact_id: 'exec-feaf0914-c341-4dec-a962-9c1efa01adc8',
        provider_task_id: null,
        model: null,
        model_version: null,
        seed: null,
        generator: 'built-in image_gen',
        prompt: 'Use case: stylized-concept. Asset type: game production sprite-parts sheet for room/tower ID 2001, Lv1 hand-thrown harpoon launcher. Input image: Image 1 is the authoritative approved project style reference. Primary request: Create a clean transparent sprite-parts sheet for a compact side-view shipboard harpoon launcher. Show exactly five separated non-overlapping components with generous transparent spacing: (1) low wooden-and-dark-iron mounting base, (2) short pivoting launcher body with simple rope spool and rear grip, (3) one long barbed iron harpoon pointing right, (4) one loose curved hemp rope segment, (5) a small pale cyan impact/glint effect mask. No assembled second weapon. Style/medium: restrained dark hand-painted game illustration matching the reference; crisp variable dark edges, controlled compact brushwork, grey-brown wood, blue-grey iron, tiny localized dull rust, pale cyan effect only. Composition/framing: orthographic side view, all components complete and isolated, launcher facing right, consistent top-left light, readable after scaling to a one-grid room. Constraints: genuine transparent background, no labels, no text, no grid, no frame, no characters, no ship, no ocean, no UI, no watermark; parts must not touch or overlap so they can be cropped independently. Avoid: firearms, cannons, missiles, ornate fantasy weapon, photorealism, 3D render, pixel art, flat vector, bright gold, large orange rust, giant impasto strokes.',
        negative_prompt: 'firearms, cannons, missiles, ornate fantasy weapon, photorealism, 3D render, pixel art, flat vector, bright gold, large orange rust, giant impasto strokes, text, watermark',
        prompt_summary: 'Five isolated transparent parts: base, launcher, harpoon, rope and pale-cyan effect; approved style reference.'
      }
    ],
    manual_edits: ['透明边界裁切', '五部件独立裁切，不重绘源像素', '按冻结舱格缩放回拼', '制作待机与发射状态审核图'],
    license_notes: 'Self-generated from approved internal project reference; no protected-IP style target or third-party texture',
    reviewer: '',
    review_notes: 'Whole-set review pending. Not APPROVED and not imported into Cocos.',
    artifacts: generated.map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'vs_art_p2_v001.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(reviewDir, 'p2_board_v001.html'), '<!doctype html><meta charset="utf-8"><title>P2 REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;background:#334754}</style><h1>VS-ART-P2-01 · REVIEW</h1><p>v007船壳 + 1001动力舱 + 2001鱼叉炮最小闭环。请先看风格并排，再看待机/发射状态。未进入APPROVED或Cocos。</p><h2>风格定稿 / P2</h2><img src="p2_style_compare_2560x720_v001.png"><h2>待机</h2><img src="p2_assembled_idle_1280x720_v001.png"><h2>发射</h2><img src="p2_assembled_action_1280x720_v001.png">');
  fs.writeFileSync(path.join(reviewDir, 'p2_handoff_v001.md'), '# VS-ART-P2-01\n\n任务：v007船壳上的最小运行时拆分样例。\n结论：完成候选，REVIEW；等待整体效果评审。\n改动文件：1001动力舱原图/模块、2001鱼叉炮五部件、待机与发射回拼、审核板和manifest。\n验证结果：两张生成图均含Alpha；房间与五部件完成独立裁切；按冻结舱格回拼，无源图覆盖。\n配置/存档兼容性：使用既有1001与2001口径，无配置修改。\n性能与包体影响：未导入Cocos；运行时纹理尺寸、图集与Draw Call待P3实测。\n风险与未完成项：房间在逻辑尺寸下细节偏密，炮位部件锚点仅为审核布局；尚未APPROVED。\n建议下一步：整体评审船壳、房间与炮位的色彩、比例和材质一致性；通过后再做manifest审计和最小引擎导入。\n');
  console.log(JSON.stringify({ status: 'REVIEW', room: await sharp(roomModule).metadata(), parts: Object.fromEntries(await Promise.all(Object.entries(parts).map(async ([key, value]) => [key, await sharp(value.file).metadata()]))) }, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
