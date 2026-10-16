import { add } from "./mod.ts";

Oden.bench("add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("failed");
  }
});
