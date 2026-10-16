#!/usr/bin/env -S oden run --allow-write --allow-run --allow-env --allow-read
// Copyright 2018-2026 the Oden authors. MIT license.
import { join } from "./util.js";

const dir = await Oden.makeTempDir();

const installCommand = new Oden.Command(Oden.execPath(), {
  cwd: dir,
  args: ["install", "--node-modules-dir=auto", "npm:esbuild", "npm:minimatch"],
});
await installCommand.output();

const bundleCommand = new Oden.Command(
  join(dir, "./node_modules/.bin/esbuild"),
  {
    cwd: dir,
    args: [
      "./node_modules/minimatch/dist/commonjs/index.js",
      "--bundle",
      "--format=esm",
    ],
  },
);
const output = await bundleCommand.output();

await Oden.writeFile("./ext/node/polyfills/deps/minimatch.js", output.stdout);
