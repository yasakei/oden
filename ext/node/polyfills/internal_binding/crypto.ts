// Copyright 2018-2026 the Oden authors. MIT license.
// Copyright Joyent, Inc. and Node.js contributors. All rights reserved. MIT license.

(function () {
const { core, primordials } = __bootstrap;
const { timingSafeEqual } = core.loadExtScript(
  "ext:oden_node/internal_binding/_timingSafeEqual.ts",
);

const { Error } = primordials;

function getFipsCrypto(): boolean {
  return false;
}

function setFipsCrypto(_fips: boolean) {
  throw new Error("FIPS mode is not supported in Oden.");
}

return { timingSafeEqual, getFipsCrypto, setFipsCrypto };
})();
