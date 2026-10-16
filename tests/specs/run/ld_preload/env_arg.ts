try {
  new Oden.Command("curl", {
    env: {
      "LD_PRELOAD": "./libpreload.so",
    },
  }).spawn();
} catch (err) {
  console.log(err);
}

try {
  Oden.run({
    cmd: ["curl"],
    env: {
      "LD_PRELOAD": "./libpreload.so",
    },
  });
} catch (err) {
  console.log(err);
}
