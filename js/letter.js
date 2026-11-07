// The letter (idea 5): a request written as a letter, with blanks to fill in.
// It goes to the host's inbox in the CEO panel; the host calls; nothing is paid online.
import { t, getLang, pick, digits, fdate, honor, onLang } from "./i18n.js";
import { SERVICES, SVC, LANG_OPTS } from "./services.js";
import { mark } from "./brand.js";
import { addRequest, me, setMe } from "./data.js";
import { dateInput, readDate } from "./jalali.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SUBJECTS = ["visit", "home", "chef", "delivery", "protocol", "ceremony", "proposal", "birthday", "business", "buyout", "giftbox", "evening", "chauffeur", "bespoke", "circle"];
const TPL = {
  intro: { fa: "من {title} {name} هستم و درباره‌ی «{svc}» برایتان می‌نویسم.", az: "Mən {title} {name}. Sizə «{svc}» barədə yazıram.", en: "I am {title} {name}, and I am writing to you about “{svc}”." },
  call: { fa: "لطفاً با شماره‌ی {phone} تماس بگیرید؛ بهترین زمان تماس، {ct} است.", az: "Zəhmət olmasa {phone} nömrəsinə zəng edin; mənə ən rahat vaxt — {ct}.", en: "Please call me on {phone}; the best time to reach me is {ct}." },
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
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-letter]"); if (b) { e.preventDefault(); openLetter(b.dataset.letter); } });
  onLang(() => { if (state && !state.sent) { collect(); render(); } });
}

export function openLetter(type = "visit", prefill = {}) {
  const g = me() || {};
  state = { type: SVC[type] ? type : "visit", title: g.title || "m", name: g.name || "", phone: g.phone || "", ct: "ct.evening", heard: g.heard || "", note: "", f: { ...prefill }, memberId: g.memberId || null };
  lastFocus = document.activeElement;
  const sh = $("#sheet");
  sh.hidden = false;
  render();
  document.documentElement.style.overflow = "hidden";
  requestAnimationFrame(() => requestAnimationFrame(() => sh.classList.add("open")));
  setTimeout(() => { const n = $(".blank[name=name]"); (n && !n.value ? n : $(".let-top .x"))?.focus({ preventScroll: true }); }, 450);
}
export function closeLetter() {
  const sh = $("#sheet");
  sh.classList.remove("open");
  document.documentElement.style.overflow = "";
  setTimeout(() => { sh.hidden = true; state = null; }, 450);
  lastFocus?.focus?.({ preventScroll: true });
}

function blank(name, val, { cls = "", type = "text", ph = "", attrs = "" } = {}) {
  return `<input class="blank ${cls}" name="${name}" type="${type}" value="${esc(val)}" placeholder="${esc(ph)}" ${attrs} autocomplete="${name === "name" ? "name" : name === "phone" ? "tel" : "off"}">`;
}
function sentence(tpl, parts) { return pick(tpl).replace(/\{(\w+)\}/g, (_, k) => parts[k] ?? ""); }

function fieldLine(f) {
  const v = state.f[f.k];
  let ctl = "";
  if (f.type === "date") ctl = dateInput("f_" + f.k, v);
  else if (f.type === "time") ctl = blank("f_" + f.k, v || "", { type: "time", cls: "w-s" });
  else if (f.type === "num") ctl = blank("f_" + f.k, v || "", { type: "number", cls: "w-s", attrs: `min="${f.min || 1}" max="${f.max || 99}" inputmode="numeric"` });
  else if (f.type === "area") ctl = `<textarea class="blank" name="f_${f.k}" rows="2">${esc(v || "")}</textarea>`;
  else if (f.type === "choice") ctl = `<div class="chips" data-k="${f.k}" data-mode="one">${f.opts.map((o) => `<button type="button" data-v="${o}" aria-pressed="${v === o}">${esc(label(o))}</button>`).join("")}</div>`;
  else if (f.type === "checks") ctl = `<div class="chips" data-k="${f.k}" data-mode="many">${f.opts.map((o) => `<button type="button" data-v="${o}" aria-pressed="${(v || []).includes(o)}">${esc(label(o))}</button>`).join("")}</div>`;
  else if (f.type === "check") ctl = `<div class="chips" data-k="${f.k}" data-mode="flag"><button type="button" data-v="1" aria-pressed="${!!v}">${esc(t(f.l))}</button></div>`;
  else ctl = blank("f_" + f.k, v || "", { type: f.type === "tel" ? "tel" : "text" });
  return `<${f.type === "date" ? "div" : "label"} class="let-line"><span>${f.type === "check" ? "" : esc(t(f.l))}</span><div>${ctl}</div></${f.type === "date" ? "div" : "label"}>`;
}

function render() {
  const s = SVC[state.type];
  const titleSel = `<select class="blank w-s" name="title"><option value="m"${state.title === "m" ? " selected" : ""}>${esc(t("let.m"))}</option><option value="f"${state.title === "f" ? " selected" : ""}>${esc(t("let.f"))}</option></select>`;
  const ctSel = `<select class="blank" name="ct">${CT.map((c) => `<option value="${c}"${state.ct === c ? " selected" : ""}>${esc(t(c))}</option>`).join("")}</select>`;
  const heardSel = `<select class="blank" name="heard"><option value=""></option>${HEARD.map((h) => `<option value="${h}"${state.heard === h ? " selected" : ""}>${esc(t(h))}</option>`).join("")}</select>`;
  $("#sheet-panel").innerHTML = `<form class="letter" novalidate>
    <div class="let-top">${mark()}<span class="lt-b">ZAFAR · ${esc(t("nav.letter")).toUpperCase()}</span><button class="x" type="button" data-close aria-label="${esc(t("let.close"))}"><svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
    <div class="let-subj" role="group" aria-label="${esc(t("let.service"))}">${SUBJECTS.map((id) => `<button type="button" data-subj="${id}" aria-pressed="${id === state.type}">${esc(pick(SVC[id].t))}</button>`).join("")}</div>
    <h2 class="let-dear" id="let-dear">${esc(t("let.dear"))}</h2>
    <p class="let-p">${sentence(TPL.intro, { title: titleSel, name: blank("name", state.name, { cls: "w-l", ph: t("let.name") }), svc: `<span class="svc">${esc(pick(s.t))}</span>` })}</p>
    ${s.s && pick(s.s) ? `<p class="let-hint">${esc(pick(s.s))}</p>` : ""}
    <div class="let-lines">${s.fields.map(fieldLine).join("")}</div>
    <p class="let-p">${sentence(TPL.call, { phone: blank("phone", state.phone, { type: "tel", cls: "w-l", ph: t("let.phone"), attrs: 'dir="ltr" inputmode="tel"' }), ct: ctSel })}</p>
    <label class="let-line"><span>${esc(t("let.heard"))}</span><div>${heardSel}</div></label>
    <textarea class="let-note" name="note" placeholder="${esc(t("let.note"))}">${esc(state.note)}</textarea>
    <div class="let-sign"><div class="ls-l">${esc(t("let.sign"))}<span class="ls-n" id="ls-n">${esc(state.name ? honor({ title: state.title, name: state.name }) : "")}</span></div>${mark("let-wm")}</div>
    <p class="let-err" id="let-err" role="alert"></p>
    <div class="let-send"><button class="btn gold" type="submit">${esc(t("let.send"))}</button></div>
    <p class="let-safe">${esc(t("rit.3p"))}</p>
  </form>`;
  const form = $(".letter");
  form.addEventListener("input", (e) => {
    if (e.target.name === "name" || e.target.name === "title") { collect(); $("#ls-n").textContent = state.name ? honor({ title: state.title, name: state.name }) : ""; }
    e.target.classList.remove("err");
  });
  form.addEventListener("click", (e) => {
    const sj = e.target.closest("[data-subj]");
    if (sj) { collect(); state.type = sj.dataset.subj; state.f = {}; render(); return; }
    const c = e.target.closest(".chips button");
    if (c) {
      const box = c.parentElement, k = box.dataset.k, mode = box.dataset.mode;
      if (mode === "one") { box.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === c)); state.f[k] = c.dataset.v; }
      else if (mode === "flag") { const on = c.getAttribute("aria-pressed") !== "true"; c.setAttribute("aria-pressed", on); state.f[k] = on; }
      else { const on = c.getAttribute("aria-pressed") !== "true"; c.setAttribute("aria-pressed", on); const a = new Set(state.f[k] || []); on ? a.add(c.dataset.v) : a.delete(c.dataset.v); state.f[k] = [...a]; }
    }
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); send(); });
}

function collect() {
  const form = $(".letter"); if (!form) return;
  const v = (n) => form.querySelector(`[name="${n}"]`)?.value ?? "";
  state.title = v("title") || state.title; state.name = v("name").trim(); state.phone = v("phone").trim(); state.ct = v("ct") || state.ct; state.heard = v("heard"); state.note = v("note");
  SVC[state.type].fields.forEach((f) => {
    if (["choice", "checks", "check"].includes(f.type)) return;
    if (f.type === "date") { const d = readDate(form, "f_" + f.k); if (d) state.f[f.k] = d; else delete state.f[f.k]; return; }
    const x = v("f_" + f.k);
    if (x !== "") state.f[f.k] = f.type === "date" ? +new Date(x + "T12:00:00") : f.type === "num" ? +x : x; else delete state.f[f.k];
  });
}

function send() {
  collect();
  const form = $(".letter");
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
  const when = L === "fa" ? `${today ? "امروز" : "فردا"} ${ct}` : L === "az" ? `${today ? "bu gün" : "sabah"} ${ct}` : (today ? { "ct.morning": "this morning", "ct.noon": "at midday today", "ct.afternoon": "this afternoon", "ct.evening": "this evening" } : { "ct.morning": "tomorrow morning", "ct.noon": "tomorrow at midday", "ct.afternoon": "tomorrow afternoon", "ct.evening": "tomorrow evening" })[state.ct];
  $("#sheet-panel").innerHTML = `<div class="sent">
    <div class="env"><div class="env-b"></div><div class="env-p"></div><div class="env-f"></div><div class="env-s">${mark()}</div></div>
    <h3>${esc(t("let.sent"))}</h3>
    <p>${esc(t("let.sentP", { name: honor({ title: state.title, name: state.name }), time: when }))}</p>
    <div class="ref">${esc(t("let.ref"))} <span class="lat">${esc(req.id)}</span></div>
    <div class="btns"><button class="btn ink" type="button" data-again>${esc(t("let.another"))}</button><button class="btn ghost" type="button" data-close>${esc(t("let.close"))}</button></div>
  </div>`;
  $("#sheet-panel").querySelector("[data-again]").addEventListener("click", () => openLetter("visit"));
  onSent && onSent(req);
}
