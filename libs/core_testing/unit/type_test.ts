// Copyright 2018-2026 the Oden authors. MIT license.
import * as module from "checkin:testing";
import { assert, test } from "checkin:testing";

test(function testIsAnyArrayBuffer() {
  assert(Oden.core.isAnyArrayBuffer(new ArrayBuffer(4)));
  assert(Oden.core.isAnyArrayBuffer(new SharedArrayBuffer(4)));
  assert(!Oden.core.isAnyArrayBuffer(new Uint8Array(4)));
});

test(function testIsArgumentsObject() {
  let args: IArguments;
  (function () {
  args = arguments;
  })();
  assert(Oden.core.isArgumentsObject(args));
  assert(!Oden.core.isArgumentsObject({}));
});

test(function testIsArrayBuffer() {
  assert(Oden.core.isArrayBuffer(new ArrayBuffer(4)));
  assert(!Oden.core.isArrayBuffer(new SharedArrayBuffer(4)));
  assert(!Oden.core.isArrayBuffer(new Uint8Array(4)));
});

test(function testIsArrayBufferView() {
  assert(Oden.core.isArrayBufferView(new DataView(new ArrayBuffer(4))));
  assert(Oden.core.isArrayBufferView(new Uint8Array(4)));
  assert(!Oden.core.isArrayBufferView(new ArrayBuffer(4)));
});

test(function testIsAsyncFunction() {
  assert(Oden.core.isAsyncFunction(async function () {}));
  assert(Oden.core.isAsyncFunction(async function* () {}));
  assert(!Oden.core.isAsyncFunction(function () {}));
  assert(!Oden.core.isAsyncFunction(function* () {}));
});

test(function testIsBigIntObject() {
  assert(Oden.core.isBigIntObject(Object(1n)));
  assert(!Oden.core.isBigIntObject(1n));
  assert(!Oden.core.isBigIntObject(1));
});

test(function testIsBooleanObject() {
  assert(Oden.core.isBooleanObject(new Boolean(true)));
  assert(!Oden.core.isBooleanObject(true));
  assert(!Oden.core.isBooleanObject("true"));
});

test(function testIsBoxedPrimitive() {
  assert(Oden.core.isBoxedPrimitive(Object(1n)));
  assert(Oden.core.isBoxedPrimitive(new Boolean(true)));
  assert(Oden.core.isBoxedPrimitive(new Number(1)));
  assert(Oden.core.isBoxedPrimitive(Object(Symbol())));
  assert(Oden.core.isBoxedPrimitive(new String("str")));
  assert(!Oden.core.isBoxedPrimitive(1n));
  assert(!Oden.core.isBoxedPrimitive(true));
  assert(!Oden.core.isBoxedPrimitive(1));
  assert(!Oden.core.isBoxedPrimitive(Symbol()));
  assert(!Oden.core.isBoxedPrimitive("str"));
});

test(function testIsDataView() {
  assert(Oden.core.isDataView(new DataView(new ArrayBuffer(4))));
  assert(!Oden.core.isDataView(new Uint8Array(4)));
  assert(!Oden.core.isDataView(new ArrayBuffer(4)));
});

test(function testIsDate() {
  assert(Oden.core.isDate(new Date()));
  assert(!Oden.core.isDate({}));
});

test(function testIsGeneratorFunction() {
  assert(Oden.core.isGeneratorFunction(async function* () {}));
  assert(Oden.core.isGeneratorFunction(function* () {}));
  assert(!Oden.core.isGeneratorFunction(async function () {}));
  assert(!Oden.core.isGeneratorFunction(function () {}));
});

test(function testIsGeneratorObject() {
  const generator = (function* () {})();
  assert(Oden.core.isGeneratorObject(generator));
  assert(!Oden.core.isGeneratorObject({}));
});

test(function testIsMap() {
  assert(Oden.core.isMap(new Map()));
  assert(!Oden.core.isMap(new Set()));
  assert(!Oden.core.isMap(new WeakMap()));
  assert(!Oden.core.isMap(new WeakSet()));
});

test(function testIsMapIterator() {
  const map = new Map();
  assert(Oden.core.isMapIterator(map.values()));
  assert(!Oden.core.isMapIterator(map));
});

test(function testIsModuleNamespaceObject() {
  assert(Oden.core.isModuleNamespaceObject(module));
  assert(!Oden.core.isModuleNamespaceObject({}));
});

test(function testIsNativeError() {
  assert(Oden.core.isNativeError(new Error()));
  assert(Oden.core.isNativeError(new TypeError()));
  assert(!Oden.core.isNativeError({}));
});

test(function testIsNativeError() {
  assert(Oden.core.isNumberObject(new Number(1)));
  assert(!Oden.core.isNumberObject(1));
});

test(function testIsPromise() {
  assert(Oden.core.isPromise(new Promise((resolve) => resolve(1))));
  assert(!Oden.core.isPromise({}));
});

test(function testIsProxy() {
  assert(Oden.core.isProxy(new Proxy({}, {})));
  assert(!Oden.core.isProxy({}));
});

test(function testIsRegExp() {
  assert(Oden.core.isRegExp(/foo/));
  assert(!Oden.core.isRegExp({}));
});

test(function testIsSet() {
  assert(Oden.core.isSet(new Set()));
  assert(!Oden.core.isSet(new Map()));
  assert(!Oden.core.isSet(new WeakSet()));
  assert(!Oden.core.isSet(new WeakMap()));
});

test(function testIsSetIterator() {
  const set = new Set();
  assert(Oden.core.isSetIterator(set.values()));
  assert(!Oden.core.isSetIterator(set));
});

test(function testIsSharedArrayBuffer() {
  assert(Oden.core.isSharedArrayBuffer(new SharedArrayBuffer(4)));
  assert(!Oden.core.isSharedArrayBuffer(new ArrayBuffer(4)));
  assert(!Oden.core.isSharedArrayBuffer(new Uint8Array(4)));
});

test(function testIsStringObject() {
  assert(Oden.core.isStringObject(new String("str")));
  assert(!Oden.core.isStringObject("str"));
});

test(function testIsSymbolObject() {
  assert(Oden.core.isSymbolObject(Object(Symbol())));
  assert(!Oden.core.isSymbolObject(Symbol()));
});

test(function testIsTypedArray() {
  assert(Oden.core.isTypedArray(new Uint8Array(4)));
  assert(!Oden.core.isTypedArray(new DataView(new ArrayBuffer(4))));
  assert(!Oden.core.isTypedArray(new ArrayBuffer(4)));
});

test(function testIsWeakMap() {
  assert(Oden.core.isWeakMap(new WeakMap()));
  assert(!Oden.core.isWeakMap(new WeakSet()));
  assert(!Oden.core.isWeakMap(new Map()));
  assert(!Oden.core.isWeakMap(new Set()));
});

test(function testIsWeakSet() {
  assert(Oden.core.isWeakSet(new WeakSet()));
  assert(!Oden.core.isWeakSet(new WeakMap()));
  assert(!Oden.core.isWeakSet(new Set()));
  assert(!Oden.core.isWeakSet(new Map()));
});
