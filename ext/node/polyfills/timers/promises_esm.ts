// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/timers/promises.ts");

export const { setTimeout, setImmediate, setInterval, scheduler } = mod;

export default mod;
