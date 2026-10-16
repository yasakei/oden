// Copyright 2018-2026 the Oden authors. MIT license.
export const kv = await Oden.openKv(":memory:");
kv.listenQueue(async () => {});
