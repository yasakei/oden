// Run without permissions.
const buf = new Uint8Array(1);
console.log("Enter 'yy':");
await Oden.stdin.read(buf);
await Oden.permissions.request({ "name": "env" });
console.log("\n\nOwned", Oden.env.get("SECRET"));
