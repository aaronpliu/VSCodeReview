import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { Reviewer } from './reviewer';
import { ApiClient } from './api-client';

export class HuskyIntegration {
  private template: string;
  private host: string;
  private endpoint: string;

  constructor(
    private apiClient: ApiClient, 
    template: string = 'security',
    host: string = 'http://localhost:8080',
    endpoint: string = '/api/v1/query'
  ) {
    this.template = template;
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
      
      // Extract ticketId and additionalInfo from the commit message
      const { ticketId, additionalInfo } = await this.extractCommitContext();
      
      const reviewer = new Reviewer(this.apiClient, this.template, ticketId, additionalInfo);
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
   * Extracts ticketId and additionalInfo from the commit message
   */
  private async extractCommitContext(): Promise<{ ticketId?: string; additionalInfo?: string }> {
    try {
      // For pre-commit hook, we need to get the commit message differently
      // Husky sets GIT_PARAMS which points to the temp file containing the commit message
      const gitParams = process.env.HUSKY_GIT_PARAMS;
      
      if (gitParams) {
        // If we have git params, read the commit message file
        const commitMessage = fs.readFileSync(gitParams, 'utf-8').trim();
        return this.parseCommitMessage(commitMessage);
      } else {
        // Fallback: try to get the last commit message (useful for testing)
        try {
          const lastCommitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
          return this.parseCommitMessage(lastCommitMessage);
        } catch (e) {
          console.warn('Could not retrieve commit message, proceeding without context');
          return { ticketId: undefined, additionalInfo: undefined };
        }
      }
    } catch (error) {
      console.error('Error extracting commit context:', error);
      return { ticketId: undefined, additionalInfo: undefined };
    }
  }

  /**
   * Parse the commit message to extract ticketId and additional info
   */
  private parseCommitMessage(message: string): { ticketId?: string; additionalInfo?: string } {
    // Extract ticket ID using regex patterns
    const ticketIdMatch = message.match(/([A-Z0-9]+-\d+)/); // Matches PROJ-123 format
    const hashTicketIdMatch = message.match(/#(\d+)/); // Matches #123 format
    
    let ticketId: string | undefined;
    if (ticketIdMatch) {
      ticketId = ticketIdMatch[0];
    } else if (hashTicketIdMatch) {
      ticketId = `#${hashTicketIdMatch[1]}`;
    }
    
    // Use the full message as additional info if it's not just a ticket ID
    let additionalInfo: string | undefined;
    if (message) {
      // Remove the ticket ID from the message to avoid duplication
      let cleanedMessage = message;
      if (ticketIdMatch) {
        cleanedMessage = cleanedMessage.replace(ticketIdMatch[0], '').trim();
      } else if (hashTicketIdMatch) {
        cleanedMessage = cleanedMessage.replace(`#${hashTicketIdMatch[1]}`, '').trim();
      }
      
      if (cleanedMessage) {
        additionalInfo = cleanedMessage;
      }
    }
    
    return { ticketId, additionalInfo };
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
    
    // Create the code review command with all parameters except ticketId and additionalInfo
    let codeReviewCommand = `npx @jc-vendor/code-review pre-commit --host ${this.host} --endpoint ${this.endpoint} --template ${this.template}`;
    
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