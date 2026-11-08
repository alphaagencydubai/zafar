// Services: the index of all thirteen, and one page for each.
import { t, getLang, pick, digits } from "../i18n.js";
import { SERVICES, SVC, GROUPS } from "../services.js";
import { DETAIL, STEPS, FACT_L } from "../svc-detail.js";
import { SITUATIONS, TIER_ORDER } from "../cards.js";
import { MARK_PATHS } from "../brand.js";
import { openLetter } from "../letter.js";
import { $, $$, esc, n2, seg, ICON, pageHead, nextLink, zafar, arrowLink } from "../ui.js";
import { svcCard } from "./home.js";

export const LIST = SERVICES.filter((s) => s.group);
const steps = (cls = "") => `<ol class="steps ${cls}">${STEPS.map((s, i) => `<li class="reveal" style="--d:${i * 0.08}s"><span class="st-n">${n2(i + 1)}</span><b>${esc(pick(s.t))}</b><p>${esc(pick(s.d))}</p></li>`).join("")}</ol>`;

// ———————————————————————— index
export const indexTitle = () => `${t("nav.services")} · ${zafar()}`;
export function indexHtml() {
  return `${pageHead({ k: t("svc.k"), title: t("svc.t"), lede: t("svc.p"), tone: "dark", cls: "ph-svc",
      actions: `<button class="btn gold" type="button" data-letter="visit">${ICON.letter}<span>${esc(t("cta.b"))}</span></button><a class="btn ghost" href="tel:+984136661616">${ICON.phone}<span>${esc(t("vis.call"))}</span></a>`,
      aside: `<figure class="ph-arch"><img src="assets/img/s_1.4.webp" alt=""></figure>` })}
  <section class="sec how" data-tone="dark"><div class="wrap"><div class="sec-head reveal"><p class="kicker">${esc(t("how.k"))}</p><h2 class="h2">${esc(t("how.t"))}</h2></div>${steps()}</div></section>
  <section class="sec svc-index" data-tone="dark">
    <div class="wrap">
      <nav class="grp-jump reveal" aria-label="${esc(t("nav.services"))}">${GROUPS.map((g) => `<a href="#/services" data-jump="${g}">${esc(t("grp." + g))}<small>${digits(LIST.filter((s) => s.group === g).length)}</small></a>`).join("")}</nav>
      ${GROUPS.map((g) => `<div class="sg" id="g-${g}"><div class="sg-h reveal"><h2>${esc(t("grp." + g))}</h2><p>${esc(t("grp." + g + "P"))}</p></div>
        <div class="svc-grid g6" data-n="${LIST.filter((s) => s.group === g).length}">${LIST.filter((s) => s.group === g).map((s, i) => svcCard(s.id, i)).join("")}</div></div>`).join("")}
    </div>
  </section>
  ${nextLink("/services")}`;
}
const jumpTo = (root, g) => { const el = root.querySelector("#g-" + g); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - (innerWidth < 900 ? 24 : 100), behavior: "smooth" }); };
export function indexMount(root) {
  root.querySelector(".grp-jump")?.addEventListener("click", (e) => { const a = e.target.closest("[data-jump]"); if (!a) return; e.preventDefault(); jumpTo(root, a.dataset.jump); });
  const j = sessionStorage.getItem("zafar.jump"); if (j) { sessionStorage.removeItem("zafar.jump"); setTimeout(() => jumpTo(root, j), 260); }
}

// ———————————————————————— one service
const CAR_SVG = {
  sedan: `<svg viewBox="0 0 64 26"><path d="M4 19h56M8 19c0-3 2-5 6-5l8-6h18l9 6c5 0 9 2 9 5"/><circle cx="16" cy="20" r="3.5"/><circle cx="48" cy="20" r="3.5"/></svg>`,
  exec: `<svg viewBox="0 0 64 26"><path d="M3 19h58M6 19c0-3 2-5 7-5l9-7h20l10 7c5 0 9 2 9 5"/><path d="M24 8v6M40 8v6"/><circle cx="16" cy="20" r="3.5"/><circle cx="49" cy="20" r="3.5"/></svg>`,
  van: `<svg viewBox="0 0 64 26"><path d="M4 19h56M6 19V9c0-2 1-3 3-3h34l12 8c3 1 5 3 5 5"/><path d="M20 6v8M34 6v8M6 14h40"/><circle cx="16" cy="20" r="3.5"/><circle cx="48" cy="20" r="3.5"/></svg>`,
};
const GRID = Array.from({ length: 13 }, (_, i) => `<line x1="${20 + i * 40}" y1="0" x2="${20 + i * 40}" y2="300"/>`).join("") + Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${20 + i * 40}" x2="520" y2="${20 + i * 40}"/>`).join("");
let carDir = "to", carCls = "exec";
const routeWidget = () => `<div class="route" id="route">
    <div class="seg seg-dark" id="car-dir" role="tablist"></div>
    <svg class="route-map" viewBox="0 0 520 300" aria-hidden="true">
      <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#E7CF9E" stop-opacity=".2"/><stop offset=".5" stop-color="#E7CF9E"/><stop offset="1" stop-color="#E7CF9E" stop-opacity=".2"/></linearGradient></defs>
      <g class="rm-grid">${GRID}</g>
      <path id="rpath" class="rm-path" d="M70 220 C 160 60, 330 300, 450 90"/>
      <path class="rm-run" d="M70 220 C 160 60, 330 300, 450 90"/>
      <circle class="rm-car" r="7"><animateMotion dur="5.5s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .25 1"><mpath href="#rpath"/></animateMotion></circle>
      <g class="rm-pin a" transform="translate(70 220)"><circle r="16"/><circle r="5" class="c"/></g>
      <g class="rm-pin b" transform="translate(450 90)"><circle r="22"/><g transform="translate(-13 -16) scale(.04)">${MARK_PATHS}</g></g>
    </svg>
    <div class="route-l"><span id="rl-a"></span><span id="rl-b"></span></div>
    <div class="cars" id="cars">${["sedan", "exec", "van"].map((c) => `<button type="button" data-car="${c}" aria-pressed="${c === carCls}">${CAR_SVG[c]}<span>${esc(t("car." + c))}</span></button>`).join("")}</div>
    <button class="btn gold wide" type="button" id="car-cta">${ICON.letter}<span>${esc(t("car.cta"))}</span></button>
  </div>`;
function routeLabels(root) {
  const a = t("car.anywhere"), z = zafar();
  const [x, y] = carDir === "from" ? [z, a] : [a, z];
  $("#rl-a", root).textContent = x; $("#rl-b", root).textContent = carDir === "round" ? `${z} ⇄ ${a}` : y;
  const m = root.querySelector(".rm-car animateMotion"); if (!m) return;
  if (carDir === "round") { m.setAttribute("keyPoints", "0;1;0"); m.setAttribute("keyTimes", "0;.5;1"); m.setAttribute("keySplines", ".45 0 .25 1;.45 0 .25 1"); }
  else { m.setAttribute("keyPoints", carDir === "from" ? "1;0" : "0;1"); m.setAttribute("keyTimes", "0;1"); m.setAttribute("keySplines", ".45 0 .25 1"); }
}

const mk = (v) => (v === true ? `<span class="mk yes">${ICON.check}</span>` : v === false || v == null ? `<span class="mk no">${ICON.no}<em>${esc(t("use.inperson"))}</em></span>` : `<span class="mk note">${ICON.check}<em>${esc(pick(v))}</em></span>`);

export const exists = (id) => !!(SVC[id] && DETAIL[id]);
export const detailTitle = (id) => `${pick(SVC[id].t)} · ${zafar()}`;
export function detailHtml(id) {
  const s = SVC[id], d = DETAIL[id];
  const grp = s.group;
  const sit = SITUATIONS.find((x) => x.id === d.sit);
  const pool = grp ? LIST.filter((x) => x.group === grp) : LIST;
  const k = LIST.findIndex((x) => x.id === id);
  const prev = k >= 0 ? LIST[(k - 1 + LIST.length) % LIST.length] : LIST[LIST.length - 1];
  const next = k >= 0 ? LIST[(k + 1) % LIST.length] : LIST[0];
  const related = (pool.length > 1 ? pool : LIST).filter((x) => x.id !== id).slice(0, 3);
  const facts = [["lead", ICON.clock, pick(d.facts.lead)], ["size", ICON.people, pick(d.facts.size)], ["where", ICON.pin, pick(d.facts.where)], ["pay", ICON.hand, t("sd.pay")]];
  return `
  <section class="sd-head" data-tone="dark">
    <div class="wrap sd-in">
      <div class="sd-copy">
        <nav class="crumbs" aria-label="breadcrumb"><a href="#/services">${esc(t("nav.services"))}</a><i aria-hidden="true">/</i>${grp ? `<a href="#/services" data-jump-back="${grp}">${esc(t("grp." + grp))}</a><i aria-hidden="true">/</i>` : ""}<span aria-current="page">${esc(pick(s.t))}</span></nav>
        <p class="kicker">${esc(grp ? t("grp." + grp) : t("svc.k"))}</p>
        <h1 class="h1">${esc(pick(s.t))}</h1>
        <p class="lede">${esc(pick(d.intro))}</p>
        <div class="ph-act"><button class="btn gold" type="button" data-letter="${id}" data-preset>${ICON.letter}<span>${esc(t("svc.req"))}</span></button><a class="btn ghost" href="tel:+984136661616">${ICON.phone}<span>${esc(t("vis.call"))}</span></a></div>
      </div>
      <figure class="sd-arch"><img src="assets/img/${s.img}.webp" alt=""><span class="arch-line" aria-hidden="true"></span>${s.n ? `<figcaption>${esc(t("sd.idea"))} <span class="lat">${digits(s.n)}</span></figcaption>` : ""}</figure>
    </div>
    <div class="wrap"><dl class="facts">${facts.map(([k, i, v]) => `<div><dt>${i}<span>${esc(pick(FACT_L[k]))}</span></dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>
  </section>

  ${id === "chauffeur" ? `<section class="sec sd-car" data-tone="dark"><div class="wrap car-grid"><div class="reveal"><p class="kicker">${esc(t("car.k"))}</p><h2 class="h2">${esc(t("car.t"))}</h2><ul class="ticks"><li>${esc(t("car.f1"))}</li><li>${esc(t("car.f2"))}</li><li>${esc(t("car.f3"))}</li></ul></div><div class="reveal">${routeWidget()}</div></div></section>` : ""}

  <section class="sec sd-body" data-tone="light">
    <div class="wrap sd-cols">
      <div class="sd-inc reveal"><p class="kicker">${esc(t("sd.inc"))}</p><ul class="inc">${d.inc.map((x) => `<li>${ICON.check}<span>${esc(pick(x))}</span></li>`).join("")}</ul></div>
      <div class="sd-know reveal"><p class="kicker">${esc(t("sd.know"))}</p><ul class="know">${d.know.map((x) => `<li>${esc(pick(x))}</li>`).join("")}</ul>
        <div class="sd-host"><span class="sh-i">${ICON.host}</span><div><b>${esc(t("sd.host"))}</b><p>${esc(t("sd.hostP"))}</p><a class="lat" href="tel:+984136661616" dir="ltr">041 3666 1616</a></div></div>
      </div>
    </div>
    <div class="wrap"><div class="sec-head sd-steps-h reveal"><p class="kicker">${esc(t("how.k"))}</p><h2 class="h2">${esc(t("sd.how"))}</h2></div>${steps("light")}</div>
  </section>

  ${sit ? `<section class="sec sd-acc" data-tone="dark">
    <div class="wrap sd-acc-in">
      <div class="reveal"><p class="kicker">${esc(t("acc.k"))}</p><h2 class="h2">${esc(t("sd.acc"))}</h2><p class="lede">${esc(pick(sit.how))}</p>${arrowLink("#/account", t("sd.accAll"))}</div>
      <ul class="tier-ok reveal">${TIER_ORDER.map((tier) => `<li class="t-${tier}"><span class="to-card tier-${tier}"><i></i></span><b>${esc(t("tier." + tier))}</b>${mk(sit.v[tier])}</li>`).join("")}</ul>
    </div>
  </section>` : ""}

  <section class="sec sd-rel" data-tone="dark">
    <div class="wrap">
      <div class="sec-head row reveal"><div><p class="kicker">${esc(t("sd.rel"))}</p><h2 class="h2">${esc(grp ? t("grp." + grp) : t("svc.k"))}</h2></div>${arrowLink("#/services", t("svc.all"))}</div>
      <div class="svc-grid three">${related.map((x, i) => svcCard(x.id, i)).join("")}</div>
      <nav class="pn" aria-label="${esc(t("nav.services"))}">
        <a href="#/services/${prev.id}" class="pn-a prev">${ICON.back}<span><small>${esc(t("sd.prev"))}</small>${esc(pick(prev.t))}</span></a>
        <a href="#/services/${next.id}" class="pn-a next"><span><small>${esc(t("sd.next"))}</small>${esc(pick(next.t))}</span>${ICON.arrow}</a>
      </nav>
    </div>
  </section>`;
}
export function detailMount(root, id) {
  root.querySelector("[data-jump-back]")?.addEventListener("click", (e) => { e.preventDefault(); sessionStorage.setItem("zafar.jump", e.currentTarget.dataset.jumpBack); location.hash = "#/services"; });
  if (id !== "chauffeur") return;
  seg($("#car-dir", root), [["to", t("car.to")], ["from", t("car.from")], ["round", t("car.round")]], carDir, (v) => { carDir = v; routeLabels(root); });
  routeLabels(root);
  $("#cars", root).addEventListener("click", (e) => { const b = e.target.closest("[data-car]"); if (!b) return; carCls = b.dataset.car; $$("#cars button", root).forEach((x) => x.setAttribute("aria-pressed", x === b)); });
  $("#car-cta", root).addEventListener("click", () => openLetter("chauffeur", { dir: "car." + carDir, car: "car." + carCls, to: carDir === "to" ? zafar() : "", from: carDir === "from" ? zafar() : "" }));
}
