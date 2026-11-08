// The house: menu, sales, P&L, staff & shifts, reports, access, settings.
import { esc, fa, n, m, T, pct, d1, date, dateY, dshort, wday, time, dt, ago, sum, kpi, delta, card, pill, empty, btn, avatar, table, lines, hbars, vbars, donut, heat, csv, startOfDay, DAY } from "./kit.js";
import { $, db, guest, member, staff, honorFa, TYPE, ROLES, CAT, METHOD, balance, commit, modal, toast, opt, field, money } from "./ui.js";
import { MENU } from "../menu.js";
import { reset } from "../data.js";

// ———————————————— menu (prices + availability sync to the site instantly)
function menu(el) {
  const d = db(); const f = el._f || (el._f = { m: "restaurant", q: "" });
  const ov = d.menu;
  const M = MENU.find((x) => x.id === f.m);
  const items = M.cats.flatMap((c) => c.items.map((it) => ({ c, it }))).filter(({ it }) => !f.q || `${it.fa} ${it.en}`.toLowerCase().includes(f.q.toLowerCase()));
  const off = Object.values(ov).filter((o) => o.off).length;
  el.innerHTML = `<div class="bar-row"><div class="seg-a">${MENU.map((x) => btn(x.fa, `data-m="${x.id}" aria-pressed="${f.m === x.id}"`)).join("")}</div><input class="sel" data-q placeholder="جست‌وجو در منو…" value="${esc(f.q)}"><label class="chk big"><input type="checkbox" data-showp ${d.settings.showPrices !== false ? "checked" : ""}> نمایش قیمت‌ها روی سایت</label></div>
  <div class="kpis">${kpi("اقلام منو", fa(sum(MENU, (x) => sum(x.cats, (c) => c.items.length))))}${kpi("ناموجود روی سایت", fa(off), "", "", off ? "hot" : "")}${kpi("قیمت تغییرکرده", fa(Object.values(ov).filter((o) => o.p).length))}${kpi("پیشنهاد ظفر", fa(sum(MENU, (x) => sum(x.cats, (c) => c.items.filter((i) => i.sig).length))))}</div>
  ${card(`${M.fa} · قیمت‌ها به هزار تومان؛ تغییرها همان لحظه روی سایت می‌نشیند`, table(["قلم", "دسته", "قیمت (هزار تومان)", "روی سایت"], items.map(({ c, it }) => { const o = ov[it.id] || {}; return [`<b>${esc(it.fa)}</b>${it.sig ? " " + pill("پیشنهاد ظفر", "gold") : ""}<br><small class="lat">${esc(it.en)}</small>`, esc(c.fa), it.p ? `<input class="sel sm num" data-price="${it.id}" value="${o.p || it.p}" inputmode="numeric" dir="ltr">${o.p ? ` <small class="muted">قبلی ${fa(it.p)}</small>` : ""}` : `<small class="muted">${fa((it.opts || []).length)} گزینه</small>`, `<label class="sw"><input type="checkbox" data-avail="${it.id}" ${o.off ? "" : "checked"}><i></i></label>`]; })))}`;
  el.onclick = (e) => { const b = e.target.closest("[data-m]"); if (b) { f.m = b.dataset.m; menu(el); } };
  el.onchange = (e) => {
    const p = e.target.closest("[data-price]"); if (p) { const id = p.dataset.price; const v = money(p.value); ov[id] = { ...(ov[id] || {}), p: v }; commit("M-1", `قیمت تغییر کرد: ${fa(v)} هزار تومان`); toast("قیمت روی سایت به‌روز شد"); }
    const a = e.target.closest("[data-avail]"); if (a) { const id = a.dataset.avail; ov[id] = { ...(ov[id] || {}), off: !a.checked }; commit("M-1", a.checked ? "قلم دوباره روی سایت آمد" : "قلم از سایت برداشته شد"); }
    if (e.target.closest("[data-showp]")) { d.settings.showPrices = e.target.checked; commit("M-1", e.target.checked ? "قیمت‌ها روی سایت نمایش داده می‌شوند" : "قیمت‌ها از سایت پنهان شد"); toast("روی سایت اعمال شد"); }
  };
  el.querySelector("[data-q]").oninput = (e) => { f.q = e.target.value; clearTimeout(el._qt); el._qt = setTimeout(() => { menu(el); const q = el.querySelector("[data-q]"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 250); };
}

// ———————————————— sales
const LINES = [["dining", "پذیرایی سالن", "var(--gold)"], ["home", "سرو در منزل", "#5E98A6"], ["events", "مراسم و اجاره", "#9EDBBE"], ["chauffeur", "راننده", "#E2B39A"], ["gifts", "هدیه‌ها", "#B9A3D9"]];
const rev = (x) => x.dining + x.home + x.events + x.chauffeur + x.gifts;
function sales(el) {
  const d = db(); const P = el._p || 30; const cur = d.days.slice(-P), prev = d.days.slice(-2 * P, -P);
  const wk = Array.from({ length: 7 }, (_, i) => { const ds = d.days.filter((x) => new Date(x.ts).getDay() === (i + 6) % 7); return [Math.round(sum(ds, (x) => x.covers) / Math.max(1, ds.length) * 0.35), Math.round(sum(ds, (x) => x.covers) / Math.max(1, ds.length) * 0.25), Math.round(sum(ds, (x) => x.covers) / Math.max(1, ds.length) * 0.4)]; });
  const tReq = Object.entries(TYPE).map(([k, l]) => ({ l, v: d.requests.filter((r) => r.type === k).length })).filter((x) => x.v).sort((a, b) => b.v - a.v);
  el.innerHTML = `<div class="bar-row"><div class="seg-a">${[[7, "۷ روز"], [30, "۳۰ روز"], [90, "۹۰ روز"]].map(([v, l]) => btn(l, `data-p="${v}" aria-pressed="${P === v}"`)).join("")}</div>${btn("خروجی اکسل", 'data-csv="1"')}</div>
  <div class="kpis">${kpi("درآمد", T(sum(cur, rev)), "", delta(sum(cur, rev), sum(prev, rev)))}${kpi("مهمانان", n(sum(cur, (x) => x.covers)), "", delta(sum(cur, (x) => x.covers), sum(prev, (x) => x.covers)))}${kpi("میانگین هر مهمان", T(sum(cur, (x) => x.dining) / Math.max(1, sum(cur, (x) => x.covers))), "پذیرایی سالن")}${kpi("خدمات بیرون از سالن", T(sum(cur, (x) => x.home + x.events + x.chauffeur + x.gifts)), pct((sum(cur, (x) => x.home + x.events + x.chauffeur + x.gifts) / Math.max(1, sum(cur, rev))) * 100) + " درآمد")}</div>
  ${card("درآمد روزانه", lines([{ vals: cur.map(rev), label: "این دوره" }, { vals: prev.map(rev), label: "دوره‌ی قبل", cls: "dim" }], cur.map((x) => dshort(x.ts))))}
  <div class="grid g-2">${card("درآمد به تفکیک خط خدمت", hbars(LINES.map(([k, l, c]) => ({ l, v: sum(cur, (x) => x[k]), c })), { unit: " تومان" }))}${card("موضوع نامه‌ها", hbars(tReq, { fmt: fa, unit: " نامه" }))}</div>
  <div class="grid g-2">${card("شلوغی روزهای هفته · مهمان", heat(["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"], ["صبحانه", "ناهار", "شام"], wk))}${card("مهمانان روزانه", vbars(cur.slice(-21).map((x) => x.covers), cur.slice(-21).map((x) => dshort(x.ts)), { fmt: n }))}</div>`;
  el.onclick = (e) => { const b = e.target.closest("[data-p]"); if (b) { el._p = +b.dataset.p; sales(el); } if (e.target.closest("[data-csv]")) csv("zafar-sales", [["date", "covers", ...LINES.map((l) => l[0]), "total"], ...cur.map((x) => [new Date(x.ts).toISOString().slice(0, 10), x.covers, ...LINES.map((l) => x[l[0]]), rev(x)])]); };
}

// ———————————————— P&L
function pnl(el) {
  const d = db(); const a = d.settings.pnl || (d.settings.pnl = { cogs: 31, wages: 2.9e9, rent: 1.1e9, util: 0.32e9, mkt: 0.25e9, vat: 10, other: 0.18e9 });
  const months = [3, 2, 1, 0].map((k) => { const ds = d.days.slice(-(k + 1) * 30, k ? -k * 30 : undefined); const r = sum(ds, rev); const cogs = r * a.cogs / 100, vat = r * a.vat / (100 + a.vat); const opex = a.wages + a.rent + a.util + a.mkt + a.other; return { l: ds.length ? dshort(ds[0].ts) + " تا " + dshort(ds[ds.length - 1].ts) : "", r, cogs, vat, opex, np: r - vat - cogs - opex }; });
  const c = months[3];
  const row = (l, v, k = "") => `<tr class="${k}"><td>${l}</td><td>${T(v)}</td><td>${pct((v / Math.max(1, c.r)) * 100)}</td></tr>`;
  el.innerHTML = `<div class="kpis">${kpi("درآمد ۳۰ روز", T(c.r))}${kpi("سود خالص", T(c.np), pct((c.np / Math.max(1, c.r)) * 100) + " حاشیه", delta(c.np, months[2].np))}${kpi("بهای مواد", T(c.cogs), pct(a.cogs))}${kpi("هزینه‌های ثابت", T(c.opex))}</div>
  <div class="grid g-2-1">${card("صورت سود و زیان · ۳۰ روز اخیر", `<table class="pl"><tbody>${row("درآمد", c.r, "strong")}${row("مالیات بر ارزش افزوده (درون قیمت)", -c.vat)}${row("بهای مواد", -c.cogs)}<tr class="strong"><td>سود ناخالص</td><td>${T(c.r - c.vat - c.cogs)}</td><td>${pct(((c.r - c.vat - c.cogs) / c.r) * 100)}</td></tr>${row("حقوق و دستمزد", -a.wages)}${row("اجاره", -a.rent)}${row("آب، برق، گاز", -a.util)}${row("بازاریابی", -a.mkt)}${row("سایر", -a.other)}<tr class="strong total"><td>سود خالص</td><td>${T(c.np)}</td><td>${pct((c.np / c.r) * 100)}</td></tr></tbody></table>`)}
  ${card("فرض‌ها", `<form class="pnl-f">${field("بهای مواد (٪ درآمد)", `<input name="cogs" value="${a.cogs}" dir="ltr">`)}${field("حقوق ماهانه (تومان)", `<input name="wages" value="${a.wages}" dir="ltr">`)}${field("اجاره", `<input name="rent" value="${a.rent}" dir="ltr">`)}${field("آب و برق", `<input name="util" value="${a.util}" dir="ltr">`)}${field("بازاریابی", `<input name="mkt" value="${a.mkt}" dir="ltr">`)}${field("سایر", `<input name="other" value="${a.other}" dir="ltr">`)}${field("مالیات بر ارزش افزوده ٪", `<input name="vat" value="${a.vat}" dir="ltr">`)}<button class="b gold" type="submit">محاسبه‌ی دوباره</button></form>`)}</div>
  ${card("روند چهار ماه", hbars(months.map((x) => ({ l: x.l, v: Math.max(0, x.np), c: "var(--gold)" })), { unit: " تومان سود" }))}`;
  el.querySelector(".pnl-f").onsubmit = (e) => { e.preventDefault(); const f = e.target; ["cogs", "wages", "rent", "util", "mkt", "other", "vat"].forEach((k) => { a[k] = money(f[k].value); }); commit("M-1", "فرض‌های سود و زیان به‌روز شد"); };
}

// ———————————————— staff & shifts
const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const SH = ["", "صبح", "عصر", "شب", "دو شیفت"];
function staffV(el) {
  const d = db(); const g = d.settings.shifts || (d.settings.shifts = Object.fromEntries(d.staff.map((s, i) => [s.id, DAYS.map((_, k) => ((i + k) % 6 === 0 ? 0 : 1 + ((i * 3 + k) % 4)))])));
  const nowD = (new Date().getDay() + 1) % 7, h = new Date().getHours(), slot = h < 12 ? 1 : h < 17 ? 2 : 3;
  const on = d.staff.filter((s) => g[s.id] && (g[s.id][nowD] === slot || g[s.id][nowD] === 4));
  const hostStats = d.staff.filter((s) => s.role === "host").map((s) => ({ s, n: d.requests.filter((r) => r.host === s.id).length, members: d.members.filter((x) => x.host === s.id).length }));
  el.innerHTML = `<div class="kpis">${kpi("کارکنان", fa(d.staff.length))}${kpi("اکنون سر کار", fa(on.length))}${kpi("میزبان‌ها", fa(hostStats.length), "هر عضو یک میزبان شخصی")}${kpi("رانندگان", fa(d.staff.filter((s) => s.role === "driver").length))}</div>
  <div class="grid g-2-1">${card("برنامه‌ی هفته · روی خانه بزنید", `<div class="tbl-wrap"><table class="tbl shifts"><thead><tr><th>نام</th>${DAYS.map((x, i) => `<th class="${i === nowD ? "today" : ""}">${x}</th>`).join("")}</tr></thead><tbody>${d.staff.map((s) => `<tr><td><b>${esc(s.name)}</b><br><small>${ROLES[s.role]}</small></td>${DAYS.map((_, k) => `<td><button type="button" class="shf s${g[s.id][k]}" data-sh="${s.id}" data-k="${k}">${SH[g[s.id][k]] || "—"}</button></td>`).join("")}</tr>`).join("")}</tbody></table></div>`)}
  <div>${card("اکنون سر کار", `<ul class="list sm">${on.map((s) => `<li>${avatar(s.name)}<div><b>${esc(s.name)}</b><small>${ROLES[s.role]}</small></div></li>`).join("") || `<li class="empty sm">—</li>`}</ul>`)}${card("میزبان‌ها", `<ul class="list sm">${hostStats.map((x) => `<li>${avatar(x.s.name)}<div><b>${esc(x.s.name)}</b><small>${fa(x.members)} عضو · ${fa(x.n)} نامه</small></div><b>${d1(x.s.rating)}★</b></li>`).join("")}</ul>`)}</div></div>`;
  el.onclick = (e) => { const b = e.target.closest("[data-sh]"); if (!b) return; const a = g[b.dataset.sh]; a[+b.dataset.k] = (a[+b.dataset.k] + 1) % 5; commit("M-1", "برنامه‌ی شیفت تغییر کرد"); };
}

// ———————————————— reports
function reports(el) {
  const d = db(), T0 = startOfDay(), today = d.days[d.days.length - 1];
  const summary = `گزارش شب ظفر · ${dateY(Date.now())}\nمهمانان: ${n(today.covers)} نفر\nدرآمد سالن: ${m(today.dining)} تومان\nنامه‌های تازه: ${fa(d.requests.filter((r) => r.ts > T0).length)} · بی‌پاسخ: ${fa(d.requests.filter((r) => r.status === "new").length)}\nمهمانان امشب: ${fa(d.tonight.length)} میهمانی · رسیده: ${fa(d.tonight.filter((a) => a.status !== "expected").length)}\nسفرهای راننده: ${fa(d.trips.filter((t) => t.ts >= T0 && t.ts < T0 + DAY).length)}\nمانده‌ی حساب‌های ظفر: ${m(sum(d.members, (x) => balance(x.id).bal))} تومان`;
  const X = [["guests", "پرونده‌ی مهمانان", () => [["id", "title", "name", "phone", "tags", "visits", "spend", "table", "tea", "allergy"], ...d.guests.map((g) => [g.id, g.title, g.name, g.phone, g.tags.join("|"), g.visits, g.spend, g.prefs.table, g.prefs.tea, g.prefs.allergy])]],
    ["members", "اعضای اعتبار ظفر", () => [["id", "name", "tier", "host", "since", "card_uid", "limit", "balance"], ...d.members.map((x) => [x.id, guest(x.guestId).name, x.tier, staff(x.host).name, new Date(x.since).toISOString().slice(0, 10), x.card.uid, x.limit || "", balance(x.id).bal])]],
    ["ledger", "دفتر حساب ظفر", () => [["id", "member", "date", "kind", "category", "amount", "note", "method"], ...d.tx.map((t) => [t.id, t.memberId, new Date(t.ts).toISOString(), t.kind, t.cat, t.amount, t.note, t.method || ""])]],
    ["letters", "نامه‌ها", () => [["id", "date", "type", "status", "name", "phone", "lang", "host"], ...d.requests.map((r) => [r.id, new Date(r.ts).toISOString(), r.type, r.status, r.name, r.phone, r.lang, r.host || ""])]],
    ["trips", "سفرهای راننده", () => [["id", "date", "guest", "from", "to", "car", "driver", "status", "fare"], ...d.trips.map((t) => [t.id, new Date(t.ts).toISOString(), t.name, t.from, t.to, t.car, staff(t.driver).name, t.status, t.fare])]],
    ["occasions", "مناسبت‌ها", () => [["id", "guest", "type", "whose", "date", "call"], ...d.occasions.map((o) => [o.id, guest(o.guestId)?.name || "", o.type, o.whose, new Date(o.date).toISOString().slice(0, 10), o.call])]]];
  el.innerHTML = `<div class="grid g-2">${card("گزارش شب · برای ارسال به مالک", `<textarea class="sum" readonly>${esc(summary)}</textarea><div class="row">${btn("کپی", 'data-copy="1"', "gold")}${btn("چاپ", 'data-print="1"')}</div>`)}
  ${card("خروجی اکسل (CSV)", `<ul class="list sm">${X.map(([k, l, f]) => `<li><div><b>${l}</b><small class="lat">zafar-${k}.csv · ${fa(f().length - 1)} ردیف</small></div>${btn("دانلود", `data-x="${k}"`, "sm")}</li>`).join("")}</ul>`)}</div>`;
  el.onclick = (e) => { if (e.target.closest("[data-copy]")) { navigator.clipboard?.writeText(summary); toast("کپی شد"); } if (e.target.closest("[data-print]")) print(); const x = e.target.closest("[data-x]"); if (x) { const r = X.find((a) => a[0] === x.dataset.x); csv("zafar-" + r[0], r[2]()); } };
}

// ———————————————— access
const PERMS = [["dash", "داشبورد و گزارش‌ها"], ["letters", "نامه‌ها و تماس"], ["guests", "پرونده‌ی مهمان"], ["phone", "دیدن شماره‌ی کامل"], ["account", "حساب ظفر و تسویه"], ["limits", "تغییر سقف حساب"], ["menu", "منو و قیمت"], ["drivers", "راننده‌ها"], ["staff", "کارکنان و شیفت"], ["settings", "تنظیمات"]];
const RL = [["ceo", "مدیرعامل"], ["manager", "مدیر سالن"], ["host", "میزبان"], ["chef", "سرآشپز"], ["driver", "راننده"], ["acct", "حسابدار"]];
function access(el) {
  const d = db(); const p = d.settings.perms || (d.settings.perms = { ceo: PERMS.map((x) => x[0]), manager: ["dash", "letters", "guests", "phone", "menu", "drivers", "staff"], host: ["letters", "guests", "phone"], chef: ["menu"], driver: ["drivers"], acct: ["dash", "account", "limits"] });
  el.innerHTML = `<div class="grid g-2-1">${card("نقش‌ها و دسترسی‌ها", `<div class="tbl-wrap"><table class="tbl perm"><thead><tr><th></th>${RL.map((r) => `<th>${r[1]}</th>`).join("")}</tr></thead><tbody>${PERMS.map(([k, l]) => `<tr><td>${l}</td>${RL.map(([r]) => `<td><label class="sw sm"><input type="checkbox" data-perm="${r}" data-k="${k}" ${p[r].includes(k) ? "checked" : ""} ${r === "ceo" ? "disabled" : ""}><i></i></label></td>`).join("")}</tr>`).join("")}</tbody></table></div>`)}
  ${card("رمز ورود پنل", `<form class="pin-f">${field("رمز چهار رقمی تازه", `<input name="p" dir="ltr" maxlength="4" inputmode="numeric" placeholder="••••">`)}<button class="b gold" type="submit">تغییر رمز</button></form><p class="hint">رمز دمو: <span class="lat">1234</span></p>`)}</div>
  ${card("رویدادها · همه‌ی کارهای انجام‌شده در پنل و صفحه‌های مهمان", table(["زمان", "چه کسی", "چه کاری"], d.audit.slice(0, 80).map((a) => [{ v: dt(a.ts), s: a.ts }, esc(staff(a.by)?.name || (a.by?.startsWith("ZC-") ? "عضو " + a.by : a.by === "CEO" ? "مدیرعامل" : a.by)), esc(a.text)]), { cls: "compact" }))}`;
  el.onchange = (e) => { const c = e.target.closest("[data-perm]"); if (c) { const a = new Set(p[c.dataset.perm]); c.checked ? a.add(c.dataset.k) : a.delete(c.dataset.k); p[c.dataset.perm] = [...a]; commit("CEO", "دسترسی تغییر کرد"); } };
  el.querySelector(".pin-f").onsubmit = (e) => { e.preventDefault(); const v = e.target.p.value.replace(/\D/g, ""); if (v.length !== 4) return toast("چهار رقم"); d.settings.pin = v; commit("CEO", "رمز پنل تغییر کرد"); toast("رمز تغییر کرد"); };
}

// ———————————————— settings
function settings(el) {
  const d = db(), s = d.settings;
  el.innerHTML = `<div class="grid g-2">${card("سایت مهمانان", `<form class="set-f"><label class="chk big"><input type="checkbox" name="sp" ${s.showPrices !== false ? "checked" : ""}> نمایش قیمت‌ها در منوی سایت</label>${field("مهلت تماس میزبان با نامه‌ی تازه (ساعت)", `<input name="sla" type="number" min="1" max="48" value="${s.callSla || 4}">`)}${field("متن تأیید روی سایت (اختیاری)", `<textarea name="ar" rows="3" placeholder="میزبان ما نامه‌تان را می‌خواند و شخصاً تماس می‌گیرد.">${esc(s.autoReply || "")}</textarea>`)}<button class="b gold" type="submit">ذخیره</button></form>`)}
  ${card("نمایش پنل", `<div class="row">${btn("تیره", 'data-theme="dark"')}${btn("روشن", 'data-theme="light"')}</div><p class="hint">قوانین ثابت ظفر: پرداخت آنلاین ندارد؛ رزرو آنلاین ندارد؛ هر درخواست با تماس میزبان پیش می‌رود.</p>`)}
  ${card("داده‌های دمو", `<p class="muted">چهار ماه تاریخچه‌ی ساختگی برای نمایش. با پاک کردن، همه‌چیز از نو ساخته می‌شود.</p>${btn("ساختن دوباره‌ی داده‌های دمو", 'data-reset="1"')}`)}</div>`;
  el.querySelector(".set-f").onsubmit = (e) => { e.preventDefault(); const f = e.target; s.showPrices = f.sp.checked; s.callSla = +f.sla.value || 4; s.autoReply = f.ar.value; commit("CEO", "تنظیمات ذخیره شد"); toast("ذخیره شد"); };
  el.onclick = (e) => { const t = e.target.closest("[data-theme]"); if (t) { document.documentElement.dataset.theme = t.dataset.theme; localStorage.setItem("zafar.adminTheme", t.dataset.theme); } if (e.target.closest("[data-reset]") && confirm("همه‌ی داده‌های دمو از نو ساخته شود؟")) { reset(); location.reload(); } };
}

export const SECTIONS = [
  { id: "menu", g: "رستوران", t: "منو و قیمت", ico: "menu", r: menu },
  { id: "sales", g: "رستوران", t: "فروش و درآمد", ico: "chart", r: sales },
  { id: "pnl", g: "رستوران", t: "سود و زیان", ico: "pl", r: pnl },
  { id: "staff", g: "رستوران", t: "کارکنان و شیفت‌ها", ico: "people", r: staffV },
  { id: "reports", g: "سیستم", t: "گزارش‌ها و خروجی", ico: "doc", r: reports },
  { id: "access", g: "سیستم", t: "دسترسی و رویدادها", ico: "lock", r: access },
  { id: "settings", g: "سیستم", t: "تنظیمات", ico: "gear", r: settings },
];
