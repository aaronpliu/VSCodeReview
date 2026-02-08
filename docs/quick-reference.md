# Quick Reference Guide

## Installation

```bash
# Install the package
npm install @jc-vendor/code-review

# Install husky if not already installed
npm install --save-dev husky
```

## Basic Usage

```bash
# Enable husky
npx husky install

# Install the pre-commit hook with default security template
npx @jc-vendor/code-review install-hook --template security

# Run manual review
npx @jc-vendor/code-review

# List available templates
npx @jc-vendor/code-review list-templates
```

## Command Options

### Common Options
- `-t, --template <template>` - Prompt template to use (default: security)
- `--ticket-id <ticketId>` - Associated ticket ID for the review
- `--additional-info <info>` - Additional context for the review
- `-e, --endpoint <endpoint>` - RAG API endpoint (default: /api/v1/query)
- `-h, --host <host>` - API host (default: http://localhost:8080)

### Commands
- `review` - Review files or directories
- `install-hook` - Install pre-commit hook for Husky
- `pre-commit` - Run code review on staged files
- `list-templates` - List available prompt templates

## Available Templates

- `security` - Security-focused review
- `best-practices` - Best practices review
- `style` - Style and formatting review
- `performance` - Performance review
- `maintainability` - Maintainability review
- `comprehensive` - Comprehensive review

## Environment Variables

- `CODE_REVIEW_TEMPLATE` - Default template to use
- `AUTO_EXTRACT_TICKET_ID` - Enable/disable automatic ticket ID extraction (default: true)

## Supported Languages

The package supports over 30 programming languages including:
- JavaScript, TypeScript
- Java, Kotlin
- Swift, Objective-C
- Python, Ruby, PHP
- Go, Rust, C#
- And many more (see languages.json for full list)