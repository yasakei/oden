#!/usr/bin/env node
// Renders bench/report.html from hyperfine JSON exports in bench/data/.
// Self-contained HTML, no external assets.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const dataDir = join(root, "data");

const suites = [
  ["r-version", { label: "CLI parse only (`--version`)", blurb: "process boot + arg parsing, no JS execution" }],
  ["r-eval", { label: "Eval tiny script", blurb: "full bootstrap + JS execution + teardown" }],
  ["r-file", { label: "Run tiny file", blurb: "bootstrap + module loading + JS execution" }],
  ["r-npm", { label: "Run file with npm dependency import", blurb: "startup + npm package resolution + package loading (bun uses bare `import(\"abbrev\")` — bun 1.4 dropped the `npm:` prefix; same node_modules workload)" }],
];

const colors = {
  oden: ["#ff6b5e", "#c92c2c"],
  deno: ["#8ce99a", "#2f9e44"],
  bun: ["#ffe066", "#f08c00"],
  node: ["#a9e34b", "#74b816"],
};
const nameOf = (cmd) =>
  /oden/.test(cmd) ? "oden" :
  /deno/.test(cmd) ? "deno" :
  /\bbun\b/.test(cmd) ? "bun" :
  /\bnode\b/.test(cmd) ? "node" :
  cmd?.slice(0, 10) || "other";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
// hyperfine stores durations in seconds; convert up front
const fmt = (sec) => {
  const msv = sec * 1000;
  return msv >= 1000 ? `${(msv / 1000).toFixed(2)} s` : `${msv.toFixed(1)} ms`;
};

function chartHtml(suite, meta, json) {
  const results = [...json.results].sort((a, b) => a.mean - b.mean);
  const min = results[0].mean;
  const max = Math.max(...results.map((r) => r.mean));
  // Bars are sized with headroom so the fastest one isn't a zero-width sliver.
  const pad = Math.max((max - min) * 0.15, max * 0.12);
  const denom = max + pad;
  const rows = results.map((r, i) => {
    const n = nameOf(r.command);
    const [c1, c2] = colors[n] || ["#9aa5b1", "#5c6670"];
    const ratio = r.mean / min;
    const rel = ratio < 1.03 ? "fastest ⚡" : `${ratio.toFixed(1)}× slower`;
    const width = (r.mean / denom * 100).toFixed(1);
    const tip = `min ${fmt(r.min)} / max ${fmt(r.max)} / ±${fmt(r.stddev)}`;
    return `      <div class="row">
        <div class="label">${esc(n)}</div>
        <div class="track" title="${esc(r.command)}">
          <div class="bar" style="width:${width}%;background:linear-gradient(90deg,${c2},${c1})"></div>
          <div class="value">${fmt(r.mean)}</div>
          <div class="ratio">${rel}</div>
        </div>
      </div>`;
  }).join("\n");
  const p = json.results[0];
  const metaLine = `${p?.command ? esc(p.command) : ""} · ${p?.runs ?? "?"} runs`;
  return `  <section class="chart">
    <h2>${esc(meta.label)}</h2>
    <p class="blurb">${esc(meta.blurb)}</p>
${rows}
    <div class="meta">${metaLine}</div>
  </section>`;
}

let charts = "";
const envLine = [];
for (const [suite, meta] of suites) {
  let json;
  try {
    json = JSON.parse(readFileSync(join(dataDir, suite + ".json"), "utf8"));
  } catch { continue; }
  charts += chartHtml(suite, meta, json) + "\n";
}

const ver = (() => {
  try { return JSON.parse(readFileSync(join(dataDir, "env.json"), "utf8")); }
  catch { return {}; }
})();
const now = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Oden startup benchmarks</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { background:#0d1117; color:#c9d1d9; font:15px/1.5 "Segoe UI",system-ui,sans-serif; margin:0; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 34px 20px 60px; }
  h1 { font-size: 27px; margin: 0 0 2px; color:#fff; letter-spacing:-.5px; }
  h1 .accent { color:#ff6b5e; }
  .sub { color:#8b949e; margin: 0 0 26px; }
  .chart { background:#161b22; border:1px solid #30363d; border-radius:14px; padding:20px 22px 16px; margin-bottom:20px;
           box-shadow:0 2px 16px rgba(0,0,0,.4); }
  .chart h2 { margin:0; font-size:16px; color:#e6edf3; }
  .blurb { margin:2px 0 14px; color:#8b949e; font-size:12.5px; }
  .row { display:grid; grid-template-columns:64px 1fr; align-items:center; gap:12px; margin:9px 0; }
  .label { font-weight:700; text-align:right; color:#e6edf3; font-size:13px; }
  .track { position:relative; height:30px; background:#21262d; border-radius:8px; overflow:hidden; cursor:help; }
  .bar { position:absolute; inset:0 auto 0 0; border-radius:8px; }
  .value { position:absolute; left:10px; top:50%; transform:translateY(-50%); font-variant-numeric:tabular-nums;
           font-weight:700; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.7); font-size:13px; }
  .ratio { position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:11.5px; color:#58a6ff; font-weight:600; }
  .meta { margin-top:10px; color:#6e7681; font-size:11.5px; }
  .foot { color:#8b949e; font-size:12px; border-top:1px solid #30363d; padding-top:14px; }
  code { background:#21262d; border-radius:4px; padding:1px 5px; font-size:12px; }
</style></head>
<body><div class="wrap">
<h1>⚡ <span class="accent">Oden</span> startup benchmarks</h1>
<div class="sub">CLI startup comparison: Oden vs deno · bun · node — ${esc(now)}</div>
${charts}
<div class="foot">
  <strong style="color:#e6edf3">${esc(ver.engines || "")}</strong> · measured with hyperfine on the codespace (${esc(ver.cpu || "4 cores")} · ${esc(ver.mem || "")})<br>
  ${esc(ver.caveat || "")}
</div>
</div></body></html>`;

const outDir = join(root, "report");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html);
console.log("wrote bench/report/index.html");
