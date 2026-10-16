const buffer = new Uint8Array(10);
const nread = await Oden.stdin.read(buffer);

if (nread != 10) {
  throw new Error("Too little data read");
}

const nwritten = await Oden.stdout.write(buffer);
if (nwritten != 10) {
  throw new Error("Too little data written");
}
