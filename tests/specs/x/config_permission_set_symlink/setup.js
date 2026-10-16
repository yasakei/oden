// The real config lives in a sibling `real/` dir and cwd `config.json` is a
// SYMLINK to it. The permission set grants write to `.` (relative to the config
// file's directory).
Oden.mkdirSync("real");
Oden.writeTextFileSync(
  "real/oden.json",
  JSON.stringify({ permissions: { write: { write: ["."] } } }),
);
// Store the target with the platform separator so it resolves on Windows too.
const sep = Oden.build.os === "windows" ? "\\" : "/";
Oden.symlinkSync(`real${sep}oden.json`, "config.json");
