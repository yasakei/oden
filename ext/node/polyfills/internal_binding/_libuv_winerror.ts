// Copyright 2018-2026 the Oden authors. MIT license.

(function () {
const { core } = __bootstrap;
const { op_node_sys_to_uv_error } = core.ops;

function uvTranslateSysError(sysErrno: number): string {
  return op_node_sys_to_uv_error(sysErrno);
}

return { uvTranslateSysError };
})();
