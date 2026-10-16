Oden.test("test0", () => {});
Oden.test(function test1() {});
Oden.test({ name: "test2", fn: () => {} });
Oden.test("test3", { permissions: "none" }, () => {});
Oden.test({ name: "test4" }, () => {});
Oden.test({ ignore: true }, function test5() {});
