// Copyright 2018-2026 the Oden authors. MIT license.

/**
 * Call a callback function after a delay.
 */
export function setTimeout(callback: () => void, delay = 0) {
  return Oden.core.createTimer(callback, delay, undefined, false, true);
}

/**
 * Call a callback function after a delay.
 */
export function setInterval(callback: () => void, delay = 0) {
  return Oden.core.createTimer(callback, delay, undefined, true, true);
}

/**
 * Clear a timeout or interval.
 */
// deno-lint-ignore no-explicit-any
export function clearTimeout(timer: any) {
  Oden.core.cancelTimer(timer);
}

/**
 * Clear a timeout or interval.
 */
// deno-lint-ignore no-explicit-any
export function clearInterval(timer: any) {
  Oden.core.cancelTimer(timer);
}

/**
 * Schedule a callback to run in the check phase (after I/O).
 */
export function setImmediate(callback: () => void) {
  const immediate = {
    _idleNext: null,
    _idlePrev: null,
    _onImmediate: callback,
    _argv: null,
    _destroyed: false,
    [Oden.core.kRefed]: false,
    asyncId: 0,
    triggerAsyncId: 0,
  };
  immediate[Oden.core.kRefed] = true;
  Oden.core.immediateRefCount(true);
  Oden.core.queueImmediate(immediate);
  return immediate;
}

/**
 * Cancel a scheduled immediate.
 */
// deno-lint-ignore no-explicit-any
export function clearImmediate(immediate: any) {
  Oden.core.clearImmediate(immediate);
}

/**
 * Mark an immediate as not blocking event loop exit.
 */
// deno-lint-ignore no-explicit-any
export function unrefImmediate(immediate: any) {
  if (immediate && immediate[Oden.core.kRefed]) {
    immediate[Oden.core.kRefed] = false;
    Oden.core.immediateRefCount(false);
  }
}

/**
 * Mark a timer as not blocking event loop exit.
 */
// deno-lint-ignore no-explicit-any
export function unrefTimer(timer: any) {
  Oden.core.unrefTimer(timer);
}

/**
 * Mark a timer as blocking event loop exit.
 */
// deno-lint-ignore no-explicit-any
export function refTimer(timer: any) {
  Oden.core.refTimer(timer);
}
