// Alpha's glass navigation, as on KAIRO and Conpanna:
// - a lens slides under the section you are reading, on a spring
// - scrolling down folds the capsule (desktop: to the mark and the section's
//   name; phone: to the current tab); scrolling up, or a tap, opens it again
// - over dark sections the glass darkens, over the ivory menu it turns light
import { t } from "./i18n.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ICO = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 21V11a7 7 0 0114 0v10"/><path d="M3 21h18M9.5 21v-6a2.5 2.5 0 015 0v6"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 17h16M6 17a6 6 0 0112 0M12 8.5V7M10.5 7h3"/><path d="M3 20h18"/></svg>`,
  services: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg>`,
  circle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M14.5 10c.8.6 1.2 1.3 1.2 2s-.4 1.4-1.2 2M17 8.6c1.2 1 1.9 2.2 1.9 3.4s-.7 2.4-1.9 3.4"/><rect x="6" y="10" width="4" height="3.2" rx=".8"/></svg>`,
  visit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></svg>`,
  letter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/><circle cx="12" cy="13.2" r="2.2" fill="currentColor" stroke="none"/></svg>`,
};
const SECS = { home: ["home", "house"], menu: ["menu"], services: ["services", "chauffeur"], circle: ["circle", "account", "occasions"], visit: ["write", "visit"] };
let nav, caps, row, tabs, cur, chip, active = "home", min = false;
const narrow = matchMedia("(max-width: 899px)");

export function initNav() {
  nav = $("#gnav"); caps = $("#gn-caps"); row = $("#gn-row"); tabs = $$(".gn-tab", row); chip = $("#topchip");
  $$(".gn-ico", nav).forEach((i) => { i.innerHTML = ICO[i.dataset.ico]; });
  cur = document.createElement("span"); cur.className = "gn-cur"; caps.appendChild(cur);
  $("#gn-letter").addEventListener("click", () => document.querySelector('[data-letter="visit"]').click());
  caps.addEventListener("click", (e) => {
    if (min) { e.preventDefault(); setMin(false); return; }
    const a = e.target.closest(".gn-tab"); if (!a) return;
    e.preventDefault();
    const el = $(a.getAttribute("href"));
    setActive(a.dataset.sec);
    scrollTo({ top: a.dataset.sec === "home" ? 0 : el.getBoundingClientRect().top + scrollY - (narrow.matches ? 0 : 10), behavior: "smooth" });
  }, true);
  let lastY = scrollY, run = 0, ticking = false;
  addEventListener("scroll", () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (y < innerHeight * 0.5) { run = 0; setMin(false); chip?.classList.remove("hide"); }
    else {
      run = Math.sign(dy) === Math.sign(run) ? run + dy : dy;
      if (run > 56) { setMin(true); chip?.classList.add("hide"); }
      else if (run < -30) { setMin(false); chip?.classList.remove("hide"); }
    }
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; spy(); retone(); }); }
  }, { passive: true });
  addEventListener("resize", () => { relens(); retone(); });
  new ResizeObserver(relens).observe(row);
  document.fonts?.ready?.then(relens);
  spy(); retone(); relens();
}

function setActive(sec) {
  if (sec === active) return;
  active = sec;
  tabs.forEach((x) => x.setAttribute("aria-current", x.dataset.sec === sec));
  relens();
}
function spy() {
  const mid = innerHeight * 0.42;
  for (const [k, ids] of Object.entries(SECS)) {
    for (const id of ids) { const el = document.getElementById(id); if (!el) continue; const b = el.getBoundingClientRect(); if (b.top <= mid && b.bottom > mid) { setActive(k); return; } }
  }
}
export function relens() {
  if (!tabs) return;
  tabs.forEach((x) => x.setAttribute("aria-current", x.dataset.sec === active));
  const a = tabs.find((x) => x.dataset.sec === active);
  if (!a) { nav.classList.remove("has-lens"); return; }
  nav.classList.add("has-lens");
  const rtl = document.documentElement.dir === "rtl";
  if (narrow.matches) {
    if (!min) nav.style.setProperty("--row-w", `${row.offsetWidth}px`);
    const shift = min ? (rtl ? row.offsetWidth - (a.offsetLeft + a.offsetWidth) : -a.offsetLeft) : 0;
    row.style.setProperty("--row-x", `${shift}px`);
    nav.style.setProperty("--min-w", `${a.offsetWidth}px`);
    row.style.setProperty("--lx", `${a.offsetLeft}px`); row.style.setProperty("--lw", `${a.offsetWidth}px`);
  } else {
    row.style.setProperty("--row-x", "0px");
    row.style.setProperty("--lx", `${a.offsetLeft}px`); row.style.setProperty("--lw", `${a.offsetWidth}px`);
    cur.textContent = a.querySelector("span").textContent;
    const mk = $(".gn-mark", caps).offsetWidth;
    nav.style.setProperty("--min-w", `${Math.ceil(24 + mk + cur.offsetWidth + 34)}px`);
    cur.style.insetInlineStart = `${mk + 16}px`;
  }
  const lens = $(".gn-lens", row);
  lens.style.setProperty("--lx", row.style.getPropertyValue("--lx")); lens.style.setProperty("--lw", row.style.getPropertyValue("--lw"));
}
function setMin(on) {
  if (on === min) return;
  if (on && document.documentElement.style.overflow === "hidden") return;
  min = on;
  if (narrow.matches) { caps.style.width = ""; nav.classList.toggle("min", on); relens(); return; }
  clearTimeout(setMin.t);
  if (on) { caps.style.width = `${caps.offsetWidth}px`; caps.offsetWidth; relens(); nav.classList.add("min"); }
  else {
    const from = caps.getBoundingClientRect().width;
    nav.classList.remove("min"); caps.style.width = "auto"; const to = caps.getBoundingClientRect().width;
    caps.style.width = `${from}px`; caps.offsetWidth; caps.style.width = `${to}px`;
    setMin.t = setTimeout(() => { caps.style.width = ""; }, 700);
    relens();
  }
}
// which section is under the glass decides its tone
export function retone() {
  if (!nav) return;
  const probe = (y) => { for (const el of document.querySelectorAll("[data-tone]")) { if (el === nav || el === chip) continue; const b = el.getBoundingClientRect(); if (b.top <= y && b.bottom >= y) return el.dataset.tone; } return "dark"; };
  const r = caps.getBoundingClientRect();
  const tone = probe(r.top + r.height / 2);
  nav.dataset.tone = tone;
  if (chip) chip.dataset.tone = probe(chip.getBoundingClientRect().top + 23);
}
