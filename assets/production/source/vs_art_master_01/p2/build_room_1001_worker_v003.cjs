const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const source = path.join(out, 'room_1001_power_worker_v003.png');
const previous = path.join(out, 'room_1001_power_rect_normalized_v002.png');
const normalized = path.join(out, 'room_1001_power_worker_normalized_v003.png');
const layoutFile = path.join(out, 'room_1001_power_worker_layout_v003.json');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

(async () => {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 8) {
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  const bbox = { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  await sharp(source).extract({ left: bbox.x, top: bbox.y, width: bbox.width, height: bbox.height }).resize(900, 400, { fit: 'fill' }).png().toFile(normalized);

  const layout = {
    asset_id: 'room_1001_power',
    version: 3,
    canvas: { width: 900, height: 400 },
    slot_span: 2,
    render_layers_back_to_front: ['room_shell_and_machinery', 'crew', 'low_console_interaction_fx', 'front_sill_occluder'],
    walk_band: { x: 70, y: 155, width: 760, height: 190 },
    floor_y: 338,
    crew_display_height: 250,
    crew_anchors: [
      { id: 'crew_left', x: 225, y: 338, facing: 'right', workstation: 'flywheel_service' },
      { id: 'crew_center', x: 450, y: 338, facing: 'right', workstation: 'belt_control' },
      { id: 'crew_right', x: 675, y: 338, facing: 'left', workstation: 'boiler_valve' }
    ],
    interaction_rule: 'Crew renders in front of machinery; front_sill may cover feet by at most 8 normalized pixels.',
    visual_reference_note: 'Uses the functional stage-layout principle of shelter-management rooms; does not copy protected art, symbols or props.'
  };
  fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2));

  const normalizedBuffer = fs.readFileSync(normalized);
  const markers = layout.crew_anchors.map(anchor => `<g transform="translate(${anchor.x} ${anchor.y})" fill="#65e6dc" fill-opacity=".34" stroke="#9ffdf6" stroke-width="3"><circle cy="-218" r="26"/><path d="M-34-186h68v105l28 73h-45l-17-62-17 62h-45l28-73z"/></g>`).join('');
  const markerSvg = Buffer.from(`<svg width="900" height="400" xmlns="http://www.w3.org/2000/svg"><rect x="70" y="155" width="760" height="190" fill="#4fd1c5" fill-opacity=".08" stroke="#4fd1c5" stroke-dasharray="10 8"/>${markers}<line x1="70" y1="338" x2="830" y2="338" stroke="#ffd27d" stroke-width="3"/></svg>`);
  const anchorReview = await sharp(normalizedBuffer).composite([{ input: markerSvg }]).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_worker_anchors_v003.png'), anchorReview);

  const oldReview = await sharp(previous).resize(600, 267, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const newReview = await sharp(normalized).resize(600, 267, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const comparison = await sharp({ create: { width: 1240, height: 337, channels: 4, background: '#15212d' } }).composite([
    { input: oldReview, left: 20, top: 50 },
    { input: newReview, left: 620, top: 50 },
    { input: Buffer.from('<svg width="1240" height="337"><g fill="#eee" font-family="Microsoft YaHei,sans-serif" font-size="20"><text x="20" y="32">v002：设备占满前景，无角色舞台</text><text x="620" y="32">v003：机器后移，连续前景工作带</text></g></svg>') }
  ]).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_worker_compare_v003.png'), comparison);

  const prompt = 'Use case: precise-object-edit. Asset type: two-slot rectangular power-room module v003 for a front-facing mobile management game. Preserve the strict rectangular outer shell, 90-degree corners, orthographic view, materials and core machinery identity, but push flywheel, boiler, pipes and gauges to the back wall and upper half. Keep a continuous unobstructed foreground floor strip across at least 80% width. Create three empty worker zones—left, center and right—large enough for front-facing 96–128px characters. Machinery is background scenery; crew renders in front. Add only low waist-height controls. No characters, text, UI or protected game-specific art.';
  const manifest = {
    task_id: 'VS-ART-ROOM-WORKSPACE-01',
    asset_id: 'room_1001_power_worker',
    version: 3,
    status: 'REVIEW',
    generator: 'built-in image_gen precise-object-edit plus deterministic normalization',
    output_artifact_id: 'exec-3adcaae9-0c4f-4c64-bb59-126039d63939',
    provider_task_id: null,
    model: null,
    model_version: null,
    seed: null,
    prompt,
    negative_prompt: 'Fallout Shelter art copy, Vault-Tec symbols, retro-futurist yellow-blue styling, protected game props, crowded foreground, floor-to-ceiling front machine, trapezoid, perspective, photorealism, 3D render, flat vector, text, watermark',
    references: ['room_1001_power_rect_v002.png', 'ship_layout_right_v009_1280x720.png', 'shelter-management functional room staging only'],
    manual_edits: ['Cropped transparent margins', 'Normalized to 900x400', 'Added review-only crew anchor overlay; source art unchanged after generation'],
    reviewer: '',
    review_notes: 'Three crew anchors and foreground walk band defined. Placeholder silhouettes are review-only. Not APPROVED and not imported into Cocos.',
    license_notes: 'Self-generated; functional layout inspiration only, no copied protected art, symbols or props',
    artifacts: [source, normalized, layoutFile].map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'room_1001_power_worker_v003.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ status: 'REVIEW', bbox, layout }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
