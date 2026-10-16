// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/async_hooks.ts");

export const {
  AsyncLocalStorage,
  AsyncResource,
  createHook,
  executionAsyncId,
  triggerAsyncId,
  executionAsyncResource,
  asyncWrapProviders,
} = mod;

export default mod.default;
