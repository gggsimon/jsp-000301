# JSP-000301 · 提交材料包（可直接照填）

> 更新 2026-11-05（**干净版**）。代码在真 Lean + 全量 mathlib 上 **0 errors / 0 warnings**，
> `#print axioms` = **[propext, Classical.choice, Quot.sound]**（官方 audit.py 的 STANDARD_AXIOMS），
> `sorry`/`admit` 0 命中。**不再用 `native_decide`，公理确认邮件已作废**。
> 本机已 `git init` + 提交（SHA `9fca75d5…`）；`.github/workflows/verify.yml` 会在 push 后
> 由 GitHub Ubuntu CI 跑真 `lake build` 补形式要件。
> 仍**未提交、未领奖**。别把这份当成「已获奖」。

## 0. 云端验证记录（2026-11-05，一手）

本机无 lean/lake/elan、WSL 被安全策略禁用；改用 **lean4web 公开 WebSocket LSP 端点**，服务端为每条连接启动 `lake serve --`，是真 Lean + 全量 mathlib。

| 项 | 值 |
|---|---|
| 端点 | `wss://live.lean-lang.org/websocket/MathlibDemo` |
| 云端版本 | **Lean v4.36.0-rc2 + mathlib**（与本地 pin 的 v4.33.1 不同，见风险） |
| 通道校准 | **双向探针**：`1+1=2` → `NO_ERRORS`；`1+1=3` → `L2: unsolved goals ⊢ False`。能区分对错，不是空跑 |
| 早期修复 | 有界枚举版曾报 `failed to synthesize Decidable`（自定义 `def` 不展开）；该路线已**整体废弃** |
| 干净版重写 | 改用标准无界定义 `Powerful` / `IsSquare` + 因式分解构造，`decide`/`native_decide` 都不再用 |
| 最终编译 | `JSP000301.lean` **0 errors / 0 warnings** |
| 公理足迹 | `jsp_000301_counterexample`: **`[propext, Classical.choice, Quot.sound]`** = 官方 `audit.py` 的 `STANDARD_AXIOMS` |
| 占位符 | `sorry` / `admit` **0 命中** |
| 复现脚本 | `verify_cloud.js`（`npm i` 后 `node verify_cloud.js`）；`.github/workflows/verify.yml`（push 后云端 `lake build`） |

**三条必须如实说明的边界**：

1. **LSP ≠ `lake build`**：云端 LSP 是全量 elaboration + kernel 检查，等价"编译通过"，但没有 `lake-manifest.json`、没有 clean-checkout 独立构建。这个形式要件由 `.github/workflows/verify.yml` 在 push 后于 GitHub Ubuntu CI 补齐（产出 `lake-build.log` / `axioms.log`）。
2. **版本不一致**：云端验证在 v4.36.0-rc2，工程 pin 的是 v4.33.1；CI 会以 pin 版本跑一次，两次都过才算稳。
3. **没有 L4 comparator 这一档**：那是你自己的《Lean 证据档位表》给 `openai/math` 定的档，孙奖官方口径是 `skills/lean-verify/scripts/audit.py` 的 `STANDARD_AXIOMS` 检查 + 官方独立复现。我们的公理足迹已正好等于那三条。

> 更正：此前把「多一条 `native_decide.ax_1_1`」列为必须发邮件确认的风险，是把官方**可选**的 `lean-verify` 自检当成了必选门槛。`docs/verification.md` 原文：self-check 可选、`native_decide` 依赖"单独报告"而非禁止、复现由 maintainers 做。现已用干净版从根上消掉该问题，**那封邮件作废**。

## 1. 题与状态（题库 2026-11-04 快照）

| 项 | 值 |
|---|---|
| 干净版目标定理 FQN | `JSP000301.jsp_000301_counterexample`（`Powerful` / `IsSquare` 为标准无界定义） |
| 题号 | **JSP-000301** |
| 题目 | 两个连续正整数都是 powerful number，是否至少一个是完全平方？ |
| 数学解 | **否**。Golomb 1970 反例：12167 = 23³、12168 = 2³·3²·13²，均非平方（110²=12100 < 12167 < 12168 < 12321=111²） |
| catalog 文件 | `problems/catalog-0301-0400.md` |
| Current status | `Solved`（Proof contributors: Solomon W. Golomb, [Go70] 1970） |
| Lean proof | **No** |
| Eligible to claim | **No**（v7 更正：这是验证状态，不排除提交） |
| 认领记录 | candidates/ 与 awards/ 中 **0 条** |

**贡献类型只能选 `Lean formalization`**。数学解属于 Golomb，不得同时 claim `Mathematical solution` 或 `Both`——规则明令「上传别人的成果不构成贡献者」。本题走形式化者角色，Legacy 分成 **30%**。

## 2. 为什么选它（对照你指出的 N-S 漏洞）

孙奖的结构漏洞是「Lean 验证通过 ≠ 忠实编码原命题」，comparator 查不了定义忠实性。本题攻击面最小：

- 命题是**有限算术反例**，定义域、量词、结论全部可机器枚举，无测度/正则性/存在性语义鸿沟；
- `Powerful` / `IsSquare` 用**标准无界定义**，没有有界化、没有枚举，忠实性就是定义本身；
- 证明由显式因式分解直接构造（`Nat.Prime.dvd_of_dvd_pow` + `Nat.dvd_prime` + 夹逼），不依赖任何可判定性实例；
- 题库已有同类先例：JSP-000110 靠 `explicit_erdos_97_counterexample` 拿到并合并 PR #289。

## 3. 提交前复现命令（外部 Linux / Mac / WSL）

```bash
# 磁盘留 15G+：mathlib 全量约 2.0G，构建缓存更大
git clone <你的公开 repo> jsp-000301 && cd jsp-000301
lake update                 # 固定 mathlib 版本，生成 lake-manifest.json
lake build                  # 补齐 L3 的形式要件
lake env lean JSP000301.lean 2>&1 | tee build.log
grep -n "axioms" build.log
grep -Rn "sorry\|admit" JSP000301.lean   # 必须为 0 命中
```

`lean-toolchain` 按题库已合并 PR #289 的验收版本固定为 **v4.33.1**；若 `lake update` 报 mathlib 版本不匹配，以本机版本为准重跑，并把 `lean-toolchain` + `lake-manifest.json` 一起 commit。

**编译失败时的排查顺序**：① 两个有界谓词必须是 `abbrev`（已修，别改回 `def`）→ ② `Nat.le_of_dvd` API 名 → ③ 删掉「忠实性桥接段」后重跑主定理。主定理不依赖桥接段。

无需本地 Lean 也能复核编译：`npm i ws https-proxy-agent@7 && node verify_cloud.js`。

## 4. catalog 四项修改草稿（External PR 只允许改这四项）

目标文件：`problems/catalog-0301-0400.md`，定位 `<a id="JSP-000301"></a>`。

```markdown
| Current status | Solved<br>Proof contributors: Solomon W. Golomb (counterexample in [Go70], 1970). |
| Lean proof | Yes — [Lean source](https://github.com/gggsimon/jsp-000301/blob/<40位SHA>/JSP000301.lean)<br>Target theorem: `JSP000301.jsp_000301_counterexample`.<br>Formalization contributors: <你的 GitHub ID>. |
| Attribution basis | Mathematical credit: Solomon W. Golomb, [Go70] (1970). Formalization credit: <你的 GitHub ID>, own repository, fixed commit. Solver attribution source: <https://www.erdosproblems.com/latex/365>. |
| Publication details | [Go70] Powerful numbers, Amer. Math. Monthly 77(8) (1970), 848-852.<br>Lean formalization: <https://github.com/<YOUR_ID>/jsp-000301> (pinned commit). |
```

规则：`status` 只能用 `Open`/`Solved`；`Eligible to claim` 等字段由团队复核后自行同步，**不要自己改**；不得修改无关文件；PR 里不放 `.lean` 源码、构建产物或依赖包。

## 5. PR 模板（fork → 编辑 catalog → 开 PR，模板自动出现）

- **Proof submission**：Repository = `https://github.com/gggsimon/jsp-000301`；branch = `main`；**full 40-character commit SHA**（本地已生成 `9fca75d51788bb890429507c58821bb4aafa2c69`，push 后不变）；proof file paths = `JSP000301.lean`；FQN = `JSP000301.jsp_000301_counterexample`。
- **Formal statement**：`Powerful` / `IsSquare` 为标准无界定义（`JSP000301.lean`），链接全部 pin 到该 SHA；说明 `∀ p : ℕ, Nat.Prime p → p ∣ n → p² ∣ n` 与原问题逐字对应、`∃ k, k*k = n` 与平方对应、以及 12167+1=12168 的连续性；无有界化、无枚举，因此不存在定义忠实性缺口。
- **Reproduction**：Lean v4.33.1；`lean-toolchain` 路径；`mathlib`（版本见 `lake-manifest.json`）；构建说明 = 本文件第 3 节 + `.github/workflows/verify.yml` 的 CI 日志；clean checkout 命令；`#print axioms JSP000301.jsp_000301_counterexample` 输出 = `[propext, Classical.choice, Quot.sound]`。
- **Pre-submission Lean verification**：可留空（官方明确不影响受理）。

## 6. 优先级策略（你补的第 3 点，落到动作上）

规则按**你自己仓库指定 commit 的时间戳**排序，不是 PR 打开日期；且「commit 时间戳单独不构成完成时间证据」，需独立可验证公开历史。所以：

1. **今天就建公开 repo 并 push 第一版**（已云端编译通过），此后每天有 commit；
2. 每次编译进展单独 commit，commit message 写清档位（L1→云端通过→lake build→L4）；
3. PR / claim 前把 repo 设为 public，保留完整 history + release tag；
4. 不要憋大招——同题若出现更早的公开 commit 并通过验证，你会被替换，替换者重新起算 14 天公示。

## 7. claim-award Issue 草稿（PR 合并后、本人 GitHub 账号发）

```
标题：[Award claim] JSP-000301
- Problem catalog link: https://github.com/TheJustinSunPrize/awards/blob/main/problems/catalog-0301-0400.md#JSP-000301
- Merged PR link: <填>
- Follow-up contact email: <填，会公开在 Issue 里>
- Original Lean proof repository: https://github.com/<YOUR_ID>/jsp-000301
- Contribution type: Lean formalization   ← 不要选 Both
- 本人 GitHub account 提交；禁止代 claim
```

之后：身份验证邮件（从该 follow-up 地址发到 `thejustinsunprize@hejustinsun.com`，引用 Issue 与 merged PR）→ 14 天公示（UTC 满 14 天，起点是 candidate entry 发布到 `candidates/public-notice.md`，不是 merge 日期）→ 书面确认 → 收 USDT(TRC-20) 或 USDC(ERC-20)。

## 8. 风险（按你的四点补齐）

| 风险 | 事实 | 动作 |
|---|---|---|
| **分成金额（已查，2026-11-05）** | 链上首批实发约 **8,045.47 USDT / 6 笔 / 单笔 13.73–3,630 美元**，中位数约 980 美元；官方登记表无金额列，`grading.md` 明写不公布计算与付款分配 | 详见 `孙奖实际发放金额链上核查_20261105.md`。**作为赚钱不值得继续投 D3–D7**；若只为参与式观察/语料则另论 |
| ~~公理多一条~~（已解决） | 干净版 `#print axioms` = `[propext, Classical.choice, Quot.sound]`，等于官方 `audit.py` 的 `STANDARD_AXIOMS` | 无需动作，公理确认邮件已作废 |
| **版本不一致** | 云端 v4.36.0-rc2，本地 pin v4.33.1 | 在自己机器 `lake build` 补形式要件 |
| 14 天挑战 ∝ 题目热度 | 小题有人读，反而是硬仗 | 忠实性桥接段 + 显式分解 + 夹逼三处提前自证 |
| 抢跑 | 按自己 repo commit 时间戳排序 | 全程公开 commit，见第 6 节 |

## 9. 红线

- 官方只用 `@hejustinsun.com` 发信，**绝不索要私钥/助记词/要求转账**；钱包地址、邮寄地址只走邮件，不写进 GitHub Issue。
- 本材料不构成投资建议；奖金额、层级、规则以官方仓库当日版本为准（规则 9.2 保留随时改规则、公布即生效）。
- **云端编译通过 ≠ 已获奖**。提交、身份验证、14 天公示、收款全部须本人完成。
