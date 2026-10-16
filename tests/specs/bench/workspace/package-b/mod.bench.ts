import { addOne } from "./mod.ts";

Oden.bench("addOne", () => {
  if (addOne(1) !== 2) {
    throw new Error("failed");
  }
});
