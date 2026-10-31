const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const gateC = path.join(root, 'assets/production/source/vs_art_master_01/gate_c');
const p2 = path.join(root, 'assets/production/source/vs_art_master_01/p2');
const accessCore = path.join(root, 'assets/production/source/vs_art_master_01/access_core');
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
  const room = await fit(path.join(p2, 'room_1001_power_doors_normalized_v004.png'), 398, 176);
  const ladder = await fit(path.join(accessCore, 'ship_access_core_ladder_normalized_v001.png'), 112, 218);
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
    // 中央交通核固定在船体中线，不占建造格；左右通道与房间地板对齐。
    { input: ladder, left: 936, top: 402 },
    // 静态甲板装饰可在批准后合并到 deck_decor_static。
    { input: barrel, left: 565, top: 300 },
    { input: crates, left: 1320, top: 304 },
    // 动画候选保持独立部件。
    { input: mast, left: 770, top: 20 },
    { input: sail, left: 855, top: 72 },
    { input: rigging, left: 735, top: 94 },
    { input: lantern, left: 1585, top: 252 },
    // 2001 逻辑占 slot_R1，视觉挂在右侧甲板锚点。
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
      left_room_cell: { reusable: true, slot_count: 1 },
      access_core: { reusable: false, slot_count: 0, fixed_at_visual_center: true },
      right_room_cell: { reusable: true, slot_count: 1 },
      bow: { reusable: true }
    },
    hull_levels: [
      { hull_level: 1, modules: ['stern', 'slot_L2', 'slot_L1', 'access_core', 'slot_R1', 'bow'], build_slot_count: 3, stable_slot_ids: ['slot_L1', 'slot_L2', 'slot_R1'], deck_mount_ids: ['deck_mount_R1'] },
      { hull_level: 2, modules: ['stern', 'slot_L3', 'slot_L2', 'slot_L1', 'access_core', 'slot_R1', 'slot_R2', 'slot_R3', 'bow'], build_slot_count: 6, stable_slot_ids: ['slot_L1', 'slot_L2', 'slot_L3', 'slot_R1', 'slot_R2', 'slot_R3'], deck_mount_ids: ['deck_mount_R1', 'deck_mount_R2'] },
      { hull_level: 3, build_slot_count: 9, stable_slot_ids: ['slot_L1', 'slot_L2', 'slot_L3', 'slot_L4', 'slot_R1', 'slot_R2', 'slot_R3', 'slot_R4', 'slot_R5'], provisional: true, note: 'Side allocation is not frozen until the Lv2 phone composition is approved.' }
    ],
    access_core: {
      consumes_build_slot: false,
      anchors: ['corridor_left', 'corridor_right', 'ladder_bottom', 'deck_exit'],
      navigation_role: 'The only default connection between cabin corridor and upper deck.'
    },
    room_connection_rule: 'Adjacent rooms connect door_right to door_left at the shared floor_y. Multi-slot rooms suppress internal partitions and expose only their outermost doors.',
    example_occupancy: { room_1001_power: ['slot_L2', 'slot_L1'], room_2001_harpoon_logic: ['slot_R1'], room_2001_harpoon_visual: 'deck_mount_R1' },
    save_rule: 'Upgrade appends side-based stable slot IDs outward from access_core; existing slot IDs, room assignments and access_core never move.',
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
    manual_edits: ['Cropped six parts without repaint', 'Flipped hull only to right-facing orientation', 'Composited v004 room above slot frame', 'Added fixed central ladder access core', 'Placed static and animated deck details on separate review layers'],
    reviewer: '',
    review_notes: 'Right-facing layout and modular upgrade proposal pending integrated review. Not APPROVED and not imported into Cocos.',
    artifacts: [sheet, ...Object.values(parts).map(part => part.file), rightHullFile, previewFile, path.join(gateC, 'ship_modular_layout_v001.json')].map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) })),
    part_roles: Object.fromEntries(Object.entries(parts).map(([key, part]) => [key, { animated: part.animated }]))
  };
  fs.writeFileSync(path.join(manifestDir, 'deck_props_and_layout_v001.json'), JSON.stringify(manifest, null, 2));

  const diagram = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="520"><rect width="1280" height="520" fill="#15212d"/><g font-family="Microsoft YaHei,sans-serif" fill="#eee"><text x="40" y="48" font-size="26">固定中央交通核：房间分列梯井两侧，升级向外追加</text><text x="40" y="98" font-size="20">Lv1 · 左2 + 右1 = 3格</text><text x="40" y="270" font-size="20">Lv2 · 左3 + 右3 = 6格</text></g><g fill="#101923" stroke="#9a8060" stroke-width="3"><rect x="250" y="125" width="130" height="90"/><rect x="380" y="125" width="130" height="90"/><rect x="590" y="125" width="130" height="90"/><rect x="185" y="300" width="130" height="90"/><rect x="315" y="300" width="130" height="90"/><rect x="445" y="300" width="130" height="90"/><rect x="655" y="300" width="130" height="90"/><rect x="785" y="300" width="130" height="90"/><rect x="915" y="300" width="130" height="90"/></g><g fill="#5b4636" stroke="#d0a66e" stroke-width="4"><rect x="510" y="105" width="80" height="130"/><rect x="575" y="280" width="80" height="130"/></g><g stroke="#d0a66e" stroke-width="4">${[0,1,2,3].map(i=>`<line x1="530" y1="${130+i*24}" x2="570" y2="${130+i*24}"/>`).join('')}${[0,1,2,3].map(i=>`<line x1="595" y1="${305+i*24}" x2="635" y2="${305+i*24}"/>`).join('')}</g><g font-family="Microsoft YaHei,sans-serif" font-size="17" fill="#eee"><text x="285" y="248">L2</text><text x="415" y="248">L1</text><text x="515" y="258">交通核</text><text x="630" y="248">R1</text><text x="210" y="425">新增L3</text><text x="340" y="425">L2</text><text x="470" y="425">L1</text><text x="680" y="425">R1</text><text x="810" y="425">新增R2</text><text x="940" y="425">新增R3</text><text x="230" y="485">既有房间与梯井不移动；所有门锚点共用同一 floor_y</text></g></svg>`;
  await sharp(Buffer.from(diagram)).png().toFile(path.join(reviewDir, 'ship_modular_upgrade_v001.png'));
  fs.writeFileSync(path.join(reviewDir, 'ship_layout_right_v009_board.html'), '<!doctype html><meta charset="utf-8"><title>Right-facing modular ship REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;background:#334754}</style><h1>右向船体、贯通房门与中央梯井 · REVIEW</h1><p>正式方向：船头朝右，航行和炮口默认朝右。动力舱具有左右贯通门和前景船员工作带；中央梯井固定连接船舱与甲板，且不占建造格。房间仍高于格子框架。</p><img src="ship_layout_right_v009_1280x720.png"><h2>Lv1 → Lv2 两侧扩展</h2><img src="ship_modular_upgrade_v001.png"><p>Lv1=左2+右1；Lv2=左3+右3。升级从交通核两侧向外增加，既有房间、梯井和稳定槽位ID不移动。</p>');
  console.log(JSON.stringify({ status: 'REVIEW', orientation: layout.orientation, layers: layout.layer_order_back_to_front, levels: layout.hull_levels }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
