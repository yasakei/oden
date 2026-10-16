import { noComment, withComment } from "./mod.ts";

Oden.test("guards", () => {
  noComment({});
  withComment({});
});
