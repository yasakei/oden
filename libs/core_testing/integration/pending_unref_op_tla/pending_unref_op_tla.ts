// Copyright 2018-2026 the Oden authors. MIT license.
console.log("should not panic");
await new Promise((r) => {
  const id = setTimeout(r, 1000);
  Oden.unrefTimer(id);
});
console.log("didn't panic!");
