// Copyright 2018-2026 the Oden authors. MIT license.

(function () {
const { primordials } = __bootstrap;
const {
  ObjectFreeze,
} = primordials;

const version = {
  oden: "",
  v8: "",
  typescript: "",
};

function setVersions(
  odenVersion,
  v8Version,
  tsVersion,
) {
  version.oden = odenVersion;
  version.v8 = v8Version;
  version.typescript = tsVersion;

  ObjectFreeze(version);
}

return { setVersions, version };
})();
