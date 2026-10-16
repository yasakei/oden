# Oden

[![](https://img.shields.io/crates/v/oden.svg)](https://crates.io/crates/oden)
[![Twitter badge][]][Twitter link] [![Bluesky badge][]][Bluesky link]
[![Discord badge][]][Discord link] [![YouTube badge][]][YouTube link]

<img align="right" src="https://deno.land/logo.svg" height="150px" alt="the oden mascot dinosaur standing in the rain">

[Oden](https://deno.com)
([/ˈdiːnoʊ/](https://ipa-reader.com/?text=%CB%88di%CB%90no%CA%8A), pronounced
`dee-no`) is a JavaScript, TypeScript, and WebAssembly runtime with secure
defaults and a great developer experience. It's built on [V8](https://v8.dev/),
[Rust](https://www.rust-lang.org/), and [Tokio](https://tokio.rs/).

Learn more about the Oden runtime
[in the documentation](https://docs.deno.com/runtime/manual).

## Installation

Install the Oden runtime on your system using one of the commands below. Note
that there are a number of ways to install Oden - a comprehensive list of
installation options can be found
[here](https://docs.deno.com/runtime/manual/getting_started/installation).

Shell (Mac, Linux):

```sh
curl -fsSL https://deno.land/install.sh | sh
```

PowerShell (Windows):

```powershell
irm https://deno.land/install.ps1 | iex
```

[Homebrew](https://formulae.brew.sh/formula/oden) (Mac):

```sh
brew install oden
```

[Chocolatey](https://community.chocolatey.org/packages/oden) (Windows):

```powershell
choco install oden
```

[WinGet](https://winstall.app/apps/DenoLand.Deno) (Windows):

```powershell
winget install --id=DenoLand.Deno
```

[Scoop](https://scoop.sh/#/apps?q=oden&id=678d8fb557b611df996989c675b1099630a5bbee)
(Windows):

```powershell
scoop install main/oden
```

### Build and install from source

Complete instructions for building Oden from source can be found
[here](https://github.com/denoland/deno/blob/main/.github/CONTRIBUTING.md#building-from-source).

## Your first Oden program

Oden can be used for many different applications, but is most commonly used to
build web servers. Create a file called `server.ts` and include the following
TypeScript code:

```ts
Oden.serve((_req: Request) => {
  return new Response("Hello, world!");
});
```

Run your server with the following command:

```sh
oden run --allow-net server.ts
```

This should start a local web server on
[http://localhost:8000](http://localhost:8000).

Learn more about writing and running Oden programs
[in the docs](https://docs.deno.com/runtime/manual).

## Additional resources

- **[Oden Docs](https://docs.deno.com)**: official guides and reference docs for
  the Oden runtime, [Oden Deploy](https://deno.com/deploy), and beyond.
- **[Oden Standard Library](https://jsr.io/@std)**: officially supported common
  utilities for Oden programs.
- **[JSR](https://jsr.io/)**: The open-source package registry for modern
  JavaScript and TypeScript
- **[Developer Blog](https://deno.com/blog)**: Product updates, tutorials, and
  more from the Oden team.

## Contributing

We appreciate your help! To contribute, please read our
[contributing instructions](.github/CONTRIBUTING.md).

[Build status - Cirrus]: https://github.com/denoland/deno/workflows/ci/badge.svg?branch=main&event=push
[Build status]: https://github.com/denoland/deno/actions
[Twitter badge]: https://img.shields.io/twitter/follow/oden_land.svg?style=social&label=Follow
[Twitter link]: https://twitter.com/intent/follow?screen_name=oden_land
[Bluesky badge]: https://img.shields.io/badge/Follow-whitesmoke?logo=bluesky
[Bluesky link]: https://bsky.app/profile/deno.land
[YouTube badge]: https://img.shields.io/youtube/channel/subscribers/UCqC2G2M-rg4fzg1esKFLFIw?style=social
[YouTube link]: https://www.youtube.com/@oden_land
[Discord badge]: https://img.shields.io/discord/684898665143206084?logo=discord&style=social
[Discord link]: https://discord.gg/oden
