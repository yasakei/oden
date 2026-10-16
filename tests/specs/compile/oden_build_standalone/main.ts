const value: boolean = Oden.build.standalone;
console.log(value);

new Worker(import.meta.resolve("./worker.ts"), {
  "type": "module",
});
