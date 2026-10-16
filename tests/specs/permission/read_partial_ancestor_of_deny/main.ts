// Regression test for https://github.com/denoland/deno/issues/27622.
// `Oden.stat` on the cwd (an ancestor of the `--deny-read=denied` path) must
// succeed; only operations that actually touch the denied scope are blocked.
const stat = Oden.statSync(Oden.cwd());
console.log("stat cwd:", stat.isDirectory ? "directory" : "other");

try {
  Oden.statSync("denied");
  console.log("stat denied: UNEXPECTED OK");
} catch (e) {
  console.log("stat denied:", (e as Error).name);
}
