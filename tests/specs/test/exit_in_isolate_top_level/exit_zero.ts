// `Oden.exit(0)` at module top level should terminate this isolate cleanly
// (exit code 0) without killing the oden test process when there are other
// specifiers, and without leaving the unregistered test as a phantom result.
Oden.exit(0);

Oden.test("never registers", () => {
  throw new Error("should not run");
});
