// Visit: where Zafar is and how to reach the host. Login: the door for the team and for members.
import { t, getLang, digits } from "../i18n.js";
import { mark } from "../brand.js";
import { get } from "../data.js";
import { $, $$, esc, ICON, pageHead, nextLink, zafar, arrowLink } from "../ui.js";

export const visitTitle = () => `${t("nav.visit")} · ${zafar()}`;
export function visitHtml() {
  const h = new Date().getHours(), open = h >= 9;
  return `${pageHead({ k: t("vis.k"), title: t("vis.t"), lede: t("vis.p"), tone: "dark", cls: "ph-visit",
      actions: `<a class="btn gold" href="https://neshan.org/maps/search/%D8%B1%D8%B3%D8%AA%D9%88%D8%B1%D8%A7%D9%86%20%D8%B8%D9%81%D8%B1%20%D8%AA%D8%A8%D8%B1%DB%8C%D8%B2" target="_blank" rel="noopener">${ICON.pin}<span>${esc(t("vis.neshan"))}</span></a><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=Zafar+Continental+Restaurant+Tabriz" target="_blank" rel="noopener"><span>Google Maps</span></a>`,
      aside: `<figure class="ph-arch tall"><img src="assets/img/s_0.4.webp" alt=""><span class="arch-line" aria-hidden="true"></span></figure>` })}
  <section class="sec vis-info" data-tone="dark"><div class="wrap vis-grid">
    <dl class="vis-dl reveal">
      <div><dt>${ICON.pin}${esc(t("vis.addrL"))}</dt><dd>${esc(t("vis.addr"))}</dd></div>
      <div><dt>${ICON.clock}${esc(t("vis.hours"))}</dt><dd>${esc(t("open.hours"))}<small class="open-now"><span class="open-dot ${open ? "" : "off"}"></span>${esc(t(open ? "open.now" : "open.closed"))}</small></dd></div>
      <div><dt>${ICON.phone}${esc(t("vis.phone"))}</dt><dd><a class="lat" href="tel:+984136661616" dir="ltr">041 3666 1616</a></dd></div>
      <div><dt>${ICON.phone}${esc(t("vis.mobile"))}</dt><dd><a class="lat" href="tel:+989142997695" dir="ltr">0914 299 7695</a></dd></div>
      <div><dt>${ICON.spark}${esc(t("vis.ig"))}</dt><dd><a class="lat" href="https://instagram.com/zafar_continental" target="_blank" rel="noopener" dir="ltr">@zafar_continental</a></dd></div>
    </dl>
    <div class="vis-side reveal">
      <div class="vis-card"><span class="vc-i">${ICON.car}</span><b>${esc(t("vis.carT"))}</b><p>${esc(t("vis.carP"))}</p>${arrowLink("#/services/chauffeur", t("svc.more"))}</div>
      <div class="vis-card"><span class="vc-i">${ICON.table}</span><b>${esc(t("vis.evT"))}</b><p>${esc(t("vis.evP"))}</p>${arrowLink("#/services/visit", t("svc.more"))}</div>
    </div>
  </div></section>
  <section class="cta sec" data-tone="dark"><div class="cta-in reveal"><div class="seal-big">${mark()}</div><h2 class="h2">${esc(t("cta.t"))}</h2><p class="lede">${esc(t("cta.p"))}</p><button class="btn gold" type="button" data-letter="visit">${ICON.letter}<span>${esc(t("cta.b"))}</span></button></div></section>
  ${nextLink("/visit")}`;
}

// ———————————————————————— login
export const loginTitle = () => `${t("in.t")} · ${zafar()}`;
export function loginHtml() {
  const unlocked = sessionStorage.getItem("zafar.unlocked") === "1";
  return `<section class="login" data-tone="dark">
    <div class="ph-water" aria-hidden="true">${mark()}</div>
    <div class="wrap login-in">
      <div class="login-head reveal"><p class="kicker">${esc(t("in.k"))}</p><h1 class="h1">${esc(t("in.t"))}</h1><p class="lede">${esc(t("in.p"))}</p></div>
      <div class="login-grid">
        <div class="lg-card team reveal" id="team">
          <div class="lg-top"><span class="lg-i">${ICON.lock}</span><div><b>${esc(t("in.team"))}</b><small>${esc(t("in.teamP"))}</small></div></div>
          ${unlocked ? `<div class="lg-open"><p>${esc(t("in.already"))}</p><a class="btn gold wide" href="admin.html"><span>${esc(t("in.go"))}</span></a><button class="btn ghost wide" type="button" id="lg-out"><span>${esc(t("in.out"))}</span></button></div>` : `
          <div class="pin" id="pin" aria-live="polite"><i></i><i></i><i></i><i></i></div>
          <p class="lg-msg" id="lg-msg">${esc(t("in.enter"))}</p>
          <div class="pad" id="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k) => (k === "" ? "<span></span>" : `<button type="button" data-k="${k}" ${k === "⌫" ? `aria-label="${esc(t("in.del"))}"` : ""}>${k === "⌫" ? ICON.del : digits(k)}</button>`)).join("")}</div>
          <p class="lg-hint">${esc(t("in.demo"))} <span class="lat">1234</span></p>`}
        </div>
        <div class="lg-card member reveal" style="--d:.08s">
          <div class="lg-top"><span class="lg-i">${ICON.nfc}</span><div><b>${esc(t("in.mem"))}</b><small>${esc(t("in.memP"))}</small></div></div>
          <div class="lg-tap"><div class="tap-ring"><span></span><span></span>${mark()}</div><p>${esc(t("in.tapP"))}</p></div>
          <a class="btn ghost wide" href="member.html"><span class="nfc-i"></span><span>${esc(t("in.tap"))}</span></a>
        </div>
      </div>
      <p class="login-foot reveal">${esc(t("in.foot"))}</p>
    </div>
  </section>`;
}
export function loginMount(root) {
  $("#lg-out", root)?.addEventListener("click", () => { sessionStorage.removeItem("zafar.unlocked"); dispatchEvent(new HashChangeEvent("hashchange")); });
  const pad = $("#pad", root); if (!pad) return;
  let pin = "";
  const dots = () => $$("#pin i", root).forEach((d, i) => d.classList.toggle("on", i < pin.length));
  const tryPin = () => {
    const ok = pin === String(get().settings.pin || "1234");
    if (ok) {
      sessionStorage.setItem("zafar.unlocked", "1");
      $("#pin", root).classList.add("ok"); $("#lg-msg", root).textContent = t("in.ok");
      setTimeout(() => { location.href = "admin.html"; }, 700);
    } else {
      $("#pin", root).classList.add("bad"); $("#lg-msg", root).textContent = t("in.bad");
      setTimeout(() => { $("#pin", root).classList.remove("bad"); pin = ""; dots(); }, 600);
    }
  };
  const press = (k) => { if ($("#pin", root).classList.contains("ok")) return; if (k === "⌫") pin = pin.slice(0, -1); else if (pin.length < 4) pin += k; dots(); if (pin.length === 4) setTimeout(tryPin, 160); };
  pad.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (b) press(b.dataset.k); });
  const kd = (e) => { if (/^[0-9۰-۹]$/.test(e.key)) press(String("۰۱۲۳۴۵۶۷۸۹".indexOf(e.key) >= 0 ? "۰۱۲۳۴۵۶۷۸۹".indexOf(e.key) : e.key)); else if (e.key === "Backspace") press("⌫"); };
  addEventListener("keydown", kd);
  return () => removeEventListener("keydown", kd);
}
