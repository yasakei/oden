#!/usr/bin/env -S oden run -A --lock=tools/oden.lock.json
// Copyright 2018-2026 the Oden authors. MIT license.
import { OdenWorkspace } from "./oden_workspace.ts";
import { $, createOctoKit, getGitHubRepository } from "./deps.ts";

const octoKit = createOctoKit();
const workspace = await OdenWorkspace.load();
const repo = workspace.repo;
const cliCrate = workspace.getCliCrate();

const originalBranch = await repo.gitCurrentBranch();
const newBranchName = `release_${cliCrate.version.replace(/\./, "_")}`;

// Create and push branch
$.logStep(`Creating branch ${newBranchName}...`);
await repo.gitBranch(newBranchName);
await repo.gitAdd();
await repo.gitCommit(cliCrate.version);
$.logStep("Pushing branch...");
await repo.gitPush("-u", "origin", "HEAD");

// Open PR
$.logStep("Opening PR...");
const openedPr = await octoKit.request("POST /repos/{owner}/{repo}/pulls", {
  ...getGitHubRepository(),
  base: originalBranch,
  head: newBranchName,
  draft: true,
  title: cliCrate.version,
  body: getPrBody(),
});
$.log(`Opened PR at ${openedPr.data.url}`);

function getPrBody() {
  let text = `Bumped versions for ${cliCrate.version}\n\n` +
    `Please ensure:\n` +
    `- [ ] Crate versions are bumped correctly\n` +
    `- [ ] Releases.md is updated correctly (think relevancy and remove reverts)\n\n` +
    `To make edits to this PR:\n` +
    "```shell\n" +
    `git fetch upstream ${newBranchName} && git checkout -b ${newBranchName} upstream/${newBranchName}\n` +
    "```\n";

  const actor = Oden.env.get("GH_WORKFLOW_ACTOR");
  if (actor != null) {
    text += `\ncc @${actor}`;
  }

  return text;
}
