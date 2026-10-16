// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/punycode.ts");

export const { decode, encode, toASCII, toUnicode, ucs2, version } = mod;

export default mod.default;
