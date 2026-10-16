// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/stream/consumers.js");

export const {
  arrayBuffer,
  blob,
  buffer,
  bytes,
  text,
  json,
} = mod;

export default mod;
