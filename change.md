# Pending Changes — Local Setup & Blocker

> Status as of 1 Aug 2026. Nothing in `backend/src` or `frontend/src` has been modified yet.
> Full audit of all 118 findings is in `CODE_AUDIT_REPORT.pdf`.

---

## 1. Current running state

| Service | URL | Status |
|---|---|---|
| Frontend (Angular dev server) | http://localhost:4200 | ✅ running |
| Backend API (ts-node-dev) | http://localhost:5000/api/v1 | ✅ running |
| MySQL 8.4.9 | 127.0.0.1:3306 | ✅ running |

**Seeded logins** (from `schema.sql`) — password `Admin@123` for both:
- `admin@luvkushnatural.com` (super_admin) → admin panel at `/admin`
- `customer@test.com` (customer)

### What was installed / created
- Node.js 24.18.1 LTS (winget)
- MySQL 8.4.9 (winget) — data dir initialised at `C:\ProgramData\MySQL\MySQL Server 8.4\Data`, root has **no password** (local dev only)
- `npm install` run in both `backend/` and `frontend/`
- `backend/.env` created (gitignored — will not be committed)
  - **JWT secrets were freshly generated**, NOT the compromised defaults from `.env.example`.
    This means the committed `gen_tokens.js` cannot forge a token against this local instance.
  - Shiprocket credentials left blank — not needed locally.
  - Razorpay test key kept (`rzp_test_` prefix = test mode, no real money).

### ⚠️ MySQL does not auto-start on reboot
Installing it as a Windows service required admin elevation, which wasn't available,
so `mysqld.exe` is running as a plain background process. After a reboot, restart it with:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
```

To make it permanent, run this **once in an elevated PowerShell**:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --install MySQL84 --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
Start-Service MySQL84
Set-Service MySQL84 -StartupType Automatic
```

---

## 2. 🔴 BLOCKER — every paginated endpoint returns 500

This is **LK-L36** from the audit report, now confirmed live rather than theoretical.

### Symptom
```
GET /api/v1/products           → 500 "Incorrect arguments to mysqld_stmt_execute"
GET /api/v1/products/featured  → 500 (same)
GET /api/v1/categories         → 200 ✅
GET /api/v1/orders/statuses    → 200 ✅
```

The pattern is exact: **any query containing a `LIMIT ?` placeholder fails; everything else works.**

### Impact
Homepage products, collection pages, search, admin product list, admin orders,
reviews, customers, coupons and blog listings are all broken. The storefront
renders but shows no products.

### Root cause
`backend/src/utils/database.ts`

```ts
// line 36 — uses prepared statements
const [rows] = await this.pool.execute(sql, params);

// lines 71-72 — sends LIMIT/OFFSET as bound parameters
const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
const data = await this.query<T[]>(paginatedSql, [...params, limit, offset]);
```

mysql2's `execute()` binds parameters through the MySQL prepared-statement protocol,
which sends them as strings. MySQL 8.4 rejects a string where `LIMIT` expects an integer.

Also affected, same cause, different call sites:
- `product.service.ts:169` — `getFeatured()` uses `LIMIT ?`
- `product.service.ts:222` — `search()` uses `LIMIT ?`

### Why it presumably works on your server
Your production stack is almost certainly **MariaDB or MySQL 8.0**, which are lenient here
(`schema.sql` header says "Compatible with MySQL 8.0+ & MariaDB 10.4+"). MySQL 8.4 tightened this.

---

## 3. Two ways forward — pick one

### Option A — fix `database.ts` (recommended)

Inline the pagination values as validated integers instead of binding them.
**This also closes LK-H18** (uncapped `limit`, a public DoS vector) in the same change.

```ts
// backend/src/utils/database.ts — inside paginate()
const safeLimit  = Math.min(Math.max(1, Math.floor(Number(limit))  || 20), 100);
const safePage   = Math.max(1, Math.floor(Number(page)) || 1);
const safeOffset = (safePage - 1) * safeLimit;

const paginatedSql = `${sql} LIMIT ${safeLimit} OFFSET ${safeOffset}`;
const data = await this.query<T[]>(paginatedSql, params);   // note: params unchanged
```

Then do the same for the two `LIMIT ?` call sites in `product.service.ts`
(`getFeatured`, `search`) — clamp to an integer and inline it.

- No SQL injection risk: the values are forced through `Math.floor(Number(...))`, so
  only integers ever reach the string.
- Works on MySQL 8.0, 8.4 and MariaDB alike — removes the version sensitivity entirely.
- Fixes 2 audit findings (LK-L36 + LK-H18).
- Effort: ~10 minutes.

### Option B — downgrade to MySQL 8.0

Uninstall 8.4, install MySQL 8.0 so the local environment matches production.

- Zero code changes.
- But the latent bug stays in the codebase, and it will resurface the day the
  production database is upgraded.
- Effort: ~20 minutes of installer time.

**Recommendation: Option A.** It is smaller than the reinstall, removes a real
portability bug rather than hiding it, and picks up a security fix for free.

---

## 4. Not yet verified

Because product listing is broken, these flows could not be exercised end to end:
cart, checkout, payment (LK-C01/C02), order creation, stock decrement (LK-C10).
Worth re-testing immediately after the blocker is cleared — they are where the
critical findings live.
