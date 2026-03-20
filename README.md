# Campus Recruitment System

A comprehensive full-stack application for campus recruitment management, featuring AI-powered interviews, job tracking, and course management.

## Project Structure

```
campus-recruitment-system/
├── client/ (React Frontend)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, icons, global styles
│   │   ├── components/         # Reusable UI components (Buttons, Cards, Navbar)
│   │   ├── context/            # Context API (AuthContext, UserContext)
│   │   ├── hooks/              # Custom hooks (useMediaRecorder, useAuth)
│   │   ├── layouts/            # Layout wrappers (DashboardLayout, AuthLayout)
│   │   ├── pages/              # Page views
│   │   │   ├── Auth/           # Login, Signup
│   │   │   ├── Dashboard/      # Home, Profile
│   │   │   ├── Education/      # Courses, Languages
│   │   │   └── Career/         # Jobs, AIInterview
│   │   ├── services/           # Axios instances & API calls (api.js)
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Main App component with Routes
│   │   └── main.jsx            # Entry point
│   ├── tailwind.config.js
│   └── package.json
│
├── server/ (Express Backend)
│   ├── config/                 # DB connection, Passport strategies
│   ├── controllers/            # Logic for routes (authController, interviewController)
│   ├── middleware/             # Auth checks, Error handling
│   ├── models/                 # Mongoose Schemas (User, Job, Course)
│   ├── routes/                 # Express routes definitions
│   ├── utils/                  # Helper functions (Cloudinary upload, etc.)
│   ├── .env                    # Environment variables
│   ├── server.js               # Entry point
│   └── package.json
│
└── README.md
```

## Features

### Frontend (React + Vite + Tailwind CSS)
- **Dashboard Layout**: Responsive sidebar navigation with animated transitions
- **Authentication**: Login/Signup with context-based state management
- **Job Management**: Browse, apply, and track job applications
- **Course Management**: Enroll in courses and track progress
- **AI Interview Room**: Video interviews with screen recording capabilities
- **Profile Management**: User profile with resume upload
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend (Express + MongoDB)
- **User Authentication**: JWT-based auth with Google OAuth integration
- **Role-based Access**: Admin, Employee, and Student roles
- **Job Management**: CRUD operations for job postings
- **Interview Management**: Schedule and manage AI-powered interviews
- **File Upload**: Cloudinary integration for resume and profile images
- **Error Handling**: Comprehensive middleware for error management

### AI Service (Python + FastAPI)
- **Interview Analysis**: Gemini API integration for interview evaluation
- **Real-time Processing**: FastAPI for high-performance AI endpoints

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB
- Python 3.8+ (for AI service)
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campus-recruitment-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-recruitment
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GEMINI_API_KEY=your-gemini-api-key
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. AI Service Setup (Optional)
```bash
cd ../ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

## Usage

### For Students
1. Register/Login to the platform
2. Complete your profile with resume upload
3. Browse available jobs and apply
4. Enroll in skill development courses
5. Participate in AI-powered interviews

### For Employers
1. Login with employer credentials
2. Post new job openings
3. Review student applications
4. Schedule interviews
5. Manage candidate pipeline

### For Admins
1. Login with admin credentials
2. Manage users and roles
3. Oversee job postings
4. Monitor system analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - User logout

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job (Admin/Employer)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Interviews
- `POST /api/interviews/start` - Start interview
- `POST /api/interviews/submit` - Submit interview response
- `GET /api/interviews/:id` - Get interview results

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses/enroll` - Enroll in course
- `GET /api/courses/progress` - Get course progress

## Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Passport.js
- Cloudinary
- Multer

### AI Service
- Python
- FastAPI
- Google Gemini API

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@campusrecruit.com or join our Slack channel.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with LinkedIn
- [ ] Real-time chat system
- [ ] Advanced AI interview features
- [ ] Multi-language support
