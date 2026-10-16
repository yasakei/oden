import { sum } from "@odentest/add";

console.log(sum(2, 2));

console.log(
  JSON.parse(Oden.readTextFileSync(
    new URL("node_modules/@odentest/add/package.json", import.meta.url),
  )).version,
);
