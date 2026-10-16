Oden.env.set("LD_PRELOAD", "./libpreload.so");

try {
  new Oden.Command("curl").spawn();
} catch (err) {
  console.log(err);
}

Oden.env.set("DYLD_FALLBACK_LIBRARY_PATH", "./libpreload.so");

try {
  Oden.run({ cmd: ["curl"] }).spawnSync();
} catch (err) {
  console.log(err);
}
