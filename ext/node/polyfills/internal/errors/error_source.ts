// Copyright 2018-2026 the Oden authors. MIT license.
// Copyright Node.js contributors. All rights reserved. MIT License.

(function () {
const { core } = __bootstrap;
const { op_node_get_first_expression } = core.ops;

return { getErrorSourceExpression: op_node_get_first_expression };
})();
