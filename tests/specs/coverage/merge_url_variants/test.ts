import { a } from "./source.ts";
import { b } from "./source.ts#fragment";
import { c } from "./source.ts?search";

Oden.test("a", () => {
  a();
});

Oden.test("b", () => {
  b();
});

Oden.test("c", () => {
  c();
});
