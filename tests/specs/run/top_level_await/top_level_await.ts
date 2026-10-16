const buf: Uint8Array = await Oden.readFile("./hello.txt");
const n: number = await Oden.stdout.write(buf);
console.log(`\n\nwrite ${n}`);
