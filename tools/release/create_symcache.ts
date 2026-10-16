// Copyright 2018-2026 the Oden authors. MIT license.

// deno-lint-ignore-file no-console

import { createSymcache } from "jsr:@oden/panic@0.1.0";
import path from "node:path";

// Generate symcache for the current Oden executable.

let debugFile = Oden.execPath();

if (Oden.build.os === "windows") {
  debugFile = debugFile.replace(/\.exe$/, ".pdb");
} else if (Oden.build.os === "darwin") {
  const resolvedPath = Oden.realPathSync(`${debugFile}.dSYM`);
  const { name } = path.parse(resolvedPath);

  debugFile = path.join(resolvedPath, "Contents/Resources/DWARF", name);
}

const outfile = Oden.args[0];
if (!outfile) {
  console.error("Usage: ./target/release/oden -A create_symcache.ts <outfile>");
  Oden.exit(1);
}

const symcache = createSymcache(Oden.readFileSync(debugFile));
Oden.writeFileSync(outfile, symcache);
