/**
 * Test Script for Dynamic AI Interview System
 * Run with: node testDynamicInterview.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TOKEN = 'your-jwt-token-here'; // Replace with actual token

// Test data
const testData = {
  jobRole: 'Full Stack Developer',
  skills: 'JavaScript, React, Node.js, MongoDB',
  conversationHistory: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  question: (msg) => console.log(`${colors.cyan}Q: ${msg}${colors.reset}`)
};

// Simulate a complete interview
async function runInterviewSimulation() {
  console.log('\n' + '='.repeat(60));
  log.info('Starting Dynamic AI Interview Simulation');
  console.log('='.repeat(60) + '\n');

  const conversationHistory = [];
  let questionNumber = 1;
  let isComplete = false;

  // Sample answers for testing
  const sampleAnswers = [
    "I have 3 years of experience with JavaScript, working on both frontend and backend projects. I'm proficient in ES6+ features and async programming.",
    "React hooks allow functional components to use state and lifecycle features. I use useState for state management and useEffect for side effects.",
    "I've built several full-stack applications using the MERN stack. One notable project was an e-commerce platform with real-time inventory management.",
    "I follow best practices like code reviews, unit testing, and continuous integration. I also document my code and use version control effectively.",
    "My approach involves breaking down problems into smaller parts, researching solutions, and iterating based on feedback. I also prioritize performance and scalability."
  ];

  try {
    // Simulate interview loop
    while (!isComplete && questionNumber <= 6) {
      log.info(`\n--- Question ${questionNumber} ---`);

      // Request next question
      const response = await axios.post(
        `${BASE_URL}/api/ai-interview/next-question`,
        {
          jobRole: testData.jobRole,
          skills: testData.skills,
          conversationHistory
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        if (response.data.isComplete) {
          log.success('Interview marked as complete by AI');
          isComplete = true;
          break;
        }

        const question = response.data.nextQuestion;
        log.question(question);

        // Simulate user answer
        const answer = sampleAnswers[questionNumber - 1] || "This is a test answer.";
        console.log(`${colors.reset}A: ${answer}\n`);

        // Add to history
        conversationHistory.push({ question, answer });
        questionNumber++;

        // Small delay to simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        log.error('Failed to get next question');
        break;
      }
    }

    // Grade the interview
    if (conversationHistory.length > 0) {
      log.info('\n--- Grading Interview ---');
      
      const gradingResponse = await axios.post(
        `${BASE_URL}/api/interview/grade`,
        {
          fullTranscript: conversationHistory,
          jobId: `test_${Date.now()}`
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (gradingResponse.data.success) {
        log.success('Interview graded successfully!');
        console.log('\n' + '='.repeat(60));
        console.log('RESULTS:');
        console.log('='.repeat(60));
        console.log(`Overall Score: ${colors.green}${gradingResponse.data.overallScore}%${colors.reset}`);
        console.log(`Feedback: ${gradingResponse.data.overallFeedback}`);
        console.log(`Total Questions: ${gradingResponse.data.totalQuestions}`);
        
        if (gradingResponse.data.keyStrengths) {
          console.log(`\nKey Strengths:`);
          gradingResponse.data.keyStrengths.forEach(s => console.log(`  • ${s}`));
        }
        
        if (gradingResponse.data.areasForImprovement) {
          console.log(`\nAreas for Improvement:`);
          gradingResponse.data.areasForImprovement.forEach(a => console.log(`  • ${a}`));
        }
        
        if (gradingResponse.data.recommendation) {
          console.log(`\nRecommendation: ${colors.cyan}${gradingResponse.data.recommendation}${colors.reset}`);
        }
        console.log('='.repeat(60) + '\n');
      } else {
        log.error('Failed to grade interview');
      }
    }

  } catch (error) {
    log.error(`Error: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

// Test individual endpoint
async function testNextQuestionEndpoint() {
  console.log('\n' + '='.repeat(60));
  log.info('Testing /next-question Endpoint');
  console.log('='.repeat(60) + '\n');

  try {
    const response = await axios.post(
      `${BASE_URL}/api/ai-interview/next-question`,
      {
        jobRole: 'Software Developer',
        skills: 'Python, Django',
        conversationHistory: []
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      log.success('Endpoint working correctly');
      log.question(response.data.nextQuestion);
      console.log(`Is Complete: ${response.data.isComplete}`);
    } else {
      log.error('Endpoint returned success: false');
    }
  } catch (error) {
    log.error(`Error: ${error.message}`);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

// Test grading endpoint
async function testGradingEndpoint() {
  console.log('\n' + '='.repeat(60));
  log.info('Testing /grade Endpoint');
  console.log('='.repeat(60) + '\n');

  const sampleTranscript = [
    {
      question: "What is your experience with JavaScript?",
      answer: "I have 5 years of experience with JavaScript, including ES6+ features, async/await, and modern frameworks."
    },
    {
      question: "Can you explain closures?",
      answer: "Closures are functions that have access to variables from their outer scope, even after the outer function has returned."
    }
  ];

  try {
    const response = await axios.post(
      `${BASE_URL}/api/interview/grade`,
      {
        fullTranscript: sampleTranscript,
        jobId: `test_${Date.now()}`
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      log.success('Endpoint working correctly');
      console.log(`Overall Score: ${response.data.overallScore}%`);
      console.log(`Feedback: ${response.data.overallFeedback}`);
    } else {
      log.error('Endpoint returned success: false');
    }
  } catch (error) {
    log.error(`Error: ${error.message}`);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';

  switch (command) {
    case 'next':
      await testNextQuestionEndpoint();
      break;
    case 'grade':
      await testGradingEndpoint();
      break;
    case 'full':
    default:
      await runInterviewSimulation();
      break;
  }
}

// Run tests
if (require.main === module) {
  console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════════╗');
  console.log('║     Dynamic AI Interview System - Test Suite              ║');
  console.log('╚════════════════════════════════════════════════════════════╝' + colors.reset);
  
  log.warn('\nMake sure to:');
  console.log('  1. Update TOKEN variable with valid JWT');
  console.log('  2. Ensure server is running on http://localhost:5000');
  console.log('  3. Set GEMINI_API_KEY in server .env file\n');

  log.info('Usage:');
  console.log('  node testDynamicInterview.js          # Run full simulation');
  console.log('  node testDynamicInterview.js next     # Test next-question endpoint');
  console.log('  node testDynamicInterview.js grade    # Test grading endpoint\n');

  main().then(() => {
    console.log('\n' + colors.green + '✓ Tests completed' + colors.reset + '\n');
  }).catch(err => {
    console.error('\n' + colors.red + '✗ Tests failed:', err.message + colors.reset + '\n');
    process.exit(1);
  });
}

module.exports = { runInterviewSimulation, testNextQuestionEndpoint, testGradingEndpoint };
