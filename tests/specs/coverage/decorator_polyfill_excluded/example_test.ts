import { Foo } from "./example.ts";

Oden.test("cov example", () => {
  if (new Foo().something() !== 1) throw new Error("unexpected");
});
