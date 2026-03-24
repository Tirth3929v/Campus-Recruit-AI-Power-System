# AI Grading System - Debugging & Testing Guide

## 🔧 What Was Fixed

### Problem
- Gemini API was returning JSON wrapped in markdown backticks: ` ```json { ... } ``` `
- `JSON.parse()` was failing with 500 errors
- No detailed error logging to diagnose issues

### Solution
1. **Updated AI Prompt** - Explicitly tells Gemini to return raw JSON without markdown
2. **Response Cleaning** - Strips markdown backticks before parsing
3. **Enhanced Logging** - Detailed console output for debugging
4. **Strict Validation** - Validates JSON structure before accepting

---

## 📝 Updated AI Prompt

### Key Instructions Added:
```
CRITICAL RESPONSE FORMAT:
- Return ONLY a raw JSON object
- Do NOT wrap the response in markdown backticks
- Do not include the word 'json' before or after the JSON
- Do not add any explanatory text
- The response must be pure, parseable JSON
```

### Strict Grading Rules:
- Gibberish/keyboard smash → **0 points**
- Single words like "hello", "hi", "test" → **0 points**
- Empty/no answer → **0-10 points**
- Partial answer → **20-40 points**
- Good answer → **60-80 points**
- Excellent answer → **80-100 points**

---

## 🧹 Response Cleaning Process

### Step 1: Get Raw Response
```javascript
const rawResponse = result.response.text();
```

### Step 2: Clean Markdown
```javascript
const cleanedText = rawResponse
  .replace(/```json/gi, '')  // Remove ```json
  .replace(/```/g, '')        // Remove remaining backticks
  .trim();                    // Remove whitespace
```

### Step 3: Parse JSON
```javascript
const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  grading = JSON.parse(jsonMatch[0]);
} else {
  grading = JSON.parse(cleanedText);
}
```

### Step 4: Validate Structure
```javascript
if (!grading.overallScore && grading.overallScore !== 0) {
  throw new Error('Missing overallScore');
}
if (!grading.grades || !Array.isArray(grading.grades)) {
  throw new Error('Missing or invalid grades array');
}
```

---

## 🔍 Console Logging

### Success Case
```
Grading interview with 5 questions using STRICT evaluation
Sending request to Gemini API...
Raw AI Response (first 500 chars): ```json
{
  "overallScore": 15,
  "overallFeedback": "The candidate...
Cleaned Response (first 500 chars): {
  "overallScore": 15,
  "overallFeedback": "The candidate...
✅ AI Grading successful. Overall Score: 15
✅ Number of question grades: 5
Interview session saved successfully: 507f1f77bcf86cd799439011
```

### Parse Error Case
```
🔥 JSON Parse Error: Unexpected token < in JSON at position 0
🔥 Failed to parse AI response
🔥 Raw response: <html>Error 503</html>
🔥 Cleaned response: <html>Error 503</html>
```

### Crash Case
```
=== 🔥 AI GRADING CRASH ===
🔥 Error Type: TypeError
🔥 Error Message: Cannot read property 'text' of undefined
🔥 Full Error: TypeError: Cannot read property 'text' of undefined
    at gradeInterview (/server/controllers/interviewController.js:123:45)
🔥 Stack Trace: [Full stack trace]
=== END CRASH REPORT ===
```

---

## 🧪 Testing Scenarios

### Test 1: Gibberish Answer
**Input**:
```javascript
{
  question: "Explain React hooks",
  answer: "asdfasdf jkjkjk qwerty uiop"
}
```

**Expected Output**:
```json
{
  "overallScore": 0,
  "grades": [{
    "questionNumber": 1,
    "score": 0,
    "feedback": "This answer is gibberish/irrelevant and receives 0 points",
    "strengths": [],
    "improvements": ["Provide a relevant technical answer"]
  }]
}
```

### Test 2: Single Word Answer
**Input**:
```javascript
{
  question: "What is Redux?",
  answer: "hello"
}
```

**Expected Output**:
```json
{
  "overallScore": 0,
  "grades": [{
    "questionNumber": 1,
    "score": 0,
    "feedback": "Single word answer with no substance receives 0 points",
    "strengths": [],
    "improvements": ["Provide a detailed technical explanation"]
  }]
}
```

### Test 3: Markdown-Wrapped Response (Should Handle)
**AI Returns**:
```
```json
{
  "overallScore": 45,
  "grades": [...]
}
```
```

**System Should**:
- Strip markdown backticks
- Parse JSON successfully
- Return score of 45

### Test 4: Good Technical Answer
**Input**:
```javascript
{
  question: "Explain React hooks",
  answer: "React hooks are functions that let you use state and lifecycle features in functional components. useState manages state, useEffect handles side effects, and useContext accesses context values."
}
```

**Expected Output**:
```json
{
  "overallScore": 70,
  "grades": [{
    "questionNumber": 1,
    "score": 70,
    "feedback": "Good understanding of React hooks demonstrated",
    "strengths": ["Mentioned key hooks", "Explained basic functionality"],
    "improvements": ["Could add more examples", "Discuss custom hooks"]
  }]
}
```

---

## 🐛 Debugging Steps

### Step 1: Check Console Logs
Look for these patterns in server console:

**Good Sign**:
```
✅ AI Grading successful. Overall Score: X
```

**Bad Sign**:
```
🔥 JSON Parse Error: ...
🔥 AI GRADING CRASH
```

### Step 2: Check Raw Response
If you see parse errors, check the raw response:
```
Raw AI Response (first 500 chars): ...
```

Common issues:
- HTML error page (503, 500)
- Markdown backticks not stripped
- Extra text before/after JSON
- Malformed JSON

### Step 3: Verify API Key
```bash
# In server directory
node -e "console.log('API Key:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET')"
```

### Step 4: Test Gemini API Directly
```javascript
// test-gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function test() {
  const result = await model.generateContent('Return only this JSON: {"test": true}');
  console.log('Response:', result.response.text());
}

test();
```

---

## 🚨 Common Errors & Solutions

### Error 1: "Failed to parse AI grading response"
**Cause**: Gemini returned markdown-wrapped JSON
**Solution**: Already fixed - response cleaning strips markdown

### Error 2: "Missing overallScore in AI response"
**Cause**: AI didn't follow JSON format
**Solution**: Check prompt is being sent correctly, verify API key

### Error 3: "Cannot read property 'text' of undefined"
**Cause**: Gemini API call failed
**Solution**: Check API key, check network, check Gemini API status

### Error 4: "AI grading service is not configured"
**Cause**: GEMINI_API_KEY not set in .env
**Solution**: Add valid API key to .env file

### Error 5: 500 error with no logs
**Cause**: Server crashed before logging
**Solution**: Check server is running, check MongoDB connection

---

## 📊 Response Format Validation

### Valid Response Structure
```json
{
  "overallScore": 0-100,
  "overallFeedback": "string",
  "grades": [
    {
      "questionNumber": 1,
      "score": 0-100,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    }
  ],
  "keyStrengths": ["string"],
  "areasForImprovement": ["string"],
  "recommendation": "string"
}
```

### Invalid Responses (Will Fail)
```json
// Missing overallScore
{
  "grades": [...]
}

// grades is not an array
{
  "overallScore": 50,
  "grades": "some string"
}

// Wrapped in markdown
```json
{
  "overallScore": 50
}
```
```

---

## 🔐 Security Notes

### Development Mode
- Returns detailed error messages
- Includes raw responses in error
- Shows stack traces

### Production Mode
- Returns generic error messages
- Hides sensitive details
- Logs errors server-side only

---

## 📈 Performance Monitoring

### Metrics to Track
1. **Success Rate**: % of successful gradings
2. **Average Score**: Mean score across all interviews
3. **Parse Errors**: Count of JSON parse failures
4. **API Errors**: Count of Gemini API failures
5. **Response Time**: Time to grade interview

### Log Analysis
```bash
# Count successful gradings
grep "✅ AI Grading successful" server.log | wc -l

# Count parse errors
grep "🔥 JSON Parse Error" server.log | wc -l

# Count crashes
grep "🔥 AI GRADING CRASH" server.log | wc -l
```

---

## 🎯 Next Steps

1. ✅ Test with real interviews
2. ✅ Monitor error logs for 24 hours
3. ✅ Verify gibberish detection works
4. ✅ Check score distribution (should be lower now)
5. ✅ Collect feedback from users
6. ✅ Fine-tune grading criteria if needed

---

## 📞 Support

If issues persist:
1. Check server console logs
2. Verify GEMINI_API_KEY is valid
3. Test Gemini API directly
4. Check MongoDB connection
5. Review error details in development mode
