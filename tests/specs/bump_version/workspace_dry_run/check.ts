// Confirms --dry-run did not modify files.
console.log("--- a/oden.json ---");
console.log(Oden.readTextFileSync("a/oden.json").trim());
console.log("--- b/oden.json ---");
console.log(Oden.readTextFileSync("b/oden.json").trim());
