// Services: Zafar at home (8, 11, 12, 13), ceremonies & buyouts (15, 16, 17, 19, 55),
// the private driver (88), gifts (21, 22) and bespoke dishes.
import { esc, fa, n, m, T, date, dateY, dshort, wday, time, dt, ago, until, sum, kpi, card, pill, empty, btn, avatar, table, startOfDay, DAY } from "./kit.js";
import { $, db, guest, staff, honorFa, TYPE, STATUS, lbl, commit, modal, toast, opt, field } from "./ui.js";
import { postCharge } from "./v-account.js";

const sp = (s) => pill(STATUS[s][0], STATUS[s][1]);
const reqs = (types) => db().requests.filter((r) => types.includes(r.type));
const who = (r) => `<a class="who" href="#/inbox/${r.id}">${avatar(r.name, r.memberId ? "gold" : "")}<span><b>${esc(honorFa(r))}</b><small class="lat">${r.id}</small></span></a>`;
function board(list, extra = () => "") {
  const cols = [["new", "نامه‌ی تازه"], ["called", "تماس گرفته شد"], ["confirmed", "تأیید شد"], ["done", "انجام شد"]];
  return `<div class="kanban">${cols.map(([s, l]) => `<div class="kb-col"><h4>${l} <small>${fa(list.filter((r) => r.status === s).length)}</small></h4>${list.filter((r) => r.status === s).slice(0, 12).map((r) => `<a class="kb-card" href="#/inbox/${r.id}"><b>${esc(honorFa(r))}</b><small>${esc(TYPE[r.type])}</small>${r.fields.date ? `<small>${date(r.fields.date)} · ${until(r.fields.date)}</small>` : ""}${r.fields.guests ? `<small>${fa(r.fields.guests)} مهمان</small>` : ""}${extra(r)}</a>`).join("") || `<p class="empty sm">—</p>`}</div>`).join("")}</div>`;
}

const KIT = ["ظروف چینی ظفر", "رومیزی و دستمال کتان", "گل‌آرایی", "سماور و سرویس چای", "شمع و نور", "یونیفرم پیشخدمت‌ها", "خودروی حمل", "کارتخوان سیار"];
function home(el) {
  const d = db(), list = reqs(["home", "chef", "delivery", "protocol"]);
  const up = list.filter((r) => r.status === "confirmed" && r.fields.date).sort((a, b) => a.fields.date - b.fields.date);
  el.innerHTML = `<div class="kpis">${kpi("در انتظار تماس", fa(list.filter((r) => r.status === "new").length))}${kpi("تأییدشده‌های پیش رو", fa(up.length))}${kpi("سرو در منزل · ۳۰ روز", T(sum(d.days.slice(-30), (x) => x.home)))}${kpi("سرآشپزها", fa(d.staff.filter((s) => s.role === "chef").length))}</div>
  ${card("روند درخواست‌ها · سرو در منزل، سرآشپز مقیم، تحویل دستی، تشریفات میز", board(list, (r) => (r.team ? `<small class="gold">تیم: ${esc(staff(r.team.chef)?.name || "")}</small>` : "")))}
  ${card("برنامه‌ی تیم بیرون از ظفر", up.length ? table(["تاریخ", "مهمان", "خدمت", "نشانی", "تیم", "تجهیزات", ""], up.map((r) => [{ v: `${date(r.fields.date)}<br><small>${wday(r.fields.date)}</small>`, s: r.fields.date }, who(r), esc(TYPE[r.type]), esc(r.fields.address || r.fields.location || "—"), r.team ? `${esc(staff(r.team.chef).name)}<br><small>${fa(r.team.waiters)} پیشخدمت</small>` : pill("بی‌تیم", "red"), r.team ? `${fa(r.team.kit.length)} از ${fa(KIT.length)}` : "—", btn("تیم و تجهیزات", `data-team="${r.id}"`, "sm gold")])) : empty("برنامه‌ی تأییدشده‌ای نیست."))}`;
  el.onclick = (e) => { const b = e.target.closest("[data-team]"); if (!b) return; const r = d.requests.find((x) => x.id === b.dataset.team); const tm = r.team || { chef: "C-1", waiters: 3, kit: [] };
    modal(`تیم ${esc(TYPE[r.type])} · ${esc(r.name)}`, `<div class="ff2">${field("سرآشپز", `<select name="c">${opt(d.staff.filter((s) => s.role === "chef").map((s) => [s.id, s.name]), tm.chef)}</select>`)}${field("پیشخدمت", `<input name="w" type="number" min="0" value="${tm.waiters}">`)}</div><div class="checks">${KIT.map((k) => `<label class="chk"><input type="checkbox" name="k" value="${k}"${tm.kit.includes(k) ? " checked" : ""}> ${k}</label>`).join("")}</div>`, { onOk: (f) => { r.team = { chef: f.c.value, waiters: +f.w.value, kit: [...f.querySelectorAll('[name="k"]:checked')].map((x) => x.value) }; commit("M-1", `تیم ${TYPE[r.type]} برای ${r.name} چیده شد`); } }); };
}

const EVT = ["ceremony", "proposal", "birthday", "business", "buyout"];
const ECOL = { ceremony: "#C9A66B", proposal: "#E8C7C1", birthday: "#9EDBBE", business: "#5E98A6", buyout: "#E2B39A" };
function events(el) {
  const d = db(), list = reqs(EVT).filter((r) => r.fields.date);
  const T0 = startOfDay(); const start = T0 - ((new Date(T0).getDay() + 1) % 7) * DAY;
  const cells = Array.from({ length: 35 }, (_, i) => start + i * DAY);
  const on = (t) => list.filter((r) => startOfDay(r.fields.date) === t && r.status !== "declined");
  const buyouts = list.filter((r) => r.type === "buyout" && r.status === "confirmed");
  el.innerHTML = `<div class="kpis">${EVT.map((t) => kpi(TYPE[t], fa(list.filter((r) => r.type === t && ["called", "confirmed"].includes(r.status)).length), "باز و تأییدشده")).join("")}</div>
  ${buyouts.length ? `<div class="banner">${buyouts.map((r) => `ظفر در ${dateY(r.fields.date)} برای «${esc(r.name)}» کامل اجاره شده است؛ برای آن شب دعوت تازه نپذیرید.`).join("<br>")}</div>` : ""}
  ${card("تقویم پنج هفته", `<div class="cal"><div class="cal-h">${["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"].map((w) => `<span>${w}</span>`).join("")}</div><div class="cal-g">${cells.map((c) => `<div class="cal-c ${c === T0 ? "today" : ""} ${c < T0 ? "past" : ""}"><small>${dshort(c)}</small>${on(c).map((r) => `<a href="#/inbox/${r.id}" style="--c:${ECOL[r.type]}" class="ev ${r.status}">${esc(TYPE[r.type].split(" /")[0])} · ${esc(r.name.split(" ").slice(-1)[0])}</a>`).join("")}</div>`).join("")}</div></div><div class="legend">${EVT.map((t) => `<span><i style="background:${ECOL[t]}"></i>${TYPE[t]}</span>`).join("")}</div>`)}
  ${card("همه‌ی مراسم", table(["تاریخ", "مهمان", "مراسم", "جزئیات", "مهمانان", "وضعیت"], list.sort((a, b) => b.fields.date - a.fields.date).map((r) => [{ v: date(r.fields.date), s: r.fields.date }, who(r), esc(TYPE[r.type]), esc([r.fields.ceremony && lbl(r.fields.ceremony), r.fields.company, r.fields.partner && "برای " + r.fields.partner, r.fields.person && "تولد " + r.fields.person, r.fields.where && lbl(r.fields.where), (r.fields.wish || []).map(lbl).join("، ")].filter(Boolean).join(" · ")), fa(r.fields.guests || "—"), sp(r.status)])))}`;
}

const TST = { scheduled: ["برنامه‌ریزی شده", "mute"], enroute: ["راننده در راه", "blue"], onboard: ["مهمان در خودرو", "gold"], done: ["رسید", "green"] };
function drivers(el) {
  const d = db(), T0 = startOfDay(), now = Date.now();
  const drv = d.staff.filter((s) => s.role === "driver");
  const today = d.trips.filter((t) => t.ts >= T0 && t.ts < T0 + DAY).sort((a, b) => a.ts - b.ts);
  const upcoming = d.trips.filter((t) => t.ts >= T0 + DAY).sort((a, b) => a.ts - b.ts).slice(0, 14);
  const pend = reqs(["chauffeur"]).filter((r) => ["new", "called"].includes(r.status));
  el.innerHTML = `<div class="kpis">${kpi("سفرهای امروز", fa(today.length))}${kpi("در راه", fa(today.filter((t) => ["enroute", "onboard"].includes(t.status)).length))}${kpi("نامه‌های راننده", fa(pend.length), "منتظر تأیید", "", pend.length ? "hot" : "")}${kpi("درآمد راننده · ۳۰ روز", T(sum(d.days.slice(-30), (x) => x.chauffeur)))}</div>
  <div class="grid g-3">${drv.map((s) => { const mine = today.filter((t) => t.driver === s.id); const live = mine.find((t) => ["enroute", "onboard"].includes(t.status)); return card(`${avatar(s.name)} ${esc(s.name)}`, `<p class="muted">${esc(s.car)}</p><p>${live ? `${pill(TST[live.status][0], TST[live.status][1])} ${esc(live.name)} · ${esc(live.from)} ← ${esc(live.to)}` : pill("آزاد", "green")}</p><ul class="list sm">${mine.map((t) => `<li><div><b>${time(t.ts)} · ${esc(t.name)}</b><small>${esc(t.from)} ← ${esc(t.to)} · ${fa(t.pax)} نفر</small></div>${pill(TST[t.status][0], TST[t.status][1])}</li>`).join("") || `<li class="empty sm">امروز سفری ندارد</li>`}</ul>`, { cls: "drv" }); }).join("")}</div>
  ${card("سفرهای امروز", today.length ? table(["ساعت", "مهمان", "مسیر", "خودرو", "راننده", "وضعیت", ""], today.map((t) => [{ v: time(t.ts), s: t.ts }, `<b>${esc(t.name)}</b><br><small class="lat">${fa(t.phone)}</small>`, `${pill(lbl(t.dir), "mute")}<br><small>${esc(t.from)} ← ${esc(t.to)}</small>`, lbl(t.car), `<select class="sel sm" data-drv="${t.id}">${opt(drv.map((s) => [s.id, s.name]), t.driver)}</select>`, pill(TST[t.status][0], TST[t.status][1]), `<div class="row">${t.status !== "done" ? btn({ scheduled: "حرکت راننده", enroute: "مهمان سوار شد", onboard: "رسید" }[t.status], `data-adv="${t.id}"`, "sm gold") : ""}${t.memberId || guest(t.guestId)?.memberId ? btn("روی حساب", `data-bill="${t.id}"`, "sm") : ""}</div>`])) : empty("امروز سفری نیست."), { extra: btn("+ سفر تازه", 'data-new="1"', "gold") })}
  ${card("سفرهای پیش رو", table(["زمان", "مهمان", "مسیر", "خودرو", "راننده"], upcoming.map((t) => [{ v: dt(t.ts), s: t.ts }, esc(t.name), `${esc(t.from)} ← ${esc(t.to)}`, lbl(t.car), esc(staff(t.driver).name)])))}`;
  el.onclick = (e) => {
    const a = e.target.closest("[data-adv]"); if (a) { const t = d.trips.find((x) => x.id === a.dataset.adv); t.status = { scheduled: "enroute", enroute: "onboard", onboard: "done" }[t.status]; commit(t.driver, `سفر ${t.name}: ${TST[t.status][0]}`); toast(TST[t.status][0]); }
    const b = e.target.closest("[data-bill]"); if (b) { const t = d.trips.find((x) => x.id === b.dataset.bill); postCharge(guest(t.guestId).memberId, { cat: "chauffeur", amount: t.fare, note: `راننده · ${t.from} ← ${t.to}` }); }
    if (e.target.closest("[data-new]")) modal("سفر تازه", `${field("مهمان", `<select name="g">${opt(d.guests.map((g) => [g.id, honorFa(g)]))}</select>`)}<div class="ff2">${field("مسیر", `<select name="dir">${opt([["car.to", "به ظفر"], ["car.from", "از ظفر"], ["car.round", "رفت و برگشت"]])}</select>`)}${field("ساعت", `<input name="t" type="time" value="20:00">`)}</div><div class="ff2">${field("مبدأ", `<input name="fr" value="فرودگاه بین‌المللی تبریز">`)}${field("مقصد", `<input name="to" value="ظفر">`)}</div><div class="ff2">${field("خودرو", `<select name="car">${opt([["car.exec", "اجرایی"], ["car.sedan", "سدان"], ["car.van", "ون"]])}</select>`)}${field("راننده", `<select name="dr">${opt(drv.map((s) => [s.id, s.name]))}</select>`)}</div>`, { onOk: (f) => { const g = guest(f.g.value); const [h, mi] = f.t.value.split(":").map(Number); d.trips.unshift({ id: `R-${700 + d.trips.length}`, guestId: g.id, name: g.name, phone: g.phone, dir: f.dir.value, from: f.fr.value, to: f.to.value, ts: T0 + (h * 60 + mi) * 6e4, pax: 2, car: f.car.value, driver: f.dr.value, status: "scheduled", fare: 3.2e6 }); commit("M-1", `سفر تازه برای ${g.name}`); } });
  };
  el.onchange = (e) => { const s = e.target.closest("[data-drv]"); if (s) { const t = d.trips.find((x) => x.id === s.dataset.drv); t.driver = s.value; commit("M-1", `راننده‌ی ${t.name}: ${staff(s.value).name}`); } };
}

const GST = { preparing: ["در حال آماده‌سازی", "gold"], out: ["در راه، با دست", "blue"], delivered: ["تحویل شد", "green"], redeemed: ["مهمان آمد", "green"] };
function gifts(el) {
  const d = db(), list = reqs(["giftbox", "evening"]).filter((r) => r.status !== "declined");
  list.forEach((r) => { if (!r.gift) r.gift = { st: r.status === "done" ? (r.type === "evening" ? "redeemed" : "delivered") : "preparing", code: r.type === "evening" ? "ZE-" + r.id.slice(2) : null }; });
  el.innerHTML = `<div class="kpis">${kpi("جعبه‌های هدیه", fa(list.filter((r) => r.type === "giftbox").length))}${kpi("هدیه‌ی یک شب", fa(list.filter((r) => r.type === "evening").length))}${kpi("در راه", fa(list.filter((r) => r.gift.st === "out").length))}${kpi("هدیه · ۳۰ روز", T(sum(d.days.slice(-30), (x) => x.gifts)))}</div>
  ${card("هدیه‌ها · همه با دست و کارت دست‌نویس", table(["فرستنده", "نوع", "گیرنده", "متن کارت", "کد دعوت", "وضعیت", ""], list.map((r) => [who(r), esc(TYPE[r.type]), `${esc(r.fields.recipient || "—")}<br><small class="lat">${fa(r.fields.rphone || "")}</small>`, `<small>«${esc(r.fields.card || "")}»</small>`, r.gift.code ? `<span class="lat">${r.gift.code}</span>` : "—", pill(GST[r.gift.st][0], GST[r.gift.st][1]), `<select class="sel sm" data-gst="${r.id}">${opt((r.type === "evening" ? ["preparing", "out", "delivered", "redeemed"] : ["preparing", "out", "delivered"]).map((s) => [s, GST[s][0]]), r.gift.st)}</select>`])))}`;
  el.onchange = (e) => { const s = e.target.closest("[data-gst]"); if (s) { const r = d.requests.find((x) => x.id === s.dataset.gst); r.gift.st = s.value; if (["delivered", "redeemed"].includes(s.value)) r.status = "done"; commit("M-1", `هدیه‌ی ${r.name}: ${GST[s.value][0]}`); } };
}

const BST = [["idea", "ایده رسید"], ["consult", "گفت‌وگو با سرآشپز"], ["tasting", "چشیدن"], ["ready", "آماده‌ی سرو"], ["served", "سرو شد"]];
function bespoke(el) {
  const d = db(), list = reqs(["bespoke"]).filter((r) => r.status !== "declined");
  list.forEach((r) => { r.bs = r.bs || { st: r.status === "done" ? "served" : r.status === "confirmed" ? "tasting" : "idea", chef: "C-1" }; });
  el.innerHTML = `${card("غذای اختصاصی · سرآشپز برای مهمان ویژه غذایی می‌پزد که در منو نیست", `<div class="bs-flow">${BST.map(([k, l]) => `<div><h4>${l}</h4>${list.filter((r) => r.bs.st === k).map((r) => `<div class="kb-card"><b>${esc(honorFa(r))}</b><small>«${esc(r.fields.dish || "")}»</small>${r.fields.diet ? `<small class="red">${esc(r.fields.diet)}</small>` : ""}<small>${esc(staff(r.bs.chef).name)}${r.fields.date ? " · " + date(r.fields.date) : ""}</small><div class="row"><select class="sel sm" data-bst="${r.id}">${opt(BST, k)}</select><select class="sel sm" data-bch="${r.id}">${opt(d.staff.filter((s) => s.role === "chef").map((s) => [s.id, s.name.replace("سرآشپز ", "")]), r.bs.chef)}</select></div></div>`).join("") || `<p class="empty sm">—</p>`}</div>`).join("")}</div>`)}`;
  el.onchange = (e) => { const s = e.target.closest("[data-bst]"); if (s) { const r = d.requests.find((x) => x.id === s.dataset.bst); r.bs.st = s.value; if (s.value === "served") r.status = "done"; commit("C-1", `غذای اختصاصی ${r.name}: ${BST.find((b) => b[0] === s.value)[1]}`); } const c = e.target.closest("[data-bch]"); if (c) { const r = d.requests.find((x) => x.id === c.dataset.bch); r.bs.chef = c.value; commit("M-1", "سرآشپز غذای اختصاصی تعیین شد"); } };
}

export const SECTIONS = [
  { id: "home", g: "خدمات", t: "ظفر در خانه", ico: "house", r: home, badge: () => reqs(["home", "chef", "delivery", "protocol"]).filter((r) => r.status === "new").length },
  { id: "events", g: "خدمات", t: "مراسم و اجاره‌ی کامل", ico: "ring", r: events },
  { id: "drivers", g: "خدمات", t: "راننده‌ی اختصاصی", ico: "car", r: drivers, badge: () => reqs(["chauffeur"]).filter((r) => r.status === "new").length },
  { id: "gifts", g: "خدمات", t: "هدیه‌ها", ico: "gift", r: gifts },
  { id: "bespoke", g: "خدمات", t: "غذای اختصاصی", ico: "dish", r: bespoke },
];
