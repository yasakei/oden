// Verify .d.ts files are placed in the outdir
const mainDts = Oden.statSync("dist/main.d.ts");
console.log(mainDts.isFile);
const helpersDts = Oden.statSync("dist/helpers.d.ts");
console.log(helpersDts.isFile);
