// Copyright 2018-2026 the Oden authors. MIT license.
// @oden-types="./_events.d.ts"

import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/_events.mjs");

export const {
  addAbortListener,
  captureRejectionSymbol,
  defaultMaxListeners,
  errorMonitor,
  EventEmitter,
  EventEmitterAsyncResource,
  getEventListeners,
  getMaxListeners,
  listenerCount,
  on,
  once,
  setMaxListeners,
} = mod;

export default mod.default;
