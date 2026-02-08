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
- Multiple code review templates for different purposes (security, best practices, style, performance, etc.)

## Installation

```bash
npm install @jc-vendor/code-review
```

## Usage

### Command Line Interface

```bash
# Review all files in the current directory with security-focused template (default)
npx @jc-vendor/code-review

# Review specific files with a specific template
npx @jc-vendor/code-review --files src/file1.js src/file2.ts --template best-practices

# Review a specific directory with performance-focused template
npx @jc-vendor/code-review --path ./src --template performance

# List available templates
npx @jc-vendor/code-review list-templates

# Specify custom API endpoint and host
npx @jc-vendor/code-review --host http://your-rag-api.com --endpoint /api/v1/query --template comprehensive
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

3. Install the pre-commit hook with a specific template:
```bash
npx @jc-vendor/code-review --install-hook --template security
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

### Prompt Template Configuration

The package supports multiple code review templates for different purposes:

- **security**: Focuses on identifying potential security vulnerabilities, injection attacks, authentication/authorization issues, and data protection concerns
- **best-practices**: Reviews for adherence to language-specific best practices, design patterns, maintainability, readability, and performance
- **style**: Evaluates code for consistency in formatting, naming conventions, indentation, and overall code style
- **performance**: Analyzes code for performance bottlenecks, inefficient algorithms, memory usage, and optimization opportunities
- **maintainability**: Assesses code for maintainability factors such as modularity, complexity, documentation, and ease of modification
- **comprehensive**: Performs a thorough review covering security, best practices, performance, maintainability, style, and potential bugs

You can customize these templates by modifying the `prompt-templates.json` file.

### API Configuration

The package connects to your RAG API with the following defaults:
- Endpoint: `/api/v1/query`
- Host: `http://localhost:8080`

These can be customized via CLI flags or environment variables.

## Optimized Local Development Workflow

The package is optimized for local development with minimal human intervention:

### 1. One-time Setup
```bash
# Install husky and the code review package
npm install --save-dev husky @jc-vendor/code-review

# Enable husky
npx husky install

# Install the pre-commit hook with default security template
npx @jc-vendor/code-review install-hook --template security
```

### 2. Daily Development Flow
```bash
# Developer makes changes
# Edit files...

# Stage changes
git add .

# Commit (triggers pre-commit hook automatically)
git commit -m "Fix user login issue #123"
# <-- At this point, code review happens automatically!

# Push changes
git push origin main
```

## Workflow Diagram

```mermaid
graph TD
    A[Developer modifies code] --> B[Stage changes with git add]
    B --> C[Husky triggers pre-commit hook]
    C --> D[Code Review Package runs]
    D --> E[Extract staged files]
    E --> F[Load language config and prompt template]
    F --> G[Read file content]
    G --> H[Build API request with context]
    H --> I[RAG API receives request]
    I --> J[Process with LLM]
    J --> K[Return review feedback]
    K --> L[Parse feedback]
    L --> M{Severity check<br/>High/Critical?}
    M -->|Yes| N[Block commit and show feedback]
    M -->|No| O[Allow commit to proceed]
    O --> P[Complete git commit]
    N --> Q[Developer fixes issues]
    Q --> B
    
    style A fill:#e1f5fe
    style P fill:#e8f5e8
    style N fill:#ffebee
    style Q fill:#fff3e0
```

## Supported Languages

See the "Language Support Configuration" section above for a complete list of supported languages and file extensions.

## API Integration

This package communicates with your RAG API via the `/api/v1/query` endpoint. The API should expect a POST request with the following JSON structure:

```json
{
  "query": "string",
  "stream": false,
  "context": [
    {
      "additionalProp1": {
        "fileName": "string",
        "language": "string",
        "template": "string"
      }
    }
  ]
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