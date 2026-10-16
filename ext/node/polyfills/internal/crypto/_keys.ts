// Copyright 2018-2026 the Oden authors. MIT license.

// This file is here because to break a circular dependency between streams and
// crypto.

(function () {
const { core, primordials } = __bootstrap;
const { Symbol } = primordials;
const { kKeyObject } = core.loadExtScript(
  "ext:oden_node/internal/crypto/constants.ts",
);

const kKeyType = Symbol("kKeyType");

function isKeyObject(obj) {
  return (
    obj != null && obj[kKeyType] !== undefined
  );
}

function isCryptoKey(obj) {
  return (
    obj != null && obj[kKeyObject] !== undefined
  );
}

return { kKeyType, isKeyObject, isCryptoKey };
})();
