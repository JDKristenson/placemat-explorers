#!/usr/bin/env python3
"""Serve only the public browser app on the local computer. Standard library only."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
PUBLIC = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/styles.css": ("styles.css", "text/css; charset=utf-8"),
    "/app.mjs": ("app.mjs", "text/javascript; charset=utf-8"),
    "/core.mjs": ("core.mjs", "text/javascript; charset=utf-8"),
}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        target = PUBLIC.get(urlsplit(self.path).path)
        if not target:
            self.send_error(404)
            return
        filename, mime = target
        payload = (ROOT / filename).read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        pass  # Avoid retaining user-entered query strings or browsing logs.

if __name__ == "__main__":
    print("Placemat Explorers: http://127.0.0.1:8000 (Ctrl+C to stop)")
    try:
        with ThreadingHTTPServer(("127.0.0.1", 8000), Handler) as server:
            server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
