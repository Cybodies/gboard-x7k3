# Changelog

All notable changes to woe-party. The `APP_VERSION` constant in `index.html` (shown in the
app footer) is a calendar version `YYYY.MM.DD`. Bump it whenever you ship a user-visible
change to `index.html`; add an entry here. Git history is the detailed record — this file
is the human-readable highlight reel.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]
- _nothing yet_

## [2026.07.09.1]
### Changed
- **รวมหน้า "🙋 ขอประมูล" เข้าไปในหน้า 🎴 Auction GL / Auction Overrun โดยตรง — ลบแท็บขอประมูลเดิมทิ้ง.**
  แต่ละหน้า Auction ตอนนี้มี: ป้ายสถานะวัน (วันกิจ/ไม่ใช่วันกิจ + ปุ่มลัดไปอีกหน้า), เลือกชื่อตัวเอง,
  **แผง "🎟️ ของคงเหลือวันนี้"** (โควตา/จองแล้ว/คิวรอ/เหลือ ต่อชิ้น — GL แยกหลัก/รอง, Overrun โชว์หลักอย่างเดียว),
  ปุ่มขอประมูล + คำขอของฉัน, และคิวแอดมินของกิจนั้น (จัดสรรอัตโนมัติ / แทนที่ / admin tools) ครอบด้วยกล่องเลื่อน
  กันหน้ากระโดด. โมดัลขอประมูลบอก **"เหลือ X สิทธิ์"** ต่อชิ้น + เตือนแดงเมื่อเต็ม/เหลืองเมื่อคิวยาวเกินของ.
- แท็บ/ตัวเลือก "ขอประมูล" ถูกลบ; ลิงก์เก่า (`state.mode === "auction-request"`) เด้งเข้า Auction ตามวันกิจอัตโนมัติ.
- ผลตัดสิน FCFS (arBulkApprove) + สูตรโควตา **ไม่เปลี่ยน** — cap ดึงจาก helper `arGetQuota` ตัวเดียวกับที่แผง/โมดัลใช้
  (แหล่งเดียว จอกับตัวจัดสรรตรงกันเสมอ). ลากชื่อเข้าคอลัมน์ Auction ได้เฉพาะแอดมิน (guest ดูได้แต่แก้ไม่ได้).
### Fixed (security)
- **กัน DoS: sanitize `/auction_requests` ตอนรับเข้า (`normalizeAuctionRequests`).** Firebase rule ยอมให้ผู้ใช้ที่ล็อกอิน
  (รวม guest anonymous) สร้างคำขอได้และตรวจแค่ `memberId`+`status` ไม่ตรวจชนิดของ `items` — คำขอที่ `items` ไม่ใช่ array
  จะทำให้แผงของเหลือ/คิว (`.forEach`/`.map`) พังทั้งหน้าให้ทุกคน (รวมแอดมิน) และปุ่มล้างก็อยู่บนหน้าที่พังนั้น. บังคับ `items`
  เป็น array ที่จุดรับเข้าจุดเดียว — คำขอปกติไม่กระทบ.

## [2026.07.07.1]
### Fixed
- **ประมูล GL: รายชื่อ "อนุมัติแล้ว / ปฏิเสธ" เรียงตามวินาทีที่ขอ (เหมือน Overrun).** เดิม GL เอา key สนามหลัก/รอง
  (`computedField === "sub"`) มาเรียง **ก่อน** เวลา — คนสนามรองที่กดขอมาก่อนเลยถูกดันไปอยู่ **ใต้** คนสนามหลักที่ขอทีหลัง.
  ตอนนี้ **GL เรียงตาม `requestedAt` ล้วน** เท่ากับที่ Overrun แก้ไปแล้วใน v2026.07.05.1 (แก้ที่ `arBulkApprove` + `renderGroup`).
  **หมายเหตุ: กรณีปกติใครได้ของ _ไม่เปลี่ยน_** — GL แยก pool สนามหลัก/รอง (70/30) เป็นอิสระต่อกัน แต่ละคนหยิบจาก pool ฝั่งตัวเอง
  เท่านั้น การเรียงจึงกระทบแค่ **ลำดับการแสดงผล** ไม่ใช่ผู้ชนะ. (ข้อยกเว้นหายาก: ถ้าสมาชิกถูก **ย้ายตี้หลัก↔รอง _หลัง_ กดขอ** —
  `computedField` ที่เก็บไว้ไม่ตรงกับตี้จริง — ผู้ชนะอาจสลับได้ ซึ่งของเดิมก็ให้ผลไม่คงเส้นคงวาในเคสนี้อยู่แล้ว.) การแบ่ง 70/30 + ป้าย หลัก/รอง บนแต่ละแถวคงเดิม.

## [2026.07.05.2]
### Changed
- **📊 Job Breakdown แยกความสมดุลเป็น GL และ Overrun.** ตารางเดียวแสดงคู่กัน — ฝั่ง **🛡️ GL** และ **⚔️ Overrun**
  แต่ละฝั่งมีคอลัมน์ **มี / เป้า / สถานะ** ของตัวเอง พร้อม **พายชาร์ต + AI Comment แยกต่อฝั่ง**.
  - ช่อง **"มี" นับต่องาน** จากคนที่ถูกจัดลงปาร์ตี้ของงานนั้น (League vs Overrun) ผ่าน `getEventJobCounts` — ใช้ `jobForMode`
    เพื่อให้ฝั่ง Overrun นับตาม **Job (Overrun)** (`jobOverrun`) ของสมาชิก ไม่ใช่ทั้ง roster เหมือนเดิม.
  - `state.jobTargets` เปลี่ยนจาก flat `{job:n}` เป็น `{ gl:{job:n}, overrun:{job:n} }` (Firebase node `job_targets`).
    **Migration:** เป้าเดิม (flat) ถูก **ก๊อปให้ทั้ง GL และ Overrun** อัตโนมัติ (`normalizeJobTargets`) — ไม่มีเป้าหาย.
  - แก้ `buildPieSvg` ให้วาดวงกลมเต็มเมื่อมีอาชีพเดียวที่ count>0 (เดิม arc 360° เรนเดอร์เป็นความว่าง).
  - Firebase listener ของ `job_targets` re-render บนหน้า **Roster** แล้ว (เดิมเช็คเฉพาะ tab `summary` ที่ถูกยุบไป)
    — และ **ข้าม render ตอน admin กำลังพิมพ์เป้า** (โฟกัสไม่หลุด).
### Fixed
- **กันเป้าอาชีพหาย (mobile-wipe class) ของ `job_targets`.** เพิ่ม guard 3 ชั้นให้เท่ากับ parties/auction ที่มีอยู่แล้ว:
  (1) `_jobTargetsHydrated` gate ใน `fbPushAll` — เครื่องใหม่/เน็ตช้าจะไม่ `.set()` ทับด้วยเป้าว่างก่อน hydrate,
  (2) `if (v == null) return` ใน listener — remote ว่างจะไม่ลบเป้าใน memory,
  (3) `_localJobTargetsGuardUntil` (2s) — echo ที่เข้ามาระหว่าง debounce 300ms ไม่ทับค่าที่ admin เพิ่งพิมพ์.
  (ทั้ง 3 เป็นบั๊กเดิมที่มีมาก่อน แต่แก้ตอนนี้เพราะแตะโค้ดนี้อยู่ + เป้ามี 2 ชุด (GL+Overrun) แล้วเสียหายกว่าเดิม.)

## [2026.07.05.1]
### Fixed
- **ประมูล Overrun: คนได้ของเรียงตามวินาทีที่ขอถูกต้องแล้ว.** ปุ่ม **🤖 จัดสรรอัตโนมัติ** และรายการ **"✅ อนุมัติแล้ว"**
  เคยเอา key สนามหลัก/รอง (`computedField === "sub"`) มาเรียง **ก่อน** เวลา — แต่ Overrun ไม่มีสนามรอง (จัดสรรบังคับ `main`)
  key นี้เลย **ดันคนที่บังเอิญนั่งตี้ 9–16 (นับเป็น "sub") ไปท้ายคิว** ทั้งที่กดขอมาก่อน → ผู้ชนะไม่เรียงตามวินาที.
  ตอนนี้ **Overrun เรียงตาม `requestedAt` ล้วน** ส่วน **GL คงสนามหลักก่อนรองตามเดิม** (แก้ที่ `arBulkApprove` + `renderGroup`).
- **ปุ่ม "♻️ แทนที่ Auction ด้วยที่อนุมัติ" (`arResyncApprovedToAuction`) เคารพ `grantedItem`.** เดิม resync เติมคอลัมน์จาก
  `req.items` (ทุกชิ้นที่ขอ) — คำขอหลายชิ้น (ข้อมูลเก่า) ที่ capacity แจกให้ **ชิ้นเดียว** จะถูกยัดกลับเข้า **ทุกคอลัมน์** = ล้นเหมือนเดิม.
  แก้เป็นใช้ `grantedItem` ถ้ามี (fallback = `req.items` สำหรับอนุมัติมือแบบเก่า) — สอดคล้องกับ `arRejectRequest`. คำขอชิ้นเดียว (Overrun ปัจจุบัน) ไม่กระทบ.

## [2026.07.04.1]
### Added
- **อาชีพ Gunslinger.** เพิ่มใน `JOB_LIST` (dropdown **Job (GL)** + **Job (Overrun)** ในหน้า Roster + prompt ตอนเพิ่มสมาชิก)
  และใน `JOB_PRIORITY` (ลำดับ **🔀 จัดเรียงตามอาชีพ**) โดยวาง **ถัดจาก Sniper ก่อน Assassin** (สาย DPS ระยะไกล).
  ส่วนที่เหลือครอบคลุมอัตโนมัติเพราะดึงจากข้อมูลสมาชิกจริง: ตัวกรอง `#jobFilter`, 📊 Job Breakdown/สรุปอาชีพ/เป้าอาชีพ,
  สีพายชาร์ต, และป้ายอาชีพในตี้/picker/หน้าประมูล. ไม่ต้องแก้ Firebase rules (`job`/`jobOverrun` = string ≤ 64, ไม่มี enum).

## [2026.07.03.1]
### Changed
- **ปุ่ม "🤖 จัดสรรอัตโนมัติ" (`arBulkApprove`) ตัดคนของไม่พอให้เอง.** เดิมกดแล้ว **อนุมัติทุกคนดื้อ ๆ ไม่เช็คจำนวนของ**
  แล้ว admin ต้องไปนั่งลบคนล้นเองในหน้า Auction. ตอนนี้จัดสรร **ตามจำนวนของจริง**: โควตาต่อชิ้น =
  `จำนวนของ ÷ อัตราต่อคน` (ปัดลง), ไล่ **มาก่อนได้ก่อน (FIFO)** เหมือนเดิม (สนามหลักก่อนรอง แล้วตามเวลาที่ขอ).
- **คนละ 1 ชิ้น** — ถ้าคำขอมีหลายชิ้น (ข้อมูลเก่า) ให้ชิ้นแรกที่ยังมีของเหลือชิ้นเดียว (modal ปัจจุบันเลือกได้ชิ้นเดียวอยู่แล้ว).
- **คนที่ของเต็มหมด → ปฏิเสธอัตโนมัติ พร้อมเหตุผลระบุชิ้นที่เต็ม** เช่น `ของไม่พอ: 🎴 การ์ด เต็มแล้ว — ไปขอชิ้นอื่นแทน`.
  Toast สรุป: `✅ อนุมัติ X คน · ✂️ ตัดของไม่พอ Y คน`. คำขอที่อนุมัติจะเก็บ field `grantedItem` (ชิ้นที่ได้)
  และโชว์ป้าย 🎁 ในคิว. การยกเลิกอนุมัติ (`arRejectRequest`) ถอนออกจากคอลัมน์ตาม `grantedItem` (ไม่พลาดคอลัมน์อื่น).
- **กันพลาด:** ถ้ายังไม่กรอกจำนวนของ (โควตา = 0 ทั้งหมด) จะ **ไม่ตัดใครทั้งกอง** — เด้งเตือน "กรอกจำนวนของก่อน" แล้วหยุด.
  ปุ่มอนุมัติทีละคน (✓ ด้วยมือ) **คงเดิม** = admin overrule เกินโควตาได้.

## [2026.06.28.4]
### Added
- **อาชีพแยก GL / Overrun ต่อคน.** เดิมสมาชิกมีอาชีพเดียวใช้ร่วมทุกหน้า — ตอนนี้กรอกได้ 2 อาชีพ
  ในหน้า Roster: **Job (GL)** (ช่อง `m.job` เดิม — ข้อมูลเก่าทั้งหมดกลายเป็นอาชีพ GL อัตโนมัติ) และ
  **Job (Overrun)** (ช่องใหม่ `m.jobOverrun`). ป้ายอาชีพ + การจัดตี้ "ไปตามหน้า": หน้า League/ประมูล GL
  ใช้อาชีพ GL, หน้า Overrun/ประมูล Overrun ใช้อาชีพ Overrun. ถ้ายังไม่กรอกอาชีพ Overrun ของใคร
  หน้า Overrun จะ **fallback ไปอาชีพ GL** ให้อัตโนมัติ.
- ทุกจุด "การจัดตี้" ตามหน้า: ป้ายในช่องตี้ (`slot-job`), แถบสรุปอาชีพต่อ battlefield (pills),
  ปุ่มจัดเรียงตามอาชีพ (`sortPartyByJob`/`sortAllPartiesByJob`), แผงเลือกสมาชิก (picker) + ตัวกรองอาชีพ,
  และป้ายอาชีพในหน้าประมูล GL/Overrun — ทั้งหมด resolve ผ่าน helper `jobForMode(m, ctx)`.
- หน้า "สรุปอาชีพในกิลด์" + "เป้าอาชีพ" (jobTargets) + Job Breakdown ยังใช้ **ชุดเดียวอิงอาชีพ GL**
  (ตามที่ตกลง — ไม่แยกต่อหน้า). ตัวระบุตัวคนใน snapshot/import/dedupe ยังใช้ `m.job` เดิม → ไม่กระทบ.
- **Firebase rules:** เพิ่ม field `jobOverrun` ใน whitelist ของ `/members/$mid` (string ≤ 64).
  ⚠️ ต้อง **publish rules ก่อน** deploy แอป ไม่งั้นการเขียน `jobOverrun` จะถูก reject.

## [2026.06.28.3]
### Changed
- **ปุ่มดึงรายชื่อที่อนุมัติ: เปลี่ยนจาก merge → REPLACE.** ของเดิม (merge) เติมที่ขาดอย่างเดียว
  ลบของค้าง/ที่ผิดในคอลัมน์ไม่ได้ → ยังไม่ตรงกับที่อนุมัติ. เปลี่ยนเป็น **แทนที่ทั้งหมด**:
  `arResyncApprovedToAuction` ล้างทุก bucket ของโหมดนั้นแล้วใส่เฉพาะคนที่อนุมัติ → คอลัมน์ตรงกับ
  "✅ อนุมัติแล้ว" 1:1 (ทิ้ง id ค้าง + คนที่ลากใส่เองโดยไม่มีคำขอ). ยังจับคู่ด้วยชื่อ (fallback จาก id)
  + overrun→main เหมือนเดิม. เพิ่ม `confirm()` กันลบพลาด. ปุ่มเปลี่ยนเป็น "♻️ แทนที่ Auction GL/Overrun
  ด้วยที่อนุมัติ". อัปเดตเทสต์ให้ยืนยันว่า REPLACE ล้างของค้างจริง (172/172).

## [2026.06.28.2]
### Fixed
- **Auction โดน wipe แบบเดียวกับ parties (overrun bug "ที่อนุมัติไม่ตรงกับ auction").**
  `state.auctionGL/Overrun` init เป็น object ที่มี assignments **ว่างเปล่า** (ไม่ใช่ `{}`)
  → `fbPushAll` เขียน auction แบบไม่มี guard → เครื่องใหม่ (มือถือ) push assignments เปล่า
  ทับคอลัมน์ที่อนุมัติไว้ ก่อน listener โหลดของจริง → คนที่อนุมัติหายจากคอลัมน์ แต่คำขอ
  status=approved ยังอยู่. แก้ด้วย hydration guard `_auctionHydrated.{gl,overrun}` ที่ `fbPushAll`
  (ตั้ง true ที่หัว auction listener แต่ละตัว).
- **`remapAuctionIds` ลืม `illusion`.** ตอนรีเฟรช roster จาก Sheet (member id เปลี่ยนใหม่หมด)
  remap แค่ cards/white/black → คนประมูล Illusion หลุดทุกครั้ง. เพิ่ม `illusion` เข้า list.
### Added
- **ปุ่ม "🔄 ดึงเข้า Auction GL / Overrun"** ในหมวด "✅ อนุมัติแล้ว" ของหน้าคิวคำขอ —
  ดึงทุกคำขอ status=approved กลับเข้าคอลัมน์ auction แบบ **merge** (เติมที่ขาด ไม่ลบของเดิม),
  จับคู่ด้วย **ชื่อ** (fallback จาก id) เลยทนต่อ id ที่เปลี่ยนหลังรีเฟรช roster. ใช้กู้คอลัมน์
  ที่โดน wipe + ซิงค์ซ้ำได้ทุกเมื่อ (idempotent, admin-only).

## [2026.06.28.1]
### Fixed
- **บั๊กข้อมูลหาย "ตี้เด้งออก" ตอน admin เปิดในมือถือ (ร้ายแรง).** เครื่องที่ไม่เคยเปิดแอป
  (ไม่มี `localStorage`) จะ init `partiesLeague/Overrun` เป็นกระดานเปล่าทุกช่อง **ก่อน**
  Firebase listener โหลดตี้จริงมาทัน — ถ้ามี action ใดยิง `save()`/`commitPartiesNow` ในจังหวะนั้น
  จะเขียนกระดานเปล่าทับของจริงใน Firebase แล้ว sync ไปลบทุกเครื่อง (คอมหายตาม). แก้ด้วย
  **hydration guard**: flag `_partiesHydrated.{league,overrun}` ตั้ง `true` ที่หัว listener แต่ละตัว
  (เหนือ `if(v==null) return` — กิลด์ใหม่สร้างตี้แรกได้ปกติ) แล้วกั้นการเขียน parties ทั้ง 3 จุด
  (`commitPartiesNow`, `fbPushAll`, `repairGhostSlots`). หมายเหตุ: เช็คเดิม `if (state.partiesLeague)`
  กันไม่ได้เพราะกระดานเปล่าเป็น array ที่ truthy.
- **มือถือ: เผลอลบ/ย้ายสมาชิกตอนเลื่อนจอ.** `setupTouchDnD` ติดอาวุธ drag จากการแตะค้าง 200ms
  แล้วไม่เช็คระยะลาก → แตะค้างนิ่งแล้วปล่อยนับเป็น drop ทันที. เพิ่มเกณฑ์ต้องลากจริง ≥24px
  (`DRAG_MIN_PX`) ใน `end()` ถึงจะนับเป็นการวาง/ลบ.

## [2026.06.27.1]
### Changed
- **Roster: เอาคอลัมน์ Discord ID ออก เหลือแค่ Discord.** ลบหัวตาราง + เซลล์ Discord ID,
  prompt ตอน ➕ เพิ่มสมาชิก ไม่ถาม Discord ID แล้ว, และ self-edit (💾 เซฟแถวตัวเอง) ไม่แตะ
  ฟิลด์ discordId อีก (กันเขียนทับค่าเดิมเป็นค่าว่าง). ปรับ colspan empty-state 8→7.
  หมายเหตุ: ฟิลด์ `discordId` ยังคงอยู่ใน data layer (Firebase rules ล็อกเป็น 1 ใน 9 keys +
  import จาก Sheet ยังเก็บ) — แค่ไม่โชว์/ไม่แก้บนหน้า roster แล้ว ข้อมูลเดิมไม่ถูกลบ.

## [2026.06.26.1]
### Changed
- **เปลี่ยนชื่อ repo + URL เว็บ (กันลิงก์หลุดหลังมีคนออกกิลด์).** rename `one-o-clock-woe`
  → `gboard-x7k3` ⇒ URL เก่า `cybodies.github.io/one-o-clock-woe` กลายเป็น **404**,
  URL ใหม่ = `cybodies.github.io/gboard-x7k3/`. อัปเดต og:image/og:url + ลิงก์ GitHub ใน
  `index.html` ตามชื่อใหม่. (ยังเป็น public repo — กันคนถือลิงก์เก่าเท่านั้น ไม่ใช่ auth จริง.)

## [2026.06.25.1]
### Changed
- **กลับมาใช้ GL 4 แมพ (เกมเปลี่ยนกลับด่วน).** ย้อนการยุบแมพ Guild League เป็น Vigrid Field
  แมพเดียว (v.2026.06.22.1–.2) กลับเป็นผัง **4 แมพเดิม**: เกิดบน = Main+Sub, เกิดล่าง = Main+Sub
  (`EMBEDDED_MAPS` slot 1,2,4,5 = `maps/main.png`/`maps/sub.png`). คืนค่า `app.html`/`index.html`/
  `test/run.js` จากสภาพ v2026.06.21.2 — งานอื่น (แท็บคำนวนขนนก, teams fix, dropdown) ยังครบ.
  เก็บ `maps/vigrid_field.png` ไว้ในรีโป เผื่อเกมสลับกลับ Vigrid จะได้สลับคืนเร็ว.

## [2026.06.22.2]
### Changed
- **แมพ GL แบ่งตี้คนละ 8 ต่อแมพ.** จากเดิม (v.1) แต่ละแมพโชว์ครบ 16 ตี้ → เปลี่ยนเป็น
  **เกิดบน = ตี้ 1–8, เกิดล่าง = ตี้ 9–16** (ตรงกับพาเนล Main/Sub). ฟิลเตอร์ + หมุดของแต่ละ
  แมพจัดเฉพาะ 8 ตี้ของตัวเอง; ชื่อแมพอัปเดตเป็น (ตี้ 1–8)/(ตี้ 9–16).

## [2026.06.22.1]
### Changed
- **ยุบแมพ Guild League เหลือสนามเดียว (Vigrid Field).** โหมด Vigrid Avenge ที่ประกาศออกมา
  สนาม Main/Sub/Ruinscape เล่นเหมือนกัน (ผังเดียวกัน) → เลิกโชว์แถว Sub Battlefield (แมพ 2/5)
  เหลือ Vigrid Field แถวเดียว 2 แผนวางข้างกัน: **เกิดบน** (แมพ 1) + **เกิดล่าง** (แมพ 4) แต่ละแมพ
  ปักครบทั้ง 16 ตี้ (เดิมแยก Main ตี้ 1–8 / Sub ตี้ 9–16). ฟิลเตอร์ 2 ชุดยังแยกอิสระต่อแผน, วงระยะ
  ◯ ใช้ได้ทั้งสองแมพ. พื้นหลังเปลี่ยนเป็น `maps/vigrid_field.png` (ภาพทางการ crop กรอบ+หัวเรื่องออก).
  พาเนลรายชื่อตี้ Main/Sub คงเดิมตามการแบ่งสนามในเกม.

## [2026.06.21.2]
### Fixed
- **แถบแท็บล้นเฮดเดอร์เมื่อจอแคบ — ยุบเป็น dropdown แบบมือถือก่อนพัง.** พอเพิ่มแท็บ "🪶 คำนวนขนนก"
  เป็น 10 แท็บ แถวปุ่มกว้าง ~950px + ของอื่นในเฮดเดอร์ → ต้องการ ~1393px (guest) / ~1533px (admin ที่โชว์
  กล่องอีเมล); จอ ≤1366px แถวปุ่มดันของในเฮดเดอร์เพี้ยน. แก้: ยุบ `.mode-toggle` เป็น `.mode-select`
  (dropdown เดิมของมือถือ) แบบ **role-aware** — guest ยุบที่ ≤1420px, admin ยุบที่ ≤1560px (เพราะ header
  กว้างกว่า) → จอใหญ่ยังเห็นแถบคลิกเดียว, จอเล็ก/ย่อหน้าต่างได้ dropdown กะทัดรัด ไม่พังทุกขนาด. CSS-only.

## [2026.06.21.1]
### Added
- **แท็บ "🪶 คำนวนขนนก" — ฝัง ROOC Feather Optimizer เข้าเว็บหลัก.** เครื่องมือคำนวณ/optimize ขนรูปปั้น
  (feather/statue build planner) มาเป็นอีก 1 แท็บใน app.html — ทุกคนที่ login ใช้ได้ (ไม่ admin-gate). ฝังแบบ
  **iframe** (`feather-optimizer.html` ไฟล์ standalone self-contained 190KB, inline CSS+JS ล้วน) เพื่อแยก
  CSS/JS/state ออกจากแอปหลักสนิท — ไม่ชนตัวแปร/id/ฟังก์ชัน และ iframe ไม่ถูก Firebase re-render รีโหลด (ค่า
  ที่ผู้ใช้กรอกในคลังขนไม่หาย). ใช้ระบบ mode เดิม: `switchMode('feather')` + CSS `body[data-mode="feather"]`
  ซ่อน sidebar/center โชว์ `#featherPane`; indicator สีทอง; `loading="lazy"` โหลด optimizer เมื่อเปิดแท็บแรก.

## [2026.06.17.1]
### Fixed
- **ชื่อหลุดออกจากช่องตี้เอง (data-loss) — แก้รากที่ regression กลับมา.** v2026.06.09.1 ตั้งใจให้
  `sanitizeSlots` เป็น "display-only ไม่เขียนทับ Firebase" แต่จริงๆ มัน **mutate `state.partiesLeague/Overrun`
  ในหน่วยความจำ** (reassign `p.slots`) — แล้ว push ตัวถัดไป (`fbPushAll`/`commitPartiesNow` เช่นตอนกดปุ่ม
  "ลา") ก็เซฟ null นั้นขึ้น cloud ถาวร = ชื่อหลุดจากช่อง. ซ้ำร้าย parties-listener ยัง sanitize เทียบกับ
  `state.members` ที่อาจเป็น localStorage เก่า (ถ้า `/parties` มาก่อน `/members`) → null ช่องที่ valid.
  **แก้:** ลบ `sanitizeSlots` ออกจาก listener ทั้งหมด (members + parties/league + parties/overrun) + ลบตัว
  helper + flag `_fbParties*Loaded` ที่ตายแล้ว. renderer โชว์ ghost เป็น Empty โดยไม่แตะ state อยู่แล้ว
  (`buildPartyRowHtml` → `isGhostMember`) — ช่อง valid จึงถูก null ถาวรไม่ได้อีก; ล้าง orphan ผ่านปุ่ม
  `repairGhostSlots()` (admin กดเอง) เหมือนเดิม. +เทสต์ "slot ที่ member ยังไม่โหลด → Empty แต่เก็บ id ไว้".
- **มาร์ค "ลา" ในตี้แล้วหาย/ไม่ซิงค์.** `toggleLeave` เซ็ต flag `onLeave*` บน `state.members` แล้วเรียก `save()`
  ซึ่ง `fbPushAll` **ไม่เคยเขียน `/members`** → flag ไม่ขึ้น cloud และ members-listener rebuild ตัด field ทิ้งทุก
  echo. **แก้:** `toggleLeave` เขียน `/members/{id}.update({onLeave*})` ตรงๆ (admin-gated) + members mirror
  เก็บ `onLeaveLeague/onLeaveOverrun` → มาร์คลาเซฟขึ้น cloud, เห็นทุกเครื่อง, ไม่หาย. ทุก edit path ปกติใช้
  `.update()` (merge) flag จึงรอดเวลาแก้ CP/ชื่อ.
### Added
- **จัดทีมบนมือถือได้แล้ว (touch drag-drop).** เดิมการลาก member เข้า slot ใช้ HTML5 drag ซึ่งไม่ทำงานบน
  จอสัมผัส → แอดมินที่เล่นมือถือจัดทีมไม่ได้ เหลือแต่คอม (= "มีแอดมินแก้ได้คนเดียว"). เพิ่ม `setupTouchDnD()`:
  long-press ~200ms เริ่มลาก (swipe สั้นยังเลื่อนลิสต์ได้), ปล่อยบน slot = วาง, ปล่อยบน pool = เอาออกจากตี้.
  วิ่งผ่าน path เดิม `placeAtSlot`/`removeFromSlot`/`commitPartiesNow` (guard 2s + audit เหมือนเมาส์ — ไม่มี
  ทางเขียนใหม่), admin-gated. ⚠️ ต้องเทสต์จริงบนมือถือ (ลากด้วยนิ้ว) — automation จำลอง touch ไม่ได้.

## [2026.06.13.3]
### Fixed
- **Overrun map ยืดบนจอกว้าง (normal view) — แก้จริงจุดนี้.** v.2 แก้แค่ contain (กันบิดในรูป)
  แต่กล่องยังผิดสัดส่วน: `.overrun-wrap` มี `width:100%` + `max-height:70vh` → จอกว้าง height ชน 70vh
  ขณะ width ยังเต็ม → กล่องกว้างกว่าสัดส่วนรูป (เช่น overrun.png 1.83 ถูกแสดงเป็น 2.58). แก้: cap
  `max-width: min(100%, calc(70vh × var(--map-ar)))` → กล่องคงสัดส่วน `--map-ar` เสมอ + center อัตโนมัติ.
  Browser-verified normal+fullscreen ทั้ง map3 (1.83) และ map6 (จัตุรัส 1.03) บน viewport 1680×780.

## [2026.06.13.2]
### Fixed
- **Overrun map: รูปที่อัปโหลดเองไม่ถูกยืดบิดอีกแล้ว** (เห็นชัดตอนกด Expand เต็มจอ). เหตุ:
  รูป custom จาก Firebase มาถึงตอนยังไม่ได้อยู่หน้า Overrun → วัดสัดส่วนรูป (`--map-ar`) ไม่ทัน →
  ค้างที่ค่า default 16/9 → `background-size:100% 100%` ยืดรูปสี่เหลี่ยมจัตุรัสให้กว้าง. แก้ 2 ชั้น:
  (1) cache สัดส่วนรูปไว้ + set ทันทีตอน re-render + re-query ตัว map จริงใน img.onload (กัน race),
  (2) เปลี่ยนแมพ Overrun เป็น `background-size: contain` → ไม่ว่าสัดส่วนจะพลาดยังไงก็ไม่บิด (letterbox แทนยืด).

## [2026.06.13.1]
### Added
- **Overrun: แมพที่ 2 "Emperium · ปราสาท Prontera"** เพิ่มใต้แมพ Overrun เดิม (เรียงบน-ล่าง).
  แต่ละแมพมีหมุด 5 กลุ่มสีลากวางได้ + ลูกศรเคลื่อนที่ **ตำแหน่งอิสระต่อกัน** และ **filter แยกของตัวเอง**
  (ติ๊กกลุ่มบนแมพ 1 ไม่กระทบแมพ 2). Sync ผ่าน Firebase node ใหม่ `/overrun_markers_b`; admin
  อัปโหลดรูปทับได้เหมือนแมพอื่น (`map_images` รองรับ slot 6 แล้ว).
### Changed
- โครงสร้างเรนเดอร์แมพ Overrun เป็น config-driven (`OVERRUN_MAPS`) — render/arrows/drag/clear
  วนทั้ง 2 แมพจาก path เดียว, id ของ marker ลูกศรแยกต่อแมพ (`ov-arrow-{mapNum}-{i}`) กันชนกัน.
### Fixed
- `render()` โหมด Overrun เคย apply พื้นหลังแค่แมพ 3 — ตอนนี้ apply ทั้ง 2 แมพ (แมพใหม่ไม่พื้นว่าง).

## [2026.06.12.5]
### Changed
- **Overrun: เปลี่ยนชื่อกลุ่ม "พิเศษ" → "Purple"** ให้เข้าชุด Red/Yellow/Green/Blue (ตี้ 15,16 เหมือนเดิม).
- **จัด layout การ์ดกลุ่ม Overrun ใหม่ (masonry).** เดิมเป็น grid ที่ยืดการ์ดให้สูงเท่ากันทั้งแถว —
  การ์ด 2 ตี้เลยมีพื้นที่ว่างโบ๋ข้างใน และกลุ่มเล็กตกไปอยู่แถวล่างเดียวดาย; ตอนนี้การ์ดสูงตามเนื้อหา
  และสองคอลัมน์ balance อัตโนมัติ (Red+Yellow / Green+Blue+Purple) ทั้งหน้าแน่นเรียบร้อย.

## [2026.06.12.4]
### Fixed
- **หน้าแมพ: hard-gate หมุด/ลูกศร/วงระยะ เป็น admin-only — guest เหลือ filter/ระยะ/Expand (ดูอย่างเดียว).**
  เดิม guest ลาก/คลิก/คลิกขวาหมุดได้บนจอตัวเอง (rules บล็อกตอน persist อยู่แล้ว → ภาพหลอก: เห็นว่าขยับได้
  แต่หายเองตอน snapshot ใหม่ + คลิกหมุดเฉยๆ = ล้างเส้นทางบนจอตัวเอง). ตอนนี้ listener ไม่ถูก attach เลย
  สำหรับ non-admin (`attachMarkerDrag` / `attachMarkerDragOverrun` / `attachRangeCircleDrag` guard ที่ต้นฟังก์ชัน
  + `clearArrows` มี gate), ปุ่ม 🗑 Clear arrows ซ่อนจาก guest แทนด้วยป้าย "🔒 ดูอย่างเดียว" ทั้งการ์ด League
  ทั้ง 4 และ Overrun. ปิด soft-gate ที่ note ไว้ตอน audit 2026-06-09.

## [2026.06.12.3]
### Changed
- **Job Breakdown: เช็คแบบเป๊ะ ๆ — มี ≠ เป้า คือเตือนทันที ไม่มี "ใกล้เคียง" อีกแล้ว.**
  เดิมเพี้ยน ±1 ยังนับ "สมดุล" (เช่น 15/16) ทำให้รูโหว่ซ่อนอยู่; ตอนนี้สถานะบอกส่วนต่างตรง ๆ
  ("เกิน 2" / "ขาด 1") และ AI Comment แม่นขึ้น: บรรทัดสรุป "เทียบเป้ารวม มี X/เป้า Y →
  ขาด/เกินสุทธิ Z" + คำแนะนำจับคู่ย้ายอาชีพแบบระบุจำนวน ("ย้าย 2 คน: Summoner → Bard").
- **หน้า GL: เรียงแผนที่ใหม่เป็น หลัก-หลัก / รอง-รอง.** เดิม หลัก-รอง / หลัก-รอง ทำให้
  สนามรองคั่นกลางระหว่างสองแผนของสนามหลัก.
### Added
- **🖼 ปุ่มอัปโหลดรูปแผนที่ (admin) กลับมาแล้ว — ครบทุก map ทั้ง GL (4) และ Overrun (1).**
  รูปถูกบีบอัดอัตโนมัติฝั่งเครื่อง (JPEG ≤ ~660KB) เก็บใน Realtime DB node ใหม่ `map_images`
  (read=authed, write=admin, จำกัดชนิด/ขนาดใน rules) — ทุกเครื่องเห็นรูปใหม่ทันที, ปุ่ม
  "↺ รูปเดิม" ลบกลับไปใช้รูปมาตรฐานได้, ไม่แตะ Firebase Storage และไม่ทำให้ localStorage บวม
  (เก็บนอก state). ต้อง publish Database Rules ก่อนใช้.

## [2026.06.12.2]
### Changed
- **Overrun: เพิ่มกลุ่มที่ 5 สีม่วง "พิเศษ" (ตี้ 15,16) — แบ่งมาจาก Blue.**
  กลุ่มสีตอนนี้: Red 1-4 · Yellow 5-8 · Green 9-12 · **Blue 13-14** · **พิเศษ(ม่วง) 15-16**.
  ตัวตี้/รายชื่อ/slot ไม่ขยับ (id เดิมทุกตี้ — คนที่จัดไว้ในตี้ 15,16 แค่เปลี่ยนกลุ่มสีเป็นม่วง).
  การ์ดกลุ่ม, หมุดบนแผนที่ Overrun (หมุด #5 เริ่มกลางแผนที่), ลูกศรเดินทัพ, ชิปกรองกลุ่ม,
  tooltip และแถบสีแท็บ ตามมาครบอัตโนมัติ. League 16 ตี้เหมือนเดิมทุกอย่าง.

## [2026.06.12.1]
### Added
- **ขอประมูล: โชว์เวลาที่ขอ 🕐 + เลขคิว #N — เรียงคิวใครมาก่อนมาหลังได้แล้ว.**
  ทุกแถวคำขอ (ทั้งฝั่ง admin และ "คำขอของฉัน") แสดงเวลาที่ส่งคำขอ HH:MM:SS (เวลาไทย,
  จาก `requestedAt` ที่บันทึกอยู่แล้ว — ข้อมูลเก่าโชว์ "—"). กลุ่ม **รออนุมัติ** เปลี่ยนเป็น
  เรียงตามเวลาล้วน ๆ (first-come-first-served) พร้อมเลขคิว #1, #2, … ไล่กดอนุมัติบนลงล่าง
  = ตามคิวพอดี (ป้าย หลัก/รอง ยังติดอยู่ทุกแถว). ส่วน อนุมัติแล้ว/ปฏิเสธ + ปุ่มจัดสรรอัตโนมัติ
  พฤติกรรมเดิม. ไม่มีการแก้ Firebase rules.
- **เวลาคำขอใช้นาฬิกาเซิร์ฟเวอร์ (`ServerValue.TIMESTAMP`)** — กันเครื่องสมาชิกตั้งเวลาเพี้ยน/
  ย้อนเวลาแล้วแซงคิว (คำขอใหม่ตั้งแต่เวอร์ชันนี้; คำขอเก่าใช้เวลาที่บันทึกไว้เดิม).

## [2026.06.11.2]
### Changed
- **Auction GL: ถอดระบบคูณโบนัส (×) ออกทั้งหมด — กรอกจำนวนของสุทธิเองตรง ๆ.**
  Section "⭐ Bonus rate" (ปุ่ม 0/50/70/100% + ตาราง Base→คูณ→หลัง Bonus), pill "Bonus: %",
  สูตร การ์ด/Illusion ×2 + ขน ×(1+%/100) ใน `computeAuction`, `setAuctionPercent()` และ
  field `bonusPercent` ถูกลบหมด (normalize ตัดทิ้งจาก save เก่าอัตโนมัติ). ช่องกรอกเปลี่ยน
  หัวข้อเป็น "📦 จำนวนของ (กรอกยอดจริงที่จะแจก)" — พิมพ์เท่าไหร่ระบบใช้เท่านั้น.
  ส่วนอื่นเดิมทั้งหมด: แบ่งสนามหลัก/รอง %, rate ต่อคน, ลากชื่อ, page map, Overrun.

## [2026.06.11.1]
### Added
- **🎡 หน้า "สุ่มรางวัล" (admin-only): วงล้อสุ่มผู้โชคดีจากรายชื่อใน Roster.**
  แท็บใหม่เห็นเฉพาะ admin (pattern เดียวกับ Users — `seg-admin` + จอล็อกใน `buildWheelHtml()`).
  ทุกคนใน roster อยู่ในวงล้อ**ทุกรอบ** (ตั้งใจ — ไม่มี auto-remove ผู้ชนะ); admin ติ๊กคนออกได้ชั่วคราว
  (ราย session, ไม่ sync) + ปุ่ม "🌴 ตัดคนลาวันนี้ออก" (อ่านจาก `/leaves` + ธงลาใน Roster).
  ผลถูกสุ่มด้วย `crypto.getRandomValues` (rejection sampling, ไม่มี bias) **ก่อน**เริ่มแอนิเมชัน —
  วงล้อหมุน ~4.6 วิเป็นแค่การแสดงผล. หลังหมุน: modal ผู้ชนะ + confetti → **บันทึกผล** (เขียน
  `/wheel_history`: เวลา/ผู้ชนะ/รางวัล/คนสุ่ม, เก็บล่าสุด 200 รายการ, ลบรายการได้) หรือ **ไม่นับรอบนี้**.
  Database Rules เพิ่ม node `wheel_history` (read=authed, write=admin, shape-locked `$other:false`).
  ป้องกัน snapshot กลางคัน: render ข้ามหน้า wheel ระหว่าง `wheelUI.spinning`.

## [2026.06.10.1]
### Added
- **Roster self-service: สมาชิก (Guest) แก้ข้อมูลแถวตัวเองได้ครบทุกช่อง — ชื่อ / Job / Discord / Discord ID / CP.**
  กด "เลือกชื่อตัวเอง" บน toolbar (ระบบ claim เดียวกับหน้า "ขอประมูล" — จำใน browser, sync กันสองหน้า) แล้วแถวตัวเอง
  จะ highlight เขียว; แถวคนอื่น read-only. **Job/CP ที่เดิม guest แก้ได้ทุกแถว ถูกจำกัดเหลือแถวตัวเอง**
  (ตั้งใจ — กันเคสมือบอนแบบ Overrun). ทุกการแก้ stamp `updatedBy` (ชื่อที่ claim / อีเมล admin) โชว์ใต้ Last Update.
  หมายเหตุ: claim เป็น localStorage ฝั่ง client = UX gate **ไม่ใช่ security boundary** (Database Rules อนุญาต authed
  update `/members/$mid` อยู่แล้วตั้งแต่เดิม) — `updatedBy` ให้ social accountability + client validation คุม input.
- **ปุ่ม 💾 เซฟ สำหรับแถวตัวเอง (draft mode).** ช่องของ guest ไม่เซฟทีละช่องตอน blur แล้ว — พิมพ์รวมแล้วกดปุ่มเดียว
  เขียนทั้ง 5 ฟิลด์เป็น write เดียว + toast "✅ เซฟแล้ว"; ปุ่มเปลี่ยนสีเมื่อมีแก้ค้าง (dirty). ระหว่าง draft เปิดอยู่
  ระบบพัก re-render จาก Firebase snapshot (pattern เดียวกับ `_isDragging`) กันพิมพ์ค้างแล้วโดนลบ; ช่องค้นหา
  carry draft ข้าม rebuild. ฝั่ง admin คงพฤติกรรมเดิม (แก้ปุ๊บเซฟปั๊บทุกแถว). ปุ่มยืนยัน claim ใช้คำว่า "ยืนยัน"
  (เดิม "บันทึก") กันสับสนกับปุ่มเซฟข้อมูล.
### Security
- **database.rules.json: `/members/$mid` ถูก shape-lock เต็มรูปแบบ** — `.validate` ราย field (string ≤64/≤32,
  cp number 0..100M, updatedAt number, onLeave* boolean), `"$other": false` ปัด key แปลกปลอม (กัน storage abuse —
  ปลอดภัยเพราะ writer ทุกตัวใช้ 9 keys ที่ validate ครบ; `.validate` ไม่ retroactive กับข้อมูลเก่า มีผลเฉพาะ write ใหม่)
  และ lock ลูกใต้ทุก field (`"$x": false`) ปิดช่อง RTDB ที่ parent `.validate` ไม่ถูก evaluate เวลาเขียนลึกกว่า field
  (เช่นเขียน `/name/child` เปลี่ยน string เป็น object ได้). `name` ยอมรับ `""` (dedupe ghost rows — ห้ามว่างเฉพาะ
  ฝั่ง client). Security review (2 มุม: client XSS/authz + rules adversarial) = **SAFE TO PUBLISH**, ปิด stored-XSS
  เก่าผ่าน string cp ไปด้วย. **ยังไม่ deploy — ต้อง publish ใน Firebase console หรือ `firebase deploy --only database`
  แล้วเทสใน rules simulator ก่อน** (เคสทดสอบ: anon เขียน `cp="abc"` → Deny, เขียน object ลง `name` → Deny).
- **updatedBy ฝั่ง guest ติด prefix "👤"** — admin stamp (อีเมล) ไม่มีทางขึ้นต้นด้วย 👤 ดังนั้น guest ที่เปลี่ยนชื่อ
  ตัวเองเป็นอีเมล admin จะปลอม stamp ให้ดูเหมือน admin ผ่าน UI ไม่ได้.
### Fixed
(จาก /code-review 7 มุม ก่อน merge)
- **ทุก writer ของ `/members` clamp payload ตาม rules + ติด `.catch` แจ้ง toast** (`rosterClampFields` /
  `rosterWriteFailed`): เดิม เพิ่มสมาชิก/Import/Dedupe/Migrate ส่งค่าเกิน validator ได้ → หลัง publish rules
  write จะโดนปัดตกแบบเงียบ หรือ abort batch กลางคัน (เช่น Discord ID 18 หลักหลุดไปช่อง CP ใน Sheet).
- **Migrate ไม่ลบ discord/discordId อีกแล้ว** — เดิม `.set()` ด้วย payload ไม่ครบ field ทับทั้ง node
  (คลิกเดียวลบข้อมูล Discord ทั้ง guild ได้); ตอนนี้ส่งครบ + stamp `updatedBy`.
- **updatedAt↔updatedBy ต้องคู่กันเสมอ**: Import/Dedupe เดิม stamp เวลาใหม่แต่คงชื่อคนแก้เก่า → โทษคนผิด
  (misattribution); ตอนนี้ทุก write ที่แตะ `updatedAt` stamp ผู้กระทำจริงผ่าน `rosterActorName()`.
- **Ghost rows (ชื่อว่าง) ไม่โผล่ใน dropdown เลือกชื่อ** — เดิมเลือกได้แล้วได้แถวนิรนาม `updatedBy:"guest"`.
- **ค่าที่เลือกค้างใน dropdown เลือกชื่อ รอด re-render** — เดิมโดนรีเซ็ตทุกครั้งที่มีคนแก้ข้อมูล (คืนวอร์แทบเลือกไม่ทัน).
- **Guest แก้แถวที่เพิ่งถูกลบ → เห็น error จริง** ไม่ใช่หน้าจอโชว์ค่าที่ไม่ได้เซฟ (`.catch` + re-render resync).
- ป้าย "admin only" บนหัวคอลัมน์ Job ที่ผิดมาตลอด (job แก้ได้โดย guest อยู่แล้ว) — เอา badge ชุดนี้ออก + ลบ CSS
  `.badge` ที่ตายแล้ว; loader/dedupe/migrate coerce `cp` เป็น number กัน legacy string CP ชน rules validate.
- Cleanup: claim เป็น concept กลาง (`claimGetMemberId`/`claimSetMember` + `claimOptionsHtml` ใช้ร่วม 2 หน้า,
  `ar*` เป็น alias เดิม), แยก `rosterActorName`/`rosterStaticCell` แทนโค้ดซ้ำ, test กัน limits drift
  (client constants ต้องเท่ากับตัวเลขใน rules เสมอ).

## [2026.06.09.3]
### Fixed
- **ปุ่ม "📷 Upload" ในการ์ดแมพ League กดแล้ว error (`setMapBg is not defined`).** handler `setMapBg`/`uploadMapToStorage`
  ถูก retire ไปแล้ว (รูปแมพฝังเป็น static asset) แต่ปุ่มยังค้างใน `buildMapHtml` (แมพ 1/2/4/5) จึง throw เวลากด.
  เอาปุ่มออกให้ตรงกับการ์ด Overrun ที่เอาออกไปก่อนแล้ว + ลบ CSS `label.btn` ที่ตายแล้ว. ไม่กระทบการแสดงผล/sync แมพ
  (`state.mapBg` + `EMBEDDED_MAPS` เหมือนเดิม).

## [2026.06.09.2]
### Added
- **แผนเกิดบน/เกิดล่าง — แมพ Guild League เป็น 4 การ์ด.** GL สปอว์นได้ทั้งฝั่งบน/ล่าง เลยต้องวาง 2 แผน.
  เพิ่มการ์ด Main+Sub อีกชุด (mapNum 4/5, "เกิดล่าง") ใช้ **ทีมชุดเดิม + รูปแมพเดิม** แต่มีหมุด/ลูกศรแยกของ
  ตัวเอง: `state.markersBottom` sync ผ่าน Firebase node ใหม่ `markers_bottom` (ทำตาม pattern `overrun_markers`).
  หมุดเดิมกลายเป็นแผน "เกิดบน". วงระยะ/ฟิลเตอร์ตี้/สมาชิกในตี้ ใช้ร่วมกันทั้ง 2 แผน. การจัดตี้ (`commitPartiesNow`)
  ไม่กระทบ. helper `leagueMarkerStore/leagueMapIsMain/leagueMapPlan` เลือก store/range ตาม mapNum.

## [2026.06.09.1]
### Fixed
- **ชื่อที่จัดเข้าตี้ "เด้ง"/หายเอง (เงียบๆ ไม่มี toast/audit).** จัดตี้ไว้ เข้าออกหลายรอบก็อยู่ แต่บางทีเปิด
  เข้ามาแล้วชื่อหายเอง. ต้นเหตุ: auto-sanitize ตัด slot ที่ `findMember(id)` หาไม่เจอ (`!m`) แล้ว **`.set()`
  เขียนทับ Firebase ถาวร** โดยไม่มี guard รอ `/parties` snapshot จริง — พอ members listener ชนะ race จะ
  sanitize ทับ parties จาก localStorage (ที่อ้าง member ที่ถูกลบไปแล้ว) ลบ slot ที่ valid แล้วเซฟทับ เงียบๆ
  (ไม่มี toast, ไม่ลง audit เพราะ sanitize write-back ไม่เรียก `logAudit`). **แก้ A:** auto-sanitize เป็น
  display-only ไม่ `.set()` กลับ Firebase อีก — ล้าง orphan ถาวรผ่านปุ่ม `repairGhostSlots()` (admin กดเอง).
  **แก้ B:** เพิ่ม `_fbPartiesLeagueLoaded`/`_fbPartiesOverrunLoaded` กั้นไม่ให้ members-listener sanitize
  ก่อน snapshot จริงของ `/parties` โหลด. การจัดตี้ปกติ (`commitPartiesNow`) ไม่กระทบ.

## [2026.06.08.1]
### Added
- **Audit log: บันทึกว่า "ใครแก้ทีม".** เดิมข้อมูลมีแค่ `updatedAt` (เวลา) แต่ไม่มี "ใคร" →
  เวลาทีม (เช่น Overrun วันอาทิตย์) โดนเปลี่ยน เราชี้ตัวคนทำไม่ได้. ตอนนี้ทุกครั้งที่ **แอดมิน
  แก้ทีม** (ลาก/วาง, sort, เปลี่ยนชื่อตี้, ลบจาก slot) ระบบบันทึก `{เวลา, อีเมลคนแก้, ทีม League/Overrun}`
  ลง Firebase node `/system/auditLog` แล้วโชว์ใน **กล่อง Login → "📜 ประวัติการแก้ทีม"** (อ่านอย่างเดียว,
  เห็นเฉพาะแอดมิน). บันทึกที่ **จุดแก้จริง (`commitPartiesNow`)** ซึ่งเป็น path เดียวของการแก้ทีม → ไม่พลาด
  และไม่โทษผิดคน; รู้กระดานจาก `state.mode`. แอดมินคนเดิมแก้กระดานเดิมรัวๆ ภายใน `AUDIT_COALESCE_MS`
  (=60s) จะ **ยุบเป็นแถวเดียว (×จำนวน)** ให้อ่านง่าย; เก็บสูงสุด `AUDIT_LOG_MAX`=50 (ตัดทั้งตอนเขียนและตอนอ่าน).
  **เก็บ log ใต้ `/system` ที่เป็น admin-write อยู่แล้ว → ไม่ต้องแก้ `database.rules.json`.** ข้อจำกัด:
  logAudit เขียนทับทั้ง array (read-modify-write) แอดมิน 2 คนแก้พร้อมกันเป๊ะอาจตกหล่น 1 entry — ยอมรับได้
  สำหรับกิลด์เดียวที่เชื่อใจกัน (โมเดลคือหัวหน้าแก้ คนอื่นดู). +4 เทสต์กลุ่ม `[audit log]` (cap / ยุบ burst /
  ไม่ยุบข้าม actor·action·เวลา / ทน log ที่ไม่ใช่ array).

## [2026.05.30.16]
### Changed
- **ฟิลเตอร์แผนที่เลือกได้หลายตี้พร้อมกัน (multi-select).** เดิม dropdown เลือกโฟกัสได้
  ทีละตี้ ตอนนี้เปลี่ยนเป็นแถว **ชิปติ๊ก** — กดเลขตี้หลายตัวเพื่อดูพร้อมกัน (เช่น ตี้ 4 + 5
  บนแผนที่ GL Main), ชิปที่เลือกติดสีตามทีม. ปุ่ม "🔍 ทุกตี้/ทุกกลุ่ม" ล้างเพื่อแสดงทุกตี้.
  ใช้ได้ทั้ง Main / Sub / Overrun แยกอิสระต่อแผนที่. เป็นมุมมองส่วนตัวของแต่ละคน
  (ไม่ sync, รีเซ็ตเมื่อ refresh) — ไม่ต้องแก้ Firebase rule. `_mapFilter*` เปลี่ยนจากเลขเดียว
  เป็น `Set` (ว่าง = ทุกตี้); helper `mapFilterVisible`/`_toggleInSet`. +5 เทสต์กลุ่ม
  `[map filter]` + css coverage.

## [2026.05.30.15]
### Added
- **วงกลมมาร์กระยะบนแผนที่ GL สนามหลัก.** เพิ่ม 3 วงระยะ (zone) วางบนจุดสี่เหลี่ยม
  กลาง/ซ้าย/ขวาของแผนที่ GL Main — มีปุ่ม "◯ ระยะ" บนหัวแผนที่เปิด/ปิดได้ (ค่าเริ่มต้นปิด).
  แอดมินลากจุดกลางเพื่อย้าย และลากจุดขอบเพื่อปรับรัศมีได้ (สมาชิกทั่วไปเห็นวงแบบอ่านอย่างเดียว
  ลากไม่ได้). ตำแหน่ง/รัศมี sync ทั้งกิลด์เรียลไทม์ผ่าน Firebase node ใหม่ `range_circles`
  (เก็บเป็น array 3 วง `{x,y,r}` หน่วยเป็น % ของแผนที่) + ปุ่ม "↺ รีเซ็ตวงระยะ" คืนค่าเริ่มต้น.
  อยู่เฉพาะแผนที่ GL Main (ไม่มีในสนามรอง/Overrun). `clampRangeCircle`/`initRangeCircles`
  กันค่าเพี้ยน (x,y 0–100, r 2–60) + เทสต์กลุ่ม `[range circles]` 6 ตัว + css coverage.
### Notes
- **ต้อง deploy Firebase rules ใหม่ด้วยตนเอง** — เพิ่ม node `range_circles` (อ่านได้ทุกคน
  เขียนได้เฉพาะแอดมิน) ใน `database.rules.json` ถ้ายังไม่ deploy การเขียนวงจะถูกปฏิเสธ
  (วงจะใช้ดูในเครื่องได้ แต่ไม่ sync ข้ามคน).

## [2026.05.30.14]
### Changed
- **ย้ายชื่อ repo → `one-o-clock-woe` (ลิงก์ใหม่).** เว็บย้ายจาก
  `cybodies.github.io/woe-party` ไป `cybodies.github.io/one-o-clock-woe` (ลิงก์เก่า GitHub
  redirect ให้อัตโนมัติ). อัปเดต URL ที่ฝังในโค้ด: `index.html` (og:url, og:image, ลิงก์
  GitHub footer) + เอกสาร (CLAUDE.md, RUNBOOK.md, woe-coder agent). git remote ชี้ repo
  ใหม่แล้ว. **Firebase project (`woe-party-default-rtdb`) ไม่เปลี่ยน** — เป็นคนละระบบ
  ข้อมูลกิลด์ทั้งหมดตามมาครบ ไม่หาย. โค้ดยัง public ตามเดิม.

## [2026.05.30.13]
### Fixed
- **ทำให้ fix v.12 (ช่องค้นหาสมาชิกเด้งขึ้นบน) สมบูรณ์.** v.12 ใส่บรรทัด "เก็บค่า
  `scrollTop`" ลงไป แต่บรรทัด "คืนค่า" ดัน apply ไม่ติด (anchor ไม่ตรง) — เลยเก็บแต่ไม่คืน
  รายชื่อจึงยังเด้งขึ้นบนเหมือนเดิม. v.13 เพิ่มบรรทัดคืนค่า `list.scrollTop = _mlScrollTop`
  หลัง re-render ครบถ้วน + เทสต์ `[search box scroll-jump guard]` เช็คลำดับ capture → innerHTML
  → restore แล้ว (ตอนนี้ผ่าน). _หมายเหตุ: v.12 ที่ขึ้นไปก่อนหน้ามีเทสต์แดง 1 ตัว — ผิดพลาด
  ของผมเองที่ push ทั้งที่ยังไม่เขียว v.13 แก้ให้เรียบร้อย._

## [2026.05.30.12]
### Fixed
- **ช่องค้นหารายชื่อสมาชิก (sidebar) ไม่เด้งขึ้นบนแล้วตอนพิมพ์.** `renderMembers` เขียน
  `#memberList.innerHTML` ใหม่ทุกตัวอักษรที่พิมพ์ ซึ่ง reset `scrollTop` ของ `.member-list`
  (เป็น scroll container เดียวของ pool) กลับเป็น 0 → รายชื่อเด้งขึ้นบนสุด. แก้โดยเก็บ
  `scrollTop` ก่อน re-render แล้วคืนค่าหลัง (ช่อง input เป็น sibling ไม่ถูกสร้างใหม่
  focus/caret จึงอยู่ครบอยู่แล้ว). คนละจุดกับ fix v.7 ที่แก้ `auctionSearchInput` (ช่อง
  ค้นหาในหน้าประมูล) — อันนั้นคนละช่องกัน. +2 เทสต์ใน `[search box scroll-jump guard]`
  (รวม 82).

## [2026.05.30.11]
### Changed
- **ขอประมูลได้ 1 คน 1 อย่าง ต่อกิจ.** เดิมสมาชิกติ๊กขอได้หลายชนิดในคำขอเดียว ตอนนี้
  จำกัดให้ขอได้ **1 ชนิดต่อกิจ** (การ์ด/Illusion/ขนขาว/ขนดำ — เลือกอย่างเดียว) — modal
  เปลี่ยนเป็น single-select (ปุ่มวงกลม ◉/○). ถ้ามีคำขอค้างอยู่แล้ว (รออนุมัติ/อนุมัติแล้ว)
  ปุ่ม "ขอประมูล" จะล็อกเป็น "✅ ขอแล้ว 1 อย่าง" — ต้อง **ถอนของเก่าก่อน** ถึงจะขอใหม่ได้
  (คำขอที่ถูกปฏิเสธ/ถอนแล้ว ไม่นับ — ขอใหม่ได้เลย). บังคับใช้ทั้งฝั่ง UI และตอนสร้างคำขอ
  ผ่าน `arActiveRequestFor` (แหล่งความจริงเดียว); `arCreateRequest` คืน `true` เมื่อสำเร็จ
  เพื่อให้ modal ปิดถูกต้อง. +6 เทสต์ (รวม 79).

## [2026.05.30.10]
### Added
- **ประวัติคำขอที่ถูกปฏิเสธ (same-day).** หน้า ขอประมูล ฝั่งแอดมินมี section ใหม่
  "❌ ปฏิเสธวันนี้" แสดงคำขอที่กดปฏิเสธไป (พร้อมเหตุผล) ค้างไว้ให้ดูตลอดวัน — แอดมิน
  เห็นว่าใครโดนปฏิเสธและกด "✓ อนุมัติ" ย้อนได้ถ้าปฏิเสธพลาด ประวัตินี้ถูกล้างพร้อม
  ทั้งวันโดย "ล้างคำขอทั้งหมดของวันนี้" / ล้างวันที่ผ่านมา / รีเซ็ตรายวัน (ขอบเขตวันเดียว
  เหมือนข้อมูลประมูลอื่น). (`arBuildAdminQueue` ดึง `rejected` เพิ่ม; `arRenderRow` ปุ่ม
  re-approve สำหรับ rejected row.)

## [2026.05.30.9]
### Changed
- **Auction page-map now packs items CONTINUOUSLY instead of starting each item type on a
  fresh page.** The next item type begins right after the previous one's last slot on the
  same page — e.g. การ์ด fills page 1, Illusion takes page 2 slots 1-2, then ขนขาว starts on
  **page 2 slot 3** (not a fresh page 3). For Overrun with การ์ด 20 + Illusion 2, ขนขาว now
  starts **page 6 slot 3**. This reverses the per-type fresh-page rule from 2026.05.30.3 to
  match the in-game auction's actual behavior. One shared code path fixes GL + Overrun; the
  per-column page chip, the top page-map strip, and the per-person page badges all follow.

## [2026.05.30.8]
### Fixed
- **Per-column page chip shows the exact slot range, not just the page.** A partial page
  read ambiguously (2 items on page 6 showed “หน้า 6 · 2 ชิ้น”, looking like the whole page).
  It now reads “หน้า 6 · ชิ้น 1-2 · รวม 2 ชิ้น” (and “หน้า X (ช่อง a)–Y (ช่อง b)” when it spans
  pages), matching the per-person badges below it.

## [2026.05.30.7]
### Fixed
- **Auction search box no longer jumps to the top while typing.** `auctionSearchInput`
  restored focus/scroll in a `setTimeout`, so the page painted at the top for one frame
  (the jump) before snapping back. It now restores focus + caret + scroll synchronously
  right after the re-render — the same proven pattern as `setAuctionField`/`setAuctionRate`.
- **GL split % input now matches the dark/gold theme.** Its CSS (`.auction-split-input`
  + related) had silently failed to land, so it rendered as a plain white box. Added the
  themed styles plus a `[css coverage]` test group that fails if a themed control's class
  is in the markup but has no matching CSS rule.

## [2026.05.30.6]
### Fixed
- **Admin "จัดสรรอัตโนมัติ" buttons now follow the day's event.** On the ขอประมูล admin
  queue, only the current event's allocate button shows — GL on อังคาร/พฤหัส, Overrun on
  อาทิตย์, and **neither** on a non-event day (previously both GL + Overrun always showed).
  Matches the event-day lock already enforced on the guest request side. "🧹 ล้างวันที่
  ผ่านมา" stays available regardless. (`arBuildAdminQueue` now takes `eventMode`.)
### Added
- **`woe-feature-map` skill** — a pre-edit checklist that traces every surface a feature
  touches (guest/admin/viewer render, GL/Overrun branches, state+sync, the gate on all
  actors, tests) so a cross-cutting rule can't be applied to one surface and missed on its
  twin (the bug above is its worked example).

## [2026.05.30.5]
### Added
- **Editable สนามหลัก/สนามรอง split % for the GL auction.** Admins can set what
  percent of each item goes to สนามหลัก (default 70); สนามรอง gets the rest. New
  "⚖️ การแบ่งสนาม" control on the Auction GL page; all field labels (headers, per-column
  ใช้/XX%, summary) follow the value live. The split rides the existing `auction_gl`
  Firebase object (no rule change). Overrun is unaffected (no sub field).
### Changed
- **Uneven split now rounds the leftover to สนามหลัก (ceil), not down.** When an item
  count doesn't divide cleanly, the extra piece is auctioned on the main field — e.g. 5
  ชิ้น @70% = หลัก 4 / รอง 1 (previously 3/2). Whole splits (e.g. 10 @70% = 7/3) are
  unchanged, as are the supply page-map's per-type page ranges (they derive from each
  item's total, not the main/sub split).

## [2026.05.30.4]
### Added
- **Branded landing page (front door).** A new static `index.html` is now the front
  page — the "one o clock — Ragnarok Origin Classic" logo, a feature overview, the weekly
  event schedule (อังคาร/พฤหัส = GL · อาทิตย์ = Overrun, today highlighted), and a CTA into
  the tool. Open Graph tags make shared links preview the logo (Discord/LINE). Logo at
  `assets/one-o-clock.png`.
### Changed
- **The app moved from `index.html` to `app.html`** so the landing can own the root URL.
  GitHub Pages now serves the landing at `/` and the organizer at `/app.html`. Weekly users
  can bookmark `/app.html` to skip the intro. Test harness + parse check follow the rename;
  a `[landing]` test group guards the front-door wiring.

## [2026.05.30.3]
### Fixed
- **Auction page-map — each item type now starts on its own fresh page** (matches
  the in-game auction, where every item type begins on a new page). Previously a
  type continued mid-page from the previous type (e.g. ขนขาว shared a page with
  Illusion), so the page numbers didn't line up with the real auction. Now: การ์ด 4
  → all page 1; การ์ด 6 → p1–2; the next type starts fresh. Within a type, main → sub
  still run continuously. Applies to GL and Overrun (fixes Overrun types overlapping
  on page 1). Per-person page badges + the per-column page chip follow the same blocks.
### Added
- **Per-column coverage line** on each auction column — "ลากถึงหน้า N · ขาดอีก X ชิ้น
  (Y หน้า)" / "✅ ลากครบ" / "เกินมา" — so the admin can fill people to match the real
  pages without counting.

## [2026.05.30.2]
### Added
- **Auction page-map (supply-based):** each Auction GL/Overrun page now shows the
  real in-game auction pages computed from the **item pool** — a top ruler
  ("วันนี้รวม N ชิ้น = M หน้า" + page span per item type) and a "📄 หน้า X–Y" chip on
  each column. Per-person page badges are re-anchored to the pool, so a dragged
  person's page matches the real auction even when other columns aren't filled.
  Page numbers depend on item counts only (rate-independent). GL is one continuous
  run (sub continues main's partial page); Overrun is independent per item type.
- **SDLC hardening (Phase 1):** versioned Firebase security rules
  (`database.rules.json` + `docs/firebase-rules-audit.md`), GitHub Actions CI running the
  test suite on push/PR, this changelog, a `RUNBOOK.md`, and a version stamp in the app
  footer.
- **Auction Request — event-day lock:** the ขอประมูล page now opens only on the current
  event day (อังคาร/พฤหัส = GL, อาทิตย์ = Overrun) and only for that day's event; no
  requesting a future event in advance.
- **Editable per-person rates:** admins can set จำนวนของที่ได้รับต่อคน per item for both
  GL and Overrun auctions (synced; feeds the auction-page chain numbering).
- **Test suite + QA tooling:** dependency-free Node test harness (`test/`,
  `node test/run.js`), `/woe-qa` pre-deploy skill, and `woe-qa-reviewer` agent.

### Notes
- Firebase rules in this release must be **deployed manually** (console paste or
  `firebase deploy --only database`) — see `docs/firebase-rules-audit.md`. The new
  `rates` write requires these rules (or equivalent) to be live.
