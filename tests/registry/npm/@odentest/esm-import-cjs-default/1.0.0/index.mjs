import defaultImport, { MyClass } from "@odentest/cjs-default-export";
import * as namespaceImport from "@odentest/cjs-default-export";
import localDefaultImport from "./local.cjs";
import * as localNamespaceImport from "./local.cjs";

console.log("Node esm importing node cjs");
console.log("===========================");
console.log(defaultImport);
console.log(localDefaultImport);
console.log(namespaceImport);
console.log(localNamespaceImport);
console.log("===========================");
console.log(MyClass.someStaticMethod());

export default function() {
  return defaultImport.default() * 5;
}
