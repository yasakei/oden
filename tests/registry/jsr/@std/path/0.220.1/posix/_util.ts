// Copyright 2018-2026 the Oden authors. MIT license.
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
// This module is browser compatible.

import { CHAR_FORWARD_SLASH } from "../_common/constants.ts";

export function isPosixPathSeparator(code: number): boolean {
  return code === CHAR_FORWARD_SLASH;
}
