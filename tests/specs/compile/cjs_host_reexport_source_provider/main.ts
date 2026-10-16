import { join } from "node:path";
import { pathToFileURL } from "node:url";

const mode = Oden.args[0];
const specifier = pathToFileURL(
  join(Oden.cwd(), "allowed", `${mode}.cjs`),
).href;

try {
  const module = await import(specifier);
  if (mode === "reexport" && module.value === "from-inner") {
    console.log(module.value);
  } else {
    console.log("unexpected result");
    Oden.exit(1);
  }
} catch (err) {
  const message = err instanceof Error
    ? `${err.message}\n${err.stack ?? ""}`
    : String(err);
  if (
    mode === "denied" &&
    message.includes("Requires read access") &&
    !message.includes("ODEN_STANDALONE_CJS_SOURCE_CANARY")
  ) {
    console.log("blocked");
  } else {
    console.log("unexpected error");
    Oden.exit(1);
  }
}
