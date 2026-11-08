// Overview + guests: dashboard, tonight (welcome by name), letters, guest files, Etebar, occasions.
import { esc, fa, n, m, T, pct, d1, date, dateY, dshort, wday, time, dt, ago, until, sum, kpi, delta, card, pill, empty, btn, meter, avatar, table, lines, hbars, donut, vbars, startOfDay, DAY } from "./kit.js";
import { $, $$, db, guest, member, staff, memberOf, honorFa, TIER, TYPE, STATUS, LBL, lbl, OCC, balance, commit, drawer, closeDrawer, modal, toast, opt, field, ROLES } from "./ui.js";
import { MENU } from "../menu.js";

const hosts = () => db().staff.filter((s) => s.role === "host");
const statusPill = (s) => pill(STATUS[s][0], STATUS[s][1]);
const tierPill = (t) => pill(TIER[t], "tier-" + t);
export function alerts() {
  const d = db(), now = Date.now(), sla = (d.settings.callSla || 4) * 36e5, out = [];
  d.requests.filter((r) => r.status === "new" && now - r.ts > sla).forEach((r) => out.push({ k: "red", t: `نامه‌ی ${r.name} بیش از ${fa(d.settings.callSla || 4)} ساعت بی‌پاسخ مانده`, go: `inbox/${r.id}` }));
  d.members.forEach((x) => { if (!x.limit) return; const b = balance(x.id).bal; if (b / x.limit > 0.8) out.push({ k: "gold", t: `${guest(x.guestId).name} به ${pct((b / x.limit) * 100)} سقف حساب رسیده`, go: `accounts/${x.id}` }); });
  d.occasions.filter((o) => o.call !== "done" && o.date - 7 * DAY < now + DAY && o.date > now - DAY).forEach((o) => out.push({ k: "blue", t: `امروز با ${guest(o.guestId)?.name || "مهمان"} برای ${OCC[o.type]} تماس بگیرید`, go: "occasions" }));
  d.members.forEach((x) => { const yrs = Math.max(1, Math.ceil((now - x.since) / (365 * DAY))); const a = x.since + yrs * 365 * DAY; if (a - now < 10 * DAY && !(x.gift && x.gift.y === yrs)) out.push({ k: "gold", t: `سالروز عضویت ${guest(x.guestId).name} ${until(a)}؛ هدیه آماده نیست`, go: "occasions" }); });
  return out;
}

// ———————————————————————— dashboard
function dash(el) {
  const d = db(), now = Date.now(), T0 = startOfDay();
  const days = d.days, today = days[days.length - 1], last30 = days.slice(-30), prev30 = days.slice(-60, -30);
  const rev = (x) => x.dining + x.home + x.events + x.chauffeur + x.gifts;
  const r30 = sum(last30, rev), p30 = sum(prev30, rev);
  const ar = sum(d.members, (x) => balance(x.id).bal);
  const newL = d.requests.filter((r) => r.status === "new");
  const ton = d.tonight;
  const trips = d.trips.filter((t) => t.ts >= T0 && t.ts < T0 + DAY);
  const al = alerts();
  const mix = [["پذیرایی سالن", sum(last30, (x) => x.dining), "var(--gold)"], ["سرو در منزل", sum(last30, (x) => x.home), "#5E98A6"], ["مراسم و اجاره", sum(last30, (x) => x.events), "#9EDBBE"], ["راننده", sum(last30, (x) => x.chauffeur), "#E2B39A"], ["هدیه‌ها", sum(last30, (x) => x.gifts), "#B9A3D9"]];
  el.innerHTML = `
  <div class="kpis">
    ${kpi("درآمد امروز", T(rev(today)), `${n(today.covers)} مهمان`, delta(rev(today), rev(days[days.length - 8])))}
    ${kpi("درآمد ۳۰ روز", T(r30), "همه‌ی خطوط خدمت", delta(r30, p30))}
    ${kpi("نامه‌های تازه", fa(newL.length), `${fa(newL.filter((r) => now - r.ts > (d.settings.callSla || 4) * 36e5).length)} نفر منتظر بیش از حد`, "", newL.length ? "hot" : "")}
    ${kpi("مهمانان امشب", fa(ton.length), `${fa(sum(ton, (x) => x.party))} نفر · ${fa(ton.filter((x) => x.status === "arrived" || x.status === "seated").length)} رسیده‌اند`)}
    ${kpi("حساب ظفر · مانده", T(ar), `${fa(d.members.length)} عضو اعتبار ظفر`)}
    ${kpi("سفرهای امروز", fa(trips.length), `${fa(trips.filter((t) => t.status === "onboard").length)} در راه`)}
  </div>
  <div class="grid g-2-1">
    ${card("درآمد ۳۰ روز اخیر", lines([{ vals: last30.map(rev), label: "این دوره" }, { vals: prev30.map(rev), label: "دوره‌ی قبل", cls: "dim" }], last30.map((x) => dshort(x.ts))), { extra: `<a class="lnk" href="#/sales">فروش و درآمد ›</a>` })}
    ${card("سهم خطوط خدمت", donut(mix.map(([l, v, c]) => ({ l, v, c })), { label: m(r30), sub: "تومان در ۳۰ روز" }))}
  </div>
  <div class="grid g-3">
    ${card("نامه‌های تازه", newL.length ? `<ul class="list">${newL.slice(0, 6).map((r) => `<li><a href="#/inbox/${r.id}">${avatar(r.name)}<div><b>${esc(honorFa(r))}</b><small>${esc(TYPE[r.type])} · ${ago(r.ts)}</small></div>${statusPill(r.status)}</a></li>`).join("")}</ul>` : empty("همه‌ی نامه‌ها پاسخ گرفته‌اند."), { extra: `<a class="lnk" href="#/inbox">همه ›</a>` })}
    ${card("هشدارها", al.length ? `<ul class="alerts">${al.slice(0, 7).map((a) => `<li class="${a.k}"><a href="#/${a.go}">${esc(a.t)}</a></li>`).join("")}</ul>` : empty("هشداری نیست."), { extra: pill(fa(al.length), al.length ? "red" : "mute") })}
    ${card("امشب در ظفر", `<ul class="list">${ton.slice(0, 6).map((a) => { const g = guest(a.guestId); return `<li><a href="#/tonight">${avatar(g.name, g.memberId ? "gold" : "")}<div><b>${esc(honorFa(g))}</b><small>${time(a.ts)} · ${fa(a.party)} نفر · ${esc(a.table)}</small></div>${a.occasion ? pill(esc(a.occasion), "gold") : ""}</a></li>`; }).join("")}</ul>`, { extra: `<a class="lnk" href="#/tonight">نمای در ›</a>` })}
  </div>`;
}

// ———————————————————————— tonight: the door host greets every guest by name (idea 7)
const AST = { expected: ["در راه", "mute"], arrived: ["رسید · خوشامد گفته شد", "gold"], seated: ["سر میز", "green"], left: ["رفت", "mute"] };
function tonight(el) {
  const d = db(); const door = el.dataset.door === "1";
  const list = [...d.tonight].sort((a, b) => a.ts - b.ts);
  el.innerHTML = `<div class="bar-row"><div class="seg-a">${btn("فهرست", `data-door="0" aria-pressed="${!door}"`)}${btn("نمای در ورودی", `data-door="1" aria-pressed="${door}"`)}</div><span class="muted">${fa(list.length)} میهمانی · ${fa(sum(list, (x) => x.party))} نفر · میزبان دم در هر مهمان را با نام خوشامد می‌گوید</span>${btn("+ مهمان امشب", 'data-act="add-tonight"', "gold")}</div>
  ${door ? `<div class="door">${list.filter((a) => a.status === "expected" || a.status === "arrived").map((a) => { const g = guest(a.guestId), mm = memberOf(g); return `<article class="door-c ${a.status}"><small>${time(a.ts)} · ${esc(a.table)} · ${fa(a.party)} نفر</small><h2>خوش آمدید، ${esc(honorFa(g))}</h2>${mm ? `<p>${tierPill(mm.tier)} عضو اعتبار ظفر · میزبان: ${esc(staff(mm.host).name)}</p>` : ""}<ul>${g.prefs.tea ? `<li>نوشیدنی همیشگی: ${esc(g.prefs.tea)}</li>` : ""}${a.note ? `<li class="warn">${esc(a.note)}</li>` : ""}${a.occasion ? `<li class="gold">امشب: ${esc(a.occasion)}</li>` : ""}${g.family.length ? `<li>همراه: ${esc(g.family.map((f) => f.name).join("، "))}</li>` : ""}</ul><div class="row">${a.status === "expected" ? btn("رسید", `data-ast="arrived" data-id="${a.id}"`, "gold") : btn("سر میز نشست", `data-ast="seated" data-id="${a.id}"`, "gold")}</div></article>`; }).join("") || empty("همه‌ی مهمانان امشب رسیده‌اند.")}</div>`
  : card("فهرست امشب", table(["ساعت", "مهمان", "نفر", "میز", "یادداشت", "وضعیت", ""], list.map((a) => { const g = guest(a.guestId), mm = memberOf(g); return [{ v: time(a.ts), s: a.ts }, `<a class="who" href="#/guests/${g.id}">${avatar(g.name, mm ? "gold" : "")}<span><b>${esc(honorFa(g))}</b><small>${mm ? TIER[mm.tier] + " · " : ""}${esc(g.prefs.tea || "")}</small></span></a>`, fa(a.party), esc(a.table), `${a.occasion ? pill(esc(a.occasion), "gold") : ""} ${esc(a.note)}`, pill(AST[a.status][0], AST[a.status][1]), `<div class="row">${["arrived", "seated", "left"].map((s) => btn(AST[s][0].split(" ·")[0], `data-ast="${s}" data-id="${a.id}"`, a.status === s ? "on" : "sm")).join("")}</div>`]; })))}`;
  el.onclick = (e) => {
    const b = e.target.closest("button[data-door]"); if (b) { el.dataset.door = b.dataset.door; tonight(el); return; }
    const s = e.target.closest("[data-ast]"); if (s) { const a = db().tonight.find((x) => x.id === s.dataset.id); a.status = s.dataset.ast; if (s.dataset.ast === "arrived") a.arrived = Date.now(); const g = guest(a.guestId); if (s.dataset.ast === "seated") { g.visits++; g.last = Date.now(); } commit("H-1", `${honorFa(g)}: ${AST[a.status][0]}`); toast(`${honorFa(g)} · ${AST[a.status][0]}`); return; }
    if (e.target.closest('[data-act="add-tonight"]')) addTonight();
  };
}
function addTonight(pre = {}) {
  const d = db();
  modal("مهمان امشب", `${field("مهمان", `<select name="g">${opt(d.guests.map((g) => [g.id, `${honorFa(g)} · ${g.phone}`]), pre.guestId)}</select>`)}<div class="ff2">${field("ساعت", `<input name="t" type="time" value="${pre.time || "20:30"}">`)}${field("نفر", `<input name="p" type="number" min="1" value="${pre.party || 2}">`)}</div>${field("میز", `<select name="tb">${opt(["سالن آینه ۱", "سالن آینه ۲", "سالن آینه ۳", "کنار پنجره ۴", "کنار پنجره ۵", "میز گرد ۶", "میز گرد ۷", "سالن خصوصی فیروزه", "سالن خصوصی طلایی", "تراس ۸", "کنار پیانو ۱۰"].map((x) => [x, x]))}</select>`)}${field("مناسبت", `<input name="o" value="${esc(pre.occasion || "")}">`)}`, {
    onOk: (f) => { const [h, mi] = f.t.value.split(":").map(Number); const ts = startOfDay() + (h * 60 + mi) * 6e4; const g = guest(f.g.value); d.tonight.push({ id: `A-${d.tonight.length + 1}`, guestId: g.id, ts, party: +f.p.value, table: f.tb.value, status: "expected", note: g.prefs.allergy || "", occasion: f.o.value }); commit("H-1", `${honorFa(g)} برای امشب دعوت شد`); toast("به فهرست امشب اضافه شد"); },
  });
}

// ———————————————————————— letters (idea 5)
function inbox(el, arg) {
  const d = db(); const f = el._f || (el._f = { st: "open", type: "", q: "" });
  const list = d.requests.filter((r) => (f.st === "open" ? ["new", "called"].includes(r.status) : f.st === "all" ? true : r.status === f.st) && (!f.type || r.type === f.type) && (!f.q || `${r.name} ${r.phone} ${r.id} ${r.note}`.includes(f.q)));
  const cnt = (s) => d.requests.filter((r) => (s === "open" ? ["new", "called"].includes(r.status) : s === "all" ? 1 : r.status === s)).length;
  if (!arg && list[0] && innerWidth >= 900) arg = list[0].id;
  el.innerHTML = `<div class="bar-row"><div class="seg-a">${[["open", "باز"], ["new", "تازه"], ["called", "تماس گرفته شد"], ["confirmed", "تأیید شد"], ["done", "انجام شد"], ["declined", "ممکن نشد"], ["all", "همه"]].map(([v, l]) => btn(`${l} <small>${fa(cnt(v))}</small>`, `data-st="${v}" aria-pressed="${f.st === v}"`)).join("")}</div>
    <select class="sel" data-ftype><option value="">همه‌ی موضوع‌ها</option>${opt(Object.entries(TYPE), f.type)}</select><input class="sel" data-q placeholder="نام، شماره، کد نامه…" value="${esc(f.q)}"></div>
  <div class="inbox"><ul class="ib-list">${list.map((r) => `<li class="${arg === r.id ? "on" : ""} ${r.status === "new" ? "unread" : ""}"><a href="#/inbox/${r.id}">${avatar(r.name, r.memberId ? "gold" : "")}<div><b>${esc(honorFa(r))}</b><small>${esc(TYPE[r.type])}</small><small class="lat">${r.id} · ${ago(r.ts)}${r.lang !== "fa" ? " · " + r.lang.toUpperCase() : ""}</small></div>${statusPill(r.status)}</a></li>`).join("") || `<li>${empty("نامه‌ای نیست.")}</li>`}</ul>
  <div class="ib-read" id="ib-read">${arg ? letterView(d.requests.find((r) => r.id === arg)) : `<div class="ib-empty">${empty("یک نامه را انتخاب کنید.")}</div>`}</div></div>`;
  el.onclick = (e) => {
    const s = e.target.closest("[data-st]"); if (s) { f.st = s.dataset.st; inbox(el, arg); return; }
    const a = e.target.closest("[data-la]"); if (a) letterAct(a.dataset.la, a.dataset.id);
  };
  el.querySelector("[data-ftype]").onchange = (e) => { f.type = e.target.value; inbox(el, arg); };
  el.querySelector("[data-q]").oninput = (e) => { f.q = e.target.value.trim(); clearTimeout(el._qt); el._qt = setTimeout(() => { inbox(el, arg); const q = el.querySelector("[data-q]"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 250); };
}
function fval(k, v) {
  if (v == null || v === "") return "";
  if (k === "date") return dateY(v);
  if (Array.isArray(v)) return v.map(lbl).join("، ");
  if (v === true) return "بله";
  return esc(lbl(v));
}
const FL = { date: "تاریخ", time: "ساعت", guests: "تعداد مهمانان", address: "نشانی", occasion: "مناسبت", nights: "تعداد شب", location: "محل", dishes: "غذاها", event: "نوع مهمانی", where: "محل", ceremony: "مراسم", partner: "نام همسر آینده", wish: "آرزوها", person: "صاحب تولد", secret: "غافلگیری", company: "شرکت", langs: "زبان مهمانان", purpose: "مناسبت", recipient: "گیرنده", rphone: "شماره‌ی گیرنده", card: "متن کارت", dir: "مسیر", from: "مبدأ", to: "مقصد", pax: "سرنشین", car: "خودرو", dish: "ایده‌ی غذا", diet: "رژیم", ref: "معرف", occ: "مناسبت", whose: "برای" };
function letterView(r) {
  if (!r) return empty("نامه پیدا نشد.");
  const g = guest(r.guestId), mm = memberOf(g), d = db();
  const waited = r.status === "new" ? ago(r.ts) : "";
  return `<article class="paper">
    <div class="pp-h"><span class="lat">${r.id}</span><span>${dt(r.ts)}</span>${statusPill(r.status)}</div>
    <h2>ظفر عزیز،</h2>
    <p>من ${esc(honorFa(r))} هستم و درباره‌ی «<b>${esc(TYPE[r.type])}</b>» برایتان می‌نویسم.</p>
    <dl class="pp-f">${Object.entries(r.fields || {}).filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && !v.length)).map(([k, v]) => `<div><dt>${FL[k] || k}</dt><dd>${fval(k, v)}</dd></div>`).join("")}</dl>
    <p>لطفاً با شماره‌ی <a class="lat" href="tel:${esc(r.phone)}">${esc(fa(r.phone))}</a> تماس بگیرید؛ بهترین زمان تماس، <b>${lbl(r.callTime)}</b> است.</p>
    ${r.note ? `<blockquote>${esc(r.note)}</blockquote>` : ""}
    <p class="pp-s">ارادتمند، <span>${esc(honorFa(r))}</span></p>
    <div class="pp-meta">${r.heard ? pill("آشنایی: " + lbl(r.heard), "mute") : ""}${r.lang && r.lang !== "fa" ? pill("نوشته به " + ({ tr: "ترکی استانبولی", en: "انگلیسی" }[r.lang] || r.lang), "blue") : ""}${mm ? pill("عضو اعتبار ظفر · " + TIER[mm.tier], "tier-" + mm.tier) : ""}${g ? `<a class="pill mute" href="#/guests/${g.id}">پرونده‌ی مهمان ›</a>` : ""}${waited ? pill("منتظر از " + waited, "red") : ""}</div>
  </article>
  <div class="ib-acts">
    ${field("میزبان مسئول", `<select data-host="${r.id}">${opt([["", "—"], ...hosts().map((h) => [h.id, h.name])], r.host)}</select>`)}
    <div class="row">${r.status === "new" ? btn("تماس گرفتم", `data-la="called" data-id="${r.id}"`, "gold") : ""}${["new", "called"].includes(r.status) ? btn("تأیید", `data-la="confirm" data-id="${r.id}"`, r.status === "called" ? "gold" : "") + btn("این بار ممکن نشد", `data-la="decline" data-id="${r.id}"`) : ""}${r.status === "confirmed" ? btn("انجام شد", `data-la="done" data-id="${r.id}"`, "gold") : ""}${btn("یادداشت", `data-la="note" data-id="${r.id}"`)}<a class="b" href="tel:${esc(r.phone)}">تماس ☏</a></div>
    <h4>روند</h4><ol class="tl">${r.log.map((l) => `<li><b>${esc(l.text)}</b><small>${dt(l.ts)} · ${esc(l.by === "guest" ? "مهمان" : staff(l.by)?.name || l.by)}</small></li>`).join("")}</ol>
  </div>`;
}
function letterAct(a, id) {
  const d = db(), r = d.requests.find((x) => x.id === id), g = guest(r.guestId);
  const log = (text, by = r.host || "H-1") => r.log.push({ ts: Date.now(), by, text });
  if (a === "called") { modal("تماس با مهمان", `${field("خلاصه‌ی گفت‌وگو", `<textarea name="t" rows="3" placeholder="مثلاً: برای پنجشنبه شب، ۴ نفر، میز کنار پنجره"></textarea>`)}`, { onOk: (f) => { r.status = "called"; r.host = r.host || "H-1"; log("میزبان تماس گرفت" + (f.t.value ? ": " + f.t.value : "")); commit(r.host, `تماس با ${r.name}`); toast("ثبت شد؛ مهمان در صفحه‌ی خودش هم می‌بیند"); } }); return; }
  if (a === "confirm") {
    const isVisit = r.type === "visit", isTrip = r.type === "chauffeur";
    modal("تأیید درخواست", `<p class="muted">${esc(honorFa(r))} · ${esc(TYPE[r.type])}</p>${isVisit ? `<div class="ff2">${field("ساعت", `<input name="t" type="time" value="20:30">`)}${field("میز", `<select name="tb">${opt(["سالن آینه ۱", "سالن آینه ۲", "کنار پنجره ۴", "میز گرد ۶", "سالن خصوصی فیروزه", "سالن خصوصی طلایی", "تراس ۸"].map((x) => [x, x]))}</select>`)}</div><label class="chk"><input type="checkbox" name="tn" checked> اگر برای امشب است، به فهرست ورود امشب اضافه شود</label>` : ""}${isTrip ? field("راننده", `<select name="dr">${opt(d.staff.filter((s) => s.role === "driver").map((s) => [s.id, `${s.name} · ${s.car}`]))}</select>`) : ""}${field("پیام به مهمان", `<textarea name="t2" rows="2">با کمال میل؛ منتظرتان هستیم.</textarea>`)}`, {
      onOk: (f) => {
        r.status = "confirmed"; log("تأیید شد" + (f.t2.value ? ": " + f.t2.value : ""), "M-1");
        if (isVisit && f.tn.checked) { const [h, mi] = f.t.value.split(":").map(Number); d.tonight.push({ id: `A-${d.tonight.length + 1}`, guestId: g.id, ts: startOfDay() + (h * 60 + mi) * 6e4, party: r.fields.guests || 2, table: f.tb.value, status: "expected", note: r.note || g.prefs.allergy || "", occasion: r.fields.occasion || "" }); }
        if (isTrip) d.trips.unshift({ id: `R-${600 + d.trips.length}`, guestId: g.id, name: g.name, phone: g.phone, dir: r.fields.dir || "car.to", from: r.fields.from || "—", to: r.fields.to || "ظفر", ts: r.fields.date ? r.fields.date + 8 * 36e5 : Date.now() + 3 * 36e5, pax: r.fields.pax || 1, car: r.fields.car || "car.exec", driver: f.dr.value, status: "scheduled", fare: 3.2e6, reqId: r.id });
        commit("M-1", `تأیید ${TYPE[r.type]} برای ${r.name}`); toast("تأیید شد");
      } }); return;
  }
  if (a === "decline") { modal("این بار ممکن نشد", field("دلیل (برای پرونده؛ میزبان شخصاً توضیح می‌دهد)", `<textarea name="t" rows="3"></textarea>`), { ok: "ثبت", onOk: (f) => { r.status = "declined"; log("این بار ممکن نشد" + (f.t.value ? ": " + f.t.value : ""), "M-1"); commit("M-1", `رد محترمانه‌ی ${r.name}`); } }); return; }
  if (a === "done") { r.status = "done"; log("انجام شد"); commit(r.host, `${TYPE[r.type]} ${r.name} انجام شد`); return; }
  if (a === "note") { modal("یادداشت روی نامه", field("یادداشت", `<textarea name="t" rows="3"></textarea>`), { onOk: (f) => { if (f.t.value) { log("یادداشت: " + f.t.value); commit(r.host, "یادداشت روی نامه"); } } }); }
}
document.addEventListener("change", (e) => { const s = e.target.closest("[data-host]"); if (!s) return; const r = db().requests.find((x) => x.id === s.dataset.host); r.host = s.value; r.log.push({ ts: Date.now(), by: "M-1", text: `واگذار به ${staff(s.value)?.name}` }); commit("M-1", `نامه‌ی ${r.name} به ${staff(s.value)?.name} سپرده شد`); });

// ———————————————————————— guest files (idea 30)
const SEGS = [["all", "همه"], ["circle", "اعتبار"], ["همیشگی", "همیشگی"], ["آشنا", "آشنا"], ["تازه", "تازه"], ["خانوادگی", "خانوادگی"], ["کاری", "کاری"], ["allergy", "حساسیت غذایی"], ["quiet", "۶۰+ روز نیامده"]];
function guests(el, arg) {
  const d = db(); const f = el._f || (el._f = { seg: "all", q: "" });
  const match = (g) => (f.seg === "all" || (f.seg === "circle" ? g.memberId : f.seg === "allergy" ? g.prefs.allergy : f.seg === "quiet" ? Date.now() - (g.last || 0) > 60 * DAY : g.tags.includes(f.seg))) && (!f.q || `${g.name} ${g.nameLat} ${g.phone} ${g.id}`.toLowerCase().includes(f.q.toLowerCase()));
  const list = d.guests.filter(match);
  el.innerHTML = `<div class="bar-row"><div class="seg-a">${SEGS.map(([v, l]) => btn(l, `data-seg="${v}" aria-pressed="${f.seg === v}"`)).join("")}</div><input class="sel" data-q placeholder="جست‌وجوی نام، شماره، کد…" value="${esc(f.q)}">${btn("+ مهمان", 'data-act="new-guest"', "gold")}</div>
  ${card(`${fa(list.length)} پرونده`, table(["مهمان", "تماس", "برچسب", "میز و نوشیدنی", "حساسیت", { l: "دفعات" }, { l: "خرید ۱۲ ماه" }, "آخرین دیدار"], list.map((g) => { const mm = memberOf(g); return [`<a class="who" href="#/guests/${g.id}">${avatar(g.name, mm ? "gold" : "")}<span><b>${esc(honorFa(g))}</b><small class="lat">${g.id}${mm ? " · " + mm.id : ""}</small></span></a>`, `<span class="lat">${fa(g.phone)}</span>`, g.tags.map((t) => pill(t, t === "اعتبار" ? "gold" : "mute")).join(" "), `<small>${esc(g.prefs.table)}<br>${esc(g.prefs.tea)}</small>`, g.prefs.allergy ? pill(esc(g.prefs.allergy), "red") : "", { v: fa(g.visits), s: g.visits }, { v: T(g.spend), s: g.spend }, { v: g.last ? ago(g.last) : "—", s: g.last || 0 }]; })))}`;
  el.onclick = (e) => { const s = e.target.closest("[data-seg]"); if (s) { f.seg = s.dataset.seg; guests(el); } if (e.target.closest('[data-act="new-guest"]')) newGuest(); };
  el.querySelector("[data-q]").oninput = (e) => { f.q = e.target.value; clearTimeout(el._qt); el._qt = setTimeout(() => { guests(el); const q = el.querySelector("[data-q]"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 250); };
  if (arg) guestDrawer(arg);
}
function newGuest() {
  modal("مهمان تازه", `<div class="ff2">${field("عنوان", `<select name="ti">${opt([["m", "آقای"], ["f", "خانم"]])}</select>`)}${field("نام و نام خانوادگی", `<input name="n" required>`)}</div>${field("موبایل", `<input name="p" dir="ltr" required>`)}${field("یادداشت", `<input name="nt">`)}`, { onOk: (f) => { if (!f.n.value) return false; const d = db(); const g = { id: `G-${1000 + d.guests.length + 1}`, title: f.ti.value, name: f.n.value, nameLat: "", phone: f.p.value, tags: ["تازه"], prefs: { note: f.nt.value }, family: [], first: Date.now(), visits: 0, spend: 0, last: null, notes: "" }; d.guests.unshift(g); commit("M-1", `پرونده‌ی ${g.name} ساخته شد`); location.hash = `#/guests/${g.id}`; } });
}
export function guestDrawer(id) {
  const d = db(), g = guest(id); if (!g) return;
  const mm = memberOf(g), b = mm ? balance(mm.id) : null;
  const reqs = d.requests.filter((r) => r.guestId === g.id);
  const occ = d.occasions.filter((o) => o.guestId === g.id);
  const trips = d.trips.filter((t) => t.guestId === g.id);
  drawer(`<div class="dw-h">${avatar(g.name, mm ? "gold big" : "big")}<div><h2>${esc(honorFa(g))}</h2><p class="lat">${esc(g.nameLat || "")} · ${g.id}</p><div class="row">${g.tags.map((t) => pill(t, t === "اعتبار" ? "gold" : "mute")).join("")}${mm ? tierPill(mm.tier) : ""}</div></div><button class="x" data-dclose>×</button></div>
    <div class="kpis sm">${kpi("دفعات", fa(g.visits))}${kpi("خرید ۱۲ ماه", T(g.spend))}${kpi("میانگین هر دیدار", T(g.visits ? g.spend / g.visits : 0))}${kpi("آخرین دیدار", g.last ? ago(g.last) : "—")}</div>
    <div class="dw-sec"><h4>آنچه ظفر به خاطر دارد</h4><form class="prefs-f" data-g="${g.id}">
      ${field("میز محبوب", `<input name="table" value="${esc(g.prefs.table || "")}">`)}${field("نوشیدنی همیشگی", `<input name="tea" value="${esc(g.prefs.tea || "")}">`)}${field("حساسیت / رژیم", `<input name="allergy" value="${esc(g.prefs.allergy || "")}">`)}${field("موسیقی", `<input name="music" value="${esc(g.prefs.music || "")}">`)}${field("نکته برای میزبان", `<input name="note" value="${esc(g.prefs.note || "")}">`)}
      ${g.prefs.guestNote ? `<p class="hint">مهمان از صفحه‌ی NFC نوشته: «${esc(g.prefs.guestNote)}»</p>` : ""}
      ${field("یادداشت داخلی", `<textarea name="notes" rows="2">${esc(g.notes || "")}</textarea>`)}<button class="b gold" type="submit">ذخیره</button></form></div>
    <div class="dw-sec"><h4>تماس و خانواده</h4><dl class="dl"><div><dt>موبایل</dt><dd><a class="lat" href="tel:${g.phone}">${fa(g.phone)}</a></dd></div><div><dt>آشنایی</dt><dd>${lbl(g.heard || "") || "—"}</dd></div><div><dt>تولد</dt><dd>${g.birthday ? `${fa(g.birthday.d)} ${["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"][g.birthday.m - 1]}` : "—"}</dd></div><div><dt>همراهان</dt><dd>${g.family.map((f) => `${esc(f.name)} (${esc(f.rel)})`).join("، ") || "—"}</dd></div><div><dt>نخستین دیدار</dt><dd>${g.first ? dateY(g.first) : "—"}</dd></div></dl></div>
    ${mm ? `<div class="dw-sec"><h4>اعتبار و حساب ظفر</h4><dl class="dl"><div><dt>عضویت</dt><dd>${TIER[mm.tier]} · از ${dateY(mm.since)}</dd></div><div><dt>میزبان</dt><dd>${esc(staff(mm.host).name)}</dd></div><div><dt>مانده‌ی دوره</dt><dd>${T(b.bal)}${mm.limit ? ` از ${T(mm.limit)}` : " · بدون سقف"}</dd></div><div><dt>کارت NFC</dt><dd class="lat">${mm.card.uid} · ${fa(mm.card.taps)} لمس</dd></div></dl><div class="row"><a class="b" href="#/accounts/${mm.id}">حساب ›</a><a class="b" href="member.html?c=${mm.id}" target="_blank">صفحه‌ی NFC ↗</a></div></div>` : `<div class="dw-sec"><div class="row">${btn("دعوت به اعتبار ظفر", `data-invite="${g.id}"`, "gold")}</div></div>`}
    <div class="dw-sec"><h4>مناسبت‌ها</h4>${occ.length ? `<ul class="list sm">${occ.map((o) => `<li><div><b>${OCC[o.type]}${o.whose ? " · " + esc(o.whose) : ""}</b><small>${date(o.date)} · تماس ${until(o.date - 7 * DAY)}</small></div>${pill(o.call === "done" ? "تماس انجام شد" : o.call === "due" ? "امروز تماس" : "برنامه‌ریزی شده", o.call === "due" ? "red" : "mute")}</li>`).join("")}</ul>` : empty("—")}<div class="row">${btn("+ مناسبت", `data-addocc="${g.id}"`)}</div></div>
    <div class="dw-sec"><h4>نامه‌ها و سفرها</h4><ul class="list sm">${reqs.map((r) => `<li><a href="#/inbox/${r.id}"><div><b>${TYPE[r.type]}</b><small class="lat">${r.id} · ${ago(r.ts)}</small></div>${statusPill(r.status)}</a></li>`).join("")}${trips.map((t) => `<li><div><b>راننده · ${esc(t.from)} ← ${esc(t.to)}</b><small>${dt(t.ts)}</small></div>${pill(lbl(t.dir), "mute")}</li>`).join("")}</ul></div>`, { wide: true });
  const fm = $(".prefs-f");
  fm.onsubmit = (e) => { e.preventDefault(); Object.assign(g.prefs, { table: fm.table.value, tea: fm.tea.value, allergy: fm.allergy.value, music: fm.music.value, note: fm.note.value }); g.notes = fm.notes.value; commit("M-1", `پرونده‌ی ${g.name} به‌روز شد`); toast("ذخیره شد"); };
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-dclose]")) { closeDrawer(); if (location.hash.split("/").length > 2) history.replaceState(null, "", "#/" + location.hash.split("/")[1]); }
  const inv = e.target.closest("[data-invite]"); if (inv) inviteCircle(inv.dataset.invite);
  const ao = e.target.closest("[data-addocc]"); if (ao) addOcc(ao.dataset.addocc);
});
export function inviteCircle(gid) {
  const d = db(), g = guest(gid);
  modal(`دعوت ${esc(honorFa(g))} به اعتبار`, `<div class="ff2">${field("سطح", `<select name="t">${opt([["teal", "فیروزه"], ["gold", "طلایی"], ["noir", "نوآر"]])}</select>`)}${field("میزبان شخصی", `<select name="h">${opt(hosts().map((h) => [h.id, h.name]))}</select>`)}</div>${field("سقف حساب (تومان)", `<input name="l" dir="ltr" value="300000000">`)}<p class="hint">کارت فلزی NFC صادر می‌شود و نشانی صفحه‌ی خصوصی روی تراشه نوشته می‌شود.</p>`, {
    ok: "صدور کارت", onOk: (f) => {
      const id = `ZC-${1001 + d.members.length}`;
      const uid = "04:" + Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()).join(":");
      d.members.push({ id, guestId: g.id, tier: f.t.value, since: Date.now(), host: f.h.value, card: { uid, issued: Date.now(), status: "active", taps: 0 }, limit: f.t.value === "noir" ? null : +f.l.value || 3e8, supp: [] });
      g.memberId = id; g.tags.unshift("اعتبار"); commit("M-1", `${g.name} عضو اعتبار ظفر شد (${TIER[f.t.value]})`); writeCard(id);
    } });
}
export function writeCard(id) {
  const mm = member(id), g = guest(mm.guestId), url = `${location.origin}${location.pathname.replace(/admin\.html$/, "")}member.html?c=${id}`;
  modal("نوشتن روی کارت NFC", `<div class="nfcw"><div class="nfc-anim"><i></i><i></i><i></i></div><p>کارت فلزی <b>${esc(g.name)}</b> را روی دستگاه بگذارید…</p><code class="lat">${esc(url)}</code><p class="hint">UID: <span class="lat">${mm.card.uid}</span> · در نسخه‌ی واقعی، این نشانی با یک کلید یک‌بارمصرف روی تراشه‌ی NTAG424 نوشته می‌شود.</p><a class="b gold" href="${esc(url)}" target="_blank">باز کردن صفحه‌ی عضو ↗</a></div>`, {});
}

// ———————————————————————— Zafar Etebar (26, 27, 32)
function circle(el) {
  const d = db(), now = Date.now();
  const by = (t) => d.members.filter((x) => x.tier === t).length;
  const pendingInv = d.requests.filter((r) => r.type === "circle" && ["new", "called"].includes(r.status));
  el.innerHTML = `<div class="kpis">${kpi("اعضا", fa(d.members.length))}${kpi("نوآر", fa(by("noir")))}${kpi("طلایی", fa(by("gold")))}${kpi("فیروزه", fa(by("teal")))}${kpi("لمس کارت ۳۰ روز", fa(sum(d.members, (x) => x.card.taps)))}${kpi("درخواست معرفی", fa(pendingInv.length), "", "", pendingInv.length ? "hot" : "")}</div>
  ${card("اعضای اعتبار ظفر", table(["عضو", "سطح", "میزبان", "عضو از", "کارت NFC", { l: "مانده‌ی دوره" }, "سقف", ""], d.members.map((x) => { const g = guest(x.guestId), b = balance(x.id); return [`<a class="who" href="#/guests/${g.id}">${avatar(g.name, "gold")}<span><b>${esc(honorFa(g))}</b><small class="lat">${x.id}</small></span></a>`, tierPill(x.tier), esc(staff(x.host).name), { v: dateY(x.since), s: x.since }, `<small class="lat">${x.card.uid}</small><br><small>${fa(x.card.taps)} لمس${x.card.lastTap ? " · " + ago(x.card.lastTap) : ""}</small>`, { v: T(b.bal), s: b.bal }, x.limit ? `${T(x.limit)} ${meter(b.bal / x.limit, b.bal / x.limit > 0.8 ? "red" : "")}` : "بدون سقف", `<div class="row">${btn("کارت", `data-wcard="${x.id}"`, "sm")}${btn("سطح", `data-tier="${x.id}"`, "sm")}<a class="b sm" href="member.html?c=${x.id}" target="_blank">صفحه ↗</a></div>`]; })), { extra: btn("+ دعوت به اعتبار", 'data-act="inv"', "gold") })}
  ${pendingInv.length ? card("درخواست‌های معرفی", `<ul class="list">${pendingInv.map((r) => `<li><a href="#/inbox/${r.id}">${avatar(r.name)}<div><b>${esc(honorFa(r))}</b><small>معرف: ${esc(r.fields.ref || "—")} · ${ago(r.ts)}</small></div>${statusPill(r.status)}</a></li>`).join("")}</ul>`) : ""}`;
  el.onclick = (e) => {
    const w = e.target.closest("[data-wcard]"); if (w) writeCard(w.dataset.wcard);
    const t = e.target.closest("[data-tier]"); if (t) { const x = member(t.dataset.tier); modal("تغییر سطح و میزبان", `<div class="ff2">${field("سطح", `<select name="t">${opt(Object.entries(TIER), x.tier)}</select>`)}${field("میزبان", `<select name="h">${opt(hosts().map((h) => [h.id, h.name]), x.host)}</select>`)}</div>${field("سقف حساب (تومان)", `<input name="l" dir="ltr" value="${x.limit || ""}" placeholder="خالی = بدون سقف">`)}`, { onOk: (f) => { x.tier = f.t.value; x.host = f.h.value; x.limit = f.l.value ? +f.l.value : null; commit("M-1", `سطح ${guest(x.guestId).name}: ${TIER[x.tier]}`); } }); }
    if (e.target.closest('[data-act="inv"]')) modal("دعوت به اعتبار", field("مهمان", `<select name="g">${opt(d.guests.filter((g) => !g.memberId).map((g) => [g.id, `${honorFa(g)} · ${fa(g.visits)} دیدار`]))}</select>`), { ok: "ادامه", onOk: (f) => { setTimeout(() => inviteCircle(f.g.value), 320); } });
  };
}

// ———————————————————————— occasions (29) + membership anniversaries (32)
function occasions(el) {
  const d = db(), now = Date.now(), T0 = startOfDay();
  const next = (o) => { let x = o.date; while (x < T0 - DAY) x += 365 * DAY; return x; };
  const list = d.occasions.map((o) => ({ ...o, nx: next(o) })).filter((o) => o.nx < now + 70 * DAY).sort((a, b) => a.nx - b.nx);
  const ann = d.members.map((x) => { const yrs = Math.max(1, Math.ceil((now - x.since) / (365 * DAY))); return { x, yrs, ts: x.since + yrs * 365 * DAY }; }).sort((a, b) => a.ts - b.ts);
  const due = list.filter((o) => o.call !== "done" && o.nx - 7 * DAY <= now + DAY);
  el.innerHTML = `<div class="kpis">${kpi("تماس‌های امروز", fa(due.length), "یک هفته پیش از هر تاریخ", "", due.length ? "hot" : "")}${kpi("مناسبت‌های ۷۰ روز آینده", fa(list.length))}${kpi("سالروز عضویت ۳۰ روز آینده", fa(ann.filter((a) => a.ts - now < 30 * DAY).length))}${kpi("از سایت و صفحه‌ی NFC", fa(d.occasions.filter((o) => o.fromSite || o.fromMember).length))}</div>
  <div class="grid g-2-1">
  ${card("نگهبان مناسبت‌ها", table(["تاریخ", "مهمان", "مناسبت", "تماس میزبان", "وضعیت", ""], list.map((o) => { const g = guest(o.guestId); const callAt = o.nx - 7 * DAY; return [{ v: `${date(o.nx)}<br><small>${until(o.nx)}</small>`, s: o.nx }, g ? `<a class="who" href="#/guests/${g.id}">${avatar(g.name, g.memberId ? "gold" : "")}<span><b>${esc(honorFa(g))}</b><small class="lat">${fa(g.phone)}</small></span></a>` : "—", `${OCC[o.type]}${o.whose ? " · " + esc(o.whose) : ""}`, `${date(callAt)}<br><small>${until(callAt)}</small>`, o.call === "done" ? pill("تماس انجام شد", "green") : callAt <= now + DAY ? pill("امروز تماس بگیرید", "red") : pill("برنامه‌ریزی شده", "mute"), o.call !== "done" ? btn("تماس گرفتم", `data-occdone="${o.id}"`, callAt <= now + DAY ? "gold sm" : "sm") : ""]; })))}
  ${card("سالروز عضویت و هدیه", `<ul class="list">${ann.slice(0, 10).map(({ x, yrs, ts }) => { const g = guest(x.guestId); const st = x.gift && x.gift.y === yrs ? x.gift.s : "todo"; return `<li>${avatar(g.name, "gold")}<div><b>${esc(honorFa(g))}</b><small>${fa(yrs)} سال · ${date(ts)} · ${until(ts)}</small></div><select class="sel sm" data-gift="${x.id}" data-y="${yrs}">${opt([["todo", "هدیه آماده نیست"], ["ready", "هدیه آماده است"], ["sent", "تحویل شد"]], st)}</select></li>`; }).join("")}</ul>`)}
  </div>`;
  el.onclick = (e) => { const b = e.target.closest("[data-occdone]"); if (b) { const o = d.occasions.find((x) => x.id === b.dataset.occdone); o.call = "done"; commit("H-1", `تماس مناسبت ${guest(o.guestId)?.name}`); toast("ثبت شد"); } };
  el.onchange = (e) => { const s = e.target.closest("[data-gift]"); if (s) { const x = member(s.dataset.gift); x.gift = { y: +s.dataset.y, s: s.value }; commit("M-1", `هدیه‌ی سالروز ${guest(x.guestId).name}: ${s.selectedOptions[0].text}`); } };
}
export function addOcc(gid) {
  const d = db();
  modal("مناسبت تازه", `${field("مهمان", `<select name="g">${opt(d.guests.map((g) => [g.id, honorFa(g)]), gid)}</select>`)}<div class="ff2">${field("مناسبت", `<select name="t">${opt(Object.entries(OCC))}</select>`)}${field("برای", `<input name="w" placeholder="همسر، دختر…">`)}</div>${field("تاریخ", `<input name="d" type="date">`)}`, { onOk: (f) => { if (!f.d.value) return false; d.occasions.unshift({ id: `O-${d.occasions.length + 1}`, guestId: f.g.value, type: f.t.value, whose: f.w.value, date: +new Date(f.d.value + "T12:00:00"), call: "scheduled" }); commit("H-1", "مناسبت تازه ثبت شد"); } });
}

export const SECTIONS = [
  { id: "dash", g: "نمای کلی", t: "داشبورد", ico: "dash", r: dash },
  { id: "tonight", g: "نمای کلی", t: "امشب · خوشامد با نام", ico: "door", r: tonight, badge: () => db().tonight.filter((a) => a.status === "expected").length },
  { id: "inbox", g: "مهمانان", t: "نامه‌ها", ico: "letter", r: inbox, badge: () => db().requests.filter((r) => r.status === "new").length },
  { id: "guests", g: "مهمانان", t: "پرونده‌ی مهمانان", ico: "people", r: guests },
  { id: "circle", g: "مهمانان", t: "اعتبار ظفر و کارت NFC", ico: "card", r: circle },
  { id: "occasions", g: "مهمانان", t: "مناسبت‌ها و سالروزها", ico: "cal", r: occasions, badge: () => db().occasions.filter((o) => o.call !== "done" && o.date - 7 * DAY <= Date.now() + DAY && o.date > Date.now() - DAY).length },
];
