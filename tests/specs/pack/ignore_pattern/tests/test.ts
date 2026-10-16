import { assertEquals } from "jsr:@std/assert";
import { main } from "../mod.ts";

Oden.test("main function", () => {
  assertEquals(main(), "helper result");
});
