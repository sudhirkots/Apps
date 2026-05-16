from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript",
        ".svg": "image/svg+xml",
    }


def main():
    host = "127.0.0.1"
    port = 8080
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving Vertigo Diagnosis Intake at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
