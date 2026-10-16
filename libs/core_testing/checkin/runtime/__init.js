// Copyright 2018-2026 the Oden authors. MIT license.
import * as async from "checkin:async";
import * as console from "checkin:console";
import * as error from "checkin:error";
import * as timers from "checkin:timers";
import * as worker from "checkin:worker";
import * as throw_ from "checkin:throw";
import * as object from "checkin:object";
import * as callsite from "checkin:callsite";
async;
error;
throw_;
object;
callsite;

globalThis.console = console.console;
globalThis.setTimeout = timers.setTimeout;
globalThis.setInterval = timers.setInterval;
globalThis.clearTimeout = timers.clearTimeout;
globalThis.clearInterval = timers.clearInterval;
globalThis.setImmediate = timers.setImmediate;
globalThis.clearImmediate = timers.clearImmediate;
globalThis.Worker = worker.Worker;
Oden.core.addMainModuleHandler((module) => {
  if (onMainModuleCb) onMainModuleCb(module);
});
let onMainModuleCb = () => {};
Reflect.defineProperty(globalThis, "onmainmodule", {
  set: (cb) => {
    onMainModuleCb = cb;
  },
});
Reflect.defineProperty(globalThis, "onerror", {
  set: (cb) => {
    if (cb) {
      Oden.core.setReportExceptionCallback((error) => {
        let defaultPrevented = false;
        cb({
          error,
          preventDefault: () => defaultPrevented = true,
        });
        if (!defaultPrevented) {
          Oden.core.reportUnhandledException(error);
        }
      });
    } else {
      Oden.core.setReportExceptionCallback(null);
    }
  },
});
Reflect.defineProperty(globalThis, "onunhandledrejection", {
  set: (cb) => {
    if (cb) {
      Oden.core.setUnhandledPromiseRejectionHandler((promise, reason) => {
        let defaultPrevented = false;
        cb({
          promise,
          reason,
          preventDefault: () => defaultPrevented = true,
        });
        return defaultPrevented;
      });
    } else {
      Oden.core.setUnhandledPromiseRejectionHandler(null);
    }
  },
});
Reflect.defineProperty(globalThis, "onrejectionhandled", {
  set: (cb) => {
    if (cb) {
      Oden.core.setHandledPromiseRejectionHandler((promise, reason) => {
        cb({
          promise,
          reason,
        });
      });
    } else {
      Oden.core.setHandledPromiseRejectionHandler(null);
    }
  },
});
Oden.unrefTimer = timers.unrefTimer;
Oden.refTimer = timers.refTimer;
Oden.unrefImmediate = timers.unrefImmediate;
