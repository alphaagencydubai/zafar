// Jalali ⇄ Gregorian (after jalaali-js) and a Persian date field for the letter.
import { getLang, digits } from "./i18n.js";
const div = (a, b) => ~~(a / b), mod = (a, b) => a - ~~(a / b) * b;
function jalCal(jy) {
  const br = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let gy = jy + 621, leapJ = -14, jp = br[0], jm, jump, n, i;
  for (i = 1; i < br.length; i++) { jm = br[i]; jump = jm - jp; if (jy < jm) break; leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4); jp = jm; }
  n = jy - jp; leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4); if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150, march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4); if (leap === -1) leap = 4;
  return { leap, gy, march };
}
const g2d = (gy, gm, gd) => { let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408; return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752; };
const d2g = (jdn) => { let j = 4 * jdn + 139361631; j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908; const i = div(mod(j, 1461), 4) * 5 + 308; const gd = div(mod(i, 153), 5) + 1, gm = mod(div(i, 153), 12) + 1; return { gy: div(j, 1461) - 100100 + div(8 - gm, 6), gm, gd }; };
const j2d = (jy, jm, jd) => { const r = jalCal(jy); return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1; };
function d2j(jdn) {
  const gy = d2g(jdn).gy; let jy = gy - 621; const r = jalCal(jy); let k = jdn - g2d(gy, 3, r.march), jm, jd;
  if (k >= 0) { if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 }; k -= 186; } else { jy -= 1; k += 179; if (r.leap === 1) k += 1; }
  jm = 7 + div(k, 30); jd = mod(k, 30) + 1; return { jy, jm, jd };
}
export function toJ(ts) { const d = new Date(ts); return d2j(g2d(d.getFullYear(), d.getMonth() + 1, d.getDate())); }
export function fromJ(jy, jm, jd) { const g = d2g(j2d(jy, jm, jd)); return +new Date(g.gy, g.gm - 1, g.gd, 12); }
export const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

// a date control: three selects in Persian, the native picker otherwise
export function dateInput(name, ts, cls = "blank") {
  if (getLang() !== "fa") return `<input class="${cls}" name="${name}" type="date" value="${ts ? new Date(ts).toISOString().slice(0, 10) : ""}">`;
  const now = toJ(Date.now()), v = ts ? toJ(ts) : null;
  const opt = (val, txt, sel) => `<option value="${val}"${sel ? " selected" : ""}>${txt}</option>`;
  return `<span class="jdate" data-name="${name}">
    <select class="${cls} w-s" data-p="d" aria-label="روز">${opt("", "روز", !v)}${Array.from({ length: 31 }, (_, i) => opt(i + 1, digits(i + 1), v && v.jd === i + 1)).join("")}</select>
    <select class="${cls}" data-p="m" aria-label="ماه">${opt("", "ماه", !v)}${MONTHS.map((m, i) => opt(i + 1, m, v && v.jm === i + 1)).join("")}</select>
    <select class="${cls} w-s" data-p="y" aria-label="سال">${[now.jy, now.jy + 1].map((y) => opt(y, digits(y), v ? v.jy === y : y === now.jy)).join("")}</select>
  </span>`;
}
export function readDate(root, name) {
  const j = root.querySelector(`.jdate[data-name="${name}"]`);
  if (j) { const p = (k) => +j.querySelector(`[data-p="${k}"]`).value; if (!p("d") || !p("m")) return null; return fromJ(p("y"), p("m"), Math.min(p("d"), p("m") > 6 ? 30 : 31)); }
  const el = root.querySelector(`[name="${name}"]`); return el && el.value ? +new Date(el.value + "T12:00:00") : null;
}
