// Turns the raw generated footage and stills in source/ into web assets in public/media/.
// Videos: optional crop, cross-fade the tail into the head for a seamless loop,
// drop audio, H.264 + VP9. Stills: AVIF + WebP at a few widths.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const OUT = 'public/media';
fs.mkdirSync(OUT, { recursive: true });

const videos = [
  // crop: w:h:x:y in source pixels; trim: [start, end] seconds of usable footage
  { name: 'plateau', src: 'source/v1-plateau.mp4', crop: null, trim: [0, 7.8], fade: 1.5 },
  // The sky rotates fast in this take, so a cross-fade would double the stars: play it forward, then back.
  { name: 'stars', src: 'source/v2-stars.mp4', crop: null, trim: [0, 4], pingpong: true },
];

// Scroll-scrubbed clips: every 4th frame a keyframe so seeking backwards stays smooth.
const scrubbed = [{ name: 'aperture', src: 'source/v3-aperture.mp4' }];

const stills = [
  { name: 'cabin', src: 'source/s1-cabin.jpg', widths: [960, 1600, 2400] },
  { name: 'moonwalk', src: 'source/s2-moonwalk.jpg', widths: [960, 1600, 2400] },
  { name: 'pleiades', src: 'source/s3-pleiades.jpg', widths: [960, 1600, 2400] },
  { name: 'brass', src: 'source/s4-brass.jpg', widths: [640, 1200] },
];

// Sources are native 1080p; the scale only normalises any older 720p take to the same width.
const HD = 'scale=1920:-2:flags=lanczos';

const run = (args) => execFileSync(ffmpeg, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

for (const v of videos) {
  if (!fs.existsSync(v.src)) {
    console.log(`skip ${v.name}: ${v.src} missing`);
    continue;
  }
  const [s, e] = v.trim;
  const len = e - s;
  const X = v.fade;
  const crop = v.crop ? `crop=${v.crop},` : '';
  // [main] = X..len, [head] = 0..X; fading main's last X seconds into head makes the
  // final frame equal main's first frame, so the loop point is invisible.
  const graph = v.pingpong
    ? `[0:v]${crop}${HD},setsar=1,fps=24,split=2[a][b];[b]reverse,trim=start_frame=1[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]`
    : `[0:v]${crop}${HD},setsar=1,fps=24,split=2[a][b];` +
    `[a]trim=start=${X},setpts=PTS-STARTPTS[main];` +
    `[b]trim=end=${X},setpts=PTS-STARTPTS[head];` +
    `[main][head]xfade=transition=fade:duration=${X}:offset=${len - 2 * X},format=yuv420p[v]`;
  const input = ['-ss', String(s), '-t', String(len), '-i', v.src];
  run([...input, '-filter_complex', graph, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow',
    '-crf', '20', '-maxrate', '5M', '-bufsize', '10M', '-movflags', '+faststart', `${OUT}/${v.name}.mp4`]);
  run([...input, '-filter_complex', graph, '-map', '[v]', '-an', '-c:v', 'libvpx-vp9', '-b:v', '4M',
    '-crf', '30', '-row-mt', '1', `${OUT}/${v.name}.webm`]);
  run(['-i', `${OUT}/${v.name}.mp4`, '-frames:v', '1', '-q:v', '3', `${OUT}/${v.name}-poster.jpg`]);
  const kb = (f) => Math.round(fs.statSync(f).size / 1024);
  console.log(`${v.name}: mp4 ${kb(`${OUT}/${v.name}.mp4`)} KB, webm ${kb(`${OUT}/${v.name}.webm`)} KB`);
}

for (const v of scrubbed) {
  run(['-i', v.src, '-an', '-vf', `${HD},fps=24,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow',
    '-crf', '24', '-maxrate', '7M', '-bufsize', '7M', '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-movflags', '+faststart',
    `${OUT}/${v.name}.mp4`]);
  run(['-i', `${OUT}/${v.name}.mp4`, '-frames:v', '1', '-q:v', '3', `${OUT}/${v.name}-poster.jpg`]);
  console.log(`${v.name}: scrub mp4 ${Math.round(fs.statSync(`${OUT}/${v.name}.mp4`).size / 1024)} KB`);
}

for (const st of stills) {
  for (const w of st.widths) {
    const img = sharp(st.src).resize({ width: w, withoutEnlargement: true });
    await img.clone().avif({ quality: 50 }).toFile(`${OUT}/${st.name}-${w}.avif`);
    await img.clone().webp({ quality: 74 }).toFile(`${OUT}/${st.name}-${w}.webp`);
  }
  console.log(`${st.name}: ${st.widths.join('/')}`);
}
