// Copyright 2018-2026 the Oden authors. MIT license.

// deno-lint-ignore-file no-deprecated-oden-api

import { assert } from "./test_util.ts";

// Note tests for Oden.stdin.setRaw is in integration tests.

Oden.test(function consoleSize() {
  if (!Oden.stdout.isTerminal()) {
    return;
  }
  const result = Oden.consoleSize();
  assert(typeof result.columns !== "undefined");
  assert(typeof result.rows !== "undefined");
});

Oden.test(function isattyDoesntRaiseOnBadRid() {
  // Absurdly large rid.
  // @ts-ignore `Oden.isatty()` was soft-removed in Oden 2.
  assert(!Oden.isatty(0x7fffffff));
});
