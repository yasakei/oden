// Copyright 2018-2026 the Oden authors. MIT license.
(function () {
const { core, primordials } = __bootstrap;
const { isWindows } = core.loadExtScript("ext:oden_node/_util/os.ts");

const { SafeRegExp } = primordials;

const SEP = isWindows ? "\\" : "/";
const SEP_PATTERN = isWindows
  ? new SafeRegExp("[\\\\/]+")
  : new SafeRegExp("\/+");

return {
  SEP,
  SEP_PATTERN,
};
})();
