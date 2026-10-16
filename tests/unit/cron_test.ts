// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertThrows } from "./test_util.ts";

// @ts-ignore This is not publicly typed namespace, but it's there for sure.
const {
  formatToCronSchedule,
  parseScheduleToString,
  // @ts-expect-error TypeScript (as of 3.7) does not support indexing namespaces by symbol
} = Oden[Oden.internal];

const sleep = (time: number) => new Promise((r) => setTimeout(r, time));

Oden.test(function noNameTest() {
  assertThrows(
    // @ts-ignore test
    () => Oden.cron(),
    TypeError,
    "Cannot create cron job, a unique name is required: received 'undefined'",
  );
});

Oden.test(function noSchedule() {
  assertThrows(
    // @ts-ignore test
    () => Oden.cron("foo"),
    TypeError,
    "Cannot create cron job, a schedule is required: received 'undefined'",
  );
});

Oden.test(function noHandler() {
  assertThrows(
    // @ts-ignore test
    () => Oden.cron("foo", "*/1 * * * *"),
    TypeError,
    "Cannot create cron job: a handler is required",
  );
});

Oden.test(function invalidNameTest() {
  assertThrows(
    () => Oden.cron("abc[]", "*/1 * * * *", () => {}),
    TypeError,
    "Invalid cron name",
  );
  assertThrows(
    () => Oden.cron("a**bc", "*/1 * * * *", () => {}),
    TypeError,
    "Invalid cron name",
  );
  assertThrows(
    () => Oden.cron("abc<>", "*/1 * * * *", () => {}),
    TypeError,
    "Invalid cron name",
  );
  assertThrows(
    () => Oden.cron(";']", "*/1 * * * *", () => {}),
    TypeError,
    "Invalid cron name",
  );
  assertThrows(
    () =>
      Oden.cron(
        "0000000000000000000000000000000000000000000000000000000000000000000000",
        "*/1 * * * *",
        () => {},
      ),
    TypeError,
    "Cron name cannot exceed 64 characters: current length 70",
  );
});

Oden.test(function invalidScheduleTest() {
  assertThrows(
    () => Oden.cron("abc", "bogus", () => {}),
    TypeError,
    "Invalid cron schedule",
  );
  assertThrows(
    () => Oden.cron("abc", "* * * * * *", () => {}),
    TypeError,
    "Invalid cron schedule",
  );
  assertThrows(
    () => Oden.cron("abc", "* * * *", () => {}),
    TypeError,
    "Invalid cron schedule",
  );
  assertThrows(
    () => Oden.cron("abc", "m * * * *", () => {}),
    TypeError,
    "Invalid cron schedule",
  );
});

Oden.test(function invalidBackoffScheduleTest() {
  assertThrows(
    () =>
      Oden.cron(
        "abc",
        "*/1 * * * *",
        { backoffSchedule: [1, 1, 1, 1, 1, 1] },
        () => {},
      ),
    TypeError,
    "Invalid backoff schedule",
  );
  assertThrows(
    () =>
      Oden.cron("abc", "*/1 * * * *", { backoffSchedule: [3600001] }, () => {}),
    TypeError,
    "Invalid backoff schedule",
  );
});

Oden.test(async function tooManyCrons() {
  const crons: Promise<void>[] = [];
  const ac = new AbortController();
  for (let i = 0; i <= 100; i++) {
    const c = Oden.cron(
      `abc_${i}`,
      "*/1 * * * *",
      { signal: ac.signal },
      () => {},
    );
    crons.push(c);
  }

  try {
    assertThrows(
      () => {
        Oden.cron("next-cron", "*/1 * * * *", { signal: ac.signal }, () => {});
      },
      TypeError,
      "Too many crons",
    );
  } finally {
    ac.abort();
    for (const c of crons) {
      await c;
    }
  }
});

Oden.test(async function duplicateCrons() {
  const ac = new AbortController();
  const c = Oden.cron("abc", "*/20 * * * *", { signal: ac.signal }, () => {});
  try {
    assertThrows(
      () => Oden.cron("abc", "*/20 * * * *", () => {}),
      TypeError,
      "Cron with this name already exists",
    );
  } finally {
    ac.abort();
    await c;
  }
});

Oden.test(async function basicTest() {
  Oden.env.set("ODEN_CRON_TEST_SCHEDULE_OFFSET", "100");

  let count = 0;
  const { promise, resolve } = Promise.withResolvers<void>();
  const ac = new AbortController();
  const c = Oden.cron("abc", "*/20 * * * *", { signal: ac.signal }, () => {
    count++;
    if (count > 5) {
      resolve();
    }
  });
  try {
    await promise;
  } finally {
    ac.abort();
    await c;
  }
});

Oden.test(async function basicTestWithJsonFormatScheduleExpression() {
  Oden.env.set("ODEN_CRON_TEST_SCHEDULE_OFFSET", "100");

  let count = 0;
  const { promise, resolve } = Promise.withResolvers<void>();
  const ac = new AbortController();
  const c = Oden.cron(
    "abc",
    { minute: { every: 20 } },
    { signal: ac.signal },
    () => {
      count++;
      if (count > 5) {
        resolve();
      }
    },
  );
  try {
    await promise;
  } finally {
    ac.abort();
    await c;
  }
});

Oden.test(async function multipleCrons() {
  Oden.env.set("ODEN_CRON_TEST_SCHEDULE_OFFSET", "100");

  let count0 = 0;
  let count1 = 0;
  const { promise: promise0, resolve: resolve0 } = Promise.withResolvers<
    void
  >();
  const { promise: promise1, resolve: resolve1 } = Promise.withResolvers<
    void
  >();
  const ac = new AbortController();
  const c0 = Oden.cron("abc", "*/20 * * * *", { signal: ac.signal }, () => {
    count0++;
    if (count0 > 5) {
      resolve0();
    }
  });
  const c1 = Oden.cron("xyz", "*/20 * * * *", { signal: ac.signal }, () => {
    count1++;
    if (count1 > 5) {
      resolve1();
    }
  });
  try {
    await promise0;
    await promise1;
  } finally {
    ac.abort();
    await c0;
    await c1;
  }
});

Oden.test(async function overlappingExecutions() {
  Oden.env.set("ODEN_CRON_TEST_SCHEDULE_OFFSET", "100");

  let count = 0;
  const { promise: promise0, resolve: resolve0 } = Promise.withResolvers<
    void
  >();
  const { promise: promise1, resolve: resolve1 } = Promise.withResolvers<
    void
  >();
  const ac = new AbortController();
  const c = Oden.cron(
    "abc",
    "*/20 * * * *",
    { signal: ac.signal },
    async () => {
      resolve0();
      count++;
      await promise1;
    },
  );
  try {
    await promise0;
  } finally {
    await sleep(2000);
    resolve1();
    ac.abort();
    await c;
  }
  assertEquals(count, 1);
});

Oden.test(async function retriesWithBackoffSchedule() {
  Oden.env.set("ODEN_CRON_TEST_SCHEDULE_OFFSET", "5000");

  let count = 0;
  const ac = new AbortController();
  const c = Oden.cron("abc", "*/20 * * * *", {
    signal: ac.signal,
    backoffSchedule: [10, 20],
  }, async () => {
    count += 1;
    await sleep(10);
    throw new TypeError("cron error");
  });
  try {
    await sleep(6000);
  } finally {
    ac.abort();
    await c;
  }

  // The cron should have executed 3 times (1st attempt and 2 retries).
  assertEquals(count, 3);
});

Oden.test(async function retriesWithBackoffScheduleOldApi() {
  Oden.env.set("ODEN_CRON_TEST_SCHEDULE_OFFSET", "5000");

  let count = 0;
  const ac = new AbortController();
  const c = Oden.cron("abc2", "*/20 * * * *", {
    signal: ac.signal,
    backoffSchedule: [10, 20],
  }, async () => {
    count += 1;
    await sleep(10);
    throw new TypeError("cron error");
  });

  try {
    await sleep(6000);
  } finally {
    ac.abort();
    await c;
  }

  // The cron should have executed 3 times (1st attempt and 2 retries).
  assertEquals(count, 3);
});

Oden.test("formatToCronSchedule - undefined value", () => {
  const result = formatToCronSchedule();
  assertEquals(result, "*");
});

Oden.test("formatToCronSchedule - number value", () => {
  const result = formatToCronSchedule(5);
  assertEquals(result, "5");
});

Oden.test("formatToCronSchedule - exact array value", () => {
  const result = formatToCronSchedule({ exact: [1, 2, 3] });
  assertEquals(result, "1,2,3");
});

Oden.test("formatToCronSchedule - exact number value", () => {
  const result = formatToCronSchedule({ exact: 5 });
  assertEquals(result, "5");
});

Oden.test("formatToCronSchedule - start, end, every values", () => {
  const result = formatToCronSchedule({ start: 1, end: 10, every: 2 });
  assertEquals(result, "1-10/2");
});

Oden.test("formatToCronSchedule - start, end values", () => {
  const result = formatToCronSchedule({ start: 1, end: 10 });
  assertEquals(result, "1-10");
});

Oden.test("formatToCronSchedule - start, every values", () => {
  const result = formatToCronSchedule({ start: 1, every: 2 });
  assertEquals(result, "1/2");
});

Oden.test("formatToCronSchedule - start value", () => {
  const result = formatToCronSchedule({ start: 1 });
  assertEquals(result, "1/1");
});

Oden.test("formatToCronSchedule - end, every values", () => {
  assertThrows(
    () => formatToCronSchedule({ end: 10, every: 2 }),
    TypeError,
    "Invalid cron schedule",
  );
});

Oden.test("Parse CronSchedule to string", () => {
  const result = parseScheduleToString({
    minute: { exact: [1, 2, 3] },
    hour: { start: 1, end: 10, every: 2 },
    dayOfMonth: { exact: 5 },
    month: { start: 1, end: 10 },
    dayOfWeek: { start: 1, every: 2 },
  });
  assertEquals(result, "1,2,3 1-10/2 5 1-10 1/2");
});

Oden.test("Parse schedule to string - string", () => {
  const result = parseScheduleToString("* * * * *");
  assertEquals(result, "* * * * *");
});

Oden.test("error on two handlers", () => {
  assertThrows(
    () => {
      // @ts-ignore test
      Oden.cron("abc", "* * * * *", () => {}, () => {});
    },
    TypeError,
    "Cannot create cron job, a single handler is required: two handlers were specified",
  );
});

Oden.test("Parse test", () => {
  assertEquals(
    parseScheduleToString({
      minute: 3,
    }),
    "3 * * * *",
  );
  assertEquals(
    parseScheduleToString({
      hour: { every: 2 },
    }),
    "0 */2 * * *",
  );
  assertEquals(
    parseScheduleToString({
      dayOfMonth: { every: 10 },
    }),
    "0 0 */10 * *",
  );
  assertEquals(
    parseScheduleToString({
      month: { every: 3 },
    }),
    "0 0 1 */3 *",
  );
  assertEquals(
    parseScheduleToString({
      dayOfWeek: { every: 2 },
    }),
    "0 0 * * */2",
  );
  assertEquals(
    parseScheduleToString({
      minute: 3,
      hour: { every: 2 },
    }),
    "3 */2 * * *",
  );
  assertEquals(
    parseScheduleToString({
      dayOfMonth: { start: 1, end: 10 },
    }),
    "0 0 1-10 * *",
  );
  assertEquals(
    parseScheduleToString({
      minute: { every: 10 },
      dayOfMonth: { every: 5 },
    }),
    "*/10 * */5 * *",
  );
  assertEquals(
    parseScheduleToString({
      hour: { every: 3 },
      month: { every: 2 },
    }),
    "0 */3 * */2 *",
  );
  assertEquals(
    parseScheduleToString({
      minute: { every: 5 },
      month: { every: 2 },
    }),
    "*/5 * * */2 *",
  );
});
