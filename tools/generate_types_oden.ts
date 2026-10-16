#!/usr/bin/env -S oden run -A
// Copyright 2018-2026 the Oden authors. MIT license.

// This script is used to generate the @types/oden package on DefinitelyTyped.

import $ from "jsr:@david/dax@0.42.0";
import { type NamedNode, Node, Project } from "jsr:@ts-morph/ts-morph@27.0.0";
import * as semver from "jsr:@std/semver@1.0.3";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const definitelyTypedDir = rootDir.join(
  "../DefinitelyTyped/types/oden/",
);

if (!definitelyTypedDir.existsSync()) {
  throw new Error(`Makes sure ${definitelyTypedDir} exists.`);
}

const odenExec = rootDir.join(
  "target/debug/oden" + (Oden.build.os === "windows" ? ".exe" : ""),
);

$.logStep("Building Oden executable...");
await $`cargo build`;

$.logStep("Creating declaration file...");
await createOdenDtsFile();
$.logStep("Updating package.json...");
await updatePkgJson();
$.logStep("Formatting...");
await $`pnpm dprint fmt`.cwd(definitelyTypedDir);

async function createOdenDtsFile() {
  function matchesAny(text: string | undefined, patterns: string[]): boolean {
    if (text == null) {
      return false;
    }
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        return true;
      }
    }
    return false;
  }

  const text = await $`${odenExec} types`.text();
  const project = new Project();
  const file = project.createSourceFile(
    definitelyTypedDir.join("index.d.ts").toString(),
    text,
    {
      overwrite: true,
    },
  );

  for (const statement of file.getStatementsWithComments()) {
    if (Node.isCommentNode(statement)) {
      statement.remove();
      continue;
    }
    const shouldKeepNode = (namedNode: NamedNode) => {
      return matchesAny(namedNode.getName(), [
        "Oden",
      ]) || namedNode.getName()?.startsWith("GPU");
    };
    if (Node.isVariableStatement(statement)) {
      for (const decl of statement.getDeclarations()) {
        if (!shouldKeepNode(decl)) {
          decl.remove();
        }
      }
    } else if (!shouldKeepNode(statement)) {
      statement.remove();
    }
  }

  file.insertStatements(
    0,
    "// Copyright 2018-2026 the Oden authors. MIT license.\n\n",
  );

  file.saveSync();
}

async function updatePkgJson() {
  const pkgJsonFile = definitelyTypedDir.join("package.json");
  const obj = pkgJsonFile.readJsonSync();
  const version = semver.parse(await getOdenVersion());
  version.patch = 9999;
  version.prerelease = undefined;
  version.build = undefined;
  // deno-lint-ignore no-explicit-any
  (obj as any).version = semver.format(version);
  pkgJsonFile.writeTextSync(JSON.stringify(obj, undefined, 4) + "\n"); // 4 spaces indent
}

async function getOdenVersion() {
  const text = await $`${odenExec} -v`.text();
  return text.match(/oden (.*)/)![1];
}
