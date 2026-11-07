import { t, paint, getLang, setLang, onLang, LANGS, pick, kprice, digits, fdate, honor, num, mtoman, toman } from "./i18n.js";
import { MENU } from "./menu.js";
import { SERVICES, SVC, GROUPS } from "./services.js";
import { mark, card, tilt } from "./brand.js";
import { get, on, me, setMe, addRequest } from "./data.js";
import { initLetter, openLetter } from "./letter.js";
import { initNav, retone, relens } from "./nav.js";
import { dateInput, readDate } from "./jalali.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const root = document.documentElement;

// ———————————————————————— opening
const boot = $("#boot");
const seen = sessionStorage.getItem("zafar.boot");
root.classList.add("boot-on");
const lift = () => { boot.classList.add("out"); root.classList.remove("boot-on"); root.classList.add("ready"); playVideos(); setTimeout(() => boot.classList.add("gone"), 1400); };
if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) { boot.classList.add("gone"); root.classList.remove("boot-on"); root.classList.add("ready"); }
else { sessionStorage.setItem("zafar.boot", "1"); setTimeout(lift, 2600); }

function playVideos() {
  const mobile = matchMedia("(max-width: 899px)").matches;
  $$("video").forEach((v) => { v.muted = true; v.playsInline = true; const p = v.play(); p && p.catch(() => {}); });
  if (mobile) $(".hv")?.pause();
}
addEventListener("load", () => { if (seen) playVideos(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) playVideos(); });

// ———————————————————————— languages
function paintLangs() {
  $$(".langs").forEach((box) => {
    box.innerHTML = LANGS.map(([l, n]) => `<button type="button" data-l="${l}" aria-pressed="${getLang() === l}" lang="${l}">${n}</button>`).join("");
  });
}
document.addEventListener("click", (e) => { const b = e.target.closest(".langs button"); if (b) setLang(b.dataset.l); });

// ———————————————————————— hero
function paintHero() {
  $(".ht-fa").textContent = getLang() === "fa" ? "ظفر" : "Zafar";
  $(".ht-lat").innerHTML = getLang() === "fa" ? `<span lang="en">Zafar <em>Continental</em></span>` : `<em lang="en">Continental</em> · <span class="ht-f">ظفر</span>`;
  const g = me();
  const el = $("#greet");
  if (g && g.name) { el.hidden = false; el.textContent = t(g.seen && Date.now() - g.seen > 6e4 ? "hero.back" : "hero.welcome", { name: honor(g) }); requestAnimationFrame(() => el.classList.add("in")); }
  else el.hidden = true;
  const h = new Date().getHours(); const open = h >= 9;
  $("#open-dot").classList.toggle("off", !open);
  $("#open-txt").textContent = t(open ? "open.now" : "open.closed");
}

// ———————————————————————— reveal on scroll
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
const observe = (r = document) => $$(".reveal:not(.in)", r).forEach((el) => io.observe(el));

// ———————————————————————— segmented control with a sliding lens
function seg(el, items, cur, onPick) {
  el.innerHTML = `<span class="seg-lens"></span>` + items.map(([v, l]) => `<button type="button" role="tab" data-v="${v}" aria-selected="${v === cur}">${esc(l)}</button>`).join("");
  const place = () => { const b = el.querySelector('[aria-selected="true"]'); if (!b) return; el.style.setProperty("--x", `${b.offsetLeft}px`); el.style.setProperty("--w", `${b.offsetWidth}px`); };
  el.onclick = (e) => { const b = e.target.closest("button[data-v]"); if (!b) return; el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b)); place(); onPick(b.dataset.v); };
  requestAnimationFrame(place); document.fonts?.ready?.then(place); setTimeout(place, 400);
  const ro = new ResizeObserver(place); ro.observe(el); el.querySelectorAll("button").forEach((b) => ro.observe(b));
}

// ———————————————————————— menu
let menuId = "restaurant", catId = null, query = "";
function itemPrice(it) { const o = get().menu[it.id]; return o && o.p ? o.p : it.p; }
function hidden(it) { const o = get().menu[it.id]; return o && o.off; }
const L = () => getLang();
const nm = (o) => (L() === "fa" ? o.fa : L() === "tr" ? o.tr : o.en);
function paintMenu() {
  seg($("#menu-tabs"), MENU.map((m) => [m.id, L() === "fa" ? m.fa : L() === "tr" ? m.tr : m.en]), menuId, (v) => { menuId = v; catId = null; drawMenu(); scrollMenuTop(); });
  drawMenu();
}
function scrollMenuTop() { const y = $("#menu-cats").getBoundingClientRect().top + scrollY - (innerWidth < 900 ? 200 : 170); if (scrollY > y + 10) scrollTo({ top: y, behavior: "smooth" }); }
function match(it) {
  if (!query) return true;
  const s = query.toLowerCase();
  const hay = [it.fa, it.en, it.tr, it.d?.fa, it.d?.en, it.d?.tr, ...(it.opts || []).flatMap((o) => [o.fa, o.en, o.tr])].join(" ").toLowerCase();
  return hay.includes(s);
}
function drawMenu() {
  const showP = get().settings.showPrices !== false;
  $("#menu-body").classList.toggle("no-prices", !showP);
  const menus = query ? MENU : MENU.filter((m) => m.id === menuId);
  const all = menus.flatMap((m) => m.cats.map((c) => ({ ...c, items: c.items.filter((it) => !hidden(it) && match(it)) }))).filter((c) => c.items.length);
  if (!query && (!catId || !all.some((c) => c.id === catId))) catId = all[0]?.id;
  $("#menu-cats").innerHTML = query ? "" : all.map((c) => `<button type="button" data-cat="${c.id}" class="${c.id === catId ? "on" : ""}">${esc(nm(c))}<small>${digits(c.items.length)}</small></button>`).join("");
  const cats = query ? all : all.filter((c) => c.id === catId);
  if (!cats.length) { $("#menu-body").innerHTML = `<p class="menu-empty">${esc(t("menu.none"))}</p>`; return; }
  $("#menu-body").innerHTML = cats.map((c) => `<div class="mcat" id="c-${c.id}">
    <div class="mcat-h"><h3>${esc(nm(c))}</h3>${L() === "fa" ? `<span class="lat">${esc(c.en)}</span>` : ""}<small>${esc(t("menu.items", { n: digits(c.items.length) }))}</small></div>
    <div class="mgrid">${c.items.map((it) => {
      const lat = L() === "fa" && it.en && it.en !== it.fa ? `<span class="lat">${esc(it.en)}</span>` : "";
      const p = itemPrice(it);
      return `<article class="mi"><div class="mi-h"><div class="mi-n">${esc(nm(it))}${it.sig ? `<span class="sig">${esc(t("menu.sig"))}</span>` : ""}${lat}</div>${p ? `<span class="mi-dots"></span><span class="mi-p">${kprice(p)}</span>` : ""}</div>
        ${it.d && nm(it.d) ? `<p class="mi-d">${esc(nm(it.d))}</p>` : ""}
        ${it.opts ? `<ul class="mi-opts">${it.opts.map((o) => `<li><b>${esc(nm(o))}</b>${o.sig ? `<span class="sig">${esc(t("menu.sig"))}</span>` : ""}${o.d && nm(o.d) ? `<span>${esc(nm(o.d))}</span>` : ""}${o.p ? `<span class="mi-dots"></span><span class="mi-p">${kprice(o.p)}</span>` : ""}</li>`).join("")}</ul>` : ""}
      </article>`;
    }).join("")}</div></div>`).join("");
}
$("#menu-cats").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  catId = b.dataset.cat; drawMenu(); scrollMenuTop();
  const body = $("#menu-body"); body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
});
let qT; $("#msearch").addEventListener("input", (e) => { clearTimeout(qT); qT = setTimeout(() => { query = e.target.value.trim(); drawMenu(); }, 120); });

// ———————————————————————— services
function paintServices() {
  $("#svc-groups").innerHTML = GROUPS.map((g) => {
    const list = SERVICES.filter((s) => s.group === g);
    const sizes = list.length === 4 ? ["feat", "", "wide", "wide"] : list.length === 5 ? ["feat", "", "", "", ""] : list.length === 2 ? ["wide", "wide"] : list.map(() => "");
    if (list.length === 4) sizes.splice(0, 4, "feat", "", "wide", "wide");
    return `<div class="sg"><div class="sg-h reveal"><h3>${esc(t("grp." + g))}</h3></div><div class="sg-grid">${list.map((s, i) => `
      <button class="sc ${sizes[i] || ""} reveal" type="button" data-letter="${s.id}" style="transition-delay:${i * 0.07}s">
        <span class="sc-img"><img src="assets/img/${s.img}.webp" alt="" loading="lazy"></span>
        <span class="sc-n">${digits(String(i + 1).padStart(2, "0"))}</span>
        <span class="sc-body"><h4>${esc(pick(s.t))}</h4><p>${esc(pick(s.s))}</p>${s.d && sizes[i] === "feat" ? `<p style="margin-top:8px">${esc(pick(s.d))}</p>` : ""}<span class="sc-go">${esc(t("svc.req"))}<i></i></span></span>
      </button>`).join("")}</div></div>`;
  }).join("");
  observe($("#svc-groups"));
}

// ———————————————————————— chauffeur
const CAR_SVG = {
  sedan: `<svg viewBox="0 0 64 26"><path d="M4 19h56M8 19c0-3 2-5 6-5l8-6h18l9 6c5 0 9 2 9 5"/><circle cx="16" cy="20" r="3.5"/><circle cx="48" cy="20" r="3.5"/></svg>`,
  exec: `<svg viewBox="0 0 64 26"><path d="M3 19h58M6 19c0-3 2-5 7-5l9-7h20l10 7c5 0 9 2 9 5"/><path d="M24 8v6M40 8v6"/><circle cx="16" cy="20" r="3.5"/><circle cx="49" cy="20" r="3.5"/></svg>`,
  van: `<svg viewBox="0 0 64 26"><path d="M4 19h56M6 19V9c0-2 1-3 3-3h34l12 8c3 1 5 3 5 5"/><path d="M20 6v8M34 6v8M6 14h40"/><circle cx="16" cy="20" r="3.5"/><circle cx="48" cy="20" r="3.5"/></svg>`,
};
let carDir = "to", carCls = "exec";
function paintCar() {
  seg($("#car-dir"), [["to", t("car.to")], ["from", t("car.from")], ["round", t("car.round")]], carDir, (v) => { carDir = v; routeLabels(); });
  $("#cars").innerHTML = ["sedan", "exec", "van"].map((c) => `<button type="button" data-car="${c}" aria-pressed="${c === carCls}">${CAR_SVG[c]}<span>${esc(t("car." + c))}</span></button>`).join("");
  routeLabels();
}
function routeLabels() {
  const a = t("car.anywhere"), z = getLang() === "fa" ? "ظفر" : "Zafar";
  const [x, y] = carDir === "from" ? [z, a] : [a, z];
  $("#rl-a").textContent = x; $("#rl-b").textContent = carDir === "round" ? `${z} ⇄ ${a}` : y;
  $("#route").dataset.dir = carDir;
  const m = $(".rm-car animateMotion"); if (m) { m.setAttribute("keyPoints", carDir === "from" ? "1;0" : "0;1"); if (carDir === "round") { m.setAttribute("keyPoints", "0;1;0"); m.setAttribute("keyTimes", "0;.5;1"); m.setAttribute("keySplines", ".45 0 .25 1;.45 0 .25 1"); } else { m.setAttribute("keyTimes", "0;1"); m.setAttribute("keySplines", ".45 0 .25 1"); } }
}
$("#cars").addEventListener("click", (e) => { const b = e.target.closest("[data-car]"); if (!b) return; carCls = b.dataset.car; $$("#cars button").forEach((x) => x.setAttribute("aria-pressed", x === b)); });
$("#car-cta").addEventListener("click", () => openLetter("chauffeur", { dir: "car." + carDir, car: "car." + carCls, to: carDir === "to" ? (getLang() === "fa" ? "ظفر" : "Zafar") : "", from: carDir === "from" ? (getLang() === "fa" ? "ظفر" : "Zafar") : "" }));

// ———————————————————————— circle
let tier = "noir";
const PERK_I = {
  host: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/></svg>`,
  nfc: `<svg viewBox="0 0 24 24"><path d="M7 7.5c1.4 1.3 2.2 2.9 2.2 4.5S8.4 15.2 7 16.5M10.6 5.2c2 1.9 3.1 4.3 3.1 6.8s-1.1 4.9-3.1 6.8M14.2 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9"/></svg>`,
  occ: `<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M12 13.5l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/></svg>`,
  gift: `<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/></svg>`,
  dish: `<svg viewBox="0 0 24 24"><path d="M3 16h18M5 16a7 7 0 0114 0M12 6v3M10 6h4"/><path d="M2 19h20"/></svg>`,
  acc: `<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/></svg>`,
};
function paintCircle() {
  seg($("#tier-pick"), [["teal", t("tier.teal")], ["gold", t("tier.gold")], ["noir", t("tier.noir")]], tier, (v) => { tier = v; drawCard(); });
  drawCard();
  const P = [["host", "cir.p1t", "cir.p1"], ["nfc", "cir.p2t", "cir.p2"], ["acc", "cir.p6t", "cir.p6"], ["occ", "cir.p3t", "cir.p3"], ["gift", "cir.p4t", "cir.p4"], ["dish", "cir.p5t", "cir.p5"]];
  $("#perks").innerHTML = P.map(([i, a, b], k) => `<li class="reveal" style="transition-delay:${k * 0.06}s"><span class="pk-i">${PERK_I[i]}</span><h4>${esc(t(a))}</h4><p>${esc(t(b))}</p></li>`).join("");
  observe($("#perks"));
}
function drawCard() {
  const names = { teal: ["AYLAR AZIMI", "ZC-1014"], gold: ["SAHAND MILANI", "ZC-1006"], noir: ["KAMRAN RASOULI", "ZC-1001"] };
  const [n, id] = names[tier];
  $("#card-slot").innerHTML = card({ tier, name: n, id, since: Date.now() - 360 * 864e5 });
  $("#tier-line").textContent = t(`tier.${tier}P`);
  tilt($("#card-slot"));
}

// ———————————————————————— account (statement preview)
function paintAccount() {
  const F = [["acc.f1t", "acc.f1"], ["acc.f2t", "acc.f2"], ["acc.f3t", "acc.f3"], ["acc.f4t", "acc.f4"], ["acc.f5t", "acc.f5"], ["acc.f6t", "acc.f6"]];
  $("#acc-feats").innerHTML = F.map(([a, b]) => `<div class="af"><b>${esc(t(a))}</b><p>${esc(t(b))}</p></div>`).join("");
  const day = 864e5, now = Date.now();
  const rows = [
    [now - 2 * day, { fa: "شام · سالن آینه · ۴ نفر", tr: "Akşam yemeği · Aynalı salon · 4 kişi", en: "Dinner · Mirror salon · 4 guests" }, 18.4e6],
    [now - 5 * day, { fa: "راننده · فرودگاه تا ظفر", tr: "Şoför · Havalimanından Zafar'a", en: "Driver · Airport to Zafar" }, 3.6e6],
    [now - 9 * day, { fa: "سرو در منزل · ۱۴ نفر", tr: "Evde servis · 14 kişi", en: "Home serving · 14 guests" }, 96e6],
    [now - 12 * day, { fa: "جعبه‌ی هدیه · تحویل دستی", tr: "Hediye kutusu · elden", en: "Gift box · hand-delivered" }, 14.5e6],
    [now - 16 * day, { fa: "صبحانه‌ی خانوادگی", tr: "Aile kahvaltısı", en: "Family breakfast" }, 7.9e6],
  ];
  const total = rows.reduce((s, r) => s + r[2], 0);
  $("#stmt").innerHTML = `<div class="st-h">${mark()}<b>ZAFAR ACCOUNT</b><span>${esc(t("acc.stmt"))}</span></div>
    <div class="st-bal"><small>${esc(t("acc.bal"))}</small><b>${esc(mtoman(total))}</b></div>
    <ul class="st-rows">${rows.map(([ts, n, a]) => `<li><time>${esc(fdate(ts, { day: "numeric", month: "short" }))}</time><span>${esc(pick(n))}</span><b>${esc(mtoman(a))}</b></li>`).join("")}</ul>
    <div class="st-foot"><span>${esc(t("acc.due"))}</span><span class="st-sign">K. Rasouli</span></div>
    <div class="wax">${mark()}</div>`;
}

// ———————————————————————— occasion keeper (idea 29)
let occType = "occ.anniv";
function paintOcc() {
  const g = me() || {};
  const f = $("#occ-form");
  f.innerHTML = `<div class="occ-types" role="group" aria-label="${esc(t("occ.type"))}">${["occ.anniv", "occ.bday", "occ.engage", "occ.other"].map((k) => `<button type="button" data-occ="${k}" aria-pressed="${k === occType}">${esc(t(k))}</button>`).join("")}</div>
    <div class="row2"><label class="fld"><span>${esc(t("occ.whose"))}</span><input name="whose" autocomplete="off"></label><div class="fld"><span>${esc(t("occ.date"))}</span>${dateInput("date", null, "")}</div></div>
    <div class="row2"><label class="fld"><span>${esc(t("let.name"))}</span><input name="name" value="${esc(g.name || "")}" autocomplete="name"></label><label class="fld"><span>${esc(t("vis.mobile"))}</span><input name="phone" type="tel" dir="ltr" value="${esc(g.phone || "")}" autocomplete="tel" inputmode="tel"></label></div>
    <p class="let-err" id="occ-err"></p>
    <button class="btn ink" type="submit">${esc(t("occ.save"))}</button>`;
}
$("#occ-form").addEventListener("click", (e) => { const b = e.target.closest("[data-occ]"); if (!b) return; occType = b.dataset.occ; $$("[data-occ]").forEach((x) => x.setAttribute("aria-pressed", x === b)); });
$("#occ-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, v = (n) => f.elements[n].value.trim();
  const date = readDate(f, "date");
  if (!date) { $("#occ-err").textContent = t("occ.date"); return; }
  if (v("name").length < 2 || v("phone").replace(/\D/g, "").length < 8) { $("#occ-err").textContent = t("occ.need"); return; }
  const req = addRequest({ type: "occasion", title: (me() || {}).title || "m", name: v("name"), phone: v("phone"), callTime: "ct.evening", fields: { occ: occType, whose: v("whose"), date }, lang: getLang() });
  const d = get(); d.occasions.unshift({ id: `O-${d.occasions.length + 1}`, guestId: req.guestId, type: occType, whose: v("whose"), date, call: "scheduled", fromSite: true });
  setMe({ name: v("name"), phone: v("phone") });
  let call = date - 7 * 864e5; while (call < Date.now()) call += 365 * 864e5;
  f.innerHTML = `<div class="occ-done"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>${esc(t("occ.done", { date: fdate(call, { weekday: "long", day: "numeric", month: "long" }) }))}</span></div><button class="btn ghost" type="button" id="occ-again">${esc(t("let.another"))}</button>`;
  $("#occ-again").onclick = paintOcc;
  paintHero();
});

// ———————————————————————— toast
let tT; export function toast(m) { const el = $("#toast"); el.textContent = m; el.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => el.classList.remove("on"), 3200); }

// ———————————————————————— paint everything
function all() {
  paint(); paintLangs(); paintHero();
  $$(".r-n").forEach((e, i) => { e.textContent = digits(String(i + 1).padStart(2, "0")); }); paintMenu(); paintServices(); paintCar(); paintCircle(); paintAccount(); paintOcc();
  observe(); relens();
  document.title = getLang() === "fa" ? "ظفر · رستوران قاره‌ای تبریز" : "Zafar Continental · Tabriz";
}
get();
all();
initNav();
initLetter({ sent: () => { paintHero(); $("#gn-letter").classList.add("ping"); setTimeout(() => $("#gn-letter").classList.remove("ping"), 800); } });
onLang(() => { all(); retone(); });
on((db, src) => { if (src === "remote") drawMenu(); });
if (location.hash === "#letter") setTimeout(() => openLetter("visit"), 2800);
