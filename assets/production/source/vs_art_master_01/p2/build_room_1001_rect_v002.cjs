const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const source = path.join(out, 'room_1001_power_rect_v002.png');
const oldSource = path.join(out, 'room_1001_power_module_v001.png');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

(async () => {
  const metadata = await sharp(source).metadata();
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const bbox = { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  const ratio = bbox.width / bbox.height;
  const normalizedFile = path.join(out, 'room_1001_power_rect_normalized_v002.png');
  await sharp(source).extract({ left: bbox.x, top: bbox.y, width: bbox.width, height: bbox.height }).resize(900, 400, { fit: 'fill' }).png().toFile(normalizedFile);
  const checks = { status: 'REVIEW', canvas: [metadata.width, metadata.height], has_alpha: metadata.hasAlpha, content_bbox: bbox, source_content_aspect_ratio: ratio, normalized_size: [900, 400], normalized_aspect_ratio: 2.25, target_aspect_ratio: 2.25, normalized_aspect_error: 0, straight_frame_visual_check_required: true };
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_rect_v002_checks.json'), JSON.stringify(checks, null, 2));

  const oldImage = await sharp(oldSource).resize(600, 270, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const newImage = await sharp(normalizedFile).resize(600, 270, { fit: 'contain', background: '#334754' }).png().toBuffer();
  const comparison = await sharp({ create: { width: 1240, height: 340, channels: 4, background: '#15212d' } }).composite([
    { input: oldImage, left: 20, top: 50 },
    { input: newImage, left: 620, top: 50 },
    { input: Buffer.from('<svg width="1240" height="340"><g fill="#eee" font-family="Microsoft YaHei,sans-serif" font-size="20"><text x="20" y="32">v001：自带异形/透视感外框</text><text x="620" y="32">v002：标准两格矩形房间壳</text></g></svg>') }
  ]).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'room_1001_power_rect_compare_v002.png'), comparison);

  const prompt = 'Use case: precise-object-edit. Asset type: two-slot rectangular game room module, power room v002. Input Image 1 is the edit target and contains the approved machinery/interior content. Image 2 is supporting context showing the strict rectangular room-slot framework. Rebuild only the outer room shell and layout boundary so the complete module is a strict front-facing rectangle with perfectly vertical left and right sides, perfectly horizontal top and bottom, square 90-degree corners, no trapezoid taper or perspective, and a wide two-slot aspect ratio approximately 2.25:1. Preserve the flywheel, belt drive, boiler/generator, pipes, gauge, table, lamp, color palette, brush style and lighting. The room renders above the slot-frame layer and covers the center post between two slots. Genuine transparent background outside the rectangle; no ship hull, characters, text, UI or watermark.';
  const manifest = {
    task_id: 'VS-ART-ROOM-TEMPLATE-01',
    asset_id: 'room_1001_power_rect',
    version: 2,
    status: 'REVIEW',
    generator: 'built-in image_gen precise-object-edit',
    output_artifact_id: 'exec-57595be0-ff38-4ca0-9e87-e3cf2ad5e805',
    provider_task_id: null,
    model: null,
    model_version: null,
    seed: null,
    prompt,
    negative_prompt: 'trapezoid, slanted side walls, converging perspective, chamfered outer silhouette, curved room boundary, protruding pipes, photorealism, 3D render, flat vector, text, watermark',
    references: ['room_1001_power_module_v001.png', 'ship_layout_right_v009_1280x720.png'],
    manual_edits: ['No source-pixel repaint after generation', 'Cropped transparent margins to detected content bbox', 'Normalized runtime candidate to exact 900x400 two-slot rectangle'],
    reviewer: '',
    review_notes: 'Rectangular two-slot room candidate. Must render above slot_frame and cover the center post. Not APPROVED and not imported into Cocos.',
    license_notes: 'Self-generated from approved internal project assets; no protected-IP style target or third-party texture',
    artifacts: [source, normalizedFile].map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'room_1001_power_rect_v002.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(checks, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
