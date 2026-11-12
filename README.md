# dsh-agent-team-policy

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) plugin that decides **when** the agent may spawn subagents or teammates — instead of leaving the harness's "delegate in the background by default" guidance as the only rule in context.

One system-prompt section. No tools, no services, no dependencies.

## Why

Two things are worth a fresh context:

1. **Adversarial review.** A model reviewing its own output in the same context tends to confirm its own judgement. A reviewer that cannot see the reasoning that produced the code has a real chance of finding the counterexample.
2. **One-shot context.** Searching a large codebase or reading long logs bulges the main loop. Send the reading out, get back a summary, an evidence trail and the open questions — not the raw material.

Everything else — a small edit, a decision you cannot make without seeing the source, work you already understand — belongs in the main loop.

## What it injects

One section, `delegation:policy`, at prompt order `100`:

- after the persona (`0`),
- before plan mode (`500`), the Agent Teams policy (`600`) and every tool section (`1000+`),
- so it is read *before* any tool guidance that says "start independent delegations together".

The text allows exactly the two cases above, lists the cases that must stay local (single-file change, need the raw material to decide, no verifiable per-subtask output, already know the answer), and requires every delegation to state its goal, acceptance criteria, write scope, and whether it needs this conversation. Parallel work must not overlap write scopes; reuse an idle subagent before starting another; no padding. It also requires checking with the user before every delegation — nothing is started automatically unless the user explicitly asked for it.

## Install

```sh
dsh plugin add dsh-agent-team-policy
```

From a local checkout or any directory containing this package:

```sh
dsh plugin add /absolute/path/to/dsh-agent-team-policy
```

Or install the directory as a bundle from the app's Plugins page. Nothing else to configure: the bundle patch mounts one host plugin, the plugin registers one section.

## Verify

Start a new session and ask the agent to repeat its delegation rules, or take a one-file change and watch that it does not delegate. The section is visible in the assembled system prompt; it is also inherited by every subagent a session spawns, so grandchildren are constrained by the same rule.

## Limits

- **Guidance, not enforcement.** It cannot block a `subagent` or `spawn_teammate` call; a harness-level cap (`maxDepth`, `toolFilter`) still belongs in the tool config.
- **Appended, not replaced.** `@deepseek-ai/dsh-tool-subagent` ships its own section that still says "background by default"; the policy text explicitly claims precedence over it.
- **`complete: true` presets drop it.** A preset that replaces the whole system prompt (the shipped `minimal` preset does) keeps only its own persona.
- **The rule text is Chinese.** Edit `POLICY` in [`lib/index.js`](lib/index.js) to change the wording or the language; the plugin deliberately has no config schema, so there is nothing to validate and nothing to break on mount.

## Compatibility

Written against dsh `0.2.2-rc.1` and only uses `ctx.systemPrompt.section({ name, order, text })`. Any build that exposes the `systemPrompt` service works.

## License

MIT — see [LICENSE](LICENSE).
