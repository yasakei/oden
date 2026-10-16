self.onmessage = () => {
  self.close = () => {
    self.postMessage("overridden self.close was called");
  };
  Oden[Oden.internal].core.ops.op_set_exit_code(42);
  Oden.exit();
};
