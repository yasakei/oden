// Verifies post-bump file contents.
console.log("--- a/oden.json ---");
console.log(Oden.readTextFileSync("a/oden.json").trim());
console.log("--- b/oden.json ---");
console.log(Oden.readTextFileSync("b/oden.json").trim());
console.log("--- import_map.json ---");
console.log(Oden.readTextFileSync("import_map.json").trim());
