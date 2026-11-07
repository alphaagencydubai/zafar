// The Zafar Account (idea 34), run like a charge card: signed bills, one statement
// a month, settled in person with the member's host. Never online.
import { esc, fa, n, m, T, pct, date, dateY, dshort, time, dt, ago, until, sum, kpi, delta, card, pill, empty, btn, meter, avatar, table, lines, hbars, vbars, startOfDay, DAY, csv } from "./kit.js";
import { $, db, guest, member, staff, honorFa, TIER, CAT, METHOD, balance, commit, drawer, modal, toast, opt, field, money } from "./ui.js";
import { mark } from "../brand.js";
import { TIERS, SITUATIONS, CAT_SIT, allows } from "../cards.js";

// what the card allows for a charge: null when fine, otherwise the reason (Persian, for the host)
const noteFa = (v) => (v && typeof v === "object" ? v.fa : "");
export function chargeRule(x, cat, amount, by) {
  const R = TIERS[x.tier], sit = SITUATIONS.find((s) => s.id === CAT_SIT[cat]);
  if (sit && !allows(x.tier, sit.id)) return `«${sit.t.fa}» روی کارت ${TIER[x.tier]} نمی‌نشیند؛ پرداخت حضوری بگیرید`;
  if (R.perCharge && amount > R.perCharge) return `سقف هر امضا برای کارت ${TIER[x.tier]} ${m(R.perCharge)} تومان است`;
  if (x.tier === "teal" && cat === "gift" && amount > 20e6) return "هدیه روی کارت فیروزه تا ۲۰ میلیون تومان است";
  if (x.tier === "gold" && cat === "event" && amount > 250e6) return "مراسم روی کارت طلایی تا ۸۰ مهمان و سقف هر امضاست";
  const s = x.supp.find((c) => c.name === by);
  if (s) { const b = balance(x.id); const used = sum(b.cur.filter((t) => t.by === s.name), (t) => t.amount); if (used + amount > s.limit) return `سقف کارت همراه ${s.name} ${m(s.limit)} تومان است (مصرف این دوره: ${m(used)})`; }
  return null;
}
export function ruleHint(x, cat) {
  const R = TIERS[x.tier], sit = SITUATIONS.find((s) => s.id === CAT_SIT[cat]); const v = sit ? sit.v[x.tier] : true;
  const a = v === false ? `<b class="neg">روی این کارت نیست</b>` : `<b class="pos">روی کارت می‌نشیند${noteFa(v) ? ` · ${noteFa(v)}` : ""}</b>`;
  return `کارت ${TIER[x.tier]}: ${a} · سقف هر امضا ${R.perCharge ? m(R.perCharge) + " تومان" : "ندارد"} · سقف حساب ${R.limit ? m(R.limit) + " تومان" : "ندارد"}`;
}

const status = (x, b) => { const over = Date.now() > b.due && b.bal > 0; const near = x.limit && b.bal / x.limit > 0.8; return over ? pill("سررسید گذشته", "red") : near ? pill("نزدیک سقف", "gold") : x.card.status === "frozen" ? pill("مسدود", "red") : pill("خوب", "green"); };

function accounts(el, arg) {
  const d = db();
  const rows = d.members.map((x) => ({ x, g: guest(x.guestId), b: balance(x.id) }));
  const tot = sum(rows, (r) => r.b.bal), over = rows.filter((r) => Date.now() > r.b.due && r.b.bal > 0);
  const m30 = d.tx.filter((t) => t.kind === "charge" && t.ts > Date.now() - 30 * DAY);
  el.innerHTML = `<div class="kpis">${kpi("مانده‌ی همه‌ی حساب‌ها", T(tot), `${fa(rows.length)} حساب`)}${kpi("امضاهای ۳۰ روز", T(sum(m30, (t) => t.amount)), `${fa(m30.length)} صورت‌حساب امضا شده`)}${kpi("سررسید گذشته", fa(over.length), T(sum(over, (r) => r.b.bal)), "", over.length ? "hot" : "")}${kpi("تسویه‌های ۳۰ روز", T(sum(d.tx.filter((t) => t.kind === "settle" && t.ts > Date.now() - 30 * DAY), (t) => t.amount)), "همه حضوری")}</div>
  ${card("حساب‌های ظفر", table(["عضو", "سطح", { l: "مانده‌ی دوره" }, "سقف و مصرف", "دوره از", "تسویه با میزبان", "آخرین تسویه", "وضعیت", ""], rows.map(({ x, g, b }) => [`<a class="who" href="#/accounts/${x.id}">${avatar(g.name, "gold")}<span><b>${esc(honorFa(g))}</b><small class="lat">${x.id}</small></span></a>`, pill(TIER[x.tier], "tier-" + x.tier), { v: T(b.bal), s: b.bal }, x.limit ? `${T(x.limit)}<br>${meter(b.bal / x.limit, b.bal / x.limit > 0.8 ? "red" : "")}` : "بدون سقف از پیش تعیین‌شده", date(b.start), `${date(b.due)}<br><small>${esc(staff(x.host).name)}</small>`, b.last ? `${T(b.last.amount)}<br><small>${METHOD[b.last.method]} · ${dshort(b.last.ts)}</small>` : "—", status(x, b), `<div class="row">${btn("امضا", `data-post="${x.id}"`, "sm")}${btn("تسویه", `data-settle="${x.id}"`, "sm gold")}</div>`])), { extra: `<a class="lnk" href="#/post">ثبت امضا و تسویه ›</a>` })}`;
  el.onclick = (e) => { const p = e.target.closest("[data-post]"); if (p) postCharge(p.dataset.post); const s = e.target.closest("[data-settle]"); if (s) settle(s.dataset.settle); };
  if (arg) accDrawer(arg);
}
function accDrawer(id) {
  const x = member(id), g = guest(x.guestId), b = balance(id);
  const byCat = Object.keys(CAT).filter((k) => k !== "settle").map((k) => ({ l: CAT[k], v: sum(b.tx.filter((t) => t.kind === "charge" && t.cat === k && t.ts > Date.now() - 120 * DAY), (t) => t.amount) })).filter((i) => i.v);
  drawer(`<div class="dw-h">${avatar(g.name, "gold big")}<div><h2>حساب ${esc(honorFa(g))}</h2><p class="lat">${x.id} · ${x.card.uid}</p><div class="row">${pill(TIER[x.tier], "tier-" + x.tier)}${status(x, b)}</div></div><button class="x" data-dclose>×</button></div>
  <div class="kpis sm">${kpi("مانده‌ی دوره", T(b.bal))}${kpi("سقف", x.limit ? T(x.limit) : "بدون سقف")}${kpi("در دسترس", x.limit ? T(Math.max(0, x.limit - b.bal)) : "—")}${kpi("تسویه", date(b.due))}</div>
  <div class="row">${btn("ثبت امضا", `data-post="${id}"`)}${btn("تسویه‌ی حضوری", `data-settle="${id}"`, "gold")}${btn("صورت‌حساب", `data-stmt="${id}"`)}${btn(x.card.status === "frozen" ? "رفع انسداد" : "انسداد کارت", `data-freeze="${id}"`)}${btn("+ کارت همراه", `data-supp="${id}"`)}</div>
  <div class="dw-sec"><h4>۴ ماه اخیر به تفکیک خدمت</h4>${hbars(byCat, { unit: " تومان" })}</div>
  <div class="dw-sec"><h4>کارت‌های همراه</h4>${x.supp.length ? `<ul class="list sm">${x.supp.map((s, i) => `<li><div><b>${esc(s.name)}</b><small>${esc(s.rel)} · سقف ${T(s.limit)}</small></div>${btn("حذف", `data-rmsupp="${id}" data-i="${i}"`, "sm")}</li>`).join("")}</ul>` : empty("—")}</div>
  <div class="dw-sec"><h4>دفتر حساب</h4>${table(["تاریخ", "شرح", "امضا / روش", "مبلغ"], b.tx.slice(0, 40).map((t) => [{ v: dshort(t.ts), s: t.ts }, `${t.kind === "settle" ? "<b>تسویه‌ی حضوری</b>" : CAT[t.cat]}<br><small>${esc(t.note)}</small>`, t.kind === "settle" ? `${METHOD[t.method]} · ${esc(staff(t.by)?.name || "")}` : esc(t.by === x.id ? "عضو" : t.by), { v: `<span class="${t.kind === "settle" ? "pos" : ""}">${t.kind === "settle" ? "−" : ""}${T(t.amount)}</span>`, s: t.amount }]), { cls: "compact" })}</div>`, { wide: true });
}
document.addEventListener("click", (e) => {
  const fr = e.target.closest("[data-freeze]"); if (fr) { const x = member(fr.dataset.freeze); x.card.status = x.card.status === "frozen" ? "active" : "frozen"; commit("M-1", `کارت ${guest(x.guestId).name}: ${x.card.status === "frozen" ? "مسدود" : "فعال"}`); accDrawer(x.id); }
  const sp = e.target.closest("[data-supp]"); if (sp) { const x = member(sp.dataset.supp); modal("کارت همراه", `${field("نام", `<input name="n">`)}<div class="ff2">${field("نسبت", `<input name="r" value="همسر">`)}${field("سقف (تومان)", `<input name="l" dir="ltr" value="80000000">`)}</div>`, { ok: "صدور", onOk: (f) => { if (!f.n.value) return false; x.supp.push({ name: f.n.value, rel: f.r.value, limit: money(f.l.value) }); commit("M-1", `کارت همراه برای ${f.n.value}`); accDrawer(x.id); } }); }
  const rs = e.target.closest("[data-rmsupp]"); if (rs) { const x = member(rs.dataset.rmsupp); x.supp.splice(+rs.dataset.i, 1); commit("M-1", "کارت همراه باطل شد"); accDrawer(x.id); }
  const st = e.target.closest("[data-stmt]"); if (st) statementPrint([st.dataset.stmt]);
  const p = e.target.closest(".drawer [data-post]"); if (p) postCharge(p.dataset.post);
  const s = e.target.closest(".drawer [data-settle]"); if (s) settle(s.dataset.settle);
});

export function postCharge(mid, pre = {}) {
  const d = db();
  modal("ثبت امضا سر میز", `${field("حساب", `<select name="m">${opt(d.members.map((x) => [x.id, `${honorFa(guest(x.guestId))} · ${x.id}`]), mid)}</select>`)}<div class="ff2">${field("خدمت", `<select name="c">${opt(Object.entries(CAT).filter(([k]) => k !== "settle"), pre.cat || "dining")}</select>`)}${field("مبلغ (تومان)", `<input name="a" dir="ltr" inputmode="numeric" value="${pre.amount || ""}" required>`)}</div>${field("شرح", `<input name="n" value="${esc(pre.note || "شام · سالن آینه")}">`)}${field("امضاکننده", `<select name="by" data-byfor></select>`)}`, {
    ok: "ثبت امضا", onOk: (f) => { const a = money(f.a.value); if (!a) return false; const x = member(f.m.value), b = balance(x.id); if (x.limit && b.bal + a > x.limit) { toast("بیش از سقف حساب است؛ با مدیر هماهنگ کنید"); return false; } if (x.card.status === "frozen") { toast("کارت مسدود است"); return false; } const why = chargeRule(x, f.c.value, a, f.by.value); if (why) { toast(why); const h = document.querySelector("#rulehint"); if (h) { h.classList.add("bad"); h.innerHTML = why; } return false; } d.tx.unshift({ id: `T-${d.tx.length + 1}`, memberId: x.id, ts: Date.now(), kind: "charge", cat: f.c.value, amount: a, note: f.n.value, by: f.by.value }); commit("M-1", `امضای ${m(a)} تومان برای ${guest(x.guestId).name}`); toast("امضا ثبت شد؛ روی صفحه‌ی NFC عضو هم آمد"); },
  });
  const fm = document.querySelector("#modal form"); fm.insertAdjacentHTML("beforeend", `<p class="hint" id="rulehint"></p>`); const hint = () => { const h = fm.querySelector("#rulehint"); h.classList.remove("bad"); h.innerHTML = ruleHint(member(fm.m.value), fm.c.value); }; const fill = () => { const x = member(fm.m.value); fm.by.innerHTML = opt([[x.id, "خود عضو"], ...x.supp.map((s) => [s.name, `${s.name} (کارت همراه)`])]); hint(); }; fm.m.onchange = fill; fm.c.onchange = hint; fill();
}
export function settle(mid) {
  const x = member(mid), b = balance(mid), g = guest(x.guestId);
  modal(`تسویه‌ی حضوری · ${esc(honorFa(g))}`, `<p class="muted">مانده‌ی دوره: <b>${T(b.bal)}</b> · ${fa(b.cur.length)} امضا از ${date(b.start)}</p><div class="ff2">${field("مبلغ (تومان)", `<input name="a" dir="ltr" value="${b.bal}">`)}${field("روش", `<select name="me">${opt(Object.entries(METHOD))}</select>`)}</div>${field("میزبان", `<select name="h">${opt(db().staff.filter((s) => s.role === "host" || s.role === "manager").map((s) => [s.id, s.name]), x.host)}</select>`)}<p class="hint">ظفر هیچ پرداخت آنلاینی نمی‌گیرد؛ این تسویه رودررو با میزبان انجام می‌شود.</p>`, {
    ok: "ثبت تسویه", onOk: (f) => { const a = money(f.a.value); if (!a) return false; db().tx.unshift({ id: `T-${db().tx.length + 1}`, memberId: x.id, ts: Date.now(), kind: "settle", cat: "settle", amount: a, note: "تسویه‌ی حضوری با میزبان", method: f.me.value, by: f.h.value }); commit(f.h.value, `تسویه‌ی ${m(a)} تومان · ${g.name}`); toast("تسویه ثبت شد؛ دوره‌ی تازه آغاز شد"); },
  });
}

function rulesTable() {
  const mk = (v) => (v === true ? `<span class="pos">✓</span>` : v === false ? `<span class="muted">—</span>` : `<span class="pos">✓</span> <small>${esc(v.fa)}</small>`);
  const R = (k, f) => ["teal", "gold", "noir"].map((t) => f(TIERS[t]));
  return `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>کاربرد</th><th>فیروزه</th><th>طلایی</th><th>نوآر</th></tr></thead><tbody>
    ${SITUATIONS.map((s) => `<tr><td>${esc(s.t.fa)}</td>${["teal", "gold", "noir"].map((t) => `<td>${mk(s.v[t])}</td>`).join("")}</tr>`).join("")}
    <tr><td><b>سقف حساب</b></td>${R("l", (x) => `<td>${x.limit ? T(x.limit) : "بدون سقف"}</td>`).join("")}</tr>
    <tr><td><b>سقف هر امضا</b></td>${R("p", (x) => `<td>${x.perCharge ? T(x.perCharge) : "بدون سقف"}</td>`).join("")}</tr>
    <tr><td><b>کارت همراه</b></td>${R("c", (x) => `<td>${x.companions == null ? "بدون سقف" : fa(x.companions)}</td>`).join("")}</tr>
  </tbody></table></div>`;
}
function post(el) {
  const d = db(); const recent = d.tx.slice(0, 30);
  el.innerHTML = `<div class="grid g-2">
    ${card("امضا سر میز", `<p class="muted">مهمان به‌جای پرداخت، صورت‌حساب را امضا می‌کند. مبلغ روی حساب ظفر و صفحه‌ی NFC او می‌نشیند.</p><div class="row">${btn("ثبت امضا", 'data-post-new="1"', "gold")}</div>`)}
    ${card("تسویه‌ی ماهانه", `<p class="muted">در پایان هر دوره، میزبان شخصی عضو مانده را رودررو (نقد، کارتخوان یا حواله) تسویه می‌کند.</p><div class="row">${btn("ثبت تسویه", 'data-settle-new="1"', "gold")}</div>`)}
  </div>
  ${card("قواعد کارت‌ها · کاربرد هر کارت", rulesTable(), { extra: `<span class="muted">ثبت امضا این قواعد را خودکار کنترل می‌کند</span>` })}
  ${card("آخرین ثبت‌ها", table(["زمان", "عضو", "نوع", "شرح", "مبلغ"], recent.map((t) => { const g = guest(member(t.memberId).guestId); return [{ v: dt(t.ts), s: t.ts }, `<a href="#/accounts/${t.memberId}">${esc(honorFa(g))}</a>`, t.kind === "settle" ? pill("تسویه · " + METHOD[t.method], "green") : pill(CAT[t.cat], "mute"), esc(t.note), { v: T(t.amount), s: t.amount }]; })))}`;
  el.onclick = (e) => { if (e.target.closest("[data-post-new]")) postCharge(d.members[0].id); if (e.target.closest("[data-settle-new]")) modal("تسویه", field("حساب", `<select name="m">${opt(d.members.map((x) => [x.id, `${honorFa(guest(x.guestId))} · ${m(balance(x.id).bal)}`]))}</select>`), { ok: "ادامه", onOk: (f) => setTimeout(() => settle(f.m.value), 320) }); };
}

// statements — printed on Zafar letterhead, sealed, hand-delivered
function statementHTML(mid) {
  const x = member(mid), g = guest(x.guestId), b = balance(mid), h = staff(x.host);
  return `<article class="stmt-p"><header>${mark()}<div><b>ZAFAR</b><small>صورت‌حساب حساب ظفر</small></div><span>${dateY(Date.now())}</span></header>
  <div class="sp-to"><div><small>به حضور</small><b>${esc(honorFa(g))}</b><small class="lat">${x.id} · ${TIER[x.tier]}</small></div><div><small>دوره</small><b>${date(b.start)} تا ${date(Date.now())}</b><small>تسویه‌ی حضوری با ${esc(h.name)} · ${date(b.due)}</small></div></div>
  <table><thead><tr><th>تاریخ</th><th>شرح</th><th>امضا</th><th>مبلغ (تومان)</th></tr></thead><tbody>${b.cur.map((t) => `<tr><td>${dshort(t.ts)}</td><td>${CAT[t.cat]} · ${esc(t.note)}</td><td>${esc(t.by === x.id ? "عضو" : t.by)}</td><td>${n(t.amount)}</td></tr>`).join("") || `<tr><td colspan="4">امضایی در این دوره نیست.</td></tr>`}</tbody><tfoot><tr><td colspan="3">جمع دوره</td><td>${n(b.bal)}</td></tr></tfoot></table>
  <footer><p>این صورت‌حساب در پاکت مهر و موم شده به دست شما می‌رسد. ظفر هیچ پرداخت آنلاینی دریافت نمی‌کند؛ تسویه رودررو با میزبان شخصی شما انجام می‌شود.</p><div class="sp-seal">${mark()}</div></footer></article>`;
}
export function statementPrint(ids) {
  const w = window.open("", "_blank");
  w.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>صورت‌حساب ظفر</title><link rel="stylesheet" href="css/admin.css"></head><body class="print-body">${ids.map(statementHTML).join('<div class="pb"></div>')}<script>setTimeout(()=>print(),600)<\/script></body></html>`);
  w.document.close();
}
function statements(el) {
  const d = db();
  el.innerHTML = `<div class="bar-row"><span class="muted">هر عضو در پایان دوره یک صورت‌حساب ریز روی سربرگ ظفر می‌گیرد که در پاکت مهر و موم شده تحویل داده می‌شود.</span>${btn("چاپ همه", 'data-all="1"', "gold")}</div>
  <div class="stmt-grid">${d.members.map((x) => `<div class="stmt-card">${statementHTML(x.id)}<div class="row">${btn("چاپ", `data-stmt="${x.id}"`)}</div></div>`).join("")}</div>`;
  el.onclick = (e) => { if (e.target.closest("[data-all]")) statementPrint(d.members.map((x) => x.id)); };
}

function ar(el) {
  const d = db(), now = Date.now();
  const rows = d.members.map((x) => ({ x, g: guest(x.guestId), b: balance(x.id) })).filter((r) => r.b.bal > 0);
  const age = (r) => Math.floor((now - r.b.start) / DAY);
  const buckets = [["دوره‌ی جاری (۰ تا ۳۴ روز)", (a) => a <= 34], ["۳۵ تا ۴۵ روز", (a) => a > 34 && a <= 45], ["۴۶ تا ۶۰ روز", (a) => a > 45 && a <= 60], ["بیش از ۶۰ روز", (a) => a > 60]];
  el.innerHTML = `<div class="kpis">${buckets.map(([l, f]) => kpi(l, T(sum(rows.filter((r) => f(age(r))), (r) => r.b.bal)), `${fa(rows.filter((r) => f(age(r))).length)} حساب`)).join("")}</div>
  ${card("مطالبات به تفکیک سن", table(["عضو", "میزبان", { l: "مانده" }, { l: "روز از آغاز دوره" }, "سررسید", ""], rows.sort((a, b) => age(b) - age(a)).map((r) => [`<a class="who" href="#/accounts/${r.x.id}">${avatar(r.g.name, "gold")}<span><b>${esc(honorFa(r.g))}</b><small class="lat">${r.x.id}</small></span></a>`, esc(staff(r.x.host).name), { v: T(r.b.bal), s: r.b.bal }, { v: fa(age(r)), s: age(r) }, `${date(r.b.due)} · ${until(r.b.due)}`, `<div class="row">${btn("یادآوری به میزبان", `data-remind="${r.x.id}"`, "sm")}${btn("تسویه", `data-settle="${r.x.id}"`, "sm gold")}</div>`])))}`;
  el.onclick = (e) => { const rm = e.target.closest("[data-remind]"); if (rm) { const x = member(rm.dataset.remind); commit("M-1", `یادآوری تسویه به ${staff(x.host).name} برای ${guest(x.guestId).name}`); toast(`به ${staff(x.host).name} یادآوری شد`); } const s = e.target.closest("[data-settle]"); if (s) settle(s.dataset.settle); };
}

export const SECTIONS = [
  { id: "accounts", g: "حساب ظفر", t: "حساب‌ها", ico: "acc", r: accounts },
  { id: "post", g: "حساب ظفر", t: "امضا و تسویه", ico: "pen", r: post },
  { id: "statements", g: "حساب ظفر", t: "صورت‌حساب‌ها", ico: "doc", r: statements },
  { id: "ar", g: "حساب ظفر", t: "مطالبات", ico: "clock", r: ar, badge: () => db().members.filter((x) => { const b = balance(x.id); return Date.now() > b.due && b.bal > 0; }).length },
];
