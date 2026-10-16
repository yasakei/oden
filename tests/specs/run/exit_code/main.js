if (Oden.exitCode != 0) {
  throw new Error("boom!");
}

Oden.exitCode = 42;

console.log("Oden.exitCode", Oden.exitCode);
