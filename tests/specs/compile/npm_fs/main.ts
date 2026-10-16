import { url } from "npm:@odentest/esm-basic";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

// will be at node_modules\.oden\@odentest+esm-basic@1.0.0\node_modules\@odentest\esm-basic
const dirPath = path.dirname(fileURLToPath(url));
const nodeModulesPath = path.join(dirPath, "../../../../../");
const packageJsonText = `{
  "name": "@odentest/esm-basic",
  "version": "1.0.0",
  "type": "module",
  "main": "main.mjs",
  "types": "main.d.mts"
}
`;
const vfsPackageJsonPath = path.join(dirPath, "package.json");

// reading a file in vfs
{
  const text = Oden.readTextFileSync(vfsPackageJsonPath);
  assert.equal(text, packageJsonText);
}

// reading a file async in vfs
{
  const text = await Oden.readTextFile(vfsPackageJsonPath);
  assert.equal(text, packageJsonText);
}

// copy file from vfs to real fs
{
  Oden.copyFileSync(vfsPackageJsonPath, "package.json");
  assert.equal(Oden.readTextFileSync("package.json"), packageJsonText);
}

// copy to vfs
assert.throws(
  () => Oden.copyFileSync("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
Oden.removeSync("package.json");

// copy file async from vfs to real fs
{
  await Oden.copyFile(vfsPackageJsonPath, "package.json");
  assert.equal(Oden.readTextFileSync("package.json"), packageJsonText);
}

// copy to vfs async
await assert.rejects(
  () => Oden.copyFile("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
Oden.removeSync("package.json");

// open
{
  const file = Oden.openSync(vfsPackageJsonPath);
  const bytes = new Uint8Array(10);
  file.seekSync(2, Oden.SeekMode.Start);
  assert.equal(file.readSync(bytes), 10);
  const text = new TextDecoder().decode(bytes);
  assert.equal(text, packageJsonText.slice(2, 12));
}
{
  const file = await Oden.open(vfsPackageJsonPath);
  const bytes = new Uint8Array(10);
  await file.seek(2, Oden.SeekMode.Start);
  assert.equal(await file.read(bytes), 10);
  const text = new TextDecoder().decode(bytes);
  assert.equal(text, packageJsonText.slice(2, 12));
}

// chdir
// Changing into a directory inside the VFS is a no-op rather than an error,
// so that programs that chdir into their own directory (e.g. Next.js
// standalone builds) keep working when compiled.
Oden.chdir(dirPath);
// chdir into a file in the VFS still fails
assert.throws(
  () => Oden.chdir(vfsPackageJsonPath),
  Oden.errors.NotADirectory,
);
// chdir into a non-existent VFS path still fails
assert.throws(
  () => Oden.chdir(path.join(dirPath, "nonexistent")),
  Oden.errors.NotFound,
);

// mkdir
assert.throws(
  () => Oden.mkdirSync(path.join(dirPath, "subDir")),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.mkdir(path.join(dirPath, "subDir")),
  Oden.errors.NotSupported,
);

// chmod
assert.throws(
  () => Oden.chmodSync(vfsPackageJsonPath, 0o777),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.chmod(vfsPackageJsonPath, 0o777),
  Oden.errors.NotSupported,
);

// chown
assert.throws(
  () => Oden.chownSync(vfsPackageJsonPath, 1000, 1000),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.chown(vfsPackageJsonPath, 1000, 1000),
  Oden.errors.NotSupported,
);

// remove
assert.throws(
  () => Oden.removeSync(vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.remove(vfsPackageJsonPath),
  Oden.errors.NotSupported,
);

// stat
{
  const result = Oden.statSync(vfsPackageJsonPath);
  assert(result.isFile);
}
{
  const result = await Oden.stat(vfsPackageJsonPath);
  assert(result.isFile);
}

// lstat
{
  const result = Oden.lstatSync(
    path.join(nodeModulesPath, "@odentest", "esm-basic"),
  );
  assert(result.isSymlink);
}
{
  const result = await Oden.lstat(
    path.join(nodeModulesPath, "@odentest", "esm-basic"),
  );
  assert(result.isSymlink);
}

// realpath
{
  const result = Oden.realPathSync(
    path.join(nodeModulesPath, "@odentest", "esm-basic", "package.json"),
  );
  assert.equal(result, vfsPackageJsonPath);
}
{
  const result = await Oden.realPath(
    path.join(nodeModulesPath, "@odentest", "esm-basic", "package.json"),
  );
  assert.equal(result, vfsPackageJsonPath);
}

// read dir
const readDirNames = ["main.d.mts", "main.mjs", "other.mjs", "package.json"];
{
  const names = Array.from(Oden.readDirSync(dirPath))
    .map((e) => e.name);
  assert.deepEqual(readDirNames, names);
}
{
  const names = [];
  for await (const entry of Oden.readDir(dirPath)) {
    names.push(entry.name);
  }
  assert.deepEqual(readDirNames, names);
}

// rename
assert.throws(
  () => Oden.renameSync("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
assert.throws(
  () => Oden.renameSync(vfsPackageJsonPath, "package.json"),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.rename("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.rename(vfsPackageJsonPath, "package.json"),
  Oden.errors.NotSupported,
);

// link
assert.throws(
  () => Oden.linkSync("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
assert.throws(
  () => Oden.linkSync(vfsPackageJsonPath, "package.json"),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.link("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.link(vfsPackageJsonPath, "package.json"),
  Oden.errors.NotSupported,
);

// symlink
assert.throws(
  () => Oden.symlinkSync("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
assert.throws(
  () => Oden.symlinkSync(vfsPackageJsonPath, "package.json"),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.symlink("package.json", vfsPackageJsonPath),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.symlink(vfsPackageJsonPath, "package.json"),
  Oden.errors.NotSupported,
);

// read link
{
  const result = Oden.readLinkSync(
    path.join(nodeModulesPath, "@odentest", "esm-basic"),
  );
  assert.equal(result, dirPath);
}
{
  const result = await Oden.readLink(
    path.join(nodeModulesPath, "@odentest", "esm-basic"),
  );
  assert.equal(result, dirPath);
}

// truncate
assert.throws(
  () => Oden.truncateSync(vfsPackageJsonPath, 0),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.truncate(vfsPackageJsonPath, 0),
  Oden.errors.NotSupported,
);

// utime
assert.throws(
  () => Oden.utimeSync(vfsPackageJsonPath, 0, 0),
  Oden.errors.NotSupported,
);
await assert.rejects(
  () => Oden.utime(vfsPackageJsonPath, 0, 0),
  Oden.errors.NotSupported,
);

console.log("success");
