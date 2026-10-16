// Copyright 2018-2026 the Oden authors. MIT license.

console.log("Starting the child worker");

setTimeout(() => {
  console.log("The child worker survived the death of the parent!!!");
  Oden.exit(1);
}, 2000);
