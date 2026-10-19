# VORX Pro Terminal
<!—
Mobile-first PWA for jewelry showroom and bullion work. Plain HTML, CSS and JavaScript, no build step.

## Pages
| Page | Module | What it does |
|---|---|---|
| `index.html` | VORX | Dashboard, live gold spot, quick gram/vori converter |
| `rate.html` | BULLION | Rate F: bhori rate, totals, invoice (print or save as PDF) |
| `karat.html` | KARAT | Purity matrix and same-gold weight table |
| `price.html` | VALUER | Total price from price per vori and weight |
| `converter.html` | CONVERTER | Gram and vori/ana/roti/point both ways |
| `casio.html` | MATRIX | Calculator with step review, correction and history tape |
| `settings.html` | SETTINGS | Theme colors, install app, clear cache |

Shared code lives in `vorx.css` and `vorx.js` (header, menu, numpad, theme, saving).

## Deploy (GitHub Pages)
1. Delete the old files from your repository.
2. Upload everything in this folder to the repository root, keeping the files together.
3. Open the site once online, then Add to Home screen.

## Notes
- Formulas: 1 vori = 11.664 g; rate = ((oz x 3.674 / 31.1035 x purity) + MC) x 11.664 x Dh + CR + MG.
- Live gold price comes from `api.gold-api.com` (free, no key). If the price shows OFFLINE on your site, swap `FEED` in `index.html` for another source.
- Change the cache name in `service-worker.js` (`vorx-v1`) whenever you publish updates.
—>
