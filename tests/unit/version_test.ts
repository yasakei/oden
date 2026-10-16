// Copyright 2018-2026 the Oden authors. MIT license.

import { assert, assertEquals } from "./test_util.ts";

Oden.test(function version() {
  const pattern = /^\d+\.\d+\.\d+/;
  assert(pattern.test(Oden.version.oden));
  assert(pattern.test(Oden.version.v8));
  assertEquals(Oden.version.typescript, "6.0.3");
});
