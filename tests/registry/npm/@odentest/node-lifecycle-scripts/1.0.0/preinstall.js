if ("Oden" in globalThis && typeof globalThis.Oden === 'object') {
  require('./helper.js');
  console.log('oden preinstall.js');
} else {
  console.log('node preinstall.js');
}