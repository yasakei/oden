#!/usr/bin/env -S oden run -A
// Copyright 2018-2026 the Oden authors. MIT license.

// deno-lint-ignore-file no-console

import { patchver } from "jsr:@oden/patchver@0.5.1";

const CHANNEL = Oden.args[0];
if (CHANNEL !== "rc" && CHANNEL !== "lts") {
  throw new Error(`Invalid channel: ${CHANNEL}`);
}

const BINARIES = ["oden.exe", "odenrt.exe"];

async function patchBinary(inputPath: string, channel: string) {
  console.log(`Patching ${inputPath}...`);

  await Oden.rename(inputPath, `${inputPath}.bak`);
  const input = await Oden.readFile(`${inputPath}.bak`);
  const output = patchver(input, channel);

  await Oden.writeFile(inputPath, output);
  console.log(`Created ${inputPath}`);
}

async function main() {
  for (const binary of BINARIES) {
    await patchBinary(binary, CHANNEL);
  }
  console.log("All Windows binaries patched successfully!");
}

await main();
