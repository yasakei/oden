import defaultImport, * as namespaceImport from "npm:@odentest/cjs-module-export-assignment";
import { func } from "npm:@odentest/cjs-module-export-assignment";

console.log(defaultImport);
console.log(namespaceImport);
console.log(func());
