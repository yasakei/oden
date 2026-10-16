#!/usr/bin/env -S oden run --allow-write --allow-read --allow-net --allow-env --config=tests/config/oden.json
// Copyright 2018-2026 the Oden authors. MIT license.
import { getPrebuilt } from "./util.js";

const args = Oden.args.slice();
for (const arg of args) {
  await getPrebuilt(arg);
}
