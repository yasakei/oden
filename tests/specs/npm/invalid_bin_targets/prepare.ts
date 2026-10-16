// Copyright 2018-2026 the Oden authors. MIT license.

const linker = Oden.args[0];
const outsidePath = linker === "isolated"
  ? "node_modules/.oden/@odentest+invalid-bin-target@1.0.0/node_modules/@odentest/outside.js"
  : "node_modules/@odentest/outside.js";

await Oden.mkdir(outsidePath.slice(0, outsidePath.lastIndexOf("/")), {
  recursive: true,
});
await Oden.writeTextFile(outsidePath, "outside marker\n");
if (Oden.build.os !== "windows") {
  await Oden.chmod(outsidePath, 0o644);
}
