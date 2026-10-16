Oden.test({
  name: "success",
  fn() {},
});

Oden.test({
  name: "fail",
  fn() {
    throw new Error("fail");
  },
});

Oden.test({
  name: "ignored",
  ignore: true,
  fn() {},
});
