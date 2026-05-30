const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = 8080;
const root = process.cwd();

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${host}`);
    const requestedPath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const filePath = path.resolve(root, requestedPath);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, host, () => {
    console.log(`Serving Vertigo Diagnosis Intake at http://${host}:${port}`);
  });
