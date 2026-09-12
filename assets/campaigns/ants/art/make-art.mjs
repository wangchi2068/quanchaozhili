/**
 * 《全巢之力》配图生成器（程序化 SVG，零外部依赖 / 零 API）
 *
 *   node art/make-art.mjs
 *
 * 产出（art/ 目录）：
 *   cover.svg       封面主视觉
 *   act1..act6.svg  六幕场景插画（1600×900）
 *   cast.svg        人物图谱（七只蚂蚁，各有辨识特征）
 *   rune.svg        法阵纹样（可作网页背景/分隔）
 *
 * 美术方向：微距昆虫摄影 + 自然主义 + 宇宙恐怖。
 * 核心审美：蚂蚁是深褐/近黑的虫体，体表上缘只有一道细的暖色高光（钠灯掠过的反光）。
 * 剪影靠与背景的明度差读出，绝非自发光体。
 * 一条铁律：**神永远不在画面里**——它只以"画外压下来的巨大暗影 + 暖光"的形式存在。
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)));

let _seed = 20260911;
const rnd = () => ((_seed = (_seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const n = (v) => Math.round(v * 100) / 100;

const defs = () => `
<defs>
  <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#070a12"/><stop offset="55%" stop-color="#0c1120"/><stop offset="100%" stop-color="#05070c"/>
  </linearGradient>
  <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#101d2b"/><stop offset="45%" stop-color="#1f3549"/><stop offset="100%" stop-color="#0a1119"/>
  </linearGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1a1728"/><stop offset="45%" stop-color="#13101e"/><stop offset="100%" stop-color="#090710"/>
  </linearGradient>
  <radialGradient id="lamp" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffc98a" stop-opacity="0.58"/><stop offset="45%" stop-color="#ff9d4d" stop-opacity="0.18"/><stop offset="100%" stop-color="#ff9d4d" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="ember" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ff7a3c" stop-opacity="0.55"/><stop offset="100%" stop-color="#7a1f0a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="cold" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#9dc4e8" stop-opacity="0.45"/><stop offset="100%" stop-color="#31536e" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="warmglow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffb877" stop-opacity="0.16"/>
    <stop offset="50%" stop-color="#ff9d4d" stop-opacity="0.07"/>
    <stop offset="100%" stop-color="#ff9d4d" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffc98a" stop-opacity="0.22"/>
    <stop offset="55%" stop-color="#ffb877" stop-opacity="0.09"/>
    <stop offset="100%" stop-color="#ffb877" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="sugar" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fffdf6"/><stop offset="100%" stop-color="#e2d4b6"/>
  </linearGradient>
  <linearGradient id="steam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e9eef5" stop-opacity="0.30"/><stop offset="100%" stop-color="#e9eef5" stop-opacity="0"/>
  </linearGradient>
  <!-- 蚂蚁天然深栗琥珀甲壳渐变：顶部受光微温，腹底深褐近黑，真实昆虫质感 -->
  <linearGradient id="antg" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#583f2c"/>
    <stop offset="32%" stop-color="#3b281b"/>
    <stop offset="70%" stop-color="#241710"/>
    <stop offset="100%" stop-color="#140d08"/>
  </linearGradient>
  <!-- 敌对蚁群：异端暗紫铁黑甲壳渐变，沉郁幽暗 -->
  <linearGradient id="antEnemy" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#46324d"/>
    <stop offset="35%" stop-color="#2e1f34"/>
    <stop offset="75%" stop-color="#1c1221"/>
    <stop offset="100%" stop-color="#110a14"/>
  </linearGradient>
  <linearGradient id="presTop" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#08060a" stop-opacity="0.96"/><stop offset="60%" stop-color="#0e0b12" stop-opacity="0.62"/><stop offset="100%" stop-color="#0e0b12" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="presRight" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0%" stop-color="#08060a" stop-opacity="0.94"/><stop offset="60%" stop-color="#0e0b12" stop-opacity="0.55"/><stop offset="100%" stop-color="#0e0b12" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="presLeft" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#08060a" stop-opacity="0.94"/><stop offset="60%" stop-color="#0e0b12" stop-opacity="0.55"/><stop offset="100%" stop-color="#0e0b12" stop-opacity="0"/>
  </linearGradient>
  <filter id="soft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="softer" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="46"/></filter>
  <filter id="tight" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3.0"/></filter>
  <filter id="sharpRim" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.8"/></filter>
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <radialGradient id="vig" cx="50%" cy="48%" r="72%">
    <stop offset="0%" stop-color="#000" stop-opacity="0"/><stop offset="72%" stop-color="#000" stop-opacity="0.12"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
  </radialGradient>
</defs>`;

const canvas = (w, h, bg, body, { grain = 0.07, vignette = 0.72 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${defs()}
<rect width="${w}" height="${h}" fill="url(#${bg})"/>
${body}
<rect width="${w}" height="${h}" fill="url(#vig)" opacity="${vignette}"/>
<rect width="${w}" height="${h}" filter="url(#grain)" opacity="${grain}" style="mix-blend-mode:overlay"/>
</svg>`;

/** 神的在场：只以"画外压下来的暗影 + 一片暖光"表示，永远不给轮廓。
 *  暗影用线性渐变矩形，暖光用超大半径的径向渐变。 */
const presence = (w, h, o = {}) => {
  const side = o.side ?? "top";
  const frac = o.frac ?? 0.62;
  const glow = o.glow ?? 0.5;
  const rect = {
    top: `<rect x="0" y="0" width="${w}" height="${n(h * frac)}" fill="url(#presTop)"/>`,
    right: `<rect x="${n(w * (1 - frac))}" y="0" width="${n(w * frac)}" height="${h}" fill="url(#presRight)"/>`,
    left: `<rect x="0" y="0" width="${n(w * frac)}" height="${h}" fill="url(#presLeft)"/>`,
  }[side];
  const gx = side === "right" ? w * (1 - frac * 0.5) : side === "left" ? w * frac * 0.5 : w * 0.5;
  const gy = side === "top" ? h * frac * 0.55 : h * 0.45;
  return `${rect}
  <ellipse cx="${n(gx)}" cy="${n(gy)}" rx="${n(w * 0.58)}" ry="${n(h * 0.66)}" fill="url(#warmglow)" opacity="${n(Math.min(1, 0.55 * glow))}"/>`;
};

/** 一只蚂蚁（剪影 + 自然微距甲壳层次 + 上缘细暖高光，头在 +x 方向）。
 *  o.gaster 放大后腹，o.mand 放大上颚，o.rim 决定轮廓高光色，o.rimOp 决定高光强度，
 *  o.halo 默认关闭；若传则为极淡去饱和环境微光，绝无自发光彩晕 */
const ant = (x, y, s, rot = 0, o = {}) => {
  const fill = o.fill ?? "url(#antg)";
  const rim = o.rim ?? "rgba(255,212,156,0.78)";
  const legC = o.legColor ?? "#2a1d13";
  const a = o.alpha ?? 1;
  const gs = o.gaster ?? 1;
  const md = o.mand ?? 1;
  const rimOp = o.rimOp ?? 0.72;
  const withHalo = Boolean(o.halo);
  const haloColor = typeof o.halo === "string" ? o.halo : "rgba(255,242,226,0.06)";

  const legs = [];
  for (const i of [-1, 0, 1]) {
    for (const sgn of [-1, 1]) {
      const bx = 3 + i * 2.4, by = sgn * 3.0;
      const kx = 1.2 + i * 5.6, ky = sgn * (10.4 + Math.abs(i) * 0.9);
      const fx = 7.6 + i * 7.8, fy = sgn * (16.6 + Math.abs(i) * 1.7);
      // 深色微距节肢骨架（清晰可辨）
      legs.push(`<path d="M ${n(bx)} ${n(by)} L ${n(kx)} ${n(ky)}" fill="none" stroke="${legC}" stroke-width="1.6" stroke-linecap="round"/>`);
      legs.push(`<path d="M ${n(kx)} ${n(ky)} L ${n(fx)} ${n(fy)}" fill="none" stroke="${legC}" stroke-width="1.2" stroke-linecap="round"/>`);
      // 节肢受光侧极细反光丝（纤细而不发光）
      legs.push(`<path d="M ${n(bx)} ${n(by)} L ${n(kx)} ${n(ky)}" fill="none" stroke="${rim}" stroke-width="0.45" stroke-linecap="round" opacity="${n(0.32 * rimOp)}"/>`);
      legs.push(`<path d="M ${n(kx)} ${n(ky)} L ${n(fx)} ${n(fy)}" fill="none" stroke="${rim}" stroke-width="0.35" stroke-linecap="round" opacity="${n(0.26 * rimOp)}"/>`);
    }
  }

  // 腹部节环几何尺寸
  const gasterRx = 10.2 * gs;
  const gasterRy = 7.5 * (0.65 + gs * 0.35);
  const seg1X = -12 * gs + gasterRx * 0.35;
  const seg2X = -12 * gs;
  const seg3X = -12 * gs - gasterRx * 0.35;
  const segH1 = gasterRy * 0.85;
  const segH2 = gasterRy * 0.92;
  const segH3 = gasterRy * 0.78;

  // 极淡去饱和空气尘晕（默认关闭，仅主角特写极微量呈现）
  const halo = withHalo ? `
    <ellipse cx="${n(-3 * gs)}" cy="0" rx="${n(16 * Math.max(1, gs))}" ry="10" fill="${haloColor}" opacity="${n(o.haloOp ?? 0.07)}" filter="url(#soft)"/>` : "";

  return `<g transform="translate(${n(x)},${n(y)}) rotate(${rot}) scale(${s})" opacity="${a}">
    ${halo}
    ${legs.join("")}
    <!-- 触角深色骨架与微距反光丝 -->
    <path d="M 13 -3.4 C 19 -10.5, 23 -12, 26.4 -9.6" fill="none" stroke="${legC}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M 13 -3.4 C 19 -10.5, 23 -12, 26.4 -9.6" fill="none" stroke="${rim}" stroke-width="0.45" stroke-linecap="round" opacity="${n(0.36 * rimOp)}"/>
    <path d="M 13 3.4 C 19 10.5, 23 12, 26.4 9.6" fill="none" stroke="${legC}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M 13 3.4 C 19 10.5, 23 12, 26.4 9.6" fill="none" stroke="${rim}" stroke-width="0.45" stroke-linecap="round" opacity="${n(0.36 * rimOp)}"/>
    <!-- 腹、腰、胸、头 四段深褐天然甲壳本体 -->
    <ellipse cx="${n(-12 * gs)}" cy="0.4" rx="${n(gasterRx)}" ry="${n(gasterRy)}" fill="${fill}"/>
    <ellipse cx="-3.4" cy="0" rx="2.4" ry="1.9" fill="${fill}"/>
    <ellipse cx="3" cy="0" rx="6.6" ry="4.7" fill="${fill}"/>
    <ellipse cx="12.6" cy="0.4" rx="5.1" ry="4.6" fill="${fill}"/>
    <!-- 腹部甲壳天然暗凹缝（绝非发光条纹） -->
    <path d="M ${n(seg1X)} ${n(-segH1 * 0.88)} Q ${n(seg1X + 0.6)} 0, ${n(seg1X)} ${n(segH1 * 0.88)}" fill="none" stroke="#140c06" stroke-width="0.65" opacity="0.65"/>
    <path d="M ${n(seg2X)} ${n(-segH2 * 0.88)} Q ${n(seg2X + 0.6)} 0, ${n(seg2X)} ${n(segH2 * 0.88)}" fill="none" stroke="#140c06" stroke-width="0.65" opacity="0.55"/>
    <path d="M ${n(seg3X)} ${n(-segH3 * 0.85)} Q ${n(seg3X + 0.6)} 0, ${n(seg3X)} ${n(segH3 * 0.85)}" fill="none" stroke="#140c06" stroke-width="0.6" opacity="0.45"/>
    <!-- 上颚 -->
    <path d="M 16.4 -1.7 C 19.6 -3.6, 22.4 -1.9, ${n(20.6 + md * 2.4)} 0.2" fill="none" stroke="${legC}" stroke-width="${n(1.3 * md)}" stroke-linecap="round"/>
    <path d="M 16.4 -1.7 C 19.6 -3.6, 22.4 -1.9, ${n(20.6 + md * 2.4)} 0.2" fill="none" stroke="${rim}" stroke-width="${n(0.45 * md)}" stroke-linecap="round" opacity="${n(0.36 * rimOp)}"/>
    <path d="M 16.4 1.7 C 19.6 3.6, 22.4 1.9, ${n(20.6 + md * 2.4)} -0.2" fill="none" stroke="${legC}" stroke-width="${n(1.3 * md)}" stroke-linecap="round"/>
    <path d="M 16.4 1.7 C 19.6 3.6, 22.4 1.9, ${n(20.6 + md * 2.4)} -0.2" fill="none" stroke="${rim}" stroke-width="${n(0.45 * md)}" stroke-linecap="round" opacity="${n(0.36 * rimOp)}"/>
    <!-- 体表上缘一道细的、暖色的微距高光（真实甲壳反光，绝无自发光散晕） -->
    <g filter="url(#sharpRim)">
      <path d="M ${n(-12 * gs - gasterRx * 0.62)} ${n(-gasterRy * 0.72)} Q ${n(-12 * gs)} ${n(-gasterRy * 1.01)}, ${n(-12 * gs + gasterRx * 0.52)} ${n(-gasterRy * 0.76)}" fill="none" stroke="${rim}" stroke-width="0.8" stroke-linecap="round" opacity="${n(rimOp * 0.95)}"/>
      <ellipse cx="${n(-12 * gs)}" cy="${n(-gasterRy * 0.72)}" rx="${n(4.6 * gs)}" ry="0.8" fill="${rim}" opacity="${n(rimOp * 0.28)}"/>
      <path d="M -1.6 -3.4 Q 3 -4.75, 7.4 -3.3" fill="none" stroke="${rim}" stroke-width="0.75" stroke-linecap="round" opacity="${n(rimOp * 0.9)}"/>
      <ellipse cx="3" cy="-3.5" rx="3.0" ry="0.65" fill="${rim}" opacity="${n(rimOp * 0.25)}"/>
      <path d="M 9.6 -2.8 Q 13.2 -4.3, 16.6 -2.4" fill="none" stroke="${rim}" stroke-width="0.7" stroke-linecap="round" opacity="${n(rimOp * 0.88)}"/>
      <circle cx="14.2" cy="-2.5" r="0.6" fill="${rim}" opacity="${n(rimOp * 0.6)}"/>
    </g>
  </g>`;
};

const motes = (count, w, h, o = {}) => {
  const col = o.color ?? "#ffd9a0";
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = 0.7 + rnd() * (o.max ?? 2.2);
    out.push(`<circle cx="${n(rnd() * w)}" cy="${n(rnd() * h)}" r="${n(r)}" fill="${col}" opacity="${n(0.06 + rnd() * (o.op ?? 0.5))}"/>`);
  }
  return out.join("");
};

const runeRing = (cx, cy, r, o = {}) => {
  const col = o.color ?? "#fff3d6";
  const dots = [];
  const count = o.count ?? 140;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const rr = r + Math.sin(t * 7) * (o.wobble ?? 3);
    const x = cx + Math.cos(t) * rr, y = cy + Math.sin(t) * rr * (o.squash ?? 0.42);
    dots.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.8 + rnd() * 1.9)}" fill="${col}" opacity="${n((o.dotOp ?? 0.35) + rnd() * 0.6)}"/>`);
  }
  return `<g filter="url(#tight)">${dots.join("")}</g>
  <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * (o.squash ?? 0.42)}" fill="none" stroke="${col}" stroke-width="0.8" opacity="${n(o.ringOp ?? 0.25)}"/>`;
};

const crystal = (x, y, s, rot = 0, op = 1) =>
  `<g transform="translate(${n(x)},${n(y)}) rotate(${rot}) scale(${s})" opacity="${op}">
    <rect x="-6" y="-6" width="12" height="12" rx="2.5" fill="url(#sugar)"/>
    <rect x="-6" y="-6" width="12" height="5" rx="2.5" fill="#ffffff" opacity="0.75"/>
  </g>`;

// ---------- 六幕 ----------
const W = 1600, H = 900;

const cover = () => canvas(W, H, "night", `
  <ellipse cx="800" cy="760" rx="900" ry="420" fill="url(#lamp)" opacity="0.52"/>
  ${presence(W, H, { side: "top", frac: 0.52, glow: 1.4, gx: 800 })}
  ${runeRing(800, 690, 230, { count: 200 })}
  <g filter="url(#tight)" opacity="0.95">
    <path d="M 712 690 L 776 668" stroke="#fff3d6" stroke-width="6" stroke-linecap="round"/>
    <path d="M 776 668 L 792 708" stroke="#fff3d6" stroke-width="6" stroke-linecap="round"/>
    <path d="M 838 660 L 846 706" stroke="#fff3d6" stroke-width="6" stroke-linecap="round"/>
    <path d="M 886 680 L 928 690" stroke="#fff3d6" stroke-width="6" stroke-linecap="round"/>
  </g>
  ${ant(700, 656, 1.65, -160, { rim: "rgba(255,214,150,0.85)", rimOp: 0.72, halo: true, haloOp: 0.06 })}
  ${ant(908, 700, 1.55, -20, { rim: "rgba(255,214,150,0.85)", rimOp: 0.72, halo: true, haloOp: 0.06 })}
  ${motes(150, W, H, { max: 2, op: 0.4 })}
  <g font-family="'Noto Serif SC','Songti SC',serif" text-anchor="middle">
    <text x="800" y="152" font-size="46" fill="#f4ead8" letter-spacing="18" opacity="0.94">全巢之力</text>
    <text x="800" y="198" font-size="17" fill="#c8b79c" letter-spacing="9" opacity="0.75">HOW  HEAVY  THE  WHOLE  NEST</text>
    <text x="800" y="240" font-size="14" fill="#8f8371" letter-spacing="4" opacity="0.7">一个关于许愿的故事 · 改编自知乎 @狐狸</text>
  </g>
`, { vignette: 0.78 });

const act1 = () => canvas(W, H, "night", `
  <!-- 楼道：声控灯从门洞里漏出来 -->
  <ellipse cx="330" cy="190" rx="640" ry="450" fill="url(#lamp)"/>
  <rect x="0" y="0" width="${W}" height="472" fill="#0a0910" opacity="0.72"/>
  <path d="M 186 0 L 186 454" stroke="#221e2e" stroke-width="3" opacity="0.9"/>
  <path d="M 474 0 L 474 454" stroke="#221e2e" stroke-width="3" opacity="0.9"/>
  <path d="M 186 452 L 474 452" stroke="#221e2e" stroke-width="3" opacity="0.9"/>
  <rect x="194" y="0" width="272" height="450" fill="#100e1a" opacity="0.6"/>
  <ellipse cx="330" cy="300" rx="200" ry="150" fill="#ffb877" opacity="0.10" filter="url(#soft)"/>
  <!-- 台阶面 -->
  <rect x="0" y="470" width="${W}" height="${H - 470}" fill="url(#ground)"/>
  <!-- 台阶接触面微光漫反射：让蚂蚁剪影自然脱出底面 -->
  <rect x="0" y="470" width="${W}" height="280" fill="url(#spill)" opacity="0.32" filter="url(#soft)"/>
  <path d="M 0 470 L ${W} 470" stroke="#382f45" stroke-width="2.4" opacity="0.88"/>
  <path d="M 0 470 L ${W} 470" stroke="#ffb877" stroke-width="1.2" opacity="0.22"/>
  <path d="M 0 604 L ${W} 604" stroke="#2e253a" stroke-width="1.5" opacity="0.55"/>
  <path d="M 0 712 L ${W} 712" stroke="#251e32" stroke-width="1" opacity="0.4"/>
  <!-- 门洞里漏出来的光，铺在台阶上 -->
  <path d="M 194 452 L 466 452 L 664 900 L 4 900 Z" fill="url(#spill)" filter="url(#soft)"/>
  <ellipse cx="330" cy="560" rx="230" ry="70" fill="#ffb877" opacity="0.08" filter="url(#soft)"/>
  ${presence(W, H, { side: "right", frac: 0.38, glow: 1.0 })}
  ${runeRing(880, 688, 196, { count: 185 })}
  <g opacity="0.95" filter="url(#tight)">
    <path d="M 750 692 L 810 672" stroke="#fff3d6" stroke-width="5" stroke-linecap="round"/>
    <path d="M 810 672 L 824 706" stroke="#fff3d6" stroke-width="5" stroke-linecap="round"/>
    <path d="M 862 664 L 868 704" stroke="#fff3d6" stroke-width="5" stroke-linecap="round"/>
    <path d="M 904 682 L 944 690" stroke="#fff3d6" stroke-width="5" stroke-linecap="round"/>
    <path d="M 964 700 L 998 706" stroke="#fff3d6" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
  </g>
  ${ant(766, 656, 1.5, -158, { rim: "rgba(255,214,150,0.85)", rimOp: 0.72 })}
  ${ant(918, 702, 1.4, -20, { rim: "rgba(255,214,150,0.85)", rimOp: 0.72 })}
  ${ant(828, 730, 1.3, -90, { rim: "rgba(255,214,150,0.82)", rimOp: 0.70 })}
  ${ant(1000, 672, 1.2, -8, { alpha: 0.95, rim: "rgba(255,214,150,0.80)", rimOp: 0.68 })}
  ${ant(690, 712, 1.25, -120, { alpha: 0.95, rim: "rgba(255,214,150,0.80)", rimOp: 0.68 })}
  ${motes(150, W, H, { max: 1.9, op: 0.4 })}
`, { vignette: 0.74 });

const act2 = () => canvas(W, H, "night", `
  <ellipse cx="820" cy="300" rx="700" ry="420" fill="url(#lamp)" opacity="0.64"/>
  ${presence(W, H, { side: "top", frac: 0.34, glow: 1.2, gx: 820 })}
  <rect x="0" y="490" width="${W}" height="${H - 490}" fill="url(#ground)"/>
  <!-- 黑坑立体下凹阴影 -->
  <ellipse cx="820" cy="706" rx="310" ry="92" fill="#080712" opacity="0.65"/>
  <ellipse cx="820" cy="696" rx="258" ry="68" fill="#110d1a" opacity="0.75"/>
  <!-- 砂糖微光散射与接触光晕 -->
  <ellipse cx="820" cy="700" rx="360" ry="105" fill="#fffdf6" opacity="0.08" filter="url(#soft)"/>
  ${Array.from({ length: 78 }, () => crystal(280 + rnd() * 1060, 210 + rnd() * 470, 0.5 + rnd() * 1.4, rnd() * 90, 0.45 + rnd() * 0.5)).join("")}
  ${Array.from({ length: 30 }, () => crystal(696 + rnd() * 268, 566 + rnd() * 168, 1.6 + rnd() * 1.7, rnd() * 90, 0.85)).join("")}
  ${motes(150, W, H, { color: "#ffffff", max: 2.6, op: 0.6 })}
  <!-- 保持应许之地的和谐幅度，自然主义深壳与糖堆形成高对比 -->
  ${ant(596, 626, 1.6, -30, { rim: "rgba(255,225,170,0.92)", rimOp: 0.82 })}
  ${ant(1014, 640, 1.6, -150, { rim: "rgba(255,225,170,0.92)", rimOp: 0.82 })}
  ${ant(694, 706, 1.8, 8, { rim: "rgba(255,235,190,0.95)", rimOp: 0.86 })}
  ${ant(924, 716, 1.7, -172, { rim: "rgba(255,235,190,0.95)", rimOp: 0.86 })}
  ${ant(820, 594, 1.9, -96, { rim: "rgba(255,240,210,0.98)", rimOp: 0.90 })}
`, { vignette: 0.72 });

const act3 = () => {
  // 己方大军：向右推进的有机暗色蚁群（水平行进，错落层叠，彻底破除单排竖立玉米棒）
  // 52 只蚂蚁分层排布：后层、中层、前层
  const swarmAnts = [];
  for (let i = 0; i < 52; i++) {
    const col = i % 13;
    const row = Math.floor(i / 13);
    const baseX = 120 + col * 74 + (row % 2) * 36 + rnd() * 32;
    const baseY = 620 + row * 38 + rnd() * 24;
    const isTopEdge = baseY < 650;
    const s = 1.05 + row * 0.15 + rnd() * 0.2;
    // 行进朝向：向前微幅起伏攀爬 (-22° ~ +18°)
    const rot = -4 + (rnd() * 36 - 18);
    swarmAnts.push(ant(baseX, baseY, s, rot, {
      alpha: 0.92 + rnd() * 0.08,
      rim: "rgba(255,212,156,0.76)",
      // 仅受光顶缘的蚂蚁高光稍显，深处蚂蚁只呈沉郁深壳剪影
      rimOp: isTopEdge ? 0.62 : (0.28 + rnd() * 0.18),
      halo: false
    }));
  }

  // 敌对蚁群：左向据守的异端铁黑蚁群（面向左 165°~195°）
  const enemyAnts = [];
  for (let i = 0; i < 20; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const baseX = 1170 + col * 64 + (row % 2) * 28 + rnd() * 28;
    const baseY = 585 + row * 32 + rnd() * 20;
    const s = 1.1 + row * 0.12 + rnd() * 0.2;
    const rot = 180 + (rnd() * 30 - 15);
    enemyAnts.push(ant(baseX, baseY, s, rot, {
      alpha: 0.92,
      fill: "url(#antEnemy)",
      legColor: "#221727",
      rim: "rgba(182,168,206,0.52)",
      rimOp: 0.38,
      halo: false
    }));
  }

  return canvas(W, H, "night", `
  <ellipse cx="800" cy="780" rx="840" ry="430" fill="url(#ember)"/>
  <ellipse cx="300" cy="220" rx="480" ry="320" fill="url(#cold)" opacity="0.7"/>
  ${presence(W, H, { side: "top", frac: 0.3, glow: 0.8, gx: 1180 })}
  <rect x="0" y="520" width="${W}" height="${H - 520}" fill="url(#ground)"/>
  <!-- 群体受光上缘总轮廓掠光：整列蚁群作深色整体，仅上缘受火光掠照 -->
  <path d="M 110 636 C 320 608, 540 622, 750 612 C 890 606, 990 620, 1100 642" fill="none" stroke="#ff9d4d" stroke-width="1.6" opacity="0.42" filter="url(#sharpRim)"/>
  <path d="M 150 634 C 340 610, 530 622, 740 613 C 880 608, 980 622, 1080 640" fill="none" stroke="#ffc98a" stroke-width="0.7" opacity="0.65"/>
  <!-- 己方大军 -->
  ${swarmAnts.join("")}
  <g opacity="0.88">
    <path d="M 1140 560 C 1220 500, 1360 500, 1460 560" stroke="#ff8a4c" stroke-width="2.2" fill="none" opacity="0.45"/>
    <!-- 敌对蚁群 -->
    ${enemyAnts.join("")}
  </g>
  <g filter="url(#tight)">${Array.from({ length: 36 }, () => `<circle cx="${n(480 + rnd() * 660)}" cy="${n(676 + rnd() * 184)}" r="${n(1 + rnd() * 2.2)}" fill="#ffb066" opacity="${n(0.25 + rnd() * 0.5)}"/>`).join("")}</g>
  ${motes(160, W, H, { color: "#ffb877", max: 2.2, op: 0.5 })}
`, { vignette: 0.76, grain: 0.08 });
};

const act4 = () => canvas(W, H, "night", `
  <ellipse cx="820" cy="560" rx="600" ry="420" fill="url(#lamp)" opacity="0.54"/>
  ${presence(W, H, { side: "top", frac: 0.46, glow: 1.6, gx: 800 })}
  <rect x="0" y="620" width="${W}" height="${H - 620}" fill="url(#ground)"/>
  <!-- 台阶接触面微光：勾勒巨大蚁足与台阶分界 -->
  <ellipse cx="850" cy="740" rx="420" ry="80" fill="#ffb877" opacity="0.08" filter="url(#soft)"/>
  <!-- 求爱者（左）：深琥珀甲壳 + 钠灯细轮廓光，自然微距质感 -->
  ${ant(690, 726, 5.0, -6, {
    rim: "rgba(255,214,155,0.80)",
    rimOp: 0.74,
    halo: true,
    haloOp: 0.06
  })}
  <!-- 被爱者（右）：收归全作钠灯暖光体系，微温香槟金细轮廓光（告别刺眼冷蓝） -->
  ${ant(1010, 748, 4.1, -178, {
    rim: "rgba(250,235,215,0.76)",
    rimOp: 0.70,
    halo: true,
    haloOp: 0.06
  })}
  <g filter="url(#tight)" opacity="0.85">
    <path d="M 760 660 C 830 622, 906 622, 968 652" stroke="#ffd9a0" stroke-width="1.6" fill="none" opacity="0.38"/>
    <path d="M 766 674 C 834 640, 902 640, 962 666" stroke="#ffd9a0" stroke-width="1.2" fill="none" opacity="0.25"/>
  </g>
  ${motes(110, W, H, { max: 1.7, op: 0.4 })}
`, { vignette: 0.68 });

const act5 = () => canvas(W, H, "night", `
  <ellipse cx="1160" cy="80" rx="520" ry="360" fill="url(#lamp)" opacity="0.52"/>
  ${presence(W, H, { side: "right", frac: 0.4, glow: 1.1 })}
  <rect x="0" y="560" width="${W}" height="${H - 560}" fill="url(#ground)"/>
  <g transform="translate(1120,-40)">
    <path d="M -110 120 L 150 120 L 92 44 L 34 44 L 34 0 L 6 0 L 6 44 L -52 44 Z" fill="#0e0c14"/>
    <path d="M -110 120 L 150 120" stroke="#ffb877" stroke-width="2" opacity="0.5"/>
    <path d="M 92 44 L 176 96 L 168 104 L 84 58 Z" fill="#0b0a10"/>
    <path d="M 84 58 L 168 104" stroke="#ffb877" stroke-width="1.4" opacity="0.45"/>
  </g>
  <path d="M 1272 60 C 1240 260, 1150 420, 1000 560 C 900 660, 780 700, 640 716" stroke="#dfe9f2" stroke-width="7" fill="none" opacity="0.5" filter="url(#soft)"/>
  <path d="M 1272 60 C 1240 260, 1150 420, 1000 560" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.55"/>
  <g filter="url(#soft)" opacity="0.5">${Array.from({ length: 16 }, (_, i) => `<ellipse cx="${n(1080 - i * 40)}" cy="${n(120 + i * 42)}" rx="${n(40 + i * 6)}" ry="${n(18 + i * 3)}" fill="url(#steam)"/>`).join("")}</g>
  <!-- 水潭：深邃暗色水面与灯光微弱倒影 -->
  <ellipse cx="700" cy="734" rx="520" ry="120" fill="#091016" opacity="0.94"/>
  <ellipse cx="700" cy="726" rx="440" ry="86" fill="#0f1922" opacity="0.94"/>
  <ellipse cx="700" cy="726" rx="410" ry="76" fill="#ffb877" opacity="0.05" filter="url(#soft)"/>
  <!-- 水中蚂蚁：回归全作暖褐甲壳，仅受顶灯掠光反照在湿润甲壳上，彻底消除青白 X 光自发光异象 -->
  ${Array.from({ length: 15 }, () => ant(
    420 + rnd() * 640,
    692 + rnd() * 62,
    1.2 + rnd() * 0.9,
    rnd() * 360,
    {
      alpha: 0.90 + rnd() * 0.10,
      fill: "url(#antg)",
      legColor: "#221710",
      rim: "rgba(255,214,165,0.60)",
      rimOp: 0.52,
      halo: false
    }
  )).join("")}
  ${motes(120, W, H, { color: "#ffd9a0", max: 2, op: 0.4 })}
`, { vignette: 0.78, grain: 0.08 });

const act6 = () => canvas(W, H, "dawn", `
  <!-- 黎明：天光斜切进来 -->
  <ellipse cx="840" cy="150" rx="900" ry="400" fill="url(#cold)" opacity="0.95"/>
  <path d="M 1080 -60 L 1420 -60 L 880 424 L 640 424 Z" fill="#dbe8f5" opacity="0.06"/>
  <path d="M 1190 -60 L 1300 -60 L 830 424 L 720 424 Z" fill="#eef4fa" opacity="0.055"/>
  <rect x="0" y="0" width="${W}" height="424" fill="url(#steam)" opacity="0.26"/>
  <!-- 台阶：同一个台阶，很多年之后 -->
  <rect x="0" y="400" width="${W}" height="${H - 400}" fill="url(#ground)"/>
  <!-- 台阶表面晨光漫射：将聚集区地面适度抬亮，让深褐虫体剪影清晰读出，不融于死黑 -->
  <ellipse cx="940" cy="670" rx="380" ry="115" fill="#253245" opacity="0.45" filter="url(#soft)"/>
  <ellipse cx="940" cy="670" rx="260" ry="70" fill="#35455c" opacity="0.18" filter="url(#tight)"/>
  <path d="M 0 400 L ${W} 400" stroke="#8fa8c0" stroke-width="1.6" opacity="0.35"/>
  <path d="M 0 400 L ${W} 400" stroke="#cfdcea" stroke-width="0.8" opacity="0.18"/>
  <path d="M 0 546 L ${W} 546" stroke="#2b2336" stroke-width="1.4" opacity="0.5"/>
  <path d="M 0 690 L ${W} 690" stroke="#221b2d" stroke-width="1" opacity="0.38"/>
  <!-- 上一代留下的旧法阵，已经淡得几乎看不见 -->
  <g opacity="0.30">${runeRing(520, 646, 268, { color: "#8fa8c0", count: 90, dotOp: 0.12, ringOp: 0.12, wobble: 9 })}</g>
  <!-- 这一代重新刻下的圆 -->
  ${runeRing(946, 664, 168, { color: "#dbe8f5", count: 130 })}
  <!-- 经文第一页：刻着戒律的石板 -->
  <g transform="translate(210,596) rotate(-6)">
    <path d="M 0 0 L 236 -20 L 246 74 L 10 94 Z" fill="#191922" opacity="0.96"/>
    <path d="M 0 0 L 236 -20 L 246 74 L 10 94 Z" fill="none" stroke="#8fa8c0" stroke-width="1.4" opacity="0.55"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M ${20 + i * 4} ${18 + i * 7} L ${168 - i * 3} ${10 + i * 7}" stroke="#c9d8e8" stroke-width="${n(1.8 - i * 0.11)}" opacity="${n(0.75 - i * 0.06)}"/>`).join("")}
    <path d="M 190 56 C 216 46, 226 64, 200 74" stroke="#e0ecf7" stroke-width="1.9" fill="none" opacity="0.9"/>
    <path d="M 198 70 L 208 84" stroke="#e0ecf7" stroke-width="1.5" fill="none" opacity="0.72"/>
  </g>
  <!-- 新世代聚集群体：体量适度放大，不透明度拉满，晨曦暖光擦过深褐甲壳，根根肢节清清楚楚 -->
  ${ant(840, 690, 1.85, -12, { rim: "rgba(250,238,220,0.85)", rimOp: 0.78, halo: false })}
  ${ant(1040, 680, 1.65, -168, { rim: "rgba(250,238,220,0.82)", rimOp: 0.75, halo: false })}
  ${ant(690, 655, 1.60, 85, { rim: "rgba(250,238,220,0.80)", rimOp: 0.74, halo: false })}
  ${ant(1140, 720, 1.45, -35, { rim: "rgba(250,238,220,0.78)", rimOp: 0.70, halo: false })}
  ${ant(620, 730, 1.40, -115, { rim: "rgba(250,238,220,0.75)", rimOp: 0.68, halo: false })}
  ${ant(1240, 645, 1.35, -155, { rim: "rgba(250,238,220,0.75)", rimOp: 0.68, halo: false })}
  ${motes(130, W, H, { color: "#cfe0ee", max: 1.7, op: 0.4 })}
`, { vignette: 0.62 });

// ---------- 人物图谱 ----------
// 统一取消七色独立彩灯；以体态结构特征（蚁后巨腹、断颚巨螯、提米轻盈、逆之锐意）区分，统一沐浴极淡暖色底光
const CAST = [
  { nm: "维尔", sub: "司名者 · 大祭司", s: 3.2, gaster: 1.0, mand: 1.0, rimOp: 0.75 },
  { nm: "蚁后", sub: "女王派", s: 3.4, gaster: 1.55, mand: 0.95, rimOp: 0.78 },
  { nm: "提米", sub: "求爱者", s: 2.7, gaster: 0.92, mand: 0.9, rimOp: 0.70 },
  { nm: "缇尔", sub: "被爱者", s: 2.9, gaster: 0.98, mand: 0.95, rimOp: 0.70 },
  { nm: "逆", sub: "不许愿者", s: 3.0, gaster: 0.95, mand: 1.1, rimOp: 0.72 },
  { nm: "灰烬", sub: "献祭派", s: 3.0, gaster: 0.92, mand: 1.1, rimOp: 0.65, legColor: "#221610" },
  { nm: "断颚", sub: "兵蚁统帅", s: 3.3, gaster: 1.05, mand: 2.25, rimOp: 0.75 },
];
const cast = () => {
  const cw = W / CAST.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 560" width="${W}" height="560">
${defs()}
<rect width="${W}" height="560" fill="url(#night)"/>
<!-- 全图统一、极淡的暖色底光漫射，取消廉价七彩聚光灯 -->
<ellipse cx="${W / 2}" cy="290" rx="${n(W * 0.48)}" ry="120" fill="url(#warmglow)" opacity="0.32"/>
${CAST.map((c, i) => `
  <g transform="translate(${n(cw * i + cw / 2)},0)">
    <!-- 标本台极微弱统一底光 -->
    <ellipse cx="0" cy="275" rx="${n(cw * 0.36)}" ry="135" fill="#ffb877" opacity="0.05" filter="url(#softer)"/>
    ${ant(0, 286, c.s, -90, {
      rim: "rgba(255,214,160,0.75)",
      rimOp: c.rimOp,
      gaster: c.gaster,
      mand: c.mand,
      legColor: c.legColor,
      halo: false
    })}
    <text x="0" y="422" font-size="30" fill="#f4ead8" text-anchor="middle" font-family="'Noto Serif SC',serif" letter-spacing="6" font-weight="600">${c.nm}</text>
    <text x="0" y="454" font-size="15" fill="#baa990" text-anchor="middle" font-family="'Noto Serif SC',serif" letter-spacing="3">${c.sub}</text>
    ${i ? `<path d="M ${n(-cw / 2)} 130 L ${n(-cw / 2)} 452" stroke="#261f2c" stroke-width="1.2" opacity="0.75"/>` : ""}
  </g>`).join("")}
<rect width="${W}" height="560" fill="url(#vig)" opacity="0.45"/>
</svg>`;
};

// ---------- 法阵纹样 ----------
const rune = () => canvas(800, 800, "night", `
  ${runeRing(400, 400, 300, { count: 260, squash: 1, wobble: 4 })}
  ${runeRing(400, 400, 250, { count: 200, squash: 1, wobble: 2, color: "#e8d7b6" })}
  <g filter="url(#tight)" opacity="0.85">
    ${Array.from({ length: 12 }, (_, i) => {
      const t = (i / 12) * Math.PI * 2;
      return `<circle cx="${n(400 + Math.cos(t) * 275)}" cy="${n(400 + Math.sin(t) * 275)}" r="4" fill="#fff3d6"/>`;
    }).join("")}
  </g>
  ${ant(400, 400, 3.2, -90, { rim: "rgba(255,214,150,0.78)", rimOp: 0.72, halo: false })}
  ${motes(60, 800, 800, { max: 1.6, op: 0.4 })}
`, { vignette: 0.52 });

// ---------- 输出 ----------
mkdirSync(OUT, { recursive: true });
const files = {
  "cover.svg": cover(),
  "act1.svg": act1(),
  "act2.svg": act2(),
  "act3.svg": act3(),
  "act4.svg": act4(),
  "act5.svg": act5(),
  "act6.svg": act6(),
  "cast.svg": cast(),
  "rune.svg": rune(),
};
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(resolve(OUT, name), svg, "utf8");
  console.log(`  ✓ ${name.padEnd(12)} ${(svg.length / 1024).toFixed(1)} KB`);
}
console.log(`\n共 ${Object.keys(files).length} 张配图已生成 → ${OUT}`);
