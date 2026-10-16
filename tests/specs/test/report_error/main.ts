Oden.test("foo", () => {
  reportError(new Error("foo"));
  console.log(1);
});

Oden.test("bar", () => {});
