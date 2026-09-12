# 《全巢之力》配图

全部为**程序化生成的矢量插画（SVG）**，零外部依赖、零 API、可无损缩放；同目录附 PNG 位图版（`png/`）。

重新生成（改颜色、改构图后跑一次即可）：

```bash
node art/make-art.mjs
```

## 美术方向

微距昆虫摄影 + 宇宙恐怖：浅景深、钠灯的暖侧光、浮尘、被放大的细部。一条铁律——**神永远不在画面里**，只以"画外压下来的暗影与暖光"表示；因为在这部作品里，神从来不真正在场，他只是一个恰好路过的普通人。

## 文件

| 文件 | 画面 | 建议用途 |
| --- | --- | --- |
| `cover.svg` | 夜色台阶上的法阵与你的名字（缺最后一笔） | 封面 / 开场页 / 作品计划书首图 |
| `act1.svg` | 幕一·显灵：圆阵、发光名字、驻足的蚂蚁 | 第一幕 banner |
| `act2.svg` | 幕二·应许：白砂糖如雪落下、你脚踩出的凹痕 | 第二幕 banner |
| `act3.svg` | 幕三·狂热：蚁群朝圣的长队、远处的圣战火线 | 第三幕 banner |
| `act4.svg` | 幕四·求爱者：两只蚂蚁，头顶压着失焦的暖影 | 第四幕 banner |
| `act5.svg` | 幕五·开水：壶、蒸汽、漫过巢穴的深色水流 | 第五幕 banner |
| `act6.svg` | 幕六·新世代：冷色黎明、重画的法阵、刻着戒律的石页 | 第六幕 banner / 结局页 |
| `cast.svg` | 七个角色的剪影与标注（蚁后有巨腹、断颚有巨颚） | 人物页 / 设定展示 |
| `rune.svg` | 法阵纹样（正圆构图，可平铺） | 网页背景 / 章节分隔图 |
| `png/*.png` | 上述全部的位图版 | 放进 PPT / 计划书 / 演示视频 |

## 接进 Web UI

要把配图挂上去，最省事的是让每一幕的图像作为对话区顶部的 banner。SVG 可直接内联，也可当图片引用：

```html
<!-- 按当前幕切换 → assets/campaigns/ants/art/act1.svg ... act6.svg -->
<div id="act-banner">
  <img src="/assets/campaigns/ants/art/act1.svg" alt="第一幕·显灵" style="width:100%;border-radius:12px">
</div>
```

幕号来自 `GET /api/state` 的 `mainline.phaseId`（`p1-theophany` … `p6-nextgen`）。浏览器直开 `art/index.html` 可看全部配图的画廊。

## 版权

图像为原创程序化矢量图，可随作品自由使用；底层故事改编自知乎答主 **@狐狸** 的回答（https://www.zhihu.com/question/621853865/answer/3263972389），第 1-5 幕忠于原著，第 6 幕为演绎。
