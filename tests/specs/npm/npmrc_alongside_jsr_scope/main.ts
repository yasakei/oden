import { add } from "npm:@jsr/odentest__add";
import { getValue, setValue } from "npm:@odentest/basic";

console.log(add(1, 2));
setValue(1);
console.log(getValue());
