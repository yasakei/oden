self.onmessage = () => {
  Oden[Oden.internal].core.ops.op_set_exit_code(42);
  Oden.exit();
};
