const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const AIInterviewSession = require('../models/AIInterviewSession');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');

const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    responseMimeType: "application/json",
  }
});

// Generate interview questions based on focus areas and difficulty
exports.generateQuestions = async (req, res) => {
  try {
    const { focusAreas, difficulty, jobId } = req.body;
    
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input - request body is required"
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not found"
      });
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === '') {
      console.warn("GEMINI_API_KEY not configured, using fallback questions");
      const fallbackQuestions = getDefaultQuestions('JavaScript, React, Problem Solving');
      return res.status(200).json({
        success: true,
        questions: fallbackQuestions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          category: q.questionCategory
        })),
        fallback: true
      });
    }

    // Build prompt based on focus areas
    const focusAreasText = focusAreas?.length > 0
      ? focusAreas.join(', ')
      : 'JavaScript, React, Problem Solving';

    const difficultyText = difficulty || 'Medium';
    const questionCount = difficultyText === 'Easy' ? 3 : difficultyText === 'Hard' ? 8 : 5;

    const prompt = `Generate ${questionCount} interview questions for a candidate with focus on: ${focusAreasText}. 
    Difficulty level: ${difficultyText}.
    
    Return ONLY a JSON array with objects containing:
    - "question": the interview question text
    - "questionCategory": one of [Technical, Behavioral, ProblemSolving, General]
    - "expectedKeywords": array of 3-5 keywords that a good answer should contain
    
    Example format:
    [{"question": "...", "questionCategory": "Technical", "expectedKeywords": ["keyword1", "keyword2"]}]
    
    Do not include any other text, just the JSON array.`;

    console.log("Generating questions with prompt:", { focusAreasText, difficultyText, questionCount });

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the JSON response
    let questions;
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback to default questions
      questions = getDefaultQuestions(focusAreasText);
    }

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      console.warn("Invalid questions array from AI, using fallback");
      questions = getDefaultQuestions(focusAreasText);
    }

    // Validate jobId is a valid ObjectId
    const validJobId = mongoose.Types.ObjectId.isValid(jobId) ? jobId : null;

    // Create interview session in database
    const interviewSession = new AIInterviewSession({
      user: userId,
      job: validJobId,
      sessionType: 'Practice',
      difficulty: difficultyText,
      focusAreas: focusAreas || ['JavaScript', 'Problem Solving'],
      questions: questions.map(q => ({
        question: q.question,
        questionCategory: q.questionCategory || 'Technical',
        userAnswer: '',
        aiEvaluation: {
          score: 0,
          feedback: '',
          strengths: [],
          improvements: [],
          keywordsFound: []
        },
        timeTaken: 0
      })),
      status: 'NotStarted',
      startedAt: new Date()
    });

    await interviewSession.save();

    res.status(200).json({
      success: true,
      sessionId: interviewSession._id,
      questions: interviewSession.questions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        category: q.questionCategory
      }))
    });

  } catch (error) {
    console.error('Generate Questions Error:', error.message);
    console.error('Full error:', error);
    
    // Return fallback questions on any error
    const fallbackQuestions = getDefaultQuestions('JavaScript, React, Problem Solving');
    return res.status(200).json({
      success: true,
      questions: fallbackQuestions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        category: q.questionCategory
      })),
      fallback: true,
      message: "Using default questions due to AI service error"
    });
  }
};

// Evaluate a single answer
exports.evaluateAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, userAnswer } = req.body;

    // Validate request body
    if (!sessionId || questionIndex === undefined || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: "Invalid input - sessionId, questionIndex, and userAnswer are required"
      });
    }

    const session = await AIInterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const question = session.questions[questionIndex];
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    let evaluation;
    
    if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === '') {
      console.warn("GEMINI_API_KEY not configured, using fallback evaluation");
      evaluation = {
        score: 70,
        feedback: 'Your answer has been recorded. AI evaluation is currently unavailable.',
        strengths: ['Answer submitted'],
        improvements: ['Consider adding more specific examples'],
        keywordsFound: []
      };
    } else {
      // Get expected keywords from the question (we'll use a simple evaluation)
      const prompt = `You are an expert technical interviewer. Evaluate the candidate's answer to this question:

  Question: ${question.question}
  Candidate's Answer: ${userAnswer}

  Provide a JSON response with:
  {
    "score": (0-100),
    "feedback": "short constructive feedback",
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1"],
    "keywordsFound": ["keyword1", "keyword2"]
  }

  Only respond with valid JSON, no other text.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          evaluation = JSON.parse(jsonMatch[0]);
        } else {
          evaluation = JSON.parse(response);
        }
      } catch (parseError) {
        // Fallback evaluation
        evaluation = {
          score: 50,
          feedback: 'Your answer has been recorded. Please continue to the next question.',
          strengths: ['Answer submitted'],
          improvements: ['Consider adding more details'],
          keywordsFound: []
        };
      }
    }

    // Update the question with evaluation
    session.questions[questionIndex].userAnswer = userAnswer;
    session.questions[questionIndex].aiEvaluation = {
      score: evaluation.score || 0,
      feedback: evaluation.feedback || '',
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      keywordsFound: evaluation.keywordsFound || []
    };

    // Calculate overall score so far
    const answeredQuestions = session.questions.filter(q => q.userAnswer);
    if (answeredQuestions.length > 0) {
      session.overallScore = Math.round(
        answeredQuestions.reduce((sum, q) => sum + (q.aiEvaluation?.score || 0), 0) / answeredQuestions.length
      );
    }

    await session.save();

    res.status(200).json({
      success: true,
      evaluation: session.questions[questionIndex].aiEvaluation,
      overallScore: session.overallScore,
      progress: {
        current: questionIndex + 1,
        total: session.questions.length
      }
    });

  } catch (error) {
    console.error('Evaluate Answer Error:', error.message);
    
    // Try to return partial success if we have minimal data
    if (req.body.sessionId && req.body.questionIndex !== undefined && req.body.userAnswer) {
      try {
        const session = await AIInterviewSession.findById(req.body.sessionId);
        if (session && session.questions[req.body.questionIndex]) {
          session.questions[req.body.questionIndex].userAnswer = req.body.userAnswer;
          session.questions[req.body.questionIndex].aiEvaluation = {
            score: 0,
            feedback: 'Answer recorded. Evaluation unavailable.',
            strengths: [],
            improvements: [],
            keywordsFound: []
          };
          await session.save();
          
          return res.status(200).json({
            success: true,
            evaluation: session.questions[req.body.questionIndex].aiEvaluation,
            overallScore: session.overallScore || 0,
            progress: {
              current: req.body.questionIndex + 1,
              total: session.questions.length
            },
            fallback: true
          });
        }
      } catch (saveError) {
        console.error('Fallback save error:', saveError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to evaluate answer', 
      error: error.message 
    });
  }
};

// Submit the complete interview session
exports.submitSession = async (req, res) => {
  try {
    const { sessionId, videoUrl, screenUrl } = req.body;

    // Validate request body
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Invalid input - sessionId is required"
      });
    }

    const session = await AIInterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Update session with recordings if provided
    if (videoUrl) session.videoRecordingUrl = videoUrl;
    if (screenUrl) session.screenRecordingUrl = screenUrl;

    session.status = 'Completed';
    session.completedAt = new Date();

    // Calculate total time
    if (session.startedAt) {
      session.totalTimeTaken = Math.round((session.completedAt - session.startedAt) / 1000);
    }

    // Check if API key is configured for AI feedback
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === '') {
      console.warn("GEMINI_API_KEY not configured, using basic feedback");
      session.overallFeedback = 'Interview completed. Your overall score is ' + (session.overallScore || 0) + '%. Check individual question feedback for details.';
    } else {
      // Generate overall feedback
      const prompt = `Provide a summary feedback for a candidate who completed an interview with these results:

Total Score: ${session.overallScore}%

Questions Answered: ${session.questions.length}

${session.questions.map((q, i) => `Q${i + 1}: ${q.question.substring(0, 50)}... - Score: ${q.aiEvaluation?.score || 0}%`).join('\n')}

Return a JSON with:
{
  "overallFeedback": "comprehensive feedback paragraph",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2"],
  "recommendedNextSteps": ["step1", "step2"]
}

Only respond with valid JSON.`;

      try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const feedback = JSON.parse(jsonMatch[0]);
          session.overallFeedback = feedback.overallFeedback || '';
        }
      } catch (aiError) {
        console.error('AI feedback generation failed:', aiError.message);
        session.overallFeedback = 'Interview completed. Your overall score is ' + (session.overallScore || 0) + '%. Check individual question feedback for details.';
      }
    }

    session.status = 'Evaluated';
    await session.save();

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        status: session.status,
        overallScore: session.overallScore,
        overallFeedback: session.overallFeedback,
        totalTimeTaken: session.totalTimeTaken,
        questionsCount: session.questions.length,
        completedAt: session.completedAt
      }
    });

  } catch (error) {
    console.error('Submit Session Error:', error.message);
    
    // Try to return partial success
    if (req.body.sessionId) {
      try {
        const session = await AIInterviewSession.findById(req.body.sessionId);
        if (session) {
          session.status = 'Completed';
          session.completedAt = new Date();
          if (session.startedAt) {
            session.totalTimeTaken = Math.round((session.completedAt - session.startedAt) / 1000);
          }
          session.overallFeedback = 'Interview completed. There was an error generating detailed feedback.';
          session.status = 'Evaluated';
          await session.save();
          
          return res.status(200).json({
            success: true,
            session: {
              id: session._id,
              status: session.status,
              overallScore: session.overallScore,
              overallFeedback: session.overallFeedback,
              totalTimeTaken: session.totalTimeTaken,
              questionsCount: session.questions.length,
              completedAt: session.completedAt
            },
            fallback: true
          });
        }
      } catch (saveError) {
        console.error('Fallback save error:', saveError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit session', 
      error: error.message 
    });
  }
};

// Get session by ID
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    const session = await AIInterviewSession.findById(sessionId)
      .populate('user', 'name email')
      .populate('job', 'title company');

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    res.status(200).json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Get Session Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get session', 
      error: error.message 
    });
  }
};

// Get user's interview history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    const { limit = 10, page = 1 } = req.query;

    const sessions = await AIInterviewSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-questions.aiEvaluation');

    const total = await AIInterviewSession.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get History Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get history', 
      error: error.message 
    });
  }
};

// Get all sessions (Admin/Employee/Company)
exports.getAllSessions = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const sessions = await AIInterviewSession.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-questions.userAnswer -questions.aiEvaluation');

    const total = await AIInterviewSession.countDocuments();

    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get All Sessions Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get sessions', 
      error: error.message 
    });
  }
};

// Generate next question dynamically based on conversation history
exports.generateNextQuestion = async (req, res) => {
  try {
    const { jobRole, skills, conversationHistory, topic } = req.body;

    // Validate request body
    if (!jobRole || !skills) {
      return res.status(400).json({
        success: false,
        message: "Invalid input - jobRole and skills are required"
      });
    }

    const history = conversationHistory || [];
    const interviewTopic = topic || 'General Technical';

    // Check if interview should end (5+ exchanges)
    if (history.length >= 5) {
      return res.status(200).json({
        success: true,
        nextQuestion: null,
        isComplete: true,
        message: "Interview completed successfully"
      });
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === '') {
      console.warn("GEMINI_API_KEY not configured, using fallback question");
      return res.status(200).json({
        success: true,
        nextQuestion: getFallbackQuestion(history.length, jobRole, skills, interviewTopic),
        isComplete: false,
        fallback: true
      });
    }

    // Build conversation history string
    const historyText = history.length > 0
      ? history.map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`).join('\n\n')
      : 'No previous conversation.';

    // Build AI prompt with topic focus
    const prompt = `You are an expert technical interviewer hiring for a ${jobRole} position with skills in ${skills}.

CRITICAL REQUIREMENT - TOPIC FOCUS:
You are conducting an interview EXCLUSIVELY about: "${interviewTopic}"

RULES:
1. EVERY question you generate MUST be directly related to "${interviewTopic}"
2. DO NOT ask questions outside of "${interviewTopic}" domain
3. If "${interviewTopic}" contains "MERN", ask about MongoDB, Express, React, Node.js
4. If "${interviewTopic}" contains "Python", ask about Python programming, frameworks, libraries
5. If "${interviewTopic}" contains "Java", ask about Java, Spring, OOP concepts
6. If "${interviewTopic}" contains "HR" or "Management", ask about people management, recruitment, workplace culture
7. If "${interviewTopic}" contains "Data Science", ask about ML, statistics, data analysis
8. If "${interviewTopic}" contains "DevOps", ask about CI/CD, Docker, Kubernetes, cloud platforms
9. If "${interviewTopic}" contains "Cybersecurity", ask about security protocols, encryption, threat analysis
10. For ANY other topic, generate questions specifically about that topic's core concepts

Interview History:
${historyText}

Instructions:
- If this is the first question (no history), ask an opening technical question specifically about ${interviewTopic}.
- If the candidate's last answer was vague, incomplete, or lacked depth, ask a follow-up cross-question to dig deeper into the same ${interviewTopic} topic.
- If the candidate's last answer was comprehensive and good, move to a new technical question on a different aspect of ${interviewTopic}.
- Keep questions conversational, clear, and under 2 sentences.
- All questions MUST be relevant to ${interviewTopic}.
- If there are already 5 or more exchanges, indicate the interview is complete.

Respond ONLY with valid JSON in this exact format:
{
  "nextQuestion": "your question here",
  "isComplete": false
}

If interview is complete:
{
  "nextQuestion": null,
  "isComplete": true
}

Do not include any other text, markdown, or explanations. Only the JSON object.`;

    console.log('Generating next question for:', { jobRole, skills, topic: interviewTopic, historyLength: history.length });

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the JSON response
    let aiResponse;
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        aiResponse = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback question
      return res.status(200).json({
        success: true,
        nextQuestion: getFallbackQuestion(history.length, jobRole, skills, interviewTopic),
        isComplete: false,
        fallback: true
      });
    }

    // Validate response structure
    if (typeof aiResponse.isComplete !== 'boolean') {
      aiResponse.isComplete = false;
    }

    res.status(200).json({
      success: true,
      nextQuestion: aiResponse.nextQuestion,
      isComplete: aiResponse.isComplete
    });

  } catch (error) {
    console.error('Generate Next Question Error:', error.message);
    
    // Fallback on error
    const history = req.body.conversationHistory || [];
    const interviewTopic = req.body.topic || 'General Technical';
    return res.status(200).json({
      success: true,
      nextQuestion: getFallbackQuestion(history.length, req.body.jobRole, req.body.skills, interviewTopic),
      isComplete: false,
      fallback: true,
      message: "Using fallback question due to AI service error"
    });
  }
};

// Helper function for fallback questions
function getFallbackQuestion(questionNumber, jobRole, skills, topic) {
  const topicLower = (topic || '').toLowerCase();
  
  // Topic-specific fallback questions
  if (topicLower.includes('mern')) {
    const mernQuestions = [
      `Tell me about your experience with the MERN stack (MongoDB, Express, React, Node.js).`,
      `Can you explain how you would structure a RESTful API using Express and Node.js?`,
      `What are the key differences between React class components and functional components with hooks?`,
      `Describe your approach to state management in a React application.`,
      `How do you handle authentication and authorization in a MERN stack application?`
    ];
    return mernQuestions[questionNumber % mernQuestions.length];
  }
  
  if (topicLower.includes('python')) {
    const pythonQuestions = [
      `Tell me about your experience with Python and its frameworks.`,
      `Can you explain the difference between lists and tuples in Python?`,
      `What is your approach to handling exceptions in Python applications?`,
      `Describe how you would optimize Python code for better performance.`,
      `How do you manage dependencies in Python projects?`
    ];
    return pythonQuestions[questionNumber % pythonQuestions.length];
  }
  
  if (topicLower.includes('java')) {
    const javaQuestions = [
      `Tell me about your experience with Java and Spring Boot.`,
      `Can you explain the concept of dependency injection in Spring?`,
      `What are the key differences between abstract classes and interfaces in Java?`,
      `Describe your approach to exception handling in Java applications.`,
      `How do you ensure thread safety in Java applications?`
    ];
    return javaQuestions[questionNumber % javaQuestions.length];
  }
  
  if (topicLower.includes('hr') || topicLower.includes('management')) {
    const hrQuestions = [
      `Tell me about your experience in HR and people management.`,
      `How do you handle conflict resolution in a team environment?`,
      `Describe your approach to employee performance evaluation.`,
      `What strategies do you use for talent acquisition and retention?`,
      `How do you foster a positive workplace culture?`
    ];
    return hrQuestions[questionNumber % hrQuestions.length];
  }
  
  if (topicLower.includes('data science') || topicLower.includes('machine learning') || topicLower.includes('ml')) {
    const dsQuestions = [
      `Tell me about your experience with data science and machine learning.`,
      `Can you explain the difference between supervised and unsupervised learning?`,
      `What is your approach to handling missing data in datasets?`,
      `Describe a machine learning model you've built and deployed.`,
      `How do you evaluate the performance of a machine learning model?`
    ];
    return dsQuestions[questionNumber % dsQuestions.length];
  }
  
  if (topicLower.includes('devops') || topicLower.includes('cloud')) {
    const devopsQuestions = [
      `Tell me about your experience with DevOps and cloud platforms.`,
      `Can you explain the concept of CI/CD pipelines?`,
      `What is your approach to containerization using Docker?`,
      `Describe your experience with Kubernetes orchestration.`,
      `How do you ensure security in cloud deployments?`
    ];
    return devopsQuestions[questionNumber % devopsQuestions.length];
  }
  
  if (topicLower.includes('cyber') || topicLower.includes('security')) {
    const securityQuestions = [
      `Tell me about your experience in cybersecurity.`,
      `Can you explain the difference between symmetric and asymmetric encryption?`,
      `What is your approach to threat detection and prevention?`,
      `Describe common web application vulnerabilities and how to prevent them.`,
      `How do you conduct security audits and penetration testing?`
    ];
    return securityQuestions[questionNumber % securityQuestions.length];
  }
  
  if (topicLower.includes('mobile') || topicLower.includes('android') || topicLower.includes('ios')) {
    const mobileQuestions = [
      `Tell me about your experience with mobile app development.`,
      `Can you explain the difference between native and cross-platform development?`,
      `What is your approach to mobile app performance optimization?`,
      `Describe how you handle offline functionality in mobile apps.`,
      `How do you ensure mobile app security and data protection?`
    ];
    return mobileQuestions[questionNumber % mobileQuestions.length];
  }
  
  if (topicLower.includes('ui') || topicLower.includes('ux') || topicLower.includes('design')) {
    const designQuestions = [
      `Tell me about your experience with UI/UX design.`,
      `Can you explain your design process from research to implementation?`,
      `What is your approach to creating accessible and inclusive designs?`,
      `Describe how you conduct user research and usability testing.`,
      `How do you balance aesthetics with functionality in your designs?`
    ];
    return designQuestions[questionNumber % designQuestions.length];
  }
  
  if (topicLower.includes('database') || topicLower.includes('sql')) {
    const dbQuestions = [
      `Tell me about your experience with database design and management.`,
      `Can you explain the difference between SQL and NoSQL databases?`,
      `What is your approach to database optimization and indexing?`,
      `Describe how you handle database transactions and ACID properties.`,
      `How do you ensure data integrity and security in databases?`
    ];
    return dbQuestions[questionNumber % dbQuestions.length];
  }
  
  // Default fallback questions based on topic
  const defaultQuestions = [
    `Tell me about your experience with ${topic}.`,
    `Can you explain the key concepts and principles of ${topic}?`,
    `What challenges have you faced while working with ${topic}?`,
    `Describe a project where you applied ${topic} skills.`,
    `How do you stay updated with the latest trends in ${topic}?`
  ];
  
  return defaultQuestions[questionNumber % defaultQuestions.length];
}

// Helper function for default questions
function getDefaultQuestions(focusAreas) {
  const questions = [
    {
      question: "Tell me about yourself and your experience with software development.",
      questionCategory: "Behavioral",
      expectedKeywords: ["experience", "skills", "projects"]
    },
    {
      question: "What are the key differences between var, let, and const in JavaScript?",
      questionCategory: "Technical",
      expectedKeywords: ["scope", "hoisting", "reassignment"]
    },
    {
      question: "Explain the concept of closures in JavaScript with an example.",
      questionCategory: "Technical",
      expectedKeywords: ["function", "scope", "lexical"]
    },
    {
      question: "Describe your problem-solving approach when debugging a complex issue.",
      questionCategory: "ProblemSolving",
      expectedKeywords: ["debug", "analyze", "test"]
    },
    {
      question: "What is the Virtual DOM and how does React use it?",
      questionCategory: "Technical",
      expectedKeywords: ["virtual", "diff", "reconciliation"]
    }
  ];

  return questions.slice(0, 5);
}

module.exports = exports;
