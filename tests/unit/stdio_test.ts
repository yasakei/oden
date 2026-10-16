// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals } from "./test_util.ts";

Oden.test(async function stdioStdinRead() {
  const nread = await Oden.stdin.read(new Uint8Array(0));
  assertEquals(nread, 0);
});

Oden.test(function stdioStdinReadSync() {
  const nread = Oden.stdin.readSync(new Uint8Array(0));
  assertEquals(nread, 0);
});

Oden.test(async function stdioStdoutWrite() {
  const nwritten = await Oden.stdout.write(new Uint8Array(0));
  assertEquals(nwritten, 0);
});

Oden.test(function stdioStdoutWriteSync() {
  const nwritten = Oden.stdout.writeSync(new Uint8Array(0));
  assertEquals(nwritten, 0);
});

Oden.test(async function stdioStderrWrite() {
  const nwritten = await Oden.stderr.write(new Uint8Array(0));
  assertEquals(nwritten, 0);
});

Oden.test(function stdioStderrWriteSync() {
  const nwritten = Oden.stderr.writeSync(new Uint8Array(0));
  assertEquals(nwritten, 0);
});
