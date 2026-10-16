// Copyright 2018-2026 the Oden authors. MIT license.
// Fetch the latest canary hash and upgrade to it.
const hash =
  (await (await fetch("https://dl.deno.land/canary-latest.txt")).text()).trim();
const { code } = await new Oden.Command("./oden_copy", {
  args: ["upgrade", "--force", "--canary", "--version", hash],
  stdout: "inherit",
  stderr: "inherit",
}).output();
Oden.exit(code);
