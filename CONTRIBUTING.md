# 项目规范

## 发布：只用 Automation token，不用动态码

发布**必须使用 npm Automation token**（Classic token，勾选 **bypass 2FA**），**不得依赖一次性动态码（OTP）**。

- 自动化环境（CI、agent 终端）没有 TTY，无法交互式输入动态码；
- OTP 30 秒即过期，任何多一步确认的流程都会失败；
- 遇到 `EOTP` 时，正确做法是重新生成 Automation token，而不是向人索要动态码。

配置方式（二选一）：

```sh
# 写进 ~/.npmrc，覆盖旧的失效 token
npm config set //registry.npmjs.org:_authToken <TOKEN>
```

```sh
# 或只对单次命令生效
npm_config_//registry.npmjs.org/:_authToken=<TOKEN> npm publish
```

约束：

- token 只存在于本机 `~/.npmrc` 或 CI secret，**绝不提交进仓库、贴进公开场合**；
- 发布必须显式指定主站：`--registry=https://registry.npmjs.org`。本机默认源是 npmmirror 镜像，镜像站不接受发布；
- 不要为了发布去改全局 `registry`，那只影响装包，发布用 `publishConfig` 或命令行参数即可。

## 发版顺序

1. 修改 `package.json` 的 `version`；
2. 提交，打 tag：`git tag -a vX.Y.Z -m vX.Y.Z`；
3. 推送：`git push origin main --follow-tags`；
4. 发布：`npm publish --registry=https://registry.npmjs.org`。

顺序不能反：tag 先推、发布在后，保证 npm 上的 tarball 与 tag 指向的提交一致。发布前工作区必须是干净的。

---

# Contributing conventions

## Releasing: Automation token only, no OTP

Publishing **must use an npm Automation token** (Classic token with **bypass 2FA**), never an interactive one-time password.

- Automated environments (CI, agent terminals) have no TTY to type a code into;
- an OTP expires after ~30 seconds, so any extra confirmation step breaks the flow;
- on `EOTP`, regenerate an Automation token instead of asking a human for a code.

Store it in `~/.npmrc` (`npm config set //registry.npmjs.org:_authToken <TOKEN>`) or a CI secret — **never commit it**. Always pass `--registry=https://registry.npmjs.org`: the default registry on this machine is the npmmirror mirror, which does not accept publishes.

## Release order

1. bump `version` in `package.json`;
2. commit, `git tag -a vX.Y.Z -m vX.Y.Z`;
3. `git push origin main --follow-tags`;
4. `npm publish --registry=https://registry.npmjs.org`.

Tag first, publish second, so the published tarball matches the tagged commit. The working tree must be clean before publishing.
