# Anatomy; A Panel Beaters — Website (Part 3)

Static multi-page website for an independent panel beating workshop in Braamfontein, Johannesburg.
Student number: ST10511924

- **Live site:** https://anatomy-panel-beaters.netlify.app  *(replace with your real Netlify URL)*
- **Repository:** *(add your GitHub link)*

## Pages
home.html · about_us.html · products_and_services.html · gallery.html · news_and_update.html · enquiry.html (new) · contact.html

## Part 3 features
| Requirement | Where | Implementation |
|---|---|---|
| Accordion | about_us.html, products_and_services.html | "How We Work" rules and FAQ; ARIA-compliant buttons (`js/main.js`) |
| Tabs | about_us.html | Story / Accreditations / Guarantee; arrow-key navigation |
| Modal | products_and_services.html | "More details" on each service card; Esc, focus trap |
| Interactive map | contact.html | Leaflet + OpenStreetMap with marker and directions link |
| Animations/transitions | all pages | CSS scroll-reveal, card hover, accordion slide, animated counters (About) |
| Advanced DOM manipulation | all pages | Elements created/updated with `createElement`; user text always via `textContent` |
| Gallery lightbox | gallery.html | Click/keyboard to enlarge, prev/next, Esc; category filter |
| Dynamic content | news_and_update.html, home.html | News loaded from `js/data.js` and rendered by JS; home shows latest 3 |
| Search / filter / sort | services page, news page | Live search, category filter, sort, "load more" |
| Forms + validation | contact.html, enquiry.html | HTML5 attributes + JS validation (SA phone, email, name, date, lengths), inline error messages |
| AJAX submission | contact.html | `fetch()` POST (Netlify Forms), then email compiled and addressed to workshop@anatomy.co.za |
| Enquiry processing | enquiry.html | Returns estimated cost range, turnaround and availability based on input |

## SEO
Unique `<title>` and meta description per page · keywords · canonical URLs · Open Graph/Twitter tags · one H1 and ordered H2/H3 · descriptive image file names and alt text · lazy-loaded images · internal links between pages · `lang="en-ZA"` · responsive layout · JSON-LD `AutoBodyShop` (local SEO) · `robots.txt` · `sitemap.xml` · `/` redirects to `home.html` · social links in footer.

## Security and speed
`_headers` (CSP, X-Frame-Options, nosniff, HSTS, referrer policy) · honeypot field · `rel="noopener noreferrer"` on external links · no `innerHTML` with user input · `defer` scripts · cache headers · SRI on Leaflet.

## Before you submit
1. Run `sh rename_images.sh` from the site root (renames images to SEO-friendly names used in the HTML).
2. Replace `https://anatomy-panel-beaters.netlify.app` in the HTML, `robots.txt` and `sitemap.xml` with your real URL.
3. Replace the Facebook/Instagram footer links with your real profiles.
4. Check the map pin coordinates in `js/main.js` (`pos`).
5. Test the contact form on Netlify (Forms tab) — it only AJAX-posts when deployed there.

## Changelog
### Part 2 feedback corrections
- Fixed inconsistent contact details: contact.html and home.html used `anvilarc.co.za`, `+27 11 000 0000` and "Foundry Road, Industria". All pages now use 14 Jorissen Road, Braamfontein, +27 11 555 1212, workshop@anatomy.co.za.
- Fixed `tel:` links that did not match the displayed number.
- Fixed broken entity `&anatomy;` in the news heading (now `&amp;`).
- Removed stray `</li>` in about_us.html navigation.
- Home heading changed from "Braamfontein Panel Beaters" to the correct brand name.
- Corrected gallery alt text for the respray (was "grey"/"safety-grey", now white to safety-orange) and added missing space before an `alt` attribute.
- Added `width`/`height` and meaningful alt text to images and video; replaced static map image with an interactive map.
- Added `<address>`, table caption and `scope` attributes for accessibility.
- *(Add any further lecturer feedback entries here.)*

### Part 3 changes
- Added `css/part3.css`, `js/main.js`, `js/data.js` (existing `css/styles.css` and `js/script (1).js` untouched).
- Added enquiry.html and "Enquiry" nav link on every page.
- Added all interactive, dynamic, SEO, form and security features listed above.
- Added `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, `rename_images.sh`.
- Renamed images to descriptive names (see `rename_images.sh`).

## References
- Leaflet. (2023). *Leaflet 1.9.4 documentation*. https://leafletjs.com
- OpenStreetMap contributors. https://www.openstreetmap.org/copyright
- MDN Web Docs. *Constraint validation*, *Fetch API*, *IntersectionObserver*. https://developer.mozilla.org
- W3C WAI. *ARIA Authoring Practices: Accordion, Tabs, Dialog patterns*. https://www.w3.org/WAI/ARIA/apg/
- Google Search Central. *SEO Starter Guide*. https://developers.google.com/search/docs
- Schema.org. *AutoBodyShop*. https://schema.org/AutoBodyShop
- Netlify Docs. *Forms, Headers and Redirects*. https://docs.netlify.com
