import { subtract } from "./mod.ts";

Oden.test("subtract", () => {
  if (subtract(3, 2) !== 1) {
    throw new Error("fail");
  }
});
