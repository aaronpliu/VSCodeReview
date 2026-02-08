# Local Installation Guide

This document explains how to install and use the `@jc-vendor/code-review` package locally during development.

## Methods of Local Installation

### Method 1: Direct Installation from Directory

Install directly from the source directory:

```bash
npm install /path/to/VSCodeReview
```

This creates a symbolic link in your `node_modules` pointing to your development directory, so changes in the source will be reflected immediately.

### Method 2: Using the Generated Tarball

After running `npm pack` in the source directory, you'll get a `.tgz` file that can be installed:

```bash
npm install /path/to/jc-vendor-code-review-1.1.0.tgz
```

This is useful for distributing a stable version without linking to your development directory.

### Method 3: Using npm link (Requires Global Permissions)

First, in the source directory:

```bash
cd /path/to/VSCodeReview
npm link
```

Then, in your target project:

```bash
cd /path/to/your/project
npm link @jc-vendor/code-review
```

Note: This method may require administrator privileges.

## Verifying the Installation

After installation, you can verify the package works:

```javascript
// Test importing the package
const { Reviewer, ApiClient } = require('@jc-vendor/code-review');

// Initialize the API client
const apiClient = new ApiClient('http://localhost:8080', '/api/v1/query');
const reviewer = new Reviewer(apiClient);

// Test CLI functionality
npx @jc-vendor/code-review --help
```

## Running Tests Locally

To run the tests for the package:

```bash
npm test
```

## Building the Package

To compile the TypeScript source to JavaScript:

```bash
npm run build
```

The compiled files will be placed in the `dist/` directory.

## Development Workflow

When developing the package locally:

1. Make changes to the source files in the `src/` directory
2. Run `npm run build` to compile the changes
3. Test in your consuming project
4. Run `npm test` to ensure all tests pass

If you installed using Method 1 (direct directory installation), step 2 may not be necessary as changes are reflected immediately. However, for distribution purposes, you should still run the build command.

## Advanced Configuration

The package supports multiple configuration options:

### Language Configuration
The package reads language support from `languages.json`, which can be customized to include additional file extensions or languages.

### Prompt Templates
The package supports configurable prompt templates via `prompt-templates.json`, allowing you to select different review focuses:
- `security`: Security-focused review
- `best-practices`: Best practices review
- `style`: Style and formatting review
- `performance`: Performance review
- `maintainability`: Maintainability review
- `comprehensive`: Comprehensive review

Use these templates with the `--template` option:
```bash
npx @jc-vendor/code-review --template security
```

### Ticket ID and Additional Information
The package supports providing context for reviews:
```bash
npx @jc-vendor/code-review --ticket-id "PROJ-123" --additional-info "Addresses security vulnerability"
```