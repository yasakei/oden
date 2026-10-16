// Copyright 2018-2026 the Oden authors. MIT license.

use oden_bench_util::bench_js_async;
use oden_bench_util::bench_or_profile;
use oden_bench_util::bencher::Bencher;
use oden_bench_util::bencher::benchmark_group;
use oden_core::Extension;

#[derive(Clone)]
struct Permissions;

fn setup() -> Vec<Extension> {
  oden_core::extension!(
    bench_setup,
    esm_entry_point = "ext:bench_setup/setup",
    esm = ["ext:bench_setup/setup" = {
      source = r#"
        import { setTimeout } from "ext:oden_web/02_timers.js";
        globalThis.setTimeout = setTimeout;
      "#
    }],
    state = |state| {
      state.put(Permissions {});
    },
  );

  vec![
    oden_webidl::oden_webidl::init(),
    oden_web::oden_web::init(
      std::sync::Arc::new(oden_web::BlobStore::default())
        as std::sync::Arc<dyn oden_web::BlobStoreTrait>,
      None,
      Default::default(),
      Default::default(),
    ),
    bench_setup::init(),
  ]
}

fn bench_set_timeout(b: &mut Bencher) {
  bench_js_async(b, r#"setTimeout(() => {}, 0);"#, setup);
}

benchmark_group!(benches, bench_set_timeout,);
bench_or_profile!(benches);
