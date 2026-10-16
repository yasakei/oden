const NAME = "web";
const root = Oden.env.get("INIT_CWD")!;
console.log(`${NAME} ready`);
await Oden.writeTextFile(`${root}/marker.${NAME}`, "");
const deadline = Date.now() + 15_000;
while (true) {
  try {
    await Oden.stat(`${root}/marker.server`);
    await Oden.stat(`${root}/marker.web`);
    await Oden.stat(`${root}/marker.shared`);
    break;
  } catch {
    if (Date.now() > deadline) {
      console.error(`${NAME}: timed out waiting for siblings`);
      Oden.exit(1);
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}
console.log(`${NAME} done`);
