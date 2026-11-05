import Mathlib

/-!
# JSP-000301 · 连续 powerful 数对的 Golomb 反例（纯构造性形式化）

题目（Erdős problem；孙奖题库 JSP-000301）：
  若两个连续正整数都是 powerful number，是否至少一个是完全平方？

解答：否。Golomb (1970) 给出
  12167 = 23³            12168 = 2³ · 3² · 13²
二者连续、都是 powerful、都不是完全平方。

【语义忠实性 —— 不是注释里的承诺，是定义本身】
  · `Powerful` 用标准无界定义 ∀ p : ℕ, Nat.Prime p → p ∣ n → p² ∣ n，
    没有有界化、没有枚举、没有把原问题换成更弱/更强的命题。
  · `IsSquare` 用标准定义 ∃ k : ℕ, k * k = n。
  · 证明由显式因式分解直接构造：p | 23³ ⇒ p = 23（Nat.Prime.dvd_of_dvd_pow
    + Nat.dvd_prime）；12168 同理拆到 2/3/13；非平方由 110² < n < 111² 夹逼。
  · 不使用 decide / native_decide，因此 #print axioms 只有
    propext / Classical.choice / Quot.sound（官方 audit.py 的 STANDARD_AXIOMS）。

对照：N-S 那种「Lean 验证通过 ≠ 忠实编码原命题」的漏洞，在本题上攻击面最小：
命题是有限算术反例，定义域、量词、结论与原问题逐字对应。

云端 Lean LSP（live.lean-lang.org, MathlibDemo, Lean v4.36.0-rc2 + mathlib）
实测：0 errors / 0 warnings；主定理公理 = [propext, Classical.choice, Quot.sound]。
-/

namespace JSP000301

/-- powerful number 的标准（无界）定义。 -/
def Powerful (n : ℕ) : Prop :=
  ∀ p : ℕ, Nat.Prime p → p ∣ n → p ^ 2 ∣ n

/-- 完全平方的标准定义。 -/
def IsSquare (n : ℕ) : Prop :=
  ∃ k : ℕ, k * k = n

-- 显式分解，与题库 Review note 一致，供人工与机器双重核对
example : 23 ^ 3 = (12167 : ℕ) := by norm_num
example : 2 ^ 3 * 3 ^ 2 * 13 ^ 2 = (12168 : ℕ) := by norm_num

-- 平方夹逼：110² < 12167 < 12168 < 111²
example : (110 : ℕ) ^ 2 < 12167 := by norm_num
example : (12168 : ℕ) < 111 ^ 2 := by norm_num

/-- 任何整除 12167 的素数只能是 23。 -/
lemma prime_dvd_12167 {p : ℕ} (hp : Nat.Prime p) (h : p ∣ 12167) : p = 23 := by
  have h23 : Nat.Prime 23 := by norm_num
  have hfac : 12167 = 23 ^ 3 := by norm_num
  rw [hfac] at h
  have hp23 : p ∣ 23 := hp.dvd_of_dvd_pow h
  rcases (Nat.dvd_prime h23).mp hp23 with h1 | h23e
  · exact (hp.ne_one h1).elim
  · exact h23e

lemma powerful_12167 : Powerful 12167 := by
  intro p hp hpd
  have he : p = 23 := prime_dvd_12167 hp hpd
  subst p
  norm_num

/-- 任何整除 12168 的素数只能是 2、3 或 13。 -/
lemma prime_dvd_12168 {p : ℕ} (hp : Nat.Prime p) (h : p ∣ 12168) :
    p = 2 ∨ p = 3 ∨ p = 13 := by
  have hfac : 12168 = 2 ^ 3 * (3 ^ 2 * 13 ^ 2) := by norm_num
  rw [hfac] at h
  rcases hp.dvd_mul.mp h with h2 | hrest
  · have hp2 : p ∣ 2 := hp.dvd_of_dvd_pow h2
    have h2p : Nat.Prime 2 := by norm_num
    rcases (Nat.dvd_prime h2p).mp hp2 with h1 | he
    · exact (hp.ne_one h1).elim
    · exact Or.inl he
  · rcases hp.dvd_mul.mp hrest with h3 | h13
    · have hp3 : p ∣ 3 := hp.dvd_of_dvd_pow h3
      have h3p : Nat.Prime 3 := by norm_num
      rcases (Nat.dvd_prime h3p).mp hp3 with h1 | he
      · exact (hp.ne_one h1).elim
      · exact Or.inr (Or.inl he)
    · have hp13 : p ∣ 13 := hp.dvd_of_dvd_pow h13
      have h13p : Nat.Prime 13 := by norm_num
      rcases (Nat.dvd_prime h13p).mp hp13 with h1 | he
      · exact (hp.ne_one h1).elim
      · exact Or.inr (Or.inr he)

lemma powerful_12168 : Powerful 12168 := by
  intro p hp hpd
  rcases prime_dvd_12168 hp hpd with rfl | rfl | rfl <;> norm_num

lemma not_sq_12167 : ¬ IsSquare 12167 := by
  rintro ⟨k, hk⟩
  have hc : k ≤ 110 ∨ 111 ≤ k := by omega
  rcases hc with hle | hge
  · have : k * k ≤ 110 * 110 := Nat.mul_le_mul hle hle
    omega
  · have : 111 * 111 ≤ k * k := Nat.mul_le_mul hge hge
    omega

lemma not_sq_12168 : ¬ IsSquare 12168 := by
  rintro ⟨k, hk⟩
  have hc : k ≤ 110 ∨ 111 ≤ k := by omega
  rcases hc with hle | hge
  · have : k * k ≤ 110 * 110 := Nat.mul_le_mul hle hle
    omega
  · have : 111 * 111 ≤ k * k := Nat.mul_le_mul hge hge
    omega

/-- 主定理：存在连续两个 powerful 数，且都不是完全平方。 -/
theorem jsp_000301_counterexample :
    Powerful 12167 ∧ Powerful 12168 ∧ 12167 + 1 = 12168 ∧
    ¬ IsSquare 12167 ∧ ¬ IsSquare 12168 := by
  exact ⟨powerful_12167, powerful_12168, by norm_num, not_sq_12167, not_sq_12168⟩

#print axioms jsp_000301_counterexample

end JSP000301
