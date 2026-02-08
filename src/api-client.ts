import axios, { AxiosInstance } from 'axios';

interface ReviewRequest {
  content: string;
  language: string;
  fileName: string;
}

interface ReviewResponse {
  feedback: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(
    private baseUrl: string,
    private endpoint: string
  ) {
    this.client = axios.create({
      baseURL: `${baseUrl}${endpoint}`,
      timeout: 30000, // 30 seconds timeout
    });
  }

  async sendReviewRequest(content: string, language: string, fileName: string): Promise<ReviewResponse> {
    try {
      const requestData: ReviewRequest = {
        content,
        language,
        fileName
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
}