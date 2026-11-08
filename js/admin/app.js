// Zafar · CEO panel shell: lock, sidebar, header, ⌘K palette, router, live sync.
import { get, on } from "../data.js";
import { mark } from "../brand.js";
import { esc, fa, ago } from "./kit.js";
import { $, $$, db, guest, honorFa, TYPE, setRerender, closeDrawer, closeModal, toast } from "./ui.js";
import { SECTIONS as S1, alerts, guestDrawer } from "./v-guests.js";
import { SECTIONS as S2 } from "./v-account.js";
import { SECTIONS as S3 } from "./v-services.js";
import { SECTIONS as S4 } from "./v-house.js";

// Plain names, one line on what each page is for, and simpler groups. Every section stays.
const META = {
  dash: ["امروز", "روزانه", "هر چه امروز به شما نیاز دارد، در یک نگاه."],
  tonight: ["امشب", "روزانه", "مهمانان امشب را با نام خوشامد بگویید و وضعیتشان را ثبت کنید."],
  inbox: ["نامه‌ها", "روزانه", "نامه‌ی مهمان را باز کنید، تماس بگیرید، تأیید کنید."],
  guests: ["مهمانان", "مهمانان", "پرونده‌ی هر مهمان: سلیقه، حساسیت‌ها و دیدارها."],
  occasions: ["مناسبت‌ها", "مهمانان", "تولدها و سالگردها؛ یک هفته قبل تماس بگیرید."],
  circle: ["اعتبار ظفر", "مهمانان", "اعضا، سطح کارت‌ها و کارت‌های NFC."],
  accounts: ["حساب‌ها", "حساب و اعتبار", "مانده و سقف حساب هر عضو."],
  post: ["امضا و تسویه", "حساب و اعتبار", "امضای سر میز را ثبت کنید یا تسویه را بگیرید."],
  statements: ["صورت‌حساب‌ها", "حساب و اعتبار", "صورت‌حساب ماهانه‌ی هر عضو، آماده‌ی چاپ."],
  ar: ["مطالبات", "حساب و اعتبار", "چه کسی، چقدر و از چه زمانی بدهکار است."],
  home: ["ظفر در خانه", "خدمات", "سرو در منزل، سرآشپز مقیم و تحویل دستی."],
  events: ["مراسم", "خدمات", "تقویم مراسم، خواستگاری‌ها و اجاره‌ی کامل."],
  drivers: ["راننده‌ها", "خدمات", "سفرهای امروز و رانندگان آزاد."],
  gifts: ["هدیه‌ها", "خدمات", "جعبه‌های هدیه و شب‌های هدیه."],
  bespoke: ["غذای اختصاصی", "خدمات", "درخواست غذای سفارشی و جلسه‌ی چشیدن."],
  menu: ["منو و قیمت", "رستوران", "قیمت را عوض کنید یا غذایی را پنهان کنید؛ روی سایت فوراً دیده می‌شود."],
  sales: ["فروش", "رستوران", "درآمد هر روز و هر خط خدمت."],
  pnl: ["سود و زیان", "رستوران", "درآمد، هزینه و سود هر ماه."],
  staff: ["کارکنان", "رستوران", "میزبان‌ها، آشپزها، رانندگان و شیفت‌ها."],
  reports: ["گزارش‌ها", "سیستم", "خروجی اکسل و خلاصه برای چاپ."],
  access: ["دسترسی", "سیستم", "چه کسی، چه کاری، چه زمانی."],
  settings: ["تنظیمات", "سیستم", "رمز، نمایش قیمت‌ها و زمان پاسخ به نامه‌ها."],
};
const ORDER = Object.keys(META);
const SECTIONS = [...S1, ...S2, ...S3, ...S4].map((x) => ({ ...x, full: x.t, t: META[x.id]?.[0] || x.t, g: META[x.id]?.[1] || x.g, d: META[x.id]?.[2] || "" })).sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
export const SEC = SECTIONS;
// quick actions: open a page and press its main button
const QUICK = [["تماس با نامه‌ی تازه", "inbox", "", "letter"], ["ثبت امضا", "post", "[data-post-new]", "pen"], ["مهمان امشب", "tonight", "[data-act=add-tonight]", "door"], ["مهمان تازه", "guests", "[data-act=new-guest]", "people"], ["ثبت تسویه", "post", "[data-settle-new]", "acc"], ["دعوت به اعتبار", "circle", "[data-act=inv]", "card"]];
const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICO = {
  dash: P('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  door: P('<path d="M5 21V10a7 7 0 0114 0v11M3 21h18"/><circle cx="14.5" cy="15" r=".8" fill="currentColor"/>'),
  letter: P('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>'),
  people: P('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.6 3.2-5.5 6-5.5s5.2 1.9 6 5.5"/><path d="M16 5.2a3 3 0 010 5.6M18.5 14.8c1.4.8 2.2 2.4 2.5 5.2"/>'),
  card: P('<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M15 10c.8.6 1.2 1.3 1.2 2s-.4 1.4-1.2 2M17.4 8.6c1.2 1 1.8 2.2 1.8 3.4s-.6 2.4-1.8 3.4"/><rect x="6" y="10" width="4" height="3.2" rx=".8"/>'),
  cal: P('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4"/>'),
  acc: P('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  pen: P('<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>'),
  doc: P('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'),
  clock: P('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  house: P('<path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/>'),
  ring: P('<circle cx="12" cy="14" r="6"/><path d="M9.5 4h5l-1.5 3.2h-2z"/>'),
  car: P('<path d="M3 16h18M5 16l1.5-5c.3-1 1.2-1.6 2.2-1.6h6.6c1 0 1.9.6 2.2 1.6L19 16"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/>'),
  gift: P('<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>'),
  dish: P('<path d="M3 16h18M5 16a7 7 0 0114 0M12 6v3M10 6h4M2 19h20"/>'),
  menu: P('<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M9 9h6M9 13h6"/>'),
  chart: P('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  pl: P('<path d="M4 18l5-6 4 3 7-9"/><path d="M15 6h5v5"/>'),
  lock: P('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/>'),
  gear: P('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
};
const root = document.documentElement;
root.dataset.theme = localStorage.getItem("zafar.adminTheme") || "dark";

function shell() {
  document.body.innerHTML = `
  <div class="lock" id="lock" ${sessionStorage.getItem("zafar.unlocked") === "1" ? "hidden" : ""}>
    <div class="lk-in">${mark("lk-mark")}<h1>ظفر</h1><p>پنل مدیرعامل</p><div class="dots" id="dots"><i></i><i></i><i></i><i></i></div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k) => `<button type="button" data-k="${k}" ${k === "" ? "disabled" : ""}>${typeof k === "number" ? fa(k) : k}</button>`).join("")}</div>
      <small>رمز دمو <span class="lat">1234</span></small></div>
    <div class="lk-sig"><img src="assets/brand/alpha-white.png" alt="" width="28"><span>Powered by Alpha Agency</span></div>
  </div>
  <aside class="side" id="side">
    <a class="sd-brand" href="#/dash">${mark()}<div><b>ZAFAR</b><small>پنل مدیرعامل</small></div></a>
    <nav class="sd-nav" id="sd-nav"></nav>
    <div class="sd-foot"><a href="index.html" target="_blank">سایت ظفر ↗</a><a href="member.html" target="_blank">صفحه‌ی اعضا ↗</a><a class="alpha-sig" href="https://alphaa.agency" target="_blank" rel="noopener"><img src="assets/brand/alpha-white.png" alt="Alpha Agency" width="28"><span>Powered by Alpha Agency</span></a></div>
  </aside>
  <div class="scrim" id="scrim"></div>
  <div class="main">
    <header class="top"><button class="ib burger" id="burger" aria-label="منو">☰</button><button class="ib" id="collapse" aria-label="جمع کردن">${P('<path d="M4 6h16M4 12h10M4 18h16"/>')}</button><div class="tt"><h1 id="title"></h1><p id="tdesc"></p></div>
      <button class="search" id="search">${P('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>')}<span>جست‌وجو در مهمانان، نامه‌ها و بخش‌ها</span><kbd class="lat">⌘K</kbd></button>
      <button class="ib bell" id="bell" aria-label="هشدارها">${P('<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 004 0"/>')}<i id="bell-n"></i></button>
      <button class="ib" id="theme" aria-label="روشن / تیره">${P('<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>')}</button>
      <button class="ib" id="lockb" aria-label="قفل">${ICO.lock}</button>
      <div class="me">${mark()}<span>مدیرعامل</span></div>
    </header>
    <div class="alerts-pop" id="alerts-pop" hidden></div>
    <main class="view" id="view"></main>
  </div>
  <div class="drawer" id="drawer" hidden><div class="dw-bg" data-dclose></div><div class="dw-in"></div></div>
  <div class="modal" id="modal" hidden><div class="md-bg" data-mclose></div><div class="md-in"></div></div>
  <div class="pal" id="pal" hidden><div class="pal-bg"></div><div class="pal-in"><input id="pal-q" placeholder="نام مهمان، کد نامه، بخش…" autocomplete="off"><ul id="pal-r"></ul></div></div>
  <nav class="tabbar" id="tabbar">${[["dash", "امروز", "dash"], ["tonight", "امشب", "door"], ["inbox", "نامه‌ها", "letter"], ["guests", "مهمانان", "people"]].map(([id, l, i]) => `<a href="#/${id}" data-tab="${id}">${ICO[i]}<span>${l}</span><i class="bd" data-bd="${id}"></i></a>`).join("")}<button type="button" id="tab-all">${P('<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>')}<span>همه</span></button></nav>
  <div class="toast" id="toast"></div>`;
}

function nav() {
  const groups = [...new Set(SECTIONS.map((s) => s.g))];
  const cur = location.hash.slice(2).split("/")[0] || "dash";
  $("#sd-nav").innerHTML = groups.map((g) => `<div class="sd-g"><small>${g}</small>${SECTIONS.filter((s) => s.g === g).map((s) => { const b = s.badge ? s.badge() : 0; return `<a href="#/${s.id}" class="${s.id === cur ? "on" : ""}" title="${s.t}">${ICO[s.ico] || ""}<span>${s.t}</span>${b ? `<i class="bd">${fa(b)}</i>` : ""}</a>`; }).join("")}</div>`).join("");
  $$("#tabbar [data-tab]").forEach((a) => { a.classList.toggle("on", a.dataset.tab === cur); const s = SECTIONS.find((x) => x.id === a.dataset.tab); const b = s?.badge ? s.badge() : 0; a.querySelector(".bd").textContent = b ? fa(b) : ""; });
  const al = alerts(); $("#bell-n").textContent = al.length ? fa(al.length) : ""; $("#bell").classList.toggle("has", !!al.length);
}

// "Today": the top of the dashboard — what needs you now, and one-tap actions
function today() {
  const d = db(), now = Date.now(), h = new Date().getHours();
  const hi = h < 12 ? "صبح بخیر" : h < 17 ? "روز بخیر" : "عصر بخیر";
  const dateFa = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(now);
  const newL = d.requests.filter((r) => r.status === "new"), ton = d.tonight.filter((x) => x.status === "expected");
  const al = alerts();
  const rows = [
    newL.length ? { k: "red", t: `${fa(newL.length)} نامه‌ی تازه منتظر تماس شماست`, b: "دیدن نامه‌ها", go: "#/inbox" } : null,
    ton.length ? { k: "gold", t: `${fa(ton.length)} میهمانی امشب هنوز نرسیده‌اند`, b: "فهرست امشب", go: "#/tonight" } : null,
    ...al.filter((a) => !a.go.startsWith("inbox")).slice(0, 4).map((a) => ({ k: a.k, t: a.t, b: "انجام", go: "#/" + a.go })),
  ].filter(Boolean);
  return `<section class="today">
    <div class="td-h"><div><h2>${hi}</h2><p>${dateFa}</p></div><span class="td-n">${rows.length ? `${fa(rows.length)} کار برای امروز` : "امروز کاری منتظر شما نیست"}</span></div>
    ${rows.length ? `<ul class="todo">${rows.map((r) => `<li class="${r.k}"><span class="td-dot"></span><b>${esc(r.t)}</b><a class="b" href="${r.go}">${r.b}</a></li>`).join("")}</ul>` : ""}
    <div class="quick">${QUICK.map(([l, id, sel, i]) => `<a href="#/${id}" data-quick="${id}|${sel}">${ICO[i] || ""}<span>${l}</span></a>`).join("")}</div>
  </section>`;
}
function launcher() {
  const groups = [...new Set(SECTIONS.map((s) => s.g))];
  return `<section class="launch"><h3>همه‌ی بخش‌ها</h3>${groups.map((g) => `<div class="ln-g"><small>${g}</small><div class="ln-grid">${SECTIONS.filter((s) => s.g === g).map((s) => `<a href="#/${s.id}">${ICO[s.ico] || ""}<div><b>${s.t}</b><span>${s.d}</span></div></a>`).join("")}</div></div>`).join("")}</section>`;
}

function route() {
  const [id, arg] = (location.hash.slice(2) || "dash").split("/");
  const s = SECTIONS.find((x) => x.id === id) || SECTIONS[0];
  $("#title").textContent = s.t; $("#tdesc").textContent = s.d;
  const v = $("#view");
  if (v.dataset.s !== s.id) { v.dataset.s = s.id; v.innerHTML = ""; v._f = null; v.dataset.door = "0"; v.classList.remove("in"); void v.offsetWidth; v.classList.add("in"); }
  s.r(v, arg);
  if (s.id === "dash") { v.insertAdjacentHTML("afterbegin", today()); v.insertAdjacentHTML("beforeend", launcher()); }
  nav();
  if (!arg) closeDrawer();
  document.title = `${s.t} · ظفر`;
  $("#side").classList.remove("open"); $("#scrim").classList.remove("on");
}

// ⌘K palette
function palette(open = true) {
  const p = $("#pal"); p.hidden = !open; if (!open) return;
  const q = $("#pal-q"); q.value = ""; draw(""); setTimeout(() => q.focus(), 30);
  function draw(s) {
    const d = db(); const t = s.trim();
    const sec = SECTIONS.filter((x) => !t || x.t.includes(t)).slice(0, 6).map((x) => ({ h: `#/${x.id}`, l: x.t, k: "بخش" }));
    const gs = t ? d.guests.filter((g) => `${g.name} ${g.nameLat} ${g.phone} ${g.id} ${g.memberId || ""}`.toLowerCase().includes(t.toLowerCase())).slice(0, 6).map((g) => ({ h: `#/guests/${g.id}`, l: honorFa(g), k: g.memberId ? "عضو اعتبار ظفر" : "مهمان" })) : [];
    const ls = t ? d.requests.filter((r) => `${r.id} ${r.name} ${TYPE[r.type]}`.includes(t)).slice(0, 5).map((r) => ({ h: `#/inbox/${r.id}`, l: `${r.id} · ${r.name}`, k: TYPE[r.type] })) : [];
    $("#pal-r").innerHTML = [...sec, ...gs, ...ls].map((r, i) => `<li><a href="${r.h}" class="${i === 0 ? "on" : ""}"><span>${esc(r.l)}</span><small>${esc(r.k)}</small></a></li>`).join("") || `<li class="empty">چیزی پیدا نشد</li>`;
  }
  q.oninput = () => draw(q.value);
  q.onkeydown = (e) => {
    const as = $$("#pal-r a"); let i = as.findIndex((a) => a.classList.contains("on"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); as[i]?.classList.remove("on"); i = (i + (e.key === "ArrowDown" ? 1 : -1) + as.length) % as.length; as[i]?.classList.add("on"); }
    if (e.key === "Enter" && as[i]) { location.hash = as[i].getAttribute("href"); palette(false); }
  };
}

function chime() { try { const c = new (window.AudioContext || window.webkitAudioContext)(); [880, 1318.5].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.type = "sine"; g.gain.setValueAtTime(0, c.currentTime + i * 0.12); g.gain.linearRampToValueAtTime(0.12, c.currentTime + i * 0.12 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * 0.12 + 0.9); o.connect(g).connect(c.destination); o.start(c.currentTime + i * 0.12); o.stop(c.currentTime + i * 0.12 + 1); }); } catch (e) {} }

function boot() {
  shell(); get(); setRerender(route);
  // lock
  let pin = "";
  const dots = () => $$("#dots i").forEach((d, i) => d.classList.toggle("on", i < pin.length));
  const tryPin = () => { if (pin === (db().settings.pin || "1234")) { sessionStorage.setItem("zafar.unlocked", "1"); $("#lock").classList.add("out"); setTimeout(() => { $("#lock").hidden = true; $("#lock").classList.remove("out"); }, 600); } else { $("#dots").classList.add("bad"); setTimeout(() => $("#dots").classList.remove("bad"), 500); } pin = ""; setTimeout(dots, 350); };
  $("#lock").addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k; if (k === "⌫") pin = pin.slice(0, -1); else if (pin.length < 4) pin += k; dots(); if (pin.length === 4) setTimeout(tryPin, 150); });
  addEventListener("keydown", (e) => {
    if (!$("#lock").hidden) { if (/^\d$/.test(e.key) && pin.length < 4) { pin += e.key; dots(); if (pin.length === 4) setTimeout(tryPin, 150); } if (e.key === "Backspace") { pin = pin.slice(0, -1); dots(); } return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette(true); }
    if (e.key === "Escape") { palette(false); closeModal(); closeDrawer(); $("#alerts-pop").hidden = true; }
    if (e.key === "[" && !/input|textarea|select/i.test(document.activeElement.tagName)) root.classList.toggle("collapsed");
  });
  $("#lockb").onclick = () => { sessionStorage.removeItem("zafar.unlocked"); $("#lock").hidden = false; };
  $("#search").onclick = () => palette(true);
  $("#pal").addEventListener("click", (e) => { if (e.target.classList.contains("pal-bg") || e.target.closest("#pal-r a")) palette(false); });
  $("#tab-all").onclick = () => { $("#side").classList.add("open"); $("#scrim").classList.add("on"); };
  document.addEventListener("click", (e) => { const q = e.target.closest("[data-quick]"); if (!q) return; e.preventDefault(); const [id, sel] = q.dataset.quick.split("|"); const go = () => setTimeout(() => { const el = sel ? document.querySelector(sel) : document.querySelector(".ib-list li.unread a, .ib-list li a"); el?.click(); }, 120); if (location.hash === "#/" + id) go(); else { location.hash = "#/" + id; go(); } });
  $("#collapse").onclick = () => root.classList.toggle("collapsed");
  $("#burger").onclick = () => { $("#side").classList.add("open"); $("#scrim").classList.add("on"); };
  $("#scrim").onclick = () => { $("#side").classList.remove("open"); $("#scrim").classList.remove("on"); };
  $("#theme").onclick = () => { root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("zafar.adminTheme", root.dataset.theme); };
  $("#bell").onclick = (e) => { e.stopPropagation(); const p = $("#alerts-pop"); const al = alerts(); p.innerHTML = `<h4>هشدارها</h4>${al.length ? `<ul>${al.map((a) => `<li class="${a.k}"><a href="#/${a.go}">${esc(a.t)}</a></li>`).join("")}</ul>` : `<p class="empty">هشداری نیست.</p>`}`; p.hidden = !p.hidden; };
  document.addEventListener("click", (e) => { if (!e.target.closest("#alerts-pop") && !e.target.closest("#bell")) $("#alerts-pop").hidden = true; if (e.target.closest("[data-mclose]")) closeModal(); });
  addEventListener("hashchange", route);
  // guest-side letters arrive live (site or NFC page open in another tab)
  let known = new Set(db().requests.map((r) => r.id));
  on((d, src) => {
    if (src !== "remote") return;
    const fresh = d.requests.filter((r) => !known.has(r.id)); known = new Set(d.requests.map((r) => r.id));
    if (fresh.length) { chime(); toast(`نامه‌ی تازه از ${honorFa(fresh[0])} · ${TYPE[fresh[0].type]}`); $("#bell").classList.add("ring"); setTimeout(() => $("#bell").classList.remove("ring"), 1200); }
    if (!document.querySelector("#modal:not([hidden])")) route(); else nav();
  });
  if (!location.hash) location.hash = "#/dash"; else route();
  setInterval(nav, 60000);
}
boot();
