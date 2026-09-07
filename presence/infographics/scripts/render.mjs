// Renders a board to PNG (poster frame, 2x), MP4 (master) and GIF (loop).
//
//   node presence/infographics/scripts/render.mjs <board.html> [outdir]
//
// Needs playwright-core on NODE_PATH (npm i playwright-core, or point
// NODE_PATH at a folder that has it), the Chromium that ships with
// Playwright (PLAYWRIGHT_BROWSERS_PATH or CHROME), and ffmpeg (FFMPEG).
// The board declares its total length in <body data-duration="ms">;
// motion must finish well inside it so the tail holds as a poster.

import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { basename, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// ESM ignores NODE_PATH, so resolve playwright-core from the repo root,
// this folder, or any NODE_PATH entry, in that order.
function loadPlaywright() {
  const here = new URL('.', import.meta.url).pathname;
  const candidates = [resolve(here, '../../..'), here, ...(process.env.NODE_PATH || '').split(':').filter(Boolean)];
  for (const base of candidates) {
    try { return createRequire(join(base, 'noop.js')).resolve('playwright-core'); } catch {}
  }
  throw new Error('playwright-core not found: npm i playwright-core in the repo root, or set NODE_PATH');
}
const pwMod = await import(pathToFileURL(loadPlaywright()).href);
const { chromium } = pwMod.default ?? pwMod;

const [,, boardArg, outArg] = process.argv;
if (!boardArg) { console.error('usage: render.mjs <board.html> [outdir]'); process.exit(1); }
const board = resolve(boardArg);
const name = basename(board, '.html');
const out = resolve(outArg || join(process.cwd(), 'presence/infographics/out'));
const frames = join(out, `.frames-${name}`);
const FPS = 30;
const W = 1080, H = 1350;

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (existsSync(root)) {
    const dir = readdirSync(root).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) return join(root, dir, 'chrome-linux', 'chrome');
  }
  return undefined;
}
function findFfmpeg() {
  // Order: FFMPEG env, ffmpeg on PATH, the static build from the
  // imageio-ffmpeg Python package, then Playwright's bundled one. The
  // Playwright build has no libx264 or gif encoder, so it is last resort.
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const tryCmd = (cmd, args) => { try { return execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
  const onPath = tryCmd('which', ['ffmpeg']); if (onPath) return onPath;
  const py = tryCmd('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']); if (py) return py;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (existsSync(root)) {
    const dir = readdirSync(root).filter(d => /^ffmpeg-\d+$/.test(d)).sort().pop();
    if (dir) return join(root, dir, 'ffmpeg-linux');
  }
  return 'ffmpeg';
}
function assertEncoders(ff) {
  const list = execFileSync(ff, ['-hide_banner', '-encoders'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  for (const enc of ['libx264', 'gif']) if (!list.includes(` ${enc} `)) {
    throw new Error(`${ff} lacks the ${enc} encoder. Install a full build: pip install imageio-ffmpeg, or set FFMPEG=/path/to/ffmpeg`);
  }
}

mkdirSync(out, { recursive: true });
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });

const browser = await chromium.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(board).href);
await page.waitForLoadState('load');
await page.evaluate(() => document.fonts.ready);

const duration = await page.evaluate(() => Number(document.body.dataset.duration || 6000));
const motionEnd = await page.evaluate(() =>
  Math.max(0, ...document.getAnimations().map(a => {
    const t = a.effect.getTiming();
    return (typeof t.delay === 'number' ? t.delay : 0) + (typeof t.duration === 'number' ? t.duration : 0);
  })));
if (motionEnd > duration) { console.error(`motion ends at ${motionEnd}ms, after data-duration ${duration}ms`); process.exit(2); }
if (duration > 16000) { console.error(`duration ${duration}ms exceeds the 16 s limit`); process.exit(2); }

// 1. Poster frame: every animation finished. This is the PNG people screenshot.
await page.evaluate(() => document.getAnimations().forEach(a => a.finish()));
await page.screenshot({ path: join(out, `${name}.png`), type: 'png' });

// 2. Frames: scrub every animation to t and capture.
const total = Math.round(duration / 1000 * FPS);
for (let i = 0; i < total; i++) {
  const t = i * 1000 / FPS;
  await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), t);
  await page.screenshot({ path: join(frames, `f${String(i).padStart(4, '0')}.png`), type: 'png' });
}
await browser.close();

// 3. Encode. MP4 at native 1080x1350; GIF at 720 wide, 12 fps, 128 colours, no dither.
const ff = findFfmpeg();
assertEncoders(ff);
execFileSync(ff, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'),
  '-vf', `scale=${W}:${H}:flags=lanczos`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', join(out, `${name}.mp4`)]);
execFileSync(ff, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'),
  '-vf', 'fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none',
  '-loop', '0', join(out, `${name}.gif`)]);
rmSync(frames, { recursive: true, force: true });

console.log(`wrote ${join(out, name)}.{png,mp4,gif}  duration ${duration}ms  motion ends ${motionEnd}ms  ${total} frames`);
