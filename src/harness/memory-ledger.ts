import type { LlmClient } from "../llm/client.ts";
import { metrics } from "../metrics.ts";
import { openStore } from "../store.ts";

/** 账本分区（与内置工具共用同一套语义） */
export const LEDGER_SECTIONS = [
	"characters",
	"items",
	"relations",
	"plots",
	"notes",
] as const;
export type LedgerSection = (typeof LEDGER_SECTIONS)[number];

export interface Ledger {
	version: number;
	updatedAt: string;
	characters: Record<string, unknown>[];
	items: Record<string, unknown>[];
	relations: Record<string, unknown>[];
	plots: Record<string, unknown>[];
	notes: Record<string, unknown>[];
}

export function emptyLedger(): Ledger {
	return {
		version: 1,
		updatedAt: new Date().toISOString(),
		characters: [],
		items: [],
		relations: [],
		plots: [],
		notes: [],
	};
}

export function loadLedger(stateDir: string): Ledger {
	try {
		const store = openStore(stateDir);
		try {
			const raw = store.kvGet("ledger");
			if (!raw) return emptyLedger();
			const parsed = JSON.parse(raw) as Record<string, unknown>;
			const base = emptyLedger();
			for (const s of LEDGER_SECTIONS) {
				if (Array.isArray(parsed[s]))
					base[s] = parsed[s] as Record<string, unknown>[];
			}
			return base;
		} finally {
			store.close();
		}
	} catch {
		return emptyLedger();
	}
}

export function saveLedger(stateDir: string, ledger: Ledger): void {
	const store = openStore(stateDir);
	try {
		store.kvSet("ledger", JSON.stringify(ledger));
	} finally {
		store.close();
	}
}

/**
 * 从模型输出中稳健地提取 JSON：
 * 直接解析 → 剥 ```json 围栏 → 截取首尾大括号。
 * 记账/压缩/摘要都靠它兜底，宁可失败也不让坏文本进账本。
 */
export function extractJson(text: string): unknown | null {
	const t = text.trim();
	if (t.startsWith("{")) {
		try {
			return JSON.parse(t);
		} catch {
			/* fall through */
		}
	}
	const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
	const fencedBody = fenced?.[1];
	if (fencedBody) {
		try {
			return JSON.parse(fencedBody.trim());
		} catch {
			/* fall through */
		}
	}
	const s = t.indexOf("{");
	const e = t.lastIndexOf("}");
	if (s >= 0 && e > s) {
		try {
			return JSON.parse(t.slice(s, e + 1));
		} catch {
			/* fall through */
		}
	}
	return null;
}

/** 条目的去重键：优先用条目自带 key 字段，否则用整条 JSON 字符串 */
function entryKey(entry: unknown): string {
	if (typeof entry === "object" && entry !== null) {
		const k = (entry as Record<string, unknown>).key;
		if (typeof k === "string" && k) return k;
	}
	return JSON.stringify(entry);
}

/**
 * 合并增量账本到现有账本：按分区追加，同名 key 去重（同名更新、不重复堆积）。
 * 多写者（agent 工具 + 旁侧记账）共用这一个合并入口。
 */
export function mergeLedger(
	current: Ledger,
	delta: Record<string, unknown>,
): Ledger {
	const next = emptyLedger();
	for (const s of LEDGER_SECTIONS) next[s] = [...current[s]];
	next.version = current.version;
	next.updatedAt = current.updatedAt;

	for (const s of LEDGER_SECTIONS) {
		const entries = delta[s];
		if (!Array.isArray(entries)) continue;
		for (const entry of entries) {
			if (typeof entry !== "object" || entry === null) continue;
			const key = entryKey(entry);
			const idx = next[s].findIndex((x) => entryKey(x) === key);
			if (idx >= 0)
				next[s][idx] = entry; // 同名更新
			else next[s].push(entry);
		}
	}
	return next;
}

/** 把账本渲染成给剧情模型的紧凑快照文本（注入 system prompt 的"当前世界状态"段） */
export function snapshotText(ledger: Ledger): string {
	const lines: string[] = [];
	for (const s of LEDGER_SECTIONS) {
		if (!ledger[s].length) continue;
		const label = {
			characters: "人物",
			items: "物品",
			relations: "关系",
			plots: "伏笔",
			notes: "备注",
		}[s];
		for (const entry of ledger[s]) {
			const { key, ...rest } = entry as Record<string, unknown>;
			const desc = Object.entries(rest)
				.filter(([, v]) => v !== undefined && v !== null && v !== "")
				.map(
					([k, v]) => `${k}:${typeof v === "object" ? JSON.stringify(v) : v}`,
				)
				.join("，");
			lines.push(`- [${label}] ${desc}`);
		}
	}
	return lines.length ? lines.join("\n") : "（账本为空）";
}

const SCRIBE_SYSTEM = `你是剧情记账员。根据最新一轮剧情，把确定发生的事实与仍在进行的线索写入世界状态账本。
只记录事实，不写推测。对账本已有条目，同名 key 只更新不新增。
输出严格的 JSON 对象（不要 markdown 代码块，不要任何多余文字）：
{
  "characters": [{"key":"唯一名","name":"姓名","desc":"身份/外貌","status":"存活/受伤/失踪/死亡","location":"当前所在地（跟人走：谁在场就写谁的所在地，离场后写『离开·目的地』）","lastSeen":"最近登场回合（数字，离开后不再更新）"}],
  "items": [{"key":"唯一名","name":"物品名","owner":"归属","status":"状态"}],
  "relations": [{"key":"A-B","who":"A","target":"B","type":"关系类型","level":-3到3,"emotion":"情感标签（如：信任/亏欠/戒心/敌意/亲近/畏惧，记录具体事件带来的情感记忆）"}],
  "plots": [{"key":"唯一名","desc":"伏笔/线索内容","status":"未回收","dueAct":"应在第几幕回收（如：幕3）","trigger":"触发关键词（玩家/NPC说到这个词时回收）","hook":"回收时抛什么钩子（一句话）"}],
  "notes": [{"key":"唯一名","content":"备注"}]
}
注意：\n1. location 是"场"——本轮谁在场景里，谁的 location 更新为该场景；本轮明显不在场的已有人物不要动其条目。这让"谁在不在场"成为可判定事实，防止离场人物凭空再出现。\n2. relations 的 emotion 字段记录这条关系的"情感温度"——不止 level 数字，还要写明情感来源（如"邓恩把怀表交给他后，克莱恩对邓恩的信任加深"），后续剧情中 NPC 记得玩家做过什么。\n3. 玩家画像：每 5 回合更新一次 notes 中的固定条目 {"key":"sys-player-profile","content":{"pace":"节奏偏好","decisionPattern":"决策风格（如：谨慎/激进/试探）","recurringThemes":["反复出现的主题"],"actionBias":"行动偏好（对话/调查/战斗）","frustration":"讨厌什么"}}，根据玩家最近的选择推断，让短输入兑底与选项设计更贴合玩家。\n**【经文模式·本战役专用】**除上面的账本外，你还要替蚁群记一条「经文」——把它们对神的理解刻下来：\n① 写进 plots，key 用**中文篇名**：经文·〈篇名〉（两到四个字，如 经文·天罚篇、经文·赐食篇、经文·大水篇；实在取不出篇名就用 经文·第N条）。玩家会在「蚁群手账」的经文分页里读到这个 key，所以不许出现英文、拼音、编号之外的机器味写法；\n② desc 必须写成三段式，用「／」分隔：神实际做了：〈客观事实〉／蚁群记为：〈它们怎么理解这件事〉／记歪在：〈偏差在哪〉；\n③ **「蚁群记为」绝不能等于「神实际做了」**——同一个事实在两边的说法必须能被一眼看出错位（神随手踩死一只兵蚁，经文里就是「神降下天罚，诛灭僭越者」）；\n④ 偏差方向要符合当前话语权最大的派系：维尔派记为恩典与深意、女王派记为资源与代价、灰烬派记为号召、逆记为祸根；\n⑤ 每回合最多新增一条，同一件事不要重复记（已有篇名就更新那一条，别新建）；本轮神没有值得记载的举动（玩家只是说话、发呆、追问）就一条都不要写。\n没有变化的分区输出空数组 []。`;

function buildScribePrompt(opts: {
	characterName: string;
	userInput: string;
	narrative: string;
	current: Ledger;
	turns?: number;
}): string {
	const profileHint =
		opts.turns && opts.turns % 5 === 0
			? "\n【提醒】本轮为第 N 回合（每 5 回合），请更新 notes 中的玩家画像 sys-player-profile（若本轮玩家有明确选择倾向）。"
			: "";
	return `【角色】${opts.characterName}
【本轮用户输入】${opts.userInput}
【本轮剧情正文】${opts.narrative}
【当前账本】${JSON.stringify(opts.current)}${profileHint}
请输出更新后的增量账本 JSON。`;
}

export interface LedgerUpdate {
	ok: boolean;
	error?: string;
	/** 新增/更新的条目数（按分区计） */
	touched?: number;
}

/**
 * 旁侧模型记账：每轮剧情后独立调用一次模型，产出结构化增量并合并入库。
 * 原则：记账失败绝不阻断剧情——任何异常都降级为"保留旧账本 + 返回错误信息"。
 */
export class LedgerService {
	private client: LlmClient;
	private stateDir: string;
	private model?: string;

	constructor(client: LlmClient, stateDir: string, model?: string) {
		this.client = client;
		this.stateDir = stateDir;
		this.model = model;
	}

	load(): Ledger {
		return loadLedger(this.stateDir);
	}

	async updateAfterTurn(opts: {
		characterName: string;
		userInput: string;
		narrative: string;
		turns?: number;
	}): Promise<LedgerUpdate> {
		if (!opts.narrative.trim())
			return { ok: false, error: "本轮无正文，跳过记账" };
		const current = this.load();
		try {
			const res = await this.client.chat(
				[
					{ role: "system", content: SCRIBE_SYSTEM },
					{ role: "user", content: buildScribePrompt({ ...opts, current }) },
				],
				{ temperature: 0.2, maxTokens: 2000, model: this.model },
			);
			const delta = extractJson(res.content) as Record<string, unknown> | null;
			if (!delta)
				return {
					ok: false,
					error: `记账输出非 JSON：${res.content.slice(0, 200)}`,
				};
			const merged = mergeLedger(current, delta);
			merged.updatedAt = new Date().toISOString();
			saveLedger(this.stateDir, merged);
			const touched = LEDGER_SECTIONS.reduce(
				(n, s) =>
					n + (Array.isArray(delta[s]) ? (delta[s] as unknown[]).length : 0),
				0,
			);
			metrics.inc("ledger.success");
			return { ok: true, touched };
		} catch (e) {
			metrics.inc("ledger.failure");
			return { ok: false, error: (e as Error).message };
		}
	}
}
