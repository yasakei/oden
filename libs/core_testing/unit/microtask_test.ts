// Copyright 2018-2026 the Oden authors. MIT license.
import { test } from "checkin:testing";

test(async function testQueueMicrotask() {
  await new Promise((r) =>
    queueMicrotask(() => {
      console.log("In microtask!");
      r(null);
    })
  );
});
