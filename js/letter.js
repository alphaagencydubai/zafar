// The letter (idea 5): three easy steps — what about, a few details, how to reach you.
// It goes to the host's inbox in the CEO panel; the host calls; nothing is paid online.
import { t, getLang, pick, digits, fdate, honor, onLang } from "./i18n.js";
import { SERVICES, SVC, LANG_OPTS } from "./services.js";
import { mark } from "./brand.js";
import { addRequest, me, setMe } from "./data.js";
import { dateInput, readDate } from "./jalali.js";
import { ICON, brandSafe } from "./ui.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SUBJECTS = ["visit", "home", "chef", "delivery", "protocol", "ceremony", "proposal", "birthday", "business", "buyout", "giftbox", "evening", "chauffeur", "bespoke", "circle"];
const TPL = {
  intro: { fa: "من {title} {name} هستم و درباره‌ی «{svc}» برایتان می‌نویسم.", tr: "Ben {title} {name}; size “{svc}” hakkında yazıyorum.", en: "I am {title} {name}, and I am writing to you about “{svc}”." },
  call: { fa: "لطفاً با شماره‌ی {phone} تماس بگیرید؛ بهترین زمان تماس، {ct} است.", tr: "Lütfen beni {phone} numarasından arayın; bana ulaşmak için en uygun zaman: {ct}.", en: "Please call me on {phone}; the best time to reach me is {ct}." },
};
const CT = ["ct.morning", "ct.noon", "ct.afternoon", "ct.evening"];
const HEARD = ["heard.friend", "heard.ig", "heard.visit", "heard.hotel", "heard.other"];

let state = null, onSent = null, lastFocus = null;
const label = (k) => (LANG_OPTS[k] ? pick(LANG_OPTS[k]) : t(k));

export function initLetter({ sent } = {}) {
  onSent = sent;
  const sh = $("#sheet");
  sh.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeLetter(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !sh.hidden) closeLetter(); });
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-letter]"); if (b) { e.preventDefault(); openLetter(b.dataset.letter, {}, { preset: b.hasAttribute("data-preset") }); } });
  onLang(() => { if (state && !state.sent) { collect(); render(); } });
}

export function openLetter(type = "visit", prefill = {}, opts = {}) {
  const g = me() || {};
  const preset = !!SVC[type] && !opts.pick && (type !== "visit" || !!opts.preset);
  state = { type: SVC[type] ? type : "visit", picked: preset, step: preset ? 1 : 0, title: g.title || "m", name: g.name || "", phone: g.phone || "", ct: "ct.evening", heard: g.heard || "", note: "", f: { ...prefill }, memberId: g.memberId || null };
  lastFocus = document.activeElement;
  const sh = $("#sheet");
  sh.hidden = false;
  render();
  document.documentElement.style.overflow = "hidden";
  requestAnimationFrame(() => requestAnimationFrame(() => sh.classList.add("open")));
  setTimeout(() => $(".lt .x")?.focus({ preventScroll: true }), 450);
}
export function closeLetter() {
  const sh = $("#sheet");
  sh.classList.remove("open");
  document.documentElement.style.overflow = "";
  setTimeout(() => { sh.hidden = true; state = null; }, 450);
  lastFocus?.focus?.({ preventScroll: true });
}

const SUB_ICO = { visit: "table", home: "house", chef: "chef", delivery: "bag", protocol: "dish", ceremony: "ring", proposal: "star", birthday: "spark", business: "people", buyout: "key", giftbox: "gift", evening: "letter", chauffeur: "car", bespoke: "dish", circle: "acc" };
const STEPS = ["let.s1", "let.s2", "let.s3"];

function control(f) {
  const v = state.f[f.k];
  if (f.type === "date") return dateInput("f_" + f.k, v, "fi");
  if (f.type === "time") return `<input class="fi" name="f_${f.k}" type="time" value="${esc(v || "")}">`;
  if (f.type === "num") return `<div class="stepper" data-num="${f.k}" data-min="${f.min || 1}" data-max="${f.max || 99}"><button type="button" data-d="-1" aria-label="−">−</button><input class="fi" name="f_${f.k}" type="number" inputmode="numeric" min="${f.min || 1}" max="${f.max || 99}" value="${esc(v ?? "")}" placeholder="—"><button type="button" data-d="1" aria-label="+">+</button></div>`;
  if (f.type === "area") return `<textarea class="fi" name="f_${f.k}" rows="2">${esc(v || "")}</textarea>`;
  if (f.type === "choice") return `<div class="chips" data-k="${f.k}" data-mode="one">${f.opts.map((o) => `<button type="button" data-v="${o}" aria-pressed="${v === o}">${esc(label(o))}</button>`).join("")}</div>`;
  if (f.type === "checks") return `<div class="chips" data-k="${f.k}" data-mode="many">${f.opts.map((o) => `<button type="button" data-v="${o}" aria-pressed="${(v || []).includes(o)}">${esc(label(o))}</button>`).join("")}</div>`;
  if (f.type === "check") return `<div class="chips" data-k="${f.k}" data-mode="flag"><button type="button" data-v="1" aria-pressed="${!!v}">${esc(t(f.l))}</button></div>`;
  return `<input class="fi" name="f_${f.k}" type="${f.type === "tel" ? "tel" : "text"}" value="${esc(v || "")}" autocomplete="off">`;
}
const fieldBox = (f) => `<div class="lf ${["choice", "checks", "check", "area", "text"].includes(f.type) && f.k !== "guests" ? "wide" : ""}"><span class="lf-l">${f.type === "check" ? esc(t("let.extra")) : esc(t(f.l))}</span>${control(f)}</div>`;

function stepBody() {
  const s = SVC[state.type];
  if (state.step === 0) return `<h3 class="lt-q">${esc(t("let.q1"))}</h3>
    <div class="subj-grid">${SUBJECTS.map((id) => `<button type="button" class="subj" data-subj="${id}" aria-pressed="${id === state.type && state.picked}"><span class="sj-i">${ICON[SUB_ICO[id]] || ""}</span><span class="sj-t">${brandSafe(pick(SVC[id].t))}</span></button>`).join("")}</div>`;
  if (state.step === 1) return `<div class="chosen"><span class="sj-i">${ICON[SUB_ICO[state.type]] || ""}</span><div><b>${brandSafe(pick(s.t))}</b>${s.s && pick(s.s) ? `<small>${esc(pick(s.s))}</small>` : ""}</div><button type="button" class="lt-link" data-go="0">${esc(t("let.change"))}</button></div>
    <h3 class="lt-q">${esc(t("let.q2"))} <em>${esc(t("let.opt"))}</em></h3>
    <div class="lf-grid">${s.fields.map(fieldBox).join("")}
      <div class="lf wide"><span class="lf-l">${esc(t("let.msg"))}</span><textarea class="fi" name="note" rows="3" placeholder="${esc(t("let.note"))}">${esc(state.note)}</textarea></div></div>`;
  return `<h3 class="lt-q">${esc(t("let.q3"))}</h3>
    <div class="lf-grid">
      <div class="lf wide"><span class="lf-l">${esc(t("let.you"))}</span><div class="chips" data-k="__title" data-mode="one"><button type="button" data-v="m" aria-pressed="${state.title === "m"}">${esc(t("let.m"))}</button><button type="button" data-v="f" aria-pressed="${state.title === "f"}">${esc(t("let.f"))}</button></div></div>
      <label class="lf"><span class="lf-l">${esc(t("f.yourname"))}</span><input class="fi" name="name" value="${esc(state.name)}" autocomplete="name" enterkeyhint="next"></label>
      <label class="lf"><span class="lf-l">${esc(t("vis.mobile"))}</span><input class="fi" name="phone" type="tel" dir="ltr" inputmode="tel" value="${esc(state.phone)}" autocomplete="tel" placeholder="09…" enterkeyhint="send"></label>
      <div class="lf wide"><span class="lf-l">${esc(t("let.ctq"))}</span><div class="chips" data-k="__ct" data-mode="one">${CT.map((c) => `<button type="button" data-v="${c}" aria-pressed="${state.ct === c}">${esc(t(c.replace("ct.", "ctc.")))}</button>`).join("")}</div></div>
      <label class="lf wide"><span class="lf-l">${esc(t("let.heard"))} <em>${esc(t("let.opt"))}</em></span><select class="fi" name="heard"><option value="">—</option>${HEARD.map((h) => `<option value="${h}"${state.heard === h ? " selected" : ""}>${esc(t(h))}</option>`).join("")}</select></label>
    </div>
    <div class="lt-preview" id="lt-preview">${preview()}</div>`;
}
function preview() {
  const nm = state.name ? honor({ title: state.title, name: state.name }) : "…";
  return `<span class="pv-k">${esc(t("let.dear"))}</span> ${esc(t("let.pv", { name: nm, svc: pick(SVC[state.type].t) }))}`;
}

function render() {
  const st = state.step;
  $("#sheet-panel").innerHTML = `<form class="lt" novalidate>
    <header class="lt-h">${mark()}<div class="lt-ht"><b id="let-dear">${esc(t("let.title"))}</b><small>${esc(t("let.sub"))}</small></div><button class="x" type="button" data-close aria-label="${esc(t("let.close"))}"><svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13"/></svg></button></header>
    <ol class="lt-prog">${STEPS.map((k, i) => `<li class="${i < st ? "done" : i === st ? "on" : ""}"><button type="button" data-go="${i}" ${i > st ? "disabled" : ""}><i>${i < st ? "✓" : digits(i + 1)}</i><span>${esc(t(k))}</span></button></li>`).join("")}</ol>
    <div class="lt-b" id="lt-b">${stepBody()}</div>
    <p class="let-err" id="let-err" role="alert"></p>
    <footer class="lt-f">${st > 0 ? `<button class="btn ghost" type="button" data-go="${st - 1}">${esc(t("let.back"))}</button>` : `<span class="lt-safe">${esc(t("let.safe"))}</span>`}${st === 0 ? "" : st === 1 ? `<button class="btn gold" type="button" data-go="2">${esc(t("let.next"))}</button>` : `<button class="btn gold" type="submit">${ICON.letter}<span>${esc(t("let.send"))}</span></button>`}</footer>
  </form>`;
  const form = $(".lt");
  form.addEventListener("input", (e) => { e.target.classList.remove("err"); $("#let-err").textContent = ""; if (state.step === 2 && e.target.name === "name") { state.name = e.target.value.trim(); $("#lt-preview").innerHTML = preview(); } });
  form.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName === "INPUT" && state.step < 2) { e.preventDefault(); go(state.step + 1); } });
  form.addEventListener("click", (e) => {
    const sj = e.target.closest("[data-subj]");
    if (sj) { if (sj.dataset.subj !== state.type) state.f = {}; state.type = sj.dataset.subj; state.picked = true; go(1); return; }
    const g = e.target.closest("[data-go]"); if (g && !g.disabled) { go(+g.dataset.go); return; }
    const sp = e.target.closest(".stepper [data-d]");
    if (sp) { const box = sp.parentElement, inp = box.querySelector("input"); const v = Math.min(+box.dataset.max, Math.max(+box.dataset.min, (+inp.value || 0) + +sp.dataset.d)); inp.value = v; return; }
    const c = e.target.closest(".chips button");
    if (c) {
      const box = c.parentElement, k = box.dataset.k, mode = box.dataset.mode;
      if (mode === "one") { box.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === c)); if (k === "__title") { state.title = c.dataset.v; $("#lt-preview").innerHTML = preview(); } else if (k === "__ct") state.ct = c.dataset.v; else state.f[k] = c.dataset.v; }
      else if (mode === "flag") { const on = c.getAttribute("aria-pressed") !== "true"; c.setAttribute("aria-pressed", on); state.f[k] = on; }
      else { const on = c.getAttribute("aria-pressed") !== "true"; c.setAttribute("aria-pressed", on); const a = new Set(state.f[k] || []); on ? a.add(c.dataset.v) : a.delete(c.dataset.v); state.f[k] = [...a]; }
    }
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); if (state.step === 2) send(); else go(state.step + 1); });
}
function go(n) {
  collect();
  state.step = Math.max(0, Math.min(2, n));
  render();
  const b = $("#lt-b"); b.classList.add("swap");
  $("#sheet-panel").scrollTo({ top: 0 });
  if (state.step === 2) setTimeout(() => { const n = $(".lt [name=name]"); if (n && !n.value) n.focus({ preventScroll: true }); }, 60);
}

function collect() {
  const form = $(".lt"); if (!form) return;
  const el = (n) => form.querySelector(`[name="${n}"]`);
  if (el("name")) state.name = el("name").value.trim();
  if (el("phone")) state.phone = el("phone").value.trim();
  if (el("heard")) state.heard = el("heard").value;
  if (el("note")) state.note = el("note").value;
  if (state.step !== 1) return;
  SVC[state.type].fields.forEach((f) => {
    if (["choice", "checks", "check"].includes(f.type)) return;
    if (f.type === "date") { const d = readDate(form, "f_" + f.k); if (d) state.f[f.k] = d; else delete state.f[f.k]; return; }
    const x = el("f_" + f.k)?.value ?? "";
    if (x !== "") state.f[f.k] = f.type === "num" ? +x : x; else delete state.f[f.k];
  });
}

function send() {
  collect();
  const form = $(".lt");
  const bad = [];
  if (state.name.length < 2) bad.push("name");
  if (String(state.phone).replace(/\D/g, "").length < 8) bad.push("phone");
  if (bad.length) { bad.forEach((n) => form.querySelector(`[name="${n}"]`).classList.add("err")); $("#let-err").textContent = t("let.missing"); form.querySelector(`[name="${bad[0]}"]`).focus(); return; }
  const req = addRequest({ type: state.type, title: state.title, name: state.name, phone: state.phone, callTime: state.ct, heard: state.heard, note: state.note, fields: state.f, lang: getLang(), memberId: state.memberId, source: location.pathname.includes("member") ? "member" : "site" });
  setMe({ title: state.title, name: state.name, phone: state.phone, heard: state.heard });
  state.sent = req;
  const h = new Date().getHours();
  const slot = { "ct.morning": 12, "ct.noon": 15, "ct.afternoon": 19, "ct.evening": 23 }[state.ct];
  const today = h < slot - 2;
  const L = getLang();
  const ct = t(state.ct);
  const when = L === "fa" ? `${today ? "امروز" : "فردا"} ${ct}` : L === "tr" ? (today ? { "ct.morning": "bu sabah", "ct.noon": "bugün öğle saatinde", "ct.afternoon": "bugün öğleden sonra", "ct.evening": "bu akşam" } : { "ct.morning": "yarın sabah", "ct.noon": "yarın öğle saatinde", "ct.afternoon": "yarın öğleden sonra", "ct.evening": "yarın akşam" })[state.ct] : (today ? { "ct.morning": "this morning", "ct.noon": "at midday today", "ct.afternoon": "this afternoon", "ct.evening": "this evening" } : { "ct.morning": "tomorrow morning", "ct.noon": "tomorrow at midday", "ct.afternoon": "tomorrow afternoon", "ct.evening": "tomorrow evening" })[state.ct];
  $("#sheet-panel").innerHTML = `<div class="sent">
    <div class="env"><div class="env-b"></div><div class="env-p"></div><div class="env-f"></div><div class="env-s">${mark()}</div></div>
    <h3>${esc(t("let.sent"))}</h3>
    <p>${esc(t("let.sentP", { name: honor({ title: state.title, name: state.name }), time: when }))}</p>
    <div class="ref">${esc(t("let.ref"))} <span class="lat">${esc(req.id)}</span></div>
    <div class="btns"><button class="btn ink" type="button" data-again>${esc(t("let.another"))}</button><button class="btn ghost" type="button" data-close>${esc(t("let.close"))}</button></div>
  </div>`;
  $("#sheet-panel").querySelector("[data-again]").addEventListener("click", () => openLetter("visit", {}, { pick: true }));
  onSent && onSent(req);
}
