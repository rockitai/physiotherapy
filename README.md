# Sivan Navot · Homepage concept v1

Frontend concept for the redesign of https://www.physiotherapy.co.il/ (homepage only).
Nothing here touches the live WordPress site.

## Open it
Double-click `index.html` (works straight from the folder, no server needed).
`design-system.html` shows the tokens, type, buttons and icons.

## Structure
```
index.html                 homepage (semantic HTML, Hebrew RTL)
design-system.html         visual reference of the design system
assets/
  css/  tokens.css         design tokens (colors, type, space, radius, shadow, motion)
        base.css           reset, typography defaults, focus, utilities
        layout.css         container, section rhythm, grid helper
        components.css     buttons, links, chips, header/nav, mobile menu, form, footer, action bar, cookie
        sections.css       homepage sections (hero, intro, paths, treatments accordion, testimonials, contact)
        motion.css         reveal + hero entrance + hover drawing, reduced-motion overrides
  js/   header.js          sticky header scroll state
        nav.js             desktop submenus (keyboard) + mobile menu (focus trap)
        reveal.js          IntersectionObserver scroll reveals
        video.js           YouTube facade (loads player on click)
        slider.js          testimonials slider (scroll-snap + buttons + keys)
        form.js            front-end validation + states (NOT connected)
        ui.js              mobile action bar + cookie notice
  fonts/                   IBM Plex Sans Hebrew (headings) + Assistant (body), self-hosted woff2
  icons/                   one SVG per icon (generated)
  illustrations/           category line figures (line-*.svg) + hero dandelions, as SVG
  images/                  portrait cutout, logo (transparent), Facebook avatar, original/ (untouched source files)
tools/icons.py             icon source of truth → regenerates assets/icons + inline sprite
docs/
  content-inventory.md     every element of the live homepage and where it lives now
  design-system.md         rules for colors, type, spacing, icons, motion, components
  wordpress-handoff.md     what the WP developer needs to wire up
```
No build step and no dependencies. Scripts are plain deferred files (no ES modules) so the page also runs from `file://`.

## Hosting on Vercel

The site is static and deploys as is from `main` (no build step). The contact form posts to `/api/contact`
(`api/contact.js`, a Vercel Edge Function that e-mails sivan@physiotherapy.co.il with the subject `פנייה מהאתר | <name>`).
It sends through [Resend](https://resend.com): set `RESEND_API_KEY` in Vercel → Settings → Environment Variables and
verify the subdomain mail.physiotherapy.co.il in Resend (sender website@mail.physiotherapy.co.il; use a sending-only key) (optional: `CONTACT_FROM`, `CONTACT_TO`).
`assets/php/contact.php` does the same on a PHP host and is not used on Vercel.
