import { getValue, setValue } from "@odentest/esm-basic";

export function sayHello() {
  setValue(5);
  console.log("Hello", getValue());
}
