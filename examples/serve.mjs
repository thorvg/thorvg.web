import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const examples = join(root, 'examples');
const arg = process.argv[2] ?? '';
const target = (arg && [resolve(arg), resolve(examples, arg)].find((p) => existsSync(p) && p.startsWith(root + sep))) || examples;
const page = relative(root, target).split(sep).join('/') + (statSync(target).isDirectory() ? '/' : '');
const port = Number(process.env.PORT ?? 8080);

const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.lottie': 'application/zip',
};

createServer((req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname)));
  let file = path;
  try {
    if (!path.startsWith(root + sep) && path !== root) throw new Error();
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    statSync(file);
  } catch {
    res.writeHead(404).end('Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
  });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  const url = `http://localhost:${port}/${page}`;
  console.log(`Serving ${root} with COOP/COEP at ${url}`);

  if (!arg) return;
  const opener = { darwin: 'open', win32: 'explorer' }[process.platform] ?? 'xdg-open';
  spawn(opener, [url], { stdio: 'ignore', detached: true }).unref();
});
