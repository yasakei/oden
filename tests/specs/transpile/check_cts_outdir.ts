// Verify .cts files are transpiled to .cjs
const info = Oden.statSync("dist/helper.cjs");
console.log(info.isFile);
