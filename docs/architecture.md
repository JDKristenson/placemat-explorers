# Architecture and privacy boundaries

The [editable diagram](architecture.excalidraw) describes the current implementation, not a proposed service architecture. Download it and open it with **Open** in [Excalidraw](https://excalidraw.com/) (or a compatible local editor). Boxes, arrows and text remain individually editable. Use only generic examples if editing in an online editor; never upload family pages or private inputs. This documentation is not served by the local app server.

## Read the drawing

1. **Local file delivery.** [`serve.py`](../serve.py) serves only `index.html`, `styles.css`, `app.mjs` and `core.mjs` on `127.0.0.1:8000`. It is a static-file server, not a weather proxy, profile store or print service. There is no bundle compilation, dependency install or backend setup.
2. **Browser-only activities.** [`index.html`](../index.html) provides the controls and loads [`app.mjs`](../app.mjs). The submit handler calls `buildActivities` in [`core.mjs`](../core.mjs) with age, date, edition and letter. The date, edition and age band select the deterministic theme and maze seed; the letter selects the tracing content. The app renders the six activity panels and grown-up answers using DOM and SVG elements. [`styles.css`](../styles.css) supplies the screen and landscape print layout.
3. **Optional network boundary.** Only explicit city search and forecast actions call external services. `geocodingURL` builds an Open-Meteo geocoding request with city search text; `forecastURL` builds a forecast request with selected coordinates and forecast options. `app.mjs` fetches directly from the browser with credentials omitted and no referrer. These requests still expose ordinary network information such as IP address to the provider. Child age, letter, edition and generated activities are not request parameters.
4. **Responses are not trusted forecasts until parsed.** `normalizePlaces` filters city results; `parseForecast` validates the selected date and weather fields. The request sequence and abort controller in `app.mjs` prevent stale responses from replacing newer state. Failures leave observation prompts rather than invented weather. Core tests cover data handling; they do not simulate the full browser request lifecycle.
5. **Manual output boundary.** The print button invokes `window.print()`. The browser and the grown-up control printer selection or PDF saving. A city and date may appear in output; the age is not printed. The app does not persist settings, but browser form restoration, caches and saved PDFs are outside that guarantee. Keep outputs private.

## Source and license scope

The existing [MIT license](../LICENSE) credits **Placemat Explorers contributors** for repository code, documentation and original vector artwork. This guide does not assign personal authorship. Weather data remains attributed to [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); city search uses [GeoNames](https://www.geonames.org/) via Open-Meteo. The [README](../README.md#weather-internet-access-and-privacy) explains service terms and privacy limits.

## Maintaining this view

Update the drawing and this explanation together if imports, request destinations, storage or printing behavior change. Do not add architecture components that do not exist in source. New documentation files must be deliberately included in `scripts/audit-public.mjs` but must not be added to the local server's public route list merely to make documentation accessible.

For verification, run the three README check commands from a clean checkout. Before changing runtime behavior, also perform the age-band, failed/repeated weather and Letter/A4 print-preview checks in [CONTRIBUTING.md](../CONTRIBUTING.md). Live weather availability and print pagination are not proven by the unit tests.
