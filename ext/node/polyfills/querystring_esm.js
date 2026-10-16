// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/querystring.js");

export const {
  decode,
  encode,
  escape,
  parse,
  stringify,
  unescape,
  unescapeBuffer,
} = mod;

export default mod.default;
