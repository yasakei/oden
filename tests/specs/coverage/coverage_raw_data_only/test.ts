import { add } from "./source.ts";

Oden.test("add()", () => {
  if (add(1, 2) !== 3) {
    throw new Error("test failed");
  }
});
