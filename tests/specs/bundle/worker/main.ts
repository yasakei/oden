const worker = new Worker(import.meta.resolve("./worker.ts"), {
  type: "module",
});
worker.onmessage = () => Oden.exit(0);
