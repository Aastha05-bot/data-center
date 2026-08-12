# Nepal Data Center Story — Static Site

A lightweight vanilla HTML/CSS/JavaScript learning page about Nepal's
data centers. The page is rendered in the browser and content is loaded
from `src/content.json`.

## Run it

Open `src/index.html` directly in your browser, or serve the `src/`
folder with a local static HTTP server for best compatibility.

Example using Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/src/index.html`.

## Files

- `src/index.html` — main page shell and layout
- `src/style.css` — visual design, layout, and responsive styles
- `src/script.js` — page logic, content loading, narration, and UI
- `src/content.json` — app content, quiz questions, narration text,
  and data center facts

## Usage

All content is loaded from `src/content.json`. 
Replacing information from there will change what is displayed
on the site.

## Notes

- This project does not require Node, React, or a build step.
- Content is loaded from JSON and applied to the DOM at runtime.
- Voice narration is implemented using the browser `speechSynthesis`
  Web API when available.
- `src/index.html` also loads Leaflet CSS from CDN for the map display.
