const worker = new Worker(
  import.meta.resolve("./read_check_granular_worker.js"),
  { type: "module", oden: { permissions: "none" } },
);

onmessage = ({ data }) => {
  worker.postMessage(data);
};

worker.onmessage = ({ data }) => {
  postMessage(data);
};
