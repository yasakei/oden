export default {
  name: "foo",
  rules: {
    foo: {
      create(ctx) {
        let program: Array<Oden.lint.LineComment | Oden.lint.BlockComment> = [];
        return {
          Program(node) {
            program = node.comments;
          },
          FunctionDeclaration(node) {
            const all = ctx.sourceCode.getAllComments();
            const before = ctx.sourceCode.getCommentsBefore(node);
            const after = ctx.sourceCode.getCommentsAfter(node);
            const inside = ctx.sourceCode.getCommentsInside(node);

            console.log({ program, all, before, after, inside });
          },
        };
      },
    },
  },
} satisfies Oden.lint.Plugin;
