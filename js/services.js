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
    t: { fa: "دیدار با ظفر", tr: "Zafar'da bir akşam", en: "An evening at Zafar" },
    s: { fa: "میز رزرو نمی‌شود؛ میزبان ما تماس می‌گیرد و شما را دعوت می‌کند.", tr: "Masalar internetten ayrılmaz; ev sahibimiz sizi arar ve davet eder.", en: "Tables are not booked online — our host calls and invites you." } },
  // ——— Zafar at your home
  { id: "home", n: 8, group: "home", img: "s_1.4", fields: [F.date, F.guests, F.address, { k: "occasion", type: "text", l: "f.occasion" }],
    t: { fa: "سرو VIP در منزل", tr: "Evde VIP servis", en: "VIP serving at home" },
    s: { fa: "سرآشپز، پیشخدمت‌ها، ظروف و چیدمان میزِ خود ظفر، در خانه‌ی شما.", tr: "Zafar'ın şefi, garsonları, porselenleri ve sofra düzeni, sizin evinizde.", en: "Zafar's chef, waiters, tableware and table setting — in your own home." },
    d: { fa: "مهمانی شما با همان استانداردی برگزار می‌شود که در سالن ظفر؛ از چیدمان میز تا آخرین فنجان چای.", tr: "Davetiniz, sofra düzeninden son fincan çaya kadar Zafar'ın salonundaki özenle ağırlanır.", en: "Your gathering is hosted to the very standard of Zafar's dining room, from the table setting to the last cup of tea." } },
  { id: "chef", n: 11, group: "home", img: "s_5.4", fields: [{ k: "date", type: "date", l: "f.date" }, { k: "nights", type: "num", l: "f.nights", min: 1, max: 30 }, { k: "location", type: "text", l: "f.location" }, F.guests],
    t: { fa: "سرآشپز مقیم", tr: "Evinizde kalan şef", en: "Chef in residence" },
    s: { fa: "سرآشپز ظفر چند شب در ویلای شما می‌ماند و برای خانواده آشپزی می‌کند.", tr: "Zafar'ın şefi birkaç gece villanızda kalır ve aileniz için yemek pişirir.", en: "Zafar's chef stays at your villa for a few nights and cooks for your family." },
    d: { fa: "برای تعطیلات نوروز، سفرهای خانوادگی یا مهمانی‌های چندروزه.", tr: "Nevruz tatili, aile seyahatleri ya da birkaç gün süren davetler için.", en: "For the Nowruz holidays, family trips or gatherings that last several days." } },
  { id: "delivery", n: 12, group: "home", img: "s_6.6", fields: [F.date, F.time, F.address, { k: "dishes", type: "text", l: "f.dishes" }],
    t: { fa: "تحویل دستی با کارکنان ظفر", tr: "Zafar'ın kendi ekibiyle elden teslim", en: "Hand-delivered by Zafar's own staff" },
    s: { fa: "غذا را کارکنان یونیفرم‌پوش خود ظفر می‌آورند، نه پیک. پرداخت با کارتخوان، دم در.", tr: "Yemeklerinizi kurye değil, Zafar'ın üniformalı ekibi getirir. Ödeme kapıda, POS cihazıyla.", en: "Your dishes arrive with Zafar's uniformed staff, never a courier. Payment by card reader, at your door." } },
  { id: "protocol", n: 13, group: "home", img: "s_14.2", fields: [F.date, F.guests, { k: "event", type: "text", l: "f.event" }, { k: "where", type: "choice", l: "f.where", opts: ["f.atZafar", "f.atHome"] }],
    t: { fa: "تشریفات میز", tr: "Sofra protokolü", en: "Table protocol" },
    s: { fa: "سرپیشخدمت ظفر چیدمان نشستن و آداب یک ضیافت مهم را برای شما برنامه‌ریزی می‌کند.", tr: "Zafar'ın maître d'si önemli bir davetin oturma düzenini ve adabını sizin için planlar.", en: "Zafar's maître d' plans the seating and etiquette of an important dinner for you." } },
  // ——— Moments
  { id: "ceremony", n: 15, group: "moments", img: "s_2.6", fields: [{ k: "ceremony", type: "choice", l: "f.ceremony", opts: ["f.khast", "f.baleh", "f.aghd"] }, F.date, F.guests, { k: "where", type: "choice", l: "f.where", opts: ["f.atZafar", "f.atHome"] }],
    t: { fa: "خواستگاری، بله‌برون و عقد", tr: "Kız isteme, söz ve nikâh", en: "Khastegari, Baleh-boroon & Aghd" },
    s: { fa: "پذیرایی ظفر در مهم‌ترین مراسم خانوادگی؛ در سالن خصوصی یا در منزل.", tr: "Ailenin en önemli törenlerinde Zafar'ın ağırlaması; özel salonda ya da evde.", en: "Zafar's hospitality for the family's most important ceremonies — in a private salon or at home." } },
  { id: "proposal", n: 16, group: "moments", img: "s_10.6", fields: [F.date, { k: "partner", type: "text", l: "f.partner" }, { k: "wish", type: "checks", l: "f.wish", opts: ["f.flowers", "f.music", "f.photo", "f.ring"] }],
    t: { fa: "درخواست ازدواج", tr: "Evlilik teklifi", en: "The proposal" },
    s: { fa: "سالنی خصوصی، گل، نوازنده و لحظه‌ای که از قبل با دقت چیده شده است.", tr: "Özel bir salon, çiçekler, bir müzisyen ve özenle hazırlanmış bir an.", en: "A private salon, flowers, a musician — and a moment arranged with great care." } },
  { id: "birthday", n: 17, group: "moments", img: "s_11.6", fields: [F.date, { k: "person", type: "text", l: "f.person" }, F.guests, { k: "secret", type: "check", l: "f.secret" }],
    t: { fa: "تولد غافلگیرانه", tr: "Sürpriz doğum günü", en: "A surprise birthday" },
    s: { fa: "میزبان ما پنهانی با خانواده هماهنگ می‌کند و همه چیز را می‌چیند.", tr: "Ev sahibimiz aileyle gizlice anlaşır ve her şeyi hazırlar.", en: "Our host quietly arranges everything with the family." } },
  { id: "business", n: 19, group: "moments", img: "s_7.6", fields: [{ k: "company", type: "text", l: "f.company" }, F.date, F.guests, { k: "langs", type: "checks", l: "f.langs", opts: ["lang.fa", "lang.en", "lang.tr", "lang.ar"] }, { k: "where", type: "choice", l: "f.where", opts: ["f.atZafar", "f.atOffice"] }],
    t: { fa: "شام‌های کاری و هیئت‌ها", tr: "İş yemekleri ve heyetler", en: "Business dinners & delegations" },
    s: { fa: "برای شرکت‌هایی که از شریکان خارجی میزبانی می‌کنند؛ با منوی چندزبانه و پذیرایی بی‌صدا.", tr: "Yurt dışından ortaklarını ağırlayan şirketler için; çok dilli menü ve sessiz, kusursuz servis.", en: "For companies hosting partners from abroad — multilingual menus and quiet, flawless service." } },
  { id: "buyout", n: 55, group: "moments", img: "s_13.4", fields: [F.date, F.guests, { k: "purpose", type: "text", l: "f.purpose" }],
    t: { fa: "ظفر، فقط برای شما", tr: "Bütün Zafar yalnızca sizin için", en: "All of Zafar, only for you" },
    s: { fa: "درخواست اجاره‌ی کامل رستوران برای یک شب.", tr: "Restoranın tamamını bir akşamlığına isteyin.", en: "Request the whole restaurant for one evening." } },
  // ——— Gifts
  { id: "giftbox", n: 21, group: "gifts", img: "s_3.4", fields: [{ k: "recipient", type: "text", l: "f.recipient" }, { k: "rphone", type: "tel", l: "f.rphone" }, F.address, F.date, { k: "card", type: "area", l: "f.card" }],
    t: { fa: "جعبه‌ی هدیه‌ی ظفر", tr: "Zafar hediye kutusu", en: "The Zafar gift box" },
    s: { fa: "شیرینی‌ها و محصولات امضادار ظفر، با کارت دست‌نویس و تحویل دستی.", tr: "Zafar'ın imza tatlıları ve kileri, el yazısı bir kartla, elden teslim.", en: "Zafar's signature sweets and pantry, with a handwritten card, delivered by hand." } },
  { id: "evening", n: 22, group: "gifts", img: "s_12.6", fields: [{ k: "recipient", type: "text", l: "f.recipient" }, { k: "rphone", type: "tel", l: "f.rphone" }, F.guests, { k: "card", type: "area", l: "f.card" }],
    t: { fa: "هدیه‌ی یک شب", tr: "Bir akşam hediye edin", en: "Give an evening" },
    s: { fa: "یک شب در ظفر را به کسی هدیه دهید. دعوت‌نامه با دست به او می‌رسد؛ پرداخت حضوری است.", tr: "Birine Zafar'da bir akşam hediye edin. Davetiye elden ulaştırılır; ödeme yüz yüze yapılır.", en: "Give someone an evening at Zafar. The invitation is delivered by hand; payment is made in person." } },
  // ——— Concierge
  { id: "chauffeur", n: 88, group: "concierge", img: "s_0.4", fields: [{ k: "dir", type: "choice", l: "f.dir", opts: ["car.to", "car.from", "car.round"] }, { k: "from", type: "text", l: "f.from" }, { k: "to", type: "text", l: "f.to" }, F.date, F.time, { k: "pax", type: "num", l: "f.pax", min: 1, max: 12 }, { k: "car", type: "choice", l: "f.car", opts: ["car.sedan", "car.exec", "car.van"] }],
    t: { fa: "راننده‌ی اختصاصی ظفر", tr: "Zafar'ın özel şoförü", en: "Zafar's private driver" },
    s: { fa: "از هر جا تا ظفر و از ظفر تا هر جا؛ با خودرو و راننده‌ی خودِ ظفر.", tr: "Her yerden Zafar'a, Zafar'dan her yere; Zafar'ın kendi aracı ve şoförüyle.", en: "From anywhere to Zafar and from Zafar to anywhere — in Zafar's own car, with Zafar's own driver." } },
  { id: "bespoke", n: null, group: "concierge", img: "s_9.0", fields: [{ k: "dish", type: "area", l: "f.dish" }, { k: "diet", type: "text", l: "f.diet" }, F.date, { k: "occasion", type: "text", l: "f.occasion" }],
    t: { fa: "غذای اختصاصی شما", tr: "Size özel yemek", en: "Your bespoke dish" },
    s: { fa: "برای مهمانان ویژه، سرآشپز غذایی طراحی می‌کند که در هیچ منویی نیست.", tr: "Özel misafirlerimiz için şef, hiçbir menüde olmayan bir yemek tasarlar.", en: "For our special guests, the chef designs a dish that appears on no menu." } },
  // ——— not in the grid
  { id: "circle", n: 26, group: null, img: "s_12.6", fields: [{ k: "ref", type: "text", l: "f.ref" }],
    t: { fa: "معرفی به حلقه‌ی ظفر", tr: "Zafar Circle'a tanıştırılmak", en: "An introduction to Zafar Circle" },
    s: { fa: "عضویت تنها با دعوت است؛ میزبان ما با شما و معرف‌تان گفت‌وگو می‌کند.", tr: "Üyelik yalnızca davetledir; ev sahibimiz sizinle ve sizi tanıştıran kişiyle görüşür.", en: "Membership is by invitation; our host will speak with you and with whoever introduced you." } },
  { id: "occasion", n: 29, group: null, img: "s_12.6", fields: [],
    t: { fa: "سپردن یک مناسبت", tr: "Özel bir günü bize bırakmak", en: "Leaving an occasion with us" }, s: { fa: "", tr: "", en: "" } },
];
export const SVC = Object.fromEntries(SERVICES.map((s) => [s.id, s]));

export const LANG_OPTS = {
  "lang.fa": { fa: "فارسی", tr: "Farsça", en: "Persian" },
  "lang.en": { fa: "انگلیسی", tr: "İngilizce", en: "English" },
  "lang.tr": { fa: "ترکی", tr: "Türkçe", en: "Turkish" },
  "lang.ar": { fa: "عربی", tr: "Arapça", en: "Arabic" },
};

// request lifecycle shared by the site, the member page and the CEO panel
export const STATUS = {
  new: { fa: "نامه‌ی تازه", tr: "Yeni mektup", en: "New letter" },
  called: { fa: "میزبان تماس گرفت", tr: "Ev sahibimiz aradı", en: "Our host called" },
  confirmed: { fa: "تأیید شد", tr: "Onaylandı", en: "Confirmed" },
  done: { fa: "انجام شد", tr: "Tamamlandı", en: "Done" },
  declined: { fa: "این بار ممکن نشد", tr: "Bu sefer mümkün olmadı", en: "Not possible this time" },
};
