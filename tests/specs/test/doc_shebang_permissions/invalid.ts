/**
 * A shebang that is not a valid `oden` command fails the test rather than
 * running with inherited permissions.
 *
 * ```ts
 * #!/bin/sh
 * Oden.env.toObject();
 * ```
 * @module doc
 */
