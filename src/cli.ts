#!/usr/bin/env node

import { Command } from 'commander';
import { Reviewer } from './reviewer';
import { ApiClient } from './api-client';
import { HuskyIntegration } from './husky-integration';
import path from 'path';

const program = new Command();

program
  .name('@jc-vendor/code-review')
  .description('CLI tool for code review using RAG API')
  .version('1.0.0');

program
  .command('review')
  .description('Review files or directories')
  .option('-p, --path <path>', 'path to review (defaults to current directory)', '.')
  .option('-e, --endpoint <endpoint>', 'RAG API endpoint', '/api/v1/query')
  .option('-h, --host <host>', 'API host', 'http://localhost:8080')
  .option('-f, --files <files...>', 'specific files to review')
  .action(async (options) => {
    const apiClient = new ApiClient(options.host, options.endpoint);
    const reviewer = new Reviewer(apiClient);

    try {
      if (options.files && options.files.length > 0) {
        await reviewer.reviewFiles(options.files);
      } else {
        await reviewer.reviewDirectory(options.path);
      }
      console.log('Code review completed successfully!');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during code review:', error.message);
      } else {
        console.error('Unknown error during code review:', String(error));
      }
      process.exit(1);
    }
  });

program
  .command('install-hook')
  .description('Install pre-commit hook for Husky')
  .option('-e, --endpoint <endpoint>', 'RAG API endpoint', '/api/v1/query')
  .option('-h, --host <host>', 'API host', 'http://localhost:8080')
  .action(async (options) => {
    try {
      const apiClient = new ApiClient(options.host, options.endpoint);
      const huskyIntegration = new HuskyIntegration(apiClient);
      const repoPath = process.cwd();
      huskyIntegration.installPreCommitHook(repoPath);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error installing hook:', error.message);
      } else {
        console.error('Unknown error installing hook:', String(error));
      }
      process.exit(1);
    }
  });

program
  .command('pre-commit')
  .description('Run code review on staged files (for use in pre-commit hook)')
  .option('-e, --endpoint <endpoint>', 'RAG API endpoint', '/api/v1/query')
  .option('-h, --host <host>', 'API host', 'http://localhost:8080')
  .action(async (options) => {
    try {
      const apiClient = new ApiClient(options.host, options.endpoint);
      const huskyIntegration = new HuskyIntegration(apiClient);
      const success = await huskyIntegration.runPreCommitReview();
      if (!success) {
        process.exit(1);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during pre-commit review:', error.message);
      } else {
        console.error('Unknown error during pre-commit review:', String(error));
      }
      process.exit(1);
    }
  });

program.parse(process.argv);