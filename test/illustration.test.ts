import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanSceneLine } from "../src/harness/illustration.ts";

test("配图：合并多行（只取第一行会得到半句话——这是踩过的坑）", () => {
	const raw = "微距昆虫摄影。一只工蚁伏在砖缝前仰起头，\n砖缝里是用白砂糖画的圆形法阵，\n浅景深，浮尘，写实电影感。";
	const out = cleanSceneLine(raw);
	assert.ok(out.includes("一只工蚁"), "主体必须保留");
	assert.ok(out.includes("写实电影感"), "结尾的风格词也要保留（说明是全文合并，不是只取首行）");
	assert.ok(!out.includes("\n"), "应压成一行");
});

test("配图：剥掉内联思考块", () => {
	const out = cleanSceneLine("<think>先想想怎么画</think>一只工蚁在台阶上");
	assert.equal(out, "一只工蚁在台阶上");
});

test("配图：去掉模型照抄模板时带出的尖括号与字段标签", () => {
	const out = cleanSceneLine("<主体：一只工蚁伏在砖缝前>，<环境：水泥台阶>，<光：暖色侧光从左上压下>");
	assert.ok(!out.includes("<") && !out.includes(">"), "尖括号要清掉");
	assert.ok(!out.includes("主体：") && !out.includes("环境："), "字段标签要清掉");
	assert.ok(out.includes("一只工蚁"));
});

test("配图：剥掉列表符号、压平空白、去掉首尾引号", () => {
	const out = cleanSceneLine('1. 「一只工蚁在台阶上」\n   - 浅景深');
	assert.ok(!out.startsWith("1."), "行首列表符号要清掉");
	assert.ok(!out.includes("  "), "连续空白要压平");
	assert.ok(!out.startsWith("「") && !out.endsWith("」"), "首尾引号要清掉");
});

test("配图：空输入与纯思考块都返回空串", () => {
	assert.equal(cleanSceneLine(""), "");
	assert.equal(cleanSceneLine("<think>只有思考，没有正文</think>"), "");
});
