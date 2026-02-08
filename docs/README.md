# Code Review Package

A comprehensive code review tool supporting multiple languages that integrates with husky hooks.

## Features

- Multi-language support with configurable language detection
- Integration with husky pre-commit hooks
- Configurable review templates
- YAML configuration support

## Installation

```bash
npm install @jc-vendor/code-review
```

## Usage

### Setting Up Husky

First, make sure you have Husky installed and initialized in your project:

```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky (replaces deprecated 'husky install')
npx husky init
```

### CLI Commands

#### Install Husky Hook
```bash
npx code-review install-hook --template security --host http://localhost:8080 --endpoint /api/v1/query
```

#### Run Pre-commit Review
```bash
npx code-review pre-commit --template security --host http://localhost:8080 --endpoint /api/v1/query
```

#### List Available Templates
```bash
npx code-review list-templates
```

### Configuration

The package supports configuration via external YAML files:

- `languages.yaml`: Defines supported file extensions and languages
- `prompt-templates.yaml`: Defines available review templates

#### Example languages.yaml:
```yaml
languages:
  javascript:
    extensions:
      - ".js"
      - ".jsx"
    displayName: "JavaScript"
  typescript:
    extensions:
      - ".ts"
      - ".tsx"
    displayName: "TypeScript"
  python:
    extensions:
      - ".py"
    displayName: "Python"
ignorePatterns:
  - "**/node_modules/**"
  - "**/.git/**"
  - "**/dist/**"
  - "**/build/**"
  - "**/*.min.js"
```

#### Template Selection

Choose from various review templates:

- `security`: Focuses on security vulnerabilities
- `best-practices`: Reviews for language-specific best practices
- `style`: Evaluates code style and formatting
- `performance`: Analyzes performance considerations
- `maintainability`: Assesses code maintainability
- `comprehensive`: Full code review covering all aspects

Select a template with the `--template` option or set the `CODE_REVIEW_TEMPLATE` environment variable.

## API Integration

The package connects to your RAG API with configurable host and endpoint settings. The default configuration assumes a service running at `http://localhost:8080/api/v1/query`.

## Husky Integration

The package provides seamless integration with Husky to run code reviews as pre-commit hooks. The `install-hook` command adds the appropriate script to your `.husky/pre-commit` file.

## Automated Context Extraction

The package can automatically extract context from Git commit messages:

- Ticket IDs: Extracted using patterns like `#123`, `PROJ-123`
- Additional context: Full commit message is included as additional context

## License

MIT