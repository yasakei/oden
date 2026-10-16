// Copyright 2018-2026 the Oden authors. MIT license.
import { lstat, lstatSync } from "node:fs";
import { fail } from "@std/assert";
import {
  assertCallbackErrorUncaught,
  assertStats,
  assertStatsBigInt,
} from "../_test_utils.ts";
import type { BigIntStats, Stats } from "node:fs";

Oden.test({
  name: "ASYNC: get a file Stats (lstat)",
  async fn() {
    const file = Oden.makeTempFileSync();
    await new Promise<Stats>((resolve, reject) => {
      lstat(file, (err, stat) => {
        if (err) reject(err);
        resolve(stat);
      });
    })
      .then((stat) => {
        assertStats(stat, Oden.lstatSync(file));
      }, () => fail())
      .finally(() => {
        Oden.removeSync(file);
      });
  },
});

Oden.test({
  name: "SYNC: get a file Stats (lstat)",
  fn() {
    const file = Oden.makeTempFileSync();
    assertStats(lstatSync(file), Oden.lstatSync(file));
  },
});

Oden.test({
  name: "ASYNC: get a file BigInt Stats (lstat)",
  async fn() {
    const file = Oden.makeTempFileSync();
    await new Promise<BigIntStats>((resolve, reject) => {
      lstat(file, { bigint: true }, (err, stat) => {
        if (err) reject(err);
        resolve(stat);
      });
    })
      .then(
        (stat) => assertStatsBigInt(stat, Oden.lstatSync(file)),
        () => fail(),
      )
      .finally(() => Oden.removeSync(file));
  },
});

Oden.test({
  name: "SYNC: BigInt Stats (lstat)",
  fn() {
    const file = Oden.makeTempFileSync();
    assertStatsBigInt(lstatSync(file, { bigint: true }), Oden.lstatSync(file));
  },
});

Oden.test("[std/node/fs] lstat callback isn't called twice if error is thrown", async () => {
  const tempFile = await Oden.makeTempFile();
  const importUrl = new URL("node:fs", import.meta.url);
  await assertCallbackErrorUncaught({
    prelude: `import { lstat } from ${JSON.stringify(importUrl)}`,
    invocation: `lstat(${JSON.stringify(tempFile)}, `,
    async cleanup() {
      await Oden.remove(tempFile);
    },
  });
});
