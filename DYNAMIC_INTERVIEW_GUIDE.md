# Dynamic AI Interview System - Implementation Guide

## 🎯 Overview
This system uses AI to dynamically generate interview questions based on the candidate's previous answers, including intelligent follow-up cross-questions when answers are incomplete or vague.

---

## 📁 Backend Implementation

### 1. Controller: `aiInterviewController.js`

#### New Function: `generateNextQuestion`

**Endpoint:** `POST /api/ai-interview/next-question`

**Request Body:**
```json
{
  "jobRole": "Software Developer",
  "skills": "JavaScript, React, Node.js",
  "conversationHistory": [
    {
      "question": "What is your experience with React?",
      "answer": "I have worked with React for 2 years..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "nextQuestion": "Can you explain how React hooks work?",
  "isComplete": false
}
```

**When Interview is Complete (5+ questions):**
```json
{
  "success": true,
  "nextQuestion": null,
  "isComplete": true,
  "message": "Interview completed successfully"
}
```

**Key Features:**
- ✅ Analyzes conversation history
- ✅ Asks follow-up questions if answer is vague
- ✅ Moves to new topics if answer is comprehensive
- ✅ Automatically ends after 5+ exchanges
- ✅ Fallback questions if AI service fails

---

### 2. Controller: `interviewController.js`

#### New Function: `gradeInterview`

**Endpoint:** `POST /api/interview/grade`

**Request Body:**
```json
{
  "fullTranscript": [
    {
      "question": "What is your experience with React?",
      "answer": "I have 2 years of experience..."
    }
  ],
  "jobId": "session_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "session_1234567890",
  "overallScore": 85,
  "overallFeedback": "Strong technical knowledge...",
  "grades": [
    {
      "questionNumber": 1,
      "score": 85,
      "feedback": "Good answer with specific examples",
      "strengths": ["Clear explanation", "Real-world examples"],
      "improvements": ["Could add more technical depth"]
    }
  ],
  "keyStrengths": ["Technical knowledge", "Communication"],
  "areasForImprovement": ["System design", "Algorithms"],
  "recommendation": "hire - Strong candidate with solid fundamentals",
  "totalQuestions": 5
}
```

---

## 🎨 Frontend Implementation

### Component: `AIInterviewRoomDynamic.jsx`

**Location:** `company/src/pages/AIInterviewRoomDynamic.jsx`

**Key Features:**
1. **Dynamic Question Fetching**
   - Calls `/api/ai-interview/next-question` after each answer
   - Passes full conversation history for context

2. **Voice Integration**
   - AI reads questions using `window.speechSynthesis`
   - User can speak answers using `SpeechRecognition API`
   - Live transcript display

3. **Smart Flow**
   - Automatically detects when interview is complete
   - Triggers grading endpoint
   - Shows comprehensive results

**Usage:**
```jsx
import AIInterviewRoomDynamic from './pages/AIInterviewRoomDynamic';

// In your router
<Route 
  path="/interview/dynamic" 
  element={<AIInterviewRoomDynamic />} 
/>

// Navigate with job details
navigate('/interview/dynamic', {
  state: {
    jobRole: 'Full Stack Developer',
    skills: 'React, Node.js, MongoDB'
  }
});
```

---

## 🔄 Flow Diagram

```
1. User starts interview
   ↓
2. Frontend calls /next-question with empty history
   ↓
3. AI generates first question
   ↓
4. User answers (voice or text)
   ↓
5. Frontend calls /next-question with updated history
   ↓
6. AI analyzes answer:
   - If vague → Follow-up cross-question
   - If good → New technical question
   ↓
7. Repeat steps 4-6 until 5+ questions
   ↓
8. Frontend calls /grade with full transcript
   ↓
9. AI provides comprehensive evaluation
   ↓
10. Show results to user
```

---

## 🚀 Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
GEMINI_API_KEY=your-actual-gemini-api-key
```

### 2. Install Dependencies
```bash
cd server
npm install @google/generative-ai

cd ../company
npm install axios
```

### 3. Test the Endpoints

**Test Next Question:**
```bash
curl -X POST http://localhost:5000/api/ai-interview/next-question \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobRole": "Software Developer",
    "skills": "JavaScript, React",
    "conversationHistory": []
  }'
```

**Test Grading:**
```bash
curl -X POST http://localhost:5000/api/interview/grade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullTranscript": [
      {
        "question": "What is React?",
        "answer": "React is a JavaScript library..."
      }
    ],
    "jobId": "test_123"
  }'
```

---

## 🎯 AI Prompt Strategy

### For Next Question Generation:
```
You are an expert technical interviewer hiring for a [jobRole] 
with skills in [skills].

Interview History:
[conversationHistory]

Instructions:
- If first question: Ask opening technical question
- If last answer was vague: Ask follow-up cross-question
- If last answer was good: Ask new technical question
- Keep questions under 2 sentences
- After 5+ exchanges: Mark interview complete

Response Format:
{
  "nextQuestion": "...",
  "isComplete": false
}
```

### For Grading:
```
You are an expert technical interviewer. Grade this interview:

[Full Transcript]

Provide JSON with:
- overallScore (0-100)
- overallFeedback
- grades array with per-question scores
- keyStrengths
- areasForImprovement
- recommendation (hire/consider/reject)
```

---

## 🔧 Customization Options

### Adjust Interview Length
In `generateNextQuestion` function:
```javascript
// Change from 5 to your desired number
if (history.length >= 5) {
  return res.status(200).json({
    success: true,
    nextQuestion: null,
    isComplete: true
  });
}
```

### Modify AI Behavior
Edit the prompt in `generateNextQuestion`:
```javascript
const prompt = `You are an expert technical interviewer...
- Add your custom instructions here
- Adjust question style
- Change difficulty level
`;
```

### Add Question Categories
Track question types in conversation history:
```javascript
{
  question: "...",
  answer: "...",
  category: "Technical", // or "Behavioral", "Problem Solving"
  difficulty: "Medium"
}
```

---

## 📊 Monitoring & Debugging

### Enable Detailed Logging
```javascript
// In generateNextQuestion
console.log('Generating next question:', {
  jobRole,
  skills,
  historyLength: history.length,
  lastAnswer: history[history.length - 1]?.answer.substring(0, 50)
});
```

### Fallback Handling
Both endpoints have fallback mechanisms:
- If AI service fails → Use predefined questions
- If parsing fails → Return default responses
- Always returns `success: true` with fallback flag

---

## 🎓 Best Practices

1. **Always validate input**
   - Check jobRole and skills are provided
   - Validate conversationHistory is an array

2. **Handle edge cases**
   - Empty answers
   - Very long answers (truncate if needed)
   - Network timeouts

3. **User experience**
   - Show loading states
   - Provide voice controls
   - Display live transcripts
   - Allow manual text input as backup

4. **Security**
   - Validate JWT tokens
   - Sanitize user inputs
   - Rate limit API calls

---

## 🐛 Troubleshooting

### Issue: AI returns invalid JSON
**Solution:** The code extracts JSON using regex matching:
```javascript
const jsonMatch = response.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  aiResponse = JSON.parse(jsonMatch[0]);
}
```

### Issue: Speech recognition not working
**Solution:** Check browser compatibility:
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert('Please use Chrome browser for voice features');
}
```

### Issue: Interview never completes
**Solution:** Check history length condition and ensure frontend is passing updated history.

---

## 📝 Example Integration

```javascript
// In your job application flow
const handleStartInterview = () => {
  navigate('/interview/dynamic', {
    state: {
      jobRole: job.title,
      skills: job.requiredSkills.join(', '),
      jobId: job._id
    }
  });
};
```

---

## 🎉 Success Metrics

Track these metrics:
- Average questions per interview
- Follow-up question rate
- Average scores
- Completion rate
- User satisfaction

---

## 📚 Additional Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [React Router State](https://reactrouter.com/en/main/hooks/use-location)

---

## 🔐 Security Considerations

1. **API Key Protection**
   - Never expose GEMINI_API_KEY in frontend
   - Use environment variables
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement rate limits on AI endpoints
   - Prevent abuse

3. **Data Privacy**
   - Don't log sensitive answers
   - Comply with GDPR/privacy laws
   - Allow users to delete their data

---

## ✅ Testing Checklist

- [ ] First question generates correctly
- [ ] Follow-up questions work for vague answers
- [ ] New questions work for good answers
- [ ] Interview completes after 5 questions
- [ ] Grading returns valid scores
- [ ] Voice input works
- [ ] Voice output works
- [ ] Fallbacks work when AI fails
- [ ] Loading states display properly
- [ ] Results page shows correctly

---

**Created:** 2024
**Version:** 1.0
**Status:** Production Ready ✅
