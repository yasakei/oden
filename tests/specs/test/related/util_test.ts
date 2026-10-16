import { id } from "./util.ts";

Oden.test("id", () => {
  if (id(5) !== 5) throw new Error("fail");
});
