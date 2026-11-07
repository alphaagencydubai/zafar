// The menu page: one of three menus at a time, its categories as chips, a search across all.
import { t, getLang, digits, kprice } from "../i18n.js";
import { MENU } from "../menu.js";
import { get } from "../data.js";
import { mark } from "../brand.js";
import { $, $$, esc, seg, ICON, pageHead, nextLink, observe } from "../ui.js";

const nm = (o) => (getLang() === "fa" ? o.fa : getLang() === "tr" ? o.tr : o.en);
let menuId = "restaurant", catId = null, query = "";
const price = (it) => { const o = get().menu[it.id]; return o && o.p ? o.p : it.p; };
const hidden = (it) => { const o = get().menu[it.id]; return o && o.off; };
function match(it) {
  if (!query) return true;
  const s = query.toLocaleLowerCase();
  return [it.fa, it.en, it.tr, it.d?.fa, it.d?.en, it.d?.tr, ...(it.opts || []).flatMap((o) => [o.fa, o.en, o.tr])].join(" ").toLocaleLowerCase().includes(s);
}

export const title = () => `${t("nav.menu")} · ${getLang() === "fa" ? "ظفر" : "Zafar"}`;
export function html(p) {
  if (p && MENU.some((m) => m.id === p[0])) { if (menuId !== p[0]) catId = null; menuId = p[0]; }
  const count = MENU.reduce((s, m) => s + m.cats.reduce((a, c) => a + c.items.length, 0), 0);
  return `${pageHead({ k: t("menu.k"), title: t("menu.t"), lede: t("menu.lede", { n: digits(count) }), tone: "light", cls: "ph-menu",
      aside: `<figure class="ph-arch"><img src="assets/img/s_6.6.webp" alt=""></figure>` })}
  <section class="menu" data-tone="light">
    <div class="wrap">
      <div class="menu-bar" id="menu-bar">
        <div class="seg" id="menu-tabs" role="tablist" aria-label="${esc(t("nav.menu"))}"></div>
        <label class="msearch">${ICON.search}<input id="msearch" type="search" placeholder="${esc(t("menu.search"))}" value="${esc(query)}" autocomplete="off" enterkeyhint="search"></label>
      </div>
      <div class="cats" id="menu-cats" role="tablist"></div>
      <div class="menu-body" id="menu-body"></div>
      <p class="note menu-note">${esc(t("menu.note"))}</p>
      <aside class="bespoke reveal">
        <div class="bs-art">${mark()}</div>
        <div><h3>${esc(t("menu.bespoke"))}</h3><p>${esc(t("menu.bespokeP"))}</p></div>
        <div class="bs-act"><a class="btn gold" href="#/services/bespoke"><span>${esc(t("svc.more"))}</span></a></div>
      </aside>
    </div>
  </section>
  ${nextLink("/menu", "light")}`;
}

function draw(root) {
  const showP = get().settings.showPrices !== false;
  const body = $("#menu-body", root), cats = $("#menu-cats", root);
  body.classList.toggle("no-prices", !showP);
  const menus = query ? MENU : MENU.filter((m) => m.id === menuId);
  const all = menus.flatMap((m) => m.cats.map((c) => ({ ...c, items: c.items.filter((it) => !hidden(it) && match(it)) }))).filter((c) => c.items.length);
  if (!query && (!catId || !all.some((c) => c.id === catId))) catId = all[0]?.id;
  cats.innerHTML = query ? `<p class="cats-q">${esc(t("menu.found", { n: digits(all.reduce((s, c) => s + c.items.length, 0)) }))}</p>` : all.map((c) => `<button type="button" role="tab" data-cat="${c.id}" aria-selected="${c.id === catId}">${esc(nm(c))}<small>${digits(c.items.length)}</small></button>`).join("");
  const shown = query ? all : all.filter((c) => c.id === catId);
  if (!shown.length) { body.innerHTML = `<div class="menu-empty"><p>${esc(t("menu.none"))}</p><a class="btn ink" href="#/services/bespoke"><span>${esc(t("menu.bespokeB"))}</span></a></div>`; return; }
  body.innerHTML = shown.map((c) => `<div class="mcat">
    <div class="mcat-h"><h2>${esc(nm(c))}</h2>${getLang() === "fa" ? `<span class="lat">${esc(c.en)}</span>` : ""}<small>${esc(t("menu.items", { n: digits(c.items.length) }))}</small></div>
    <div class="mgrid">${c.items.map((it) => {
      const lat = getLang() === "fa" && it.en && it.en !== it.fa ? `<span class="lat">${esc(it.en)}</span>` : "";
      const p = price(it);
      return `<article class="mi"><div class="mi-h"><h3 class="mi-n">${esc(nm(it))}${it.sig ? `<span class="sig">${esc(t("menu.sig"))}</span>` : ""}${lat}</h3>${p ? `<span class="mi-dots"></span><span class="mi-p">${kprice(p)}</span>` : ""}</div>
        ${it.d && nm(it.d) ? `<p class="mi-d">${esc(nm(it.d))}</p>` : ""}
        ${it.opts ? `<ul class="mi-opts">${it.opts.map((o) => `<li><div class="mo-h"><b>${esc(nm(o))}</b>${o.sig ? `<span class="sig">${esc(t("menu.sig"))}</span>` : ""}${o.p ? `<span class="mi-dots"></span><span class="mi-p">${kprice(o.p)}</span>` : ""}</div>${o.d && nm(o.d) ? `<span class="mo-d">${esc(nm(o.d))}</span>` : ""}</li>`).join("")}</ul>` : ""}
      </article>`;
    }).join("")}</div></div>`).join("");
  // keep the chosen chip visible
  const on = cats.querySelector('[aria-selected="true"]'); if (on) { const r = on.getBoundingClientRect(), b = cats.getBoundingClientRect(); if (r.left < b.left || r.right > b.right) cats.scrollTo({ left: on.offsetLeft - b.width / 2 + r.width / 2, behavior: "smooth" }); }
}
function toTop(root) {
  const bar = $("#menu-bar", root);
  const y = $("#menu-cats", root).getBoundingClientRect().top + scrollY - bar.offsetHeight - (innerWidth < 900 ? 76 : 100);
  if (scrollY > y + 4) scrollTo({ top: y, behavior: "smooth" });
}
function swap(root) { const b = $("#menu-body", root); b.classList.remove("swap"); void b.offsetWidth; b.classList.add("swap"); }

export function mount(root) {
  seg($("#menu-tabs", root), MENU.map((m) => [m.id, nm(m)]), menuId, (v) => { menuId = v; catId = null; query = ""; $("#msearch", root).value = ""; draw(root); swap(root); toTop(root); history.replaceState(null, "", `#/menu/${v}`); });
  draw(root);
  $("#menu-cats", root).addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (!b) return; catId = b.dataset.cat; draw(root); swap(root); toTop(root); });
  let qT; $("#msearch", root).addEventListener("input", (e) => { clearTimeout(qT); qT = setTimeout(() => { query = e.target.value.trim(); draw(root); }, 140); });
  // the bar turns into glass once it sticks
  const bar = $("#menu-bar", root);
  const top = Math.ceil(parseFloat(getComputedStyle(bar).top) || 90) + 1;
  const io = new IntersectionObserver(([e]) => { const s = e.intersectionRatio < 1 && e.boundingClientRect.top < innerHeight / 2; bar.classList.toggle("stuck", s); document.documentElement.classList.toggle("bar-stuck", s); }, { threshold: [1], rootMargin: `-${top}px 0px 0px 0px` });
  io.observe(bar);
  observe(root);
  return () => { io.disconnect(); document.documentElement.classList.remove("bar-stuck"); };
}
