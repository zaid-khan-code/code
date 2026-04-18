# Reference audit

## Files reviewed
- `requriments/Helplytics Ai – Grand Coding Night Official April 2026.pdf` — PDF unreadable (no pdftoppm). Used images as primary source.
- `requriments/WhatsApp Image 2026-04-18 at 5.20.47 PM.jpeg` — Login/signup page (split layout)
- `requriments/WhatsApp Image 2026-04-18 at 5.20.47 PM (1).jpeg` — Landing/home page (full)
- `requriments/WhatsApp Image 2026-04-18 at 5.20.47 PM (2).jpeg` — AI Center page
- `requriments/WhatsApp Image 2026-04-18 at 5.20.48 PM.jpeg` — Profile page (public + edit)
- `requriments/WhatsApp Image 2026-04-18 at 5.20.48 PM (1).jpeg` — Messages page
- `requriments/WhatsApp Image 2026-04-18 at 5.20.49 PM.jpeg` — Create Request page
- `requriments/WhatsApp Image 2026-04-18 at 5.20.49 PM (1).jpeg` — Leaderboard page
- `requriments/WhatsApp Image 2026-04-18 at 5.20.49 PM (2).jpeg` — Notifications page
- `requriments/WhatsApp Image 2026-04-18 at 5.20.50 PM.jpeg` — Request Detail page
- `requriments/WhatsApp Image 2026-04-18 at 5.20.50 PM (1).jpeg` — Explore/Feed page

## Overrides applied

### Colors (CRITICAL — all override master prompt tokens)
- `tokens.color.brand`: was `#4F46E5` (indigo) → now `#0C9F88` (teal)
- `tokens.color.brandFg`: stays `#FFFFFF`
- `tokens.color.bg`: was `#FAFAF9` → now `#F5F0EA` (warm off-white)
- `tokens.color.surface`: stays `#FFFFFF`
- `tokens.color.surface2`: was `#F4F4F5` → now `#F0EBE3` (warm light)
- `tokens.color.heroDark`: NEW `#1A2E2C` (dark forest, used for hero banners on every page)
- `tokens.color.heroDarkFg`: NEW `#FFFFFF`
- Page background gradient: radial — teal/green top-left, warm peach top-right (subtle, both ~8% opacity)

### Layout
- **Hero banner**: Every app page (not just landing) has a dark forest card at top with section label (uppercase small) + large bold h1 + optional subtitle. Full-width, border-radius lg.
- **Landing hero**: SPLIT layout — dark card left + auth form right (NOT stacked). OVERRIDE landing spec.
- **Explore filters**: LEFT SIDEBAR panel (not pill bar at top). Category dropdown + Urgency dropdown + Skills text input + Location text input.
- **Topbar**: Logo (teal H square + "Helplytics AI" text) + text nav links (no underline, muted) + active link in light pill + primary CTA button (teal, pill shape) on far right.
- **Topbar nav items vary by page**: shows current section active.

### Pages confirmed from images
- Landing: split hero (dark left card + login/signup right card)
- Explore/Feed: sidebar filters left + card list right
- Create Request: form left + AI Assistant sidebar right
- Request Detail: dark hero banner + two panels (AI Summary + Actions left, Helpers right)
- Messages: conversation list left + compose right
- Leaderboard: two columns (Rankings + Badge/Trust)
- AI Center: dark hero + 3 stat cards (Trend Pulse, Urgency Watch, Mentor Pool) + AI Recommendations list
- Notifications: single-column feed list, items have type label + "Unread/Read" badge on right
- Profile: dark hero banner + two columns (Public Profile/Skills left, Edit Profile right)

### Typography
- Headings: extra bold / black weight (font-weight 800-900)
- Labels above headings: uppercase, small, letter-spaced, muted teal color (`#0C9F88`)
- Body: regular weight, muted gray
- Scale confirmed: matches spec (12/14/16/20/28/36)

### Components
- Badge/status pills: `Solved` = teal bg, `High` = salmon/red-light bg with red text, `Open` = muted bg
- Trust shown as percentage (e.g. "Trust 100%") not raw number in cards
- Avatar: circular, colored initial fallback (teal, orange, etc.)
- "Open details" link on request cards (not a button)
- Leaderboard rank items: avatar initial circle + name + skills text + trust% + contributions count
- Notification items: title bold + type • time below + Unread/Read pill right-aligned

## Open questions
- Exact hex for brand teal — `#0C9F88` is best estimate from images; adjust if trainer provides brand guide
- Dashboard page not shown in images — following master prompt spec (4 stat cards + activity + AI insights + quick actions)
- Onboarding wizard not shown — following master prompt spec (4 steps)
- Admin panel not shown — following master prompt spec
- "Live community signals" in topbar (shown on landing) — implement as animated count or static label
