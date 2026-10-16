import { add } from "./math.ts";

Oden.test("add", () => {
  if (add(1, 2) !== 3) throw new Error("fail");
});
