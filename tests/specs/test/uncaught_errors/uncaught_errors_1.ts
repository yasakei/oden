Oden.test("foo 1", () => {
  throw new Error("foo 1 message");
});

Oden.test("foo 2", () => {});

Oden.test("foo 3", () => {
  Promise.reject(new Error("foo 3 message"));
});
