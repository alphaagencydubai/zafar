# Zafar Continental — website, Etebar page and CEO panel (demo)

Alpha Agency built this preview for Zafar Continental, a restaurant in Tabriz (Instagram `@zafar_continental`).

- Site: `index.html`, in Persian, Turkish and English
- Zafar Etebar member page (opened by tapping the NFC card): `member.html`, with demo cards for ZC-1001, a Gold member and a Teal member
- CEO panel (پنل مدیرعامل): `admin.html`, demo PIN `1234`

## Pages
Each page is its own route (hash routes, so it runs on GitHub Pages), with a cross-fade between pages:
`#/` home · `#/menu` (and `#/menu/breakfast`, `#/menu/cafe`) · `#/services` · `#/services/<id>` for each of the 13 services (plus `#/services/visit`) · `#/circle` · `#/account` · `#/occasions` · `#/visit` · `#/login`.
- Every service page has an intro, what is included, good to know, lead time, party size, where, payment, which Zafar Account cards can carry it, related services and previous/next. The chauffeur page includes the route widget.
- The Account page shows the card for each tier (Teal, Gold, Noir) and where it works: account limit, limit per signature, companion cards, settlement, and 11 usage situations, plus a comparison table. The rules live in `js/cards.js`; the member page shows the member's own card rules, and the CEO panel enforces them when a signature is posted.
- `#/login` is the private door: a PIN pad for Zafar's team (opens the CEO panel) and the NFC tap for Etebar members.
- Links from the old one-page site (`#menu`, `#chauffeur` …) still land on the right page.

## What is in it
- Hero: Zafar's own video inside an arch frame (the arches in their dining room), with an ambient blurred copy behind it. On phones the video fills the screen.
- Glass navigation (iOS style). On desktop it is a top capsule; on phones it is a thumb bar. Six tabs (Home, Menu, Services, Etebar, Account, Visit) plus the letter button and a lock for sign-in. A lens sits under the current page, and the bar folds as you scroll down and opens as you scroll up.
- The menu is Zafar's real Continental menu from منو.net/zafar (Restaurant, Breakfast, Café; 178 items; prices in thousand toman).
- The ideas they chose from Alpha's idea book:
  - 5: letters instead of forms
  - 7: welcome by name (site greeting, member page, and the door view in the panel)
  - 8: VIP home serving
  - 11: chef in residence
  - 12: hand delivery by Zafar's own staff
  - 13: table protocol
  - 15: khastegari, baleh-boroon and aghd
  - 16: the proposal
  - 17: surprise birthday
  - 19: business dinners
  - 21: gift box
  - 22: give an evening
  - 26: Zafar Etebar
  - 27: metal NFC card
  - 29: occasion keeper
  - 30: guest notes
  - 32: membership anniversary gift
  - 34: the Zafar Account, a charge account in the Amex style (sign at the table, one statement a month, settle in person, companion cards, no preset limit at Noir)
  - 55: full buyout
  - 76: three languages (Persian, Turkish, English)
  - 88 plus anywhere-to-Zafar and Zafar-to-anywhere: private driver
  - bespoke dish
- No online payment and no online reservation anywhere, by Zafar's choice. Every request becomes a letter, and the host calls.
- CEO panel, 22 sections: dashboard, tonight / door view, letters, guest files, Etebar and NFC cards, occasions and anniversaries, accounts, signatures and settlements, statements (print), receivables, Zafar at home, ceremonies and buyouts calendar, driver dispatch, gifts, bespoke dishes, menu and prices (live on the site), sales, P&L, staff and shifts, reports and CSV, access and audit log, settings. It also has a ⌘K palette, alerts, light/dark mode and a PIN lock.

Site ↔ panel sync is live on one device (localStorage + BroadcastChannel in `js/data.js`). A real server replaces that file for production. Panel history is seeded demo data.

Build: `python3 build.py`. It inlines the mark and Alpha's signature and stamps asset versions into `index.html`, `member.html` and `admin.html` from the `*.src.html` files.

Powered by Alpha Agency.
