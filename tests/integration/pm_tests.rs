// Copyright 2018-2026 the Oden authors. MIT license.

use serde_json::json;
use test_util::TestContextBuilder;
use test_util::assert_contains;
use test_util::env_vars_for_jsr_npm_tests;
use test_util::pty::Pty;
use test_util::test;

#[test]
fn add_basic() {
  let starting_oden_json = json!({
    "name": "@foo/bar",
    "version": "1.0.0",
    "exports": "./mod.ts",
  });
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();
  temp_dir.join("oden.json").write_json(&starting_oden_json);

  let output = context.new_command().args("add jsr:@odentest/add").run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "name": "@foo/bar",
    "version": "1.0.0",
    "exports": "./mod.ts",
    "imports": {
      "@odentest/add": "jsr:@odentest/add@^1.0.0"
    }
  }));
}

#[test]
fn add_basic_no_oden_json() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();

  let output = context.new_command().args("add jsr:@odentest/add").run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  // Don't use `assert_matches_json` to ensure the file is properly formatted.
  let expected = r#"{
  "imports": {
    "@odentest/add": "jsr:@odentest/add@^1.0.0"
  }
}
"#;
  temp_dir.join("oden.json").assert_matches_text(expected);
}

#[test]
fn add_basic_with_empty_oden_json() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir();
  temp_dir.write("oden.json", "");

  let output = context.new_command().args("add jsr:@odentest/add").run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  temp_dir
    .path()
    .join("oden.json")
    .assert_matches_json(json!({
      "imports": {
        "@odentest/add": "jsr:@odentest/add@^1.0.0"
      }
    }));
}

#[test]
fn add_version_contraint() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();

  let output = context.new_command().args("add jsr:@odentest/add@1").run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "imports": {
      "@odentest/add": "jsr:@odentest/add@^1.0.0"
    }
  }));
}

#[test]
fn add_tilde() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();

  let output = context.new_command().args("add jsr:@odentest/add@~1").run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "imports": {
      "@odentest/add": "jsr:@odentest/add@~1.0.0"
    }
  }));
}

#[test]
fn add_save_exact() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();

  let output = context
    .new_command()
    .args("add jsr:@odentest/add --save-exact")
    .run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "imports": {
      "@odentest/add": "jsr:@odentest/add@1.0.0"
    }
  }));
}

#[test]
fn add_exact_alias() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();

  let output = context
    .new_command()
    .args("add jsr:@odentest/add --exact")
    .run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "imports": {
      "@odentest/add": "jsr:@odentest/add@1.0.0"
    }
  }));
}

#[test]
fn add_multiple() {
  let starting_oden_json = json!({
    "name": "@foo/bar",
    "version": "1.0.0",
    "exports": "./mod.ts",
  });
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();
  temp_dir.join("oden.json").write_json(&starting_oden_json);

  let output = context
    .new_command()
    .args("add jsr:@odentest/add jsr:@odentest/subset-type-graph")
    .run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add jsr:@odentest/add");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "name": "@foo/bar",
    "version": "1.0.0",
    "exports": "./mod.ts",
    "imports": {
      "@odentest/add": "jsr:@odentest/add@^1.0.0",
      "@odentest/subset-type-graph": "jsr:@odentest/subset-type-graph@^0.1.0"
    }
  }));
}

#[test]
fn add_npm() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();

  let output = context.new_command().args("add npm:chalk@4.1").run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add npm:chalk");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "imports": {
      "chalk": "npm:chalk@^4.1.2"
    }
  }));
}

#[test]
fn add_npm_latest_default_minimum_dependency_age_downgrades() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();

  let output = context
    .new_command()
    .env_remove("NPM_CONFIG_MIN_RELEASE_AGE")
    .args("add npm:@odentest/min-release-age-latest@latest")
    .run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add npm:@odentest/min-release-age-latest@1.0.0");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "imports": {
      "@odentest/min-release-age-latest": "npm:@odentest/min-release-age-latest@^1.0.0"
    }
  }));
}

#[test]
fn add_npm_latest_minimum_dependency_age_downgrades() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();
  temp_dir.join("oden.json").write_json(&json!({
    "minimumDependencyAge": "2025-01-01T00:00:00.000Z",
  }));

  let output = context
    .new_command()
    .args("add npm:@odentest/min-release-age-latest@latest")
    .run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add npm:@odentest/min-release-age-latest@1.0.0");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "minimumDependencyAge": "2025-01-01T00:00:00.000Z",
    "imports": {
      "@odentest/min-release-age-latest": "npm:@odentest/min-release-age-latest@^1.0.0"
    }
  }));
}

#[test]
fn add_npm_latest_minimum_dependency_age_disabled() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();
  temp_dir.join("oden.json").write_json(&json!({
    "minimumDependencyAge": false,
  }));

  let output = context
    .new_command()
    .args("add npm:@odentest/min-release-age-latest@latest")
    .run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add npm:@odentest/min-release-age-latest@2.0.0");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "minimumDependencyAge": false,
    "imports": {
      "@odentest/min-release-age-latest": "npm:@odentest/min-release-age-latest@^2.0.0"
    }
  }));
}

#[test]
fn add_npm_latest_npmrc_min_release_age_downgrades() {
  let context = pm_context_builder().build();
  let temp_dir = context.temp_dir().path();
  temp_dir.join(".npmrc").write("min-release-age=1");

  let output = context
    .new_command()
    .args("add npm:@odentest/min-release-age-latest@latest")
    .run();
  output.assert_exit_code(0);
  let output = output.combined_output();
  assert_contains!(output, "Add npm:@odentest/min-release-age-latest@1.0.0");
  temp_dir.join("oden.json").assert_matches_json(json!({
    "imports": {
      "@odentest/min-release-age-latest": "npm:@odentest/min-release-age-latest@^1.0.0"
    }
  }));
}

#[test]
fn add_npm_minimum_dependency_age_no_matching_shows_hint() {
  let context = pm_context_builder().build();

  // 2.0.0 of this package has a publish date far in the future, so it is
  // always newer than the minimum dependency age. Requesting it specifically
  // leaves no installable version, and the error should point the user at the
  // "minimumDependencyAge" setting.
  let output = context
    .new_command()
    .env_remove("NPM_CONFIG_MIN_RELEASE_AGE")
    .args("add npm:@odentest/min-release-age-latest@2.0.0")
    .run();
  output.assert_exit_code(1);
  let output = output.combined_output();
  assert_contains!(output, "minimum dependency date");
  assert_contains!(output, "minimumDependencyAge");
  assert_contains!(output, "--minimum-dependency-age");
  assert_contains!(output, "--min-dep-age");
}

fn pm_context_builder() -> TestContextBuilder {
  TestContextBuilder::new()
    .use_http_server()
    .envs(env_vars_for_jsr_npm_tests())
    .use_temp_cwd()
}

#[test(flaky)]
fn approve_scripts_basic() {
  if !Pty::is_supported() {
    return;
  }
  let context = pm_context_builder().build();
  context
    .temp_dir()
    .write("oden.json", r#"{"nodeModulesDir": "manual"}"#);
  context
    .new_command()
    .args("install npm:@odentest/node-lifecycle-scripts@1.0.0")
    .run()
    .skip_output_check();
  context
    .new_command()
    .args("approve-scripts")
    .with_pty(|mut pty| {
      pty.expect("Select which packages to approve lifecycle scripts for");
      pty.expect("@odentest/node-lifecycle-scripts@1.0.0");
      pty.write_line(" ");
      pty.write_line("\r\n");
      pty.expect("Approved npm:@odentest/node-lifecycle-scripts@1.0.0");
      pty.expect("Ran build script npm:@odentest/node-lifecycle-scripts@1.0.0");
    });
  context
    .temp_dir()
    .path()
    .join("oden.json")
    .assert_matches_json(json!({
      "nodeModulesDir": "manual",
      "imports": {
        "@odentest/node-lifecycle-scripts": "npm:@odentest/node-lifecycle-scripts@1.0.0"
      },
      "allowScripts": ["npm:@odentest/node-lifecycle-scripts@1.0.0"],
    }));
  context
    .temp_dir()
    .path()
    .join("install.txt")
    .assert_matches_text("Installed by @odentest/node-lifecycle-scripts!");
}

#[test(flaky)]
fn approve_scripts_deny_some() {
  if !Pty::is_supported() {
    return;
  }
  let context = pm_context_builder().build();
  context
    .temp_dir()
    .write("oden.json", r#"{"nodeModulesDir": "manual"}"#);
  context
    .new_command()
    .args("install npm:@odentest/node-lifecycle-scripts@1.0.0 npm:@odentest/print-npm-user-agent@1.0.0")
    .run()
    .skip_output_check();
  context
    .new_command()
    .args("approve-scripts")
    .with_pty(|mut pty| {
      pty.expect("Select which packages to approve lifecycle scripts for");
      pty.expect("@odentest/node-lifecycle-scripts@1.0.0");
      pty.expect("@odentest/print-npm-user-agent@1.0.0");
      pty.write_line(" ");
      pty.write_line("\r\n");
      pty.expect("Denied npm:@odentest/print-npm-user-agent@1.0.0");
      pty.expect("Approved npm:@odentest/node-lifecycle-scripts@1.0.0");
      pty.expect("Ran build script npm:@odentest/node-lifecycle-scripts@1.0.0");
    });
  context.temp_dir().path().join("oden.json").assert_matches_json(json!({
    "nodeModulesDir": "manual",
    "imports": {
      "@odentest/node-lifecycle-scripts": "npm:@odentest/node-lifecycle-scripts@1.0.0",
      "@odentest/print-npm-user-agent": "npm:@odentest/print-npm-user-agent@1.0.0"
    },
    "allowScripts": {
      "allow": ["npm:@odentest/node-lifecycle-scripts@1.0.0"],
      "deny": ["npm:@odentest/print-npm-user-agent@1.0.0"]
    },
  }));
  context
    .temp_dir()
    .path()
    .join("install.txt")
    .assert_matches_text("Installed by @odentest/node-lifecycle-scripts!");
}

#[test(flaky)]
fn approve_scripts_no_lock_explicit_package() {
  let context = pm_context_builder().build();
  context
    .temp_dir()
    .write("oden.json", r#"{"lock": false, "nodeModulesDir": "auto"}"#);
  context.temp_dir().write(
    "package.json",
    r#"{"dependencies": {"@odentest/node-lifecycle-scripts": "*"}}"#,
  );
  context
    .new_command()
    .args("install")
    .run()
    .skip_output_check();
  context
    .new_command()
    .args("approve-scripts npm:@odentest/node-lifecycle-scripts")
    .run()
    .assert_matches_text(
      "[WILDCARD]Approved npm:@odentest/node-lifecycle-scripts[WILDCARD]",
    );
}

#[test(flaky)]
fn approve_scripts_no_lock_detects_packages() {
  if !Pty::is_supported() {
    return;
  }
  let context = pm_context_builder().build();
  context
    .temp_dir()
    .write("oden.json", r#"{"lock": false, "nodeModulesDir": "auto"}"#);
  context.temp_dir().write(
    "package.json",
    r#"{"dependencies": {"@odentest/node-lifecycle-scripts": "*"}}"#,
  );
  context
    .new_command()
    .args("install")
    .run()
    .skip_output_check();
  // Without explicit package args, approve-scripts should detect packages
  // with lifecycle scripts and show the interactive picker.
  context
    .new_command()
    .args("approve-scripts")
    .with_pty(|mut pty| {
      pty.expect("Select which packages to approve lifecycle scripts for");
      pty.expect("@odentest/node-lifecycle-scripts@1.0.0");
      pty.write_line(" ");
      pty.write_line("\r\n");
      pty.expect("Approved npm:@odentest/node-lifecycle-scripts@1.0.0");
    });
}

#[test(flaky)]
fn update_interactive_shows_version_req() {
  if !Pty::is_supported() {
    return;
  }
  let context = pm_context_builder().build();
  // The requirement (`^1.0.0`) resolves to the latest compatible version
  // (`1.0.1`). The interactive picker must show the version requirement being
  // updated (`1.0.0 -> 1.0.1`), not the resolved version on both sides
  // (`1.0.1 -> 1.0.1`). Regression test for
  // https://github.com/denoland/deno/issues/34668
  context.temp_dir().write(
    "oden.json",
    r#"{"imports": {"@odentest/update-latest-semver": "npm:@odentest/update-latest-semver@^1.0.0"}}"#,
  );
  context
    .new_command()
    .args("install")
    .run()
    .skip_output_check();
  context
    .new_command()
    .args("update --interactive")
    .with_pty(|mut pty| {
      pty.expect("Select which packages to update");
      pty.expect("1.0.0 -> 1.0.1");
    });
}
