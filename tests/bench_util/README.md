# Benching utility for `oden_core` op system

Example:

```rust
use oden_bench_util::bench_js_sync;
use oden_bench_util::bench_or_profile;
use oden_bench_util::bencher::Bencher;
use oden_bench_util::bencher::benchmark_group;
use oden_core::Extension;

#[op2]
#[number]
fn op_nop() -> usize {
  9
}

fn setup() -> Vec<Extension> {
  vec![Extension {
    name: "my_ext",
    ops: std::borrow::Cow::Borrowed(&[op_nop::DECL]),
  }]
}

fn bench_op_nop(b: &mut Bencher) {
  bench_js_sync(b, r#"Oden.core.ops.op_nop();"#, setup);
}

benchmark_group!(benches, bench_op_nop);
bench_or_profile!(benches);
```
