const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/77197/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const out = __dirname;
const root = path.resolve(out, '../../../../..');
const reviewDir = path.join(root, 'assets/production/review/vs_art_master_01');
const manifestDir = path.join(root, 'assets/production/manifests');
const layoutFile = path.join(out, 'ship_multideck_layout_v002.json');
const progressionFile = path.join(reviewDir, 'ship_hull_progression_lv1_lv7_v002.png');
const cameraFile = path.join(reviewDir, 'ship_camera_scaling_v002.png');
const boardFile = path.join(reviewDir, 'ship_multideck_progression_v002_board.html');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const levels = [
  { level: 1, decks: [[2, 1]], deckhouse: [], mounts: 1, added: ['D1_L1', 'D1_L2', 'D1_R1'] },
  { level: 2, decks: [[2, 1], [1, 2]], deckhouse: [], mounts: 2, added: ['D2_L1', 'D2_R1', 'D2_R2'] },
  { level: 3, decks: [[2, 2], [2, 2]], deckhouse: [['captain_cabin']], mounts: 3, added: ['D1_R2', 'D2_L2', 'captain_cabin'] },
  { level: 4, decks: [[2, 2], [2, 2], [2, 2]], deckhouse: [['captain_cabin']], mounts: 4, added: ['D3_L1', 'D3_L2', 'D3_R1', 'D3_R2'] },
  { level: 5, decks: [[2, 3], [3, 2], [2, 3]], deckhouse: [['captain_cabin', 'chart_room']], mounts: 5, added: ['D1_R3', 'D2_L3', 'D3_R3', 'chart_room'] },
  { level: 6, decks: [[2, 3], [3, 2], [2, 3], [3, 2]], deckhouse: [['captain_cabin', 'chart_room'], ['bridge']], mounts: 6, added: ['D4_L1', 'D4_L2', 'D4_L3', 'D4_R1', 'D4_R2', 'bridge'] },
  { level: 7, decks: [[3, 3], [3, 3], [3, 3], [3, 3]], deckhouse: [['captain_cabin', 'chart_room'], ['bridge', 'command_room']], mounts: 6, added: ['D1_L3', 'D2_R3', 'D3_L3', 'D4_R3', 'command_room'] }
];

function idsFor(level) {
  return level.decks.flatMap((sides, deckIndex) => {
    const [left, right] = sides;
    return [...Array(left)].map((_, i) => `slot_D${deckIndex + 1}_L${i + 1}`)
      .concat([...Array(right)].map((_, i) => `slot_D${deckIndex + 1}_R${i + 1}`));
  });
}

const layout = {
  version: 2, status: 'REVIEW', orientation: { bow: 'right', travel_axis: '+X', weapon_aim: 'right' },
  slot_rules: {
    normal_room_slot_cost: 1,
    deck_weapon_cabin_slot_cost: 0,
    deck_weapon_capacity_key: 'deck_mount_count',
    access_core_cabin_slot_cost: 0,
    slot_id_pattern: 'slot_D{deck_from_top}_{L|R}{distance_from_access_core}'
  },
  access_core: {
    fixed: true, vertical_through_all_cabin_decks: true,
    anchors_per_deck: ['corridor_left', 'corridor_right', 'ladder_up', 'ladder_down'],
    deck_anchor: 'deck_exit'
  },
  hull_levels: levels.map(level => ({
    hull_level: level.level,
    cabin_deck_count: level.decks.length,
    deck_slot_sides: level.decks.map((sides, i) => ({ deck: `D${i + 1}`, left: sides[0], right: sides[1], total: sides[0] + sides[1] })),
    cabin_slot_count: level.decks.reduce((sum, sides) => sum + sides[0] + sides[1], 0),
    stable_slot_ids: idsFor(level),
    fixed_deckhouse_floors: level.deckhouse,
    fixed_deckhouse_room_count: level.deckhouse.flat().length,
    deck_mount_count: level.mounts,
    added_at_this_level: level.added
  })),
  camera_policy: {
    readability_floor_px: { room_width: 150, room_height: 100, crew_height: 72, deck_weapon_width: 80 },
    management: {
      levels_1_3: 'full_ship_fit',
      levels_4_5: 'full_ship_fit_until_readability_floor_then_horizontal_pan',
      levels_6_7: 'overview_lod_plus_floor_focus; never shrink detailed rooms below readability floor'
    },
    sailing: 'Use exterior hull LOD for full-ship view; open cutaway only for selected deck or room.',
    combat: 'Frame ship at 48-56% viewport width, prioritize upper deck and sea approach, dim or hide cabin interiors, and render crew/weapons from independent combat anchors without changing logic hitboxes.',
    transition: 'Camera zoom and LOD cross-fade only; simulation coordinates and slot IDs remain unchanged.'
  },
  scope_note: 'Vertical slice still implements Lv1-Lv3 only. Lv4-Lv7 are forward-compatible art/layout specifications, not current implementation scope.'
};
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2));

const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function ship(level, originX, originY, scale) {
  const cellW = 62 * scale; const cellH = 38 * scale; const coreW = 18 * scale; const gap = 3 * scale;
  const maxSide = Math.max(...level.decks.flat());
  const halfW = maxSide * (cellW + gap);
  const deckTop = originY + 72 * scale;
  const hullLeft = originX - halfW - 38 * scale;
  const hullRight = originX + halfW + 38 * scale;
  const cabinBottom = deckTop + level.decks.length * (cellH + gap) + 18 * scale;
  let svg = `<path d="M${hullLeft},${deckTop - 8 * scale} Q${hullLeft - 12 * scale},${cabinBottom - 10 * scale} ${hullLeft + 30 * scale},${cabinBottom} H${hullRight - 30 * scale} Q${hullRight + 18 * scale},${cabinBottom - 35 * scale} ${hullRight},${deckTop - 8 * scale}Z" fill="#243744" stroke="#a9835b" stroke-width="${2.5 * scale}"/>`;
  level.decks.forEach((sides, deckIndex) => {
    const y = deckTop + deckIndex * (cellH + gap);
    for (let i = 0; i < sides[0]; i++) svg += `<rect x="${originX - coreW / 2 - (i + 1) * (cellW + gap)}" y="${y}" width="${cellW}" height="${cellH}" fill="#17242e" stroke="#c09a6a" stroke-width="${1.8 * scale}"/>`;
    for (let i = 0; i < sides[1]; i++) svg += `<rect x="${originX + coreW / 2 + gap + i * (cellW + gap)}" y="${y}" width="${cellW}" height="${cellH}" fill="#17242e" stroke="#c09a6a" stroke-width="${1.8 * scale}"/>`;
  });
  svg += `<rect x="${originX - coreW / 2}" y="${deckTop - 8 * scale}" width="${coreW}" height="${level.decks.length * (cellH + gap) + 8 * scale}" fill="#604a38" stroke="#d4ad78" stroke-width="${1.8 * scale}"/>`;
  for (let y = deckTop + 4 * scale; y < cabinBottom - 20 * scale; y += 10 * scale) svg += `<line x1="${originX - coreW * .32}" y1="${y}" x2="${originX + coreW * .32}" y2="${y}" stroke="#dfbd88" stroke-width="${1.5 * scale}"/>`;
  level.deckhouse.forEach((floor, floorIndex) => {
    const w = floor.length * 54 * scale; const x = originX - halfW + 8 * scale;
    const y = deckTop - (floorIndex + 1) * 34 * scale - 12 * scale;
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${30 * scale}" fill="#4a392e" stroke="#d0a66e" stroke-width="${1.8 * scale}"/>`;
  });
  for (let i = 0; i < level.mounts; i++) {
    const x = originX + 35 * scale + i * 22 * scale;
    svg += `<path d="M${x},${deckTop - 3 * scale} h${14 * scale} l${8 * scale},${-7 * scale} h${10 * scale}" stroke="#d7b17b" stroke-width="${2 * scale}" fill="none"/>`;
  }
  svg += `<text x="${originX}" y="${cabinBottom + 24 * scale}" text-anchor="middle" fill="#eee" font-size="${14 * scale}">Lv${level.level} · ${level.decks.reduce((n,s)=>n+s[0]+s[1],0)}舱位 · ${level.decks.length}层</text>`;
  return svg;
}

const placements = [
  [1, 255, 170, 1.2], [2, 720, 170, 1.05], [3, 1230, 170, 1.0], [4, 1660, 170, .9],
  [5, 330, 720, .88], [6, 935, 720, .8], [7, 1570, 720, .72]
];
const progressionSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1180"><rect width="1920" height="1180" fill="#15212d"/><g font-family="Microsoft YaHei,sans-serif"><text x="48" y="58" fill="#eee" font-size="34">Lv1–Lv7 多层船体舱位演进 · REVIEW</text><text x="48" y="94" fill="#b8c8d4" font-size="20">普通房间=1舱位；火炮只占甲板炮位；中央梯井与固定甲板建筑不占普通舱位</text>${placements.map(([n,x,y,s]) => ship(levels[n-1],x,y,s)).join('')}<g fill="#b8c8d4" font-size="20"><text x="48" y="1080">纵向优先：Lv2加第二层，Lv4加第三层，Lv6加第四层；横向只在 Lv3/Lv5/Lv7 扩宽。</text><text x="48" y="1115">终极 Lv7：4层×6舱位=24普通舱位；甲板建筑2层共4个固定功能房；6个独立甲板炮位。</text><text x="48" y="1150">垂直切片仍只实现 Lv1–Lv3；Lv4–Lv7 仅冻结扩展接口与美术比例。</text></g></g></svg>`;

const cameraSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#15212d"/><g font-family="Microsoft YaHei,sans-serif"><text x="45" y="58" fill="#eee" font-size="32">大型船体镜头与细节保真策略 · REVIEW</text><g transform="translate(45 105)"><rect width="470" height="650" rx="12" fill="#233542" stroke="#7890a0"/><text x="25" y="42" fill="#fff" font-size="24">① 全船总览 / 航行</text><rect x="35" y="95" width="400" height="250" fill="#101923" stroke="#587080"/><path d="M70 245 Q90 330 395 315 Q430 275 415 205 L100 205Z" fill="#344b58" stroke="#b28e64" stroke-width="4"/><g fill="#b8c8d4" font-size="18"><text x="25" y="400">使用外观LOD，不强求看清每个房间</text><text x="25" y="435">Lv6–7 保留轮廓、炮位和受击反馈</text><text x="25" y="470">点击楼层或房间进入细节镜头</text></g></g><g transform="translate(565 105)"><rect width="470" height="650" rx="12" fill="#233542" stroke="#7890a0"/><text x="25" y="42" fill="#fff" font-size="24">② 经营 / 楼层聚焦</text><rect x="35" y="95" width="400" height="250" fill="#101923" stroke="#587080"/><g fill="#17242e" stroke="#c09a6a" stroke-width="3">${[0,1,2,3].map(i=>`<rect x="${55+i*92}" y="175" width="84" height="90"/>`).join('')}</g><g fill="#b8c8d4" font-size="18"><text x="25" y="400">房间宽≥150px、高≥100px</text><text x="25" y="435">低于阈值就平移，不再继续缩小</text><text x="25" y="470">船员显示高度至少72px</text></g></g><g transform="translate(1085 105)"><rect width="470" height="650" rx="12" fill="#233542" stroke="#7890a0"/><text x="25" y="42" fill="#fff" font-size="24">③ 战斗 / 甲板聚焦</text><rect x="35" y="95" width="400" height="250" fill="#101923" stroke="#587080"/><path d="M55 280 H260 Q300 270 315 205 H80Z" fill="#344b58" stroke="#b28e64" stroke-width="4"/><path d="M150 205 h35 l20 -18 h35" fill="none" stroke="#ffd27d" stroke-width="6"/><circle cx="360" cy="210" r="28" fill="#5b3240"/><g fill="#b8c8d4" font-size="18"><text x="25" y="400">船体占屏宽48%–56%</text><text x="25" y="435">突出甲板炮、船员与来袭怪物</text><text x="25" y="470">舱内降暗/LOD，不缩放逻辑碰撞</text></g></g><text x="45" y="835" fill="#d8c49c" font-size="21">镜头和LOD只改变表现；槽位、路径、炮位与战斗坐标始终保持不变。</text></g></svg>`;

(async () => {
  await sharp(Buffer.from(progressionSvg)).png().toFile(progressionFile);
  await sharp(Buffer.from(cameraSvg)).png().toFile(cameraFile);
  fs.writeFileSync(boardFile, '<!doctype html><meta charset="utf-8"><title>Lv1-Lv7 multideck ship REVIEW</title><style>body{background:#15212d;color:#eee;font:16px/1.7 sans-serif;margin:24px}img{max-width:100%;display:block;margin:18px 0;background:#233542}</style><h1>Lv1–Lv7 多层船体与镜头方案 · REVIEW</h1><p>普通房间统一占1个舱位，火炮只占甲板炮位；中央梯井与固定甲板建筑不占普通舱位。纵向扩层优先，避免后期船体无限横向拉长。</p><img src="ship_hull_progression_lv1_lv7_v002.png"><h2>大型船体镜头策略</h2><img src="ship_camera_scaling_v002.png"><p>Lv4–Lv7 是扩展规范，不扩大当前垂直切片实现范围。</p>');
  const manifest = {
    task_id: 'VS-ART-HULL-PROGRESSION-01', version: 2, status: 'REVIEW', generator: 'deterministic SVG layout builder',
    prompt: null, negative_prompt: null, model: null, seed: null,
    references: ['ship_access_core_ladder_v001', 'room_1001_power_single_v005', 'ship_hull_visual_right_v009'],
    manual_edits: ['Designed stable Lv1-Lv7 multi-deck slot topology', 'Separated cabin slots from deck weapon mounts', 'Added two-floor final deckhouse and camera/LOD policy'],
    reviewer: '', review_notes: 'Topology and visual proportions pending approval. Lv4-Lv7 are forward specifications only.',
    artifacts: [layoutFile, progressionFile, cameraFile, boardFile].map(file => ({ path: path.relative(root, file).replace(/\\/g, '/'), sha256: sha256(file) }))
  };
  fs.writeFileSync(path.join(manifestDir, 'ship_multideck_progression_v002.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ status: 'REVIEW', levels: layout.hull_levels.map(l => ({ level: l.hull_level, cabin_slots: l.cabin_slot_count, decks: l.cabin_deck_count, fixed_rooms: l.fixed_deckhouse_room_count, mounts: l.deck_mount_count })) }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
