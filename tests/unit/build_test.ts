// Copyright 2018-2026 the Oden authors. MIT license.
import { assert } from "./test_util.ts";

Oden.test(function buildInfo() {
  // Oden.build is injected by rollup at compile time. Here
  // we check it has been properly transformed.
  const { arch, os } = Oden.build;
  assert(arch.length > 0);
  assert(os === "darwin" || os === "windows" || os === "linux");
});
