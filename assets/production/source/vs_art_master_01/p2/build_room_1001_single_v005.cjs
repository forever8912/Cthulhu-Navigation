const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const source = path.join(out, 'room_1001_power_single_v005.png');
const previous = path.join(out, 'room_1001_power_doors_normalized_v004.png');
const normalized = path.join(out, 'room_1001_power_single_normalized_v005.png');
const layoutFile = path.join(out, 'room_1001_power_single_layout_v005.json');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function alphaBounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width; let minY = info.height; let maxX = -1; let maxY = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 8) {
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) throw new Error('Source has no visible pixels');
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

(async () => {
  const bbox = await alphaBounds(source);
  await sharp(source).extract({ left: bbox.x, top: bbox.y, width: bbox.width, height: bbox.height })
    .resize(600, 400, { fit: 'fill' }).png().toFile(normalized);
  const layout = {
    asset_id: 'room_1001_power', version: 5, status: 'REVIEW',
    canvas: { width: 600, height: 400 }, room_slot_cost: 1, floor_y: 338,
    doorway: { clear_width: 72, clear_height: 205 },
    door_anchors: {
      left: { id: 'door_left', x: 0, y: 338, facing: 'left' },
      right: { id: 'door_right', x: 600, y: 338, facing: 'right' }
    },
    walk_band: { x: 0, y: 150, width: 600, height: 195 },
    crew_display_height: 250,
    crew_anchors: [{ id: 'crew_main', x: 300, y: 338, facing: 'right', workstation: 'power_control' }],
    content_rule: 'Every normal cabin room consumes exactly one room slot. Deck-mounted weapons use deck mounts and never consume cabin slots.',
    navigation_rule: 'Connect door_right to the adjacent door_left or access-core landing only when floor_y matches.'
  };
  fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2));

  const overlay = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect x="0" y="150" width="600" height="195" fill="#4fd1c5" fill-opacity=".06" stroke="#4fd1c5" stroke-dasharray="10 8"/><line x1="0" y1="338" x2="600" y2="338" stroke="#ffd27d" stroke-width="3"/><g fill="#ffcf68" stroke="#111" stroke-width="2"><circle cx="8" cy="338" r="8"/><circle cx="592" cy="338" r="8"/></g><g fill="#65e6dc" fill-opacity=".28" stroke="#9ffdf6" stroke-width="3"><circle cx="300" cy="120" r="24"/><rect x="272" y="150" width="56" height="180" rx="18"/></g></svg>');
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_single_anchors_v005.png'), await sharp(normalized).composite([{ input: overlay }]).png().toBuffer());
  const oldReview = await sharp(previous).resize(600, 267, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const newReview = await sharp(normalized).resize(600, 267, { fit: 'contain', background: '#334754' }).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_single_compare_v005.png'), await sharp({ create: { width: 1240, height: 337, channels: 4, background: '#15212d' } }).composite([
    { input: oldReview, left: 20, top: 50 }, { input: newReview, left: 620, top: 50 },
    { input: Buffer.from('<svg width="1240" height="337"><g fill="#eee" font-family="Microsoft YaHei,sans-serif" font-size="20"><text x="20" y="32">v004：旧双格动力舱（历史版本）</text><text x="620" y="32">v005：单房间位 + 单岗位 + 双门</text></g></svg>') }
  ]).png().toBuffer());

  const prompt = 'Use case: precise-object-edit. Asset type: single-room-slot power-room sprite v005 for a side-view mobile ship management game. Input image: the v004 two-slot power room is the edit target and material/style reference. Redesign the same power-room identity into one compact standard room bay without geometrically squeezing it. Keep one readable flywheel, one compact boiler/generator, a short belt or pipe connection, one low interaction console, one centered crew work position, matching left/right open doors, a common floor line and an unobstructed foreground walking strip. Strict orthographic side cutaway, transparent background, no characters, cannon, center partition, text, UI or watermark.';
  const manifest = {
    task_id: 'VS-ART-ROOM-SINGLE-SLOT-01', asset_id: 'room_1001_power', version: 5, status: 'REVIEW',
    generator: 'built-in image_gen precise-object-edit', output_artifact_id: 'exec-1ee340a3-90e4-4f85-a840-ef4a6d0fc54c',
    model: null, model_version: null, seed: null, prompt,
    negative_prompt: 'horizontal squash, double-width room, blocked doorway, multiple crew stations, trapezoid shell, cannon, characters, text, UI, watermark, photorealism, 3D render, pixel art',
    references: ['room_1001_power_doors_v004.png'],
    manual_edits: ['Alpha-trimmed and normalized to exact 600x400 canvas', 'Added single-slot door, floor, walking-band and crew anchors'],
    reviewer: '', review_notes: 'Single-slot geometry and multi-deck ship fit pending approval; not imported into Cocos.',
    artifacts: [source, normalized, layoutFile, path.join(reviewDir, 'room_1001_power_single_anchors_v005.png'), path.join(reviewDir, 'room_1001_power_single_compare_v005.png')]
      .map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'room_1001_power_single_v005.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ status: 'REVIEW', bbox, layout }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
