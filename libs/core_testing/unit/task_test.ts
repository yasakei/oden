// Copyright 2018-2026 the Oden authors. MIT license.
import { test } from "checkin:testing";

const { op_task_submit } = Oden.core.ops;

test(async function testTaskSubmit1() {
  const { promise, resolve } = Promise.withResolvers();
  op_task_submit(() => {
    resolve(undefined);
  });
  await promise;
});

test(async function testTaskSubmit2() {
  for (let i = 0; i < 2; i++) {
    const { promise, resolve } = Promise.withResolvers();
    op_task_submit(() => {
      resolve(undefined);
    });
    await promise;
  }
});

test(async function testTaskSubmit3() {
  for (let i = 0; i < 3; i++) {
    const { promise, resolve } = Promise.withResolvers();
    op_task_submit(() => {
      resolve(undefined);
    });
    await promise;
  }
});

test(async function testTaskSubmit100() {
  for (let i = 0; i < 100; i++) {
    const { promise, resolve } = Promise.withResolvers();
    op_task_submit(() => {
      resolve(undefined);
    });
    await promise;
  }
});
