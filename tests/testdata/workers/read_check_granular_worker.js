// oden-fmt-ignore-file
import { toFileUrl } from "@std/path/to-file-url";

function tryGetCwd() {
  // will throw in one test but not the other
  try {
    return Oden.cwd()
  } catch {
    return import.meta.dirname;
  }
}

const fooExePath = tryGetCwd() + "/foo" + (Oden.build.os === "windows" ? ".exe" : "");
postMessage({
  envGlobal: (await Oden.permissions.query({ name: "env" })).state,
  envFoo: (await Oden.permissions.query({ name: "env", variable: "foo" })).state,
  envAbsent: (await Oden.permissions.query({ name: "env", variable: "absent" })).state,
  netGlobal: (await Oden.permissions.query({ name: "net" })).state,
  netFoo: (await Oden.permissions.query({ name: "net", host: "foo" })).state,
  netFoo8000: (await Oden.permissions.query({ name: "net", host: "foo:8000" })).state,
  netBar: (await Oden.permissions.query({ name: "net", host: "bar" })).state,
  netBar8000: (await Oden.permissions.query({ name: "net", host: "bar:8000" })).state,
  ffiGlobal: (await Oden.permissions.query({ name: "ffi" })).state,
  ffiFoo: (await Oden.permissions.query({ name: "ffi", path: new URL("foo", import.meta.url) })).state,
  ffiBar: (await Oden.permissions.query({ name: "ffi", path: "bar" })).state,
  ffiAbsent: (await Oden.permissions.query({ name: "ffi", path: "absent" })).state,
  readGlobal: (await Oden.permissions.query({ name: "read" })).state,
  readFoo: (await Oden.permissions.query({ name: "read", path: new URL("foo", import.meta.url) })).state,
  readBar: (await Oden.permissions.query({ name: "read", path: "bar" })).state,
  readAbsent: (await Oden.permissions.query({ name: "read", path: "../absent" })).state,
  runGlobal: (await Oden.permissions.query({ name: "run" })).state,
  runFoo: (await Oden.permissions.query({ name: "run", command: toFileUrl(fooExePath) })).state,
  runFooPath: (await Oden.permissions.query({ name: "run", command: fooExePath })).state,
  runBar: (await Oden.permissions.query({ name: "run", command: "bar" })).state,
  runBaz: (await Oden.permissions.query({ name: "run", command: "./baz" })).state,
  runUnresolved: (await Oden.permissions.query({ name: "run", command: "unresolved-exec" })).state,
  runAbsent: (await Oden.permissions.query({ name: "run", command: "absent" })).state,
  writeGlobal: (await Oden.permissions.query({ name: "write" })).state,
  writeFoo: (await Oden.permissions.query({ name: "write", path: new URL("foo", import.meta.url) })).state,
  writeBar: (await Oden.permissions.query({ name: "write", path: "bar" })).state,
  writeAbsent: (await Oden.permissions.query({ name: "write", path: "absent" })).state,
  importGlobal: (await Oden.permissions.query({ name: "import" })).state,
  importFoo: (await Oden.permissions.query({ name: "import", host: "foo" })).state,
  importFoo8000: (await Oden.permissions.query({ name: "import", host: "foo:8000" })).state,
  importBar: (await Oden.permissions.query({ name: "import", host: "bar" })).state,
  importBar8000: (await Oden.permissions.query({ name: "import", host: "bar:8000" })).state,
  importAbsent: (await Oden.permissions.query({ name: "import", host: "absent" })).state,
});
