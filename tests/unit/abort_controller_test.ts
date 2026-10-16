// Copyright 2018-2026 the Oden authors. MIT license.

import { assert, assertEquals } from "./test_util.ts";

Oden.test(function basicAbortController() {
  const controller = new AbortController();
  assert(controller);
  const { signal } = controller;
  assert(signal);
  assertEquals(signal.aborted, false);
  controller.abort();
  assertEquals(signal.aborted, true);
});

Oden.test(function signalCallsOnabort() {
  const controller = new AbortController();
  const { signal } = controller;
  let called = false;
  signal.onabort = (evt) => {
    assert(evt);
    assertEquals(evt.type, "abort");
    called = true;
  };
  controller.abort();
  assert(called);
});

Oden.test(function signalEventListener() {
  const controller = new AbortController();
  const { signal } = controller;
  let called = false;
  signal.addEventListener("abort", function (ev) {
    assert(this === signal);
    assertEquals(ev.type, "abort");
    called = true;
  });
  controller.abort();
  assert(called);
});

Oden.test(function onlyAbortsOnce() {
  const controller = new AbortController();
  const { signal } = controller;
  let called = 0;
  signal.addEventListener("abort", () => called++);
  signal.onabort = () => {
    called++;
  };
  controller.abort();
  assertEquals(called, 2);
  controller.abort();
  assertEquals(called, 2);
});

Oden.test(function controllerHasProperToString() {
  const actual = Object.prototype.toString.call(new AbortController());
  assertEquals(actual, "[object AbortController]");
});

Oden.test(function abortReason() {
  const signal = AbortSignal.abort("hey!");
  assertEquals(signal.aborted, true);
  assertEquals(signal.reason, "hey!");
});
