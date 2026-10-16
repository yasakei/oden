// Probe Oden.openKv() under ODEN_KV_REQUIRES_DISTRIBUTED_DATABASE.
console.log("typeof openKv:", typeof Oden.openKv);
try {
  const kv = await Oden.openKv();
  console.log("opened ok");
  kv.close();
} catch (e) {
  console.log("caught:", (e as Error).message);
}
