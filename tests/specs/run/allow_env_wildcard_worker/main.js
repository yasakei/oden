console.log("main1", Oden.env.get("ODEN_HELLO"));
console.log("main2", Oden.env.get("ODEN_BYE"));
console.log("main3", Oden.env.get("AWS_HELLO"));

new Worker(import.meta.resolve("./worker.js"), {
  type: "module",
  oden: {
    permissions: {
      env: ["ODEN_*"],
    },
  },
});
