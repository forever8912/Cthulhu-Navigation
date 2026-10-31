const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const p2 = path.join(root, 'assets/production/source/vs_art_master_01/p2');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const hullFile = path.join(out, 'ship_lv1_hull_visual_v008.png');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function fit(file, width, height) {
  return sharp(file).resize(width, height, { fit: 'contain', background: '#00000000' }).png().toBuffer();
}

(async () => {
  const hull = fs.readFileSync(hullFile);
  const room = await fit(path.join(p2, 'room_1001_power_module_v001.png'), 390, 160);
  const base = await fit(path.join(p2, 'room_2001_base_v001.png'), 145, 88);
  const launcher = await fit(path.join(p2, 'room_2001_launcher_v001.png'), 165, 66);
  const harpoon = await fit(path.join(p2, 'room_2001_harpoon_v001.png'), 142, 34);
  const preview = await sharp({ create: { width: 1983, height: 793, channels: 4, background: '#00000000' } }).composite([
    { input: room, left: 450, top: 474 },
    { input: base, left: 890, top: 330 },
    { input: launcher, left: 875, top: 288 },
    { input: harpoon, left: 898, top: 284 },
    { input: hull, left: 0, top: 0 }
  ]).png().toBuffer();
  fs.writeFileSync(path.join(out, 'ship_lv1_hull_preview_v008_deck_v002.png'), preview);

  const background = await sharp({ create: { width: 1983, height: 793, channels: 4, background: '#334754' } }).composite([
    { input: Buffer.from('<svg width="1983" height="793"><rect y="650" width="1983" height="143" fill="#101923"/></svg>') }
  ]).png().toBuffer();
  const review = await sharp(await sharp(background).composite([{ input: preview }]).png().toBuffer())
    .resize(1280, 720, { fit: 'contain', background: '#334754' }).png().toBuffer();
  fs.writeFileSync(path.join(reviewDir, 'hull_v008_deck_concept_1280x720.png'), review);
  const style = await sharp(path.join(root, 'assets/风格定稿/风格定稿.png')).resize(1280, 720, { fit: 'contain', background: '#15212d' }).png().toBuffer();
  await sharp({ create: { width: 2560, height: 720, channels: 4, background: '#15212d' } }).composite([
    { input: style, left: 0, top: 0 },
    { input: review, left: 1280, top: 0 }
  ]).png().toFile(path.join(reviewDir, 'hull_v008_deck_style_compare_2560x720.png'));

  const { data, info } = await sharp(hull).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const openings = [460, 665, 870, 1070, 1275, 1480].map((x, index) => {
    let alphaNonzero = 0;
    for (let y = 490; y < 610; y++) for (let px = x; px < x + 145; px++) if (data[(y * info.width + px) * 4 + 3] > 8) alphaNonzero++;
    return { index: index + 1, conservative_rect: { x, y: 490, width: 145, height: 120 }, alpha_nonzero: alphaNonzero };
  });
  const checks = { status: 'REVIEW', canvas: [info.width, info.height], has_alpha: info.channels === 4, conservative_opening_checks: openings, note: 'Concept-stage openings only. Fixed v005 coordinates are not yet applied; no geometry PASS claim.' };
  fs.writeFileSync(path.join(reviewDir, 'hull_v008_concept_checks.json'), JSON.stringify(checks, null, 2));

  const prompt = 'Use case: stylized-concept. Asset type: new visual master candidate for a side-view Lv1 game ship hull; transparent production concept, not a complete scene. Input images: Image 1 is the authoritative approved style and quality reference. Image 2 is ONLY a positional guide for six equal lower-deck room openings; do not copy its crude outer silhouette or flat design. Image 3 shows the existing power room and harpoon assets whose visual quality the new hull must support; do not copy its hull. Primary request: Redesign the entire ship hull visual from scratch as a convincing compact dark-age wooden sea vessel cutaway. The hull must have a strongly shaped rising bow on the left, a sturdy rounded stern on the right, visible outer-plank thickness, layered gunwale/deck edges, knees/braces, occasional muted iron reinforcement, a small raised stern deck, short railings and a few restrained maritime fittings. The lower deck contains exactly six equal adjacent rectangular open bays in one horizontal row, separated by substantial wooden posts; all six bays must be fully empty and transparent so modular rooms can be inserted. Style/medium: restrained dark hand-painted game illustration matching Image 1; crisp variable dark structural edges, controlled painterly planes, grey-brown old wood, blue-grey damp shadows, localized dull rust and salt wear. Rich structural hierarchy comparable to the reference ship, not a flat board. Composition/framing: strict orthographic side view, wide landscape hull only, centered, fully visible, no perspective. Bow left and stern right. Leave transparent space above the deck; no mast or sail in this asset. Six bay openings form the main lower-deck rhythm and remain readable at phone scale. Lighting/mood: cool moonlit ambient shadow with narrow localized warm-grey top-left edge light; no internal lamps because rooms are empty. Constraints: genuine transparent background; exactly six empty room openings; no room contents, no machinery, no weapon, no characters, no water, no sky, no UI, no text, no watermark. Openings may be corrected later by a fixed geometry mask, so keep structural posts straight and clean around them. Avoid: flat rectangular barge, greybox look, repetitive wallpaper planks, giant texture pasted across the hull, broad orange/gold wash, photorealism, 3D render, pixel art, vector-flat shading, thick uniform cartoon outline, excessive steampunk ornament, gore.';
  const manifest = {
    task_id: 'VS-ART-HULL-REDESIGN-01',
    asset_id: 'ship_lv1_hull_visual',
    version: 8,
    status: 'REVIEW',
    purpose: 'visual redesign after v007 hull rejection; concept before fixed-geometry transfer',
    generator: 'built-in image_gen',
    output_artifact_id: 'exec-1ff62279-f796-46b7-b311-227220d5d104',
    provider_task_id: null,
    model: null,
    model_version: null,
    seed: null,
    prompt,
    negative_prompt: 'flat rectangular barge, greybox look, repetitive wallpaper planks, giant texture pasted across hull, broad orange/gold wash, photorealism, 3D render, pixel art, vector-flat shading, thick uniform cartoon outline, excessive steampunk ornament, gore, text, watermark',
    references: ['STYLE_SCENE_001_v001', 'ship_lv1_geometry_guide_v004.png (opening positions only)', 'p2_assembled_idle_1280x720_v001.png (room/tower quality only)'],
    manual_edits: ['No source-pixel repaint', 'Composited existing 1001 room in lower deck', 'Moved 2001 harpoon launcher to upper deck after user review; logical grid occupancy remains separate from visual mount layer'],
    review_notes: 'Visual concept only. User considered the v008 hull acceptable but required the harpoon launcher to be mounted on deck rather than inside a cabin. Do not claim geometry pass or import into Cocos.',
    license_notes: 'Self-generated from approved internal project references; no protected-IP style target or third-party texture',
    artifacts: [hullFile, path.join(out, 'ship_lv1_hull_preview_v008_deck_v002.png')].map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'ship_lv1_hull_visual_v008.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(reviewDir, 'hull_v008_concept_board.html'), '<!doctype html><meta charset="utf-8"><title>Hull v008 REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;background:#334754}</style><h1>VS-ART-HULL-REDESIGN-01 · v008 · REVIEW</h1><p>v007船体已退回REWORK。v008船体方向基本成立；按用户反馈，2001鱼叉炮改装在上甲板，动力舱留在下层。六舱固定坐标尚未迁移，不作几何通过声明。</p><h2>风格定稿 / 甲板炮位候选</h2><img src="hull_v008_deck_style_compare_2560x720.png"><h2>动力舱与甲板鱼叉炮回拼</h2><img src="hull_v008_deck_concept_1280x720.png"><p>视觉方向通过后，再把六舱开口迁移到固定坐标并执行Alpha/净空检查。战斗房逻辑占格不等于视觉安装在舱内。</p>');
  console.log(JSON.stringify(checks, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
