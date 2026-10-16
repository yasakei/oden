import { guarded } from "./mod.js";

Oden.test("takes the consequent, never the alternative", () => {
  guarded(1);
});
