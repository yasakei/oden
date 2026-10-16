// @ts-check
import cjsDefault, {
  MyClass as MyCjsClass,
} from "npm:@odentest/cjs-default-export";
import * as cjsNamespace from "npm:@odentest/cjs-default-export";
import esmDefault from "npm:@odentest/esm-import-cjs-default";
import * as esmNamespace from "npm:@odentest/esm-import-cjs-default";

console.log("Oden esm importing node cjs");
console.log("===========================");
console.log(cjsDefault);
console.log(cjsNamespace);
console.log("===========================");

console.log("Oden esm importing node esm");
console.log("===========================");
console.log(esmDefault);
console.log(esmNamespace);
console.log("===========================");

console.log(cjsDefault.default());
console.log(esmDefault());
console.log(MyCjsClass.someStaticMethod());
