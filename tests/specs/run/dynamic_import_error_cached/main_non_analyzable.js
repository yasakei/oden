const file = "./a" + ".ts";
try {
  await import(file);
} catch {
  console.log("fail");
}
Oden.writeTextFileSync("a.ts", "");
try {
  await import(file);
} catch {
  console.log("fail");
}
