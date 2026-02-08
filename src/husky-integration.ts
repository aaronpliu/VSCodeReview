import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { Reviewer } from './reviewer';
import { ApiClient } from './api-client';

export class HuskyIntegration {
  private template: string;
  private ticketId?: string;
  private additionalInfo?: string;
  private host: string;
  private endpoint: string;

  constructor(
    private apiClient: ApiClient, 
    template: string = 'security',
    ticketId?: string,
    additionalInfo?: string,
    host: string = 'http://localhost:8080',
    endpoint: string = '/api/v1/query'
  ) {
    this.template = template;
    this.ticketId = ticketId;
    this.additionalInfo = additionalInfo;
    this.host = host;
    this.endpoint = endpoint;
  }

  /**
   * Runs code review on staged files before committing
   */
  async runPreCommitReview(): Promise<boolean> {
    try {
      // Get the list of staged files
      const stagedFiles = this.getStagedFiles();
      
      if (stagedFiles.length === 0) {
        console.log('No staged files to review.');
        return true;
      }

      console.log(`Found ${stagedFiles.length} staged files to review.`);
      
      const reviewer = new Reviewer(this.apiClient, this.template, this.ticketId, this.additionalInfo);
      const results = await reviewer.reviewFiles(stagedFiles);
      
      // Print results
      await reviewer.printReviewResults(results);
      
      // Determine if any high/critical severity issues were found
      const hasCriticalIssues = results.some(result => 
        result.severity === 'high' || result.severity === 'critical'
      );
      
      if (hasCriticalIssues) {
        console.log('Critical or high severity issues found. Commit blocked.');
        return false;
      }
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during pre-commit review:', error.message);
      } else {
        console.error('Unknown error during pre-commit review:', String(error));
      }
      return false;
    }
  }

  /**
   * Gets the list of staged files in the git repository
   */
  private getStagedFiles(): string[] {
    try {
      // Get the list of staged files using git command
      const stagedOutput = execSync('git diff --cached --name-only --diff-filter=ACMR', { 
        encoding: 'utf-8' 
      });
      
      if (!stagedOutput.trim()) {
        return [];
      }
      
      // Split the output into individual file paths
      const stagedFiles = stagedOutput
        .trim()
        .split('\n')
        .map(file => file.trim())
        .filter(file => file.length > 0);
      
      return stagedFiles;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting staged files:', error.message);
      } else {
        console.error('Unknown error getting staged files:', String(error));
      }
      return [];
    }
  }

  /**
   * Installs the pre-commit hook in the current repository, appending to existing hooks
   */
  installPreCommitHook(repoPath: string): void {
    const huskyDir = path.join(repoPath, '.husky');
    const preCommitPath = path.join(huskyDir, 'pre-commit');
    
    // Create .husky directory if it doesn't exist
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }
    
    // Read the existing pre-commit hook if it exists
    let existingHookContent = '';
    if (fs.existsSync(preCommitPath)) {
      existingHookContent = fs.readFileSync(preCommitPath, 'utf-8');
    }
    
    // Create the code review command with all parameters
    let codeReviewCommand = `npx @jc-vendor/code-review pre-commit --host ${this.host} --endpoint ${this.endpoint} --template ${this.template}`;
    
    // Add ticket ID if provided
    if (this.ticketId) {
      codeReviewCommand += ` --ticket-id ${this.ticketId}`;
    }
    
    // Add additional info if provided
    if (this.additionalInfo) {
      // Escape the additional info for shell
      const escapedInfo = this.additionalInfo.replace(/'/g, "'\\''");
      codeReviewCommand += ` --additional-info '${escapedInfo}'`;
    }
    
    codeReviewCommand += '\n';
    
    // Check if the command is already in the hook to prevent duplicates
    if (existingHookContent.includes(codeReviewCommand.trim())) {
      console.log('Pre-commit hook already contains code review command.');
      return;
    }
    
    // Combine the existing hook with the new command
    let newHookContent = '';
    if (existingHookContent) {
      // Append the code review command to the existing hook
      newHookContent = existingHookContent;
      
      // Ensure there's a newline at the end if needed
      if (!existingHookContent.endsWith('\n')) {
        newHookContent += '\n';
      }
      
      newHookContent += codeReviewCommand;
    } else {
      // Create a new hook with the code review command and husky header
      newHookContent = `#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

${codeReviewCommand}`;
    }
    
    // Write the combined hook to the file
    fs.writeFileSync(preCommitPath, newHookContent, { mode: 0o755 });
    
    console.log('Pre-commit hook updated successfully with code review command!');
  }
}