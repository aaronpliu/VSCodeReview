import axios, { AxiosInstance } from 'axios';
import fs from 'fs-extra';
import path from 'path';
import * as jsYaml from 'js-yaml';

interface ReviewRequest {
  query: string;
  stream: boolean;
  context: Array<{ [key: string]: any }>;
}

interface ReviewResponse {
  feedback: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PromptTemplate {
  name: string;
  prompt: string;
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
}

interface PromptTemplatesConfig {
  defaultTemplate: string;
  templates: {
    [key: string]: PromptTemplate;
  };
}

export class ApiClient {
  private client: AxiosInstance;
  private promptTemplates: PromptTemplatesConfig | null = null;

  constructor(
    private baseUrl: string,
    private endpoint: string,
    private defaultPromptTemplate: string = 'security'
  ) {
    this.client = axios.create({
      baseURL: `${baseUrl}${endpoint}`,
      timeout: 120000, // 120 seconds timeout
    });
    
    this.loadPromptTemplates();
  }

  private loadPromptTemplates(): void {
    try {
      // Only look for YAML configuration files
      const configPath = path.resolve(__dirname, '../prompt-templates.yaml');
      
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        this.promptTemplates = jsYaml.load(fileContent) as PromptTemplatesConfig;
      } else {
        console.warn('Prompt templates configuration not found, using default template');
      }
    } catch (error) {
      console.error('Failed to load prompt templates:', error);
      // We'll use default templates if loading fails
    }
  }

  async sendReviewRequest(
    content: string, 
    language: string, 
    fileName: string,
    templateName?: string,
    ticketId?: string,
    additionalInfo?: string,
    diffContent?: string
  ): Promise<ReviewResponse> {
    try {
      // Select the appropriate template
      const templateKey = templateName || this.defaultPromptTemplate;
      const template = this.getTemplate(templateKey);
      
      if (!template) {
        throw new Error(`Template '${templateName}' not found`);
      }

      // Construct the query based on the selected template
      let query = `${template.prompt}\n\nLanguage: ${language}\nFile: ${fileName}\nCode:\n${content}`;
      
      // Add diff content if provided
      if (diffContent && diffContent.trim()) {
        query += `\n\nGit Diff:\n${diffContent}`;
      }
      
      // Add ticket ID if provided
      if (ticketId) {
        query += `\nTicket ID: ${ticketId}`;
      }
      
      // Add additional info if provided
      if (additionalInfo) {
        query += `\nAdditional Context: ${additionalInfo}`;
      }
      
      const requestData: ReviewRequest = {
        query,
        stream: false,
        context: [{
          "additionalProp1": {
            "fileName": fileName,
            "language": language,
            "template": templateKey,
            "hasDiff": !!diffContent,
            ...(ticketId && { ticketId }),
            ...(additionalInfo && { additionalInfo }),
            ...(diffContent && { diffProvided: true })
          }
        }]
      };

      const response = await this.client.post<ReviewResponse>('', requestData);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
  
  private getTemplate(name: string): PromptTemplate | null {
    if (!this.promptTemplates) {
      // Return a default template if config couldn't be loaded
      return {
        name: 'Default Security Review',
        prompt: 'Analyze the following code for potential security vulnerabilities, injection attacks, authentication/authorization issues, and data protection concerns. Provide feedback on secure coding practices and recommend specific fixes for any security issues found.',
        severityThreshold: 'high'
      };
    }
    
    return this.promptTemplates.templates[name] || null;
  }
  
  getAvailableTemplates(): string[] {
    if (!this.promptTemplates) {
      return ['security']; // default if config not available
    }
    return Object.keys(this.promptTemplates.templates);
  }
}