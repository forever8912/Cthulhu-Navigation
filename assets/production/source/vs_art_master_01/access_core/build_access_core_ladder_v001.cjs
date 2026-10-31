const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const source = path.join(out, 'ship_access_core_ladder_v001.png');
const normalized = path.join(out, 'ship_access_core_ladder_normalized_v001.png');
const layoutFile = path.join(out, 'ship_access_core_ladder_layout_v001.json');
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
    .resize(240, 400, { fit: 'fill' }).png().toFile(normalized);
  const layout = {
    asset_id: 'ship_access_core_ladder', version: 1, status: 'REVIEW', non_buildable: true,
    canvas: { width: 240, height: 400 }, floor_y: 338,
    anchors: {
      corridor_left: { x: 0, y: 338, facing: 'left' },
      corridor_right: { x: 240, y: 338, facing: 'right' },
      ladder_bottom: { x: 120, y: 338, facing: 'up' },
      deck_exit: { x: 120, y: 0, facing: 'up' }
    },
    navigation_edges: [
      ['corridor_left', 'ladder_bottom'], ['corridor_right', 'ladder_bottom'], ['ladder_bottom', 'deck_exit']
    ],
    placement_rule: 'Fixed at ship visual center between left and right room wings; does not consume build_slot_count and never moves during hull upgrades.'
  };
  fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2));
  const overlay = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="400"><line x1="0" y1="338" x2="240" y2="338" stroke="#ffd27d" stroke-width="3"/><g fill="#65e6dc" stroke="#111" stroke-width="2"><circle cx="8" cy="338" r="8"/><circle cx="232" cy="338" r="8"/><circle cx="120" cy="338" r="8"/><circle cx="120" cy="8" r="8"/></g><path d="M120 330V12" stroke="#65e6dc" stroke-width="3" stroke-dasharray="8 6"/></svg>');
  const review = await sharp(normalized).composite([{ input: overlay }]).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'ship_access_core_ladder_anchors_v001.png'), review);
  const prompt = 'Use case: stylized-concept. Asset type: fixed central access-core sprite for a side-view ship management game. Create a narrow vertical wooden ladder shaft with an open deck hatch at the top, a climbable ladder, and open left and right corridor passages at the lower room-floor level. The component is non-buildable and sits between room wings. Dark restrained hand-painted wood and blue-grey iron matching the ship material language; strict orthographic cutaway; transparent background; readable at mobile scale. No characters, room machinery, weapons, text, UI or watermark.';
  const manifest = {
    task_id: 'VS-ART-ACCESS-CORE-01', asset_id: 'ship_access_core_ladder', version: 1, status: 'REVIEW',
    generator: 'built-in image_gen', output_artifact_id: 'exec-953a835d-a721-4d99-8ecb-35fe7eccfd90',
    model: null, model_version: null, seed: null, prompt,
    negative_prompt: 'characters, machinery, weapons, blocked passage, decorative staircase, text, UI, watermark, photorealism, 3D render, pixel art',
    references: ['STYLE_SCENE_001_v001', 'ship_hull_visual_right_v009.png'],
    manual_edits: ['Alpha-trimmed and normalized to exact 240x400 canvas', 'Added machine-readable corridor, ladder and deck-exit anchors'],
    reviewer: '', review_notes: 'Integrated scale and hatch alignment pending approval; not imported into Cocos.',
    artifacts: [source, normalized, layoutFile, path.join(reviewDir, 'ship_access_core_ladder_anchors_v001.png')]
      .map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'ship_access_core_ladder_v001.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ status: 'REVIEW', bbox, layout }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
