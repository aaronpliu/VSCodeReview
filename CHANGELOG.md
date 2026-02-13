# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.3] - 2026-02-13

### Fixed
- Corrected API response handling to properly process array responses from RAG service
- Implemented proper validation of API response structure according to specification
- Enhanced response parsing to handle both single-object and array responses

### Changed
- Updated reviewer.ts to explicitly handle array response format as per RAG API specification
- Added explicit checking for required response fields (fileName, feedback, suggestions, severity)
- Improved error handling for malformed API responses

## [1.1.2] - 2026-02-09

### Added
- Git diff information included in API requests for more contextual code reviews
- Enhanced Reviewer and ApiClient to handle diff content alongside full file content

### Changed
- Modified reviewFile method to capture git diff using `git diff --cached` for each staged file
- Updated API client to incorporate diff content in the query string with clear labeling
- Maintained backward compatibility by making diff content optional

## [1.1.1] - 2026-02-08

### Added
- New YAML configuration support for both languages.yaml and prompt-templates.yaml
- Enhanced prompts with more detailed instructions for all template categories
- Standardized documentation in docs/ directory

### Changed
- Optimized configuration loading to only use YAML files (removed JSON fallback)
- Updated all configuration loading logic to exclusively use YAML format
- Improved documentation structure following standardized format
- Refactored code to improve maintainability

### Fixed
- Fixed fs-extra usage in configuration loading
- Resolved issues with async/await in configuration loading

## [1.1.0] - 2026-02-08

### Added
- Multiple code review templates (security, best-practices, style, performance, maintainability, comprehensive)
- Husky integration for pre-commit hooks
- Automated context extraction from commit messages
- Multi-language support with configurable language detection

### Changed
- Improved error handling and fallback mechanisms
- Enhanced API client with better error reporting

## [1.0.0] - 2026-02-08

### Added
- Initial release of the code review package
- Basic code review functionality
- Command-line interface
- Integration with RAG API