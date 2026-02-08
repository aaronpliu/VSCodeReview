import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import { Minimatch } from 'minimatch';
import { ApiClient } from './api-client';

interface LanguageConfig {
  extensions: string[];
  displayName: string;
}

interface LanguageSupport {
  [language: string]: LanguageConfig;
}

interface ReviewResult {
  fileName: string;
  feedback: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class Reviewer {
  private readonly supportedExtensions: Map<string, string> = new Map(); // extension -> language
  private readonly ignorePatterns: string[];

  constructor(private apiClient: ApiClient) {
    this.loadLanguageConfiguration();
    this.ignorePatterns = this.loadIgnorePatterns();
  }

  private loadLanguageConfiguration(): void {
    try {
      // Try to load from local config first, fall back to embedded config
      const configPath = path.resolve(__dirname, '../languages.json');
      
      // Check if the config file exists before trying to read it
      if (fs.existsSync(configPath)) {
        const configData = fs.readJSONSync(configPath) as { languages: LanguageSupport };
        
        // Build the extension map from the configuration
        for (const [language, config] of Object.entries(configData.languages)) {
          for (const ext of config.extensions) {
            this.supportedExtensions.set(ext, language);
          }
        }
      } else {
        // Fallback to default configuration if file doesn't exist
        this.setupDefaultConfiguration();
      }
    } catch (error) {
      console.error('Failed to load language configuration:', error);
      // Fallback to default configuration if there's an error
      this.setupDefaultConfiguration();
    }
  }

  private setupDefaultConfiguration(): void {
    const fallbackExtensions: { [ext: string]: string } = {
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
    
    Object.entries(fallbackExtensions).forEach(([ext, lang]) => {
      this.supportedExtensions.set(ext, lang);
    });
  }

  private loadIgnorePatterns(): string[] {
    try {
      const configPath = path.resolve(__dirname, '../languages.json');
      
      // Check if the config file exists before trying to read it
      if (fs.existsSync(configPath)) {
        const configData = fs.readJSONSync(configPath) as { ignorePatterns: string[] };
        return configData.ignorePatterns;
      } else {
        // Return default ignore patterns if file doesn't exist
        return this.getDefaultIgnorePatterns();
      }
    } catch (error) {
      console.error('Failed to load ignore patterns:', error);
      // Return default ignore patterns if there's an error
      return this.getDefaultIgnorePatterns();
    }
  }

  private getDefaultIgnorePatterns(): string[] {
    return [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.js',
      '**/coverage/**',
      '**/.nyc_output/**'
    ];
  }

  async reviewDirectory(dirPath: string): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];
    
    // Find all supported files in the directory
    const allFiles = Array.from(this.supportedExtensions.keys()).flatMap(ext => 
      glob.sync(path.join(dirPath, `**/*${ext}`).replace(/\\/g, '/'), { 
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
      const language = this.supportedExtensions.get(ext);
      
      if (!language) {
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
      const language = this.supportedExtensions.get(ext);

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