/**
 * A scoped `--deny-*` can't be represented in the `Oden.test` permissions
 * object, so the example fails instead of running with broader permissions
 * than the shebang declares.
 *
 * ```ts
 * #!/usr/bin/env -S oden run --allow-read --deny-read=/etc
 * Oden.cwd();
 * ```
 * @module doc
 */
