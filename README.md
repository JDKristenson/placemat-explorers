# Placemat Explorers

A small, local-first activity generator for curious children and their grown-ups. Pick an age, date, edition and letter. Make a one-page landscape placemat with a maze, tracing, counting, patterns, a kind story, and a weather observation activity.

**No account, AI API key, database, analytics, child name, or paid dependency.** Child age is used in the browser and is never included in weather requests or printed on the page.

## Try it locally

Install Python 3 from [python.org](https://www.python.org/) if needed, download this repository, and run from its folder:

```sh
python3 serve.py
```

Open **http://127.0.0.1:8000** in a current Chrome, Edge, Firefox or Safari browser. Stop the server with Ctrl+C. The local server binds only to your computer and serves an explicit list of public app files. Opening `index.html` directly is not supported because the app uses JavaScript modules.

1. Choose a child's age from 3 to 12. These are broad activity levels, not a developmental assessment. Choose a different level whenever it is useful.
2. Choose the day, morning or afternoon edition, and a letter. Select **Make my placemat**.
3. Optionally search a **city or town**, choose the correct result, then select **Add local forecast**. A street address or device-location permission is never needed.
4. Preview the page and open the grown-up answers if helpful. Select **Print / save PDF**. Choose landscape, Letter or A4, and turn off browser headers and footers. Use the print preview to confirm one page; if a browser adds a page, reduce its scale slightly.

Printing is always a manual browser action. Nothing sends jobs to a printer or schedules future prints.

## What changes with age?

- **3–4:** short read-aloud prompts, four-item counting, a small maze, simple repeating patterns, and sharing feelings.
- **5–6:** larger mazes, eight-item grouping, longer pattern rules, and fair choices.
- **7–9:** equal groups, more complex mazes, explanations, and encouraging a friend.
- **10–12:** factors, longer patterns, more challenging mazes, and considering different perspectives.

Letter tracing remains available at every level. Older levels add sentence writing. A date, edition and activity level deterministically select one of three themes and a new maze. This is a curated activity generator, not a generative-AI system: some prompts and artwork repeat. Morning and afternoon use different seeds; they may share a theme. Children can color the original vector line art. Caregivers should adapt or skip anything that does not fit.

## Weather, internet access and privacy

Activities work with no internet connection once the local app files have loaded. Weather is optional. If no forecast is loaded, the sheet asks the child to look outside and explain what to wear or bring. Failed or stale requests never become invented weather.

The only external requests made by the app are explicit weather actions:

| Action | Recipient | Information sent |
| --- | --- | --- |
| Search cities | `geocoding-api.open-meteo.com` | City search text and normal network information such as IP address |
| Add local forecast | `api.open-meteo.com` | Selected city's latitude/longitude, requested forecast fields, timezone option, and normal network information |

The child's age, chosen letter, edition and activities are **not sent** to those services. There is no automatic location lookup, telemetry, cookie use, local storage, account or profile. Settings live in page memory. The app does not save settings. Browsers may retain or restore form data, history, print files or caches. A generated PDF or print can show the selected city and date. Keep generated family pages private.

Weather data comes from [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). City search uses [GeoNames](https://www.geonames.org/) via Open-Meteo. Forecasts are available for today and up to 15 days ahead, subject to provider availability and local time differences. Longer-range forecasts are less certain. Weather is **not a safety alert**; use official local warnings for outdoor decisions.

The Open-Meteo free API is for non-commercial use and has usage limits. Review its [terms](https://open-meteo.com/en/terms) and [pricing](https://open-meteo.com/en/pricing) before commercial hosting or high-volume use. The app's MIT license does not override those service terms. Commercial deployments may need a backend and their own paid service credentials. Never put credentials into public browser code.

## Development and checks

Node.js 20 or newer is needed only to run the tests. There are no npm dependencies and no build step.

```sh
npm test
npm run audit:public
python3 -m unittest discover -s tests -p 'test_*.py'
```

- `core.mjs`: pure activity generation, input validation, weather parsing and fixed-host URL construction.
- `app.mjs`: accessible controls, optional forecast requests, original SVG artwork and printable rendering.
- `styles.css`: responsive setup controls and landscape print layout.
- `serve.py`: minimal loopback-only, allowlisted static server.
- `tests/`: deterministic generation, every age band, maze validity, validation, weather failure cases and public-content checks.
- `scripts/audit-public.mjs`: conservative release file allowlist and unsafe-content checks. This supplements human review, not a guarantee that arbitrary future edits contain no secrets.

Activity generation uses a seeded perfect maze (connected tree), so every cell is reachable and each pair of cells has exactly one path. The grown-up answer panel includes its solution.

## Contributing safely

See [CONTRIBUTING.md](CONTRIBUTING.md). Use fictional, generic test inputs. Never commit child profiles, family schedules, generated personal PDFs, addresses, photos, weather caches, printer identifiers, credentials, local environment files or old private repository history. The examples here are generic and do not describe a real family.

## License

Code, documentation and original vector illustrations in this repository are available under the [MIT License](LICENSE). External weather and geocoding data retain their own licenses and service terms. There are no bundled third-party photos, fonts, datasets or generated family placemats.
