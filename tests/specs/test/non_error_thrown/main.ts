Oden.test("foo", () => {
  throw undefined;
});

Oden.test("bar", () => {
  throw null;
});

Oden.test("baz", () => {
  throw 123;
});

Oden.test("qux", () => {
  throw "Hello, world!";
});

Oden.test("quux", () => {
  throw [1, 2, 3];
});

Oden.test("quuz", () => {
  throw { a: "Hello, world!", b: [1, 2, 3] };
});
