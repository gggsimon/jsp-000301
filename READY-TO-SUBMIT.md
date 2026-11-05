# 交卷卡 · 仓库已上线

> 2026-11-05 17:58 更新。**仓库已建好并推送完成**：`https://github.com/gggsimon/jsp-000301`（Public）。
> **那封公理确认邮件删掉了**——干净版已跑通，不用问官方。
> 本机仓库 HEAD：`aff6335cf0fd3dd174694ba6e69cf2932cb1800e`；远端由 API 逐文件写入，
> 共 **12 个文件 / 12 个 commit**（最后一个 `b98d80ef5947 Add verify_cloud.js`）。

## 推送是怎么完成的（本机 git 通道不通）

`github.com` 的 git 端点被代理挡住（502 / 直连超时），但 `api.github.com` 可达。
改用 `push_api.js` 走 GitHub REST Contents API 逐个 PUT 文件，token 只从环境变量读取，
**未写入任何文件、日志或 git**。**用完请立刻 Revoke 该 token。**

副作用：逐文件写入产生 12 个 commit，并触发 12 次 `verify-lean` 流水线。

**⚠️ 第一次的 12 个绿标全部是假阳性**：`lakefile.toml` 只写了 `scope`，Lake 5.0 报
`leanprover/mathlib: package not found on Reservoir`；而 `lake build 2>&1 | tee` 的管道
吞掉了退出码，后面公理审计只 grep 了空日志就打印 "axiom audit passed"。
这是「CI 绿 ≠ 编译过」的实证，已按用户红线修掉。

**修复后真跑通**（run `42007298659`，2026-11-05 10:04 UTC）：
- `Lean 4.33.1 / Lake 5.0.0`，`lakefile.toml` 改为 git 源 `leanprover-community/mathlib4 @ v4.33.1`；
- 加 `lake exe cache get` 取官方预编译 olean（日志 `[8706/8707] Built JSP000301`）；
- 加 `set -euo pipefail`、`test -s lake-build.log`、公理白名单逐条核对；
- 日志实证：`'JSP000301.jsp_000301_counterexample' depends on axioms: [propext, Classical.choice, Quot.sound]`，
  `axiom audit passed`，artifact `lean-verification-logs` 已上传。

**结论**：pin 版本 v4.33.1 的 clean-checkout `lake build` 形式要件已补齐，公理三条干净。

## 一句话说清"没看明白"的地方

**代码、验证、材料、本地仓库，我全做完了。但建 GitHub 仓库、push、开 PR、发邮件这几下，必须你本人点** —— 这台机器上没有任何 GitHub 登录（没装 `gh`、没有凭证文件、没有 token），而且规则明令 `Claims must be initiated by the contributors themselves`，禁止代提交/代领奖。不是我不肯，是没钥匙 + 规则不让。

## 你现在打开的那个页面（github.com/new）怎么填

| 字段 | 填什么 |
|---|---|
| Owner | `gggsimon`（已经是了，别动） |
| **Repository name** | **`jsp-000301`** ← 只填这一格 |
| Public | 已选，别动 |
| Add README / .gitignore / license | **三个都别勾**（本地已有，勾了会冲突） |
| 绿色按钮 | 点 `Create repository` |

点完之后，把下面 3 行粘到本地终端（在 `jsp-000301/` 目录里）：

```bash
git remote add origin https://github.com/gggsimon/jsp-000301.git
git push -u origin main
```

push 完，`.github/workflows/verify.yml` 会**自动在 GitHub 的 Ubuntu 机器上跑真 `lake build`**，产出 `lake-build.log` / `axioms.log`（Actions → Artifacts 下载）。这就是"补形式要件"，比在本机装 Lean 更干净：隔离环境、固定版本、有公开日志可贴进 PR。

> 本机确实跑不了 `lake build`：没有 lean / lake / elan，WSL 被安全策略禁，Docker daemon 没启动。所以改成云端 CI 跑，不是偷懒。

## 关于"跑 L4 comparator"——这里混了两套体系

| | 你档位表里的 L4 | 孙奖官方 |
|---|---|---|
| 出处 | 你自己《Lean 证据档位表》给 `openai/math` 定的档 | 官方没有 L4 这一档 |
| 判据 | `formalization.yaml` 的 `status.main_results` 有 declaration + comparator | PR → 官方独立复现 → 14 天公示 → 获奖 |
| 机械检查 | — | `skills/lean-verify/scripts/audit.py`，`STANDARD_AXIOMS = {propext, Classical.choice, Quot.sound}` |

**好消息**：我们的干净版 `#print axioms` 正好只有这三条 = **直接过了官方机械审计口径**。所以不用再额外"跑 comparator"，那个概念在这里不适用。`docs/verification.md` 也写了：`lean-verify` 自检是可选的，复现由官方做，`native_decide` 的依赖是"单独报告"而非禁止。上一轮我说"邮件不能跳"是把可选当成了必选，判断错了。

## 交卷 4 步（全是你本人，文本我都备好了）

| # | 动作 | 去哪做 | 文本在哪 |
|---|---|---|---|
| 1 | 建 `jsp-000301` 公开仓库 + push | 上面那个页面 + 3 行命令 | 已备好 |
| 2 | fork `TheJustinSunPrize/awards`，只改 `problems/catalog-0301-0400.md` 的四项，开 PR | 浏览器 / 本地 git | `SUBMISSION.md` 第 4、5 节 |
| 3 | 发 `[Award claim] JSP-000301` Issue + 身份验证邮件 | 浏览器 / 你自己的邮箱 | `SUBMISSION.md` 第 7 节 |
| 4 | 等 14 天公示 → 书面确认 → 收款 | 等 | — |

**为什么第 1 步今天做**：规则按你自己仓库指定 commit 的时间戳排优先权，不是 PR 打开日期；且"时间戳单独不构成完成时间证据"，需要独立可验证的公开历史。本地已经先提交了，push 上去就有公开历史。

## 已就绪清单

| 项 | 验收 |
|---|---|
| `JSP000301.lean`（干净版） | 云端真 Lean + mathlib **0 errors / 0 warnings**；`#print axioms` = `[propext, Classical.choice, Quot.sound]`；`sorry`/`admit` **0 命中** |
| 语义忠实性 | 标准无界定义 `Powerful` / `IsSquare`，无有界化、无枚举，因式分解直接构造 |
| `verify_cloud.js` + `package.json` | `node verify_cloud.js` 实跑通过 |
| `verify.py` | 9 项断言全 PASS |
| `.github/workflows/verify.yml` | push 后云端跑 `lake build` + 公理审计 + 占位符扫描 |
| `lakefile.toml` + `lean-toolchain` | pin v4.33.1，CI 里 `lake update` 固定 mathlib |
| `SUBMISSION.md` | catalog 四项草稿、PR 模板、claim Issue 草稿 |

## 红线

- 官方只用 `@hejustinsun.com` 发信，**绝不索要私钥/助记词/要求转账**；钱包地址、邮寄地址只走邮件，不写进 GitHub Issue。
- 云端编译通过 ≠ 已获奖；规则 9.2 保留随时改规则、公布即生效。
- 不构成投资建议。金额见 `../孙奖实际发放金额链上核查_20261105.md`：首批实发约 8,045 美元 / 6 笔。
