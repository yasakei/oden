Oden.test({
  name: "before",
  fn() {},
});

Oden.test({
  only: true,
  name: "only",
  fn() {},
});

Oden.test.only({
  name: "only2",
  fn() {},
});

Oden.test({
  name: "after",
  fn() {},
});
