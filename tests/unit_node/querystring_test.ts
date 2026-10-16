// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals } from "@std/assert";
import { parse, stringify } from "node:querystring";

Oden.test({
  name: "stringify",
  fn() {
    assertEquals(
      stringify({
        a: "hello",
        b: 5,
        c: true,
        d: ["foo", "bar"],
      }),
      "a=hello&b=5&c=true&d=foo&d=bar",
    );
  },
});

Oden.test({
  name: "parse",
  fn() {
    assertEquals(parse("a=hello&b=5&c=true&d=foo&d=bar"), {
      a: "hello",
      b: "5",
      c: "true",
      d: ["foo", "bar"],
    });
  },
});

// https://github.com/denoland/deno/issues/21734
Oden.test({
  name: "stringify options no encode",
  fn() {
    assertEquals(
      stringify(
        {
          a: "hello",
          b: 5,
          c: true,
          d: ["foo", "bar"],
        },
        "&",
        "=",
        {},
      ),
      "a=hello&b=5&c=true&d=foo&d=bar",
    );
  },
});
