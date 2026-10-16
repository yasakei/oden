#!/usr/bin/env -S oden run --allow-all --config=tests/config/oden.json
// Copyright 2018-2026 the Oden authors. MIT license.
import { join, ROOT_PATH } from "./util.js";

const subcommand = Oden.args.includes("--check") ? "check" : "fmt";
const configFile = join(ROOT_PATH, ".dprint.json");
const cmd = new Oden.Command("oden", {
  args: [
    "run",
    "-A",
    "--no-config",
    "npm:dprint@0.47.2",
    subcommand,
    "--config=" + configFile,
  ],
  cwd: ROOT_PATH,
  stdout: "inherit",
  stderr: "inherit",
});

const { code } = await cmd.output();
Oden.exit(code);
