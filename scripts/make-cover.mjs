/**
 * 生成《全巢之力》的封面。
 * 用的是本项目自己那条图像链路（与每回合插画同一个网关、同一套美术方向），
 * 只是提示词换成封面用的固定构图。
 *
 *   node scripts/make-cover.mjs            # 出到 assets/campaigns/ants/art/cover.jpg
 *   node scripts/make-cover.mjs --out D:/Temp   # 出到别处（候选图挑选用）
 */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../src/config.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = loadConfig();

/** 封面专用美术方向：人类视角的普通夜景，蚁退到远景——不渗人 */
const COVER_DIRECTION = `实拍夜景摄影，真实照片质感，夏夜，浅景深，钠灯的暖色侧光，空气里的浮尘，自然主义写实，电影感。
情绪基调（重要）：**安静、疲惫、温柔，带一点点荒诞的暖意**。这不是恐怖片海报——**不要惊悚感、不要虫群密集感、不要虫眼或口器的特写、不要粘液与湿滑质感、不要把虫子拍成威胁**。
铁律：神（人类）永远不能出现在画面里——不许出现手指、手、人影、人体局部、人脸；但允许出现他留下的痕迹（外卖塑料袋、钥匙、鞋印、门口的地垫）。
构图：以人类站在门口低头看的视角拍这段台阶；台阶本身、墙面与夜色是画面前景与背景的主体，**画面下方只留很小的一圈亮**（蚂蚁用亮晶晶的粉末围成的圆阵）——蚂蚁在这个尺寸下只是光圈边缘一点看不清个体的细密纹理，绝不允许出现任何一只蚂蚁的特写或主体化呈现。
画面上方留大面积的深色（夜空、墙面、楼道阴影），便于叠加标题与说明文字。
画面中不出现任何印刷体文字、字幕、水印、UI 元素。

{{PROMPT}}`;

const CANDIDATES = [
  {
    name: "cover-wide",
    prompt: `夏夜，城市老楼门口的一段水泥台阶，从站在门口的人低头看的角度拍过去：台阶表面粗糙、有裂纹与旧鞋印，右下角随便搁着一只装着外卖的白色塑料袋，袋口露出一次性筷子，旁边台阶上落着一串钥匙；楼道口的声控灯刚亮起来，一道暖黄色的钠灯光斜斜地切过整个台阶，光柱里浮尘飞舞；台阶最下面一格，砖缝边有一小圈亮晶晶的反光——那是盐粒、砂糖与细碎玻璃渣围成的圆，光很弱、很小，在夜色里只占画面下方一点点；画面上方与两侧是深蓝到近黑的夜色与模糊的墙根，静、空、没有人；浅景深，浮尘，写实电影感`,
  },
  {
    name: "cover-quiet",
    prompt: `雨后的夏夜，一段被踩得发亮的水泥台阶，楼道的感应灯在前面亮了一盏，暖黄色的光顺着台阶斜铺下来，台阶上有一小滩没干的雨水映着灯光；台阶边缘放着半袋没拆的外卖，塑料袋上凝着水珠；砖缝的阴影里，很小很小的一圈亮晶晶的粉末反光，像谁不小心洒在那里的一点糖——在照片里只是指甲盖大小的一点亮，看不清是什么；周围是深到发蓝的夜色和湿漉漉的墙面，安静得像整个城市都睡了；浅景深，浮尘，写实电影感`,
  },
  {
    name: "cover-ring",
    prompt: `夏夜楼道口的台阶特写，但取景是人的站立视角、画面主体是台阶与光：粗糙水泥的台阶面占了画面下半部，一道暖黄色钠灯光从右上方斜切下来，照亮台阶表面细小的砂粒与一道旧裂纹；台阶底部靠近砖缝的位置，有一个由发亮的细碎粉末围成的小圆圈，圈里有一些更小的、几乎看不清的深色小点（那是一只只工蚁，但在照片这个距离上只是看不真切的细密纹理，绝不能拍清楚任何一只）；画面上半部是失焦的夜色与墙根的深影，浮尘在光里慢慢浮动；整体安静、温柔、有点荒诞的暖意，一点也看不出是危险的东西；浅景深，写实电影感，微距都算不上的普通夜景照片`,
  },
];

async function generate(prompt) {
  const providers = [
    { apiBase: cfg.apiBase, apiKey: cfg.apiKey },
    ...(cfg.fallbacks ?? []).map((f) => ({ apiBase: f.apiBase, apiKey: f.apiKey })),
  ];
  for (const p of providers) {
    if (!p.apiBase || !p.apiKey) continue;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.illustrationTimeoutMs ?? 90_000);
    try {
      const res = await fetch(`${p.apiBase.replace(/\/+$/, "")}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${p.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.illustrationModel,
          prompt: COVER_DIRECTION.replace("{{PROMPT}}", prompt),
          size: cfg.illustrationSize,
          n: 1,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        console.log(`  provider ${p.apiBase} → HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const item = data?.data?.[0];
      if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
      if (item?.url) {
        const img = await fetch(item.url);
        if (img.ok) return Buffer.from(await img.arrayBuffer());
      }
    } catch (e) {
      console.log(`  provider 失败：${String(e).slice(0, 80)}`);
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

const outArgIdx = process.argv.indexOf("--out");
const outDir = outArgIdx > 0 ? process.argv[outArgIdx + 1] : resolve(root, "assets/campaigns/ants/art");
mkdirSync(outDir, { recursive: true });

console.log(`模型：${cfg.illustrationModel}`);
for (const c of CANDIDATES) {
  const t0 = Date.now();
  const buf = await generate(c.prompt);
  if (!buf) {
    console.log(`✗ ${c.name} 出图失败`);
    continue;
  }
  const file = resolve(outDir, `${c.name}.jpg`);
  writeFileSync(file, buf);
  console.log(`✓ ${c.name}.jpg  ${(buf.length / 1024).toFixed(0)}KB  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
