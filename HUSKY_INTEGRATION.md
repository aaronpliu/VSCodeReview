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

## How It Works

When you attempt to commit changes:

1. The pre-commit hook triggers the code review process
2. The system identifies all staged files that are supported for review
3. Each supported file is sent to your RAG API for analysis
4. The API response includes feedback, suggestions, and severity ratings
5. If any high or critical severity issues are detected, the commit is blocked
6. Otherwise, the commit proceeds normally

## Supported File Types

The code review tool supports the following file types:
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Java (`.java`)
- Kotlin (`.kt`)
- Swift (`.swift`)
- Objective-C (`.m`)
- Python (`.py`)
- Shell scripts (`.sh`)
- Groovy (`.groovy`)

## Configuration

The tool uses the following defaults:
- API Host: `http://localhost:8080`
- API Endpoint: `/api/v1/query`

You can customize these by setting environment variables or passing options to the CLI.

## Troubleshooting

If the pre-commit hook doesn't seem to be working:

1. Ensure Husky is properly installed and initialized
2. Verify that the `.husky/pre-commit` file exists and contains the code review command
3. Make sure the `@jc-vendor/code-review` package is installed in your project
4. Check that your RAG API is running and accessible at the configured endpoint