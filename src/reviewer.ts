import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import { Minimatch } from 'minimatch';
import { ApiClient } from './api-client';

interface ReviewResult {
  fileName: string;
  feedback: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class Reviewer {
  // Supported file extensions mapped to language names
  private readonly supportedExtensions: { [ext: string]: string } = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.groovy': 'groovy',
    '.kt': 'kotlin',
    '.swift': 'swift',
    '.m': 'objective-c',
    '.sh': 'shell',
    '.py': 'python'
  };

  // Files to ignore during review
  private readonly ignorePatterns = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.min.js',
    '**/coverage/**',
    '**/.nyc_output/**'
  ];

  constructor(private apiClient: ApiClient) {}

  async reviewDirectory(dirPath: string): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];
    
    // Find all supported files in the directory
    const supportedPatterns = Object.keys(this.supportedExtensions).map(ext => `**/*${ext}`);
    const allFiles = supportedPatterns.flatMap(pattern => 
      glob.sync(path.join(dirPath, pattern).replace(/\\/g, '/'), { 
        ignore: this.ignorePatterns 
      })
    );

    for (const filePath of allFiles) {
      const result = await this.reviewFile(filePath);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  async reviewFiles(filePaths: string[]): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];

    for (const filePath of filePaths) {
      // Skip if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.warn(`File does not exist: ${filePath}`);
        continue;
      }

      // Check if file extension is supported
      const ext = path.extname(filePath);
      if (!this.supportedExtensions[ext]) {
        console.warn(`Unsupported file type: ${filePath} (${ext})`);
        continue;
      }

      // Skip ignored patterns
      const isIgnored = this.ignorePatterns.some(pattern => {
        const mm = new Minimatch(pattern);
        return mm.match(filePath);
      });
      
      if (isIgnored) {
        console.warn(`Ignoring file due to pattern: ${filePath}`);
        continue;
      }

      const result = await this.reviewFile(filePath);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  private async reviewFile(filePath: string): Promise<ReviewResult | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ext = path.extname(filePath);
      const language = this.supportedExtensions[ext];

      if (!language) {
        console.warn(`Unsupported file extension: ${ext}`);
        return null;
      }

      console.log(`Reviewing file: ${filePath} (${language})`);

      const review = await this.apiClient.sendReviewRequest(
        content,
        language,
        path.basename(filePath)
      );

      return {
        fileName: filePath,
        feedback: review.feedback,
        suggestions: review.suggestions,
        severity: review.severity
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error reviewing file ${filePath}:`, error.message);
      } else {
        console.error(`Unknown error reviewing file ${filePath}:`, String(error));
      }
      return null;
    }
  }

  async printReviewResults(results: ReviewResult[]): Promise<void> {
    for (const result of results) {
      console.log(`\n--- Review for: ${result.fileName} ---`);
      console.log(`Severity: ${result.severity.toUpperCase()}`);
      console.log(`Feedback:\n${result.feedback}`);
      
      if (result.suggestions.length > 0) {
        console.log('\nSuggestions:');
        result.suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      }
      console.log('--- End of review ---\n');
    }
  }
}