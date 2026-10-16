console.log(typeof Oden.dlopen === "function"); // Undefined without `--unstable-ffi`
console.log(
  // Undefined without `--unstable-fs`
  Oden.build.os === "windows" ? true : typeof Oden.umask === "function",
);
