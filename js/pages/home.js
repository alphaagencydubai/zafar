// Home: the front door. Hero, the house rituals, four doors into the site, signature dishes,
// three featured services, the Etebar teaser and the letter.
import { t, getLang, pick, digits, kprice, honor } from "../i18n.js";
import { MENU } from "../menu.js";
import { SVC } from "../services.js";
import { DETAIL, FACT_L } from "../svc-detail.js";
import { mark, card, tilt } from "../brand.js";
import { get, me } from "../data.js";
import { $, esc, n2, ICON, brandSafe, arrowLink } from "../ui.js";

const nm = (o) => (getLang() === "fa" ? o.fa : getLang() === "tr" ? o.tr : o.en);
const total = () => MENU.reduce((s, m) => s + m.cats.reduce((a, c) => a + c.items.length, 0), 0);
function signatures() {
  const out = [];
  for (const m of MENU) for (const c of m.cats) for (const it of c.items) if (it.sig && it.p && out.length < 6 && !out.some((o) => o.c === c.id)) out.push({ it, c, m });
  return out;
}

export const title = () => (getLang() === "fa" ? "ظفر · رستوران قاره‌ای تبریز" : "Zafar Continental · Tabriz");

export function html() {
  const doors = [
    ["#/menu", "s_6.6", "nav.menu", "door.menu", { n: digits(total()) }],
    ["#/services", "s_1.4", "nav.services", "door.services", { n: digits(13) }],
    ["#/circle", "s_12.6", "nav.circle", "door.circle", {}],
    ["#/visit", "s_0.4", "nav.visit", "door.visit", {}],
  ];
  const feat = ["home", "chauffeur", "bespoke"];
  const showP = get().settings.showPrices !== false;
  return `
  <section class="hero" data-tone="dark">
    <div class="hero-bg" aria-hidden="true"><video class="hv" muted playsinline loop autoplay preload="auto" poster="assets/video/hero-poster.jpg"><source src="assets/video/hero.mp4" type="video/mp4"></video></div>
    <div class="hero-grain" aria-hidden="true"></div>
    <h1 class="hero-c"><span class="hero-mark">${mark()}</span><span class="hero-word" lang="en">ZAFAR</span><span class="sr">Zafar Continental · Tabriz</span></h1>
    <button class="hero-scroll" type="button" data-scroll-next aria-label="${esc(t("hero.scroll"))}"><i></i></button>
  </section>

  <section class="house sec" data-tone="dark">
    <div class="wrap">
      <div class="house-head reveal"><p class="kicker">${esc(t("house.k"))}</p><h2 class="h2">${esc(t("house.t"))}</h2><p class="lede">${esc(t("house.p"))}</p></div>
      <ol class="rituals">${[1, 2, 3].map((i) => `<li class="reveal" style="--d:${(i - 1) * 0.1}s"><span class="r-n">${n2(i)}</span><h3>${esc(t(`rit.${i}t`))}</h3><p>${esc(t(`rit.${i}p`))}</p></li>`).join("")}</ol>
    </div>
    <div class="strip" aria-hidden="true"><div class="strip-in">${["s_2.6", "s_4.6", "s_10.6", "s_12.6", "s_6.6", "s_14.2", "s_2.6", "s_4.6", "s_10.6", "s_12.6", "s_6.6", "s_14.2"].map((s) => `<img src="assets/img/${s}.webp" alt="" loading="lazy">`).join("")}</div></div>
  </section>

  <section class="doors sec" data-tone="dark">
    <div class="wrap">
      <div class="sec-head reveal"><p class="kicker">${esc(t("door.k"))}</p><h2 class="h2">${esc(t("door.t"))}</h2></div>
      <div class="door-grid">${doors.map(([href, img, k, p, v], i) => `<a class="door reveal" href="${href}" style="--d:${i * 0.08}s">
        <span class="door-img"><img src="assets/img/${img}.webp" alt="" loading="lazy"></span>
        <span class="door-n">${n2(i + 1)}</span>
        <span class="door-t">${brandSafe(t(k))}</span>
        <span class="door-p">${esc(t(p, v))}</span>
        <span class="door-go">${ICON.arrow}</span></a>`).join("")}</div>
    </div>
  </section>

  <section class="sigs sec" data-tone="light">
    <div class="wrap sig-grid">
      <div class="sig-copy reveal"><p class="kicker">${esc(t("sig.k"))}</p><h2 class="h2">${esc(t("sig.t"))}</h2><p class="lede">${esc(t("sig.p"))}</p>${arrowLink("#/menu", t("sig.all"), "dark")}</div>
      <ul class="sig-list ${showP ? "" : "no-prices"}">${signatures().map(({ it, c }, i) => `<li class="reveal" style="--d:${i * 0.05}s"><div class="sl-h"><b>${esc(nm(it))}</b><span class="mi-dots"></span>${it.p ? `<span class="mi-p">${kprice(get().menu[it.id]?.p || it.p)}</span>` : ""}</div><small>${esc(nm(c))}${it.d && nm(it.d) ? ` · ${esc(nm(it.d))}` : ""}</small></li>`).join("")}</ul>
    </div>
  </section>

  <section class="feat sec" data-tone="dark">
    <div class="wrap">
      <div class="sec-head row reveal"><div><p class="kicker">${esc(t("svc.k"))}</p><h2 class="h2">${esc(t("svc.t"))}</h2></div>${arrowLink("#/services", t("svc.all"))}</div>
      <div class="svc-grid three">${feat.map((id, i) => svcCard(id, i)).join("")}</div>
    </div>
  </section>

  <section class="teaser sec" data-tone="dark">
    <div class="wrap teaser-in">
      <div class="reveal"><p class="kicker">${brandSafe(t("cir.k"))}</p><h2 class="h2 big">${esc(t("cir.t"))}</h2><p class="lede">${brandSafe(t("cir.p"))}</p>
        <div class="ph-act"><a class="btn gold" href="#/circle"><span>${esc(t("cir.more"))}</span></a><a class="btn ghost" href="#/account"><span>${esc(t("acc.k"))}</span></a></div></div>
      <div class="teaser-card reveal"><div class="card-slot">${card({ tier: "noir", name: "KAMRAN RASOULI", id: "ZC-1001", since: Date.now() - 360 * 864e5 })}</div></div>
    </div>
  </section>

  <section class="cta sec" data-tone="dark">
    <div class="cta-in reveal"><div class="seal-big">${mark()}</div><h2 class="h2">${esc(t("cta.t"))}</h2><p class="lede">${esc(t("cta.p"))}</p><button class="btn gold" type="button" data-letter="visit">${ICON.letter}<span>${esc(t("cta.b"))}</span></button></div>
  </section>`;
}

// a service card, used on Home and on the Services index
export function svcCard(id, i = 0) {
  const s = SVC[id], d = DETAIL[id];
  return `<a class="svc-card reveal" href="#/services/${id}" style="--d:${(i % 3) * 0.07}s">
    <span class="svc-img"><img src="assets/img/${s.img}.webp" alt="" loading="lazy"></span>
    <span class="svc-body">
      <span class="svc-t">${esc(pick(s.t))}</span>
      <span class="svc-s">${esc(pick(s.s))}</span>
      <span class="svc-meta">${d ? `<span>${ICON.clock}${esc(pick(d.facts.lead))}</span><span>${ICON.people}${esc(pick(d.facts.size))}</span>` : ""}</span>
    </span>
    <span class="svc-go" aria-hidden="true">${ICON.arrow}</span>
  </a>`;
}

export function mount(root) {
  tilt(root);
  root.querySelector("[data-scroll-next]")?.addEventListener("click", () => { const n = root.querySelector(".house"); scrollTo({ top: n.getBoundingClientRect().top + scrollY, behavior: "smooth" }); });
  const vids = [...root.querySelectorAll("video")];
  vids.forEach((v) => { v.muted = true; v.playsInline = true; const p = v.play(); p && p.catch(() => {}); });
}
