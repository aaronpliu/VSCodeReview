# Quick Reference Guide

## CLI Commands

### Install Husky Hook
```bash
npx code-review install-hook --template security --host http://localhost:8080 --endpoint /api/v1/query
```

### Run Pre-commit Review
```bash
npx code-review pre-commit --template security --host http://localhost:8080 --endpoint /api/v1/query
```

### List Available Templates
```bash
npx code-review list-templates
```

## Available Templates

- `security`: Security-focused code review
- `best-practices`: Best practices review
- `style`: Style and formatting review
- `performance`: Performance review
- `maintainability`: Maintainability review
- `comprehensive`: Comprehensive review

## Configuration Files

- `languages.yaml`: Language support configuration
- `prompt-templates.yaml`: Prompt template configuration

## Environment Variables

- `CODE_REVIEW_TEMPLATE`: Set default template (e.g., `security`)