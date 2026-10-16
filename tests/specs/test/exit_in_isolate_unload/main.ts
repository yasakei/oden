// Regression test for https://github.com/denoland/deno/issues/12888
// `Oden.exit()` called from outside any test function (here, an `unload`
// listener) used to terminate the whole `oden test` process with the
// requested code. The failed test would silently disappear behind a zero
// exit code. The expected behavior is for the isolate to be torn down while
// the existing test results stand.
Oden.test("fail", () => {
  throw new Error("fail");
});

self.onunload = () => {
  Oden.exit(0);
};
