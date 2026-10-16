onmessage = function (e) {
  if (typeof self.Oden !== "undefined") {
    throw new Error("Oden namespace unexpectedly available in worker");
  }

  postMessage(e.data);
};
