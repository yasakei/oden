import { add } from "./lib.ts";

Oden.bench("should add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("Fail");
  }
});
