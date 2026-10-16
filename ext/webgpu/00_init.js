// Copyright 2018-2026 the Oden authors. MIT license.

(function () {
const { core } = __bootstrap;

const loadWebGPU = core.createLazyLoader("ext:oden_webgpu/01_webgpu.js");

return { loadWebGPU };
})();
