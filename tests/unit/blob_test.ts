// Copyright 2018-2026 the Oden authors. MIT license.
import { assert, assertEquals, assertStringIncludes } from "./test_util.ts";
import { concat } from "@std/bytes/concat";

Oden.test(function blobString() {
  const b1 = new Blob(["Hello World"]);
  const str = "Test";
  const b2 = new Blob([b1, str]);
  assertEquals(b2.size, b1.size + str.length);
});

Oden.test(function blobBuffer() {
  const buffer = new ArrayBuffer(12);
  const u8 = new Uint8Array(buffer);
  const f1 = new Float32Array(buffer);
  const b1 = new Blob([buffer, u8]);
  assertEquals(b1.size, 2 * u8.length);
  const b2 = new Blob([b1, f1]);
  assertEquals(b2.size, 3 * u8.length);
});

Oden.test(function blobSlice() {
  const blob = new Blob(["Oden", "Foo"]);
  const b1 = blob.slice(0, 3, "Text/HTML");
  assert(b1 instanceof Blob);
  assertEquals(b1.size, 3);
  assertEquals(b1.type, "text/html");
  const b2 = blob.slice(-1, 3);
  assertEquals(b2.size, 0);
  const b3 = blob.slice(100, 3);
  assertEquals(b3.size, 0);
  const b4 = blob.slice(0, 10);
  assertEquals(b4.size, blob.size);
});

Oden.test(function blobInvalidType() {
  const blob = new Blob(["foo"], {
    type: "\u0521",
  });

  assertEquals(blob.type, "");
});

Oden.test(function blobShouldNotThrowError() {
  let hasThrown = false;

  try {
    // deno-lint-ignore no-explicit-any
    const options1: any = {
      ending: "utf8",
      hasOwnProperty: "hasOwnProperty",
    };
    const options2 = Object.create(null);
    new Blob(["Hello World"], options1);
    new Blob(["Hello World"], options2);
  } catch {
    hasThrown = true;
  }

  assertEquals(hasThrown, false);
});

/* TODO https://github.com/denoland/deno/issues/7540
Oden.test(function nativeEndLine() {
  const options = {
    ending: "native",
  } as const;
  const blob = new Blob(["Hello\nWorld"], options);

  assertEquals(blob.size, Oden.build.os === "windows" ? 12 : 11);
});
*/

Oden.test(async function blobText() {
  const blob = new Blob(["Hello World"]);
  assertEquals(await blob.text(), "Hello World");
});

Oden.test(async function blobStream() {
  const blob = new Blob(["Hello World"]);
  const stream = blob.stream();
  assert(stream instanceof ReadableStream);
  const reader = stream.getReader();
  let bytes = new Uint8Array();
  const read = async (): Promise<void> => {
    const { done, value } = await reader.read();
    if (!done && value) {
      bytes = concat([bytes, value]);
      return read();
    }
  };
  await read();
  const decoder = new TextDecoder();
  assertEquals(decoder.decode(bytes), "Hello World");
});

Oden.test(async function blobTextStream() {
  const text = "Hello 👋 wörld";
  const blob = new Blob([text]);
  const stream = blob.textStream();
  assert(stream instanceof ReadableStream);
  const reader = stream.getReader();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += value;
  }
  assertEquals(result, text);
});

Oden.test(async function blobArrayBuffer() {
  const uint = new Uint8Array([102, 111, 111]);
  const blob = new Blob([uint]);
  assertEquals(await blob.arrayBuffer(), uint.buffer);
});

Oden.test(function blobConstructorNameIsBlob() {
  const blob = new Blob();
  assertEquals(blob.constructor.name, "Blob");
});

Oden.test(function blobCustomInspectFunction() {
  const blob = new Blob();
  assertEquals(
    Oden.inspect(blob),
    `Blob { size: 0, type: "" }`,
  );
  assertStringIncludes(Oden.inspect(Blob.prototype), "Blob");
});
