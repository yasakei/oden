// Copyright 2018-2026 the Oden authors. MIT license.
const res = await fetch(
  "http://localhost:4545/run/045_mod.ts",
);
console.log(`Response http: ${await res.text()}`);
