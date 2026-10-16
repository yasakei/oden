Oden.test("exit", { sanitizeExit: false }, function () {
  console.log("output before exit");
  Oden.exit(42);
});

Oden.test("never runs", function () {
  console.log("this test should never run");
});
