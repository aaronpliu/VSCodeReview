# Code Review Package

A comprehensive code review tool that integrates with Git hooks via Husky and leverages a RAG API for intelligent code analysis. Supports multiple programming languages including JavaScript, TypeScript, Java, Kotlin, Swift, Python, and more.

## Features

- Multi-language support (JavaScript, TypeScript, Java, Kotlin, Swift, Objective-C, Python, Shell, Groovy and many more)
- Integration with Husky for Git hooks
- RAG API-powered code review capabilities
- Pre-commit hook validation
- Command-line interface for manual reviews
- Non-destructive hook installation (appends to existing hooks instead of replacing them)
- Configurable language support via JSON configuration

## Installation

```bash
npm install @jc-vendor/code-review
```

## Usage

### Command Line Interface

```bash
# Review all files in the current directory
npx @jc-vendor/code-review

# Review specific files
npx @jc-vendor/code-review --files src/file1.js src/file2.ts

# Review a specific directory
npx @jc-vendor/code-review --path ./src

# Specify custom API endpoint and host
npx @jc-vendor/code-review --host http://your-rag-api.com --endpoint /api/v1/query
```

### With Husky Integration

To automatically run code reviews before commits:

1. Install Husky:
```bash
npm install --save-dev husky
```

2. Enable Git hooks:
```bash
npx husky install
```

3. Install the pre-commit hook:
```bash
npx @jc-vendor/code-review --install-hook
```

> **Note:** If your project already has a pre-commit hook configured, the `--install-hook` command will append the code review command to the existing hook instead of replacing it. The command checks for duplicates to prevent multiple insertions.

## Configuration

### Language Support Configuration

The package supports configurable language detection via the `languages.json` file. This file defines which file extensions map to which programming languages. You can modify this file to add or remove language support according to your project needs.

The current configuration supports:
- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Java (.java)
- Kotlin (.kt, .kts)
- Swift (.swift)
- Objective-C (.m, .mm)
- Python (.py, .pyi)
- Shell scripts (.sh, .bash, .zsh)
- Groovy (.groovy, .gvy, .gradle)
- Go (.go)
- Rust (.rs)
- C# (.cs)
- C++ (.cpp, .cxx, .cc, .c++, .hpp, .hxx, .hh, .h++)
- Ruby (.rb, .rbw)
- PHP (.php, .php3, .php4, .php5, .phtml)
- Dart (.dart)
- Scala (.scala, .sc)
- Lua (.lua)
- Perl (.pl, .pm, .pod, .t, .plx)
- Haskell (.hs, .lhs)
- Elixir (.ex, .exs)
- Erlang (.erl, .hrl)
- Clojure (.clj, .cljs, .cljc, .edn)
- OCaml (.ml, .mli)
- Crystal (.cr)
- Nim (.nim)
- Zig (.zig)
- Solidity (.sol)
- Dockerfile (.dockerfile, Dockerfile)
- SQL (.sql)

### API Configuration

The package connects to your RAG API with the following defaults:
- Endpoint: `/api/v1/query`
- Host: `http://localhost:8080`

These can be customized via CLI flags or environment variables.

## Supported Languages

See the "Language Support Configuration" section above for a complete list of supported languages and file extensions.

## API Integration

This package communicates with your RAG API via the `/api/v1/query` endpoint. The API should expect a POST request with the following JSON structure:

```json
{
  "content": "file content as string",
  "language": "language identifier",
  "fileName": "name of the file"
}
```

And respond with:

```json
{
  "feedback": "review feedback",
  "suggestions": ["list", "of", "suggestions"],
  "severity": "low|medium|high|critical"
}
```

## License

MIT