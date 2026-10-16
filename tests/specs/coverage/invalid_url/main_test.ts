import { foo } from "./main.ts";
import vm from "node:vm";
Oden.test(function fooWorks() {
  foo();
  vm.runInNewContext("console.log('hi')");
});
