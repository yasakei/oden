import { value } from "./mod.ts";

Oden.test("b", () => {
  if (value() !== 42) throw new Error("fail");
});
