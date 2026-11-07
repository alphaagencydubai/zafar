// Alpha's glass navigation, v2.
// - every width is an explicit px value (measured once, re-measured on resize / language /
//   fonts), so folding and opening are true spring animations, never auto → px jumps
// - desktop: a top capsule; scrolling down folds it to the mark and the current section's
//   name (the links crossfade out, the letter pill becomes a round button); scrolling up,
//   or a tap on the capsule, opens it again
// - phones: a thumb bar of five tabs; it folds to the current tab beside the letter button
// - a lens slides under the section you are reading; the glass tints to the section below it
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
const narrow = matchMedia("(max-width: 899px)");
let nav, caps, open, row, tabs, lens, fold, cur, word, mark, letter, chip;
let active = "home", min = false, M = null;
const rtl = () => document.documentElement.dir === "rtl";
const px = (n) => `${Math.round(n * 10) / 10}px`;

export function initNav() {
  nav = $("#gnav"); caps = $("#gn-caps"); open = $("#gn-open"); row = $("#gn-row"); tabs = $$(".gn-tab", row); lens = $(".gn-lens", row);
  fold = $("#gn-fold"); cur = $("#gn-cur"); word = $(".gn-word", caps); mark = $(".gn-mark .zmark", caps); letter = $("#gn-letter"); chip = $("#topchip");
  $$(".gn-ico", nav).forEach((i) => { i.innerHTML = ICO[i.dataset.ico]; });
  letter.addEventListener("click", () => document.querySelector('[data-letter="visit"]').click());
  caps.addEventListener("click", (e) => {
    if (min) { e.preventDefault(); e.stopPropagation(); setMin(false); return; }
    const a = e.target.closest(".gn-tab"); if (!a) return;
    e.preventDefault();
    setActive(a.dataset.sec);
    const el = $(a.getAttribute("href"));
    scrollTo({ top: a.dataset.sec === "home" ? 0 : el.getBoundingClientRect().top + scrollY, behavior: "smooth" });
  }, true);

  let lastY = scrollY, run = 0, ticking = false;
  addEventListener("scroll", () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (document.documentElement.style.overflow === "hidden") return;
    if (y < innerHeight * 0.55) { run = 0; setMin(false); chip?.classList.remove("hide"); }
    else if (dy) {
      run = Math.sign(dy) === Math.sign(run) ? run + dy : dy;
      if (run > 64) { setMin(true); chip?.classList.add("hide"); }
      else if (run < -36) { setMin(false); chip?.classList.remove("hide"); }
    }
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; spy(); retone(); }); }
  }, { passive: true });
  addEventListener("resize", () => relayout(true));
  narrow.addEventListener?.("change", () => relayout(true));
  nav.classList.add("no-anim");
  relayout(true);
  document.fonts?.ready?.then(() => relayout(true));
  requestAnimationFrame(() => requestAnimationFrame(() => { nav.classList.remove("no-anim"); nav.classList.add("ready"); }));
  spy(); retone();
}

// measure the two states once; widths only ever animate between these numbers
function measure() {
  const cs = getComputedStyle(nav);
  const H = parseFloat(cs.getPropertyValue("--h")) || 58, pad = parseFloat(cs.getPropertyValue("--pad")) || 6;
  if (narrow.matches) {
    const groupW = Math.min(innerWidth - 20, 460);
    const tw = Math.floor((groupW - H - 8 - pad * 2) / 5);
    return { narrow: true, H, pad, tw, open: tw * 5 + pad * 2, fold: tw + pad * 2 };
  }
  const padS = 18;
  const markW = mark.getBoundingClientRect().width;
  const wordW = word.offsetWidth + 11 + 12; // gap + padding-end of the mark
  const openW = padS + markW + wordW + 4 + open.offsetWidth + pad;
  cur.textContent = labelOf(active);
  const foldInset = padS + markW + 14;
  const foldW = foldInset + fold.offsetWidth + 20;
  const lab = $(".gl-l", letter);
  const letterOpen = 22 + 20 + 10 + lab.offsetWidth + 22;
  return { narrow: false, H, pad, open: openW, fold: foldW, foldInset, letterOpen };
}
const labelOf = (sec) => { const a = tabs.find((x) => x.dataset.sec === sec); return a ? a.querySelector("span").textContent : ""; };

export function relayout(remeasure = false) {
  if (!nav) return;
  if (remeasure || !M) { const was = nav.classList.contains("no-anim"); nav.classList.add("no-anim"); M = measure(); if (!was) requestAnimationFrame(() => nav.classList.remove("no-anim")); }
  if (M.narrow) {
    nav.style.setProperty("--tw", px(M.tw));
    caps.style.setProperty("--cw", px(min ? M.fold : M.open));
    nav.style.removeProperty("--lwid");
  } else {
    caps.style.setProperty("--cw", px(min ? M.fold : M.open));
    nav.style.setProperty("--lwid", px(min ? M.H : M.letterOpen));
    fold.style.insetInlineStart = px(M.foldInset);
    nav.style.setProperty("--fold-in", rtl() ? "10px" : "-10px");
    open.style.setProperty("--origin", rtl() ? "right" : "left");
  }
  place();
}

function place() {
  tabs.forEach((x) => x.setAttribute("aria-current", x.dataset.sec === active));
  const k = tabs.findIndex((x) => x.dataset.sec === active), a = tabs[k];
  if (!a) return;
  if (M && M.narrow) {
    const shift = min ? (rtl() ? k * M.tw : -k * M.tw) : 0;
    row.style.setProperty("--rx", px(shift));
    lens.style.setProperty("--lx", px(a.offsetLeft)); lens.style.setProperty("--lw", px(M.tw));
  } else {
    lens.style.setProperty("--lx", px(a.offsetLeft)); lens.style.setProperty("--lw", px(a.offsetWidth));
    if (cur.textContent !== labelOf(active)) {
      cur.textContent = labelOf(active);
      if (M) { M.fold = M.foldInset + fold.offsetWidth + 20; if (min) caps.style.setProperty("--cw", px(M.fold)); }
    }
  }
}

function setActive(sec) { if (sec === active) return; active = sec; place(); }
function spy() {
  const mid = innerHeight * 0.42;
  for (const [k, ids] of Object.entries(SECS)) for (const id of ids) {
    const el = document.getElementById(id); if (!el) continue;
    const b = el.getBoundingClientRect(); if (b.top <= mid && b.bottom > mid) { setActive(k); return; }
  }
}
function setMin(on) {
  if (on === min) return;
  min = on;
  nav.classList.toggle("min", on);
  relayout(false);
}
export const expand = () => setMin(false);

// which section is under the glass decides its tone
export function retone() {
  if (!nav) return;
  const probe = (y) => { for (const el of document.querySelectorAll("main > [data-tone], footer[data-tone]")) { const b = el.getBoundingClientRect(); if (b.top <= y && b.bottom > y) return el.dataset.tone; } return "dark"; };
  const r = caps.getBoundingClientRect();
  nav.dataset.tone = probe(r.top + r.height / 2);
  if (chip) chip.dataset.tone = probe(chip.getBoundingClientRect().top + 23);
}
export const relens = () => relayout(true);
