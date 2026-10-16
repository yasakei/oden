try {
  await import("./a.ts");
} catch {
  console.log("fail");
}
Oden.writeTextFileSync("a.ts", "");
try {
  await import("./a.ts");
} catch {
  console.log("fail");
}
