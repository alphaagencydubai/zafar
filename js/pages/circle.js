// Zafar Circle, the Zafar Account (with where each card works) and the Occasion Keeper.
import { t, getLang, pick, digits, fdate, mtoman } from "../i18n.js";
import { mark, card, tilt } from "../brand.js";
import { get, me, setMe, addRequest } from "../data.js";
import { dateInput, readDate } from "../jalali.js";
import { TIERS, TIER_ORDER, SITUATIONS, RULES, CYCLE } from "../cards.js";
import { $, $$, esc, n2, seg, ICON, pageHead, nextLink, zafar, brandSafe, arrowLink, observe } from "../ui.js";

const NAMES = { teal: ["AYLAR AZIMI", "ZC-1014"], gold: ["SAHAND MILANI", "ZC-1006"], noir: ["KAMRAN RASOULI", "ZC-1001"] };
const cardOf = (tier, cls = "") => card({ tier, name: NAMES[tier][0], id: NAMES[tier][1], since: Date.now() - 360 * 864e5, cls });
let tier = "gold";

// ———————————————————————— Circle
export const circleTitle = () => `${t("cir.k")} · ${zafar()}`;
export function circleHtml() {
  const P = [["host", "cir.p1t", "cir.p1"], ["nfc", "cir.p2t", "cir.p2"], ["acc", "cir.p6t", "cir.p6"], ["occ", "cir.p3t", "cir.p3"], ["gift", "cir.p4t", "cir.p4"], ["dish", "cir.p5t", "cir.p5"]];
  const ST = [1, 2, 3];
  return `${pageHead({ k: t("cir.k"), title: t("cir.t"), lede: t("cir.p"), tone: "dark", cls: "ph-circle",
      actions: `<button class="btn gold" type="button" data-letter="circle"><span>${esc(t("cir.req"))}</span></button><a class="btn ghost" href="member.html"><span class="nfc-i"></span><span>${esc(t("cir.tap"))}</span></a>`,
      aside: `<div class="fan" aria-hidden="true">${TIER_ORDER.map((x) => `<div class="fan-c f-${x}">${cardOf(x)}</div>`).join("")}</div>` })}
  <section class="sec perks-sec" data-tone="dark"><div class="wrap">
    <div class="sec-head reveal"><p class="kicker">${esc(t("cir.pk"))}</p><h2 class="h2">${esc(t("cir.pt"))}</h2></div>
    <ul class="perks">${P.map(([i, a, b], k) => `<li class="reveal" style="--d:${(k % 3) * 0.07}s"><span class="pk-i">${ICON[i]}</span><h3>${brandSafe(t(a))}</h3><p>${esc(t(b))}</p></li>`).join("")}</ul>
  </div></section>
  <section class="sec tiers-sec" data-tone="light"><div class="wrap">
    <div class="sec-head row reveal"><div><p class="kicker">${esc(t("tiers.k"))}</p><h2 class="h2">${esc(t("tiers.t"))}</h2></div>${arrowLink("#/account", t("tiers.where"), "dark")}</div>
    <div class="tier-cols">${TIER_ORDER.map((x, i) => { const T = TIERS[x]; return `<a class="tier-col reveal" href="#/account" data-tier-go="${x}" style="--d:${i * 0.08}s">
      <span class="tc-card">${cardOf(x)}</span>
      <b>${esc(t("tier." + x))}</b><span class="tc-who">${esc(pick(T.who))}</span><p>${esc(pick(T.line))}</p>
      <dl><div><dt>${esc(pick(RULES[0].t))}</dt><dd>${esc(T.limit ? mtoman(T.limit) : t("acc.nolimit"))}</dd></div><div><dt>${esc(pick(RULES[2].t))}</dt><dd>${esc(T.companions == null ? t("acc.free") : digits(T.companions))}</dd></div></dl>
      <span class="tc-go">${esc(t("tiers.see"))}${ICON.arrow}</span></a>`; }).join("")}</div>
  </div></section>
  <section class="sec join" data-tone="dark"><div class="wrap">
    <div class="sec-head reveal"><p class="kicker">${esc(t("join.k"))}</p><h2 class="h2">${esc(t("join.t"))}</h2></div>
    <ol class="steps three">${ST.map((i) => `<li class="reveal" style="--d:${(i - 1) * 0.08}s"><span class="st-n">${n2(i)}</span><b>${esc(t(`join.${i}t`))}</b><p>${esc(t(`join.${i}p`))}</p></li>`).join("")}</ol>
    <div class="join-cta reveal"><button class="btn gold" type="button" data-letter="circle"><span>${esc(t("cir.req"))}</span></button></div>
  </div></section>
  ${nextLink("/circle")}`;
}
export function circleMount(root) {
  tilt(root);
  root.addEventListener("click", (e) => { const a = e.target.closest("[data-tier-go]"); if (a) tier = a.dataset.tierGo; });
}

// ———————————————————————— Account
const mk = (v, say) => (v === true ? `<span class="mk yes">${ICON.check}</span>` : v === false || v == null ? `<span class="mk no">${ICON.no}${say ? `<em>${esc(t("use.inperson"))}</em>` : ""}</span>` : `<span class="mk note">${ICON.check}<em>${esc(pick(v))}</em></span>`);
const ruleVal = (x, k) => { const T = TIERS[x]; if (k === "limit") return T.limit ? mtoman(T.limit) : t("acc.nolimit"); if (k === "perCharge") return T.perCharge ? mtoman(T.perCharge) : t("acc.free"); if (k === "companions") return T.companions == null ? t("acc.free") : digits(T.companions); return pick(CYCLE[T.cycle]); };

export const accountTitle = () => `${t("acc.k")} · ${zafar()}`;
export function accountHtml() {
  const F = [1, 2, 3, 4, 5, 6];
  return `${pageHead({ k: t("acc.k"), title: t("acc.t"), lede: t("acc.p"), tone: "dark", cls: "ph-account",
      actions: `<button class="btn gold" type="button" data-letter="circle"><span>${esc(t("cir.req"))}</span></button><a class="btn ghost" href="member.html"><span class="nfc-i"></span><span>${esc(t("cir.tap"))}</span></a>`,
      aside: `<div class="stage"><div class="seg seg-dark" id="tier-pick" role="tablist" aria-label="${esc(t("tiers.k"))}"></div><div class="card-slot" id="card-slot"></div><p class="tier-line" id="tier-line"></p></div>` })}
  <section class="sec use" data-tone="dark" id="use"><div class="wrap">
    <div class="sec-head reveal"><p class="kicker">${esc(t("use.k"))}</p><h2 class="h2" id="use-t"></h2><p class="lede" id="use-p"></p></div>
    <dl class="rules reveal" id="rules"></dl>
    <ul class="sits" id="sits"></ul>
  </div></section>
  <section class="sec acc-how" data-tone="light"><div class="wrap acc-grid">
    <div class="reveal"><p class="kicker">${esc(t("acc.hk"))}</p><h2 class="h2">${esc(t("acc.ht"))}</h2><div class="acc-feats">${F.map((i) => `<div class="af"><b>${esc(t(`acc.f${i}t`))}</b><p>${esc(t(`acc.f${i}`))}</p></div>`).join("")}</div></div>
    <div class="stmt reveal">${stmt()}</div>
  </div></section>
  <section class="sec matrix-sec" data-tone="light"><div class="wrap">
    <div class="sec-head reveal"><p class="kicker">${esc(t("mx.k"))}</p><h2 class="h2">${esc(t("mx.t"))}</h2></div>
    <div class="mx-wrap reveal"><table class="mx" id="mx">
      <thead><tr><th scope="col"><span class="sr">${esc(t("mx.k"))}</span></th>${TIER_ORDER.map((x) => `<th scope="col" data-col="${x}"><span class="mx-chip tier-${x}"></span>${esc(t("tier." + x))}</th>`).join("")}</tr></thead>
      <tbody>${SITUATIONS.map((s) => `<tr><th scope="row"><span class="mx-rh"><span class="mx-i">${ICON[s.icon] || ""}</span><span>${esc(pick(s.t))}</span></span></th>${TIER_ORDER.map((x) => `<td data-col="${x}">${mk(s.v[x])}</td>`).join("")}</tr>`).join("")}</tbody>
      <tbody class="mx-rules">${RULES.map((r) => `<tr><th scope="row">${esc(pick(r.t))}</th>${TIER_ORDER.map((x) => `<td data-col="${x}">${esc(ruleVal(x, r.k))}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <p class="note mx-note">${esc(t("mx.note"))}</p>
  </div></section>
  ${nextLink("/account", "light")}`;
}
function stmt() {
  const day = 864e5, now = Date.now();
  const rows = [
    [now - 2 * day, { fa: "شام · سالن آینه · ۴ نفر", tr: "Akşam yemeği · Aynalı salon · 4 kişi", en: "Dinner · Mirror salon · 4 guests" }, 18.4e6],
    [now - 5 * day, { fa: "راننده · فرودگاه تا ظفر", tr: "Şoför · Havalimanından Zafar'a", en: "Driver · Airport to Zafar" }, 3.6e6],
    [now - 9 * day, { fa: "سرو در منزل · ۱۴ نفر", tr: "Evde servis · 14 kişi", en: "Home serving · 14 guests" }, 96e6],
    [now - 12 * day, { fa: "جعبه‌ی هدیه · تحویل دستی", tr: "Hediye kutusu · elden", en: "Gift box · hand-delivered" }, 14.5e6],
    [now - 16 * day, { fa: "صبحانه‌ی خانوادگی", tr: "Aile kahvaltısı", en: "Family breakfast" }, 7.9e6],
  ];
  const total = rows.reduce((s, r) => s + r[2], 0);
  return `<div class="st-h">${mark()}<b>ZAFAR ACCOUNT</b><span>${esc(t("acc.stmt"))}</span></div>
    <div class="st-bal"><small>${esc(t("acc.bal"))}</small><b>${esc(mtoman(total))}</b></div>
    <ul class="st-rows">${rows.map(([ts, n, a]) => `<li><time>${esc(fdate(ts, { day: "numeric", month: "short" }))}</time><span>${esc(pick(n))}</span><b>${esc(mtoman(a))}</b></li>`).join("")}</ul>
    <div class="st-foot"><span>${esc(t("acc.due"))}</span><span class="st-sign">K. Rasouli</span></div>
    <div class="wax">${mark()}</div>`;
}
function drawTier(root, animate) {
  const T = TIERS[tier];
  const slot = $("#card-slot", root);
  slot.innerHTML = cardOf(tier, animate ? "swap-in" : ""); tilt(slot);
  $("#tier-line", root).textContent = pick(T.who);
  $("#use-t", root).textContent = t("use.t", { tier: t("tier." + tier) });
  $("#use-p", root).textContent = pick(T.line);
  $("#rules", root).innerHTML = RULES.map((r) => `<div><dt>${esc(pick(r.t))}</dt><dd>${esc(ruleVal(tier, r.k))}</dd></div>`).join("");
  const order = [...SITUATIONS].sort((a, b) => (a.v[tier] === false) - (b.v[tier] === false));
  $("#sits", root).innerHTML = order.map((s, i) => { const v = s.v[tier]; return `<li class="${v === false ? "off" : ""}" style="--i:${i}"><span class="si-i">${ICON[s.icon] || ""}</span><div><b>${esc(pick(s.t))}</b><p>${esc(v === false ? t("use.no", { tier: t("tier." + upgrade(s)) }) : pick(s.how))}</p></div>${mk(v, true)}</li>`; }).join("");
  $$("#mx [data-col]", root).forEach((c) => c.classList.toggle("on", c.dataset.col === tier));
}
const upgrade = (s) => TIER_ORDER.find((x) => s.v[x] !== false) || "noir";
function tierSeg(root) { seg($("#tier-pick", root), TIER_ORDER.map((x) => [x, t("tier." + x)]), tier, (v) => { tier = v; drawTier(root, true); }); }
export function accountMount(root) {
  tierSeg(root);
  drawTier(root, false);
  $("#mx", root).addEventListener("click", (e) => { const c = e.target.closest("th[data-col]"); if (!c) return; tier = c.dataset.col; tierSeg(root); drawTier(root, true); scrollTo({ top: $(".ph-account", root).getBoundingClientRect().top + scrollY, behavior: "smooth" }); });
}

// ———————————————————————— Occasions
let occType = "occ.anniv";
export const occTitle = () => `${t("occ.k")} · ${zafar()}`;
export function occHtml() {
  return `${pageHead({ k: t("occ.k"), title: t("occ.t"), lede: t("occ.p"), tone: "light", cls: "ph-occ", aside: `<form class="occ-card" id="occ-form" novalidate></form>` })}
  <section class="sec occ-how" data-tone="light"><div class="wrap">
    <div class="sec-head reveal"><p class="kicker">${esc(t("how.k"))}</p><h2 class="h2">${esc(t("occ.ht"))}</h2></div>
    <ol class="steps three light">${[1, 2, 3].map((i) => `<li class="reveal" style="--d:${(i - 1) * 0.08}s"><span class="st-n">${n2(i)}</span><b>${esc(t(`occ.${i}t`))}</b><p>${esc(t(`occ.${i}p`))}</p></li>`).join("")}</ol>
  </div></section>
  ${nextLink("/occasions", "light")}`;
}
function occForm(root) {
  const g = me() || {};
  const f = $("#occ-form", root);
  f.innerHTML = `<p class="oc-t">${esc(t("occ.form"))}</p><div class="occ-types" role="group" aria-label="${esc(t("occ.type"))}">${["occ.anniv", "occ.bday", "occ.engage", "occ.other"].map((k) => `<button type="button" data-occ="${k}" aria-pressed="${k === occType}">${esc(t(k))}</button>`).join("")}</div>
    <div class="row2"><label class="fld"><span>${esc(t("occ.whose"))}</span><input name="whose" autocomplete="off"></label><div class="fld"><span>${esc(t("occ.date"))}</span>${dateInput("date", null, "")}</div></div>
    <div class="row2"><label class="fld"><span>${esc(t("f.yourname"))}</span><input name="name" value="${esc(g.name || "")}" autocomplete="name"></label><label class="fld"><span>${esc(t("vis.mobile"))}</span><input name="phone" type="tel" dir="ltr" value="${esc(g.phone || "")}" autocomplete="tel" inputmode="tel"></label></div>
    <p class="let-err" id="occ-err" role="alert"></p>
    <button class="btn ink wide" type="submit">${esc(t("occ.save"))}</button>`;
}
export function occMount(root) {
  occForm(root);
  const f = $("#occ-form", root);
  f.addEventListener("click", (e) => { const b = e.target.closest("[data-occ]"); if (b) { occType = b.dataset.occ; $$("[data-occ]", f).forEach((x) => x.setAttribute("aria-pressed", x === b)); } if (e.target.closest("#occ-again")) occForm(root); });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (n) => f.elements[n].value.trim();
    const date = readDate(f, "date");
    if (!date) { $("#occ-err", f).textContent = t("occ.needDate"); return; }
    if (v("name").length < 2 || v("phone").replace(/\D/g, "").length < 8) { $("#occ-err", f).textContent = t("occ.need"); return; }
    const req = addRequest({ type: "occasion", title: (me() || {}).title || "m", name: v("name"), phone: v("phone"), callTime: "ct.evening", fields: { occ: occType, whose: v("whose"), date }, lang: getLang() });
    const d = get(); d.occasions.unshift({ id: `O-${d.occasions.length + 1}`, guestId: req.guestId, type: occType, whose: v("whose"), date, call: "scheduled", fromSite: true });
    setMe({ name: v("name"), phone: v("phone") });
    let call = date - 7 * 864e5; while (call < Date.now()) call += 365 * 864e5;
    f.innerHTML = `<div class="occ-done"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>${esc(t("occ.done", { date: fdate(call, { weekday: "long", day: "numeric", month: "long" }) }))}</span></div><button class="btn ghost" type="button" id="occ-again">${esc(t("occ.again"))}</button>`;
  });
}
