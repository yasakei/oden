// Copyright 2018-2026 the Oden authors. MIT license.

import {
  assertEquals,
  assertNotEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

Oden.test({ permissions: { ffi: true } }, function dlopenInvalidArguments() {
  const filename = "/usr/lib/libc.so.6";
  assertThrows(() => {
    // @ts-expect-error: ForeignFunction cannot be null
    Oden.dlopen(filename, { malloc: null });
  }, TypeError);
  assertThrows(() => {
    Oden.dlopen(filename, {
      // @ts-expect-error: invalid NativeType
      malloc: { parameters: ["a"], result: "b" },
    });
  }, TypeError);
  assertThrows(() => {
    // @ts-expect-error: DynamicLibrary symbols cannot be null
    Oden.dlopen(filename, null);
  }, TypeError);
  assertThrows(() => {
    // @ts-expect-error: require 2 arguments
    Oden.dlopen(filename);
  }, TypeError);
});

Oden.test({ permissions: { ffi: false } }, function ffiNotCapable() {
  assertThrows(() => {
    Oden.dlopen("/usr/lib/libc.so.6", {});
  }, Oden.errors.NotCapable);
  const fnptr = new Oden.UnsafeFnPointer(
    // @ts-expect-error: Not NonNullable but null check is after permissions check.
    null,
    {
      parameters: ["u32", "pointer"],
      result: "void",
    } as const,
  );
  assertThrows(() => {
    fnptr.call(123, null);
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    Oden.UnsafePointer.of(new Uint8Array(0));
  }, Oden.errors.NotCapable);
  const ptrView = new Oden.UnsafePointerView(
    // @ts-expect-error: Not NonNullable but null check is after permissions check.
    null,
  );
  assertThrows(() => {
    ptrView.copyInto(new Uint8Array(0));
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getCString();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getUint8();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getInt8();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getUint16();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getInt16();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getUint32();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getInt32();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getFloat32();
  }, Oden.errors.NotCapable);
  assertThrows(() => {
    ptrView.getFloat64();
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { ffi: true } }, function pointerOf() {
  const buffer = new ArrayBuffer(1024);
  const baseAddress = Oden.UnsafePointer.value(Oden.UnsafePointer.of(buffer));
  const uint8Address = Oden.UnsafePointer.value(
    Oden.UnsafePointer.of(new Uint8Array(buffer)),
  );
  assertEquals(baseAddress, uint8Address);
  const float64Address = Oden.UnsafePointer.value(
    Oden.UnsafePointer.of(new Float64Array(buffer)),
  );
  assertEquals(baseAddress, float64Address);
  const uint8AddressOffset = Oden.UnsafePointer.value(
    Oden.UnsafePointer.of(new Uint8Array(buffer, 100)),
  );
  assertEquals(baseAddress + 100n, uint8AddressOffset);
  const float64AddressOffset = Oden.UnsafePointer.value(
    Oden.UnsafePointer.of(new Float64Array(buffer, 80)),
  );
  assertEquals(baseAddress + 80n, float64AddressOffset);
});

Oden.test(
  { permissions: { ffi: true } },
  function pointerOfSharedArrayBuffer() {
    const sab = new SharedArrayBuffer(1024);
    const baseAddress = Oden.UnsafePointer.value(Oden.UnsafePointer.of(sab));
    assertNotEquals(baseAddress, 0n);
    const uint8Address = Oden.UnsafePointer.value(
      Oden.UnsafePointer.of(new Uint8Array(sab)),
    );
    assertEquals(baseAddress, uint8Address);
    // An empty buffer resolves to the null pointer, matching the behavior of
    // an empty `ArrayBuffer`.
    assertEquals(Oden.UnsafePointer.of(new SharedArrayBuffer(0)), null);
    assertEquals(Oden.UnsafePointer.of(new ArrayBuffer(0)), null);
  },
);

Oden.test({ permissions: { ffi: true } }, function callWithError() {
  const throwCb = () => {
    throw new Error("Error");
  };
  const cb = new Oden.UnsafeCallback({
    parameters: [],
    result: "void",
  }, throwCb);
  const fnPointer = new Oden.UnsafeFnPointer(cb.pointer, {
    parameters: [],
    result: "void",
  });
  assertThrows(() => fnPointer.call());
  cb.close();
});

Oden.test(
  { permissions: { ffi: true }, ignore: true },
  async function callNonBlockingWithError() {
    const throwCb = () => {
      throw new Error("Error");
    };
    const cb = new Oden.UnsafeCallback({
      parameters: [],
      result: "void",
    }, throwCb);
    const fnPointer = new Oden.UnsafeFnPointer(cb.pointer, {
      parameters: [],
      result: "void",
      nonblocking: true,
    });
    // TODO(mmastrac): currently ignored as we do not thread callback exceptions through nonblocking pointers
    await assertRejects(async () => await fnPointer.call());
    cb.close();
  },
);
