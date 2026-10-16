#!/usr/bin/env -S oden run -RW

// Copyright 2018-2026 the Oden authors. MIT license.
// deno-lint-ignore-file no-console

/**
 * This script generates the `import_map.json` file based on `tests/util/std/*` packages.
 *
 * Run this script when you updated the git submodule at `tests/util/std`.
 */

import odenConfig from "../tests/util/std/oden.json" with { type: "json" };
import { join } from "jsr:@std/path@1/posix/join";

const rootImportMap: { imports: Record<string, string> } = { imports: {} };
const coreImportMap: { imports: Record<string, string> } = JSON.parse(
  Oden.readTextFileSync("./tools/core_import_map.json"),
);
for (const workspace of odenConfig.workspace) {
  const { default: pkgOdenConfig } = await import(
    `../tests/util/std/${workspace}/oden.json`,
    {
      with: { type: "json" },
    }
  );

  for (
    const [moduleName, modulePath] of Object.entries(
      pkgOdenConfig.exports as Record<string, string>,
    )
  ) {
    rootImportMap.imports[join(pkgOdenConfig.name, moduleName)] =
      `./tests/util/std/${join(workspace, modulePath)}`;
    coreImportMap.imports[join(pkgOdenConfig.name, moduleName)] =
      `../tests/util/std/${join(workspace, modulePath)}`;
  }
}

rootImportMap.imports = sortObjectByKey(rootImportMap.imports);
coreImportMap.imports = sortObjectByKey(coreImportMap.imports);

console.log("Writing to ./import_map.json");
await Oden.writeTextFile(
  "./import_map.json",
  JSON.stringify(rootImportMap, null, 2) + "\n",
);
console.log("Writing to ./tools/core_import_map.json");
await Oden.writeTextFile(
  "./tools/core_import_map.json",
  JSON.stringify(coreImportMap, null, 2) + "\n",
);

function sortObjectByKey<T>(obj: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
}
