// `Oden.test.ignore.each` registers one ignored test per case; none of the
// bodies run.
Oden.test.ignore.each([
  ["a"],
  ["b"],
])("ignored %s", (s) => {
  throw new Error("ignored case body should not run: " + s);
});

Oden.test("runs", () => {});
