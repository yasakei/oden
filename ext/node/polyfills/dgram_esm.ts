// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/dgram.ts");

export const { createSocket, Socket } = mod;

export default mod.default;
