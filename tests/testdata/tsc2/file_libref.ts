// deno-lint-ignore-file
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="oden.ns" />

export const div = document.createElement("div");
div.innerHTML = `<span>Hello World!</span>`;
console.log(Oden.args);
