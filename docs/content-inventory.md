# Content inventory · homepage

Source: the live homepage saved by Aviv on 2026-11-18 (`_source/` on her Desktop). Text was extracted
programmatically from that HTML and pasted unchanged. ✅ = verbatim and present. ⚠️ = see note.

| # | Live site element | Where in the concept | Status |
|---|---|---|---|
| 0 | `<title>`, meta description, og:* tags, canonical | `<head>` | ✅ copied exactly |
| 1 | Logo `logo.png` (link to home) | Header, mobile menu, footer | ⚠️ only a 235×93 PNG exists. White removed (color-to-alpha). **Need the original vector logo** for a sharp result |
| 2 | Main menu: דף הבית, טיפולים (10 sub-items), מכתבי תודה, מרכז מידע (5 sub-items), מהתקשורת, אודות, צור קשר | Header nav + dropdowns | ✅ same labels, order and URLs |
| 3 | Side/fullscreen menu with h3 "טיפולים" / "מרכז מידע" | Mobile menu groups + footer columns | ✅ |
| 4 | H1 "סיון נבות – פיזיותרפיה של רצפת האגן" | Hero | ⚠️ **dash removed at Aviv's request (round 2)**; the name and the field now sit on two lines. Rest verbatim |
| 5 | H2 "בריאות. שגרה. שלווה." | Hero | ✅ |
| 6 | YouTube video `tiLfpB3DVzk` | Intro, large custom player beside the pull quote | ✅ facade, loads youtube-nocookie only on click (no autoplay before the click) |
| 7 | Portrait `sivan-navot-pelvic-floor-physiotherapist-v2.jpg` + alt | Hero (background removed, set inside the capsule "ס" ring; alt is the SVG `<title>`) | ✅ alt kept exactly |
| 8 | Intro paragraph 1 incl. link "שיטת PFFM, Pelvic Floor Fascial Mobilization" → /pffm/ | Intro lead (greeting / role / credentials / method styled separately, same words and order) | ✅ |
| 9 | Intro paragraphs 2 and 3 | Intro reading columns 01 / 02 (one key phrase in each highlighted) | ✅ |
| 10 | "רצפת האגן והבעיות הקשורות בה, עדיין אינה מקבלת, לטעמי, את הבמה הראויה לה." | Intro pull-quote | ✅ |
| 11 | "המשך קריאה>>" → /about/ | Intro arrow link | ⚠️ text "המשך קריאה" kept; the ">>" is shown as the arrow icon |
| 12 | 4 image tiles a4/a3/a2/a1 → men / women / pregnancy-and-birth / glossary | Path tiles | ✅ labels baked into the old JPGs ("גברים", "נשים", "היריון", "מילון המונחים והאבחנות") are now live text; the old line drawings are replaced by new filled figures (round 1 feedback); the glossary letters are recreated in type. Originals kept in `assets/images/original/` |
| 13 | H2 "טיפולים נוספים" + 6 cards (H5 title, excerpt, "המשך קריאה") | Treatments accordion: titles visible, "+" opens excerpt + link (round 2) | ✅ excerpts end mid-sentence exactly as on the site. ⚠️ the fecal card uses ``דליפת צואה`` (backticks) as on the site; suggest ״דליפת צואה״ only if Sivan approves. Headings are h3 here (were h5) for correct outline |
| 14 | `kapsula1.jpg` bullet image | Brand motif (capsule outline, icon holders) | ✅ reinterpreted, not removed |
| 15 | H2 "מטופלים ממליצים" + 3 testimonials, signature "סמדר 13.7.2008", Previous/Next | Testimonials slider | ✅ |
| 16 | H5 "טיפולים" + 6 links | — | ⚠️ **section removed at Aviv's request (round 2).** All 6 destinations remain in the main menu, footer and tiles |
| 17 | Addresses "רח' בן גוריון הרצליה 44" / Tel Aviv | Contact | ⚠️ **Tel Aviv updated (round 2, per Aviv): "הברזל 9א בית המומחים, רמת החייל, תל אביב"** (the homepage still says הברזל 3; Sivan no longer works there). Update the contact page and footer content in WordPress too |
| 18 | Phone 052-6623666 (tel link), email (fax removed at Aviv's request, 2026-11-21) sivan@physiotherapy.co.il | Contact + header + action bar | ✅ |
| 19 | Facebook Page Plugin "סיון נבות - פיזיותרפיה לרצפת האגן" | Contact, link card | ⚠️ shown as a designed link card instead of the live FB iframe (see handoff) |
| 20 | Form "אשמח לענות על שאלתך": שם*, טלפון*, דוא"ל*, הודעה, הסכמה* + consent text + link, button "שלח" | Contact form | ✅ labels verbatim (incl. the zero-width space at the start of the consent text). Gravity Forms honeypot field ("Name" + note) is plugin-generated, not reproduced |
| 21 | Footer links: הצהרת נגישות, תקנון אתר, מדיניות פרטיות | Footer bottom | ✅ |
| 22 | "כל הזכויות שמורות ©" + credits Wisy / Wish Lease / x-Press | Footer bottom | ✅ |
| 23 | Cookie notice (Elementor popup), button "הבנתי, תודה." | Cookie card | ⚠️ **body text not captured** (already dismissed in the saved page). Shown as a yellow `[טקסט הודעת העוגיות המקורי]` marker |
| 24 | enable.co.il accessibility widget | Not loaded in the concept | ⚠️ keep the existing script in WordPress (legal requirement) |

## New UI text (not site content)
Added only as interface labels, all easy to change:
- Hero WhatsApp button + floating WhatsApp button (desktop) + mobile action bar: "חיוג", "WhatsApp", "צור קשר" (WhatsApp link assumes 052-6623666 is on WhatsApp: **confirm**)
- Accessibility labels (visually hidden): "דילוג לתוכן", "פתיחת תפריט", "הקודם", "הבא", etc.
- Form validation messages ("שדה חובה", ...) and the concept-only notice after submit.
- Intro (round 2): eyebrow "היכרות" and two subheadings "מאז שנת 2000" / "איכות החיים" (wording lifted from the paragraphs under them), numbers 01 / 02 (decorative), visible play label "הפעלת הסרטון".
- Treatments accordion: each "המשך קריאה" link carries a visually hidden " – <title>" for screen readers.

- NEW (round 12, supplied by Aviv): hero capsule text "פיזיותרפיסטית (B.P.T., M.Sc.PT) מומחית בשיקום רצפת האגן, חוקרת ומפתחת שיטת PFFM, Pelvic Floor Fascial Mobilization." (repeats the role line of intro paragraph 1; the intro itself is unchanged).

### Round 16 wording changes (requested by Aviv, 2026-11-19)
- Glossary tile label: "מילון המונחים והאבחנות" → "מונחים ואבחנות" (link unchanged: /information/glossary/).
- The design-only eyebrow "היכרות" was removed from section 2.
- Round 18: new hero line "בן גוריון, הרצליה | רמת החייל, תל אביב" (Aviv's wording; short form of the two clinic addresses in the contact section).
