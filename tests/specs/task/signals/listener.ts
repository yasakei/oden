import { signals } from "./signals.ts";

for (const signal of signals) {
  Oden.addSignalListener(signal, () => {
    console.log("Received", signal);
    if (signal === "SIGTERM") {
      Oden.exit(0);
    }
  });
}

setInterval(() => {
  // keep alive
}, 1000);

console.log("Ready");
