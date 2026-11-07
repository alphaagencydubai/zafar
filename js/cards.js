// The three Zafar Account cards and exactly where each one can be used.
// Shared by the site (Account page), the member page and the CEO panel (which enforces it).
export const TIERS = {
  teal: { limit: 300e6, companions: 1, perCharge: 60e6, cycle: "monthly", order: 1,
    who: { fa: "برای مهمانان همیشگی ظفر", tr: "Zafar'ın müdavimleri için", en: "For Zafar's regulars" },
    line: { fa: "امضای سر میز و هر آنچه از ظفر به خانه‌تان می‌آید.", tr: "Masada imza ve Zafar'dan evinize gelen her şey.", en: "Sign at the table, and for everything Zafar brings to your door." } },
  gold: { limit: 800e6, companions: 3, perCharge: 250e6, cycle: "monthly", order: 2,
    who: { fa: "برای خانواده‌هایی که ظفر را خانه‌ی دوم می‌دانند", tr: "Zafar'ı ikinci evi sayan aileler için", en: "For families who call Zafar a second home" },
    line: { fa: "ظفر در خانه، راننده، مراسم و غذای اختصاصی، همه روی یک حساب.", tr: "Evde Zafar, şoför, törenler ve özel yemek; hepsi tek hesapta.", en: "Zafar at home, the driver, ceremonies and bespoke dishes, on one account." } },
  noir: { limit: null, companions: null, perCharge: null, cycle: "flex", order: 3,
    who: { fa: "تنها با دعوت مالک ظفر", tr: "Yalnızca Zafar'ın sahibinin davetiyle", en: "Only by the owner's invitation" },
    line: { fa: "همه‌ی ظفر، بدون سقف از پیش تعیین‌شده؛ حتی کل رستوران برای یک شب.", tr: "Zafar'ın tamamı, önceden belirlenmiş limit olmadan; bir geceliğine bütün restoran bile.", en: "All of Zafar with no preset limit, even the whole restaurant for a night." } },
};
export const TIER_ORDER = ["teal", "gold", "noir"];

// v: true / false / a short note (string per language) shown instead of a tick
const L = (fa, tr, en) => ({ fa, tr, en });
export const SITUATIONS = [
  { id: "table", cat: "dining", icon: "table",
    t: L("سر میز ظفر", "Zafar'da masada", "At Zafar's tables"),
    how: L("صورت‌حساب را امضا می‌کنید و می‌روید؛ میزبانتان آن را در حساب ثبت می‌کند.", "Hesabı imzalar ve kalkarsınız; ev sahibiniz hesabınıza işler.", "You sign the bill and leave; your host files it to your account."),
    v: { teal: true, gold: true, noir: true } },
  { id: "cafe", cat: "dining", icon: "cup",
    t: L("صبحانه و کافه", "Kahvaltı ve kafe", "Breakfast & café"),
    how: L("از ۹ صبح؛ حتی یک فنجان چای هم روی حساب می‌نشیند.", "Sabah 9'dan itibaren; tek bir fincan çay bile hesaba yazılır.", "From 9 a.m.; even a single cup of tea goes on the account."),
    v: { teal: true, gold: true, noir: true } },
  { id: "delivery", cat: "dining", icon: "bag",
    t: L("تحویل دستی در خانه", "Evinize elden teslim", "Hand delivery at home"),
    how: L("کارکنان ظفر غذا را می‌آورند؛ دم در به‌جای کارتخوان امضا می‌کنید.", "Zafar ekibi yemeği getirir; kapıda POS yerine imza atarsınız.", "Zafar's staff bring the food; you sign at the door instead of paying."),
    v: { teal: true, gold: true, noir: true } },
  { id: "gift", cat: "gift", icon: "gift",
    t: L("جعبه‌ی هدیه و هدیه‌ی یک شب", "Hediye kutusu ve bir akşam hediyesi", "Gift boxes & gifted evenings"),
    how: L("گیرنده چیزی پرداخت نمی‌کند؛ هزینه روی حساب شما می‌نشیند.", "Alıcı hiçbir şey ödemez; tutar sizin hesabınıza yazılır.", "The recipient pays nothing; it is charged to your account."),
    v: { teal: L("تا ۲۰ میلیون", "20 milyona kadar", "up to 20 M"), gold: true, noir: true } },
  { id: "chauffeur", cat: "chauffeur", icon: "car",
    t: L("راننده‌ی اختصاصی", "Özel şoför", "Private driver"),
    how: L("سفر به ظفر و از ظفر، و برای نوآر به هر جای شهر حتی بی‌شام.", "Zafar'a ve Zafar'dan yolculuk; Noir için yemek olmadan da şehrin her yerine.", "Trips to and from Zafar; for Noir, anywhere in the city even without dinner."),
    v: { teal: L("فقط با شام", "yalnızca yemekle", "with dinner only"), gold: true, noir: L("هر جا، هر زمان", "her yere, her an", "anywhere, any time") } },
  { id: "home", cat: "home", icon: "house",
    t: L("سرو VIP در منزل و تشریفات میز", "Evde VIP servis ve sofra protokolü", "VIP home serving & table protocol"),
    how: L("تیم ظفر مهمانی‌تان را در خانه برگزار می‌کند؛ صورت‌حساب پس از مهمانی امضا می‌شود.", "Zafar ekibi davetinizi evinizde ağırlar; hesap davetten sonra imzalanır.", "Zafar's team hosts your gathering at home; the bill is signed after the evening."),
    v: { teal: false, gold: true, noir: true } },
  { id: "events", cat: "event", icon: "ring",
    t: L("مراسم، تولد و شام‌های کاری", "Törenler, doğum günleri ve iş yemekleri", "Ceremonies, birthdays & business dinners"),
    how: L("بدون پیش‌پرداخت؛ همه‌چیز در صورت‌حساب ماهانه می‌آید.", "Ön ödeme yok; her şey aylık ekstrede yer alır.", "No deposit; everything appears on the monthly statement."),
    v: { teal: false, gold: L("تا ۸۰ مهمان", "80 misafire kadar", "up to 80 guests"), noir: true } },
  { id: "bespoke", cat: "bespoke", icon: "dish",
    t: L("غذای اختصاصی سرآشپز", "Şefin size özel yemeği", "The chef's bespoke dish"),
    how: L("گفت‌وگو با سرآشپز، چشیدن و سرو؛ همه روی حساب.", "Şefle görüşme, tadım ve servis; hepsi hesaba.", "The chef's consultation, tasting and serving, all on the account."),
    v: { teal: false, gold: true, noir: true } },
  { id: "guests", cat: "dining", icon: "people",
    t: L("پذیرایی از مهمانانتان بدون حضور شما", "Siz yokken misafirlerinizi ağırlamak", "Hosting your guests without you"),
    how: L("به میزبانتان بگویید؛ مهمانانتان می‌آیند و به نام شما امضا می‌کنند.", "Ev sahibinize söyleyin; misafirleriniz gelir ve sizin adınıza imzalar.", "Tell your host; your guests come and sign in your name."),
    v: { teal: false, gold: true, noir: true } },
  { id: "chef", cat: "home", icon: "chef",
    t: L("سرآشپز مقیم", "Evinizde kalan şef", "Chef in residence"),
    how: L("سرآشپز ظفر چند شب در ویلای شما می‌ماند.", "Zafar'ın şefi birkaç gece villanızda kalır.", "Zafar's chef stays at your villa for a few nights."),
    v: { teal: false, gold: false, noir: true } },
  { id: "buyout", cat: "event", icon: "key",
    t: L("اجاره‌ی کامل ظفر", "Zafar'ın tamamı", "The whole of Zafar"),
    how: L("کل رستوران برای یک شب، فقط برای شما.", "Bütün restoran bir geceliğine yalnızca sizin.", "The entire restaurant for one night, only for you."),
    v: { teal: false, gold: false, noir: true } },
];
export const RULES = [
  { k: "limit", t: L("سقف حساب", "Hesap limiti", "Account limit") },
  { k: "perCharge", t: L("سقف هر امضا", "İmza başına limit", "Limit per signature") },
  { k: "companions", t: L("کارت همراه", "Ek kart", "Companion cards") },
  { k: "cycle", t: L("تسویه", "Ödeme", "Settlement") },
];
export const CYCLE = { monthly: L("ماهانه، رودررو با میزبان", "Aylık, ev sahibinizle yüz yüze", "Monthly, in person with your host"), flex: L("هر وقت که بخواهید، رودررو", "Ne zaman isterseniz, yüz yüze", "Whenever you like, in person") };
export const allows = (tier, sit) => { const v = SITUATIONS.find((s) => s.id === sit)?.v[tier]; return v === undefined ? true : !!v; };
// for the panel: which situations a ledger category falls under
export const CAT_SIT = { dining: "table", home: "home", chauffeur: "chauffeur", gift: "gift", event: "events", bespoke: "bespoke" };
