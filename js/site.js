// Zafar Continental — the guest site. Every page is its own route (#/menu, #/services/home …);
// pages cross-fade, the glass nav follows the route, and the letter stays one tap away.
import { t, paint, getLang, setLang, onLang, LANGS } from "./i18n.js";
import { get, on } from "./data.js";
import { initLetter, openLetter } from "./letter.js";
import { initNav, retone, relens, setActive, expand } from "./nav.js";
import { $, $$, esc, observe } from "./ui.js";
import * as Home from "./pages/home.js";
import * as Menu from "./pages/menu.js";
import * as Svc from "./pages/svc.js";
import * as Cir from "./pages/circle.js";
import * as Vis from "./pages/visit.js";

const root = document.documentElement;
const view = $("#view");

// ———————————————————————— opening
const boot = $("#boot");
const seen = sessionStorage.getItem("zafar.boot");
root.classList.add("boot-on");
const lift = () => { boot.classList.add("out"); root.classList.remove("boot-on"); root.classList.add("ready"); setTimeout(() => boot.classList.add("gone"), 1400); };
if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) { boot.classList.add("gone"); root.classList.remove("boot-on"); root.classList.add("ready"); }
else { sessionStorage.setItem("zafar.boot", "1"); setTimeout(lift, 2600); }
document.addEventListener("visibilitychange", () => { if (!document.hidden) $$("video", view).forEach((v) => { if (!(matchMedia("(max-width: 899px)").matches && v.classList.contains("hv"))) v.play()?.catch(() => {}); }); });

// ———————————————————————— languages
function paintLangs() {
  $$(".langs").forEach((box) => { box.innerHTML = LANGS.map(([l, n]) => `<button type="button" data-l="${l}" aria-pressed="${getLang() === l}" lang="${l}">${n}</button>`).join(""); });
}
document.addEventListener("click", (e) => { const b = e.target.closest(".langs button"); if (b) setLang(b.dataset.l); });

// ———————————————————————— routes
const ROUTES = [
  { re: /^\/?$/, tab: "home", page: () => ({ title: Home.title, html: Home.html, mount: Home.mount }) },
  { re: /^\/menu(?:\/(\w+))?$/, tab: "menu", page: (p) => ({ title: Menu.title, html: () => Menu.html(p), mount: Menu.mount }) },
  { re: /^\/services\/?$/, tab: "services", page: () => ({ title: Svc.indexTitle, html: Svc.indexHtml, mount: Svc.indexMount }) },
  { re: /^\/services\/([\w-]+)$/, tab: "services", page: ([id]) => (Svc.exists(id) ? { title: () => Svc.detailTitle(id), html: () => Svc.detailHtml(id), mount: (r) => Svc.detailMount(r, id), letter: id } : null) },
  { re: /^\/circle\/?$/, tab: "circle", page: () => ({ title: Cir.circleTitle, html: Cir.circleHtml, mount: Cir.circleMount, letter: "circle" }) },
  { re: /^\/account\/?$/, tab: "account", page: () => ({ title: Cir.accountTitle, html: Cir.accountHtml, mount: Cir.accountMount, letter: "circle" }) },
  { re: /^\/occasions\/?$/, tab: "circle", page: () => ({ title: Cir.occTitle, html: Cir.occHtml, mount: Cir.occMount }) },
  { re: /^\/visit\/?$/, tab: "visit", page: () => ({ title: Vis.visitTitle, html: Vis.visitHtml, mount: () => {} }) },
  { re: /^\/login\/?$/, tab: null, page: () => ({ title: Vis.loginTitle, html: Vis.loginHtml, mount: Vis.loginMount }) },
];
// links from the old one-page site keep working
const LEGACY = { home: "/", house: "/", menu: "/menu", services: "/services", chauffeur: "/services/chauffeur", circle: "/circle", account: "/account", occasions: "/occasions", write: "/visit", visit: "/visit" };
const notFound = { title: () => "404 · Zafar", html: () => `<section class="ph lost" data-tone="dark"><div class="wrap ph-in"><div class="ph-copy"><p class="kicker">404</p><h1 class="h1">${esc(t("x.lost"))}</h1><p class="lede">${esc(t("x.lostP"))}</p><div class="ph-act"><a class="btn gold" href="#/"><span>${esc(t("nav.home"))}</span></a></div></div></div></section>`, mount: () => {} };

function parse() {
  let h = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (h === "letter") return { path: "/", letter: true };
  if (!h.startsWith("/")) h = LEGACY[h] ?? "/";
  return { path: h.split("?")[0] };
}
let current = null, cleanup = null, viaLink = false, first = true;
const scrolls = new Map();
function resolve(path) {
  for (const r of ROUTES) { const m = path.match(r.re); if (m) { const pg = r.page(m.slice(1).filter(Boolean)); if (pg) return { ...pg, tab: r.tab }; } }
  return { ...notFound, tab: null };
}
function render(path, { keepY = false } = {}) {
  const pg = resolve(path);
  try { cleanup && cleanup(); } catch (e) {}
  current = { path, ...pg };
  view.innerHTML = pg.html();
  document.title = pg.title();
  root.dataset.page = path.split("/")[1] || "home";
  cleanup = pg.mount(view) || null;
  setActive(pg.tab);
  observe(view);
  paintFoot();
  if (!keepY) requestAnimationFrame(retone);
}
const instant = (y) => { root.style.scrollBehavior = "auto"; try { scrollTo({ top: y, left: 0, behavior: "instant" }); } catch (e) { scrollTo(0, y); } requestAnimationFrame(() => { root.style.scrollBehavior = ""; }); };
async function go() {
  const r = parse();
  if (current) scrolls.set(current.path, scrollY);
  const back = !viaLink && scrolls.has(r.path);
  const y = back ? scrolls.get(r.path) : 0;
  viaLink = false;
  if (first || matchMedia("(prefers-reduced-motion: reduce)").matches) { render(r.path); instant(y); first = false; }
  else {
    view.classList.add("out");
    await new Promise((res) => setTimeout(res, 200));
    render(r.path); instant(y);
    view.classList.remove("out"); view.classList.add("enter");
    setTimeout(() => view.classList.remove("enter"), 700);
  }
  expand(); retone();
  if (r.letter) setTimeout(() => openLetter("visit"), seen ? 300 : 2800);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#/"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
  const target = a.getAttribute("href").slice(1);
  if (current && target === current.path) { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); expand(); return; }
  viaLink = true;
});
addEventListener("hashchange", go);
history.scrollRestoration = "manual";

// ———————————————————————— footer + toast
function paintFoot() {
  const p = current?.path || "/";
  $$(".foot-links a").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + p));
}
let tT; export function toast(m) { const el = $("#toast"); el.textContent = m; el.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => el.classList.remove("on"), 3200); }

// ———————————————————————— start
function chrome() { paint(); paintLangs(); }
get();
chrome();
initNav({ onLetter: () => openLetter(current?.letter || "visit") });
initLetter({ sent: () => { const b = $("#gn-letter"); b.classList.add("ping"); setTimeout(() => b.classList.remove("ping"), 800); if (current?.path === "/") { const y = scrollY; render("/", { keepY: true }); instant(y); } } });
go();
onLang(() => { const y = scrollY; chrome(); render(current.path, { keepY: true }); relens(); instant(y); retone(); });
// the CEO panel changed a price or hid a dish: redraw pages that show the menu
on((db, src) => { if (src === "remote" && current && (current.path === "/" || current.path.startsWith("/menu"))) { const y = scrollY; render(current.path, { keepY: true }); instant(y); } });
