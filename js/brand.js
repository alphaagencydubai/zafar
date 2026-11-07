// Zafar's mark, redrawn as vectors from their logo: two blades and two dots.
export const MARK_PATHS = `<path class="mk-a" pathLength="1" d="M341 37L35 379V427H215L168 380H101L288 172V498L341 552Z"/><path class="mk-b" pathLength="1" d="M359 849L665 507V459H485L532 506H599L412 714V388L359 334Z"/><circle class="mk-c" pathLength="1" cx="227" cy="563" r="60"/><circle class="mk-d" pathLength="1" cx="463" cy="306" r="60"/>`;
export const mark = (cls = "") => `<svg class="zmark ${cls}" viewBox="30 30 640 825" aria-hidden="true">${MARK_PATHS}</svg>`;
export const ALPHA = (dark = true) => `<a class="alpha-sig" href="https://alphaa.agency" target="_blank" rel="noopener"><img src="assets/brand/alpha-${dark ? "white" : "black"}.png" alt="Alpha Agency" width="44" height="33" loading="lazy"><span>Powered by Alpha Agency</span></a>`;

const NFC = `<svg class="zc-nfc" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7.5c1.4 1.3 2.2 2.9 2.2 4.5S8.4 15.2 7 16.5M10.6 5.2c2 1.9 3.1 4.3 3.1 6.8s-1.1 4.9-3.1 6.8M14.2 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
export function card({ tier = "noir", name = "KAMRAN RASOULI", id = "ZC-1001", since = Date.now(), cls = "" } = {}) {
  const d = new Date(since);
  const mmYY = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
  return `<div class="zcard tier-${tier} ${cls}" data-tilt>
    <div class="zc-face">
      <div class="zc-brush"></div><div class="zc-glare"></div>
      <div class="zc-top">${mark("zc-mark")}<span class="zc-brand">ZAFAR<small>CIRCLE</small></span>${NFC}</div>
      <div class="zc-chip"><i></i><i></i><i></i></div>
      <div class="zc-num">${id.replace("-", " ")} &nbsp;·&nbsp; ${String(tier).toUpperCase()}</div>
      <div class="zc-bottom"><div><small>MEMBER</small><b>${name.toUpperCase()}</b></div><div><small>SINCE</small><b>${mmYY}</b></div></div>
    </div></div>`;
}
// pointer + gyro tilt with a moving glare
export function tilt(root = document) {
  root.querySelectorAll("[data-tilt]").forEach((el) => {
    if (el._tilt) return; el._tilt = 1;
    const set = (x, y) => { el.style.setProperty("--rx", `${(-y * 14).toFixed(2)}deg`); el.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`); el.style.setProperty("--gx", `${50 + x * 60}%`); el.style.setProperty("--gy", `${50 + y * 60}%`); };
    el.addEventListener("pointermove", (e) => { const b = el.getBoundingClientRect(); set((e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5); el.classList.add("live"); });
    el.addEventListener("pointerleave", () => { el.classList.remove("live"); set(0, 0); });
    set(0, 0);
  });
}
