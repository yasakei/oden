// Copyright 2018-2026 the Oden authors. MIT license.

import { assertEquals, assertThrows, loadTestLibrary } from "./common.js";

const lib = loadTestLibrary();

Oden.test("napi is_exception_pending and get_and_clear", function () {
  const result = lib.test_exception_pending();
  assertEquals(result, true);
});

Oden.test("napi get_and_clear_last_exception returns thrown value", function () {
  const result = lib.test_get_clear_exception();
  assertEquals(result, "my error message");
});

Oden.test("napi exception propagation through call_function", function () {
  const result = lib.test_exception_from_call(() => {
    throw new Error("thrown from js");
  });
  assertEquals(result, "thrown from js");
});

Oden.test("napi return value is ignored while an exception is pending", function () {
  assertThrows(
    () => lib.test_throw_return_invalid(),
    Error,
    "thrown before return",
  );
});
