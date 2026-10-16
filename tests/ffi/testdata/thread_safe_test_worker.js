// Copyright 2018-2026 the Oden authors. MIT license.
// deno-lint-ignore-file

const targetDir = Oden.execPath().replace(/[^\/\\]+$/, "");
const [libPrefix, libSuffix] = {
  darwin: ["lib", "dylib"],
  linux: ["lib", "so"],
  windows: ["", "dll"],
}[Oden.build.os];
const libPath = `${targetDir}/${libPrefix}test_ffi.${libSuffix}`;

const dylib = Oden.dlopen(libPath, {
  store_function: {
    parameters: ["function"],
    result: "void",
  },
  call_stored_function: {
    parameters: [],
    result: "void",
  },
});

const callback = new Oden.UnsafeCallback(
  { parameters: [], result: "void" },
  () => {
    console.log("Callback on worker thread");
  },
);

callback.ref();

self.addEventListener("message", ({ data }) => {
  if (data === "register") {
    dylib.symbols.store_function(callback.pointer);
  } else if (data === "call") {
    dylib.symbols.call_stored_function();
  } else if (data === "unref") {
    callback.close();
  }
  self.postMessage("done");
});
