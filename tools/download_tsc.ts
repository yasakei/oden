#!/usr/bin/env -S oden run --allow-read --allow-write --allow-env --allow-run
// Copyright 2018-2026 the Oden authors. MIT license.
// deno-lint-ignore-file no-console

// Pre-downloads the pinned native TypeScript compiler that `oden check` uses,
// into a cache directory, so CI (and local test runs) don't re-download the
// ~20MB compiler for every test's fresh `ODEN_DIR`.
//
// It warms the cache by type-checking a trivial file with the built `oden`
// binary (which downloads the compiler via its normal path), then locates the
// resulting `tsc` binary and prints its path. When run with the default cache
// directory, the test harness resolves that same path itself and injects
// `ODEN_TSC_BIN` per-test (see `test_util::native_tsc_bin_path`), so this script
// only needs to warm the cache - it does not export the path into the env.
//
//   oden run -A tools/download_tsc.ts [cache_oden_dir]
//
// For local `cargo test` runs, running it once with the default cache directory
// is enough; the harness finds the compiler under `target/.native_tsc/oden_dir`.
// To point tests at a specific binary instead, export it explicitly:
//
//   export ODEN_TSC_BIN=$(oden run -A tools/download_tsc.ts)
//
// The `oden` binary to use is taken from the `ODEN_BIN` env var, else the first
// of `./target/release/oden` or `./target/debug/oden` that exists.

const exe = Oden.build.os === "windows" ? ".exe" : "";

// Absolute paths are required because the download runs the compiler in a
// different working directory, against which relative paths would resolve.
function absolute(p: string): string {
  if (p.startsWith("/") || /^[A-Za-z]:[\\/]/.test(p)) return p;
  return `${Oden.cwd()}/${p}`;
}

function resolveOdenBin(): string {
  const fromEnv = Oden.env.get("ODEN_BIN");
  if (fromEnv) return Oden.realPathSync(fromEnv);
  for (const profile of ["release", "debug"]) {
    const candidate = `./target/${profile}/oden${exe}`;
    try {
      return Oden.realPathSync(candidate);
    } catch {
      // try the next profile
    }
  }
  throw new Error(
    "could not find a built oden binary; set ODEN_BIN or build oden first",
  );
}

function findTscBin(cacheOdenDir: string): string | undefined {
  // Layout: `<oden_dir>/tsc/<version>/<platform>/lib/tsc`.
  const tscRoot = `${cacheOdenDir}/tsc`;
  let versions: Oden.DirEntry[];
  try {
    versions = [...Oden.readDirSync(tscRoot)];
  } catch {
    return undefined;
  }
  for (const version of versions) {
    if (!version.isDirectory) continue;
    for (const platform of Oden.readDirSync(`${tscRoot}/${version.name}`)) {
      if (!platform.isDirectory) continue;
      const bin = `${tscRoot}/${version.name}/${platform.name}/lib/tsc${exe}`;
      try {
        Oden.statSync(bin);
        return bin;
      } catch {
        // keep looking
      }
    }
  }
  return undefined;
}

const cacheOdenDir = absolute(Oden.args[0] ?? "./target/.native_tsc/oden_dir");

let tscBin = findTscBin(cacheOdenDir);
if (!tscBin) {
  const odenBin = resolveOdenBin();
  const warmDir = Oden.makeTempDirSync();
  Oden.writeTextFileSync(`${warmDir}/mod.ts`, "export {};\n");
  // Type-checking a trivial file downloads the compiler into `cacheOdenDir`.
  // The exit code is irrelevant; the compiler is fetched regardless.
  new Oden.Command(odenBin, {
    args: ["check", "mod.ts"],
    cwd: warmDir,
    env: { ODEN_DIR: cacheOdenDir },
    stdout: "null",
    stderr: "null",
  }).outputSync();
  tscBin = findTscBin(cacheOdenDir);
}

if (!tscBin) {
  console.error("failed to download the native TypeScript compiler");
  Oden.exit(1);
}

tscBin = Oden.realPathSync(tscBin);
console.log(tscBin);
