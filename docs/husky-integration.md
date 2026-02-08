# Husky Integration Guide

This package provides seamless integration with [Husky](https://typicode.github.io/husky/) to enable automatic code reviews during Git commit operations.

## Installation

### 1. Install Husky

First, make sure you have Husky installed in your project:

```bash
npm install --save-dev husky
```

### 2. Enable Git Hooks

Enable Git hooks with Husky:

```bash
npx husky install
```

### 3. Install the Pre-commit Hook

Install the pre-commit hook for code review:

```bash
npx @jc-vendor/code-review install-hook
```

> **Note:** If your project already has a pre-commit hook configured, the `install-hook` command will append the code review command to the existing hook instead of replacing it. The command checks for duplicates to prevent multiple insertions.

Alternatively, you can manually add the hook to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx @jc-vendor/code-review pre-commit"
    }
  }
}
```

### Using Different Review Templates

You can specify which review template to use during installation:

```bash
# Use security-focused template (default)
npx @jc-vendor/code-review install-hook --template security

# Use performance-focused template
npx @jc-vendor/code-review install-hook --template performance

# Use comprehensive template
npx @jc-vendor/code-review install-hook --template comprehensive
```

## How It Works

When you attempt to commit changes:

1. The pre-commit hook triggers the code review process
2. The system identifies all staged files that are supported for review
3. Each supported file is sent to your RAG API for analysis with the selected template
4. The API response includes feedback, suggestions, and severity ratings
5. If any high or critical severity issues are detected, the commit is blocked
6. Otherwise, the commit proceeds normally

## Supported File Types

The code review tool supports the following file types (and more, see `languages.json` for complete list):
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Java (`.java`)
- Kotlin (`.kt`, `.kts`)
- Swift (`.swift`)
- Objective-C (`.m`, `.mm`)
- Python (`.py`, `.pyi`)
- Shell scripts (`.sh`, `.bash`, `.zsh`)
- Groovy (`.groovy`, `.gvy`, `.gradle`)
- Go (`.go`)
- Rust (`.rs`)
- C# (`.cs`)
- C++ (`.cpp`, `.cxx`, .cc`, `.c++`, `.hpp`, `.hxx`, `.hh`, `.h++`)
- Ruby (`.rb`, `.rbw`)
- PHP (`.php`, `.php3`, `.php4`, `.php5`, `.phtml`)
- And many more...

## Configuration Options

### Selecting a Review Template

You can choose from multiple review templates:

- `security`: Focuses on potential security vulnerabilities, injection attacks, authentication/authorization issues
- `best-practices`: Reviews for adherence to language-specific best practices and design patterns
- `style`: Evaluates code for consistency in formatting, naming conventions, and style
- `performance`: Analyzes code for performance bottlenecks and optimization opportunities
- `maintainability`: Assesses code for maintainability factors such as modularity and documentation
- `comprehensive`: Performs a thorough review covering all aspects

### Providing Context Information

You can provide additional context for the review:

```bash
# Include ticket ID and additional information
npx @jc-vendor/code-review install-hook --template security --ticket-id "PROJ-123" --additional-info "Fixes security vulnerability"
```

### API Configuration

The tool uses the following defaults:
- API Host: `http://localhost:8080`
- API Endpoint: `/api/v1/query`

You can customize these by using the `--host` and `--endpoint` options:

```bash
npx @jc-vendor/code-review install-hook --host http://your-rag-api.com --endpoint /api/v1/query --template security
```

## Troubleshooting

If the pre-commit hook doesn't seem to be working:

1. Ensure Husky is properly installed and initialized
2. Verify that the `.husky/pre-commit` file exists and contains the code review command
3. Make sure the `@jc-vendor/code-review` package is installed in your project
4. Check that your RAG API is running and accessible at the configured endpoint
5. Run `npx @jc-vendor/code-review list-templates` to verify available templates
6. Check that the staged files have extensions supported by the package