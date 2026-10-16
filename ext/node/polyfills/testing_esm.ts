// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/testing.ts");

export const {
  run,
  test,
  suite,
  it,
  describe,
  before,
  after,
  beforeEach,
  afterEach,
  mock,
  getTestContext,
} = mod;

export default mod.default;
