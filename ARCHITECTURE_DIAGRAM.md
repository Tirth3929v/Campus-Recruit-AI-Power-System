# 🏗️ Dynamic AI Interview System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         FRONTEND (React + Vite)                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  AIInterviewRoomDynamic.jsx                                          │ │
│  │  ┌─────────────────────────────────────────────────────────────┐    │ │
│  │  │                                                             │    │ │
│  │  │  State Management:                                          │    │ │
│  │  │  • currentQuestion                                          │    │ │
│  │  │  • answer                                                   │    │ │
│  │  │  • conversationHistory []                                   │    │ │
│  │  │  • isAiSpeaking                                            │    │ │
│  │  │  • isListening                                             │    │ │
│  │  │  • currentTranscript                                       │    │ │
│  │  │                                                             │    │ │
│  │  └─────────────────────────────────────────────────────────────┘    │ │
│  │                                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │   Voice      │  │   Speech     │  │   Screen     │              │ │
│  │  │  Synthesis   │  │ Recognition  │  │  Recorder    │              │ │
│  │  │  (AI Speak)  │  │ (User Speak) │  │  Component   │              │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                    │                                        │
│                                    │ HTTP Requests (Axios)                 │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                      BACKEND (Node.js + Express)                            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  Routes (aiInterviewRoutes.js)                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────┐    │ │
│  │  │                                                             │    │ │
│  │  │  POST /api/ai-interview/next-question                      │    │ │
│  │  │  POST /api/interview/grade                                 │    │ │
│  │  │                                                             │    │ │
│  │  └─────────────────────────────────────────────────────────────┘    │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                    │                                        │
│                                    ▼                                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  Controllers                                                          │ │
│  │  ┌─────────────────────────────────────────────────────────────┐    │ │
│  │  │                                                             │    │ │
│  │  │  aiInterviewController.js                                  │    │ │
│  │  │  ┌───────────────────────────────────────────────────┐    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │  generateNextQuestion(req, res)                  │    │    │ │
│  │  │  │  • Receives: jobRole, skills, history            │    │    │ │
│  │  │  │  • Analyzes last answer                          │    │    │ │
│  │  │  │  • Generates contextual question                 │    │    │ │
│  │  │  │  • Returns: { nextQuestion, isComplete }         │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  └───────────────────────────────────────────────────┘    │    │ │
│  │  │                                                             │    │ │
│  │  │  interviewController.js                                    │    │ │
│  │  │  ┌───────────────────────────────────────────────────┐    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │  gradeInterview(req, res)                        │    │    │ │
│  │  │  │  • Receives: fullTranscript, jobId               │    │    │ │
│  │  │  │  • Grades each answer                            │    │    │ │
│  │  │  │  • Calculates overall score                      │    │    │ │
│  │  │  │  • Returns: scores, feedback, recommendation     │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  └───────────────────────────────────────────────────┘    │    │ │
│  │  │                                                             │    │ │
│  │  └─────────────────────────────────────────────────────────────┘    │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                    │                                        │
│                                    │ API Calls                             │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                      GOOGLE GEMINI AI SERVICE                               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  Gemini Flash Model                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐    │ │
│  │  │                                                             │    │ │
│  │  │  Question Generation Prompt:                               │    │ │
│  │  │  ┌───────────────────────────────────────────────────┐    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │  "You are an expert technical interviewer        │    │    │ │
│  │  │  │   hiring for [jobRole] with skills [skills].     │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │   Interview History:                             │    │    │ │
│  │  │  │   [conversationHistory]                          │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │   Instructions:                                  │    │    │ │
│  │  │  │   • If first question: Ask opening question      │    │    │ │
│  │  │  │   • If answer vague: Ask follow-up              │    │    │ │
│  │  │  │   • If answer good: Ask new question            │    │    │ │
│  │  │  │   • After 5+ questions: Mark complete           │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │   Return JSON:                                   │    │    │ │
│  │  │  │   { nextQuestion: '...', isComplete: false }    │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  └───────────────────────────────────────────────────┘    │    │ │
│  │  │                                                             │    │ │
│  │  │  Grading Prompt:                                           │    │ │
│  │  │  ┌───────────────────────────────────────────────────┐    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │  "Grade this interview transcript:               │    │    │ │
│  │  │  │   [fullTranscript]                               │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  │   Return JSON:                                   │    │    │ │
│  │  │  │   {                                              │    │    │ │
│  │  │  │     overallScore: 0-100,                        │    │    │ │
│  │  │  │     overallFeedback: '...',                     │    │    │ │
│  │  │  │     grades: [...],                              │    │    │ │
│  │  │  │     keyStrengths: [...],                        │    │    │ │
│  │  │  │     areasForImprovement: [...],                 │    │    │ │
│  │  │  │     recommendation: '...'                       │    │    │ │
│  │  │  │   }                                              │    │    │ │
│  │  │  │                                                   │    │    │ │
│  │  │  └───────────────────────────────────────────────────┘    │    │ │
│  │  │                                                             │    │ │
│  │  └─────────────────────────────────────────────────────────────┘    │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│   User       │
│  Starts      │
│  Interview   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Initial Request                                     │
│  ────────────────────────────────────────────────────────    │
│  Frontend → Backend                                          │
│  POST /next-question                                         │
│  {                                                           │
│    jobRole: "Software Developer",                           │
│    skills: "JavaScript, React",                             │
│    conversationHistory: []  ← Empty on first call           │
│  }                                                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: AI Processing                                       │
│  ────────────────────────────────────────────────────────    │
│  Backend → Gemini AI                                         │
│  "Generate first technical question for Software Developer   │
│   with JavaScript, React skills"                             │
│                                                              │
│  AI Response:                                                │
│  {                                                           │
│    nextQuestion: "What is your experience with React?",     │
│    isComplete: false                                         │
│  }                                                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Question Display                                    │
│  ────────────────────────────────────────────────────────    │
│  Backend → Frontend                                          │
│  Returns question                                            │
│                                                              │
│  Frontend Actions:                                           │
│  • Display question on screen                               │
│  • AI speaks question (Speech Synthesis)                    │
│  • Enable voice/text input                                  │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: User Answers                                        │
│  ────────────────────────────────────────────────────────    │
│  User speaks or types answer                                 │
│                                                              │
│  If speaking:                                                │
│  • Speech Recognition captures audio                         │
│  • Converts to text in real-time                            │
│  • Updates currentTranscript state                          │
│  • Shows live transcript                                    │
│                                                              │
│  Answer: "I have 3 years of experience with React..."       │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 5: Submit Answer                                       │
│  ────────────────────────────────────────────────────────    │
│  Frontend → Backend                                          │
│  POST /next-question                                         │
│  {                                                           │
│    jobRole: "Software Developer",                           │
│    skills: "JavaScript, React",                             │
│    conversationHistory: [                                   │
│      {                                                       │
│        question: "What is your experience with React?",     │
│        answer: "I have 3 years of experience..."           │
│      }                                                       │
│    ]                                                         │
│  }                                                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 6: AI Analyzes Answer                                  │
│  ────────────────────────────────────────────────────────    │
│  Backend → Gemini AI                                         │
│  "Analyze the candidate's answer. Was it comprehensive?"     │
│                                                              │
│  AI Decision Tree:                                           │
│  ┌─────────────────────────────────────────────┐            │
│  │ Is answer vague/incomplete?                 │            │
│  │ ┌─────────────┐         ┌─────────────┐    │            │
│  │ │    YES      │         │     NO      │    │            │
│  │ └──────┬──────┘         └──────┬──────┘    │            │
│  │        │                       │            │            │
│  │        ▼                       ▼            │            │
│  │  Ask follow-up          Ask new question   │            │
│  │  cross-question         on different topic │            │
│  └─────────────────────────────────────────────┘            │
│                                                              │
│  Example Follow-up:                                          │
│  "Can you explain React hooks in more detail?"              │
│                                                              │
│  Example New Question:                                       │
│  "How do you handle state management in React?"             │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 7: Repeat Steps 3-6                                    │
│  ────────────────────────────────────────────────────────    │
│  Continue until conversationHistory.length >= 5              │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 8: Interview Complete                                  │
│  ────────────────────────────────────────────────────────    │
│  Backend → Frontend                                          │
│  {                                                           │
│    nextQuestion: null,                                       │
│    isComplete: true                                          │
│  }                                                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 9: Grade Interview                                     │
│  ────────────────────────────────────────────────────────    │
│  Frontend → Backend                                          │
│  POST /grade                                                 │
│  {                                                           │
│    fullTranscript: [                                         │
│      { question: "...", answer: "..." },                    │
│      { question: "...", answer: "..." },                    │
│      { question: "...", answer: "..." },                    │
│      { question: "...", answer: "..." },                    │
│      { question: "...", answer: "..." }                     │
│    ],                                                        │
│    jobId: "session_1234567890"                              │
│  }                                                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 10: AI Grading                                         │
│  ────────────────────────────────────────────────────────    │
│  Backend → Gemini AI                                         │
│  "Grade this complete interview transcript"                  │
│                                                              │
│  AI Evaluates:                                               │
│  • Technical accuracy                                        │
│  • Depth of knowledge                                       │
│  • Communication skills                                     │
│  • Problem-solving ability                                  │
│  • Overall fit for role                                     │
│                                                              │
│  Returns:                                                    │
│  {                                                           │
│    overallScore: 85,                                         │
│    overallFeedback: "Strong candidate...",                  │
│    grades: [                                                 │
│      { questionNumber: 1, score: 80, feedback: "..." },    │
│      { questionNumber: 2, score: 90, feedback: "..." },    │
│      ...                                                     │
│    ],                                                        │
│    keyStrengths: ["Technical knowledge", "Clear comm."],   │
│    areasForImprovement: ["System design", "Algorithms"],   │
│    recommendation: "hire - Strong technical skills"         │
│  }                                                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 11: Display Results                                    │
│  ────────────────────────────────────────────────────────    │
│  Backend → Frontend                                          │
│  Returns grading results                                     │
│                                                              │
│  Frontend Displays:                                          │
│  • Circular score visualization (85%)                       │
│  • Overall feedback paragraph                               │
│  • Per-question scores and feedback                         │
│  • Key strengths list                                       │
│  • Areas for improvement                                    │
│  • Hiring recommendation                                    │
│  • Full transcript review                                   │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   Interview  │
│   Complete   │
│   ✅         │
└──────────────┘
```

---

## 🔄 State Management Flow

```
Frontend State Lifecycle:
═══════════════════════════════════════════════════════════════

Initial State:
┌─────────────────────────────────────────────────────────┐
│ step: 'instructions'                                    │
│ currentQuestion: ''                                     │
│ answer: ''                                              │
│ conversationHistory: []                                 │
│ isAiSpeaking: false                                     │
│ isListening: false                                      │
│ currentTranscript: ''                                   │
│ isInterviewComplete: false                              │
└─────────────────────────────────────────────────────────┘
                    │
                    │ User clicks "Start Interview"
                    ▼
┌─────────────────────────────────────────────────────────┐
│ step: 'interview'                                       │
│ loading: true                                           │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Fetch first question
                    ▼
┌─────────────────────────────────────────────────────────┐
│ currentQuestion: "What is your experience with React?"  │
│ isAiSpeaking: true  ← AI reads question                │
│ loading: false                                          │
└─────────────────────────────────────────────────────────┘
                    │
                    │ User clicks mic button
                    ▼
┌─────────────────────────────────────────────────────────┐
│ isListening: true                                       │
│ currentTranscript: "I have three years..."  ← Live     │
│ answer: "I have three years..."  ← Updates in real-time│
└─────────────────────────────────────────────────────────┘
                    │
                    │ User clicks "Submit & Continue"
                    ▼
┌─────────────────────────────────────────────────────────┐
│ conversationHistory: [                                  │
│   {                                                     │
│     question: "What is your experience with React?",   │
│     answer: "I have three years..."                    │
│   }                                                     │
│ ]                                                       │
│ answer: ''  ← Reset for next question                  │
│ currentTranscript: ''  ← Reset                         │
│ loading: true  ← Fetching next question                │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Repeat for each question
                    ▼
┌─────────────────────────────────────────────────────────┐
│ conversationHistory: [                                  │
│   { question: "...", answer: "..." },  ← Q1            │
│   { question: "...", answer: "..." },  ← Q2            │
│   { question: "...", answer: "..." },  ← Q3            │
│   { question: "...", answer: "..." },  ← Q4            │
│   { question: "...", answer: "..." }   ← Q5            │
│ ]                                                       │
│ isInterviewComplete: true                               │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Trigger grading
                    ▼
┌─────────────────────────────────────────────────────────┐
│ step: 'results'                                         │
│ gradingResult: {                                        │
│   overallScore: 85,                                     │
│   overallFeedback: "...",                              │
│   grades: [...],                                        │
│   keyStrengths: [...],                                 │
│   areasForImprovement: [...]                           │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

```
App
 │
 ├── Router
 │    │
 │    ├── /interview/static
 │    │    └── AIInterviewRoom
 │    │         ├── ScreenRecorder
 │    │         ├── Voice Controls
 │    │         └── Progress Tracker
 │    │
 │    └── /interview/dynamic
 │         └── AIInterviewRoomDynamic
 │              ├── ScreenRecorder
 │              ├── Voice Controls
 │              ├── Progress Tracker
 │              └── Results Display
 │
 └── API Service Layer
      ├── axios.post('/next-question')
      └── axios.post('/grade')
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Client (Browser)                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │  • JWT Token stored in localStorage               │ │
│  │  • No API keys exposed                            │ │
│  │  • HTTPS only in production                       │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Authorization: Bearer <token>
                      │
┌─────────────────────▼───────────────────────────────────┐
│  Backend Server                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Middleware:                                      │ │
│  │  • Verify JWT token                              │ │
│  │  • Validate request body                         │ │
│  │  • Rate limiting                                 │ │
│  │  • Sanitize inputs                               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Environment Variables:                           │ │
│  │  • GEMINI_API_KEY (never exposed)                │ │
│  │  • JWT_SECRET                                     │ │
│  │  • Database credentials                          │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ API Key in headers
                      │
┌─────────────────────▼───────────────────────────────────┐
│  Google Gemini AI                                       │
│  • Secure API communication                             │
│  • No user data stored by AI                           │
│  • Rate limits enforced                                │
└─────────────────────────────────────────────────────────┘
```

---

**Created:** 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
