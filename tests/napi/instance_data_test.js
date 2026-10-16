// Copyright 2018-2026 the Oden authors. MIT license.

// deno-lint-ignore-file no-console

import { assertEquals, loadTestLibrary } from "./common.js";

const properties = loadTestLibrary();

if (import.meta.main) {
  properties.setInstanceData();
  console.log("set instance data");
} else {
  Oden.test("napi instance data Release", async () => {
    const { stdout, stderr, code } = await new Oden.Command(Oden.execPath(), {
      args: [
        "run",
        "--config",
        Oden.realPathSync("../config/oden.json"),
        "--no-lock",
        "-A",
        "--unstable-ffi",
        import.meta.url,
      ],
    }).output();

    assertEquals(new TextDecoder().decode(stderr), "");
    assertEquals(code, 0);

    const stdoutText = new TextDecoder().decode(stdout);
    assertEquals(
      stdoutText,
      "set instance data\ninstance_data_free(42)\n",
    );
  });
}
