// Copyright 2018-2026 the Oden authors. MIT license.

// v8 builtin that's close to the upper bound non-NOPs
Oden.bench("date_now", { n: 5e5 }, () => {
  Date.now();
});

function addJS(a, b) {
  return a + b;
}
Oden.bench("add_js", () => addJS(1, 2));

// A very lightweight op, that should be highly optimizable
Oden.bench("perf_now", { n: 5e5 }, () => {
  performance.now();
});

Oden.bench("open_file_sync", () => {
  using _file = Oden.openSync("./tests/bench/testdata/128k.bin");
});

// A common "language feature", that should be fast
// also a decent representation of a non-trivial JSON-op
{
  let i = 0;
  Oden.bench("url_parse", { n: 5e4 }, () => {
    new URL(`http://www.google.com/${i}`);
    i++;
  });
}

Oden.bench("blob_text_large", { n: 100 }, () => {
  new Blob([input]).text();
});

const input = "long-string".repeat(99999);
Oden.bench("b64_rt_long", { n: 100 }, () => {
  atob(btoa(input));
});

Oden.bench("b64_rt_short", { n: 1e6 }, () => {
  atob(btoa("123"));
});

{
  const buf = new Uint8Array(100);
  const file = Oden.openSync("/dev/zero");
  Oden.bench("read_zero", { n: 5e5 }, () => {
    file.readSync(buf);
  });
}

{
  // Not too large since we want to measure op-overhead not sys IO
  const dataChunk = new Uint8Array(100);
  const file = Oden.openSync("/dev/null", { write: true });
  Oden.bench("write_null", { n: 5e5 }, () => {
    file.writeSync(dataChunk);
  });
}

Oden.bench(
  "read_128k",
  { n: 5e4 },
  () => Oden.readFile("./tests/bench/testdata/128k.bin"),
);

Oden.bench("request_new", { n: 5e5 }, () => new Request("https://deno.land"));
