const [libPrefix, libSuffix] = {
  darwin: ["lib", "dylib"],
  linux: ["lib", "so"],
  windows: ["", "dll"],
}[Oden.build.os];
const libPath = `${import.meta.dirname}/${libPrefix}test_ffi.${libSuffix}`;

const dylib = Oden.dlopen(
  libPath,
  {
    print_something: {
      parameters: [],
      result: "void",
    },
  } as const,
);

dylib.symbols.print_something();
