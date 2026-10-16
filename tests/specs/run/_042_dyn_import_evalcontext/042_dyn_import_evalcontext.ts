// @ts-expect-error "Oden[Oden.internal].core" is not a public interface
Oden[Oden.internal].core.evalContext(
  "(async () => console.log(await import('./_042_dyn_import_evalcontext/mod4.js')))()",
  new URL("..", import.meta.url).href,
);
