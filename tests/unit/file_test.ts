// Copyright 2018-2026 the Oden authors. MIT license.
import { assert, assertEquals } from "./test_util.ts";

// deno-lint-ignore no-explicit-any
function testFirstArgument(arg1: any[], expectedSize: number) {
  const file = new File(arg1, "name");
  assert(file instanceof File);
  assertEquals(file.name, "name");
  assertEquals(file.size, expectedSize);
  assertEquals(file.type, "");
}

Oden.test(function fileEmptyFileBits() {
  testFirstArgument([], 0);
});

Oden.test(function fileStringFileBits() {
  testFirstArgument(["bits"], 4);
});

Oden.test(function fileUnicodeStringFileBits() {
  testFirstArgument(["𝓽𝓮𝔁𝓽"], 16);
});

Oden.test(function fileStringObjectFileBits() {
  testFirstArgument([new String("string object")], 13);
});

Oden.test(function fileEmptyBlobFileBits() {
  testFirstArgument([new Blob()], 0);
});

Oden.test(function fileBlobFileBits() {
  testFirstArgument([new Blob(["bits"])], 4);
});

Oden.test(function fileEmptyFileFileBits() {
  testFirstArgument([new File([], "world.txt")], 0);
});

Oden.test(function fileFileFileBits() {
  testFirstArgument([new File(["bits"], "world.txt")], 4);
});

Oden.test(function fileArrayBufferFileBits() {
  testFirstArgument([new ArrayBuffer(8)], 8);
});

Oden.test(function fileTypedArrayFileBits() {
  testFirstArgument([new Uint8Array([0x50, 0x41, 0x53, 0x53])], 4);
});

Oden.test(function fileVariousFileBits() {
  testFirstArgument(
    [
      "bits",
      new Blob(["bits"]),
      new Blob(),
      new Uint8Array([0x50, 0x41]),
      new Uint16Array([0x5353]),
      new Uint32Array([0x53534150]),
    ],
    16,
  );
});

Oden.test(function fileNumberInFileBits() {
  testFirstArgument([12], 2);
});

Oden.test(function fileArrayInFileBits() {
  testFirstArgument([[1, 2, 3]], 5);
});

Oden.test(function fileObjectInFileBits() {
  // "[object Object]"
  testFirstArgument([{}], 15);
});

// deno-lint-ignore no-explicit-any
function testSecondArgument(arg2: any, expectedFileName: string) {
  const file = new File(["bits"], arg2);
  assert(file instanceof File);
  assertEquals(file.name, expectedFileName);
}

Oden.test(function fileUsingFileName() {
  testSecondArgument("dummy", "dummy");
});

Oden.test(function fileUsingNullFileName() {
  testSecondArgument(null, "null");
});

Oden.test(function fileUsingNumberFileName() {
  testSecondArgument(1, "1");
});

Oden.test(function fileUsingEmptyStringFileName() {
  testSecondArgument("", "");
});

Oden.test(function inspectFile() {
  assertEquals(
    Oden.inspect(new File([], "file-name.txt")),
    `File { name: "file-name.txt", size: 0, type: "" }`,
  );
  assertEquals(
    Oden.inspect(new File([], "file-name.txt", { type: "text/plain" })),
    `File { name: "file-name.txt", size: 0, type: "text/plain" }`,
  );
});
