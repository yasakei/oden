const hoisted = JSON.parse(
  Oden.readTextFileSync(
    "node_modules/@odentest/different-nested-dep-child/package.json",
  ),
);
const nested = JSON.parse(
  Oden.readTextFileSync(
    "node_modules/@odentest/needs-different-nested-dep-child-v2/node_modules/@odentest/different-nested-dep-child/package.json",
  ),
);
console.log("hoisted:", hoisted.version);
console.log("nested:", nested.version);
