// Copyright 2018-2026 the Oden authors. MIT license.

import { fstat, fstatSync } from "node:fs";
import { fail } from "@std/assert";
import { assertStats, assertStatsBigInt } from "../_test_utils.ts";
import type { BigIntStats, Stats } from "node:fs";

Oden.test({
  name: "ASYNC: get a file Stats",
  // TODO(bartlomieju): this test is broken in Oden 2, because `file.rid` is undefined.
  // The fs APIs should be rewritten to use actual FDs, not RIDs
  ignore: true,
  async fn() {
    const filePath = await Oden.makeTempFile();
    using file = await Oden.open(filePath);

    await new Promise<Stats>((resolve, reject) => {
      // @ts-ignore (iuioiua) `file.rid` should no longer be needed once FDs are used
      fstat(file.rid, (err: Error | null, stat: Stats) => {
        if (err) reject(err);
        resolve(stat);
      });
    })
      .then(
        (stat) => {
          assertStats(stat, file.statSync());
        },
        () => fail(),
      )
      .finally(() => {
        Oden.removeSync(filePath);
      });
  },
});

Oden.test({
  name: "ASYNC: get a file BigInt Stats",
  // TODO(bartlomieju): this test is broken in Oden 2, because `file.rid` is undefined.
  // The fs APIs should be rewritten to use actual FDs, not RIDs
  ignore: true,
  async fn() {
    const filePath = await Oden.makeTempFile();
    using file = await Oden.open(filePath);

    await new Promise<BigIntStats>((resolve, reject) => {
      fstat(
        // @ts-ignore (iuioiua) `file.rid` should no longer be needed once FDs are used
        file.rid,
        { bigint: true },
        (err: Error | null, stat: BigIntStats) => {
          if (err) reject(err);
          resolve(stat);
        },
      );
    })
      .then(
        (stat) => assertStatsBigInt(stat, file.statSync()),
        () => fail(),
      )
      .finally(() => {
        Oden.removeSync(filePath);
      });
  },
});

Oden.test({
  name: "SYNC: get a file Stats",
  // TODO(bartlomieju): this test is broken in Oden 2, because `file.rid` is undefined.
  // The fs APIs should be rewritten to use actual FDs, not RIDs
  ignore: true,
  fn() {
    const filePath = Oden.makeTempFileSync();
    using file = Oden.openSync(filePath);

    try {
      // @ts-ignore (iuioiua) `file.rid` should no longer be needed once FDs are used
      assertStats(fstatSync(file.rid), file.statSync());
    } finally {
      Oden.removeSync(filePath);
    }
  },
});

Oden.test({
  name: "SYNC: get a file BigInt Stats",
  // TODO(bartlomieju): this test is broken in Oden 2, because `file.rid` is undefined.
  // The fs APIs should be rewritten to use actual FDs, not RIDs
  ignore: true,
  fn() {
    const filePath = Oden.makeTempFileSync();
    using file = Oden.openSync(filePath);

    try {
      // HEAD
      // @ts-ignore (iuioiua) `file.rid` should no longer be needed once FDs are used
      assertStatsBigInt(fstatSync(file.rid, { bigint: true }), file.statSync());
      //
      assertStatsBigInt(
        // @ts-ignore (iuioiua) `file.rid` should no longer be needed once FDs are used
        fstatSync(file.rid, { bigint: true }),
        file.statSync(),
      );
      //main
    } finally {
      Oden.removeSync(filePath);
    }
  },
});
