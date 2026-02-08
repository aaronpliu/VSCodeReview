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
  .version('1.1.0');

program
  .command('review')
  .description('Review files or directories')
  .option('-p, --path <path>', 'path to review (defaults to current directory)', '.')
  .option('-e, --endpoint <endpoint>', 'RAG API endpoint', '/api/v1/query')
  .option('-h, --host <host>', 'API host', 'http://localhost:8080')
  .option('-f, --files <files...>', 'specific files to review')
  .option('-t, --template <template>', 'prompt template to use', 'security')
  .option('--ticket-id <ticketId>', 'associated ticket ID for the review')
  .option('--additional-info <info>', 'additional context for the review')
  .action(async (options) => {
    const apiClient = new ApiClient(options.host, options.endpoint, options.template);
    const reviewer = new Reviewer(apiClient, options.template, options.ticketId, options.additionalInfo);

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
  .option('-t, --template <template>', 'prompt template to use', 'security')
  .action(async (options) => {
    try {
      const apiClient = new ApiClient(options.host, options.endpoint, options.template);
      const huskyIntegration = new HuskyIntegration(
        apiClient, 
        options.template, 
        options.host,
        options.endpoint
      );
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
  .option('-t, --template <template>', 'prompt template to use', 'security')
  .action(async (options) => {
    try {
      const apiClient = new ApiClient(options.host, options.endpoint, options.template);
      const huskyIntegration = new HuskyIntegration(
        apiClient, 
        options.template,
        options.host,
        options.endpoint
      );
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

program
  .command('list-templates')
  .description('List available prompt templates')
  .option('-e, --endpoint <endpoint>', 'RAG API endpoint', '/api/v1/query')
  .option('-h, --host <host>', 'API host', 'http://localhost:8080')
  .action(async (options) => {
    try {
      const apiClient = new ApiClient(options.host, options.endpoint);
      const templates = apiClient.getAvailableTemplates();
      
      console.log('Available prompt templates:');
      templates.forEach(template => {
        console.log(`- ${template}`);
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error listing templates:', error.message);
      } else {
        console.error('Unknown error listing templates:', String(error));
      }
      process.exit(1);
    }
  });

program.parse(process.argv);