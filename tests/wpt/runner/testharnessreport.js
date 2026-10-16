// Copyright 2018-2026 the Oden authors. MIT license.

window.add_result_callback(({ message, name, stack, status }) => {
  const data = new TextEncoder().encode(
    `${JSON.stringify({ name, status, message, stack })}\n`,
  );
  let bytesWritten = 0;
  while (bytesWritten < data.byteLength) {
    bytesWritten += Oden.stderr.writeSync(data.subarray(bytesWritten));
  }
});

window.add_completion_callback((_tests, harnessStatus) => {
  const data = new TextEncoder().encode(
    `#$#$#${JSON.stringify(harnessStatus)}\n`,
  );
  let bytesWritten = 0;
  while (bytesWritten < data.byteLength) {
    bytesWritten += Oden.stderr.writeSync(data.subarray(bytesWritten));
  }

  // TODO(cjihrig): Restore the prototype of globalThis to be an EventTarget
  // again. There are WPTs that change the prototype, which causes brand
  // checking to fail. Once the globalThis prototype is frozen properly, this
  // line can be removed.
  Object.setPrototypeOf(globalThis, EventTarget.prototype);

  Oden.exit(harnessStatus.status === 0 ? 0 : 1);
});
