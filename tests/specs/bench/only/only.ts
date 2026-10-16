Oden.bench({
  name: "before",
  fn() {},
});

Oden.bench({
  only: true,
  name: "only",
  fn() {},
});

Oden.bench({
  name: "after",
  fn() {},
});
