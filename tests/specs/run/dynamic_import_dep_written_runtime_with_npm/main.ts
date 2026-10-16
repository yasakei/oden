Oden.writeTextFileSync(
  "./b.ts",
  `
import { add } from "npm:@odentest/add";
console.log(add(1, 2));
`,
);

console.log("Loading...");
await import("./a.ts");
