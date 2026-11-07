// Pieces the CEO panel is built from: Persian numbers and dates, KPI tiles,
// sortable tables, pills, and a handful of SVG charts (RTL-aware).
export const DAY = 864e5;
const FD = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (s) => String(s).replace(/[0-9]/g, (c) => FD[c]);
export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const n = (x) => fa(Math.round(x).toLocaleString("en-US")).replace(/,/g, "٬");
export const pct = (x) => fa(Math.round(x)) + "٪";
export const d1 = (x) => fa((Math.round(x * 10) / 10).toString()).replace(".", "٫");
export function m(x) { // money, compact
  const a = Math.abs(x), s = x < 0 ? "−" : "";
  if (a >= 1e9) return s + d1(a / 1e9) + " میلیارد";
  if (a >= 1e6) return s + d1(a / 1e6) + " میلیون";
  if (a >= 1e3) return s + n(a / 1e3) + " هزار";
  return s + n(a);
}
export const T = (x) => `${m(x)}<small> تومان</small>`;
const F = (o) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", o);
export const date = (t) => F({ day: "numeric", month: "long" }).format(t);
export const dateY = (t) => F({ day: "numeric", month: "long", year: "numeric" }).format(t);
export const dshort = (t) => F({ day: "numeric", month: "short" }).format(t);
export const wday = (t) => F({ weekday: "long" }).format(t);
export const time = (t) => F({ hour: "2-digit", minute: "2-digit", hour12: false }).format(t);
export const dt = (t) => `${date(t)}، ${time(t)}`;
export function ago(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "همین حالا"; if (s < 3600) return `${fa(Math.floor(s / 60))} دقیقه پیش`;
  if (s < 86400) return `${fa(Math.floor(s / 3600))} ساعت پیش`; if (s < 86400 * 7) return `${fa(Math.floor(s / 86400))} روز پیش`;
  return date(t);
}
export function until(t) { const dd = Math.round((t - Date.now()) / DAY); return dd === 0 ? "امروز" : dd === 1 ? "فردا" : dd > 0 ? `${fa(dd)} روز دیگر` : dd === -1 ? "دیروز" : `${fa(-dd)} روز پیش`; }
export const sum = (a, f = (x) => x) => a.reduce((s, x) => s + f(x), 0);
export const startOfDay = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; };

export const kpi = (label, value, sub = "", delta = "", cls = "") => `<div class="kpi ${cls}"><span>${label}</span><b>${value}</b>${delta}${sub ? `<em>${sub}</em>` : ""}</div>`;
export function delta(a, b, inv = false) { if (!b) return ""; const d = Math.round(((a - b) / b) * 100); const good = inv ? d <= 0 : d >= 0; return `<span class="delta ${good ? "up" : "down"}">${d >= 0 ? "▲" : "▼"} ${pct(Math.abs(d))}</span>`; }
export const card = (title, body, { extra = "", cls = "", id = "" } = {}) => `<section class="card ${cls}"${id ? ` id="${id}"` : ""}><div class="card-h"><h3>${title}</h3>${extra}</div>${body}</section>`;
export const pill = (t, k = "") => `<span class="pill ${k}">${t}</span>`;
export const empty = (t) => `<p class="empty">${t}</p>`;
export const btn = (t, attrs = "", k = "") => `<button type="button" class="b ${k}" ${attrs}>${t}</button>`;
export const meter = (p, k = "") => `<span class="mtr ${k}"><i style="--p:${Math.max(0, Math.min(1, p)).toFixed(3)}"></i></span>`;
export const avatar = (name, cls = "") => `<span class="av ${cls}">${esc(String(name || "؟").replace(/^(آقای|خانم|سرآشپز|مدیر سالن:)\s*/, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("‌"))}</span>`;

// sortable table: head = [label | {l, sort:true}], rows = [[cells...]], each cell may be {v, s} (s = sort key)
let tid = 0;
export function table(head, rows, { cls = "", foot = null, rowAttr = null } = {}) {
  const id = "t" + ++tid;
  return `<div class="tbl-wrap"><table class="tbl ${cls}" id="${id}"><thead><tr>${head.map((h, i) => `<th data-i="${i}">${typeof h === "string" ? h : h.l}</th>`).join("")}</tr></thead><tbody>${rows.map((r, ri) => `<tr ${rowAttr ? rowAttr(ri) : ""}>${r.map((c) => (c && typeof c === "object" && "v" in c ? `<td data-s="${esc(c.s)}">${c.v}</td>` : `<td>${c ?? ""}</td>`)).join("")}</tr>`).join("")}</tbody>${foot ? `<tfoot><tr>${foot.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr></tfoot>` : ""}</table></div>`;
}
document.addEventListener("click", (e) => {
  const th = e.target.closest(".tbl th"); if (!th) return;
  const tb = th.closest("table"), i = +th.dataset.i, body = tb.tBodies[0];
  const dir = th.dataset.dir === "asc" ? "desc" : "asc";
  tb.querySelectorAll("th").forEach((x) => delete x.dataset.dir); th.dataset.dir = dir;
  const key = (tr) => { const td = tr.children[i]; const s = td?.dataset.s ?? td?.textContent.replace(/[۰-۹]/g, (c) => FD.indexOf(c)).replace(/[٬,]/g, ""); const x = parseFloat(s); return isNaN(x) ? s : x; };
  [...body.rows].sort((a, b) => { const x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : 0) * (dir === "asc" ? 1 : -1); }).forEach((r) => body.appendChild(r));
});

// lines: [{vals, label, cls}], first gets an area
export function lines(series, labels, { h = 240, fmt = m, unit = " تومان" } = {}) {
  const w = 1000, pad = 30, all = series.flatMap((s) => s.vals), max = Math.max(...all, 1) * 1.12, N = Math.max(...series.map((s) => s.vals.length));
  const x = (i) => w - (pad + (i * (w - pad * 2)) / Math.max(1, N - 1)), y = (v) => h - 26 - (v / max) * (h - 46);
  const path = (vals) => vals.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join("");
  const s0 = series[0], every = Math.ceil(N / 10), bw = (w - pad * 2) / Math.max(1, N - 1);
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img"><defs><linearGradient id="lg${tid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--gold)" stop-opacity=".35"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></linearGradient></defs>
    ${[0.25, 0.5, 0.75, 1].map((f) => `<line x1="${pad}" x2="${w - pad}" y1="${y((max * f) / 1.12)}" y2="${y((max * f) / 1.12)}" class="grid"/><text x="${w - 4}" y="${y((max * f) / 1.12) - 6}" class="ax" text-anchor="end" direction="ltr">${fmt((max * f) / 1.12)}</text>`).join("")}
    <path d="${path(s0.vals)}L${x(s0.vals.length - 1)} ${h - 26}L${x(0)} ${h - 26}Z" fill="url(#lg${tid})"/>
    ${series.slice(1).map((s) => `<path d="${path(s.vals)}" class="ln2 ${s.cls || ""}"/>`).join("")}
    <path d="${path(s0.vals)}" class="ln"/>
    ${s0.vals.map((v, i) => `<rect class="hit" x="${(x(i) - bw / 2).toFixed(1)}" y="0" width="${bw.toFixed(1)}" height="${h - 26}" data-tip="${esc(labels[i])}\n${esc(s0.label || "")}: ${esc(fmt(v))}${unit}${series[1] ? `\n${esc(series[1].label)}: ${esc(fmt(series[1].vals[i] ?? 0))}${unit}` : ""}"/>`).join("")}
    ${labels.map((l, i) => ((N - 1 - i) % every === 0 ? `<text x="${x(i)}" y="${h - 6}" text-anchor="middle" class="ax">${l}</text>` : "")).join("")}
  </svg>${series.length > 1 ? `<div class="legend">${series.map((s, i) => `<span><i class="${i ? "l2 " + (s.cls || "") : "l1"}"></i>${s.label}</span>`).join("")}</div>` : ""}`;
}
// horizontal bars: [{l, v, c}]
export function hbars(items, { fmt = m, unit = "" } = {}) {
  const max = Math.max(...items.map((i) => i.v), 1);
  return `<div class="hbars">${items.map((i) => `<div class="hb" data-tip="${esc(i.l)}: ${esc(fmt(i.v))}${unit}"><span>${i.l}</span><i style="--v:${(i.v / max).toFixed(3)};--c:${i.c || "var(--gold)"}"></i><b>${fmt(i.v)}</b></div>`).join("")}</div>`;
}
// vertical bars
export function vbars(vals, labels, { h = 160, fmt = m, c = "var(--gold)" } = {}) {
  const max = Math.max(...vals, 1);
  return `<div class="vbars" style="--h:${h}px">${vals.map((v, i) => `<div class="vb" data-tip="${esc(labels[i])}: ${esc(fmt(v))}"><i style="--v:${(v / max).toFixed(3)};--c:${c}"></i><small>${labels[i]}</small></div>`).join("")}</div>`;
}
export function donut(parts, { size = 160, label = "", sub = "" } = {}) {
  const tot = sum(parts, (p) => p.v) || 1, C = 2 * Math.PI * 42; let acc = 0;
  return `<div class="donut"><svg viewBox="0 0 100 100" width="${size}" height="${size}">${parts.map((p) => { const len = (p.v / tot) * C; const s = `<circle cx="50" cy="50" r="42" style="stroke:${p.c};stroke-dasharray:${len.toFixed(2)} ${C.toFixed(2)};stroke-dashoffset:${(-acc).toFixed(2)}" data-tip="${esc(p.l)}: ${esc(pct((p.v / tot) * 100))}"/>`; acc += len; return s; }).join("")}</svg><div class="dn-c"><b>${label}</b><small>${sub}</small></div></div>
  <div class="legend col">${parts.map((p) => `<span><i style="background:${p.c}"></i>${p.l}<b>${pct((p.v / tot) * 100)}</b></span>`).join("")}</div>`;
}
export function heat(rowL, colL, mx) {
  const top = Math.max(...mx.flat(), 1);
  return `<div class="heat" style="--cols:${colL.length}"><span></span>${colL.map((c) => `<small>${c}</small>`).join("")}${rowL.map((r, i) => `<small>${r}</small>${mx[i].map((v, j) => `<i style="--a:${(v / top).toFixed(3)}" data-tip="${r} · ${colL[j]}: ${n(v)}"></i>`).join("")}`).join("")}</div>`;
}
export function csv(name, rows) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + rows.map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(",")).join("\n")], { type: "text/csv" }));
  a.download = `${name}.csv`; document.body.appendChild(a); a.click(); a.remove();
}
// chart tooltips
let tip;
document.addEventListener("pointerover", (e) => { const el = e.target.closest("[data-tip]"); if (!el) return; tip = tip || Object.assign(document.createElement("div"), { className: "tip" }); document.body.appendChild(tip); tip.textContent = el.dataset.tip; tip.classList.add("on"); });
document.addEventListener("pointermove", (e) => { if (tip && tip.classList.contains("on")) { tip.style.left = `${e.clientX}px`; tip.style.top = `${e.clientY - 14}px`; } });
document.addEventListener("pointerout", (e) => { if (tip && e.target.closest("[data-tip]")) tip.classList.remove("on"); });
