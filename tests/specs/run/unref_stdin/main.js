const { core } = Oden[Oden.internal];
const opPromise = core.read(Oden.stdin.rid, new Uint8Array(10));
core.unrefOpPromise(opPromise);

async function main() {
  console.log(1);
  await opPromise;
  console.log(2);
}

main();
