// Acquire an exclusive lock in the shared workspace root. If another task is
// holding it, the tasks are overlapping (i.e. running concurrently) and this
// run is NOT sequential, so fail loudly.
const NAME = "c";
const root = Oden.env.get("INIT_CWD")!;
const lock = `${root}/running.lock`;
try {
  await Oden.writeTextFile(lock, NAME, { createNew: true });
} catch {
  console.error(`${NAME}: overlap detected — tasks ran concurrently`);
  Oden.exit(1);
}
console.log(`${NAME} running`);
await new Promise((r) => setTimeout(r, 100));
await Oden.remove(lock);
console.log(`${NAME} done`);
