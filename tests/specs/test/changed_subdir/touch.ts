// Modify a source file in the subdirectory so it shows up as an unstaged
// change (the case `git ls-files` reports relative to the current directory).
Oden.writeTextFileSync(
  "sub/math.ts",
  Oden.readTextFileSync("sub/math.ts") + "\n// changed\n",
);
