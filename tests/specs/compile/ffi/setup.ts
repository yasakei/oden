const targetDir = Oden.execPath().replace(/[^\/\\]+$/, "");
const [libPrefix, libSuffix] = {
  darwin: ["lib", "dylib"],
  linux: ["lib", "so"],
  windows: ["", "dll"],
}[Oden.build.os];
const libFileName = `${libPrefix}test_ffi.${libSuffix}`;
const libPath = `${targetDir}/${libFileName}`;

Oden.copyFileSync(libPath, import.meta.dirname + "/" + libFileName);
