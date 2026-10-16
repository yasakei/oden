Oden.test("leak", function () {
  Oden.openSync("../../../testdata/run/001_hello.js");
  Oden.stdin.close();
});
