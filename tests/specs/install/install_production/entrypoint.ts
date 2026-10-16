import { getValue, setValue } from "npm:@odentest/esm-basic";
import type { Fizzbuzz } from "npm:@odentest/types";

const _value: Fizzbuzz = { fizz: "fizz", buzz: "buzz" };
setValue(42);
console.log(getValue());
