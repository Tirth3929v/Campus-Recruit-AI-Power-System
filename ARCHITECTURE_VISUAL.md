# 🏗️ System Architecture Diagram

## Campus Recruitment System - Complete Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER (React + Vite)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │    Admin     │  │   Employee   │  │     User     │  │   Company    │   │
│  │  Portal      │  │   Portal     │  │   Portal     │  │   Portal     │   │
│  │  :5173       │  │   :5174      │  │   :5175      │  │   :5177      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │                  │            │
│         └─────────────────┴──────────────────┴──────────────────┘            │
│                                     │                                         │
└─────────────────────────────────────┼─────────────────────────────────────────┘
                                      │
                                      │ HTTP/HTTPS + WebSocket
                                      │
┌─────────────────────────────────────┼─────────────────────────────────────────┐
│                                     ▼                                         │
│                          BACKEND LAYER (Node.js + Express)                   │
│                                  :5000                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API ROUTES                                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  /api/auth/*          - Authentication (Login, Register, OTP)       │   │
│  │  /api/user/*          - User Profile & Management                   │   │
│  │  /api/dashboard       - Dashboard Data                              │   │
│  │  /api/ai-interview/*  - AI Interview Management                     │   │
│  │  /api/interviews/*    - Interview Grading & History                 │   │
│  │  /api/courses/*       - Course Management                           │   │
│  │  /api/jobs/*          - Job Postings                                │   │
│  │  /api/company/*       - Company Management                          │   │
│  │  /api/admin/*         - Admin Operations                            │   │
│  │  /api/chat            - AI Chat Assistant                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         MIDDLEWARE                                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • verifyToken        - JWT Authentication                          │   │
│  │  • optionalAuth       - Optional Authentication                     │   │
│  │  • errorHandler       - Global Error Handling                       │   │
│  │  • uploadMiddleware   - File Upload (Multer)                        │   │
│  │  • CORS               - Cross-Origin Resource Sharing               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CONTROLLERS                                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • authController          - User Authentication                    │   │
│  │  • aiInterviewController   - AI Interview Logic                     │   │
│  │  • interviewController     - Interview Grading                      │   │
│  │  • courseController        - Course Management                      │   │
│  │  • companyController       - Company Operations                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────┬───────────────────────┬─────────────────────────┘
                            │                       │
                            ▼                       ▼
┌───────────────────────────────────┐  ┌──────────────────────────────────────┐
│     DATABASE LAYER (MongoDB)      │  │    EXTERNAL SERVICES                 │
│         :27017                     │  │                                      │
├───────────────────────────────────┤  ├──────────────────────────────────────┤
│                                   │  │                                      │
│  ┌─────────────────────────────┐ │  │  ┌────────────────────────────────┐ │
│  │  Collections:               │ │  │  │  Google Gemini AI API          │ │
│  ├─────────────────────────────┤ │  │  ├────────────────────────────────┤ │
│  │  • users                    │ │  │  │  • Question Generation         │ │
│  │  • students                 │ │  │  │  • Answer Evaluation           │ │
│  │  • employees                │ │  │  │  • Feedback Generation         │ │
│  │  • companies                │ │  │  │  • Chat Assistant              │ │
│  │  • admins                   │ │  │  └────────────────────────────────┘ │
│  │  • aiinterviewsessions      │ │  │                                      │
│  │  • studentprofiles          │ │  │  ┌────────────────────────────────┐ │
│  │  • courses                  │ │  │  │  Email Service (Nodemailer)    │ │
│  │  • enrollments              │ │  │  ├────────────────────────────────┤ │
│  │  • jobs                     │ │  │  │  • OTP Emails                  │ │
│  │  • applications             │ │  │  │  • Password Reset              │ │
│  │  • legacyinterviews         │ │  │  │  • Account Approval            │ │
│  │  • studyresources           │ │  │  └────────────────────────────────┘ │
│  │  • notifications            │ │  │                                      │
│  │  • events                   │ │  │  ┌────────────────────────────────┐ │
│  └─────────────────────────────┘ │  │  │  Cloudinary (File Storage)     │ │
│                                   │  │  ├────────────────────────────────┤ │
└───────────────────────────────────┘  │  │  • Resume Upload               │ │
                                       │  │  • Profile Images              │ │
                                       │  │  • Course Materials            │ │
                                       │  └────────────────────────────────┘ │
                                       │                                      │
                                       └──────────────────────────────────────┘
```

---

## 🎯 AI Interview Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI INTERVIEW WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   Student    │
    │   Selects    │
    │   Topic      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Interview   │
    │  Starts      │
    │  (Camera +   │
    │   Mic On)    │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  AI Generates First Question             │
    │  (Based on Topic: MERN, Python, etc.)    │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  Question Displayed + AI Speaks          │
    │  Timer Starts (2:00)                     │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  Student Answers                         │
    │  (Voice OR Text)                         │
    │                                          │
    │  ┌────────────────┐  ┌────────────────┐ │
    │  │ Voice Input    │  │  Text Input    │ │
    │  │ (Speech-to-    │  │  (Keyboard)    │ │
    │  │  Text)         │  │                │ │
    │  └────────────────┘  └────────────────┘ │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  Proctoring Active                       │
    │  ✓ Face Detection                        │
    │  ✓ Multiple Faces Check                  │
    │  ✓ Gaze Tracking                         │
    │  ✓ Tab Switching Detection               │
    │  ✓ Window Blur Detection                 │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  Student Submits Answer                  │
    │  (OR Timer Expires → Auto-Submit)        │
    └──────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  AI Analyzes Answer                      │
    │  • Checks for gibberish                  │
    │  • Evaluates relevance                   │
    │  • Determines next question type         │
    └──────┬───────────────────────────────────┘
           │
           ├─────────────────┬─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐     ┌──────────┐
    │  Vague   │      │   Good   │     │ Gibberish│
    │  Answer  │      │  Answer  │     │  Answer  │
    └────┬─────┘      └────┬─────┘     └────┬─────┘
         │                 │                 │
         ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐     ┌──────────┐
    │ Follow-up│      │   New    │     │  Score   │
    │ Question │      │  Topic   │     │   = 0    │
    │ (Deeper) │      │ Question │     │          │
    └────┬─────┘      └────┬─────┘     └────┬─────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Question    │
                    │  Count < 5?  │
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │             │
                   YES           NO
                    │             │
                    ▼             ▼
            ┌──────────────┐  ┌──────────────┐
            │  Next        │  │  Interview   │
            │  Question    │  │  Complete    │
            └──────────────┘  └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────────────┐
                              │  AI Grades Interview │
                              │  • Overall Score     │
                              │  • Feedback          │
                              │  • Strengths         │
                              │  • Improvements      │
                              └──────┬───────────────┘
                                     │
                                     ▼
                              ┌──────────────────────┐
                              │  Results Displayed   │
                              │  • Score (0-100%)    │
                              │  • Detailed Feedback │
                              │  • Transcript        │
                              └──────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   User       │
    │   Visits     │
    │   Site       │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Has         │
    │  Account?    │
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
   YES           NO
    │             │
    ▼             ▼
┌────────┐   ┌────────────┐
│ Login  │   │  Register  │
│ Page   │   │  Page      │
└───┬────┘   └─────┬──────┘
    │              │
    │              ▼
    │        ┌──────────────┐
    │        │  Fill Form   │
    │        │  • Name      │
    │        │  • Email     │
    │        │  • Password  │
    │        └──────┬───────┘
    │               │
    │               ▼
    │        ┌──────────────┐
    │        │  OTP Sent    │
    │        │  to Email    │
    │        └──────┬───────┘
    │               │
    │               ▼
    │        ┌──────────────┐
    │        │  Enter OTP   │
    │        └──────┬───────┘
    │               │
    │               ▼
    │        ┌──────────────┐
    │        │  Verify OTP  │
    │        └──────┬───────┘
    │               │
    └───────────────┘
                    │
                    ▼
            ┌──────────────┐
            │  Generate    │
            │  JWT Token   │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │  Store Token │
            │  in:         │
            │  • Cookie    │
            │  • LocalStor │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │  Redirect to │
            │  Dashboard   │
            └──────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                Backend              Database           External API
    ────────                ───────              ────────           ────────────

    ┌────────┐              ┌────────┐          ┌────────┐         ┌────────┐
    │ React  │──── HTTP ───→│Express │──Query──→│MongoDB │         │ Gemini │
    │  App   │              │ Server │          │        │         │   AI   │
    └────┬───┘              └───┬────┘          └───┬────┘         └───┬────┘
         │                      │                   │                  │
         │  1. User Action      │                   │                  │
         │─────────────────────→│                   │                  │
         │                      │                   │                  │
         │                      │  2. Validate      │                  │
         │                      │     Request       │                  │
         │                      │                   │                  │
         │                      │  3. Query DB      │                  │
         │                      │──────────────────→│                  │
         │                      │                   │                  │
         │                      │  4. Return Data   │                  │
         │                      │←──────────────────│                  │
         │                      │                   │                  │
         │                      │  5. Call AI API   │                  │
         │                      │──────────────────────────────────────→│
         │                      │                   │                  │
         │                      │  6. AI Response   │                  │
         │                      │←──────────────────────────────────────│
         │                      │                   │                  │
         │                      │  7. Save to DB    │                  │
         │                      │──────────────────→│                  │
         │                      │                   │                  │
         │  8. Send Response    │                   │                  │
         │←─────────────────────│                   │                  │
         │                      │                   │                  │
         │  9. Update UI        │                   │                  │
         │                      │                   │                  │
```

---

## 🎨 Component Hierarchy

```
App.jsx
│
├── AuthProvider (Context)
│   └── ThemeProvider (Context)
│       │
│       ├── BrowserRouter
│       │   │
│       │   ├── Routes
│       │   │   │
│       │   │   ├── /login → Login
│       │   │   ├── /register → Register
│       │   │   │
│       │   │   └── /company → ProtectedRoute
│       │   │       │
│       │   │       └── CompanyLayout
│       │   │           │
│       │   │           ├── Sidebar
│       │   │           ├── Header
│       │   │           │
│       │   │           └── Outlet
│       │   │               │
│       │   │               ├── /dashboard → CompanyDashboard
│       │   │               ├── /jobs → ManageJobs
│       │   │               ├── /applicants → ApplicantsPage
│       │   │               ├── /candidates → CandidateDirectory
│       │   │               ├── /courses → CoursesPage
│       │   │               ├── /profile → CompanyProfilePage
│       │   │               └── /notifications → NotificationsPage
│       │   │
│       │   └── /admin → ProtectedRoute
│       │       │
│       │       └── AdminLayout
│       │           │
│       │           ├── /dashboard → AdminDashboard
│       │           ├── /users → ManageUsers
│       │           └── /jobs → AdminJobApproval
```

---

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    Global State (Context API)
    ──────────────────────────
    
    ┌──────────────────────┐
    │   AuthContext        │
    ├──────────────────────┤
    │  • user              │
    │  • token             │
    │  • isAuthenticated   │
    │  • login()           │
    │  • logout()          │
    │  • register()        │
    └──────────────────────┘
    
    ┌──────────────────────┐
    │   ThemeContext       │
    ├──────────────────────┤
    │  • theme             │
    │  • toggleTheme()     │
    └──────────────────────┘
    
    
    Component State (useState)
    ──────────────────────────
    
    ┌──────────────────────────────┐
    │  AIInterviewRoomDynamic      │
    ├──────────────────────────────┤
    │  • step                      │
    │  • currentQuestion           │
    │  • conversationHistory       │
    │  • timeLeft                  │
    │  • loading                   │
    │  • warnings                  │
    │  • isListening               │
    │  • currentTranscript         │
    │  • gradingResult             │
    └──────────────────────────────┘
```

---

**Last Updated**: January 2025
**Version**: 1.0.0
