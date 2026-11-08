// Shared pieces for every page: helpers, icons, the page header, the segmented control,
// the reveal-on-scroll observer and the "next page" link.
import { t, getLang, digits } from "./i18n.js";
import { mark } from "./brand.js";

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const L = () => getLang();
export const n2 = (i) => digits(String(i).padStart(2, "0"));
export const zafar = () => (getLang() === "fa" ? "ظفر" : "Zafar");
// brand words stay English inside Turkish text (otherwise CSS uppercase dots the i: CİRCLE)
export const brandSafe = (s) => (getLang() === "tr" ? esc(s).replace(/(Zafar Etebar|Etebar|Continental)/g, '<span lang="en">$1</span>') : esc(s));

const I = (d, extra = "") => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
export const ICON = {
  del: I(`<path d="M9 6h11v12H9l-5.5-6z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>`),
  arrow: I(`<path d="M5 12h14M13 6l6 6-6 6"/>`, ' data-flip'),
  back: I(`<path d="M19 12H5M11 6l-6 6 6 6"/>`, ' data-flip'),
  check: I(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`),
  no: I(`<path d="M7 12h10"/>`),
  phone: I(`<path d="M6.5 3.5h3l1.5 4-2 1.2a11 11 0 005.3 5.3l1.2-2 4 1.5v3a2 2 0 01-2.2 2A16 16 0 014.5 5.7a2 2 0 012-2.2z"/>`),
  letter: I(`<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>`),
  pin: I(`<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/>`),
  clock: I(`<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`),
  people: I(`<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.5 14.2c2.3.2 4 1.8 4.8 4.8"/>`),
  hand: I(`<path d="M7 11V6.5a1.5 1.5 0 013 0V11M10 10.5V5a1.5 1.5 0 013 0v5.5M13 10.5V6.5a1.5 1.5 0 013 0V13"/><path d="M7 11l-1.3-1.3a1.6 1.6 0 00-2.3 2.3L8 16.6c1.3 1.6 3 2.4 5 2.4h.5a5 5 0 005-5V9.5a1.5 1.5 0 00-3 0"/>`),
  table: I(`<path d="M3 9h18M5 9v10M19 9v10M8 9V6.5a4 4 0 018 0V9"/>`),
  cup: I(`<path d="M5 9h11v4.5A4.5 4.5 0 0111.5 18h-2A4.5 4.5 0 015 13.5z"/><path d="M16 10.5h1.5a2.2 2.2 0 010 4.4H16M4 21h14"/><path d="M9 3.5c-.6.9.6 1.6 0 2.5M12.5 3.5c-.6.9.6 1.6 0 2.5"/>`),
  bag: I(`<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 016 0V8"/>`),
  gift: I(`<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>`),
  car: I(`<path d="M3 16.5h18M5 16.5c0-2 1-3.5 3.5-3.5l2.5-3.5h5l3 3.5c1.6.3 3 1.5 3 3.5"/><circle cx="8" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`),
  house: I(`<path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>`),
  ring: I(`<circle cx="12" cy="14.5" r="5.5"/><path d="M9.5 6l2.5-2.5L14.5 6 12 9z"/>`),
  dish: I(`<path d="M3 16h18M5 16a7 7 0 0114 0M12 6v3M10 6h4"/><path d="M2 19h20"/>`),
  chef: I(`<path d="M7 13.5V20h10v-6.5"/><path d="M7 13.5A3.5 3.5 0 016.5 6.6 4 4 0 0112 4.3a4 4 0 015.5 2.3 3.5 3.5 0 01-.5 6.9z"/><path d="M7 17h10"/>`),
  key: I(`<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2.5 2.5M14 9l2 2"/>`),
  lock: I(`<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>`),
  host: I(`<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>`),
  nfc: I(`<path d="M7 7.5c1.4 1.3 2.2 2.9 2.2 4.5S8.4 15.2 7 16.5M10.6 5.2c2 1.9 3.1 4.3 3.1 6.8s-1.1 4.9-3.1 6.8M14.2 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9"/>`),
  occ: I(`<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M12 13.5l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>`),
  acc: I(`<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>`),
  search: I(`<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>`),
  star: I(`<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8L8 13.5l-4.3-4 5.8-.7z"/>`),
  menu: I(`<path d="M4 17h16M6 17a6 6 0 0112 0M12 8.5V7M10.5 7h3"/><path d="M3 20h18"/>`),
  spark: I(`<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>`),
};

// reveal on scroll
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
export const observe = (r = document) => { $$(".reveal:not(.in)", r).forEach((el) => io.observe(el)); sweep(); };
// fallback: a fast scroll can jump over an element between frames; anything at or above the fold shows
let sw = 0;
function sweep() { sw = 0; const lim = innerHeight * 0.96; $$(".reveal:not(.in)").forEach((el) => { if (el.getBoundingClientRect().top < lim) { el.classList.add("in"); io.unobserve(el); } }); }
addEventListener("scroll", () => { if (!sw) sw = requestAnimationFrame(sweep); }, { passive: true });
addEventListener("resize", () => { if (!sw) sw = requestAnimationFrame(sweep); });

// segmented control with a sliding lens
export function seg(el, items, cur, onPick) {
  if (!el) return;
  el.classList.add("js-seg");
  el.innerHTML = `<span class="seg-lens" aria-hidden="true"></span>` + items.map(([v, l]) => `<button type="button" role="tab" data-v="${v}" aria-selected="${v === cur}">${esc(l)}</button>`).join("");
  const place = () => { const b = el.querySelector('[aria-selected="true"]'); if (!b || !b.offsetWidth) return; el.style.setProperty("--x", `${b.offsetLeft}px`); el.style.setProperty("--w", `${b.offsetWidth}px`); el.classList.add("placed"); };
  el.onclick = (e) => { const b = e.target.closest("button[data-v]"); if (!b || b.getAttribute("aria-selected") === "true") return; el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b)); place(); onPick(b.dataset.v); };
  requestAnimationFrame(place); document.fonts?.ready?.then(place);
  el._ro?.disconnect(); el._ro = new ResizeObserver(place); el._ro.observe(el);
}

// the header every inner page starts with
export function pageHead({ k, title, lede = "", tone = "dark", actions = "", aside = "", crumbs = null, cls = "" }) {
  const cr = crumbs ? `<nav class="crumbs" aria-label="breadcrumb">${crumbs.map(([href, l], i) => (i < crumbs.length - 1 ? `<a href="${href}">${esc(l)}</a><i aria-hidden="true">/</i>` : `<span aria-current="page">${esc(l)}</span>`)).join("")}</nav>` : "";
  return `<section class="ph ${aside ? "has-aside" : ""} ${cls}" data-tone="${tone}">
    <div class="ph-water" aria-hidden="true">${mark()}</div>
    <div class="wrap ph-in">
      <div class="ph-copy">${cr}<p class="kicker">${brandSafe(k)}</p><h1 class="h1">${brandSafe(title)}</h1>${lede ? `<p class="lede">${brandSafe(lede)}</p>` : ""}${actions ? `<div class="ph-act">${actions}</div>` : ""}</div>
      ${aside ? `<div class="ph-aside">${aside}</div>` : ""}
    </div>
  </section>`;
}

// the big link at the bottom of each page to the next one
const ORDER = [["/", "nav.home", "next.home"], ["/menu", "nav.menu", "next.menu"], ["/services", "nav.services", "next.services"], ["/circle", "nav.circle", "next.circle"], ["/account", "acc.k", "next.account"], ["/occasions", "occ.k", "next.occasions"], ["/visit", "nav.visit", "next.visit"]];
export function nextLink(from, tone = "dark") {
  const i = ORDER.findIndex((o) => o[0] === from);
  const [href, k, p] = ORDER[(i + 1) % ORDER.length];
  return `<section class="nextpg" data-tone="${tone}"><a class="wrap np-in" href="#${href}"><span class="np-k">${esc(t("next.k"))}</span><span class="np-t">${brandSafe(t(k))}</span><span class="np-p">${esc(t(p))}</span><span class="np-go">${ICON.arrow}</span></a></section>`;
}
export const arrowLink = (href, label, cls = "") => `<a class="tlink ${cls}" href="${href}"><span>${esc(label)}</span>${ICON.arrow}</a>`;
