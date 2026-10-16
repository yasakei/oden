// Copyright 2018-2026 the Oden authors. MIT license.

import { assertNotEquals, execCode } from "./test_util.ts";

Oden.test("[unrefOpPromise] unref'ing invalid ops does not have effects", async () => {
  const [statusCode, _] = await execCode(`
    Oden[Oden.internal].core.unrefOpPromise(new Promise(r => null));
    setTimeout(() => { throw new Error() }, 10)
  `);
  // Invalid unrefOpPromise call doesn't affect exit condition of event loop
  assertNotEquals(statusCode, 0);
});
