import { value } from "../b/mod.ts";

Oden.test("a", () => {
  if (value() !== 42) throw new Error("fail");
});
