// Copyright 2018-2026 the Oden authors. MIT license.

// deno-lint-ignore-file no-console

// Checks if any files changed relative to the base branch belong to
// oden_core-related package directories (or root Cargo files). Used in CI
// to decide whether to run oden_core tests.
//
// Usage: oden run --allow-run=git check_oden_core_changes.js <base_sha>
// Writes "skip_oden_core_test=true" or "skip_oden_core_test=false" to
// $GITHUB_OUTPUT when running in GitHub Actions.

const ODEN_CORE_PACKAGE_DIRS = [
  "libs/core_testing",
  "libs/core",
  "libs/core/examples/snapshot",
  "libs/dcore",
  "libs/ops",
  "libs/ops/compile_test_runner",
  "libs/serde_v8",
];

const baseSha = Oden.args[0];
if (!baseSha) {
  console.error("Usage: check_oden_core_changes.js <base_sha>");
  Oden.exit(1);
}

// Get list of changed files between the base SHA and HEAD
const { code, stdout, stderr } = await Oden.spawnAndWait("git", [
  "diff",
  "--name-only",
  `${baseSha}..HEAD`,
]);

if (code !== 0) {
  console.error("git diff failed:", stderr);
  console.log("Defaulting to running oden_core tests (skip=false)");
  await writeOutput(false);
  Oden.exit(0);
}

const stdoutText = new TextDecoder().decode(stdout);
const changedFiles = stdoutText.trim().split("\n").filter(Boolean);

const odenCoreChanged = changedFiles.some((file) =>
  ODEN_CORE_PACKAGE_DIRS.some((dir) => file.startsWith(dir + "/")) ||
  file === "Cargo.lock" ||
  file === "Cargo.toml"
);

const skip = !odenCoreChanged;
console.log(`Changed files (${changedFiles.length}):`);
for (const f of changedFiles) {
  console.log(`  ${f}`);
}
console.log(`Oden core changed: ${odenCoreChanged}`);
console.log(`skip_oden_core_test: ${skip}`);

await writeOutput(skip);

async function writeOutput(skip) {
  const outputFile = Oden.env.get("GITHUB_OUTPUT");
  if (outputFile) {
    await Oden.writeTextFile(outputFile, `skip_oden_core_test=${skip}\n`, {
      append: true,
    });
  }
}
