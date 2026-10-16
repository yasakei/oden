/**
 * `--allow-read --deny-env` revokes env but keeps the inherited read scope,
 * so reading the cwd keeps working.
 *
 * ```ts
 * #!/usr/bin/env -S oden run --allow-read --deny-env
 * Oden.cwd();
 * ```
 *
 * The same shebang denies env, so accessing the environment fails.
 *
 * ```ts
 * #!/usr/bin/env -S oden run --allow-read --deny-env
 * Oden.env.toObject();
 * ```
 * @module doc
 */
