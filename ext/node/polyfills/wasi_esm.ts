// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/wasi.ts");

export const { WASI } = mod;

export default mod.default;
