const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const stream = require('stream');
const path = require('path');
const AIInterviewSession = require('../models/AIInterviewSession');

// Initialize Drive API
// Ensure 'service-account-key.json' is in your server root directory
const KEYFILEPATH = path.join(__dirname, '..', 'service-account-key.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

exports.uploadInterview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded." });
    }

    const { jobId } = req.body;

    const fileMetadata = {
      name: `Interview_${jobId}_${Date.now()}.webm`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Folder ID from .env
    };

    const media = {
      mimeType: 'video/webm',
      body: stream.Readable.from(req.file.buffer),
    };

    // 1. Upload the file
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    const fileId = file.data.id;
    const webViewLink = file.data.webViewLink;

    // 2. Grant permission to the Recruiter/Employee
    const employeeEmail = process.env.RECRUITER_EMAIL;
    
    if (employeeEmail) {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: employeeEmail,
        },
      });
    }

    // 3. Return the link (Frontend can then save this to MongoDB via another call or you can do it here)
    res.status(200).json({ success: true, link: webViewLink });

  } catch (error) {
    console.error("Google Drive Upload Error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.startInterview = async (req, res) => {
  try {
    // Generate a unique interview ID (In a real app, this would be a database ID)
    const interviewId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
      success: true,
      message: "Interview session initialized",
      interviewId: interviewId
    });
  } catch (error) {
    console.error("Start Interview Error:", error);
    res.status(500).json({ message: "Failed to start interview", error: error.message });
  }
};

exports.gradeInterview = async (req, res) => {
  try {
    const { fullTranscript, jobId, jobRole, skills, topic } = req.body;
    const userId = req.user?.id;

    // Validate request body
    if (!fullTranscript || !Array.isArray(fullTranscript)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input - fullTranscript array is required"
      });
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    let grading;
    
    if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === '') {
      console.error('GEMINI_API_KEY not configured - cannot grade interview');
      return res.status(500).json({
        success: false,
        error: 'AI grading service is not configured. Please contact administrator.'
      });
    }

    // Build transcript text for AI
    const transcriptText = fullTranscript
      .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
      .join('\n\n');

    // Build STRICT AI prompt for grading
    const prompt = `You are an EXTREMELY STRICT technical interviewer evaluating a candidate's interview performance.

CRITICAL RESPONSE FORMAT:
- Return ONLY a raw JSON object
- Do NOT wrap the response in markdown backticks
- Do not include the word 'json' before or after the JSON
- Do not add any explanatory text before or after the JSON
- The response must be pure, parseable JSON

CRITICAL GRADING RULES (ZERO TOLERANCE FOR GIBBERISH):
1. If an answer is gibberish, keyboard smash (e.g., "asdfasdf", "jkjkjk"), random characters, or completely irrelevant to the question, you MUST set the score to 0.
2. If an answer is just "hello", "hi", "test", or any single word with no substance, you MUST set the score to 0.
3. If an answer contains only random letters, repeated characters, or nonsensical text, you MUST set the score to 0.
4. If an answer is empty, says "No answer provided", or is just a few words with no substance, give it a score of 0-10 maximum.
5. If an answer is partially relevant but lacks depth or technical accuracy, give it 20-40.
6. Only give scores above 60 if the answer demonstrates clear understanding and technical knowledge.
7. Only give scores above 80 if the answer is comprehensive, accurate, and well-articulated.
8. Be ruthless - this is a real technical interview, not a participation trophy. GIBBERISH = 0 POINTS, NO EXCEPTIONS.

Interview Transcript:
${transcriptText}

Provide a comprehensive evaluation in this EXACT JSON format (no markdown, no backticks):
{
  "overallScore": 0,
  "overallFeedback": "comprehensive paragraph about the candidate's performance",
  "grades": [
    {
      "questionNumber": 1,
      "score": 0,
      "feedback": "specific feedback for this answer - if gibberish, state 'This answer is gibberish/irrelevant and receives 0 points'",
      "strengths": [],
      "improvements": ["improvement1", "improvement2"]
    }
  ],
  "keyStrengths": [],
  "areasForImprovement": ["area 1", "area 2", "area 3"],
  "recommendation": "reject with brief reasoning"
}

Remember: Return ONLY the JSON object. No markdown. No backticks. No explanations. Be STRICT and HONEST in your evaluation.`;

    console.log('Grading interview with', fullTranscript.length, 'questions using STRICT evaluation');
    console.log('Sending request to Gemini API...');

    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text();
    
    console.log('Raw AI Response (first 500 chars):', aiResponseText.substring(0, 500));

    // BULLETPROOF JSON PARSING WITH FAILSAFE
    let parsedData;
    try {
      const cleanedText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      const finalStringToParse = jsonMatch ? jsonMatch[0] : cleanedText;
      parsedData = JSON.parse(finalStringToParse);
      
      // Ensure the parsed data actually has a score
      if (typeof parsedData.overallScore !== 'number') {
        parsedData.overallScore = 0;
      }
    } catch (parseError) {
      console.error("🔥 AI Parsing failed. Raw AI Response was:", aiResponseText);
      // FAILSAFE: Do NOT crash the server. Return a default 0 score.
      parsedData = { 
        overallScore: 0,
        overallFeedback: "The response was unclear, invalid, or did not answer the question appropriately.",
        grades: fullTranscript.map((item, idx) => ({
          questionNumber: idx + 1,
          score: 0,
          feedback: "The response was unclear, invalid, or did not answer the question appropriately.",
          strengths: [],
          improvements: ["Provide clear and relevant answers", "Stay focused on the question"]
        })),
        keyStrengths: [],
        areasForImprovement: ["Provide clear and relevant answers", "Demonstrate technical knowledge", "Stay focused on the questions"],
        recommendation: "Not recommended - responses were unclear or invalid"
      };
    }
    
    grading = parsedData;
    console.log('✅ AI Grading processed. Overall Score:', grading.overallScore);

    // Save to database if user is authenticated
    let sessionId = null;
    if (userId) {
      try {
        const interviewSession = new AIInterviewSession({
          user: userId,
          sessionType: 'Practice',
          difficulty: 'Medium',
          focusAreas: [topic || 'General'],
          questions: fullTranscript.map((item, idx) => ({
            question: item.question,
            questionCategory: 'Technical',
            userAnswer: item.answer,
            aiEvaluation: {
              score: grading.grades?.[idx]?.score || 0,
              feedback: grading.grades?.[idx]?.feedback || 'This answer received 0 points due to lack of substance or gibberish content',
              strengths: grading.grades?.[idx]?.strengths || [],
              improvements: grading.grades?.[idx]?.improvements || [],
              keywordsFound: []
            },
            timeTaken: 120
          })),
          status: 'Evaluated',
          overallScore: grading.overallScore || 0,
          overallFeedback: grading.overallFeedback || '',
          startedAt: new Date(Date.now() - (fullTranscript.length * 120 * 1000)), // Estimate start time
          completedAt: new Date(),
          totalTimeTaken: fullTranscript.length * 120
        });

        await interviewSession.save();
        sessionId = interviewSession._id;
        console.log('Interview session saved successfully:', sessionId);
      } catch (dbError) {
        console.error('Failed to save interview session to database:', dbError);
        // Continue even if DB save fails - don't fail the entire request
      }
    }

    // Then, successfully return the response to the frontend
    return res.status(200).json({
      success: true,
      sessionId,
      jobId,
      overallScore: grading.overallScore || 0,
      overallFeedback: grading.overallFeedback || '',
      grades: grading.grades || [],
      keyStrengths: grading.keyStrengths || [],
      areasForImprovement: grading.areasForImprovement || [],
      recommendation: grading.recommendation || '',
      totalQuestions: fullTranscript.length
    });

  } catch (error) {
    console.error('\n=== 🔥 AI GRADING CRASH ===' );
    console.error('🔥 Error Type:', error.name);
    console.error('🔥 Error Message:', error.message || error);
    console.error('🔥 Full Error:', error);
    console.error('🔥 Stack Trace:', error.stack);
    console.error('=== END CRASH REPORT ===\n');
    
    // Return proper error response - NO FAKE SCORES
    return res.status(500).json({
      success: false,
      error: 'Grading failed due to AI format error. Please try again later.',
      message: 'Interview grading failed due to AI service error.',
      details: process.env.NODE_ENV === 'development' ? {
        errorType: error.name,
        errorMessage: error.message,
        stack: error.stack
      } : undefined
    });
  }
};