// `oden add` must write through the symlink: the `oden.lock` symlink should be
// preserved and the real target file should receive the update, instead of the
// symlink being clobbered with a fresh regular file.
console.log("oden.lock is symlink:", Oden.lstatSync("oden.lock").isSymlink);
const target = Oden.readTextFileSync("real/oden.lock");
console.log("target updated:", target.includes("@odentest/add"));
