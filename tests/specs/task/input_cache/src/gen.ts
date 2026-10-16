Oden.mkdirSync("dist", { recursive: true });
Oden.writeTextFileSync("dist/out.txt", "artifact");
console.log("generated");
