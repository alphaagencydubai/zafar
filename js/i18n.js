// Three languages for the guest side: Persian (default, RTL), Turkish (LTR) and English (LTR). The CEO panel stays Persian.
const KEY = "zafar.lang";
export const LANGS = [["fa", "فا"], ["tr", "TR"], ["en", "EN"]];
let lang = "fa";
try { const s = localStorage.getItem(KEY); if (s && ["fa", "tr", "en"].includes(s)) lang = s; } catch (e) {}
const q = new URLSearchParams(location.search).get("lang");
if (q && ["fa", "tr", "en"].includes(q)) lang = q;

export const getLang = () => lang;
export const isFa = () => lang === "fa";
const subs = new Set();
export const onLang = (f) => subs.add(f);
export function setLang(l) {
  if (!["fa", "tr", "en"].includes(l) || l === lang) return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch (e) {}
  applyDir();
  subs.forEach((f) => f(l));
}
export function applyDir() {
  const d = document.documentElement;
  d.lang = lang;
  d.dir = lang === "fa" ? "rtl" : "ltr";
  d.dataset.lang = lang;
}

const FA_D = "۰۱۲۳۴۵۶۷۸۹";
export const digits = (s) => (lang === "fa" ? String(s).replace(/[0-9]/g, (c) => FA_D[c]) : String(s));
export const faDigits = (s) => String(s).replace(/[0-9]/g, (c) => FA_D[c]);
export const num = (n) => digits(Math.round(n).toLocaleString("en-US")).replace(/,/g, lang === "fa" ? "٬" : ",");
// menu prices are thousand toman
export const kprice = (p) => num(p);
export const toman = (n) => (lang === "fa" ? `${num(n)} تومان` : lang === "tr" ? `${num(n)} toman` : `${num(n)} toman`);
export function mtoman(n) { // short form for big sums
  if (n >= 1e9) return (lang === "fa" ? digits((n / 1e9).toFixed(2).replace(/\.?0+$/, "")).replace(".", "٫") + " میلیارد تومان" : (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + (lang === "tr" ? " milyar toman" : " bn toman"));
  if (n >= 1e6) return (lang === "fa" ? digits((n / 1e6).toFixed(1).replace(/\.0$/, "")).replace(".", "٫") + " میلیون تومان" : (n / 1e6).toFixed(1).replace(/\.0$/, "") + (lang === "tr" ? " milyon toman" : " M toman"));
  return toman(n);
}

const LOC = () => (lang === "fa" ? "fa-IR-u-ca-persian" : lang === "tr" ? "tr-TR" : "en-GB");
export function fdate(t, o = { day: "numeric", month: "long", year: "numeric" }) {
  try { return new Intl.DateTimeFormat(LOC(), o).format(new Date(t)); } catch (e) { return new Date(t).toDateString(); }
}
export const fday = (t) => fdate(t, { weekday: "long", day: "numeric", month: "long" });
export const ftime = (t) => fdate(t, { hour: "2-digit", minute: "2-digit", hour12: false });

export function honor(g, l = lang) {
  if (!g || !g.name) return "";
  const m = g.title !== "f";
  if (l === "fa") return `${m ? "آقای" : "خانم"} ${g.name}`;
  if (l === "tr") return `Sayın ${g.nameLat || g.name}`;
  return `${m ? "Mr" : "Ms"} ${g.nameLat || g.name}`;
}
export const pick = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] ?? o.en ?? o.fa ?? "");

export function t(key, vars) {
  const e = S[key];
  let s = e ? e[lang] ?? e.en : key;
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
  return s;
}
// fill every [data-t] in a root
export function paint(root = document) {
  root.querySelectorAll("[data-t]").forEach((el) => {
    const s = t(el.dataset.t);
    // Turkish casing would dot the i in English brand words (CİRCLE); keep them English
    if (lang === "tr" && /Etebar|Continental/.test(s)) el.innerHTML = s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/(Zafar Etebar|Etebar|Continental)/g, '<span lang="en">$1</span>');
    else el.textContent = s;
  });
  root.querySelectorAll("[data-th]").forEach((el) => { el.innerHTML = t(el.dataset.th); });
  root.querySelectorAll("[data-tp]").forEach((el) => { el.placeholder = t(el.dataset.tp); });
  root.querySelectorAll("[data-ta]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.ta)); });
}

const S = {
  // nav
  "nav.home": { fa: "خانه", tr: "Ana sayfa", en: "Home" },
  "nav.menu": { fa: "منو", tr: "Menü", en: "Menu" },
  "nav.services": { fa: "خدمات", tr: "Hizmetler", en: "Services" },
  "nav.circle": { fa: "اعتبار", tr: "Etebar", en: "Etebar" },
  "nav.visit": { fa: "دیدار", tr: "Ziyaret", en: "Visit" },
  "nav.letter": { fa: "نامه", tr: "Mektup", en: "Letter" },
  "nav.write": { fa: "نامه به ظفر", tr: "Zafar'a yazın", en: "Write to Zafar" },
  "nav.lang": { fa: "زبان", tr: "Dil", en: "Language" },
  // hero
  "hero.eyebrow": { fa: "رستوران قاره‌ای · تبریز", tr: "Kontinental restoran · Tebriz", en: "Continental restaurant · Tabriz" },
  "hero.lead": { fa: "میزی که با نام شما چیده می‌شود.", tr: "Adınıza kurulan bir masa.", en: "A table set in your name." },
  "hero.sub": { fa: "در ظفر هیچ چیز با یک کلیک تمام نمی‌شود. هر درخواست به گفت‌وگویی شخصی با میزبان ما می‌رسد.", tr: "Zafar'da hiçbir şey bir tıkla bitmez. Her talep, ev sahibimizle kişisel bir sohbete dönüşür.", en: "At Zafar nothing ends with a click. Every request becomes a personal conversation with our host." },
  "hero.cta": { fa: "نامه‌ای به ظفر", tr: "Zafar'a mektup yazın", en: "Write to Zafar" },
  "hero.menu": { fa: "دیدن منو", tr: "Menüyü görün", en: "View the menu" },
  "hero.welcome": { fa: "خوش آمدید، {name}", tr: "Hoş geldiniz, {name}", en: "Welcome, {name}" },
  "hero.back": { fa: "خوش برگشتید، {name}", tr: "Tekrar hoş geldiniz, {name}", en: "Welcome back, {name}" },
  "hero.scroll": { fa: "ادامه", tr: "Keşfedin", en: "Scroll" },
  "open.now": { fa: "اکنون باز است", tr: "Şu an açık", en: "Open now" },
  "open.closed": { fa: "اکنون بسته است · از ۹ صبح", tr: "Şu an kapalı · 09.00'da açılır", en: "Closed now · opens 9:00" },
  "open.hours": { fa: "هر روز ۹ صبح تا ۱۲ شب", tr: "Her gün 09.00–24.00", en: "Daily 9:00–24:00" },
  // house
  "house.k": { fa: "خانه‌ی ظفر", tr: "Zafar'ın evi", en: "The House of Zafar" },
  "house.t": { fa: "مهمان‌نوازی، رودررو.", tr: "Yüz yüze misafirperverlik.", en: "Hospitality, face to face." },
  "house.p": { fa: "ظفر پرداخت آنلاین و رزرو اینترنتی ندارد؛ و این انتخاب ماست. دوست داریم مهمانانمان را ببینیم، صدایشان را بشنویم و با نام صدایشان کنیم. این سایت تنها درِ خانه است؛ پذیرایی همیشه با یک انسان آغاز می‌شود.", tr: "Zafar'da online ödeme de internetten rezervasyon da yok; bu bizim tercihimiz. Misafirlerimizi görmeyi, seslerini duymayı ve onlara isimleriyle seslenmeyi severiz. Bu site yalnızca evin kapısıdır; ağırlama her zaman bir insanla başlar.", en: "Zafar takes no online payments and no internet reservations — by choice. We like to see our guests, hear their voices and call them by name. This site is only the front door; hospitality always begins with a person." },
  "rit.1t": { fa: "نامه، نه فرم", tr: "Form değil, mektup", en: "A letter, not a form" },
  "rit.1p": { fa: "درخواستتان را مثل یک نامه می‌نویسید و میزبان ما شخصاً با شما تماس می‌گیرد.", tr: "Talebinizi bir mektup gibi yazarsınız; ev sahibimiz sizi bizzat arar.", en: "You write your request as a letter, and our host calls you in person." },
  "rit.2t": { fa: "خوشامد با نام", tr: "İsminizle karşılanırsınız", en: "Welcomed by name" },
  "rit.2p": { fa: "پیش از رسیدنتان می‌دانیم چه کسی می‌آید؛ دم در با نام خودتان خوشامد می‌گوییم.", tr: "Siz gelmeden kimin geleceğini biliriz; kapıda sizi adınızla karşılarız.", en: "We know who is arriving before you do; at the door, we greet you by name." },
  "rit.3t": { fa: "پرداخت، رودررو", tr: "Ödeme, yüz yüze", en: "Payment, in person" },
  "rit.3p": { fa: "هیچ پرداختی آنلاین نیست؛ سر میز، دم در، یا با حساب ظفر.", tr: "Hiçbir ödeme online yapılmaz: masada, kapıda ya da Zafar Hesabı ile.", en: "Nothing is paid online: at the table, at the door, or on your Zafar Account." },
  // menu
  "menu.k": { fa: "منو", tr: "Menü", en: "The Menu" },
  "menu.t": { fa: "از آشپزخانه‌ی ظفر", tr: "Zafar'ın mutfağından", en: "From Zafar's kitchen" },
  "menu.note": { fa: "قیمت‌ها به هزار تومان است.", tr: "Fiyatlar bin toman cinsindendir.", en: "Prices in thousand toman." },
  "menu.sig": { fa: "پیشنهاد ظفر", tr: "Zafar'ın önerisi", en: "Zafar's pick" },
  "menu.search": { fa: "جست‌وجو در منو", tr: "Menüde arayın", en: "Search the menu" },
  "menu.none": { fa: "چیزی پیدا نشد. شاید سرآشپز ما بتواند آن را فقط برای شما بپزد.", tr: "Bir şey bulunamadı. Belki şefimiz onu yalnızca sizin için pişirebilir.", en: "Nothing found. Perhaps our chef can cook it just for you." },
  "menu.bespoke": { fa: "غذایی که فقط برای شما پخته می‌شود", tr: "Yalnızca sizin için pişirilen bir yemek", en: "A dish cooked only for you" },
  "menu.bespokeP": { fa: "سرآشپز ظفر برای مهمانان ویژه، غذایی اختصاصی طراحی می‌کند؛ با سلیقه، رژیم و خاطره‌ی شما.", tr: "Zafar'ın şefi özel misafirleri için kişiye özel bir yemek tasarlar; damak zevkinize, beslenme düzeninize ve anılarınıza göre.", en: "For our special guests, Zafar's chef designs a dish of your own — around your taste, your diet and your memories." },
  "menu.bespokeB": { fa: "درخواست غذای اختصاصی", tr: "Size özel yemek isteyin", en: "Request a bespoke dish" },
  "menu.items": { fa: "{n} انتخاب", tr: "{n} seçenek", en: "{n} dishes" },
  // services
  "svc.k": { fa: "خدمات ویژه", tr: "Özel hizmetler", en: "Private Services" },
  "svc.t": { fa: "ظفر، هر جا که شما باشید.", tr: "Neredeyseniz, Zafar orada.", en: "Zafar, wherever you are." },
  "svc.p": { fa: "هر خدمت با یک نامه آغاز می‌شود و با تماس میزبان ما ادامه پیدا می‌کند. هیچ قیمتی از پیش تعیین نمی‌شود؛ همه چیز برای شما طراحی می‌شود.", tr: "Her hizmet bir mektupla başlar ve ev sahibimizin aramasıyla devam eder. Hiçbir şey önceden fiyatlanmaz; her şey size göre tasarlanır.", en: "Every service begins with a letter and continues with a call from our host. Nothing is priced in advance; everything is designed around you." },
  "svc.req": { fa: "درخواست با نامه", tr: "Mektupla isteyin", en: "Request by letter" },
  "grp.home": { fa: "ظفر در خانه‌ی شما", tr: "Evinizde Zafar", en: "Zafar at your home" },
  "grp.moments": { fa: "لحظه‌های ماندگار", tr: "Unutulmaz anlar", en: "Moments that stay" },
  "grp.gifts": { fa: "هدیه", tr: "Hediyeler", en: "Gifts" },
  "grp.concierge": { fa: "کنسیرژ", tr: "Konsiyerj", en: "Concierge" },
  // chauffeur
  "car.k": { fa: "ظفر ماشین می‌فرستد", tr: "Zafar araç gönderir", en: "Zafar sends a car" },
  "car.t": { fa: "از هر جا تا ظفر. از ظفر تا هر جا.", tr: "Her yerden Zafar'a. Zafar'dan her yere.", en: "From anywhere to Zafar. From Zafar to anywhere." },
  "car.p": { fa: "راننده‌ی ظفر با خودروی خودِ ظفر به دنبالتان می‌آید و پس از شام، شما را به هر نقطه‌ای که بخواهید می‌رساند؛ از خانه، فرودگاه، هتل یا دفتر کار.", tr: "Zafar'ın şoförü, Zafar'ın kendi aracıyla sizi alır; yemekten sonra da dilediğiniz yere, evinize, havalimanına, otelinize ya da ofisinize bırakır.", en: "Zafar's own driver collects you in Zafar's own car, and after dinner takes you wherever you wish — home, the airport, your hotel or your office." },
  "car.to": { fa: "به ظفر", tr: "Zafar'a", en: "To Zafar" },
  "car.from": { fa: "از ظفر", tr: "Zafar'dan", en: "From Zafar" },
  "car.round": { fa: "رفت و برگشت", tr: "Gidiş-dönüş", en: "Round trip" },
  "car.anywhere": { fa: "هر جا", tr: "Her yer", en: "Anywhere" },
  "car.sedan": { fa: "سدان", tr: "Sedan", en: "Sedan" },
  "car.exec": { fa: "اجرایی", tr: "Makam aracı", en: "Executive" },
  "car.van": { fa: "ون خانوادگی", tr: "Aile minivanı", en: "Family van" },
  "car.cta": { fa: "درخواست راننده", tr: "Şoför isteyin", en: "Request a driver" },
  "car.f1": { fa: "راننده‌ی ثابت ظفر، با نام و عکس", tr: "İsmiyle, fotoğrafıyla tanıdığınız bir Zafar şoförü", en: "A named Zafar driver, photo and all" },
  "car.f2": { fa: "خودروی خودِ ظفر، نه تاکسی اینترنتی", tr: "Zafar'ın kendi aracı, asla taksi değil", en: "Zafar's own car, never a ride-hail" },
  "car.f3": { fa: "هزینه روی صورت‌حساب شام یا حساب ظفر", tr: "Ücret hesabınıza ya da Zafar Hesabı'na eklenir", en: "Added to your bill or Zafar Account" },
  // circle
  "cir.k": { fa: "اعتبار ظفر", tr: "Zafar Etebar", en: "Zafar Etebar" },
  "cir.t": { fa: "تنها با دعوت.", tr: "Yalnızca davetle.", en: "By invitation only." },
  "cir.p": { fa: "اعتبار ظفر جمع کوچکی از مهمانانی است که ظفر آنها را به نام می‌شناسد. هر عضو میزبان شخصی خودش، کارت فلزی NFC خودش و حسابی دارد که هرگز لازم نیست سر میز کیف پول باز کند.", tr: "Zafar Etebar, Zafar'ın isimleriyle tanıdığı küçük bir misafir topluluğudur. Her üyenin kişisel bir ev sahibi, kendine ait metal bir NFC kartı ve masada asla cüzdan açtırmayan bir hesabı vardır.", en: "Zafar Etebar is a small company of guests Zafar knows by name. Each member has a personal host, a metal NFC card of their own, and an account that never asks them to open a wallet at the table." },
  "cir.p1t": { fa: "میزبان شخصی، خط مستقیم", tr: "Kişisel ev sahibi, doğrudan hat", en: "A personal host, a direct line" },
  "cir.p1": { fa: "یک نفر که شما را می‌شناسد و همیشه پاسخ می‌دهد.", tr: "Sizi tanıyan ve her zaman yanıt veren tek bir kişi.", en: "One person who knows you, and always answers." },
  "cir.p2t": { fa: "کارت فلزی NFC", tr: "Metal NFC kart", en: "The metal NFC card" },
  "cir.p2": { fa: "گوشی را به کارت بزنید؛ صفحه‌ی خصوصی‌تان باز می‌شود. بدون رمز، بدون حساب کاربری.", tr: "Telefonunuzu karta dokundurun; özel sayfanız açılır. Şifre yok, hesap açmak yok.", en: "Tap your phone to the card and your private page opens. No password, no account to create." },
  "cir.p3t": { fa: "نگهبان مناسبت‌ها", tr: "Özel günlerin bekçisi", en: "The occasion keeper" },
  "cir.p3": { fa: "یک هفته پیش از هر تاریخ مهم، میزبانتان تماس می‌گیرد.", tr: "Önemli her tarihten bir hafta önce ev sahibiniz sizi arar.", en: "A week before every date that matters, your host calls." },
  "cir.p4t": { fa: "هدیه‌ی سالروز عضویت", tr: "Üyelik yıl dönümü hediyesi", en: "A gift on your anniversary" },
  "cir.p4": { fa: "هر سال در سالروز پیوستنتان، هدیه‌ای شخصی از ظفر.", tr: "Her yıl katıldığınız gün, Zafar'dan kişisel bir hediye.", en: "Each year on the day you joined, a personal gift from Zafar." },
  "cir.p5t": { fa: "غذای اختصاصی", tr: "Size özel yemek", en: "Your own dish" },
  "cir.p5": { fa: "سرآشپز برای شما غذایی می‌پزد که در منو نیست.", tr: "Şef, menüde olmayanı sizin için pişirir.", en: "The chef cooks for you what is not on the menu." },
  "cir.p6t": { fa: "حساب ظفر", tr: "Zafar Hesabı", en: "The Zafar Account" },
  "cir.p6": { fa: "امضا کنید و بروید؛ تسویه ماهانه و رودررو.", tr: "İmzalayın ve çıkın; ayda bir, yüz yüze ödeyin.", en: "Sign and leave; settle monthly, in person." },
  "cir.req": { fa: "درخواست عضویت در اعتبار ظفر", tr: "Tanıştırılmak isteyin", en: "Ask to be introduced" },
  "cir.tap": { fa: "کارت دارید؟ لمس کنید", tr: "Kartınız mı var? Dokunun", en: "Have a card? Tap it" },
  "tier.teal": { fa: "فیروزه", tr: "Turkuaz", en: "Teal" },
  "tier.gold": { fa: "طلایی", tr: "Altın", en: "Gold" },
  "tier.noir": { fa: "نوآر", tr: "Noir", en: "Noir" },
  "tier.tealP": { fa: "برای مهمانان همیشگی", tr: "Müdavimlerimiz için", en: "For our regulars" },
  "tier.goldP": { fa: "برای خانواده‌هایی که ظفر را خانه‌ی دوم می‌دانند", tr: "Zafar'ı ikinci evi sayan aileler için", en: "For families who call Zafar a second home" },
  "tier.noirP": { fa: "تنها با دعوت مالک ظفر", tr: "Yalnızca Zafar'ın sahibinin davetiyle", en: "Only by the owner's invitation" },
  // account
  "acc.k": { fa: "حساب ظفر", tr: "Zafar Hesabı", en: "The Zafar Account" },
  "acc.t": { fa: "امضا کنید. بروید.", tr: "İmzalayın. Çıkın.", en: "Sign. And simply leave." },
  "acc.p": { fa: "به سبک باشگاه‌های قدیمی و معتبرترین کارت‌های شارژ جهان، اما فقط برای ظفر؛ و همیشه رودررو.", tr: "Eski kulüplerin ve dünyanın en seçkin kart hesaplarının ruhuyla; yalnızca Zafar için ve her zaman yüz yüze.", en: "In the spirit of the old clubs and the world's finest charge cards — made only for Zafar, and always in person." },
  "acc.f1t": { fa: "امضا، به‌جای پرداخت", tr: "Ödeme değil, imza", en: "A signature, not a payment" },
  "acc.f1": { fa: "سر میز صورت‌حساب را امضا می‌کنید؛ نه کارتی، نه کیف پولی.", tr: "Masada hesabı imzalarsınız. Ne kart, ne cüzdan.", en: "At the table you sign the bill. No card, no wallet." },
  "acc.f2t": { fa: "یک صورت‌حساب در ماه", tr: "Ayda tek ekstre", en: "One statement a month" },
  "acc.f2": { fa: "صورت‌حساب ریز و مهرشده، در پاکتی مهر و موم شده به دستتان می‌رسد.", tr: "Ayrıntılı ekstreniz mühürlü bir zarfla elden teslim edilir.", en: "Itemised, sealed, and hand-delivered in a wax-sealed envelope." },
  "acc.f3t": { fa: "تسویه، فقط رودررو", tr: "Yalnızca yüz yüze ödeme", en: "Settled only in person" },
  "acc.f3": { fa: "نقد یا کارت، با میزبان خودتان؛ هرگز آنلاین.", tr: "Nakit ya da kartla, kendi ev sahibinize. Asla online değil.", en: "Cash or card, with your own host. Never online." },
  "acc.f4t": { fa: "بدون سقف از پیش تعیین‌شده", tr: "Önceden belirlenmiş limit yok", en: "No preset spending limit" },
  "acc.f4": { fa: "در سطح نوآر، اعتبار با شما رشد می‌کند.", tr: "Noir seviyesinde krediniz sizinle birlikte büyür.", en: "At Noir, your credit grows with you." },
  "acc.f5t": { fa: "کارت‌های همراه", tr: "Ek kartlar", en: "Companion cards" },
  "acc.f5": { fa: "برای همسر و فرزندان، با سقف و نام خودشان.", tr: "Eşiniz ve çocuklarınız için, kendi isimleri ve limitleriyle.", en: "For your spouse and children, each with their own name and limit." },
  "acc.f6t": { fa: "همه‌ی ظفر روی یک حساب", tr: "Tüm Zafar tek hesapta", en: "All of Zafar on one account" },
  "acc.f6": { fa: "شام، سرو در منزل، راننده، هدیه و مراسم.", tr: "Akşam yemekleri, evde servis, şoför, hediyeler ve törenler.", en: "Dinners, home serving, the driver, gifts and ceremonies." },
  "acc.stmt": { fa: "صورت‌حساب آبان", tr: "Kasım ekstresi", en: "November statement" },
  "acc.bal": { fa: "مانده‌ی این دوره", tr: "Bu dönemin bakiyesi", en: "Balance this period" },
  "acc.due": { fa: "تسویه با میزبان: ۵ آذر", tr: "Ev sahibinizle ödeme: 26 Kasım", en: "Settle with your host: 26 November" },
  "acc.limit": { fa: "سقف", tr: "Limit", en: "Limit" },
  "acc.nolimit": { fa: "بدون سقف از پیش تعیین‌شده", tr: "Önceden belirlenmiş limit yok", en: "No preset limit" },
  // occasions
  "occ.k": { fa: "نگهبان مناسبت‌ها", tr: "Özel günlerin bekçisi", en: "The Occasion Keeper" },
  "occ.t": { fa: "تاریخ‌هایی که نباید فراموش شوند.", tr: "Unutulmaması gereken tarihler.", en: "Dates that must not be forgotten." },
  "occ.p": { fa: "سالگرد ازدواج، تولد همسر، روز خاص فرزندتان؛ تاریخ را به ما بسپارید. یک هفته قبل، میزبان ما تماس می‌گیرد و شبی را پیشنهاد می‌دهد.", tr: "Evlilik yıl dönümünüz, eşinizin doğum günü, çocuğunuzun özel günü… Tarihi bize bırakın. Bir hafta önce ev sahibimiz sizi arar ve bir akşam önerir.", en: "A wedding anniversary, your spouse's birthday, your child's special day — leave the date with us. A week before, our host will call and suggest an evening." },
  "occ.type": { fa: "مناسبت", tr: "Özel gün", en: "Occasion" },
  "occ.bday": { fa: "تولد", tr: "Doğum günü", en: "Birthday" },
  "occ.anniv": { fa: "سالگرد ازدواج", tr: "Evlilik yıl dönümü", en: "Wedding anniversary" },
  "occ.engage": { fa: "سالگرد نامزدی", tr: "Nişan yıl dönümü", en: "Engagement anniversary" },
  "occ.other": { fa: "روزی خاص", tr: "Özel bir gün", en: "A special day" },
  "occ.whose": { fa: "برای چه کسی؟", tr: "Kimin için?", en: "For whom?" },
  "occ.date": { fa: "تاریخ", tr: "Tarih", en: "Date" },
  "occ.save": { fa: "به ظفر بسپارید", tr: "Zafar'a bırakın", en: "Leave it with Zafar" },
  "occ.done": { fa: "سپرده شد. {date} میزبان ما با شما تماس می‌گیرد.", tr: "Kaydedildi. Ev sahibimiz sizi {date} arayacak.", en: "Kept. Our host will call you on {date}." },
  "occ.need": { fa: "نام و شماره‌تان را هم بنویسید تا بدانیم با چه کسی تماس بگیریم.", tr: "Kimi arayacağımızı bilmemiz için adınızı ve numaranızı da yazın.", en: "Add your name and number so we know whom to call." },
  // cta
  "cta.t": { fa: "هر چه در ذهن دارید، برای ما بنویسید.", tr: "Aklınızda ne varsa, bize yazın.", en: "Whatever you have in mind, write to us." },
  "cta.p": { fa: "میزبان ما نامه‌تان را می‌خواند و خودش تماس می‌گیرد.", tr: "Ev sahibimiz mektubunuzu okur ve sizi bizzat arar.", en: "Our host reads your letter and calls you personally." },
  "cta.b": { fa: "نوشتن نامه", tr: "Mektup yazın", en: "Write a letter" },
  // visit
  "vis.k": { fa: "دیدار", tr: "Ziyaret", en: "Visit" },
  "vis.t": { fa: "در الهیه، تبریز.", tr: "Tebriz'de, Elahiyeh'de.", en: "In Elahiyeh, Tabriz." },
  "vis.addr": { fa: "تبریز، الهیه، میدان فهمیده به سمت باغمیشه، نبش خیابان ظفر", tr: "Zafar Sokağı köşesi, Fahmideh Meydanı'ndan Baghmisheh yönüne, Elahiyeh, Tebriz", en: "Zafar St corner, from Fahmideh Sq towards Baghmisheh, Elahiyeh, Tabriz" },
  "vis.hours": { fa: "ساعات پذیرایی", tr: "Saatler", en: "Hours" },
  "vis.call": { fa: "تماس با میزبان", tr: "Ev sahibimizi arayın", en: "Call our host" },
  "vis.phone": { fa: "تلفن", tr: "Telefon", en: "Telephone" },
  "vis.mobile": { fa: "موبایل", tr: "Cep", en: "Mobile" },
  "vis.dir": { fa: "مسیریابی", tr: "Yol tarifi", en: "Directions" },
  "vis.neshan": { fa: "مسیریابی با نشان", tr: "Neshan ile yol tarifi", en: "Directions · Neshan" },
  "vis.ig": { fa: "اینستاگرام", tr: "Instagram", en: "Instagram" },
  "vis.addrL": { fa: "نشانی", tr: "Adres", en: "Address" },
  "foot.rights": { fa: "ظفر کانتیننتال، تبریز", tr: "Zafar Continental, Tebriz", en: "Zafar Continental, Tabriz" },
  "foot.member": { fa: "ورود اعضای اعتبار ظفر", tr: "Etebar üyeleri", en: "Etebar members" },
  // letter
  "let.dear": { fa: "ظفر عزیز،", tr: "Sevgili Zafar,", en: "Dear Zafar," },
  "let.iam": { fa: "من", tr: "Ben", en: "I am" },
  "let.am": { fa: "هستم و مایلم", tr: "", en: "and I would like to request" },
  "let.req": { fa: "را درخواست کنم.", tr: "", en: "." },
  "let.call1": { fa: "لطفاً با شماره‌ی", tr: "", en: "Please call me on" },
  "let.call2": { fa: "تماس بگیرید؛ بهترین زمان تماس", tr: "", en: "— the best time to reach me is" },
  "let.call3": { fa: "است.", tr: "", en: "." },
  "let.note": { fa: "اگر نکته‌ای هست، اینجا بنویسید…", tr: "Eklemek istediğiniz bir şey varsa buraya yazın…", en: "Anything else you would like us to know…" },
  "let.heard": { fa: "با ظفر از کجا آشنا شدید؟", tr: "Zafar'ı nereden duydunuz?", en: "How did you come to know Zafar?" },
  "let.sign": { fa: "ارادتمند،", tr: "Saygılarımla,", en: "Yours sincerely," },
  "let.send": { fa: "ارسال نامه", tr: "Mektubu gönder", en: "Send the letter" },
  "let.close": { fa: "بستن", tr: "Kapat", en: "Close" },
  "let.service": { fa: "موضوع نامه", tr: "Konu", en: "Subject" },
  "let.name": { fa: "نام شما", tr: "adınız", en: "your name" },
  "let.phone": { fa: "۰۹۱۲…", tr: "09…", en: "09…" },
  "let.m": { fa: "آقای", tr: "Bay", en: "Mr" },
  "let.f": { fa: "خانم", tr: "Bayan", en: "Ms" },
  "let.sent": { fa: "نامه‌ی شما به ظفر رسید.", tr: "Mektubunuz Zafar'a ulaştı.", en: "Your letter has reached Zafar." },
  "let.sentP": { fa: "{name}، میزبان ما نامه‌تان را می‌خواند و {time} شخصاً با شما تماس می‌گیرد. هیچ پرداختی لازم نیست.", tr: "{name}, ev sahibimiz mektubunuzu okuyacak ve sizi {time} bizzat arayacak. Hiçbir ödeme gerekmez.", en: "{name}, our host will read your letter and call you personally {time}. No payment is needed." },
  "let.ref": { fa: "شماره‌ی نامه", tr: "Mektup no.", en: "Letter no." },
  "let.missing": { fa: "نام و شماره‌ی تماس را بنویسید تا میزبان بتواند با شما تماس بگیرد.", tr: "Ev sahibimizin sizi arayabilmesi için adınızı ve numaranızı yazın.", en: "Please add your name and number so our host can call you." },
  "let.another": { fa: "نامه‌ای دیگر", tr: "Yeni bir mektup", en: "Another letter" },
  "let.title": { fa: "نامه به ظفر", tr: "Zafar'a mektup", en: "A letter to Zafar" },
  "let.sub": { fa: "بی‌فرم، بی‌پرداخت؛ میزبان ما تماس می‌گیرد.", tr: "Form yok, ödeme yok; ev sahibimiz sizi arar.", en: "No forms, no payment; our host calls you." },
  "let.s1": { fa: "موضوع", tr: "Konu", en: "Topic" },
  "let.s2": { fa: "جزئیات", tr: "Ayrıntılar", en: "Details" },
  "let.s3": { fa: "تماس", tr: "İletişim", en: "Contact" },
  "let.q1": { fa: "درباره‌ی چه می‌نویسید؟", tr: "Ne hakkında yazıyorsunuz?", en: "What would you like to write about?" },
  "let.q2": { fa: "چند جزئیات", tr: "Birkaç ayrıntı", en: "A few details" },
  "let.q3": { fa: "میزبان ما با چه نامی و کجا تماس بگیرد؟", tr: "Ev sahibimiz sizi hangi isimle ve nereden arasın?", en: "Who should our host call, and where?" },
  "let.opt": { fa: "(اختیاری)", tr: "(isteğe bağlı)", en: "(optional)" },
  "let.change": { fa: "تغییر", tr: "Değiştir", en: "Change" },
  "let.msg": { fa: "پیامی برای میزبان", tr: "Ev sahibine bir not", en: "A note for our host" },
  "let.you": { fa: "شما", tr: "Hitap", en: "You are" },
  "let.ctq": { fa: "چه زمانی تماس بگیریم؟", tr: "Ne zaman arayalım?", en: "When should we call?" },
  "let.pv": { fa: "من {name} هستم و درباره‌ی «{svc}» برایتان می‌نویسم.", tr: "Ben {name}; size “{svc}” hakkında yazıyorum.", en: "I am {name}, writing to you about “{svc}”." },
  "let.next": { fa: "ادامه", tr: "Devam", en: "Continue" },
  "let.back": { fa: "قبلی", tr: "Geri", en: "Back" },
  "let.safe": { fa: "ظفر هیچ پرداخت آنلاینی نمی‌گیرد.", tr: "Zafar hiçbir zaman online ödeme almaz.", en: "Zafar never takes payment online." },
  "let.extra": { fa: "یک نکته‌ی دیگر", tr: "Bir ayrıntı daha", en: "One more thing" },
  "ctc.morning": { fa: "صبح", tr: "Sabah", en: "Morning" },
  "ctc.noon": { fa: "ظهر", tr: "Öğle", en: "Midday" },
  "ctc.afternoon": { fa: "عصر", tr: "Öğleden sonra", en: "Afternoon" },
  "ctc.evening": { fa: "شب", tr: "Akşam", en: "Evening" },
  "ct.morning": { fa: "صبح", tr: "sabah", en: "in the morning" },
  "ct.noon": { fa: "ظهر", tr: "öğle", en: "at midday" },
  "ct.afternoon": { fa: "عصر", tr: "öğleden sonra", en: "in the afternoon" },
  "ct.evening": { fa: "شب", tr: "akşam", en: "in the evening" },
  "heard.friend": { fa: "معرفی یک دوست", tr: "Bir arkadaşım", en: "A friend" },
  "heard.ig": { fa: "اینستاگرام", tr: "Instagram", en: "Instagram" },
  "heard.visit": { fa: "قبلاً مهمان ظفر بوده‌ام", tr: "Daha önce Zafar'da yemek yedim", en: "I have dined at Zafar" },
  "heard.hotel": { fa: "هتل یا کنسیرژ", tr: "Bir otel ya da konsiyerj", en: "A hotel or concierge" },
  "heard.other": { fa: "راه دیگر", tr: "Başka bir yol", en: "Another way" },
  // generic fields
  "f.date": { fa: "تاریخ", tr: "Tarih", en: "Date" },
  "f.time": { fa: "ساعت", tr: "Saat", en: "Time" },
  "f.guests": { fa: "تعداد مهمانان", tr: "Misafir sayısı", en: "Guests" },
  "f.address": { fa: "نشانی", tr: "Adres", en: "Address" },
  "f.from": { fa: "مبدأ", tr: "Nereden", en: "From" },
  "f.to": { fa: "مقصد", tr: "Nereye", en: "To" },
  "f.dir": { fa: "مسیر", tr: "Güzergâh", en: "Route" },
  "f.car": { fa: "خودرو", tr: "Araç", en: "Car" },
  "f.pax": { fa: "سرنشین", tr: "Yolcu", en: "Passengers" },
  "f.recipient": { fa: "گیرنده", tr: "Alıcı", en: "Recipient" },
  "f.rphone": { fa: "شماره‌ی گیرنده", tr: "Alıcının numarası", en: "Recipient's number" },
  "f.card": { fa: "متن کارت دست‌نویس", tr: "El yazısı kart için sözler", en: "Words for the handwritten card" },
  "f.company": { fa: "شرکت", tr: "Şirket", en: "Company" },
  "f.langs": { fa: "زبان مهمانان", tr: "Misafirlerin dili", en: "Guests' language" },
  "f.where": { fa: "محل", tr: "Yer", en: "Where" },
  "f.atZafar": { fa: "در ظفر", tr: "Zafar'da", en: "At Zafar" },
  "f.atHome": { fa: "در منزل", tr: "Evde", en: "At home" },
  "f.atOffice": { fa: "در دفتر کار", tr: "Ofiste", en: "At the office" },
  "f.ceremony": { fa: "مراسم", tr: "Tören", en: "Ceremony" },
  "f.khast": { fa: "خواستگاری", tr: "Kız isteme", en: "Khastegari (the asking)" },
  "f.baleh": { fa: "بله‌برون", tr: "Söz", en: "Baleh-boroon" },
  "f.aghd": { fa: "عقد", tr: "Nikâh", en: "Aghd (the wedding vows)" },
  "f.wish": { fa: "آرزوها", tr: "İstekler", en: "Wishes" },
  "f.flowers": { fa: "گل", tr: "Çiçekler", en: "Flowers" },
  "f.music": { fa: "نوازنده", tr: "Bir müzisyen", en: "A musician" },
  "f.photo": { fa: "عکاس", tr: "Bir fotoğrafçı", en: "A photographer" },
  "f.ring": { fa: "حلقه در دسر", tr: "Tatlının içinde yüzük", en: "The ring in dessert" },
  "f.partner": { fa: "نام او", tr: "Onun adı", en: "Their name" },
  "f.person": { fa: "صاحب تولد", tr: "Kimin doğum günü?", en: "Whose birthday" },
  "f.secret": { fa: "غافلگیری؛ با او تماس نگیرید", tr: "Sürpriz; onu aramayın", en: "A surprise — do not call them" },
  "f.purpose": { fa: "برای چه مناسبتی؟", tr: "Hangi vesileyle?", en: "For what occasion?" },
  "f.days": { fa: "از تا", tr: "Tarihler", en: "Dates" },
  "f.location": { fa: "شهر یا ویلا", tr: "Şehir ya da villa", en: "City or villa" },
  "f.dish": { fa: "چه چیزی در ذهن دارید؟", tr: "Aklınızda ne var?", en: "What do you have in mind?" },
  "f.diet": { fa: "رژیم یا حساسیت غذایی", tr: "Diyet ya da alerji", en: "Diet or allergies" },
  "f.ref": { fa: "چه کسی شما را معرفی می‌کند؟", tr: "Sizi kim tanıştırıyor?", en: "Who is introducing you?" },
  "f.dishes": { fa: "چه غذاهایی؟", tr: "Hangi yemekler?", en: "Which dishes?" },
  "f.event": { fa: "نوع مهمانی", tr: "Davetin türü", en: "Kind of gathering" },
  "f.occasion": { fa: "مناسبت", tr: "Vesile", en: "Occasion" },
  "f.nights": { fa: "چند شب؟", tr: "Kaç gece?", en: "How many nights?" },
  // generic
  "x.close": { fa: "بستن", tr: "Kapat", en: "Close" },
  "x.member": { fa: "عضو اعتبار ظفر", tr: "Etebar üyesi", en: "Etebar member" },
  "x.since": { fa: "عضو از", tr: "Üyelik başlangıcı", en: "Member since" },
  "x.powered": { fa: "Powered by Alpha Agency", tr: "Powered by Alpha Agency", en: "Powered by Alpha Agency" },

  // —— pages (v3)
  "nav.account": { fa: "حساب", tr: "Hesap", en: "Account" },
  "nav.login": { fa: "ورود", tr: "Giriş", en: "Sign in" },
  "next.k": { fa: "صفحه‌ی بعد", tr: "Sıradaki sayfa", en: "Next page" },
  "next.home": { fa: "بازگشت به درِ خانه‌ی ظفر", tr: "Zafar'ın kapısına dönün", en: "Back to Zafar's front door" },
  "next.menu": { fa: "۱۷۸ غذا از رستوران، صبحانه و کافه", tr: "Restoran, kahvaltı ve kafeden 178 lezzet", en: "178 dishes from the restaurant, breakfast and café" },
  "next.services": { fa: "سیزده خدمت ویژه، هر کدام با صفحه‌ی خودش", tr: "Her biri kendi sayfasıyla on üç özel hizmet", en: "Thirteen private services, each with its own page" },
  "next.circle": { fa: "اعتبار ظفر، تنها با دعوت", tr: "Yalnızca davetle: Zafar Etebar", en: "Zafar Etebar, by invitation only" },
  "next.account": { fa: "سه کارت و جایی که هر کدام کار می‌کند", tr: "Üç kart ve her birinin geçtiği yerler", en: "Three cards, and where each one works" },
  "next.occasions": { fa: "تاریخ‌هایتان را به ظفر بسپارید", tr: "Önemli tarihlerinizi Zafar'a bırakın", en: "Leave your dates with Zafar" },
  "next.visit": { fa: "نشانی، ساعات و تماس با میزبان", tr: "Adres, saatler ve ev sahibimiz", en: "Address, hours and our host" },
  "door.k": { fa: "در خانه‌ی ظفر", tr: "Zafar'ın evinde", en: "Inside the house" },
  "door.t": { fa: "از کدام در وارد می‌شوید؟", tr: "Hangi kapıdan girersiniz?", en: "Which door will you take?" },
  "door.menu": { fa: "{n} غذا، از صبحانه تا شام", tr: "Kahvaltıdan akşam yemeğine {n} lezzet", en: "{n} dishes, from breakfast to dinner" },
  "door.services": { fa: "{n} خدمت ویژه، در ظفر و در خانه‌ی شما", tr: "Zafar'da ve evinizde {n} özel hizmet", en: "{n} private services, at Zafar and at home" },
  "door.circle": { fa: "میزبان شخصی، کارت فلزی و حساب ظفر", tr: "Kişisel ev sahibi, metal kart ve Zafar Hesabı", en: "A personal host, a metal card, the Zafar Account" },
  "door.visit": { fa: "الهیه، تبریز · هر روز ۹ تا ۱۲ شب", tr: "Elahiyeh, Tebriz · her gün 09.00–24.00", en: "Elahiyeh, Tabriz · daily 9:00–24:00" },
  "sig.k": { fa: "پیشنهاد ظفر", tr: "Zafar'ın önerileri", en: "Zafar's picks" },
  "sig.t": { fa: "شش غذا که باید چشید.", tr: "Tadılması gereken altı tabak.", en: "Six dishes worth the visit." },
  "sig.p": { fa: "از هر بخش منو، یکی که سرآشپز ما به آن افتخار می‌کند.", tr: "Menünün her bölümünden, şefimizin gurur duyduğu bir tabak.", en: "One from each part of the menu, chosen by our chef." },
  "sig.all": { fa: "دیدن کل منو", tr: "Bütün menü", en: "The full menu" },
  "svc.all": { fa: "همه‌ی خدمات", tr: "Tüm hizmetler", en: "All services" },
  "svc.more": { fa: "بیشتر بدانید", tr: "Ayrıntılar", en: "Find out more" },
  "cir.more": { fa: "درباره‌ی اعتبار ظفر", tr: "Etebar hakkında", en: "About Etebar" },
  "menu.lede": { fa: "{n} غذا در سه منو: رستوران، صبحانه و کافه. پیشنهادهای ظفر نشان‌دار شده‌اند.", tr: "Üç menüde {n} lezzet: restoran, kahvaltı ve kafe. Zafar'ın önerileri işaretlidir.", en: "{n} dishes across three menus: the restaurant, breakfast and the café. Zafar's picks are marked." },
  "menu.found": { fa: "{n} نتیجه در هر سه منو", tr: "Üç menüde {n} sonuç", en: "{n} results across all three menus" },
  "how.k": { fa: "چگونه", tr: "Nasıl işler", en: "How it works" },
  "how.t": { fa: "هر خدمت، چهار قدم؛ بی‌فرم، بی‌پرداخت آنلاین.", tr: "Her hizmet dört adım; form yok, online ödeme yok.", en: "Every service in four steps: no forms, no online payment." },
  "grp.homeP": { fa: "سرآشپز، پیشخدمت‌ها و سفره‌ی ظفر، در خانه‌ی خودتان.", tr: "Zafar'ın şefi, garsonları ve sofrası, kendi evinizde.", en: "Zafar's chef, waiters and table, in your own home." },
  "grp.momentsP": { fa: "شب‌هایی که یک بار پیش می‌آیند، با دقت چیده می‌شوند.", tr: "Bir kez yaşanan geceler, özenle hazırlanır.", en: "Evenings that happen once, arranged with care." },
  "grp.giftsP": { fa: "ظفر را به کسی که دوستش دارید هدیه دهید.", tr: "Zafar'ı sevdiğiniz birine hediye edin.", en: "Give Zafar to someone you love." },
  "grp.conciergeP": { fa: "راننده‌ی ظفر و غذایی که فقط برای شما پخته می‌شود.", tr: "Zafar'ın şoförü ve yalnızca sizin için pişen yemek.", en: "Zafar's driver, and a dish cooked only for you." },
  "sd.pay": { fa: "رودررو یا روی حساب ظفر", tr: "Yüz yüze ya da Zafar Hesabı'na", en: "In person, or on your Zafar Account" },
  "sd.idea": { fa: "ایده‌ی شماره‌ی", tr: "Fikir no.", en: "Idea no." },
  "sd.inc": { fa: "آنچه در بر دارد", tr: "Neler dahil", en: "What is included" },
  "sd.know": { fa: "خوب است بدانید", tr: "Bilmeniz iyi olur", en: "Good to know" },
  "sd.host": { fa: "سؤالی دارید؟", tr: "Bir sorunuz mu var?", en: "A question first?" },
  "sd.hostP": { fa: "میزبان ما هر روز از ۹ صبح پاسخ می‌دهد.", tr: "Ev sahibimiz her gün sabah 9'dan itibaren yanıt verir.", en: "Our host answers every day from 9 a.m." },
  "sd.how": { fa: "از نامه تا آن شب", tr: "Mektuptan o geceye", en: "From your letter to the evening" },
  "sd.acc": { fa: "روی کدام کارت می‌نشیند؟", tr: "Hangi karta yazılabilir?", en: "Which cards can carry it?" },
  "sd.accAll": { fa: "همه‌ی قواعد کارت‌ها", tr: "Kartların tüm kuralları", en: "Every card rule" },
  "sd.rel": { fa: "در همین خانواده", tr: "Aynı aileden", en: "In the same family" },
  "sd.prev": { fa: "خدمت قبلی", tr: "Önceki hizmet", en: "Previous service" },
  "sd.next": { fa: "خدمت بعدی", tr: "Sonraki hizmet", en: "Next service" },
  "cir.pk": { fa: "امتیازهای عضویت", tr: "Üyeliğin ayrıcalıkları", en: "What membership brings" },
  "cir.pt": { fa: "شش چیز که فقط اعضا دارند.", tr: "Yalnızca üyelerin sahip olduğu altı şey.", en: "Six things only members have." },
  "tiers.k": { fa: "سه کارت", tr: "Üç kart", en: "Three cards" },
  "tiers.t": { fa: "فیروزه، طلایی، نوآر.", tr: "Turkuaz, Altın, Noir.", en: "Teal, Gold, Noir." },
  "tiers.where": { fa: "هر کارت کجا کار می‌کند", tr: "Her kart nerede geçer", en: "Where each card works" },
  "tiers.see": { fa: "دیدن کاربردها", tr: "Kullanım alanları", en: "See where it works" },
  "acc.free": { fa: "بدون سقف", tr: "Sınırsız", en: "No limit" },
  "acc.hk": { fa: "حساب چگونه کار می‌کند", tr: "Hesap nasıl işler", en: "How the account works" },
  "acc.ht": { fa: "یک امضا، یک صورت‌حساب، یک دیدار.", tr: "Bir imza, bir ekstre, bir buluşma.", en: "One signature, one statement, one meeting." },
  "join.k": { fa: "آغاز عضویت", tr: "Üyelik nasıl başlar", en: "How membership begins" },
  "join.t": { fa: "عضویت خریدنی نیست؛ با معرفی آغاز می‌شود.", tr: "Üyelik satın alınmaz; bir tanıştırmayla başlar.", en: "Membership is not bought; it begins with an introduction." },
  "join.1t": { fa: "یک معرفی", tr: "Bir tanıştırma", en: "An introduction" },
  "join.1p": { fa: "یکی از اعضا شما را معرفی می‌کند، یا خودتان نامه‌ای می‌نویسید.", tr: "Bir üye sizi tanıştırır ya da kendiniz bir mektup yazarsınız.", en: "A member introduces you, or you write us a letter yourself." },
  "join.2t": { fa: "یک دیدار رودررو", tr: "Yüz yüze bir buluşma", en: "A meeting in person" },
  "join.2p": { fa: "میزبان ما شما را به شامی در ظفر دعوت می‌کند تا آشنا شویم.", tr: "Ev sahibimiz tanışmak için sizi Zafar'da bir akşam yemeğine davet eder.", en: "Our host invites you to dinner at Zafar, so we can get to know you." },
  "join.3t": { fa: "کارت، با دست", tr: "Kartınız, elden", en: "Your card, by hand" },
  "join.3p": { fa: "کارت فلزی با نام شما حک می‌شود و در جعبه‌ای مهروموم‌شده به دستتان می‌رسد.", tr: "Metal kartınız adınızla kazınır ve mühürlü bir kutuda elinize ulaşır.", en: "Your metal card is engraved with your name and delivered in a wax-sealed box." },
  "use.k": { fa: "کاربرد کارت", tr: "Kartın kullanımı", en: "Where it works" },
  "use.t": { fa: "کارت {tier} کجا کار می‌کند", tr: "{tier} kart nerelerde geçer", en: "Where the {tier} card works" },
  "use.no": { fa: "این خدمت از کارت {tier} روی حساب می‌نشیند؛ پرداخت حضوری همیشه ممکن است.", tr: "Bu hizmet {tier} karttan itibaren hesaba yazılır; yüz yüze ödeme her zaman mümkündür.", en: "Charged to the account from the {tier} card up; paying in person is always possible." },
  "use.inperson": { fa: "فقط حضوری", tr: "yalnızca yüz yüze", en: "in person only" },
  "mx.k": { fa: "مقایسه", tr: "Karşılaştırma", en: "Compare" },
  "mx.t": { fa: "سه کارت، کنار هم.", tr: "Üç kart, yan yana.", en: "The three cards, side by side." },
  "mx.note": { fa: "هر خدمتی که روی کارتتان نیست، همچنان با پرداخت حضوری در دسترس است. میزبان شما سقف‌ها را در صورت نیاز بازبینی می‌کند.", tr: "Kartınızda olmayan her hizmet yüz yüze ödemeyle yine kullanılabilir. Ev sahibiniz gerektiğinde limitleri yeniden değerlendirir.", en: "Anything your card does not cover is still yours to enjoy, paid in person. Your host can review limits when you need it." },
  "occ.form": { fa: "یک تاریخ بسپارید", tr: "Bir tarih bırakın", en: "Leave a date with us" },
  "occ.needDate": { fa: "تاریخ مناسبت را انتخاب کنید.", tr: "Lütfen bir tarih seçin.", en: "Please choose the date." },
  "occ.again": { fa: "سپردن تاریخی دیگر", tr: "Başka bir tarih", en: "Leave another date" },
  "occ.ht": { fa: "شما یک بار می‌گویید؛ ظفر هر سال به یاد دارد.", tr: "Siz bir kez söylersiniz; Zafar her yıl hatırlar.", en: "You tell us once; Zafar remembers every year." },
  "occ.1t": { fa: "تاریخ را می‌سپارید", tr: "Tarihi bırakırsınız", en: "You leave the date" },
  "occ.1p": { fa: "سالگرد، تولد یا هر روزی که برایتان مهم است.", tr: "Yıl dönümü, doğum günü ya da sizin için önemli herhangi bir gün.", en: "An anniversary, a birthday, any day that matters to you." },
  "occ.2t": { fa: "یک هفته قبل، تماس", tr: "Bir hafta önce arama", en: "A call, a week before" },
  "occ.2p": { fa: "میزبان ما تماس می‌گیرد و شبی را پیشنهاد می‌دهد.", tr: "Ev sahibimiz arar ve bir akşam önerir.", en: "Our host calls and suggests an evening." },
  "occ.3t": { fa: "شبی که از قبل چیده شده", tr: "Önceden hazırlanmış bir akşam", en: "An evening already arranged" },
  "occ.3p": { fa: "میز، گل و کیک؛ پیش از رسیدنتان آماده است.", tr: "Masa, çiçekler ve pasta; siz gelmeden hazır.", en: "The table, the flowers, the cake, ready before you arrive." },
  "f.yourname": { fa: "نام شما", tr: "Adınız", en: "Your name" },
  "vis.p": { fa: "ظفر در الهیه‌ی تبریز است؛ هر روز از ۹ صبح تا نیمه‌شب. اگر بخواهید، راننده‌ی ظفر به دنبالتان می‌آید.", tr: "Zafar, Tebriz'in Elahiyeh semtinde; her gün sabah 9'dan gece yarısına kadar. İsterseniz Zafar'ın şoförü sizi alır.", en: "Zafar is in Elahiyeh, Tabriz, open daily from 9 a.m. to midnight. If you wish, Zafar's driver will come for you." },
  "vis.carT": { fa: "ظفر به دنبالتان می‌آید", tr: "Zafar sizi alır", en: "Zafar will collect you" },
  "vis.carP": { fa: "از خانه، فرودگاه یا هتل؛ با خودرو و راننده‌ی خودِ ظفر.", tr: "Evden, havalimanından ya da otelden; Zafar'ın kendi aracı ve şoförüyle.", en: "From home, the airport or your hotel, in Zafar's own car." },
  "vis.evT": { fa: "یک شب در ظفر", tr: "Zafar'da bir akşam", en: "An evening at Zafar" },
  "vis.evP": { fa: "میز آنلاین رزرو نمی‌شود؛ ببینید دعوت ظفر چگونه است.", tr: "Masa internetten ayrılmaz; Zafar'ın davetinin nasıl işlediğini görün.", en: "Tables are not booked online; see how Zafar's invitation works." },
  "in.k": { fa: "ورود", tr: "Giriş", en: "Sign in" },
  "in.t": { fa: "درِ پشتی ظفر.", tr: "Zafar'ın arka kapısı.", en: "Zafar's private door." },
  "in.p": { fa: "تیم ظفر از اینجا وارد پنل مدیرعامل می‌شود؛ اعضای اعتبار ظفر با کارت خودشان.", tr: "Zafar ekibi CEO paneline buradan girer; Etebar üyeleri kendi kartlarıyla.", en: "Zafar's team enters the CEO panel here; Etebar members use their own card." },
  "in.team": { fa: "تیم ظفر · پنل مدیرعامل", tr: "Zafar ekibi · CEO paneli", en: "Zafar team · CEO panel" },
  "in.teamP": { fa: "نامه‌ها، مهمانان، حساب‌ها و گزارش‌ها", tr: "Mektuplar, misafirler, hesaplar ve raporlar", en: "Letters, guests, accounts and reports" },
  "in.enter": { fa: "رمز چهاررقمی را وارد کنید", tr: "Dört haneli şifrenizi girin", en: "Enter your four-digit PIN" },
  "in.ok": { fa: "خوش آمدید. پنل باز می‌شود…", tr: "Hoş geldiniz. Panel açılıyor…", en: "Welcome. Opening the panel…" },
  "in.bad": { fa: "رمز درست نیست؛ دوباره امتحان کنید.", tr: "Şifre yanlış; tekrar deneyin.", en: "That PIN is not right; try again." },
  "in.del": { fa: "پاک کردن", tr: "Sil", en: "Delete" },
  "in.demo": { fa: "رمز دموی پنل:", tr: "Demo şifresi:", en: "Demo PIN:" },
  "in.already": { fa: "شما در این مرورگر وارد پنل شده‌اید.", tr: "Bu tarayıcıda panele zaten giriş yaptınız.", en: "You are already signed in on this browser." },
  "in.go": { fa: "ورود به پنل مدیرعامل", tr: "CEO paneline girin", en: "Open the CEO panel" },
  "in.out": { fa: "خروج", tr: "Çıkış", en: "Sign out" },
  "in.mem": { fa: "اعضای اعتبار ظفر", tr: "Etebar üyeleri", en: "Etebar members" },
  "in.memP": { fa: "بدون رمز، بدون حساب کاربری", tr: "Şifre yok, hesap yok", en: "No password, no account" },
  "in.tapP": { fa: "کارت فلزی‌تان را پشت گوشی بگیرید تا صفحه‌ی خصوصی‌تان باز شود.", tr: "Özel sayfanızı açmak için metal kartınızı telefonunuzun arkasına tutun.", en: "Hold your metal card to the back of your phone to open your private page." },
  "in.tap": { fa: "لمس کارت", tr: "Karta dokunun", en: "Tap your card" },
  "in.foot": { fa: "این در فقط برای تیم ظفر و اعضای اعتبار ظفر است. مهمانان عزیز، برای ما نامه بنویسید.", tr: "Bu kapı yalnızca Zafar ekibi ve Etebar üyeleri içindir. Değerli misafirlerimiz bize mektup yazabilir.", en: "This door is only for Zafar's team and Etebar members. Dear guests, simply write us a letter." },
  "foot.team": { fa: "ورود تیم ظفر", tr: "Zafar ekibi girişi", en: "Team sign-in" },
  "x.lost": { fa: "این در به جایی باز نمی‌شود.", tr: "Bu kapı bir yere açılmıyor.", en: "This door opens onto nothing." },
  "x.lostP": { fa: "صفحه‌ای که دنبالش بودید اینجا نیست؛ از درِ اصلی برگردید.", tr: "Aradığınız sayfa burada değil; ana kapıdan dönün.", en: "The page you were looking for is not here; come back through the front door." },
};
export const dict = S;
applyDir();
