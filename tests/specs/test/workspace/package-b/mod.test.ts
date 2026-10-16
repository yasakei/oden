import { addOne } from "./mod.ts";

Oden.test("addOne", () => {
  if (addOne(1) !== 2) {
    throw new Error("failed");
  }
});

Oden.test("fail", () => {
  throw new Error("failed");
});
