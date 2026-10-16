// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assertEquals,
  assertInstanceOf,
  assertThrows,
  fail,
} from "@std/assert";

const errorConstructors = [
  Oden.errors.NotFound,
  Oden.errors.PermissionDenied,
  Oden.errors.ConnectionRefused,
  Oden.errors.ConnectionReset,
  Oden.errors.ConnectionAborted,
  Oden.errors.NotConnected,
  Oden.errors.AddrInUse,
  Oden.errors.AddrNotAvailable,
  Oden.errors.BrokenPipe,
  Oden.errors.AlreadyExists,
  Oden.errors.InvalidData,
  Oden.errors.TimedOut,
  Oden.errors.Interrupted,
  Oden.errors.WriteZero,
  Oden.errors.WouldBlock,
  Oden.errors.UnexpectedEof,
  Oden.errors.BadResource,
  Oden.errors.Http,
  Oden.errors.Busy,
  Oden.errors.NotSupported,
  Oden.errors.FilesystemLoop,
  Oden.errors.IsADirectory,
  Oden.errors.NetworkUnreachable,
  Oden.errors.NotADirectory,
  Oden.errors.NotCapable,
];

function assertError(ErrorConstructor: typeof Oden.errors.NotFound) {
  const error = new ErrorConstructor("msg", { cause: "cause" });
  assertInstanceOf(error, Error);
  assertEquals(error.cause, "cause");
}

Oden.test("Errors work", () => {
  for (const errorConstructor of errorConstructors) {
    assertError(errorConstructor);
  }
});

Oden.test("Errors have some tamper resistance", () => {
  // deno-lint-ignore no-explicit-any
  (Object.prototype as any).get = () => {};
  assertThrows(() => fail("test error"), Error, "test error");
  // deno-lint-ignore no-explicit-any
  delete (Object.prototype as any).get;
});
