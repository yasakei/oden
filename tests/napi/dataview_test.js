// Copyright 2018-2026 the Oden authors. MIT license.

import { assertEquals, loadTestLibrary } from "./common.js";

const lib = loadTestLibrary();

Oden.test("napi create_dataview and get_dataview_info", function () {
  const byteLength = lib.test_dataview();
  assertEquals(byteLength, 8);
});

Oden.test("napi is_dataview", function () {
  const result = lib.test_is_dataview();
  assertEquals(result, true);
});

Oden.test("napi create_dataview out of range returns napi_pending_exception", function () {
  // [status, exception pending, result set]; 10 is napi_pending_exception
  assertEquals(lib.test_dataview_out_of_range(), [10, true, false]);
});

Oden.test("napi create_dataview with overflowing offset + length throws", function () {
  // [status, exception pending, result set]; 10 is napi_pending_exception
  assertEquals(lib.test_dataview_overflow(), [10, true, false]);
});
