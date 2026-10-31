const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const source = path.join(out, 'room_1001_power_doors_v004.png');
const previous = path.join(out, 'room_1001_power_worker_normalized_v003.png');
const normalized = path.join(out, 'room_1001_power_doors_normalized_v004.png');
const layoutFile = path.join(out, 'room_1001_power_doors_layout_v004.json');
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
    .resize(900, 400, { fit: 'fill' }).png().toFile(normalized);

  const layout = {
    asset_id: 'room_1001_power',
    version: 4,
    status: 'REVIEW',
    canvas: { width: 900, height: 400 },
    slot_span: 2,
    floor_y: 338,
    doorway: { clear_width: 78, clear_height: 205 },
    door_anchors: {
      left: { id: 'door_left', x: 0, y: 338, facing: 'left' },
      right: { id: 'door_right', x: 900, y: 338, facing: 'right' }
    },
    walk_band: { x: 0, y: 145, width: 900, height: 200 },
    crew_display_height: 250,
    crew_anchors: [
      { id: 'crew_left', x: 225, y: 338, facing: 'right', workstation: 'flywheel_service' },
      { id: 'crew_center', x: 450, y: 338, facing: 'right', workstation: 'belt_control' },
      { id: 'crew_right', x: 675, y: 338, facing: 'left', workstation: 'boiler_valve' }
    ],
    merge_rule: 'A two-slot room has no internal partition or internal door; only its two outer door anchors participate in navigation.',
    navigation_rule: 'Connect left/right door anchors to adjacent room or access-core anchors only when floor_y matches.'
  };
  fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2));

  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="400"><rect x="0" y="145" width="900" height="200" fill="#4fd1c5" fill-opacity=".06" stroke="#4fd1c5" stroke-dasharray="10 8"/><line x1="0" y1="338" x2="900" y2="338" stroke="#ffd27d" stroke-width="3"/><g fill="#ffcf68" stroke="#111" stroke-width="2"><circle cx="8" cy="338" r="8"/><circle cx="892" cy="338" r="8"/></g><g fill="#65e6dc" fill-opacity=".28" stroke="#9ffdf6" stroke-width="3">${layout.crew_anchors.map(a => `<circle cx="${a.x}" cy="120" r="24"/><rect x="${a.x - 28}" y="150" width="56" height="180" rx="18"/>`).join('')}</g></svg>`);
  const anchorReview = await sharp(normalized).composite([{ input: overlay }]).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_doors_anchors_v004.png'), anchorReview);

  const oldReview = await sharp(previous).resize(600, 267, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const newReview = await sharp(normalized).resize(600, 267, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const comparison = await sharp({ create: { width: 1240, height: 337, channels: 4, background: '#15212d' } }).composite([
    { input: oldReview, left: 20, top: 50 },
    { input: newReview, left: 620, top: 50 },
    { input: Buffer.from('<svg width="1240" height="337"><g fill="#eee" font-family="Microsoft YaHei,sans-serif" font-size="20"><text x="20" y="32">v003：有工作位，缺少左右通行门</text><text x="620" y="32">v004：统一地板线 + 左右贯通门</text></g></svg>') }
  ]).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_doors_compare_v004.png'), comparison);

  const prompt = 'Use case: precise-object-edit. Asset type: two-slot power-room sprite v004. Preserve the rectangular shell, dark hand-painted wood and iron, back-wall flywheel, belt, boiler, continuous foreground work floor and three empty crew work zones. Add a full-height open passage at the far left and a matching full-height open passage at the far right. Both passages must meet the same floor line and allow characters to walk between adjacent rooms. Keep the two-slot interior as one continuous room with no center wall and no internal door. Orthographic side cutaway, transparent background. No characters, text, UI, watermark or protected game-specific symbols.';
  const manifest = {
    task_id: 'VS-ART-ROOM-DOORS-01', asset_id: 'room_1001_power', version: 4, status: 'REVIEW',
    generator: 'built-in image_gen precise-object-edit', output_artifact_id: 'exec-ddd490ee-eb35-43f7-93fe-8c1bb04a89e6',
    model: null, model_version: null, seed: null, prompt,
    negative_prompt: 'characters, center partition, internal door, blocked doorway, sloped room shell, text, UI, watermark, photorealism, 3D render, pixel art',
    references: ['room_1001_power_worker_v003.png'],
    manual_edits: ['Alpha-trimmed and normalized to exact 900x400 canvas', 'Added machine-readable door, floor, walk-band and crew anchors'],
    reviewer: '', review_notes: 'Door geometry and integrated ship fit pending approval; not imported into Cocos.',
    artifacts: [source, normalized, layoutFile, path.join(reviewDir, 'room_1001_power_doors_anchors_v004.png'), path.join(reviewDir, 'room_1001_power_doors_compare_v004.png')]
      .map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'room_1001_power_doors_v004.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ status: 'REVIEW', bbox, layout }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
