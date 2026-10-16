// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/perf_hooks.js");

export const {
  constants,
  createHistogram,
  enqueueNodePerformanceEntry,
  eventLoopUtilization,
  monitorEventLoopDelay,
  performance,
  PerformanceEntry,
  PerformanceObserver,
  PerformanceObserverEntryList,
  timerify,
} = mod;

export default mod.default;
