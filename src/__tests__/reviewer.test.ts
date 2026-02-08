import { Reviewer } from '../reviewer';
import { ApiClient } from '../api-client';
import fs from 'fs-extra';

// Mock the API client
const mockSendReviewRequest = jest.fn();
const mockApiClient = {
  sendReviewRequest: mockSendReviewRequest
} as unknown as ApiClient;

// Mock the file system
jest.mock('fs-extra', () => ({
  existsSync: jest.fn(),
  readFile: jest.fn()
}));

describe('Reviewer', () => {
  let reviewer: Reviewer;

  beforeEach(() => {
    reviewer = new Reviewer(mockApiClient);
    jest.clearAllMocks();
    
    // Mock fs.existsSync to return true for our test file
    (require('fs-extra').existsSync as jest.Mock).mockReturnValue(true);
    (require('fs-extra').readFile as jest.Mock).mockResolvedValue('console.log("hello world");');
  });

  it('should review a single file when passed as part of array', async () => {
    // Mock API response
    mockSendReviewRequest.mockResolvedValue({
      feedback: 'Good code, but consider adding comments',
      suggestions: ['Add documentation to public methods'],
      severity: 'medium'
    });

    const results = await reviewer.reviewFiles(['./test.js']);
    
    expect(results.length).toBe(1);
    expect(results[0].fileName).toBe('./test.js');
    expect(results[0].feedback).toBe('Good code, but consider adding comments');
    expect(results[0].severity).toBe('medium');
  });

  it('should skip unsupported file types', async () => {
    // Make sure the file exists but has unsupported extension
    (require('fs-extra').existsSync as jest.Mock).mockReturnValue(true);
    
    const results = await reviewer.reviewFiles(['./test.unsupported']);
    
    expect(results.length).toBe(0);
  });
  
  it('should skip non-existent files', async () => {
    // Mock fs.existsSync to return false
    (require('fs-extra').existsSync as jest.Mock).mockReturnValue(false);
    
    const results = await reviewer.reviewFiles(['./nonexistent.js']);
    
    expect(results.length).toBe(0);
  });
});