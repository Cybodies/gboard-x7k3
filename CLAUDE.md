# CLAUDE.md — Project rules for this repo

## 🛡️ QA review เป็นข้อบังคับ

**ทุกครั้งที่เขียน/แก้โค้ดในโปรเจคนี้ ต้องผ่าน QA review ก่อนถือว่าเสร็จ — ห้ามหลุด**

### ขั้นตอนบังคับหลังเขียน code ทุกครั้ง

1. **Syntax check** — รัน Node parse check ของ inline scripts ใน `index.html` ก่อน:
   ```bash
   node -e "
   const fs = require('fs');
   const html = fs.readFileSync('/home/user/woe-party/index.html','utf8');
   const re = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
   let m, all = '';
   while ((m = re.exec(html))) {
     const tag = html.slice(m.index, m.index + html.slice(m.index).indexOf('>') + 1);
     if (/\bsrc=/.test(tag)) continue;
     all += m[1] + '\n';
   }
   try { new Function(all); console.log('OK'); }
   catch(e){ console.error('PARSE ERROR:', e.message); }
   "
   ```
   ถ้าเจอ `PARSE ERROR` → ห้ามคอมมิต แก้ก่อน

2. **QA review skill** — เรียก `/code-review` ที่ effort `high` (ถ้าเป็นการแก้บัค) หรือ `medium`+ (ถ้าเป็น cleanup) ก่อน commit เสมอ
   - ถ้ามี finding ระดับ correctness bug → ต้องแก้ก่อน commit
   - ถ้าเป็น cleanup/simplification → ตัดสินใจร่วมกับ user ว่าจะแก้รอบนี้หรือทิ้ง TODO

3. **Security check** — สำหรับการแก้ที่เกี่ยวกับ:
   - Firebase Rules / Auth / Permissions
   - User-provided input ที่จะ render เป็น HTML
   - localStorage / sessionStorage handling
   - URL parameters / sharing
   - → เรียก `/security-review` เพิ่มด้วย

4. **Manual smoke** — บอก user ขั้นตอนทดสอบสั้นๆ (golden path + 1 edge case) ก่อน push

### กฏที่ห้ามฝ่าฝืน

- ❌ **ห้าม commit/push ถ้า syntax check ไม่ผ่าน** — แม้จะเป็น typo เล็กๆ
- ❌ **ห้าม merge เข้า main ถ้ายังไม่ผ่าน QA review** — feature branch ก่อน, ตรวจ, ถามผู้ใช้, แล้วค่อย merge
- ❌ **ห้าม skip QA โดยเหตุผลว่า "เปลี่ยนแค่ 1 บรรทัด"** — บั๊กเยอะแยะมาจาก one-line change
- ❌ **ห้าม claim ว่าเสร็จแล้วถ้ายังไม่ได้รัน parse check** — เคยปล่อย parse error ผ่านมาแล้ว

### กรณีพิเศษ

- **Doc-only change** (README, CLAUDE.md, comments only) → skip syntax check ได้ แต่ยังต้องอ่านทบทวนเอง
- **Revert pure** (ย้อน commit เก่า) → skip QA review ได้ แต่ต้องบอก user ว่าย้อนอะไร
- **Emergency hotfix** (กรณีคนใช้งานอยู่จริงๆ แล้วเกิด production down) → ทำ minimal fix, push, แล้วทำ QA review หลัง (post-mortem)

---

## Project context

**woe-party** — Single-file HTML app for organizing Ragnarok Online WoE (War of Emperium) parties and post-WoE auctions

- **Tech:** Vanilla JS + Firebase Realtime Database (compat SDK 10.7) + Firebase Auth — no build step, no module system, all in `index.html`
- **Deploy:** GitHub Pages from `main` branch → https://cybodies.github.io/woe-party
- **Timezone:** All "today" semantics in Asia/Bangkok (UTC+7) via `todayBkkISO()` / `bkkNow()` helpers
- **Data shape gotcha:** Firebase RTDB drops trailing nulls from arrays and converts sparse arrays to objects. Always use `fbToFixedArray(v, len, fill)` when reading parties/slots from Firebase
- **Admin:** `blankkardor@gmail.com` via Google OAuth (bootstrap) + `/admins/{email_with_dots_as_underscores}` for additional admins + `/users/{username}` for ID/password accounts created via the Users page (synthetic email `username@woe.local`)

### Critical files

- `index.html` — entire app (~7000+ lines)
- `maps/main.png`, `maps/sub.png`, `maps/overrun.png` — battlefield map images

### Branch policy

- Develop on feature branch (current: `claude/github-connection-setup-tY5Pb`)
- Fast-forward merge to `main` when user confirms — never force push
- Never push to a different branch without explicit user permission
