// Copyright 2018-2026 the Oden authors. MIT license.
import { assert } from "./test_util.ts";

// Test that `Symbol.metadata` is defined. This file can be removed when V8
// supports `Symbol.metadata` natively.

Oden.test(
  function symbolMetadataIsDefined() {
    assert(typeof Symbol.metadata === "symbol");
  },
);
