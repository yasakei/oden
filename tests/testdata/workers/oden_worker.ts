import { assert } from "@std/assert";

onmessage = function (e) {
  if (typeof self.Oden === "undefined") {
    throw new Error("Oden namespace not available in worker");
  }

  assert(!Object.isFrozen(self.Oden));

  const desc = Object.getOwnPropertyDescriptor(self, "Oden");
  assert(desc);
  assert(desc.configurable);
  assert(!desc.writable);

  postMessage(e.data);
};
