// Copyright 2018-2026 the Oden authors. MIT license.

use oden_bench_util::bench_js_sync;
use oden_bench_util::bench_or_profile;
use oden_bench_util::bencher::Bencher;
use oden_bench_util::bencher::benchmark_group;
use oden_core::Extension;

fn setup() -> Vec<Extension> {
  oden_core::extension!(
    oden_webidl_bench,
    esm_entry_point = "ext:oden_webidl_bench/setup.js",
    esm = ["ext:oden_webidl_bench/setup.js" = "benches/dict.js"]
  );

  vec![oden_webidl::oden_webidl::init(), oden_webidl_bench::init()]
}

fn converter_undefined(b: &mut Bencher) {
  bench_js_sync(b, r#"TextDecodeOptions(undefined);"#, setup);
}

fn handwritten_baseline_undefined(b: &mut Bencher) {
  bench_js_sync(b, r#"handwrittenConverter(undefined)"#, setup);
}

fn converter_object(b: &mut Bencher) {
  bench_js_sync(b, r#"TextDecodeOptions({});"#, setup);
}

fn handwritten_baseline_object(b: &mut Bencher) {
  bench_js_sync(b, r#"handwrittenConverter({})"#, setup);
}

benchmark_group!(
  benches,
  converter_undefined,
  handwritten_baseline_undefined,
  converter_object,
  handwritten_baseline_object,
);
bench_or_profile!(benches);
