Oden.test("bar 1", () => {});

Oden.test("bar 2", () => {
  throw new Error("bar 2");
});
Oden.test("bar 3", () => {
  throw new Error("bar 3 message");
});
