// The private page an NFC tap opens (ideas 26, 27, 29, 30, 32, 34 and the driver):
// greeted by name, the card, the personal host, the Zafar Account, the occasions.
import { t, paint, getLang, setLang, onLang, LANGS, pick, digits, fdate, honor, num, mtoman, toman } from "./i18n.js";
import { card, tilt, mark } from "./brand.js";
import { get, on, save, setMe, addRequest, DAY } from "./data.js";
import { initLetter, openLetter } from "./letter.js";
import { STATUS, SVC } from "./services.js";
import { dateInput, readDate } from "./jalali.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const D = {
  tap: { fa: "کارت فلزی‌تان را پشت گوشی بگیرید.", tr: "Metal kartınızı telefonunuzun arkasına tutun.", en: "Hold your metal card to the back of your phone." },
  tapP: { fa: "صفحه‌ی خصوصی شما بدون رمز و بدون حساب کاربری باز می‌شود. برای دمو، یکی از کارت‌های زیر را لمس کنید.", tr: "Özel sayfanız şifresiz ve hesap açmadan açılır. Demo için aşağıdaki kartlardan birine dokunun.", en: "Your private page opens with no password and no account. For the demo, tap one of the cards below." },
  reading: { fa: "در حال خواندن کارت…", tr: "Kart okunuyor…", en: "Reading your card…" },
  morning: { fa: "صبح بخیر", tr: "Günaydın", en: "Good morning" }, noon: { fa: "روز بخیر", tr: "Tünaydın", en: "Good afternoon" }, evening: { fa: "عصر بخیر", tr: "İyi akşamlar", en: "Good evening" }, night: { fa: "شب بخیر", tr: "İyi akşamlar", en: "Good evening" },
  since: { fa: "عضو حلقه از {d}", tr: "{d} tarihinden beri Circle üyesi", en: "Circle member since {d}" },
  host: { fa: "میزبان شخصی شما", tr: "Kişisel ev sahibiniz", en: "Your personal host" },
  hostP: { fa: "هر چیزی که لازم دارید، مستقیم با من در میان بگذارید.", tr: "Neye ihtiyacınız olursa, doğrudan bana söyleyin.", en: "Whatever you need, tell me directly." },
  call: { fa: "تماس", tr: "Ara", en: "Call" }, sms: { fa: "پیام", tr: "Mesaj", en: "Message" }, write: { fa: "نامه", tr: "Mektup", en: "Letter" },
  acc: { fa: "حساب ظفر", tr: "Zafar Hesabı", en: "Zafar Account" },
  bal: { fa: "مانده‌ی این دوره", tr: "Bu dönemin bakiyesi", en: "Balance this period" },
  avail: { fa: "اعتبار در دسترس", tr: "Kullanılabilir kredi", en: "Available credit" },
  limit: { fa: "سقف حساب", tr: "Hesap limiti", en: "Account limit" },
  nolimit: { fa: "بدون سقف از پیش تعیین‌شده", tr: "Önceden belirlenmiş limit yok", en: "No preset spending limit" },
  period: { fa: "دوره از {a}", tr: "Dönem başlangıcı: {a}", en: "Period from {a}" },
  settle: { fa: "تسویه‌ی حضوری با {h}: {d}", tr: "{h} ile yüz yüze ödeme: {d}", en: "Settle in person with {h}: {d}" },
  last: { fa: "آخرین تسویه: {a}، {d}", tr: "Son ödeme: {a}, {d}", en: "Last settled: {a}, {d}" },
  never: { fa: "هیچ پرداختی آنلاین نیست.", tr: "Hiçbir ödeme online yapılmaz.", en: "Nothing is ever paid online." },
  now: { fa: "این دوره", tr: "Bu dönem", en: "This period" }, past: { fa: "صورت‌حساب‌های قبلی", tr: "Önceki ekstreler", en: "Past statements" },
  print: { fa: "چاپ صورت‌حساب", tr: "Ekstreyi yazdır", en: "Print statement" },
  empty: { fa: "هنوز چیزی در این دوره امضا نشده است.", tr: "Bu dönem henüz bir şey imzalanmadı.", en: "Nothing signed yet this period." },
  signedBy: { fa: "امضا: {n}", tr: "İmza: {n}", en: "Signed: {n}" },
  supp: { fa: "کارت‌های همراه", tr: "Ek kartlar", en: "Companion cards" },
  suppAdd: { fa: "درخواست کارت همراه", tr: "Ek kart isteyin", en: "Request a companion card" },
  suppNone: { fa: "هنوز کارت همراهی ندارید.", tr: "Henüz ek kartınız yok.", en: "No companion cards yet." },
  anniv: { fa: "{n} روز تا سالروز عضویت شما", tr: "Üyelik yıl dönümünüze {n} gün kaldı", en: "{n} days to your membership anniversary" },
  annivToday: { fa: "امروز سالروز عضویت شماست", tr: "Bugün üyelik yıl dönümünüz", en: "Today is your membership anniversary" },
  annivP: { fa: "هدیه‌ای شخصی از ظفر در راه است؛ میزبانتان برای زمان تحویل تماس می‌گیرد.", tr: "Zafar'dan kişisel bir hediye yolda; ev sahibiniz ne zaman getireceğini konuşmak için arayacak.", en: "A personal gift from Zafar is on its way; your host will call about when to bring it." },
  occ: { fa: "مناسبت‌هایی که به ظفر سپرده‌اید", tr: "Zafar'a bıraktığınız tarihler", en: "Dates you have left with Zafar" },
  occCall: { fa: "تماس میزبان: {d}", tr: "Ev sahibiniz arıyor: {d}", en: "Your host calls: {d}" },
  occAdd: { fa: "افزودن مناسبت", tr: "Tarih ekleyin", en: "Add a date" },
  svc: { fa: "در خدمت شما", tr: "Hizmetinizde", en: "At your service" },
  reqs: { fa: "نامه‌های شما", tr: "Mektuplarınız", en: "Your letters" },
  noReqs: { fa: "هنوز نامه‌ای ننوشته‌اید.", tr: "Henüz mektup yazmadınız.", en: "No letters yet." },
  prefs: { fa: "آنچه ظفر درباره‌ی شما به خاطر دارد", tr: "Zafar'ın sizinle ilgili hatırladıkları", en: "What Zafar remembers about you" },
  prefsP: { fa: "اگر چیزی تغییر کرده، همین‌جا بنویسید تا میزبانتان بداند.", tr: "Bir şey değiştiyse buraya yazın; ev sahibiniz bilsin.", en: "If anything has changed, note it here so your host knows." },
  table: { fa: "میز محبوب", tr: "Favori masa", en: "Favourite table" }, tea: { fa: "نوشیدنی همیشگی", tr: "Her zamanki", en: "Your usual" }, allergy: { fa: "حساسیت یا رژیم", tr: "Alerji ya da diyet", en: "Allergies or diet" }, note: { fa: "یادداشت برای میزبان", tr: "Ev sahibiniz için not", en: "A note for your host" },
  saveP: { fa: "ذخیره برای میزبان", tr: "Ev sahibim için kaydet", en: "Save for my host" }, saved: { fa: "میزبانتان در جریان قرار گرفت.", tr: "Ev sahibinize iletildi.", en: "Your host has been told." },
  back: { fa: "بازگشت به سایت ظفر", tr: "Zafar'a dön", en: "Back to Zafar" },
  other: { fa: "کارت دیگری دارید؟", tr: "Başka bir kart mı?", en: "Another card?" },
  cats: { dining: { fa: "پذیرایی", tr: "Yemek", en: "Dining" }, home: { fa: "سرو در منزل", tr: "Evde servis", en: "Home serving" }, chauffeur: { fa: "راننده", tr: "Şoför", en: "Driver" }, gift: { fa: "هدیه", tr: "Hediye", en: "Gift" }, event: { fa: "مراسم", tr: "Tören", en: "Ceremony" }, bespoke: { fa: "غذای اختصاصی", tr: "Özel yemek", en: "Bespoke dish" }, settle: { fa: "تسویه", tr: "Ödeme", en: "Settlement" } },
  method: { pos: { fa: "کارتخوان", tr: "POS", en: "card" }, cash: { fa: "نقد", tr: "nakit", en: "cash" }, transfer: { fa: "حواله", tr: "havale", en: "transfer" } },
};
const tm = (k, v) => { let s = pick(D[k]); if (v) for (const x in v) s = s.replaceAll(`{${x}}`, v[x]); return s; };

const params = new URLSearchParams(location.search);
let cid = params.get("c");
let tab = "now";

function langs() { $$(".langs").forEach((b) => { b.innerHTML = LANGS.map(([l, n]) => `<button type="button" data-l="${l}" aria-pressed="${getLang() === l}">${n}</button>`).join(""); }); }
document.addEventListener("click", (e) => { const b = e.target.closest(".langs button"); if (b) setLang(b.dataset.l); });

function greeting() { const h = new Date().getHours(); return tm(h < 11 ? "morning" : h < 16 ? "noon" : h < 21 ? "evening" : "night"); }
const latName = (g) => (getLang() === "fa" ? g.name : g.nameLat || g.name);

// ———— the tap screen
function tapScreen() {
  const d = get();
  const demo = [d.members[0], d.members.find((m) => m.tier === "gold"), d.members.find((m) => m.tier === "teal")];
  $("#m-root").innerHTML = `<section class="tap">
    <div class="tap-anim" aria-hidden="true"><div class="tap-phone"><i></i></div><div class="tap-waves"><i></i><i></i><i></i></div></div>
    <h1 class="h2">${esc(tm("tap"))}</h1><p class="lede">${esc(tm("tapP"))}</p>
    <div class="tap-cards">${demo.map((m) => { const g = d.guests.find((x) => x.id === m.guestId); return `<button class="tc" type="button" data-cid="${m.id}">${card({ tier: m.tier, name: g.nameLat, id: m.id, since: m.since })}<span>${esc(latName(g))} · ${esc(t("tier." + m.tier))}</span></button>`; }).join("")}</div>
    <a class="btn ghost" href="index.html">${esc(tm("back"))}</a></section>`;
  tilt($("#m-root"));
}
$("#m-root").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cid]"); if (!b) return;
  b.classList.add("tapping"); document.body.classList.add("reading");
  setTimeout(() => { history.pushState(null, "", `?c=${b.dataset.cid}`); cid = b.dataset.cid; render(); scrollTo(0, 0); document.body.classList.remove("reading"); }, 1100);
});
addEventListener("popstate", () => { cid = new URLSearchParams(location.search).get("c"); render(); });

// ———— the private page
function render() {
  langs(); paint();
  const d = get();
  const m = d.members.find((x) => x.id === cid);
  if (!m) { tapScreen(); return; }
  const g = d.guests.find((x) => x.id === m.guestId);
  const host = d.staff.find((s) => s.id === m.host);
  setMe({ title: g.title, name: g.name, nameLat: g.nameLat, phone: g.phone, memberId: m.id });
  m.card.taps = (m.card.taps || 0) + (render.counted ? 0 : 1); m.card.lastTap = Date.now(); render.counted = 1;
  const tx = d.tx.filter((x) => x.memberId === m.id).sort((a, b) => b.ts - a.ts);
  const lastSettle = tx.find((x) => x.kind === "settle");
  const cur = tx.filter((x) => x.kind === "charge" && (!lastSettle || x.ts > lastSettle.ts));
  const bal = cur.reduce((s, x) => s + x.amount, 0);
  const pStart = lastSettle ? lastSettle.ts : m.since;
  const due = pStart + 34 * DAY > Date.now() ? pStart + 34 * DAY : Date.now() + 6 * DAY;
  // statements: groups of charges between settlements
  const settles = tx.filter((x) => x.kind === "settle");
  const past = settles.map((s, i) => { const prev = settles[i + 1]; const items = tx.filter((x) => x.kind === "charge" && x.ts <= s.ts && (!prev || x.ts > prev.ts)); return { s, items, total: items.reduce((a, b) => a + b.amount, 0) }; });
  // anniversary
  const yrs = Math.max(1, Math.ceil((Date.now() - m.since) / (365 * DAY)));
  let ann = m.since + yrs * 365 * DAY; const annDays = Math.ceil((ann - Date.now()) / DAY);
  const occ = d.occasions.filter((o) => o.guestId === g.id || o.memberId === m.id);
  const reqs = d.requests.filter((r) => r.memberId === m.id || r.guestId === g.id).slice(0, 6);
  const used = m.limit ? Math.min(1, bal / m.limit) : 0;
  const nm = honor({ ...g, name: g.surname ? (getLang() === "fa" ? g.surname : g.surnameLat) : g.name, nameLat: g.surnameLat });
  const hostN = getLang() === "fa" ? host.name : host.nameLat;
  const CI = { dining: "◆", home: "⌂", chauffeur: "⟶", gift: "✦", event: "❖", bespoke: "✧" };
  const row = (x) => `<li><span class="tx-i">${CI[x.cat] || "•"}</span><span class="tx-n"><b>${esc(pick(D.cats[x.cat]))}</b><small>${esc(getLang() === "fa" ? x.note : pick(D.cats[x.cat]))} · ${esc(fdate(x.ts, { day: "numeric", month: "short" }))}${x.by && x.by !== m.id ? ` · ${esc(tm("signedBy", { n: x.by }))}` : ""}</small></span><b class="tx-a">${esc(mtoman(x.amount))}</b></li>`;
  $("#m-root").innerHTML = `
  <section class="mhero">
    <div class="mh-copy">
      <p class="kicker">${esc(t("x.member"))} · <span class="lat">${esc(m.id)}</span></p>
      <h1 class="mh-t">${esc(greeting())}${getLang() === "fa" ? "،" : ","}<br><span>${esc(nm)}</span></h1>
      <p class="mh-s">${esc(tm("since", { d: fdate(m.since, { month: "long", year: "numeric" }) }))} · ${esc(t("tier." + m.tier))}</p>
    </div>
    <div class="mh-card">${card({ tier: m.tier, name: g.nameLat, id: m.id, since: m.since })}</div>
  </section>
  <div class="mgrid2">
    <section class="mbox host">
      <div class="hb-a">${esc((getLang() === "fa" ? host.name : host.nameLat).split(" ").map((w) => w[0]).slice(0, 2).join(getLang() === "fa" ? "‌" : ""))}</div>
      <div class="hb-t"><small>${esc(tm("host"))}</small><b>${esc(hostN)}</b><p>${esc(tm("hostP"))}</p></div>
      <div class="hb-b"><a class="btn gold" href="tel:${host.phone}">${esc(tm("call"))}</a><a class="btn ghost" href="sms:${host.phone}">${esc(tm("sms"))}</a><button class="btn ghost" type="button" data-letter="visit">${esc(tm("write"))}</button></div>
    </section>
    <section class="mbox anniv">
      <div class="an-ribbon" aria-hidden="true">${mark()}</div>
      <div><b>${esc(annDays <= 0 ? tm("annivToday") : tm("anniv", { n: digits(annDays) }))}</b><p>${esc(tm("annivP"))}</p></div>
    </section>
  </div>
  <section class="mbox acct">
    <div class="ac-h"><div><p class="kicker">${esc(tm("acc"))}</p><h2>${esc(tm("bal"))}</h2></div><div class="ac-bal">${esc(mtoman(bal))}</div></div>
    <div class="ac-meta">
      <div>${m.limit ? `<small>${esc(tm("avail"))}</small><b>${esc(mtoman(Math.max(0, m.limit - bal)))}</b><span class="meter"><i style="--p:${used.toFixed(3)}"></i></span><small>${esc(tm("limit"))}: ${esc(mtoman(m.limit))}</small>` : `<small>${esc(tm("limit"))}</small><b>${esc(tm("nolimit"))}</b>`}</div>
      <div><small>${esc(tm("period", { a: fdate(pStart, { day: "numeric", month: "long" }) }))}</small><b>${esc(tm("settle", { h: hostN, d: fdate(due, { weekday: "long", day: "numeric", month: "long" }) }))}</b>${lastSettle ? `<small>${esc(tm("last", { a: mtoman(lastSettle.amount), d: fdate(lastSettle.ts, { day: "numeric", month: "long" }) }))} · ${esc(pick(D.method[lastSettle.method] || D.method.pos))}</small>` : ""}</div>
    </div>
    <div class="ac-tabs seg seg-dark" role="tablist"><span class="seg-lens"></span><button type="button" data-tab="now" aria-selected="${tab === "now"}">${esc(tm("now"))}</button><button type="button" data-tab="past" aria-selected="${tab === "past"}">${esc(tm("past"))}</button></div>
    ${tab === "now" ? (cur.length ? `<ul class="txs">${cur.map(row).join("")}</ul>` : `<p class="muted">${esc(tm("empty"))}</p>`) : `<ul class="stmts">${past.map((p) => `<li><details><summary><span>${esc(fdate(p.s.ts, { month: "long", year: "numeric" }))}</span><small>${digits(p.items.length)} · ${esc(pick(D.method[p.s.method] || D.method.pos))}</small><b>${esc(mtoman(p.total))}</b></summary><ul class="txs">${p.items.map(row).join("")}</ul></details></li>`).join("")}</ul>`}
    <div class="ac-foot"><span class="safe">${esc(tm("never"))}</span><button class="btn ghost" type="button" id="print">${esc(tm("print"))}</button></div>
  </section>
  <div class="mgrid2">
    <section class="mbox supp"><h3>${esc(tm("supp"))}</h3>${m.supp.length ? `<ul class="sl">${m.supp.map((s) => `<li><div class="mini-card tier-${m.tier}">${mark()}</div><div><b>${esc(s.name)}</b><small>${esc(s.rel)} · ${esc(tm("limit"))}: ${esc(mtoman(s.limit))}</small></div></li>`).join("")}</ul>` : `<p class="muted">${esc(tm("suppNone"))}</p>`}<button class="btn ghost" type="button" id="supp-add">${esc(tm("suppAdd"))}</button></section>
    <section class="mbox occ"><h3>${esc(tm("occ"))}</h3><ul class="ol">${occ.map((o) => { let call = o.date - 7 * DAY; while (call < Date.now() - DAY) call += 365 * DAY; return `<li><b>${esc(t(o.type))}${o.whose ? ` · ${esc(o.whose)}` : ""}</b><small>${esc(fdate(o.date, { day: "numeric", month: "long" }))} · ${esc(tm("occCall", { d: fdate(call, { day: "numeric", month: "long" }) }))}</small></li>`; }).join("") || `<li class="muted">—</li>`}</ul>
      <form class="occ-mini" id="occ-mini"><select name="type">${["occ.anniv", "occ.bday", "occ.engage", "occ.other"].map((k) => `<option value="${k}">${esc(t(k))}</option>`).join("")}</select><input name="whose" placeholder="${esc(t("occ.whose"))}">${dateInput("date", null, "")}<button class="btn gold" type="submit">${esc(tm("occAdd"))}</button></form></section>
  </div>
  <section class="mbox quick"><h3>${esc(tm("svc"))}</h3><div class="qk">${["chauffeur", "bespoke", "home", "giftbox", "evening", "buyout"].map((id) => `<button type="button" data-letter="${id}"><b>${esc(pick(SVC[id].t))}</b><small>${esc(pick(SVC[id].s))}</small></button>`).join("")}</div></section>
  <div class="mgrid2">
    <section class="mbox prefs"><h3>${esc(tm("prefs"))}</h3><p class="muted">${esc(tm("prefsP"))}</p>
      <form id="prefs" class="pf"><label class="fld"><span>${esc(tm("table"))}</span><input name="table" value="${esc(g.prefs.table || "")}"></label><label class="fld"><span>${esc(tm("tea"))}</span><input name="tea" value="${esc(g.prefs.tea || "")}"></label><label class="fld"><span>${esc(tm("allergy"))}</span><input name="allergy" value="${esc(g.prefs.allergy || "")}"></label><label class="fld"><span>${esc(tm("note"))}</span><input name="note" value="${esc(g.prefs.guestNote || "")}"></label><button class="btn ink" type="submit">${esc(tm("saveP"))}</button></form></section>
    <section class="mbox reqs"><h3>${esc(tm("reqs"))}</h3><ul class="rl">${reqs.map((r) => `<li><div><b>${esc(pick(SVC[r.type]?.t) || r.type)}</b><small class="lat">${esc(r.id)}</small> <small>· ${esc(fdate(r.ts, { day: "numeric", month: "short" }))}</small></div><span class="st st-${r.status}">${esc(pick(STATUS[r.status]))}</span></li>`).join("") || `<li class="muted">${esc(tm("noReqs"))}</li>`}</ul></section>
  </div>
  <p class="m-other"><a href="member.html">${esc(tm("other"))}</a> · <a href="index.html">${esc(tm("back"))}</a></p>`;
  tilt($("#m-root"));
  const sg = $(".ac-tabs"); const place = () => { const b = sg.querySelector('[aria-selected="true"]'); sg.style.setProperty("--x", `${b.offsetLeft}px`); sg.style.setProperty("--w", `${b.offsetWidth}px`); }; requestAnimationFrame(place);
  sg.onclick = (e) => { const b = e.target.closest("[data-tab]"); if (b) { tab = b.dataset.tab; render(); } };
  $("#print").onclick = () => print();
  $("#supp-add").onclick = () => openLetter("visit", {}) || null;
  $("#prefs").onsubmit = (e) => { e.preventDefault(); const f = e.target; const dd = get(); const gg = dd.guests.find((x) => x.id === g.id); Object.assign(gg.prefs, { table: f.table.value, tea: f.tea.value, allergy: f.allergy.value, guestNote: f.note.value, updated: Date.now() }); dd.audit.unshift({ ts: Date.now(), by: m.id, text: `مهمان سلیقه‌هایش را از صفحه‌ی NFC به‌روز کرد` }); save(); toast(tm("saved")); };
  $("#occ-mini").onsubmit = (e) => { e.preventDefault(); const f = e.target; const date = readDate(f, "date"); if (!date) return; const dd = get(); dd.occasions.unshift({ id: `O-${dd.occasions.length + 1}`, guestId: g.id, memberId: m.id, type: f.type.value, whose: f.whose.value, date, call: "scheduled", fromMember: true }); save(); render(); toast(tm("saved")); };
  document.title = `${getLang() === "fa" ? "حلقه‌ی ظفر" : "Zafar Circle"} · ${latName(g)}`;
}
let tT; function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => el.classList.remove("on"), 3000); }

get();
render();
initLetter({ sent: () => setTimeout(render, 2600) });
onLang(render);
on((db, src) => { if (src === "remote") render(); });
