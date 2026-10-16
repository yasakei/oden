// in this case, npm deduplication happens to
// land on the 0.5.0 version because the dynamic
// import specifier is statically analyzable
import { sum } from "npm:@odentest/add@*";
const { sum: sum2 } = await import("npm:@odentest/add@0.5.0");

console.log(sum(1, 2));
console.log(sum2(1, 2));
