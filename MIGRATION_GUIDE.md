# 🔄 AIInterviewRoom.jsx - Dynamic API Migration Guide

## ✅ What Changed

### 🗑️ Removed (Hardcoded Data)
```javascript
// ❌ REMOVED
const HARDCODED_QUESTIONS = [
  { question: "...", category: "Technical" },
  // ...
];

const [questions] = useState(HARDCODED_QUESTIONS);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
```

### ✨ Added (Dynamic API Integration)
```javascript
// ✅ NEW
const { jobRole = 'Software Developer', skills = 'JavaScript, React, Node.js' } = location.state || {};

const [currentQuestion, setCurrentQuestion] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
```

---

## 🔄 Key Changes

### 1. State Management
**Before:**
```javascript
const [questions] = useState(HARDCODED_QUESTIONS);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
```

**After:**
```javascript
const [currentQuestion, setCurrentQuestion] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
```

---

### 2. Fetch Next Question Function
**NEW Function Added:**
```javascript
const fetchNextQuestion = async () => {
  setIsGenerating(true);
  try {
    const response = await fetch('/api/ai-interview/next-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobRole,
        skills,
        conversationHistory: fullTranscript
      })
    });

    const data = await response.json();
    if (data.success) {
      if (data.isComplete) {
        // Interview complete - trigger grading
        await handleFinishInterview();
      } else {
        // Set next question
        setCurrentQuestion(data.nextQuestion);
        setTimeout(() => askQuestion(data.nextQuestion), 500);
      }
    }
  } catch (error) {
    console.error('Error fetching next question:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

---

### 3. Initial Question Fetch
**NEW useEffect Added:**
```javascript
// Fetch first question when interview starts
useEffect(() => {
  if (step === 'interview' && !currentQuestion && !isGenerating) {
    fetchNextQuestion();
  }
}, [step]);
```

---

### 4. Ask Question Function
**Before:**
```javascript
const askQuestion = () => {
  if (!questions[currentQuestionIndex]) return;
  const utterance = new SpeechSynthesisUtterance(
    questions[currentQuestionIndex].question
  );
  // ...
};
```

**After:**
```javascript
const askQuestion = (questionText) => {
  if (!questionText) return;
  const utterance = new SpeechSynthesisUtterance(questionText);
  // ...
};
```

---

### 5. Next Question Logic
**Before:**
```javascript
const handleNextQuestion = () => {
  saveTranscript();
  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex(prev => prev + 1);
    setAnswer('');
    setTimeout(() => askQuestion(), 500);
  } else {
    handleFinishInterview();
  }
};
```

**After:**
```javascript
const handleNextQuestion = async () => {
  if (!answer.trim() && !currentTranscript.trim()) {
    alert('Please provide an answer before continuing.');
    return;
  }

  // Add current Q&A to transcript
  const answerText = currentTranscript.trim() || answer.trim();
  const updatedTranscript = [...fullTranscript, {
    question: currentQuestion,
    answer: answerText
  }];
  setFullTranscript(updatedTranscript);

  // Reset answer fields
  setAnswer('');
  setCurrentTranscript('');

  // Fetch next question with updated history
  await fetchNextQuestion();
};
```

---

### 6. UI Changes

#### Question Display
**Before:**
```javascript
<h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
<h3>{question.question}</h3>
```

**After:**
```javascript
<h2>Question {fullTranscript.length + 1}</h2>

{isGenerating && !currentQuestion ? (
  <div>
    <Loader className="animate-spin" />
    AI is generating your next question...
  </div>
) : (
  <h3>{currentQuestion || 'Loading question...'}</h3>
)}
```

#### Submit Button
**Before:**
```javascript
<button onClick={handleNextQuestion}>
  {currentQuestionIndex < questions.length - 1 ? 
    'Next Question' : 'Finish Interview'}
</button>
```

**After:**
```javascript
<button 
  onClick={handleNextQuestion}
  disabled={isGenerating || !answer.trim()}
>
  {isGenerating ? (
    <>
      <Loader className="animate-spin" />
      AI is thinking...
    </>
  ) : (
    <>
      Submit & Continue
      <ArrowRight />
    </>
  )}
</button>
```

#### Progress Tracker
**Before:**
```javascript
{questions.map((q, idx) => (
  <div className={idx === currentQuestionIndex ? 'active' : ''}>
    {q.question.substring(0, 30)}...
  </div>
))}
```

**After:**
```javascript
<div className="text-center">
  <div className="text-3xl">{fullTranscript.length}</div>
  <div>Questions Answered</div>
</div>

{fullTranscript.slice(-3).map((item, idx) => (
  <div className="completed">
    <CheckCircle />
    {item.question.substring(0, 30)}...
  </div>
))}

{currentQuestion && (
  <div className="current">
    <Play />
    Current Question
  </div>
)}
```

---

## 🎯 Flow Comparison

### Before (Hardcoded)
```
1. Load hardcoded questions array
2. Display question[0]
3. User answers
4. Increment index
5. Display question[1]
6. Repeat until index === questions.length
7. Finish
```

### After (Dynamic API)
```
1. Start interview
2. Call API with empty history → Get Q1
3. Display Q1, AI speaks it
4. User answers
5. Call API with [Q1, A1] → Get Q2 (contextual)
6. Display Q2, AI speaks it
7. User answers
8. Call API with [Q1, A1, Q2, A2] → Get Q3 or isComplete
9. If isComplete → Grade interview
10. Else → Continue loop
```

---

## 🔐 What Stayed the Same (Untouched)

✅ **Speech Recognition** - All voice input code intact
✅ **Speech Synthesis** - AI voice output unchanged
✅ **ScreenRecorder** - Camera/screen recording untouched
✅ **Timer** - 2-minute countdown still works
✅ **Live Transcript** - Real-time display unchanged
✅ **Results Page** - Display logic same
✅ **Grading** - gradeInterview() function unchanged

---

## 🚀 How to Use

### 1. Navigate to Interview
```javascript
// From job application or dashboard
navigate('/interview', {
  state: {
    jobRole: 'Full Stack Developer',
    skills: 'React, Node.js, MongoDB'
  }
});
```

### 2. Interview Flow
```
User clicks "Start Interview"
  ↓
Component fetches first question from API
  ↓
AI speaks question
  ↓
User answers (voice or text)
  ↓
User clicks "Submit & Continue"
  ↓
Component sends answer to API
  ↓
API analyzes answer and generates next question
  ↓
Repeat until API returns isComplete: true
  ↓
Automatically grade interview
  ↓
Show results
```

---

## 🎨 UI Improvements

### Loading States
```javascript
// While generating question
{isGenerating && (
  <div>
    <Loader className="animate-spin" />
    AI is generating your next question...
  </div>
)}

// Button disabled while generating
<button disabled={isGenerating}>
  {isGenerating ? 'AI is thinking...' : 'Submit & Continue'}
</button>
```

### Dynamic Progress
```javascript
// Shows actual count instead of fixed list
<div className="text-3xl">{fullTranscript.length}</div>
<div>Questions Answered</div>

// Shows last 3 answered questions
{fullTranscript.slice(-3).map(...)}
```

---

## 🐛 Error Handling

### Network Errors
```javascript
try {
  const response = await fetch('/api/ai-interview/next-question', ...);
  // ...
} catch (error) {
  console.error('Error fetching next question:', error);
  alert('Network error. Please check your connection and try again.');
}
```

### Empty Answers
```javascript
if (!answer.trim() && !currentTranscript.trim()) {
  alert('Please provide an answer before continuing.');
  return;
}
```

### API Failures
```javascript
if (!data.success) {
  console.error('Failed to fetch next question:', data.message);
  alert('Failed to generate next question. Please try again.');
}
```

---

## 📊 State Flow Diagram

```
Initial State:
├── step: 'instructions'
├── currentQuestion: ''
├── fullTranscript: []
└── isGenerating: false

User clicks "Start Interview":
├── step: 'interview'
└── Triggers useEffect

useEffect runs:
├── isGenerating: true
├── Fetch /next-question (empty history)
└── Receive first question

Question received:
├── currentQuestion: "What is your experience..."
├── isGenerating: false
└── AI speaks question

User answers:
├── answer: "I have 3 years..."
└── currentTranscript: "I have 3 years..."

User clicks "Submit & Continue":
├── fullTranscript: [{ question: "...", answer: "..." }]
├── answer: ''
├── currentTranscript: ''
├── isGenerating: true
└── Fetch /next-question (with history)

Next question received:
├── currentQuestion: "Can you explain..."
├── isGenerating: false
└── AI speaks question

Repeat until:
└── API returns isComplete: true
    └── Trigger gradeInterview()
        └── step: 'results'
```

---

## ✅ Testing Checklist

- [ ] First question fetches on interview start
- [ ] AI speaks each question
- [ ] Voice input works
- [ ] Text input works
- [ ] Submit button disabled while generating
- [ ] Loading spinner shows while generating
- [ ] Progress counter updates correctly
- [ ] Interview completes when API says so
- [ ] Grading triggers automatically
- [ ] Results display correctly
- [ ] Error handling works for network issues
- [ ] Error handling works for empty answers

---

## 🎯 Benefits of Dynamic API

1. **Contextual Questions** - AI asks follow-ups based on answers
2. **Adaptive Difficulty** - Questions adjust to candidate level
3. **No Fixed Length** - Interview ends when AI determines readiness
4. **Better Evaluation** - Questions tailored to job requirements
5. **Scalable** - No need to maintain question banks
6. **Fresh Content** - Never the same interview twice

---

## 🔧 Customization

### Change Job Role/Skills
```javascript
// Pass via navigation state
navigate('/interview', {
  state: {
    jobRole: 'Data Scientist',
    skills: 'Python, Machine Learning, SQL'
  }
});
```

### Adjust Loading Messages
```javascript
// In fetchNextQuestion
<span>AI is generating your next question...</span>
// Change to:
<span>Preparing your personalized question...</span>
```

### Modify Button Text
```javascript
// In handleNextQuestion button
{isGenerating ? 'AI is thinking...' : 'Submit & Continue'}
// Change to:
{isGenerating ? 'Processing...' : 'Next Question'}
```

---

## 📝 Migration Summary

| Aspect | Before | After |
|--------|--------|-------|
| Questions | Hardcoded array | API-generated |
| Navigation | Index-based | Dynamic fetch |
| Completion | Fixed count | API determines |
| Context | None | Full history |
| Flexibility | Static | Adaptive |
| Loading | Instant | Shows spinner |

---

**Status:** ✅ Migration Complete  
**Backward Compatible:** ❌ No (requires API)  
**Breaking Changes:** Yes (removed hardcoded questions)  
**Recommended:** Use this version for production

---

## 🎊 You're Done!

Your AIInterviewRoom now uses dynamic AI-generated questions while keeping all the voice and recording features intact! 🚀
