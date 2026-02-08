// Example usage of the code review package

// This package can be used in multiple ways:

/*
1. As a command line tool:
   npx @jc-vendor/code-review review --path ./src
   
2. To install a pre-commit hook:
   npx @jc-vendor/code-review install-hook
   
3. To run during pre-commit (typically added to package.json):
   "husky": {
     "hooks": {
       "pre-commit": "npx @jc-vendor/code-review pre-commit"
     }
   }
   
4. Programmatically in Node.js:
*/

const { Reviewer, ApiClient } = require('./dist');

// Initialize the API client with your RAG endpoint
const apiClient = new ApiClient('http://localhost:8080', '/api/v1/query');

// Create a reviewer instance
const reviewer = new Reviewer(apiClient);

// Review a specific directory
async function runExample() {
  try {
    console.log('Starting code review...');
    const results = await reviewer.reviewDirectory('./src');
    await reviewer.printReviewResults(results);
    console.log('Code review completed!');
  } catch (error) {
    console.error('Error during code review:', error.message);
  }
}

// Uncomment to run the example
// runExample();