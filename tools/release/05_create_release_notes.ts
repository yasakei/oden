#!/usr/bin/env -S oden run -A --lock=tools/oden.lock.json
// Copyright 2018-2026 the Oden authors. MIT license.
import { $ } from "./deps.ts";
import { OdenWorkspace } from "./oden_workspace.ts";

const workspace = await OdenWorkspace.load();

// create a release notes file for the GH release draft
$.path(OdenWorkspace.rootDirPath)
  .join("./target/release/release-notes.md")
  .writeTextSync(workspace.getReleasesMdFile().getLatestReleaseText().fullText);
