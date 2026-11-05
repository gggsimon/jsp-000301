"""JSP-000301 有限断言的独立核算（不依赖 Lean）。
本机可执行；与 JSP000301.lean 的 native_decide 相互印证，但不能替代 Lean 编译。
"""
from sympy import factorint

N1, N2 = 12167, 12168


def is_powerful(n: int) -> bool:
    """每个素因子 p 都满足 p^2 | n。"""
    return all(exp >= 2 for exp in factorint(n).values())


def is_square(n: int) -> bool:
    r = int(n ** 0.5)
    return any(k * k == n for k in (r - 1, r, r + 1))


f1, f2 = factorint(N1), factorint(N2)
checks = {
    "12167 = 23^3": f1 == {23: 3},
    "12168 = 2^3*3^2*13^2": f2 == {2: 3, 3: 2, 13: 2},
    "12167 powerful": is_powerful(N1),
    "12168 powerful": is_powerful(N2),
    "consecutive": N1 + 1 == N2,
    "12167 not square": not is_square(N1),
    "12168 not square": not is_square(N2),
    "110^2 < 12167 < 12168 < 111^2": 110**2 < N1 < N2 < 111**2,
}
print("12167 factors:", f1)
print("12168 factors:", f2)
for k, v in checks.items():
    print(("PASS " if v else "FAIL ") + k)
print("\nALL PASS" if all(checks.values()) else "\nSOME CHECK FAILED")

# 全量枚举：模拟 PowerfulBounded / IsSquareBounded 的 Fin (n+1) 量化
def powerful_bounded(n: int) -> bool:
    for p in range(n + 1):
        if p >= 2 and all(p % d for d in range(2, int(p**0.5) + 1)) and n % p == 0:
            if n % (p * p) != 0:
                return False
    return True


def square_bounded(n: int) -> bool:
    return any(k * k == n for k in range(n + 1))


print("\n[bounded enumeration, mirrors Fin (n+1) quantifiers]")
print("PowerfulBounded 12167:", powerful_bounded(N1))
print("PowerfulBounded 12168:", powerful_bounded(N2))
print("IsSquareBounded 12167:", square_bounded(N1))
print("IsSquareBounded 12168:", square_bounded(N2))
