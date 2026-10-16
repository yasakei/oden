const bundle = await Oden.readTextFile("out.js");
if (!bundle.includes("USED_MARKER")) {
  console.log("missing used export");
  Oden.exit(1);
}
if (bundle.includes("UNUSED_MARKER")) {
  console.log("unused export was not tree-shaken");
  Oden.exit(1);
}
console.log("ok");
