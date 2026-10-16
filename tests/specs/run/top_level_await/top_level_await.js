const buf = await Oden.readFile("./hello.txt");
const n = await Oden.stdout.write(buf);
console.log(`\n\nwrite ${n}`);
