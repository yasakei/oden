Oden.bench({
  name: "success",
  fn() {},
});

Oden.bench({
  name: "success long",
  fn() {
    1024n ** 10000n;
  },
});

Oden.bench({
  name: "success but longer",
  fn() {
    1024n ** 1000000n;
  },
});

Oden.bench({
  name: "success long and the longest name",
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
});

Oden.bench({
  name: "fail",
  fn() {
    throw new Error("fail");
  },
});

Oden.bench({
  name: "ignored",
  ignore: true,
  fn() {},
});
