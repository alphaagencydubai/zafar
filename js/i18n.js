// Three languages for the guest side: Persian (default, RTL), Azerbaijani Turkish
// (Latin script, LTR) and English (LTR). The CEO panel stays Persian.
const KEY = "zafar.lang";
export const LANGS = [["fa", "فا"], ["az", "AZ"], ["en", "EN"]];
let lang = "fa";
try { const s = localStorage.getItem(KEY); if (s && ["fa", "az", "en"].includes(s)) lang = s; } catch (e) {}
const q = new URLSearchParams(location.search).get("lang");
if (q && ["fa", "az", "en"].includes(q)) lang = q;

export const getLang = () => lang;
export const isFa = () => lang === "fa";
const subs = new Set();
export const onLang = (f) => subs.add(f);
export function setLang(l) {
  if (!["fa", "az", "en"].includes(l) || l === lang) return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch (e) {}
  applyDir();
  subs.forEach((f) => f(l));
}
export function applyDir() {
  const d = document.documentElement;
  d.lang = lang === "az" ? "az-Latn" : lang;
  d.dir = lang === "fa" ? "rtl" : "ltr";
  d.dataset.lang = lang;
}

const FA_D = "۰۱۲۳۴۵۶۷۸۹";
export const digits = (s) => (lang === "fa" ? String(s).replace(/[0-9]/g, (c) => FA_D[c]) : String(s));
export const faDigits = (s) => String(s).replace(/[0-9]/g, (c) => FA_D[c]);
export const num = (n) => digits(Math.round(n).toLocaleString("en-US")).replace(/,/g, lang === "fa" ? "٬" : ",");
// menu prices are thousand toman
export const kprice = (p) => num(p);
export const toman = (n) => (lang === "fa" ? `${num(n)} تومان` : lang === "az" ? `${num(n)} tümən` : `${num(n)} toman`);
export function mtoman(n) { // short form for big sums
  if (n >= 1e9) return (lang === "fa" ? digits((n / 1e9).toFixed(2).replace(/\.?0+$/, "")).replace(".", "٫") + " میلیارد تومان" : (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + (lang === "az" ? " mlrd tümən" : " bn toman"));
  if (n >= 1e6) return (lang === "fa" ? digits((n / 1e6).toFixed(1).replace(/\.0$/, "")).replace(".", "٫") + " میلیون تومان" : (n / 1e6).toFixed(1).replace(/\.0$/, "") + (lang === "az" ? " mln tümən" : " M toman"));
  return toman(n);
}

const LOC = () => (lang === "fa" ? "fa-IR-u-ca-persian" : lang === "az" ? "az-Latn" : "en-GB");
export function fdate(t, o = { day: "numeric", month: "long", year: "numeric" }) {
  try { return new Intl.DateTimeFormat(LOC(), o).format(new Date(t)); } catch (e) { return new Date(t).toDateString(); }
}
export const fday = (t) => fdate(t, { weekday: "long", day: "numeric", month: "long" });
export const ftime = (t) => fdate(t, { hour: "2-digit", minute: "2-digit", hour12: false });

export function honor(g, l = lang) {
  if (!g || !g.name) return "";
  const m = g.title !== "f";
  if (l === "fa") return `${m ? "آقای" : "خانم"} ${g.name}`;
  if (l === "az") return `${g.nameLat || g.name} ${m ? "bəy" : "xanım"}`;
  return `${m ? "Mr" : "Ms"} ${g.nameLat || g.name}`;
}
export const pick = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] ?? o.fa ?? o.en ?? "");

export function t(key, vars) {
  const e = S[key];
  let s = e ? e[lang] ?? e.en : key;
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
  return s;
}
// fill every [data-t] in a root
export function paint(root = document) {
  root.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  root.querySelectorAll("[data-th]").forEach((el) => { el.innerHTML = t(el.dataset.th); });
  root.querySelectorAll("[data-tp]").forEach((el) => { el.placeholder = t(el.dataset.tp); });
  root.querySelectorAll("[data-ta]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.ta)); });
}

const S = {
  // nav
  "nav.home": { fa: "خانه", az: "Ev", en: "Home" },
  "nav.menu": { fa: "منو", az: "Menyu", en: "Menu" },
  "nav.services": { fa: "خدمات", az: "Xidmətlər", en: "Services" },
  "nav.circle": { fa: "حلقه", az: "Dairə", en: "Circle" },
  "nav.visit": { fa: "دیدار", az: "Ünvan", en: "Visit" },
  "nav.letter": { fa: "نامه", az: "Məktub", en: "Letter" },
  "nav.write": { fa: "نامه به ظفر", az: "Zafara məktub", en: "Write to Zafar" },
  "nav.lang": { fa: "زبان", az: "Dil", en: "Language" },
  // hero
  "hero.eyebrow": { fa: "رستوران قاره‌ای · تبریز", az: "Kontinental restoran · Təbriz", en: "Continental restaurant · Tabriz" },
  "hero.lead": { fa: "میزی که با نام شما چیده می‌شود.", az: "Adınızla qurulan süfrə.", en: "A table set in your name." },
  "hero.sub": { fa: "در ظفر هیچ چیز با یک کلیک تمام نمی‌شود. هر درخواست به گفت‌وگویی شخصی با میزبان ما می‌رسد.", az: "Zafarda heç nə bir kliklə bitmir. Hər istək ev sahibimizlə şəxsi söhbətə çevrilir.", en: "At Zafar nothing ends with a click. Every request becomes a personal conversation with our host." },
  "hero.cta": { fa: "نامه‌ای به ظفر", az: "Zafara məktub yazın", en: "Write to Zafar" },
  "hero.menu": { fa: "دیدن منو", az: "Menyuya baxın", en: "View the menu" },
  "hero.welcome": { fa: "خوش آمدید، {name}", az: "Xoş gəlmisiniz, {name}", en: "Welcome, {name}" },
  "hero.back": { fa: "خوش برگشتید، {name}", az: "Yenidən xoş gəlmisiniz, {name}", en: "Welcome back, {name}" },
  "hero.scroll": { fa: "ادامه", az: "Davam", en: "Scroll" },
  "open.now": { fa: "اکنون باز است", az: "İndi açıqdır", en: "Open now" },
  "open.closed": { fa: "اکنون بسته است · از ۹ صبح", az: "İndi bağlıdır · 09:00-dan", en: "Closed now · opens 9:00" },
  "open.hours": { fa: "هر روز ۹ صبح تا ۱۲ شب", az: "Hər gün 09:00–24:00", en: "Daily 9:00–24:00" },
  // house
  "house.k": { fa: "خانه‌ی ظفر", az: "Zafar evi", en: "The House of Zafar" },
  "house.t": { fa: "مهمان‌نوازی، رودررو.", az: "Üz-üzə qonaqpərvərlik.", en: "Hospitality, face to face." },
  "house.p": { fa: "ظفر پرداخت آنلاین و رزرو اینترنتی ندارد؛ و این انتخاب ماست. دوست داریم مهمانانمان را ببینیم، صدایشان را بشنویم و با نام صدایشان کنیم. این سایت تنها درِ خانه است؛ پذیرایی همیشه با یک انسان آغاز می‌شود.", az: "Zafarda onlayn ödəniş və internet rezervasiyası yoxdur — bu, bizim seçimimizdir. Qonaqlarımızı görməyi, səslərini eşitməyi və onları adları ilə çağırmağı sevirik. Bu sayt yalnız evin qapısıdır; qonaqlıq həmişə bir insanla başlayır.", en: "Zafar takes no online payments and no internet reservations — by choice. We like to see our guests, hear their voices and call them by name. This site is only the front door; hospitality always begins with a person." },
  "rit.1t": { fa: "نامه، نه فرم", az: "Məktub, forma yox", en: "A letter, not a form" },
  "rit.1p": { fa: "درخواستتان را مثل یک نامه می‌نویسید و میزبان ما شخصاً با شما تماس می‌گیرد.", az: "İstəyinizi məktub kimi yazırsınız, ev sahibimiz sizə şəxsən zəng edir.", en: "You write your request as a letter, and our host calls you in person." },
  "rit.2t": { fa: "خوشامد با نام", az: "Adla qarşılama", en: "Welcomed by name" },
  "rit.2p": { fa: "پیش از رسیدنتان می‌دانیم چه کسی می‌آید؛ دم در با نام خودتان خوشامد می‌گوییم.", az: "Gəlişinizdən əvvəl kimin gəldiyini bilirik; qapıda sizi adınızla qarşılayırıq.", en: "We know who is arriving before you do; at the door, we greet you by name." },
  "rit.3t": { fa: "پرداخت، رودررو", az: "Ödəniş, üz-üzə", en: "Payment, in person" },
  "rit.3p": { fa: "هیچ پرداختی آنلاین نیست؛ سر میز، دم در، یا با حساب ظفر.", az: "Heç bir ödəniş onlayn deyil: masada, qapıda və ya Zafar Hesabı ilə.", en: "Nothing is paid online: at the table, at the door, or on your Zafar Account." },
  // menu
  "menu.k": { fa: "منو", az: "Menyu", en: "The Menu" },
  "menu.t": { fa: "از آشپزخانه‌ی ظفر", az: "Zafar mətbəxindən", en: "From Zafar's kitchen" },
  "menu.note": { fa: "قیمت‌ها به هزار تومان است.", az: "Qiymətlər min tümənlədir.", en: "Prices in thousand toman." },
  "menu.sig": { fa: "پیشنهاد ظفر", az: "Zafarın seçimi", en: "Zafar's pick" },
  "menu.search": { fa: "جست‌وجو در منو", az: "Menyuda axtarın", en: "Search the menu" },
  "menu.none": { fa: "چیزی پیدا نشد. شاید سرآشپز ما بتواند آن را فقط برای شما بپزد.", az: "Heç nə tapılmadı. Bəlkə aşbazımız onu yalnız sizin üçün bişirə bilər.", en: "Nothing found. Perhaps our chef can cook it just for you." },
  "menu.bespoke": { fa: "غذایی که فقط برای شما پخته می‌شود", az: "Yalnız sizin üçün bişirilən yemək", en: "A dish cooked only for you" },
  "menu.bespokeP": { fa: "سرآشپز ظفر برای مهمانان ویژه، غذایی اختصاصی طراحی می‌کند؛ با سلیقه، رژیم و خاطره‌ی شما.", az: "Zafarın aşbazı xüsusi qonaqlar üçün fərdi yemək hazırlayır — zövqünüzə, pəhrizinizə və xatirələrinizə görə.", en: "For our special guests, Zafar's chef designs a dish of your own — around your taste, your diet and your memories." },
  "menu.bespokeB": { fa: "درخواست غذای اختصاصی", az: "Fərdi yemək istəyin", en: "Request a bespoke dish" },
  "menu.items": { fa: "{n} انتخاب", az: "{n} seçim", en: "{n} dishes" },
  // services
  "svc.k": { fa: "خدمات ویژه", az: "Xüsusi xidmətlər", en: "Private Services" },
  "svc.t": { fa: "ظفر، هر جا که شما باشید.", az: "Harada olsanız, Zafar oradadır.", en: "Zafar, wherever you are." },
  "svc.p": { fa: "هر خدمت با یک نامه آغاز می‌شود و با تماس میزبان ما ادامه پیدا می‌کند. هیچ قیمتی از پیش تعیین نمی‌شود؛ همه چیز برای شما طراحی می‌شود.", az: "Hər xidmət bir məktubla başlayır və ev sahibimizin zəngi ilə davam edir. Heç bir qiymət əvvəlcədən müəyyən edilmir; hər şey sizin üçün hazırlanır.", en: "Every service begins with a letter and continues with a call from our host. Nothing is priced in advance; everything is designed around you." },
  "svc.req": { fa: "درخواست با نامه", az: "Məktubla istəyin", en: "Request by letter" },
  "grp.home": { fa: "ظفر در خانه‌ی شما", az: "Evinizdə Zafar", en: "Zafar at your home" },
  "grp.moments": { fa: "لحظه‌های ماندگار", az: "Unudulmaz anlar", en: "Moments that stay" },
  "grp.gifts": { fa: "هدیه", az: "Hədiyyə", en: "Gifts" },
  "grp.concierge": { fa: "کنسیرژ", az: "Konsyerj", en: "Concierge" },
  // chauffeur
  "car.k": { fa: "ظفر ماشین می‌فرستد", az: "Zafar maşın göndərir", en: "Zafar sends a car" },
  "car.t": { fa: "از هر جا تا ظفر. از ظفر تا هر جا.", az: "Hər yerdən Zafara. Zafardan hər yerə.", en: "From anywhere to Zafar. From Zafar to anywhere." },
  "car.p": { fa: "راننده‌ی ظفر با خودروی خودِ ظفر به دنبالتان می‌آید و پس از شام، شما را به هر نقطه‌ای که بخواهید می‌رساند؛ از خانه، فرودگاه، هتل یا دفتر کار.", az: "Zafarın sürücüsü Zafarın öz avtomobili ilə sizi götürür və şam yeməyindən sonra istədiyiniz yerə — evə, hava limanına, otelə və ya ofisə çatdırır.", en: "Zafar's own driver collects you in Zafar's own car, and after dinner takes you wherever you wish — home, the airport, your hotel or your office." },
  "car.to": { fa: "به ظفر", az: "Zafara", en: "To Zafar" },
  "car.from": { fa: "از ظفر", az: "Zafardan", en: "From Zafar" },
  "car.round": { fa: "رفت و برگشت", az: "Gediş-dönüş", en: "Round trip" },
  "car.anywhere": { fa: "هر جا", az: "Hər yer", en: "Anywhere" },
  "car.sedan": { fa: "سدان", az: "Sedan", en: "Sedan" },
  "car.exec": { fa: "اجرایی", az: "Executive", en: "Executive" },
  "car.van": { fa: "ون خانوادگی", az: "Ailə mikroavtobusu", en: "Family van" },
  "car.cta": { fa: "درخواست راننده", az: "Sürücü istəyin", en: "Request a driver" },
  "car.f1": { fa: "راننده‌ی ثابت ظفر، با نام و عکس", az: "Adı və şəkli ilə daimi Zafar sürücüsü", en: "A named Zafar driver, photo and all" },
  "car.f2": { fa: "خودروی خودِ ظفر، نه تاکسی اینترنتی", az: "Zafarın öz avtomobili, taksi yox", en: "Zafar's own car, never a ride-hail" },
  "car.f3": { fa: "هزینه روی صورت‌حساب شام یا حساب ظفر", az: "Haqqı şam hesabına və ya Zafar Hesabına", en: "Added to your bill or Zafar Account" },
  // circle
  "cir.k": { fa: "حلقه‌ی ظفر", az: "Zafar Dairəsi", en: "Zafar Circle" },
  "cir.t": { fa: "تنها با دعوت.", az: "Yalnız dəvətlə.", en: "By invitation only." },
  "cir.p": { fa: "حلقه‌ی ظفر جمع کوچکی از مهمانانی است که ظفر آنها را به نام می‌شناسد. هر عضو میزبان شخصی خودش، کارت فلزی NFC خودش و حسابی دارد که هرگز لازم نیست سر میز کیف پول باز کند.", az: "Zafar Dairəsi Zafarın adla tanıdığı kiçik qonaq çevrəsidir. Hər üzvün öz şəxsi ev sahibi, öz metal NFC kartı və masada heç vaxt pul kisəsi açmağı tələb etməyən hesabı var.", en: "Zafar Circle is a small company of guests Zafar knows by name. Each member has a personal host, a metal NFC card of their own, and an account that never asks them to open a wallet at the table." },
  "cir.p1t": { fa: "میزبان شخصی، خط مستقیم", az: "Şəxsi ev sahibi, birbaşa xətt", en: "A personal host, a direct line" },
  "cir.p1": { fa: "یک نفر که شما را می‌شناسد و همیشه پاسخ می‌دهد.", az: "Sizi tanıyan və həmişə cavab verən bir nəfər.", en: "One person who knows you, and always answers." },
  "cir.p2t": { fa: "کارت فلزی NFC", az: "Metal NFC kartı", en: "The metal NFC card" },
  "cir.p2": { fa: "گوشی را به کارت بزنید؛ صفحه‌ی خصوصی‌تان باز می‌شود. بدون رمز، بدون حساب کاربری.", az: "Telefonu karta toxundurun — şəxsi səhifəniz açılır. Parol yox, istifadəçi hesabı yox.", en: "Tap your phone to the card and your private page opens. No password, no account to create." },
  "cir.p3t": { fa: "نگهبان مناسبت‌ها", az: "Xüsusi günlərin keşikçisi", en: "The occasion keeper" },
  "cir.p3": { fa: "یک هفته پیش از هر تاریخ مهم، میزبانتان تماس می‌گیرد.", az: "Hər vacib tarixdən bir həftə əvvəl ev sahibiniz zəng edir.", en: "A week before every date that matters, your host calls." },
  "cir.p4t": { fa: "هدیه‌ی سالروز عضویت", az: "Üzvlük ildönümü hədiyyəsi", en: "A gift on your anniversary" },
  "cir.p4": { fa: "هر سال در سالروز پیوستنتان، هدیه‌ای شخصی از ظفر.", az: "Hər il qoşulduğunuz gündə Zafardan şəxsi hədiyyə.", en: "Each year on the day you joined, a personal gift from Zafar." },
  "cir.p5t": { fa: "غذای اختصاصی", az: "Fərdi yemək", en: "Your own dish" },
  "cir.p5": { fa: "سرآشپز برای شما غذایی می‌پزد که در منو نیست.", az: "Aşbaz sizin üçün menyuda olmayan yemək bişirir.", en: "The chef cooks for you what is not on the menu." },
  "cir.p6t": { fa: "حساب ظفر", az: "Zafar Hesabı", en: "The Zafar Account" },
  "cir.p6": { fa: "امضا کنید و بروید؛ تسویه ماهانه و رودررو.", az: "İmzalayın və gedin; aylıq və üz-üzə hesablaşma.", en: "Sign and leave; settle monthly, in person." },
  "cir.req": { fa: "درخواست معرفی به حلقه", az: "Dairəyə təqdim olunmaq", en: "Ask to be introduced" },
  "cir.tap": { fa: "کارت دارید؟ لمس کنید", az: "Kartınız var? Toxunun", en: "Have a card? Tap it" },
  "tier.teal": { fa: "فیروزه", az: "Firuzə", en: "Teal" },
  "tier.gold": { fa: "طلایی", az: "Qızılı", en: "Gold" },
  "tier.noir": { fa: "نوآر", az: "Noir", en: "Noir" },
  "tier.tealP": { fa: "برای مهمانان همیشگی", az: "Daimi qonaqlar üçün", en: "For our regulars" },
  "tier.goldP": { fa: "برای خانواده‌هایی که ظفر را خانه‌ی دوم می‌دانند", az: "Zafarı ikinci evi sayan ailələr üçün", en: "For families who call Zafar a second home" },
  "tier.noirP": { fa: "تنها با دعوت مالک ظفر", az: "Yalnız Zafarın sahibinin dəvəti ilə", en: "Only by the owner's invitation" },
  // account
  "acc.k": { fa: "حساب ظفر", az: "Zafar Hesabı", en: "The Zafar Account" },
  "acc.t": { fa: "امضا کنید. بروید.", az: "İmzalayın. Gedin.", en: "Sign. And simply leave." },
  "acc.p": { fa: "به سبک باشگاه‌های قدیمی و معتبرترین کارت‌های شارژ جهان، اما فقط برای ظفر؛ و همیشه رودررو.", az: "Köhnə klubların və dünyanın ən nüfuzlu kart hesablarının ruhunda — amma yalnız Zafar üçün və həmişə üz-üzə.", en: "In the spirit of the old clubs and the world's finest charge cards — made only for Zafar, and always in person." },
  "acc.f1t": { fa: "امضا، به‌جای پرداخت", az: "Ödəniş yerinə imza", en: "A signature, not a payment" },
  "acc.f1": { fa: "سر میز صورت‌حساب را امضا می‌کنید؛ نه کارتی، نه کیف پولی.", az: "Masada hesabı imzalayırsınız — nə kart, nə pul kisəsi.", en: "At the table you sign the bill. No card, no wallet." },
  "acc.f2t": { fa: "یک صورت‌حساب در ماه", az: "Ayda bir hesab", en: "One statement a month" },
  "acc.f2": { fa: "صورت‌حساب ریز و مهرشده، در پاکتی مهر و موم شده به دستتان می‌رسد.", az: "Ətraflı, möhürlü hesab möhürlənmiş zərfdə əlinizə çatır.", en: "Itemised, sealed, and hand-delivered in a wax-sealed envelope." },
  "acc.f3t": { fa: "تسویه، فقط رودررو", az: "Hesablaşma, yalnız üz-üzə", en: "Settled only in person" },
  "acc.f3": { fa: "نقد یا کارت، با میزبان خودتان؛ هرگز آنلاین.", az: "Nağd və ya kartla, öz ev sahibinizlə; heç vaxt onlayn.", en: "Cash or card, with your own host. Never online." },
  "acc.f4t": { fa: "بدون سقف از پیش تعیین‌شده", az: "Əvvəlcədən limit yoxdur", en: "No preset spending limit" },
  "acc.f4": { fa: "در سطح نوآر، اعتبار با شما رشد می‌کند.", az: "Noir səviyyəsində kredit sizinlə birlikdə böyüyür.", en: "At Noir, your credit grows with you." },
  "acc.f5t": { fa: "کارت‌های همراه", az: "Əlavə kartlar", en: "Companion cards" },
  "acc.f5": { fa: "برای همسر و فرزندان، با سقف و نام خودشان.", az: "Həyat yoldaşı və övladlar üçün, öz adları və limitləri ilə.", en: "For your spouse and children, each with their own name and limit." },
  "acc.f6t": { fa: "همه‌ی ظفر روی یک حساب", az: "Bütün Zafar bir hesabda", en: "All of Zafar on one account" },
  "acc.f6": { fa: "شام، سرو در منزل، راننده، هدیه و مراسم.", az: "Şam yeməyi, evdə xidmət, sürücü, hədiyyə və mərasimlər.", en: "Dinners, home serving, the driver, gifts and ceremonies." },
  "acc.stmt": { fa: "صورت‌حساب آبان", az: "Noyabr hesabı", en: "November statement" },
  "acc.bal": { fa: "مانده‌ی این دوره", az: "Bu dövrün balansı", en: "Balance this period" },
  "acc.due": { fa: "تسویه با میزبان: ۵ آذر", az: "Ev sahibi ilə hesablaşma: 26 noyabr", en: "Settle with your host: 26 November" },
  "acc.limit": { fa: "سقف", az: "Limit", en: "Limit" },
  "acc.nolimit": { fa: "بدون سقف از پیش تعیین‌شده", az: "Əvvəlcədən limit yoxdur", en: "No preset limit" },
  // occasions
  "occ.k": { fa: "نگهبان مناسبت‌ها", az: "Xüsusi günlərin keşikçisi", en: "The Occasion Keeper" },
  "occ.t": { fa: "تاریخ‌هایی که نباید فراموش شوند.", az: "Unudulmamalı olan tarixlər.", en: "Dates that must not be forgotten." },
  "occ.p": { fa: "سالگرد ازدواج، تولد همسر، روز خاص فرزندتان؛ تاریخ را به ما بسپارید. یک هفته قبل، میزبان ما تماس می‌گیرد و شبی را پیشنهاد می‌دهد.", az: "Evlilik ildönümü, həyat yoldaşınızın ad günü, övladınızın xüsusi günü — tarixi bizə həvalə edin. Bir həftə əvvəl ev sahibimiz zəng edib bir axşam təklif edəcək.", en: "A wedding anniversary, your spouse's birthday, your child's special day — leave the date with us. A week before, our host will call and suggest an evening." },
  "occ.type": { fa: "مناسبت", az: "Münasibət", en: "Occasion" },
  "occ.bday": { fa: "تولد", az: "Ad günü", en: "Birthday" },
  "occ.anniv": { fa: "سالگرد ازدواج", az: "Evlilik ildönümü", en: "Wedding anniversary" },
  "occ.engage": { fa: "سالگرد نامزدی", az: "Nişan ildönümü", en: "Engagement anniversary" },
  "occ.other": { fa: "روزی خاص", az: "Xüsusi gün", en: "A special day" },
  "occ.whose": { fa: "برای چه کسی؟", az: "Kimin üçün?", en: "For whom?" },
  "occ.date": { fa: "تاریخ", az: "Tarix", en: "Date" },
  "occ.save": { fa: "به ظفر بسپارید", az: "Zafara həvalə edin", en: "Leave it with Zafar" },
  "occ.done": { fa: "سپرده شد. {date} میزبان ما با شما تماس می‌گیرد.", az: "Həvalə olundu. {date} ev sahibimiz sizə zəng edəcək.", en: "Kept. Our host will call you on {date}." },
  "occ.need": { fa: "نام و شماره‌تان را هم بنویسید تا بدانیم با چه کسی تماس بگیریم.", az: "Kimə zəng edəcəyimizi bilməyimiz üçün adınızı və nömrənizi də yazın.", en: "Add your name and number so we know whom to call." },
  // cta
  "cta.t": { fa: "هر چه در ذهن دارید، برای ما بنویسید.", az: "Ağlınızda nə varsa, bizə yazın.", en: "Whatever you have in mind, write to us." },
  "cta.p": { fa: "میزبان ما نامه‌تان را می‌خواند و خودش تماس می‌گیرد.", az: "Ev sahibimiz məktubunuzu oxuyur və özü zəng edir.", en: "Our host reads your letter and calls you personally." },
  "cta.b": { fa: "نوشتن نامه", az: "Məktub yazın", en: "Write a letter" },
  // visit
  "vis.k": { fa: "دیدار", az: "Ünvan", en: "Visit" },
  "vis.t": { fa: "در الهیه، تبریز.", az: "Elahiyyədə, Təbriz.", en: "In Elahiyeh, Tabriz." },
  "vis.addr": { fa: "تبریز، الهیه، میدان فهمیده به سمت باغمیشه، نبش خیابان ظفر", az: "Təbriz, Elahiyyə, Fəhmidə meydanından Bağmişəyə doğru, Zafar küçəsinin tini", en: "Zafar St corner, from Fahmideh Sq towards Baghmisheh, Elahiyeh, Tabriz" },
  "vis.hours": { fa: "ساعات پذیرایی", az: "İş saatları", en: "Hours" },
  "vis.call": { fa: "تماس با میزبان", az: "Ev sahibinə zəng", en: "Call our host" },
  "vis.phone": { fa: "تلفن", az: "Telefon", en: "Telephone" },
  "vis.mobile": { fa: "موبایل", az: "Mobil", en: "Mobile" },
  "vis.dir": { fa: "مسیریابی", az: "Yol tarifi", en: "Directions" },
  "vis.neshan": { fa: "مسیریابی با نشان", az: "Neshan ilə yol tarifi", en: "Directions · Neshan" },
  "vis.ig": { fa: "اینستاگرام", az: "Instagram", en: "Instagram" },
  "vis.addrL": { fa: "نشانی", az: "Ünvan", en: "Address" },
  "foot.rights": { fa: "ظفر کانتیننتال، تبریز", az: "Zafar Continental, Təbriz", en: "Zafar Continental, Tabriz" },
  "foot.member": { fa: "ورود اعضای حلقه", az: "Dairə üzvlərinin girişi", en: "Circle members" },
  // letter
  "let.dear": { fa: "ظفر عزیز،", az: "Əziz Zafar,", en: "Dear Zafar," },
  "let.iam": { fa: "من", az: "Mən", en: "I am" },
  "let.am": { fa: "هستم و مایلم", az: "və istərdim ki,", en: "and I would like to request" },
  "let.req": { fa: "را درخواست کنم.", az: "xidmətini istəyim.", en: "." },
  "let.call1": { fa: "لطفاً با شماره‌ی", az: "Zəhmət olmasa", en: "Please call me on" },
  "let.call2": { fa: "تماس بگیرید؛ بهترین زمان تماس", az: "nömrəsinə zəng edin; ən yaxşı vaxt", en: "— the best time to reach me is" },
  "let.call3": { fa: "است.", az: "olacaq.", en: "." },
  "let.note": { fa: "اگر نکته‌ای هست، اینجا بنویسید…", az: "Əlavə etmək istədiyiniz bir şey varsa, buraya yazın…", en: "Anything else you would like us to know…" },
  "let.heard": { fa: "با ظفر از کجا آشنا شدید؟", az: "Zafarı haradan tanıyırsınız?", en: "How did you come to know Zafar?" },
  "let.sign": { fa: "ارادتمند،", az: "Hörmətlə,", en: "Yours sincerely," },
  "let.send": { fa: "مهر و ارسال نامه", az: "Möhürləyib göndərin", en: "Seal and send" },
  "let.close": { fa: "بستن", az: "Bağla", en: "Close" },
  "let.service": { fa: "موضوع نامه", az: "Məktubun mövzusu", en: "Subject" },
  "let.name": { fa: "نام شما", az: "Adınız", en: "your name" },
  "let.phone": { fa: "۰۹۱۲…", az: "09…", en: "09…" },
  "let.m": { fa: "آقای", az: "cənab", en: "Mr" },
  "let.f": { fa: "خانم", az: "xanım", en: "Ms" },
  "let.sent": { fa: "نامه‌ی شما به ظفر رسید.", az: "Məktubunuz Zafara çatdı.", en: "Your letter has reached Zafar." },
  "let.sentP": { fa: "{name}، میزبان ما نامه‌تان را می‌خواند و {time} شخصاً با شما تماس می‌گیرد. هیچ پرداختی لازم نیست.", az: "{name}, ev sahibimiz məktubunuzu oxuyacaq və {time} sizə şəxsən zəng edəcək. Heç bir ödəniş tələb olunmur.", en: "{name}, our host will read your letter and call you personally {time}. No payment is needed." },
  "let.ref": { fa: "شماره‌ی نامه", az: "Məktub nömrəsi", en: "Letter no." },
  "let.missing": { fa: "نام و شماره‌ی تماس را بنویسید تا میزبان بتواند با شما تماس بگیرد.", az: "Ev sahibinin sizə zəng edə bilməsi üçün ad və nömrə yazın.", en: "Please add your name and number so our host can call you." },
  "let.another": { fa: "نامه‌ای دیگر", az: "Başqa məktub", en: "Another letter" },
  "ct.morning": { fa: "صبح", az: "səhər", en: "in the morning" },
  "ct.noon": { fa: "ظهر", az: "günorta", en: "at midday" },
  "ct.afternoon": { fa: "عصر", az: "axşamüstü", en: "in the afternoon" },
  "ct.evening": { fa: "شب", az: "axşam", en: "in the evening" },
  "heard.friend": { fa: "معرفی یک دوست", az: "Dostun tövsiyəsi", en: "A friend" },
  "heard.ig": { fa: "اینستاگرام", az: "Instagram", en: "Instagram" },
  "heard.visit": { fa: "قبلاً مهمان ظفر بوده‌ام", az: "Əvvəllər Zafarın qonağı olmuşam", en: "I have dined at Zafar" },
  "heard.hotel": { fa: "هتل یا کنسیرژ", az: "Otel və ya konsyerj", en: "A hotel or concierge" },
  "heard.other": { fa: "راه دیگر", az: "Başqa yol", en: "Another way" },
  // generic fields
  "f.date": { fa: "تاریخ", az: "Tarix", en: "Date" },
  "f.time": { fa: "ساعت", az: "Saat", en: "Time" },
  "f.guests": { fa: "تعداد مهمانان", az: "Qonaq sayı", en: "Guests" },
  "f.address": { fa: "نشانی", az: "Ünvan", en: "Address" },
  "f.from": { fa: "مبدأ", az: "Haradan", en: "From" },
  "f.to": { fa: "مقصد", az: "Haraya", en: "To" },
  "f.dir": { fa: "مسیر", az: "Marşrut", en: "Route" },
  "f.car": { fa: "خودرو", az: "Avtomobil", en: "Car" },
  "f.pax": { fa: "سرنشین", az: "Sərnişin", en: "Passengers" },
  "f.recipient": { fa: "گیرنده", az: "Alan şəxs", en: "Recipient" },
  "f.rphone": { fa: "شماره‌ی گیرنده", az: "Alanın nömrəsi", en: "Recipient's number" },
  "f.card": { fa: "متن کارت دست‌نویس", az: "Əl yazılı kartın mətni", en: "Words for the handwritten card" },
  "f.company": { fa: "شرکت", az: "Şirkət", en: "Company" },
  "f.langs": { fa: "زبان مهمانان", az: "Qonaqların dili", en: "Guests' language" },
  "f.where": { fa: "محل", az: "Yer", en: "Where" },
  "f.atZafar": { fa: "در ظفر", az: "Zafarda", en: "At Zafar" },
  "f.atHome": { fa: "در منزل", az: "Evdə", en: "At home" },
  "f.atOffice": { fa: "در دفتر کار", az: "Ofisdə", en: "At the office" },
  "f.ceremony": { fa: "مراسم", az: "Mərasim", en: "Ceremony" },
  "f.khast": { fa: "خواستگاری", az: "Elçilik", en: "Khastegari (the asking)" },
  "f.baleh": { fa: "بله‌برون", az: "Hə alma (söz kəsmə)", en: "Baleh-boroon" },
  "f.aghd": { fa: "عقد", az: "Kəbin", en: "Aghd (the wedding vows)" },
  "f.wish": { fa: "آرزوها", az: "İstəklər", en: "Wishes" },
  "f.flowers": { fa: "گل", az: "Gül", en: "Flowers" },
  "f.music": { fa: "نوازنده", az: "Musiqiçi", en: "A musician" },
  "f.photo": { fa: "عکاس", az: "Fotoqraf", en: "A photographer" },
  "f.ring": { fa: "حلقه در دسر", az: "Desertdə üzük", en: "The ring in dessert" },
  "f.partner": { fa: "نام او", az: "Onun adı", en: "Their name" },
  "f.person": { fa: "صاحب تولد", az: "Ad günü sahibi", en: "Whose birthday" },
  "f.secret": { fa: "غافلگیری؛ با او تماس نگیرید", az: "Sürpriz — ona zəng etməyin", en: "A surprise — do not call them" },
  "f.purpose": { fa: "برای چه مناسبتی؟", az: "Hansı münasibətlə?", en: "For what occasion?" },
  "f.days": { fa: "از تا", az: "Tarixlər", en: "Dates" },
  "f.location": { fa: "شهر یا ویلا", az: "Şəhər və ya villa", en: "City or villa" },
  "f.dish": { fa: "چه چیزی در ذهن دارید؟", az: "Ağlınızda nə var?", en: "What do you have in mind?" },
  "f.diet": { fa: "رژیم یا حساسیت غذایی", az: "Pəhriz və ya allergiya", en: "Diet or allergies" },
  "f.ref": { fa: "چه کسی شما را معرفی می‌کند؟", az: "Sizi kim təqdim edir?", en: "Who is introducing you?" },
  "f.dishes": { fa: "چه غذاهایی؟", az: "Hansı yeməklər?", en: "Which dishes?" },
  "f.event": { fa: "نوع مهمانی", az: "Qonaqlığın növü", en: "Kind of gathering" },
  "f.occasion": { fa: "مناسبت", az: "Münasibət", en: "Occasion" },
  "f.nights": { fa: "چند شب؟", az: "Neçə gecə?", en: "How many nights?" },
  // generic
  "x.close": { fa: "بستن", az: "Bağla", en: "Close" },
  "x.member": { fa: "عضو حلقه", az: "Dairə üzvü", en: "Circle member" },
  "x.since": { fa: "عضو از", az: "Üzv", en: "Member since" },
  "x.powered": { fa: "Powered by Alpha Agency", az: "Powered by Alpha Agency", en: "Powered by Alpha Agency" },
};
export const dict = S;
applyDir();
