// Copyright 2018-2026 the Oden authors. MIT license.
import { assert } from "./test_util.ts";

Oden.test(function internalsExists() {
  const {
    inspectArgs,
    // @ts-expect-error TypeScript (as of 3.7) does not support indexing namespaces by symbol
  } = Oden[Oden.internal];
  assert(!!inspectArgs);
});

Oden.test(function upgradeHttpRawIsNotExposed() {
  // @ts-expect-error TypeScript does not support indexing namespaces by symbol
  assert(!("upgradeHttpRaw" in Oden[Oden.internal]));
});
