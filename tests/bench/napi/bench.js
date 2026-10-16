// Copyright 2018-2026 the Oden authors. MIT license.

import { loadTestLibrary } from "../../../tests/napi/common.js";

const lib = loadTestLibrary();

Oden.bench("warmup", () => {});
Oden.bench("napi_get_undefined", () => lib.test_get_undefined(0));
