// Copyright 2018-2026 the Oden authors. MIT license.
import { value } from "custom:aliased";
if (value !== "aliased") throw new Error("expected 'aliased', got " + value);
Oden.core.print("lazy_loaded_esm import works\n");
