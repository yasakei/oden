import { add } from "./add.mjs";

Oden.test("should add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("FAIL");
  }
});
