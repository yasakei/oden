import { assertStrictEquals, TestInterface } from "./index.ts";

Oden.test(function noTranspiledLines() {
  const foo: TestInterface = { id: "id" };

  assertStrictEquals(foo.id, "id");
});
