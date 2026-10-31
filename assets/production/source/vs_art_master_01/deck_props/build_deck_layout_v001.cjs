const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const gateC = path.join(root, 'assets/production/source/vs_art_master_01/gate_c');
const p2 = path.join(root, 'assets/production/source/vs_art_master_01/p2');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const sheet = path.join(out, 'deck_props_sheet_v001.png');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function cropTrim(rect, file) {
  const crop = await sharp(sheet).extract(rect).png().toBuffer();
  await sharp(crop).trim({ background: '#00000000', threshold: 8 }).png().toFile(file);
}

async function fit(file, width, height) {
  return sharp(file).resize(width, height, { fit: 'contain', background: '#00000000' }).png().toBuffer();
}

(async () => {
  const parts = {
    mast: { rect: { left: 50, top: 0, width: 500, height: 941 }, file: path.join(out, 'deck_mast_v001.png'), animated: true },
    sail: { rect: { left: 550, top: 160, width: 550, height: 510 }, file: path.join(out, 'deck_sail_v001.png'), animated: true },
    rigging: { rect: { left: 1120, top: 0, width: 552, height: 630 }, file: path.join(out, 'deck_rigging_v001.png'), animated: true },
    barrel: { rect: { left: 600, top: 650, width: 260, height: 291 }, file: path.join(out, 'deck_barrel_v001.png'), animated: false },
    crates: { rect: { left: 880, top: 650, width: 360, height: 291 }, file: path.join(out, 'deck_crates_v001.png'), animated: false },
    lantern: { rect: { left: 1300, top: 620, width: 280, height: 321 }, file: path.join(out, 'deck_lantern_v001.png'), animated: true }
  };
  for (const part of Object.values(parts)) await cropTrim(part.rect, part.file);

  const sourceHull = path.join(gateC, 'ship_lv1_hull_visual_v008.png');
  const rightHullFile = path.join(gateC, 'ship_hull_visual_right_v009.png');
  await sharp(sourceHull).flop().png().toFile(rightHullFile);
  const hull = fs.readFileSync(rightHullFile);
  const room = await fit(path.join(p2, 'room_1001_power_module_v001.png'), 398, 176);
  const base = await fit(path.join(p2, 'room_2001_base_v001.png'), 145, 88);
  const launcher = await fit(path.join(p2, 'room_2001_launcher_v001.png'), 165, 66);
  const harpoon = await fit(path.join(p2, 'room_2001_harpoon_v001.png'), 142, 34);
  const mast = await fit(parts.mast.file, 180, 350);
  const sail = await fit(parts.sail.file, 205, 180);
  const rigging = await fit(parts.rigging.file, 250, 210);
  const barrel = await fit(parts.barrel.file, 52, 70);
  const crates = await fit(parts.crates.file, 90, 66);
  const lantern = await fit(parts.lantern.file, 42, 66);

  const preview = await sharp({ create: { width: 1983, height: 793, channels: 4, background: '#00000000' } }).composite([
    { input: hull, left: 0, top: 0 },
    // 建造房间高于格子框架：两格房覆盖中间立柱。
    { input: room, left: 320, top: 463 },
    // 静态甲板装饰可在批准后合并到 deck_decor_static。
    { input: barrel, left: 565, top: 300 },
    { input: crates, left: 1320, top: 304 },
    // 动画候选保持独立部件。
    { input: mast, left: 770, top: 20 },
    { input: sail, left: 855, top: 72 },
    { input: rigging, left: 735, top: 94 },
    { input: lantern, left: 1585, top: 252 },
    // 2001 逻辑占 slot_03，视觉挂在 module_01.deck_mount_01。
    { input: base, left: 1090, top: 330 },
    { input: launcher, left: 1075, top: 288 },
    { input: harpoon, left: 1098, top: 284 }
  ]).png().toBuffer();
  const previewFile = path.join(gateC, 'ship_layout_right_v009_preview.png');
  fs.writeFileSync(previewFile, preview);

  const background = await sharp({ create: { width: 1983, height: 793, channels: 4, background: '#334754' } }).composite([
    { input: Buffer.from('<svg width="1983" height="793"><rect y="650" width="1983" height="143" fill="#101923"/></svg>') }
  ]).png().toBuffer();
  const review = await sharp(await sharp(background).composite([{ input: preview }]).png().toBuffer())
    .resize(1280, 720, { fit: 'contain', background: '#334754' }).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'ship_layout_right_v009_1280x720.png'), review);

  const layout = {
    version: 1,
    orientation: { bow: 'right', travel_axis: '+X', default_weapon_aim: 'right' },
    layer_order_back_to_front: ['hull_back', 'slot_back', 'slot_frame', 'constructed_room', 'front_sill_occluder', 'deck_decor_static', 'deck_devices', 'mast', 'sail', 'rigging', 'lantern', 'fx', 'ui'],
    modules: {
      stern: { reusable: true },
      mid_3slot: { reusable: true, slot_count: 3, deck_mount_count: 1 },
      bow: { reusable: true }
    },
    hull_levels: [
      { hull_level: 1, modules: ['stern', 'mid_01', 'bow'], build_slot_count: 3, stable_slot_ids: ['slot_01', 'slot_02', 'slot_03'], deck_mount_ids: ['mid_01.deck_mount_01'] },
      { hull_level: 2, modules: ['stern', 'mid_01', 'mid_02', 'bow'], build_slot_count: 6, stable_slot_ids: ['slot_01', 'slot_02', 'slot_03', 'slot_04', 'slot_05', 'slot_06'], deck_mount_ids: ['mid_01.deck_mount_01', 'mid_02.deck_mount_01'] },
      { hull_level: 3, modules: ['stern', 'mid_01', 'mid_02', 'mid_03', 'bow'], build_slot_count: 9, stable_slot_ids: ['slot_01', 'slot_02', 'slot_03', 'slot_04', 'slot_05', 'slot_06', 'slot_07', 'slot_08', 'slot_09'], deck_mount_ids: ['mid_01.deck_mount_01', 'mid_02.deck_mount_01', 'mid_03.deck_mount_01'], provisional: true }
    ],
    example_occupancy: { room_1001_power: ['slot_01', 'slot_02'], room_2001_harpoon_logic: ['slot_03'], room_2001_harpoon_visual: 'mid_01.deck_mount_01' },
    save_rule: 'Upgrade appends new stable slot IDs; existing slot IDs and room assignments never move.',
    camera_rule: 'Lv1/Lv2 fit width while preserving minimum room readability; Lv3 may use horizontal pan instead of shrinking rooms below target logical size.'
  };
  fs.writeFileSync(path.join(gateC, 'ship_modular_layout_v001.json'), JSON.stringify(layout, null, 2));

  const prompt = 'Use case: stylized-concept. Asset type: transparent game sprite-parts sheet for deck details on the right-facing v008 ship. Input images: Image 1 is the authoritative approved style reference. Image 2 is the current right-facing hull and deck scale reference. Primary request: Create exactly six separated, non-overlapping side-view deck components with generous transparent spacing: (1) one weathered main mast with a sturdy deck foot and short yard arm, (2) one separate small torn canvas sail sized for that mast, (3) one separate loose rigging/rope group for subtle sway animation, (4) one small closed wooden barrel, (5) one low stack of two battered cargo crates, (6) one small hanging warm oil lantern with its own hook. No assembled ship and no duplicate variants. Style/medium: restrained dark hand-painted game illustration matching the reference; crisp variable dark structural edges, compact controlled brushwork, grey-brown old wood, desaturated canvas, blue-grey iron, tiny localized dull rust. Composition/framing: strict orthographic side view; all six components fully visible and isolated for clean cropping; mast vertical; sail and rope separate from mast; barrel and crates low enough not to block characters; consistent top-left light. Constraints: genuine transparent background; no text, labels, grid, frame, characters, ship hull, ocean, UI or watermark. Components must not touch. Mast/sail/rigging/lantern are animation-ready separate parts; barrel and crates are static decoration parts. Avoid: photorealism, 3D render, pixel art, flat vector, giant impasto strokes, bright orange rust, golden ornament, excessive steampunk detail, weapons, gore.';
  const editPrompt = 'Use case: precise-object-edit. Modify only the large mast component on the left. Remove the small torn cloth attached near the top of the mast and remove the hanging wooden bucket/lantern attached to that mast. Reconstruct exposed rope knots and wood naturally. Preserve the separate large sail, rigging, barrel, crate stack and oil lantern exactly. Keep genuine transparency and do not add or remove any other object.';
  const manifest = {
    task_id: 'VS-ART-DECK-PROPS-01',
    status: 'REVIEW',
    generator: 'built-in image_gen plus precise-object-edit',
    output_artifact_ids: ['exec-e32dd08f-ed33-40fa-b723-720e422c3b37', 'exec-835f3fda-dcad-4647-bdff-78d9abeaffe5'],
    provider_task_ids: [null, null],
    model: null,
    model_version: null,
    seed: null,
    prompt,
    negative_prompt: 'photorealism, 3D render, pixel art, flat vector, giant impasto strokes, bright orange rust, golden ornament, excessive steampunk detail, weapons, gore, text, watermark',
    edit_prompt: editPrompt,
    edit_notes: 'Removed cloth and hanging bucket/lantern accidentally fused to mast; preserved separate sail, rigging, barrel, crates and lantern.',
    references: ['STYLE_SCENE_001_v001', 'hull_v008_deck_concept_1280x720.png'],
    manual_edits: ['Cropped six parts without repaint', 'Flipped hull only to right-facing orientation', 'Composited room above slot frame', 'Placed static and animated deck details on separate review layers'],
    reviewer: '',
    review_notes: 'Right-facing layout and modular upgrade proposal pending integrated review. Not APPROVED and not imported into Cocos.',
    artifacts: [sheet, ...Object.values(parts).map(part => part.file), rightHullFile, previewFile, path.join(gateC, 'ship_modular_layout_v001.json')].map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) })),
    part_roles: Object.fromEntries(Object.entries(parts).map(([key, part]) => [key, { animated: part.animated }]))
  };
  fs.writeFileSync(path.join(manifestDir, 'deck_props_and_layout_v001.json'), JSON.stringify(manifest, null, 2));

  const diagram = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="520"><rect width="1280" height="520" fill="#15212d"/><g font-family="Microsoft YaHei,sans-serif" fill="#eee"><text x="40" y="48" font-size="26">船体模块扩展：固定船头/船尾 + 可追加三格中段</text><text x="40" y="98" font-size="20">Lv1 · 3格</text><text x="40" y="260" font-size="20">Lv2 · 6格</text></g><g stroke="#8b7256" stroke-width="4"><path fill="#3b2f2a" d="M190 125l-90 65 90 65z"/><rect fill="#263946" x="190" y="125" width="420" height="130"/><path fill="#3b2f2a" d="M610 125h110l70 65-70 65H610z"/><path fill="#3b2f2a" d="M190 285l-90 65 90 65z"/><rect fill="#263946" x="190" y="285" width="420" height="130"/><rect fill="#2e414d" x="610" y="285" width="420" height="130"/><path fill="#3b2f2a" d="M1030 285h110l70 65-70 65h-110z"/></g><g fill="#101923" stroke="#9a8060" stroke-width="3">${[0,1,2].map(i=>`<rect x="${215+i*130}" y="150" width="110" height="80"/>`).join('')}${[0,1,2,3,4,5].map(i=>`<rect x="${215+i*130}" y="310" width="110" height="80"/>`).join('')}</g><g font-family="Microsoft YaHei,sans-serif" font-size="17" fill="#eee"><text x="250" y="245">mid_01</text><text x="250" y="405">mid_01（原槽位不动）</text><text x="680" y="405">mid_02（升级新增）</text><text x="850" y="470">升级只追加 slot_04~06 和第二个甲板锚点</text></g></svg>`;
  await sharp(Buffer.from(diagram)).png().toFile(path.join(reviewDir, 'ship_modular_upgrade_v001.png'));
  fs.writeFileSync(path.join(reviewDir, 'ship_layout_right_v009_board.html'), '<!doctype html><meta charset="utf-8"><title>Right-facing modular ship REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;background:#334754}</style><h1>右向船体、房间层级与模块升级 · REVIEW</h1><p>正式方向：船头朝右，航行和炮口默认朝右。房间层高于格子框架；动力舱覆盖两格之间的中柱。桅杆/帆/缆绳/灯为独立动画候选，桶和箱子为静态装饰。</p><img src="ship_layout_right_v009_1280x720.png"><h2>Lv1 → Lv2 模块扩展</h2><img src="ship_modular_upgrade_v001.png"><p>Lv1=一段三格中段；Lv2=追加第二段。旧槽位ID和房间不移动。</p>');
  console.log(JSON.stringify({ status: 'REVIEW', orientation: layout.orientation, layers: layout.layer_order_back_to_front, levels: layout.hull_levels }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
