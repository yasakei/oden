import { getValue, setValue } from "@odentest/basic";
import * as test from "@odentest2/basic";

console.log(getValue());
setValue(42);
console.log(getValue());

console.log(test.getValue());
