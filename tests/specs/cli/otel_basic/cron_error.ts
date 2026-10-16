// Copyright 2018-2026 the Oden authors. MIT license.

Oden.env.set("ODEN_CRON_TEST_SCHEDULE_OFFSET", "100");

let count = 0;
const { promise, resolve } = Promise.withResolvers<void>();
const ac = new AbortController();

const c = Oden.cron(
  "test-cron-error",
  "*/20 * * * *",
  { signal: ac.signal },
  () => {
    count++;
    if (count >= 1) {
      resolve();
    }
    throw new Error("test error");
  },
);

await promise;
ac.abort();
await c;
