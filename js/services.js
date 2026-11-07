// The services Zafar chose from Alpha's idea book (numbers are the PDF's).
// Every one is requested by letter; the host calls; nothing is paid online.
export const GROUPS = ["home", "moments", "gifts", "concierge"];

const F = {
  date: { k: "date", type: "date", l: "f.date" },
  time: { k: "time", type: "time", l: "f.time" },
  guests: { k: "guests", type: "num", l: "f.guests", min: 1, max: 400 },
  address: { k: "address", type: "text", l: "f.address" },
  note: { k: "note", type: "area" },
};

export const SERVICES = [
  { id: "visit", group: null, img: "s_0.4", fields: [F.date, F.guests, { k: "occasion", type: "text", l: "f.occasion" }],
    t: { fa: "دیدار با ظفر", az: "Zafara gəliş", en: "An evening at Zafar" },
    s: { fa: "میز رزرو نمی‌شود؛ میزبان ما تماس می‌گیرد و شما را دعوت می‌کند.", az: "Masa rezerv olunmur — ev sahibimiz zəng edib sizi dəvət edir.", en: "Tables are not booked online — our host calls and invites you." } },
  // ——— Zafar at your home
  { id: "home", n: 8, group: "home", img: "s_1.4", fields: [F.date, F.guests, F.address, { k: "occasion", type: "text", l: "f.occasion" }],
    t: { fa: "سرو VIP در منزل", az: "Evdə VIP xidmət", en: "VIP serving at home" },
    s: { fa: "سرآشپز، پیشخدمت‌ها، ظروف و چیدمان میزِ خود ظفر، در خانه‌ی شما.", az: "Zafarın aşbazı, ofisiantları, qabları və süfrə tərtibatı — sizin evinizdə.", en: "Zafar's chef, waiters, tableware and table setting — in your own home." },
    d: { fa: "مهمانی شما با همان استانداردی برگزار می‌شود که در سالن ظفر؛ از چیدمان میز تا آخرین فنجان چای.", az: "Qonaqlığınız Zafarın zalındakı standartla keçir — süfrədən son fincan çaya qədər.", en: "Your gathering is hosted to the very standard of Zafar's dining room, from the table setting to the last cup of tea." } },
  { id: "chef", n: 11, group: "home", img: "s_5.4", fields: [{ k: "date", type: "date", l: "f.date" }, { k: "nights", type: "num", l: "f.nights", min: 1, max: 30 }, { k: "location", type: "text", l: "f.location" }, F.guests],
    t: { fa: "سرآشپز مقیم", az: "Rezident aşbaz", en: "Chef in residence" },
    s: { fa: "سرآشپز ظفر چند شب در ویلای شما می‌ماند و برای خانواده آشپزی می‌کند.", az: "Zafarın aşbazı bir neçə gecə villanızda qalır və ailəniz üçün yemək bişirir.", en: "Zafar's chef stays at your villa for a few nights and cooks for your family." },
    d: { fa: "برای تعطیلات نوروز، سفرهای خانوادگی یا مهمانی‌های چندروزه.", az: "Novruz bayramı, ailə səfərləri və ya bir neçə günlük qonaqlıqlar üçün.", en: "For the Nowruz holidays, family trips or gatherings that last several days." } },
  { id: "delivery", n: 12, group: "home", img: "s_6.6", fields: [F.date, F.time, F.address, { k: "dishes", type: "text", l: "f.dishes" }],
    t: { fa: "تحویل دستی با کارکنان ظفر", az: "Zafar əməkdaşları ilə çatdırılma", en: "Hand-delivered by Zafar's own staff" },
    s: { fa: "غذا را کارکنان یونیفرم‌پوش خود ظفر می‌آورند، نه پیک. پرداخت با کارتخوان، دم در.", az: "Yeməyi kuryer yox, Zafarın uniformalı əməkdaşları gətirir. Ödəniş qapıda, POS ilə.", en: "Your dishes arrive with Zafar's uniformed staff, never a courier. Payment by card reader, at your door." } },
  { id: "protocol", n: 13, group: "home", img: "s_14.2", fields: [F.date, F.guests, { k: "event", type: "text", l: "f.event" }, { k: "where", type: "choice", l: "f.where", opts: ["f.atZafar", "f.atHome"] }],
    t: { fa: "تشریفات میز", az: "Süfrə protokolu", en: "Table protocol" },
    s: { fa: "سرپیشخدمت ظفر چیدمان نشستن و آداب یک ضیافت مهم را برای شما برنامه‌ریزی می‌کند.", az: "Zafarın baş ofisiantı vacib bir ziyafətin oturma planını və adabını sizin üçün hazırlayır.", en: "Zafar's maître d' plans the seating and etiquette of an important dinner for you." } },
  // ——— Moments
  { id: "ceremony", n: 15, group: "moments", img: "s_2.6", fields: [{ k: "ceremony", type: "choice", l: "f.ceremony", opts: ["f.khast", "f.baleh", "f.aghd"] }, F.date, F.guests, { k: "where", type: "choice", l: "f.where", opts: ["f.atZafar", "f.atHome"] }],
    t: { fa: "خواستگاری، بله‌برون و عقد", az: "Elçilik, hə alma və kəbin", en: "Khastegari, Baleh-boroon & Aghd" },
    s: { fa: "پذیرایی ظفر در مهم‌ترین مراسم خانوادگی؛ در سالن خصوصی یا در منزل.", az: "Ən vacib ailə mərasimlərində Zafarın qonaqlığı — xüsusi zalda və ya evdə.", en: "Zafar's hospitality for the family's most important ceremonies — in a private salon or at home." } },
  { id: "proposal", n: 16, group: "moments", img: "s_10.6", fields: [F.date, { k: "partner", type: "text", l: "f.partner" }, { k: "wish", type: "checks", l: "f.wish", opts: ["f.flowers", "f.music", "f.photo", "f.ring"] }],
    t: { fa: "درخواست ازدواج", az: "Evlilik təklifi", en: "The proposal" },
    s: { fa: "سالنی خصوصی، گل، نوازنده و لحظه‌ای که از قبل با دقت چیده شده است.", az: "Xüsusi zal, güllər, musiqiçi və əvvəlcədən diqqətlə qurulmuş bir an.", en: "A private salon, flowers, a musician — and a moment arranged with great care." } },
  { id: "birthday", n: 17, group: "moments", img: "s_11.6", fields: [F.date, { k: "person", type: "text", l: "f.person" }, F.guests, { k: "secret", type: "check", l: "f.secret" }],
    t: { fa: "تولد غافلگیرانه", az: "Sürpriz ad günü", en: "A surprise birthday" },
    s: { fa: "میزبان ما پنهانی با خانواده هماهنگ می‌کند و همه چیز را می‌چیند.", az: "Ev sahibimiz ailə ilə gizlicə razılaşır və hər şeyi qurur.", en: "Our host quietly arranges everything with the family." } },
  { id: "business", n: 19, group: "moments", img: "s_7.6", fields: [{ k: "company", type: "text", l: "f.company" }, F.date, F.guests, { k: "langs", type: "checks", l: "f.langs", opts: ["lang.fa", "lang.en", "lang.tr", "lang.ar"] }, { k: "where", type: "choice", l: "f.where", opts: ["f.atZafar", "f.atOffice"] }],
    t: { fa: "شام‌های کاری و هیئت‌ها", az: "İşgüzar şam yeməkləri", en: "Business dinners & delegations" },
    s: { fa: "برای شرکت‌هایی که از شریکان خارجی میزبانی می‌کنند؛ با منوی چندزبانه و پذیرایی بی‌صدا.", az: "Xarici tərəfdaşları qəbul edən şirkətlər üçün — çoxdilli menyu və sakit xidmətlə.", en: "For companies hosting partners from abroad — multilingual menus and quiet, flawless service." } },
  { id: "buyout", n: 55, group: "moments", img: "s_13.4", fields: [F.date, F.guests, { k: "purpose", type: "text", l: "f.purpose" }],
    t: { fa: "ظفر، فقط برای شما", az: "Bütün Zafar yalnız sizin üçün", en: "All of Zafar, only for you" },
    s: { fa: "درخواست اجاره‌ی کامل رستوران برای یک شب.", az: "Restoranın bir axşamlıq tam icarəsi.", en: "Request the whole restaurant for one evening." } },
  // ——— Gifts
  { id: "giftbox", n: 21, group: "gifts", img: "s_3.4", fields: [{ k: "recipient", type: "text", l: "f.recipient" }, { k: "rphone", type: "tel", l: "f.rphone" }, F.address, F.date, { k: "card", type: "area", l: "f.card" }],
    t: { fa: "جعبه‌ی هدیه‌ی ظفر", az: "Zafar hədiyyə qutusu", en: "The Zafar gift box" },
    s: { fa: "شیرینی‌ها و محصولات امضادار ظفر، با کارت دست‌نویس و تحویل دستی.", az: "Zafarın imzalı şirniyyatları, əl yazılı kart və əl ilə çatdırılma ilə.", en: "Zafar's signature sweets and pantry, with a handwritten card, delivered by hand." } },
  { id: "evening", n: 22, group: "gifts", img: "s_12.6", fields: [{ k: "recipient", type: "text", l: "f.recipient" }, { k: "rphone", type: "tel", l: "f.rphone" }, F.guests, { k: "card", type: "area", l: "f.card" }],
    t: { fa: "هدیه‌ی یک شب", az: "Bir axşam hədiyyə edin", en: "Give an evening" },
    s: { fa: "یک شب در ظفر را به کسی هدیه دهید. دعوت‌نامه با دست به او می‌رسد؛ پرداخت حضوری است.", az: "Kiməsə Zafarda bir axşam hədiyyə edin. Dəvətnamə ona əl ilə çatır; ödəniş üz-üzədir.", en: "Give someone an evening at Zafar. The invitation is delivered by hand; payment is made in person." } },
  // ——— Concierge
  { id: "chauffeur", n: 88, group: "concierge", img: "s_0.4", fields: [{ k: "dir", type: "choice", l: "f.dir", opts: ["car.to", "car.from", "car.round"] }, { k: "from", type: "text", l: "f.from" }, { k: "to", type: "text", l: "f.to" }, F.date, F.time, { k: "pax", type: "num", l: "f.pax", min: 1, max: 12 }, { k: "car", type: "choice", l: "f.car", opts: ["car.sedan", "car.exec", "car.van"] }],
    t: { fa: "راننده‌ی اختصاصی ظفر", az: "Zafarın şəxsi sürücüsü", en: "Zafar's private driver" },
    s: { fa: "از هر جا تا ظفر و از ظفر تا هر جا؛ با خودرو و راننده‌ی خودِ ظفر.", az: "Hər yerdən Zafara və Zafardan hər yerə — Zafarın öz avtomobili və sürücüsü ilə.", en: "From anywhere to Zafar and from Zafar to anywhere — in Zafar's own car, with Zafar's own driver." } },
  { id: "bespoke", n: null, group: "concierge", img: "s_9.0", fields: [{ k: "dish", type: "area", l: "f.dish" }, { k: "diet", type: "text", l: "f.diet" }, F.date, { k: "occasion", type: "text", l: "f.occasion" }],
    t: { fa: "غذای اختصاصی شما", az: "Sizə xas yemək", en: "Your bespoke dish" },
    s: { fa: "برای مهمانان ویژه، سرآشپز غذایی طراحی می‌کند که در هیچ منویی نیست.", az: "Xüsusi qonaqlar üçün aşbaz heç bir menyuda olmayan yemək hazırlayır.", en: "For our special guests, the chef designs a dish that appears on no menu." } },
  // ——— not in the grid
  { id: "circle", n: 26, group: null, img: "s_12.6", fields: [{ k: "ref", type: "text", l: "f.ref" }],
    t: { fa: "معرفی به حلقه‌ی ظفر", az: "Zafar Dairəsinə təqdimat", en: "An introduction to Zafar Circle" },
    s: { fa: "عضویت تنها با دعوت است؛ میزبان ما با شما و معرف‌تان گفت‌وگو می‌کند.", az: "Üzvlük yalnız dəvətlədir; ev sahibimiz sizinlə və sizi təqdim edənlə danışır.", en: "Membership is by invitation; our host will speak with you and with whoever introduced you." } },
  { id: "occasion", n: 29, group: null, img: "s_12.6", fields: [],
    t: { fa: "سپردن یک مناسبت", az: "Xüsusi günü həvalə etmək", en: "Leaving an occasion with us" }, s: { fa: "", az: "", en: "" } },
];
export const SVC = Object.fromEntries(SERVICES.map((s) => [s.id, s]));

export const LANG_OPTS = {
  "lang.fa": { fa: "فارسی", az: "Fars", en: "Persian" },
  "lang.en": { fa: "انگلیسی", az: "İngilis", en: "English" },
  "lang.tr": { fa: "ترکی", az: "Türk", en: "Turkish" },
  "lang.ar": { fa: "عربی", az: "Ərəb", en: "Arabic" },
};

// request lifecycle shared by the site, the member page and the CEO panel
export const STATUS = {
  new: { fa: "نامه‌ی تازه", az: "Yeni məktub", en: "New letter" },
  called: { fa: "میزبان تماس گرفت", az: "Ev sahibi zəng etdi", en: "Our host called" },
  confirmed: { fa: "تأیید شد", az: "Təsdiqləndi", en: "Confirmed" },
  done: { fa: "انجام شد", az: "Tamamlandı", en: "Done" },
  declined: { fa: "این بار ممکن نشد", az: "Bu dəfə mümkün olmadı", en: "Not possible this time" },
};
