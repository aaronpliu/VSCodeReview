# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-08

### Added
- Extended language support to 30+ programming languages via configurable JSON
- Configuration file (`languages.json`) for managing supported languages and extensions
- Support for Go, Rust, C#, C++, Ruby, PHP, Dart, Scala, Lua, Perl, Haskell, Elixir, Erlang, Clojure, OCaml, Crystal, Nim, Zig, Solidity, Dockerfile, and SQL
- Extended ignore patterns for better performance

### Changed
- Refactored [Reviewer](file:///Users/aaronliu/Documents/repositories/VSCodeReview/src/reviewer.ts#L28-L210) class to load language configuration dynamically from JSON
- Improved error handling for missing configuration files with graceful fallback
- Enhanced documentation to reflect new configuration system
- Updated package version to 1.1.0

## [1.0.0] - 2026-02-08

### Added
- Initial release of `@jc-vendor/code-review` package
- Multi-language support (JavaScript, TypeScript, Java, Kotlin, Swift, Objective-C, Python, Shell, Groovy)
- Integration with Husky for Git hooks
- RAG API-powered code review capabilities
- Pre-commit hook validation
- Command-line interface for manual reviews
- Non-destructive hook installation (appends to existing hooks instead of replacing them)
- GitHub Actions workflows for testing and publishing