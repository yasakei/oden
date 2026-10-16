const readVersion = (p: string) =>
  JSON.parse(Oden.readTextFileSync(p + "/package.json")).version;

const topA = "node_modules/@odentest/hoisted-cycle-a";
const topB = "node_modules/@odentest/hoisted-cycle-b";
const trigger = "node_modules/@odentest/hoisted-cycle-trigger";
const nestedA = `${trigger}/node_modules/@odentest/hoisted-cycle-a`;
const nestedB = `${trigger}/node_modules/@odentest/hoisted-cycle-b`;

console.log("top a:", readVersion(topA));
console.log("top b:", readVersion(topB));
console.log("nested a:", readVersion(nestedA));
console.log("nested b:", readVersion(nestedB));
