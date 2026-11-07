// One store shared by the site, the member page and the CEO panel. On one device
// they talk instantly (localStorage + BroadcastChannel); a real server would
// replace this file in production. Demo history is seeded once, deterministically.
const KEY = "zafar.data.v5";
const DAY = 864e5;
const chan = "BroadcastChannel" in window ? new BroadcastChannel("zafar") : null;
const subs = new Set();
let db = null;

export const on = (f) => { subs.add(f); return () => subs.delete(f); };
function emit(src) { subs.forEach((f) => f(db, src)); }
chan && (chan.onmessage = () => { db = read() || db; emit("remote"); });
addEventListener("storage", (e) => { if (e.key === KEY) { db = read() || db; emit("remote"); } });

function read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  chan && chan.postMessage(1);
  emit("local");
}
export function get() { if (!db) { db = read(); if (!db || db.v !== 5) { db = seed(); save(); } } return db; }
export function reset() { db = seed(); save(); }
export const uid = (p) => `${p}-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
export function audit(by, text) { const d = get(); d.audit.unshift({ ts: Date.now(), by, text }); d.audit = d.audit.slice(0, 400); }

// ——— guest-side helpers
export function me() { try { return JSON.parse(localStorage.getItem("zafar.me") || "null"); } catch (e) { return null; } }
export function setMe(g) { try { localStorage.setItem("zafar.me", JSON.stringify({ ...(me() || {}), ...g, seen: Date.now() })); } catch (e) {} }
export function addRequest(r) {
  const d = get();
  const req = { id: `L-${String(24100 + d.requests.length + 1)}`, ts: Date.now(), status: "new", log: [{ ts: Date.now(), by: "guest", text: "نامه از سایت رسید" }], ...r };
  d.requests.unshift(req);
  // match or create the guest file
  let g = d.guests.find((x) => x.phone && r.phone && norm(x.phone) === norm(r.phone));
  if (!g && r.name) { g = { id: `G-${1000 + d.guests.length + 1}`, title: r.title, name: r.name, phone: r.phone, tags: ["نامه‌ی سایت"], prefs: {}, family: [], heard: r.heard, first: Date.now(), visits: 0, spend: 0, last: null, notes: "" }; d.guests.unshift(g); }
  if (g) req.guestId = g.id;
  save();
  return req;
}
const norm = (p) => String(p).replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)).slice(-10);

// ——— seed
function rng(s) { return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const M = [["آیدین", "Aydin"], ["سهند", "Sahand"], ["کامران", "Kamran"], ["بهزاد", "Behzad"], ["رضا", "Reza"], ["علی", "Ali"], ["فرهاد", "Farhad"], ["آرش", "Arash"], ["بابک", "Babak"], ["اورخان", "Orkhan"], ["ائلچین", "Elchin"], ["تورج", "Touraj"], ["کوروش", "Kourosh"], ["ساسان", "Sasan"], ["مسعود", "Masoud"], ["داریوش", "Dariush"], ["پرویز", "Parviz"], ["امیر", "Amir"]];
const W = [["آیلار", "Aylar"], ["سارا", "Sara"], ["نازنین", "Nazanin"], ["لیلا", "Leila"], ["مهسا", "Mahsa"], ["الناز", "Elnaz"], ["آیسان", "Aysan"], ["سولماز", "Solmaz"], ["ترانه", "Taraneh"], ["شیرین", "Shirin"], ["نگار", "Negar"], ["آیدا", "Ayda"], ["پریسا", "Parisa"], ["یاسمن", "Yasaman"], ["گلاره", "Gelareh"], ["سوگند", "Sogand"]];
const L = [["عظیمی", "Azimi"], ["رسولی", "Rasouli"], ["تقی‌زاده", "Taghizadeh"], ["صدیقی", "Seddighi"], ["نقوی", "Naghavi"], ["فرشچی", "Farshchi"], ["اسکویی", "Oskouei"], ["خوئی", "Khoei"], ["میلانی", "Milani"], ["شبستری", "Shabestari"], ["مرندی", "Marandi"], ["اهری", "Ahari"], ["سلماسی", "Salmasi"], ["بنیسی", "Banisi"], ["کلانتری", "Kalantari"], ["جوادی", "Javadi"], ["امیرخیزی", "Amirkhizi"], ["حریری", "Hariri"], ["پورعلی", "Pourali"], ["قراچه‌داغی", "Gharachedaghi"], ["نخجوانی", "Nakhjavani"], ["دیبایی", "Dibaei"]];
export const TABLES = ["سالن آینه ۱", "سالن آینه ۲", "سالن آینه ۳", "کنار پنجره ۴", "کنار پنجره ۵", "میز گرد ۶", "میز گرد ۷", "سالن خصوصی فیروزه", "سالن خصوصی طلایی", "تراس ۸", "تراس ۹", "کنار پیانو ۱۰"];
const TEAS = ["چای سیاه دمی شیخان", "چای زعفران", "دمنوش بهار", "قهوه ترک", "اسپرسو عربیکا", "دمنوش آرامش"];
const ALLER = ["", "", "", "", "حساسیت به آجیل", "بدون گلوتن", "گیاهخوار", "بدون لبنیات", "حساسیت به میگو"];

function seed() {
  const r = rng(1405);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const now = Date.now();
  const day0 = new Date(); day0.setHours(0, 0, 0, 0); const T0 = +day0;
  const staff = [
    ["H-1", "host", "مهران فرزانه", "Mehran Farzaneh"], ["H-2", "host", "نیلوفر آذر", "Niloufar Azar"], ["H-3", "host", "کیان صمدی", "Kian Samadi"], ["H-4", "host", "رعنا شفیعی", "Rana Shafiei"],
    ["C-1", "chef", "سرآشپز بهمن رحیمی", "Chef Bahman Rahimi"], ["C-2", "chef", "سرآشپز ژاله کریمی", "Chef Zhaleh Karimi"], ["C-3", "chef", "یاسر مولوی", "Yaser Molavi"],
    ["D-1", "driver", "جواد حیدری", "Javad Heydari"], ["D-2", "driver", "ناصر ملکی", "Naser Maleki"], ["D-3", "driver", "یوسف اکبری", "Yousef Akbari"],
    ["W-1", "maitre", "حمید زارعی", "Hamid Zarei"], ["W-2", "waiter", "پویا عسگری", "Pouya Asgari"], ["W-3", "waiter", "سینا قلی‌پور", "Sina Gholipour"], ["W-4", "waiter", "آرمان باقری", "Arman Bagheri"], ["W-5", "waiter", "مونا ستاری", "Mona Sattari"], ["W-6", "waiter", "الهام نوری", "Elham Nouri"],
    ["P-1", "pastry", "شکوفه رضوی", "Shokoufeh Razavi"], ["B-1", "barista", "امین طاهری", "Amin Taheri"], ["M-1", "manager", "مدیر سالن: فرشاد کاظمی", "Farshad Kazemi"],
  ].map(([id, role, name, lat], i) => ({ id, role, name, nameLat: lat, phone: `0914${String(1000000 + Math.floor(r() * 8999999))}`, rating: 4.3 + r() * 0.7, since: now - (200 + Math.floor(r() * 1400)) * DAY, car: role === "driver" ? ["مرسدس بنز S-Class · مشکی", "BMW سری ۷ · سرمه‌ای", "مرسدس V-Class · مشکی"][+id.slice(2) - 1] : null }));
  const hosts = staff.filter((s) => s.role === "host");
  const guests = [];
  for (let i = 0; i < 86; i++) {
    const f = r() < 0.47; const fn = pick(f ? W : M); const ln = L[i % L.length];
    const visits = Math.floor(r() * r() * 60) + 1;
    const last = now - Math.floor(r() * r() * 120) * DAY - Math.floor(r() * 10) * 36e5;
    guests.push({
      id: `G-${1001 + i}`, title: f ? "f" : "m", name: `${fn[0]} ${ln[0]}`, nameLat: `${fn[1]} ${ln[1]}`, surname: ln[0], surnameLat: ln[1],
      phone: `09${pick(["14", "12", "19", "35", "21"])}${String(1000000 + Math.floor(r() * 8999999))}`,
      tags: [visits > 25 ? "همیشگی" : visits > 8 ? "آشنا" : "تازه", ...(r() < 0.2 ? ["خانوادگی"] : []), ...(r() < 0.12 ? ["کاری"] : [])],
      prefs: { table: pick(TABLES), tea: pick(TEAS), allergy: pick(ALLER), music: pick(["", "", "آرام", "سنتی"]), note: pick(["", "", "", "نوشابه نمی‌خورند", "صندلی کودک لازم دارند", "دوست دارند چای را خودشان بریزند", "از کنار در ورودی دوری می‌کنند", "همیشه دسر را بسته‌بندی می‌برند"]) },
      family: r() < 0.45 ? [{ rel: f ? "همسر" : "همسر", name: `${pick(f ? M : W)[0]} ${ln[0]}` }, ...(r() < 0.5 ? [{ rel: "فرزند", name: pick(r() < 0.5 ? M : W)[0] }] : [])] : [],
      heard: pick(["heard.friend", "heard.ig", "heard.visit", "heard.hotel", "heard.friend"]),
      first: last - visits * (6 + r() * 18) * DAY, visits, spend: Math.round(visits * (4 + r() * 14) * 1e6 / 1e5) * 1e5, last,
      birthday: { m: 1 + Math.floor(r() * 12), d: 1 + Math.floor(r() * 29) }, notes: "",
      consent: r() < 0.9, source: pick(["walk", "friend", "ig", "hotel", "event"]),
    });
  }
  // members: the most loyal guests
  const loyal = [...guests].sort((a, b) => b.spend - a.spend).slice(0, 18);
  const tiers = ["noir", "noir", "noir", "gold", "gold", "gold", "gold", "gold", "teal", "teal", "teal", "teal", "teal", "teal", "teal", "teal", "teal", "teal"];
  const members = loyal.map((g, i) => {
    const since = now - (60 + Math.floor(r() * 900)) * DAY;
    const tier = tiers[i];
    g.memberId = `ZC-${1001 + i}`; g.tags.unshift("حلقه");
    return { id: g.memberId, guestId: g.id, tier, since, host: hosts[i % hosts.length].id,
      card: { uid: `04:${Array.from({ length: 6 }, () => Math.floor(r() * 256).toString(16).padStart(2, "0").toUpperCase()).join(":")}`, issued: since + 3 * DAY, status: "active", taps: 4 + Math.floor(r() * 80) },
      limit: tier === "noir" ? null : tier === "gold" ? 800e6 : 300e6,
      supp: r() < 0.55 && g.family.length ? [{ name: g.family[0].name, rel: g.family[0].rel, limit: tier === "noir" ? 200e6 : 80e6 }] : [],
      giftNote: "" };
  });
  // the demo member: make the first noir a known name
  Object.assign(guests.find((g) => g.id === members[0].guestId), { title: "m", name: "کامران رسولی", nameLat: "Kamran Rasouli", surname: "رسولی", surnameLat: "Rasouli" });
  members[0].since = now - 365 * DAY + 9 * DAY; // anniversary in 9 days
  // ledger: four months of signed bills and in-person settlements
  const CATS = [["dining", 0.62, 4e6, 38e6], ["home", 0.08, 60e6, 240e6], ["chauffeur", 0.12, 1.8e6, 6.5e6], ["gift", 0.08, 8e6, 42e6], ["event", 0.04, 150e6, 780e6], ["bespoke", 0.06, 9e6, 30e6]];
  const NOTE = { dining: ["شام · سالن آینه", "ناهار کاری", "صبحانه‌ی خانوادگی", "شام · سالن خصوصی", "عصرانه و کافه"], home: ["سرو در منزل · ۱۴ نفر", "سرو در منزل · ۳۰ نفر"], chauffeur: ["راننده · فرودگاه تا ظفر", "راننده · ظفر تا ولیعصر", "راننده · رفت و برگشت"], gift: ["جعبه‌ی هدیه · تحویل دستی", "هدیه‌ی یک شب"], event: ["بله‌برون · سالن فیروزه", "تولد غافلگیرانه", "شام کاری · هیئت ترکیه"], bespoke: ["غذای اختصاصی سرآشپز"] };
  const tx = [];
  members.forEach((m, mi) => {
    const intensity = m.tier === "noir" ? 2.4 : m.tier === "gold" ? 1.5 : 0.9;
    for (let mo = 3; mo >= 0; mo--) {
      const start = now - (mo + 1) * 30 * DAY, n = Math.round((3 + r() * 6) * intensity);
      let total = 0;
      for (let k = 0; k < n; k++) {
        let x = r(), c = CATS[0]; for (const cc of CATS) { if ((x -= cc[1]) <= 0) { c = cc; break; } }
        const amt = Math.round((c[2] + r() * r() * (c[3] - c[2])) * (m.tier === "teal" ? 0.7 : 1) / 1e5) * 1e5;
        const ts = start + r() * 30 * DAY; if (ts > now) continue;
        total += amt;
        tx.push({ id: `T-${tx.length + 1}`, memberId: m.id, ts, kind: "charge", cat: c[0], amount: amt, note: pick(NOTE[c[0]]), by: pick(r() < 0.8 ? [m.id] : m.supp.map((s) => s.name).concat(m.id)) });
      }
      if (mo > 0) tx.push({ id: `T-${tx.length + 1}`, memberId: m.id, ts: start + 34 * DAY, kind: "settle", cat: "settle", amount: total, note: "تسویه‌ی حضوری با میزبان", method: pick(["pos", "pos", "cash", "transfer"]), by: m.host });
    }
  });
  tx.sort((a, b) => b.ts - a.ts);
  // letters (requests)
  const TYPES = ["visit", "visit", "visit", "home", "chef", "delivery", "protocol", "ceremony", "proposal", "birthday", "business", "buyout", "giftbox", "evening", "chauffeur", "chauffeur", "bespoke", "circle", "visit", "home"];
  const requests = [];
  for (let i = 0; i < 52; i++) {
    const g = pick(guests), type = TYPES[i % TYPES.length];
    const age = i < 7 ? r() * 0.9 * DAY : (i - 5) * (0.5 + r()) * DAY;
    const st = i < 6 ? "new" : i < 13 ? "called" : i < 30 ? pick(["confirmed", "confirmed", "done"]) : pick(["done", "done", "done", "declined"]);
    const when = now - age + (2 + Math.floor(r() * 26)) * DAY * (st === "done" ? -0.4 : 1);
    const fields = { date: when, guests: 2 + Math.floor(r() * (["home", "ceremony", "buyout", "business"].includes(type) ? 60 : 8)) };
    if (type === "chauffeur") Object.assign(fields, { dir: pick(["car.to", "car.from", "car.round"]), from: pick(["فرودگاه بین‌المللی تبریز", "ولیعصر، خیابان توانیر", "هتل پارس ائل‌گلی", "باغمیشه، فلکه‌ی بزرگ", "شهرک خاوران"]), to: "ظفر", car: pick(["car.sedan", "car.exec", "car.van"]), pax: 1 + Math.floor(r() * 4), time: "20:00" });
    if (type === "ceremony") fields.ceremony = pick(["f.khast", "f.baleh", "f.aghd"]);
    if (type === "business") fields.company = pick(["گروه صنعتی آذر", "پتروشیمی تبریز", "فولاد شمال‌غرب", "شرکت فرش ممتاز"]);
    if (type === "home" || type === "delivery") fields.address = pick(["ولیعصر، خیابان فروغی", "الهیه، کوچه‌ی بهار", "باغمیشه، شهرک ارم", "زعفرانیه، بلوار ۲۹ بهمن"]);
    if (type === "giftbox" || type === "evening") { const rg = pick(guests); fields.recipient = rg.name; fields.card = "با آرزوی شبی به‌یادماندنی"; }
    if (type === "bespoke") Object.assign(fields, { dish: pick(["خورش آلوی مادربزرگ، اما سبک‌تر", "کوفته تبریزی برای جشن هشتادسالگی پدرم", "منوی بدون گلوتن برای دخترم"]), diet: pick(["", "بدون گلوتن", "کم‌نمک"]) });
    if (type === "proposal") Object.assign(fields, { partner: pick(W)[0], wish: ["f.flowers", "f.music"] });
    if (type === "birthday") Object.assign(fields, { person: pick(W)[0], secret: true });
    if (type === "circle") fields.ref = pick(members.map((m) => guests.find((x) => x.id === m.guestId).name));
    const ts = now - age;
    requests.push({ id: `L-${24100 - i}`, ts, type, status: st, guestId: g.id, memberId: g.memberId || null, title: g.title, name: g.name, phone: g.phone, callTime: pick(["ct.morning", "ct.afternoon", "ct.evening"]), heard: g.heard, note: pick(["", "", "لطفاً میز کنار پنجره", "پدرم با ویلچر می‌آید", "مهمان خارجی داریم", "اگر ممکن است سالن خصوصی"]), fields, lang: pick(["fa", "fa", "fa", "tr", "en"]), host: st === "new" ? null : pick(hosts).id,
      log: [{ ts, by: "guest", text: "نامه از سایت رسید" }, ...(st !== "new" ? [{ ts: ts + 3 * 36e5, by: pick(hosts).id, text: "میزبان تماس گرفت" }] : []), ...(["confirmed", "done"].includes(st) ? [{ ts: ts + 6 * 36e5, by: "M-1", text: "تأیید شد" }] : [])] });
  }
  // occasions kept for guests
  const OCC = ["occ.bday", "occ.anniv", "occ.engage", "occ.other"];
  const occasions = guests.slice(0, 44).map((g, i) => {
    const type = pick(OCC); const inDays = Math.floor(r() * 75) - 8;
    return { id: `O-${i + 1}`, guestId: g.id, memberId: g.memberId || null, type, whose: type === "occ.bday" ? pick(["همسر", "خودشان", "دختر", "پسر", "مادر"]) : type === "occ.anniv" ? "ازدواج" : "", date: T0 + inDays * DAY, call: inDays < -1 ? "done" : inDays < 7 ? pick(["due", "done"]) : "scheduled" };
  });
  // chauffeur trips
  const drivers = staff.filter((s) => s.role === "driver");
  const trips = [];
  for (let i = 0; i < 34; i++) {
    const g = pick(guests); const off = (i - 8) * 0.55 * DAY + r() * 0.4 * DAY;
    const ts = T0 + 19 * 36e5 + off;
    trips.push({ id: `R-${501 + i}`, guestId: g.id, name: g.name, phone: g.phone, dir: pick(["car.to", "car.from", "car.round"]), from: pick(["فرودگاه بین‌المللی تبریز", "ولیعصر، خیابان توانیر", "هتل پارس ائل‌گلی", "باغمیشه، فلکه‌ی بزرگ", "شهرک خاوران", "زعفرانیه"]), to: pick(["ظفر", "ظفر", "منزل", "هتل شهریار"]), ts, pax: 1 + Math.floor(r() * 4), car: pick(["car.sedan", "car.exec", "car.van"]), driver: pick(drivers).id, status: ts < now - 2 * 36e5 ? "done" : ts < now ? "onboard" : "scheduled", fare: Math.round((1.8 + r() * 4.2) * 1e6 / 1e5) * 1e5 });
  }
  // tonight: invitations the hosts confirmed — the door host greets them by name
  const tonight = [];
  for (let i = 0; i < 14; i++) {
    const g = guests[(i * 5 + 3) % guests.length];
    tonight.push({ id: `A-${i + 1}`, guestId: g.id, ts: T0 + (12 + Math.floor(i / 2) + (i % 2) * 0.5) * 36e5 + (i > 7 ? 5 * 36e5 : 0), party: 2 + Math.floor(r() * 6), table: TABLES[i % TABLES.length], status: "expected", note: g.prefs.allergy || g.prefs.note || "", occasion: i === 2 ? "سالگرد ازدواج" : i === 6 ? "تولد همسر" : "" });
  }
  // a year of dining-room days for the panel charts
  const days = [];
  for (let k = 180; k >= 0; k--) {
    const ts = T0 - k * DAY, wd = new Date(ts).getDay();
    const base = [1.15, 0.85, 0.9, 0.95, 1.05, 1.35, 1.25][wd];
    const covers = Math.round((140 + r() * 70) * base);
    const avg = 1.9e6 + r() * 0.6e6 + (180 - k) * 2500;
    days.push({ ts, covers, dining: Math.round(covers * avg / 1e5) * 1e5, home: r() < 0.22 ? Math.round((60 + r() * 180) * 1e6 / 1e5) * 1e5 : 0, events: r() < 0.08 ? Math.round((150 + r() * 600) * 1e6 / 1e5) * 1e5 : 0, chauffeur: Math.round((3 + r() * 9) * 3.2e6 / 1e5) * 1e5, gifts: Math.round(r() * r() * 60e6 / 1e5) * 1e5, breakfast: Math.round(covers * 0.28), cafe: Math.round(covers * 0.6) });
  }
  // the demo member has letters of his own
  const demoG = guests.find((g) => g.id === members[0].guestId);
  [1, 9, 16, 24].forEach((i, k) => Object.assign(requests[i], { guestId: demoG.id, memberId: members[0].id, title: "m", name: demoG.name, phone: demoG.phone, type: ["chauffeur", "bespoke", "home", "visit"][k] }));
  occasions.push({ id: "O-90", guestId: demoG.id, memberId: members[0].id, type: "occ.anniv", whose: "ازدواج", date: T0 + 12 * DAY, call: "scheduled" });
  return { v: 5, seededAt: now, staff, guests, members, tx, requests, occasions, trips, tonight, days, menu: {}, settings: { showPrices: true, callSla: 4, autoReply: "", letterLangs: ["fa", "tr", "en"], pin: "1234" }, audit: [{ ts: now - 36e5, by: "M-1", text: "پنل راه‌اندازی شد" }] };
}
export { DAY };
