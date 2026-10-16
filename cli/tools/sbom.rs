// Copyright 2018-2026 the Oden authors. MIT license.

use std::sync::Arc;

use base64::Engine as _;
use base64::prelude::BASE64_STANDARD;
use oden_core::error::AnyError;
use oden_core::serde_json;
use oden_core::serde_json::json;
use oden_lib::version::ODEN_VERSION;
use oden_lockfile::LockfileContent;
use sys_traits::FsCreateDirAll;
use sys_traits::FsWrite;

use crate::args::Flags;
use crate::args::SbomFlags;
use crate::factory::CliFactory;

pub async fn sbom(
  flags: Arc<Flags>,
  sbom_flags: SbomFlags,
) -> Result<(), AnyError> {
  let factory = CliFactory::from_flags(flags);
  let Some(lockfile) = factory.maybe_lockfile().await? else {
    oden_core::anyhow::bail!(
      "No lockfile found. Run `oden install` to generate one."
    );
  };
  let document = {
    let lockfile = lockfile.lock();
    lockfile_content_to_cyclonedx(&lockfile.content, lockfile.remote())
  };
  let text = serde_json::to_string_pretty(&document)?;
  match sbom_flags.output.as_deref() {
    Some(path) => {
      let path = std::path::Path::new(path);
      let sys = factory.sys();
      if let Some(parent) = path.parent() {
        sys.fs_create_dir_all(parent)?;
      }
      sys.fs_write(path, text.as_bytes())?;
    }
    None => {
      #[allow(clippy::print_stdout, reason = "sbom output")]
      {
        println!("{text}");
      }
    }
  }
  Ok(())
}

/// Converts lockfile content to a CycloneDX 1.6 SBOM document.
fn lockfile_content_to_cyclonedx(
  content: &LockfileContent,
  remote: &std::collections::BTreeMap<String, String>,
) -> serde_json::Value {
  let mut components = Vec::new();
  for (key, info) in content.packages.npm.iter() {
    let Some((name, version)) = split_npm_key(key) else {
      continue;
    };
    let mut component = json!({
      "bom-ref": key,
      "type": "library",
      "name": name,
      "version": version,
      "purl": npm_purl(name, version),
    });
    if let Some(integrity) = info.integrity.as_deref()
      && let Some(hashes) = integrity_hashes(integrity)
    {
      component["hashes"] = hashes;
    }
    components.push(component);
  }
  for (nv, info) in content.packages.jsr.iter() {
    let mut component = json!({
      "bom-ref": format!("{}@{}", nv.name.as_str(), nv.version),
      "type": "library",
      "name": nv.name.as_str(),
      "version": nv.version.to_string(),
    });
    if let Some(hashes) = integrity_hashes(&info.integrity) {
      component["hashes"] = hashes;
    }
    components.push(component);
  }
  for (url, hash) in remote.iter() {
    let mut component = json!({
      "bom-ref": url,
      "type": "library",
      "name": url,
      "externalReferences": [{ "type": "distribution", "url": url }],
    });
    if let Some(hashes) = hex_hashes(hash) {
      component["hashes"] = hashes;
    }
    components.push(component);
  }
  json!({
    "bomFormat": "CycloneDX",
    "specVersion": "1.6",
    "version": 1,
    "metadata": {
      "tools": {
        "components": [{
          "type": "application",
          "name": "oden",
          "version": ODEN_VERSION,
        }]
      }
    },
    "components": components,
  })
}

/// Splits an npm lockfile key (`name@version`, scoped names and peer
/// suffixes included) into its base name and version.
fn split_npm_key(key: &str) -> Option<(&str, &str)> {
  let at = key.get(1..)?.find('@').map(|i| i + 1)?;
  let (name, rest) = key.split_at(at);
  let version = rest[1..].split('_').next()?;
  Some((name, version))
}

fn npm_purl(name: &str, version: &str) -> String {
  format!("pkg:npm/{}@{}", name.replace('@', "%40"), version)
}

/// Converts an `algorithm-base64` integrity string to CycloneDX hashes.
fn integrity_hashes(integrity: &str) -> Option<serde_json::Value> {
  let (algorithm, base64_hash) = integrity.split_once('-')?;
  let algorithm = match algorithm {
    "sha512" => "SHA-512",
    "sha384" => "SHA-384",
    "sha256" => "SHA-256",
    "sha1" => "SHA-1",
    _ => return None,
  };
  let bytes = BASE64_STANDARD.decode(base64_hash).ok()?;
  Some(json!([{ "alg": algorithm, "content": faster_hex::hex_string(&bytes) }]))
}

/// Converts a bare hex digest (as stored for remote dependencies) to
/// CycloneDX hashes, inferring the algorithm from its length.
fn hex_hashes(hash: &str) -> Option<serde_json::Value> {
  if !hash.chars().all(|c| c.is_ascii_hexdigit()) {
    return None;
  }
  let algorithm = match hash.len() {
    32 => "MD5",
    40 => "SHA-1",
    64 => "SHA-256",
    96 => "SHA-384",
    128 => "SHA-512",
    _ => return None,
  };
  Some(json!([{ "alg": algorithm, "content": hash.to_lowercase() }]))
}

#[cfg(test)]
mod test {
  use super::*;
  use oden_lockfile::Lockfile;

  fn fixture_lockfile() -> Lockfile {
    let json = serde_json::json!({
      "version": "5",
      "specifiers": { "npm:left-pad@1": "1.3.0" },
      "jsr": {
        "@std/fs@1.0.0": { "integrity": "sha512-aaa", "dependencies": [] },
      },
      "npm": {
        "left-pad@1.3.0": {
          "integrity": "sha512-x4XZGIjTOjMdaOx6HEubhFBPnvJvLuJ/J0V2WkN9nIh4M94PRVTw1TaJF3lFP2xpgnXmM2nizs6wgvEoU9C6oQ==",
        },
        "@esbuild/linux-x64@0.24.0": {
          "integrity": "sha512-foobar",
        },
        "react-dom@19.0.0_react@19.0.0": {
          "integrity": "sha512-foobar",
        },
        "no-hash@2.0.0": {},
      },
      "remote": {
        "https://example.com/mod.ts": "3118d7a42c03c242c5a49c2ad91c8396110e14acca1324e7aaefd31a999b71a4",
      },
      "workspace": {},
    });
    let content = LockfileContent::from_json(json).unwrap();
    Lockfile {
      overwrite: false,
      has_content_changed: false,
      content,
      filename: std::path::PathBuf::from("oden.lock"),
    }
  }

  #[test]
  fn converts_npm_jsr_and_remote_entries() {
    let lockfile = fixture_lockfile();
    let document =
      lockfile_content_to_cyclonedx(&lockfile.content, lockfile.remote());
    assert_eq!(document["bomFormat"], "CycloneDX");
    assert_eq!(document["specVersion"], "1.6");
    let components = document["components"].as_array().unwrap();
    assert_eq!(components.len(), 6);

    let left_pad = components
      .iter()
      .find(|c| c["bom-ref"] == "left-pad@1.3.0")
      .unwrap();
    assert_eq!(left_pad["name"], "left-pad");
    assert_eq!(left_pad["version"], "1.3.0");
    assert_eq!(left_pad["purl"], "pkg:npm/left-pad@1.3.0");
    assert_eq!(left_pad["hashes"][0]["alg"], "SHA-512");
    assert_eq!(
      left_pad["hashes"][0]["content"],
      "c785d91888d33a331d68ec7a1c4b9b84504f9ef26f2ee27f2745765a437d9c887833de0f4554f0d536891779453f6c698275e63369e2ceceb082f12853d0baa1"
    );

    let esbuild = components
      .iter()
      .find(|c| c["bom-ref"] == "@esbuild/linux-x64@0.24.0")
      .unwrap();
    assert_eq!(esbuild["purl"], "pkg:npm/%40esbuild/linux-x64@0.24.0");

    let peer = components
      .iter()
      .find(|c| c["bom-ref"] == "react-dom@19.0.0_react@19.0.0")
      .unwrap();
    assert_eq!(peer["name"], "react-dom");
    assert_eq!(peer["version"], "19.0.0");

    assert!(
      components
        .iter()
        .any(|c| c["bom-ref"] == "no-hash@2.0.0" && c.get("hashes").is_none())
    );

    let jsr = components
      .iter()
      .find(|c| c["bom-ref"] == "@std/fs@1.0.0")
      .unwrap();
    assert_eq!(jsr["name"], "@std/fs");

    let remote = components
      .iter()
      .find(|c| c["bom-ref"] == "https://example.com/mod.ts")
      .unwrap();
    assert_eq!(remote["hashes"][0]["alg"], "SHA-256");
  }

  #[test]
  fn rejects_malformed_hashes() {
    assert!(integrity_hashes("md5-aaa").is_none());
    assert!(integrity_hashes("sha512-!!!").is_none());
    assert!(integrity_hashes("no-dash").is_none());
    assert!(hex_hashes("xyz").is_none());
    assert!(hex_hashes("abc").is_none());
  }
}
