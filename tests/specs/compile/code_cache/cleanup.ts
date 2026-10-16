import { tmpdir } from "node:os";

// cleanup the code cache file from a previous run
try {
  if (Oden.build.os === "windows") {
    Oden.removeSync(tmpdir() + "\\oden-compile-using_code_cache.exe.cache");
  } else {
    Oden.removeSync(tmpdir() + "/oden-compile-using_code_cache.cache");
  }
} catch {
}
