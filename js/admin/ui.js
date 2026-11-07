// Shared panel helpers: lookups, drawer, modal, toast, re-render.
import { get, save, audit } from "../data.js";
import { esc, fa } from "./kit.js";
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const db = () => get();
export const guest = (id) => db().guests.find((g) => g.id === id);
export const member = (id) => db().members.find((x) => x.id === id);
export const staff = (id) => db().staff.find((s) => s.id === id);
export const memberOf = (g) => (g && g.memberId ? member(g.memberId) : null);
export const honorFa = (g) => (g ? `${g.title === "f" ? "خانم" : "آقای"} ${g.name}` : "");
export const ROLES = { host: "میزبان", chef: "سرآشپز", driver: "راننده", maitre: "سرپیشخدمت", waiter: "پیشخدمت", pastry: "شیرینی‌پز", barista: "باریستا", manager: "مدیر سالن" };
export const TIER = { teal: "فیروزه", gold: "طلایی", noir: "نوآر" };
export const TYPE = { visit: "دیدار با ظفر", home: "سرو VIP در منزل", chef: "سرآشپز مقیم", delivery: "تحویل دستی", protocol: "تشریفات میز", ceremony: "خواستگاری / بله‌برون / عقد", proposal: "درخواست ازدواج", birthday: "تولد غافلگیرانه", business: "شام کاری و هیئت", buyout: "اجاره‌ی کامل ظفر", giftbox: "جعبه‌ی هدیه", evening: "هدیه‌ی یک شب", chauffeur: "راننده‌ی اختصاصی", bespoke: "غذای اختصاصی", circle: "معرفی به حلقه", occasion: "سپردن مناسبت" };
export const STATUS = { new: ["نامه‌ی تازه", "gold"], called: ["تماس گرفته شد", "blue"], confirmed: ["تأیید شد", "green"], done: ["انجام شد", "mute"], declined: ["ممکن نشد", "red"] };
export const CAT = { dining: "پذیرایی", home: "سرو در منزل", chauffeur: "راننده", gift: "هدیه", event: "مراسم", bespoke: "غذای اختصاصی", settle: "تسویه" };
export const METHOD = { pos: "کارتخوان", cash: "نقد", transfer: "حواله" };
export const OCC = { "occ.bday": "تولد", "occ.anniv": "سالگرد ازدواج", "occ.engage": "سالگرد نامزدی", "occ.other": "روز خاص" };
export const LBL = { "f.khast": "خواستگاری", "f.baleh": "بله‌برون", "f.aghd": "عقد", "f.atZafar": "در ظفر", "f.atHome": "در منزل", "f.atOffice": "در دفتر", "car.to": "به ظفر", "car.from": "از ظفر", "car.round": "رفت و برگشت", "car.sedan": "سدان", "car.exec": "اجرایی", "car.van": "ون", "f.flowers": "گل", "f.music": "نوازنده", "f.photo": "عکاس", "f.ring": "حلقه در دسر", "lang.fa": "فارسی", "lang.en": "انگلیسی", "lang.tr": "ترکی", "lang.ar": "عربی", "ct.morning": "صبح", "ct.noon": "ظهر", "ct.afternoon": "عصر", "ct.evening": "شب", "heard.friend": "معرفی دوست", "heard.ig": "اینستاگرام", "heard.visit": "مهمان قبلی", "heard.hotel": "هتل / کنسیرژ", "heard.other": "راه دیگر", ...OCC };
export const lbl = (k) => LBL[k] || k;

export function balance(mid) {
  const tx = db().tx.filter((x) => x.memberId === mid).sort((a, b) => b.ts - a.ts);
  const last = tx.find((x) => x.kind === "settle");
  const cur = tx.filter((x) => x.kind === "charge" && (!last || x.ts > last.ts));
  const bal = cur.reduce((s, x) => s + x.amount, 0);
  const start = last ? last.ts : member(mid)?.since || Date.now();
  return { bal, cur, last, start, due: start + 34 * 864e5, tx };
}

let rerender = () => {};
export const setRerender = (f) => { rerender = f; };
export function commit(by, text) { if (text) audit(by || "CEO", text); save(); rerender(); }

// drawer (details) and modal (forms)
export function drawer(html, { wide = false } = {}) {
  const d = $("#drawer"); d.querySelector(".dw-in").innerHTML = html; d.classList.toggle("wide", wide);
  d.hidden = false; requestAnimationFrame(() => d.classList.add("open"));
}
export function closeDrawer() { const d = $("#drawer"); d.classList.remove("open"); setTimeout(() => { d.hidden = true; }, 350); }
export function modal(title, body, { ok = "ثبت", onOk = null, cls = "" } = {}) {
  const md = $("#modal");
  md.querySelector(".md-in").className = `md-in ${cls}`;
  md.querySelector(".md-in").innerHTML = `<div class="md-h"><h3>${title}</h3><button class="x" type="button" data-mclose aria-label="بستن">×</button></div><form class="md-b" novalidate>${body}<div class="md-f"><button class="b" type="button" data-mclose>انصراف</button>${onOk ? `<button class="b gold" type="submit">${ok}</button>` : ""}</div></form>`;
  md.hidden = false; requestAnimationFrame(() => md.classList.add("open"));
  const f = md.querySelector("form");
  f.onsubmit = (e) => { e.preventDefault(); if (onOk && onOk(f) !== false) closeModal(); };
  setTimeout(() => f.querySelector("input,select,textarea")?.focus(), 200);
  return f;
}
export function closeModal() { const md = $("#modal"); md.classList.remove("open"); setTimeout(() => { md.hidden = true; }, 300); }
let tt;
export function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("on"), 2800); }
export const opt = (pairs, cur) => pairs.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur) ? " selected" : ""}>${esc(l)}</option>`).join("");
export const field = (label, ctl) => `<label class="ff"><span>${label}</span>${ctl}</label>`;
export const money = (s) => +String(s).replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)).replace(/[^\d.]/g, "") || 0;
export const faNum = fa;
