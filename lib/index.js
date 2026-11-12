/**
 * dsh-agent-team-policy — one system-prompt section that decides when the agent
 * may delegate, instead of leaving "start subagents in the background by default"
 * as the only guidance in context.
 *
 * Why a section and not a persona: the persona slot (`deployment:persona`) is
 * owned by the preset row `@deepseek-ai/dsh-persona`, so a host plugin that
 * registers the same section name collides and fails. A uniquely named section
 * at order 100 lands after the persona, before plan mode (500), team policy
 * (600) and every tool section (1000+), which is where a rule that must win
 * over tool guidance belongs.
 *
 * @module dsh-agent-team-policy
 */

/** Cordis plugin name. */
export const name = 'agent-team-policy'

/** The prompt registry this row contributes to. */
export const inject = ['systemPrompt']

/**
 * Order of this section in the assembled prompt.
 * 0 is the persona, 500 is plan mode, 600 is the Agent Teams policy, and tool
 * guidance starts at 1000 — so 100 reads before any "use this tool that way".
 */
export const POLICY_ORDER = 100

/**
 * The delegation rule injected into every session.
 *
 * Edit this constant to change the policy: the plugin deliberately has no
 * config schema, so it stays dependency-free and cannot fail to mount on an
 * unknown config key. Keep the "overrides later guidance" sentence — the
 * subagent tool ships its own section that still says "background by default".
 */
export const POLICY = `委派规则（本节优先于后续任何"默认后台起子、并行起子"的工具引导）：

委派子智能体（subagent、subagent_fork，或团队模式下的队友）不是默认动作。只有下面两种情况成立时才允许发起。

1. 对抗性审查。要审查你刚写出的代码、方案或结论时，交给一个独立上下文里的子智能体，并以证伪为目标：要求它找反例、边界条件、安全漏洞、与需求不符之处，禁止复述、赞美和重写。不要自己审查自己的产出——同一个上下文里的自我审查会倾向于确认既有判断，价值很低。

2. 一次性上下文。当工作需要大量阅读（大型代码库检索、多文件比对、长日志或长文档分析），而你只需要结论或摘要、不需要保留原始材料时，把阅读放进子智能体，要求它只回传压缩后的结论、证据位置和不确定点，不要大段粘贴原文。这样主循环不会被原始材料撑爆。

以下情况自己完成，不要委派：
- 单文件或少量改动，几次工具调用就能做完；
- 你必须先看到原始材料才能决定下一步做什么——委派会把决策依据一起拿走；
- 说不出每个子任务独立、可验收的产出，只是想让它们"并行"；
- 你已经把结论想清楚了，只是想让别的东西替你说一遍。

每次委派都要写清四件事：目标、验收标准、写作用域（哪个目录或文件）、以及它是否需要本会话的上下文。并行时写作用域必须互不重叠；能复用一个还没完成工作的子智能体，就不要新起一个；数量以够用为准，不要凑数。

每次委派跟用户确认，除非用户明确要求，否则不要自动发起。`

/**
 * Register the policy section in the calling context's layer.
 *
 * Mounted from the host composition, this layer is global: every session and
 * every subagent it spawns resolves it unless a nearer scope shadows the same
 * name. Nothing shadows `delegation:policy` today.
 */
export function apply(ctx) {
  ctx.systemPrompt.section({
    name: 'delegation:policy',
    order: POLICY_ORDER,
    text: POLICY,
  })
}
