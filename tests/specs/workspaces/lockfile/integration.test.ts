import { add } from "@scope/pkg";

Oden.test("should add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("failed");
  }
});
