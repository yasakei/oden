const files = [...Oden.readDirSync(".")].filter((f) => f.name.endsWith(".svg"));
if (files.length === 0) {
  console.log("No .svg files found");
  Oden.exit(1);
}
const content = Oden.readTextFileSync(files[0].name);
if (!content.includes("<svg")) {
  console.log("Missing SVG element");
  Oden.exit(1);
}
if (!content.includes("CPU Flamegraph")) {
  console.log("Missing flamegraph title");
  Oden.exit(1);
}
if (!content.includes('id="frames"')) {
  console.log("Missing frames container");
  Oden.exit(1);
}
if (!content.includes("fg:x=")) {
  console.log("Missing frame data attributes");
  Oden.exit(1);
}
if (!content.includes("function init(evt)")) {
  console.log("Missing interactive JavaScript");
  Oden.exit(1);
}
if (!content.includes('height="100%"')) {
  console.log("SVG should use full viewport height");
  Oden.exit(1);
}
if (!content.includes("fg:content_height=")) {
  console.log("Missing content height data attribute");
  Oden.exit(1);
}
console.log("Valid flamegraph");
