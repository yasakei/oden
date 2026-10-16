/**
 * The shebang only requests read access, so the inherited `--allow-env`
 * permission is revoked and accessing the environment fails.
 *
 * ```ts
 * #!/usr/bin/env -S oden run --allow-read
 * Oden.env.toObject();
 * ```
 *
 * `-A` inherits every permission from the test runner, so this example can
 * access the environment.
 *
 * ```ts
 * #!/usr/bin/env -S oden run -A
 * Oden.env.toObject();
 * ```
 * @module doc
 */
