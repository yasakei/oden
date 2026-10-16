// Copyright 2018-2026 the Oden authors. MIT license.

import { assertEquals } from "@std/assert";
import { createReadStream } from "node:fs";

Oden.test("fetch node stream", async () => {
  const file = createReadStream("tests/testdata/assets/fixture.json");

  const response = await fetch("http://localhost:4545/echo_server", {
    method: "POST",
    body: file,
  });

  assertEquals(
    await response.text(),
    await Oden.readTextFile("tests/testdata/assets/fixture.json"),
  );
});
