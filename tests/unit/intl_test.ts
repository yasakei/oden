// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals } from "./test_util.ts";

Oden.test("Intl.v8BreakIterator should be undefined", () => {
  // @ts-expect-error Intl.v8BreakIterator is not a standard API
  assertEquals(Intl.v8BreakIterator, undefined);
});
