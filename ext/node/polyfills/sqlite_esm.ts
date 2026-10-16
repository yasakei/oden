// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/sqlite.ts");

export const {
  backup,
  constants,
  DatabaseSync,
  StatementSync,
} = mod;

export default mod;
