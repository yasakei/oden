const scope = import.meta.url.slice(-7) === "#worker" ? "worker" : "main";

console.log(scope, Oden.AtomicOperation);
console.log(scope, Oden.Kv);
console.log(scope, Oden.KvListIterator);
console.log(scope, Oden.KvU64);
console.log(scope, Oden.openKv);

if (scope === "worker") {
  postMessage("done");
} else {
  const worker = new Worker(`${import.meta.url}#worker`, { type: "module" });
  worker.onmessage = () => Oden.exit(0);
}
