// Copyright 2018-2026 the Oden authors. MIT license.
import { assertNotEquals, assertStrictEquals } from "./test_util.ts";

Oden.test(function getRandomValuesInt8Array() {
  const arr = new Int8Array(32);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new Int8Array(32));
});

Oden.test(function getRandomValuesUint8Array() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new Uint8Array(32));
});

Oden.test(function getRandomValuesUint8ClampedArray() {
  const arr = new Uint8ClampedArray(32);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new Uint8ClampedArray(32));
});

Oden.test(function getRandomValuesInt16Array() {
  const arr = new Int16Array(4);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new Int16Array(4));
});

Oden.test(function getRandomValuesUint16Array() {
  const arr = new Uint16Array(4);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new Uint16Array(4));
});

Oden.test(function getRandomValuesInt32Array() {
  const arr = new Int32Array(8);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new Int32Array(8));
});

Oden.test(function getRandomValuesBigInt64Array() {
  const arr = new BigInt64Array(8);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new BigInt64Array(8));
});

Oden.test(function getRandomValuesUint32Array() {
  const arr = new Uint32Array(8);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new Uint32Array(8));
});

Oden.test(function getRandomValuesBigUint64Array() {
  const arr = new BigUint64Array(8);
  crypto.getRandomValues(arr);
  assertNotEquals(arr, new BigUint64Array(8));
});

Oden.test(function getRandomValuesReturnValue() {
  const arr = new Uint32Array(8);
  const rtn = crypto.getRandomValues(arr);
  assertNotEquals(arr, new Uint32Array(8));
  assertStrictEquals(rtn, arr);
});
