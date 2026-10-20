import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = normalize(join(fileURLToPath(new URL(".", import.meta.url)), ".."));
const port = Number(process.env.PORT || 4174);
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json", ".png":"image/png", ".json":"application/json; charset=utf-8" };

createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const candidate = normalize(join(root, relativePath));
  if (!candidate.startsWith(root) || !existsSync(candidate) || !statSync(candidate).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": types[extname(candidate)] || "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(candidate).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Nexus Verity is running at http://127.0.0.1:${port}`);
});
