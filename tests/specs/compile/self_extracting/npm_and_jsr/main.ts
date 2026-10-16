import { add } from "jsr:@odentest/add@1.0.0";
import { url } from "@odentest/esm-basic";
import { hello } from "@odentest/node-addon";
import { printHello } from "http://localhost:4545/subdir/print_hello.ts";

console.log(`add(1, 2) = ${add(1, 2)}`);
console.log(`url = ${typeof url}`);
console.log(`hello() = ${hello()}`);
printHello();
console.log("success");
