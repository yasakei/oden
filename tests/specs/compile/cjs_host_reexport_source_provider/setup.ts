await Oden.mkdir("allowed", { recursive: true });
await Promise.all([
  Oden.writeTextFile(
    "allowed/reexport.cjs",
    'module.exports = require("./inner.cjs");\n',
  ),
  Oden.writeTextFile("allowed/inner.cjs", 'exports.value = "from-inner";\n'),
  Oden.writeTextFile(
    "allowed/denied.cjs",
    'module.exports = require("../outside.cjs");\n',
  ),
  Oden.writeTextFile(
    "outside.cjs",
    "ODEN_STANDALONE_CJS_SOURCE_CANARY = ;\n",
  ),
]);
