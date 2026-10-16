# Oden

Oden (/ˈoʊdɪn/, pronounced `oh-din`) is a JavaScript, TypeScript, and
WebAssembly runtime with secure defaults and a great developer experience.
It's built on V8, Rust, and Tokio.

## Your first Oden program

Create a file called `server.ts`:

```ts
Oden.serve((_req: Request) => {
  return new Response("Hello, world!");
});
```

Run it:

```sh
oden run --allow-net server.ts
```

This starts a local web server on port 8000.

## Building from source

### Clone the repository

Oden uses submodules, so clone with `--recurse-submodules`:

```sh
git clone --recurse-submodules https://github.com/yasakei/oden.git
cd oden
```

Windows: enable "Developer Mode" (otherwise symlinks require administrator
privileges) and set `core.symlinks=true` before checkout.

### Prerequisites

- Rust 1.95.0 (see `rust-toolchain.toml`; rustup picks it up automatically)
- Python 3, with a suffix-less `python` on your `PATH`
- A native compiler toolchain plus CMake

Linux (Debian) / WSL:

```sh
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
./llvm.sh 17
apt install --install-recommends -y cmake libglib2.0-dev
```

Mac:

- Install the Xcode Command Line Tools (`xcode-select --install`)
- Install CMake
- On Apple Silicon (M1/M2), also install `llvm` and `lld` and add
  `/opt/homebrew/opt/llvm/bin/` to your `PATH`

Windows:

- Visual Studio with the "Desktop development with C++" workload
- A standalone CMake on your `PATH`
- Debugging Tools for Windows

For WSL, allocate at least 16GB of memory in `.wslconfig`.

### Build

The recommended way to build is the `./x` tool:

```sh
./x build
```

This produces the debug binary at `./target/debug/oden`. You can also use
cargo directly:

```sh
cargo build
```

To build V8 from source as well (for lower-level V8 development, or on
platforms without prebuilt V8):

```sh
V8_FROM_SOURCE=1 cargo build
```

If the build fails, make sure you are on the latest `main` and try again,
or start clean with `cargo clean && cargo build`.

### Run

```sh
./target/debug/oden run path/to/file.ts

# With permissions:
./target/debug/oden run --allow-net --allow-read script.ts

# REPL:
./target/debug/oden
```

### Test

```sh
# Runtime unit tests (requires a filter argument):
./x test <filter>

# Spec (integration) tests:
./x spec <filter>

# Node.js compatibility tests:
./x node-compat <filter>
```

## Contributing

See `.github/CONTRIBUTING.md` for contribution guidelines.
