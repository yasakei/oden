// Copyright 2018-2026 the Oden authors. MIT license.

import { createRequire } from "node:module";
const require = createRequire(Oden.args[0]);
// deno-lint-ignore no-console
console.log(require.resolve(Oden.args[1]));
