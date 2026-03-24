require('dotenv').config();
const mongoose = require('mongoose');

// Import ALL Models
const User = require('./models/User');
const CompanyProfile = require('./models/CompanyProfile');
const StudentProfile = require('./models/StudentProfile');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const AIInterviewSession = require('./models/AIInterviewSession');
const CommunityPost = require('./models/CommunityPost');
const SupportTicket = require('./models/SupportTicket');
const StudyResource = require('./models/StudyResource');
const LegacyInterview = require('./models/LegacyInterview');

// Connect to Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_recruit_v2')
  .then(() => console.log('✅ Connected to MongoDB for seeding'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

const seedData = async () => {
  try {
    console.log('\n🧹 Clearing ALL existing data...');

    // Drop ALL indexes across ALL collections before clearing data
    try {
      const collections = mongoose.connection.collections;
      for (const [name, collection] of Object.entries(collections)) {
        await collection.dropIndexes();
        console.log(`   Dropped indexes for: ${name}`);
      }
    } catch (e) { 
      console.log('   ⚠️ Some indexes may not exist, continuing...'); 
    }

    // Explicitly remove any stale admin users first
    await User.deleteMany({ email: 'admin@gmail.com' });
    console.log('   ✓ Removed stale admin user if exists');
    
    await Promise.all([
      User.deleteMany({}),
      CompanyProfile.deleteMany({}),
      StudentProfile.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      AIInterviewSession.deleteMany({}),
      CommunityPost.deleteMany({}),
      SupportTicket.deleteMany({}),
      StudyResource.deleteMany({}),
      LegacyInterview.deleteMany({})
    ]);

    console.log('   ✓ All collections cleared\n');

    // ═══════════════════════════════════════════════════════════
    // 1. USERS
    // ═══════════════════════════════════════════════════════════
    console.log('👤 Creating users...');

    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@gmail.com' },
      {
        name: 'Admin User', email: 'admin@gmail.com',
        password: 'Admin@123', role: 'admin', isVerified: true, currentStreak: 0
      },
      { upsert: true, new: true, runValidators: true }
    );

    const companyUsers = await Promise.all([
      { name: 'Tech Corp Recruiter', email: 'recruiter@techcorp.com', password: 'Recruiter@123', role: 'company', isVerified: true },
      { name: 'DataSystems HR', email: 'hr@datasystems.com', password: 'Recruiter@123', role: 'company', isVerified: true },
      { name: 'StartupXYZ Lead', email: 'lead@startupxyz.com', password: 'Recruiter@123', role: 'company', isVerified: true }
    ].map(userData => User.findOneAndUpdate(
      { email: userData.email },
      userData,
      { upsert: true, new: true, runValidators: true }
    )));

    const studentUsers = await Promise.all([
      { name: 'Tirth Patel', email: 'tirth@student.com', password: 'Student@123', role: 'student', course: 'BCA Final Year', isVerified: true, currentStreak: 7 },
      { name: 'Alice Johnson', email: 'alice@student.com', password: 'Student@123', role: 'student', course: 'B.Tech CS', isVerified: true, currentStreak: 12 },
      { name: 'Bob Smith', email: 'bob@student.com', password: 'Student@123', role: 'student', course: 'BCA Final Year', isVerified: true, currentStreak: 5 },
      { name: 'Charlie Davis', email: 'charlie@student.com', password: 'Student@123', role: 'student', course: 'MCA', isVerified: true, currentStreak: 3 },
      { name: 'Diana Evans', email: 'diana@student.com', password: 'Student@123', role: 'student', course: 'B.Tech IT', isVerified: true, currentStreak: 9 }
    ].map(userData => User.findOneAndUpdate(
      { email: userData.email },
      userData,
      { upsert: true, new: true, runValidators: true }
    )));
    console.log(`   ✓ Created 1 admin, ${companyUsers.length} company, ${studentUsers.length} students\n`);

    // ═══════════════════════════════════════════════════════════
    // 2. COMPANY PROFILES
    // ═══════════════════════════════════════════════════════════
    console.log('🏢 Creating company profiles...');
    const companies = await CompanyProfile.create([
      {
        userId: companyUsers[0]._id, companyName: 'Tech Corp',
        description: 'Leading innovator in AI and Cloud Computing solutions, serving Fortune 500 clients worldwide.',
        website: 'https://techcorp.example.com', location: 'San Francisco, CA', industry: 'Technology',
        logo: 'https://placehold.co/150x150?text=TC'
      },
      {
        userId: companyUsers[1]._id, companyName: 'DataSystems Inc',
        description: 'Enterprise data solutions provider specializing in big data analytics and business intelligence.',
        website: 'https://datasystems.example.com', location: 'New York, NY', industry: 'Data & Analytics',
        logo: 'https://placehold.co/150x150?text=DS'
      },
      {
        userId: companyUsers[2]._id, companyName: 'StartupXYZ',
        description: 'Fast-growing fintech startup revolutionizing digital payments and blockchain solutions.',
        website: 'https://startupxyz.example.com', location: 'Austin, TX', industry: 'FinTech',
        logo: 'https://placehold.co/150x150?text=SX'
      }
    ]);
    console.log(`   ✓ Created ${companies.length} company profiles\n`);

    // ═══════════════════════════════════════════════════════════
    // 3. STUDENT PROFILES
    // ═══════════════════════════════════════════════════════════
    console.log('🎓 Creating student profiles...');
    const studentProfiles = await StudentProfile.create([
      {
        user: studentUsers[0]._id, phone: '9876543210', course: 'BCA Final Year',
        bio: 'Aspiring Full Stack Developer with a passion for React and Node.js. Active open-source contributor.',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Python', 'Git'],
        cgpa: 8.5, graduationYear: 2026, streak: 7, weeklyGoal: 5
      },
      {
        user: studentUsers[1]._id, phone: '9876543211', course: 'B.Tech CS',
        bio: 'Machine Learning enthusiast with strong foundation in data structures and algorithms.',
        skills: ['Python', 'TensorFlow', 'React', 'Java', 'SQL', 'AWS'],
        cgpa: 9.2, graduationYear: 2026, streak: 12, weeklyGoal: 4
      },
      {
        user: studentUsers[2]._id, phone: '9876543212', course: 'BCA Final Year',
        bio: 'Backend developer focused on building scalable microservices. AWS certified.',
        skills: ['Node.js', 'Express', 'Docker', 'PostgreSQL', 'Redis'],
        cgpa: 7.8, graduationYear: 2026, streak: 5, weeklyGoal: 3
      },
      {
        user: studentUsers[3]._id, phone: '9876543213', course: 'MCA',
        bio: 'Full Stack Developer with 2 years freelancing experience. Loves building SaaS products.',
        skills: ['React', 'Vue.js', 'Node.js', 'Firebase', 'TypeScript'],
        cgpa: 8.1, graduationYear: 2027, streak: 3, weeklyGoal: 3
      },
      {
        user: studentUsers[4]._id, phone: '9876543214', course: 'B.Tech IT',
        bio: 'UI/UX enthusiast and frontend specialist. Won 3 hackathons in the last year.',
        skills: ['React', 'Figma', 'Tailwind CSS', 'Next.js', 'GraphQL'],
        cgpa: 8.9, graduationYear: 2026, streak: 9, weeklyGoal: 4
      }
    ]);
    console.log(`   ✓ Created ${studentProfiles.length} student profiles\n`);

    // ═══════════════════════════════════════════════════════════
    // 4. JOBS (12 jobs across 3 companies)
    // ═══════════════════════════════════════════════════════════
    console.log('💼 Creating jobs...');
    const jobs = await Job.create([
      // Tech Corp jobs
      {
        company: companies[0]._id, postedBy: companyUsers[0]._id, title: 'Senior React Developer',
        description: 'Join our frontend team to build cutting-edge web applications using React, TypeScript, and modern tooling.',
        requirements: ['React', 'TypeScript', 'Redux', 'Jest'], type: 'Full-time', location: 'Remote',
        salary: '$90,000 - $130,000', status: 'Open', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[0]._id, postedBy: companyUsers[0]._id, title: 'Backend Engineer (Node.js)',
        description: 'Build scalable APIs and microservices for our cloud-native platform.',
        requirements: ['Node.js', 'MongoDB', 'Docker', 'AWS'], type: 'Full-time', location: 'San Francisco, CA',
        salary: '$100,000 - $140,000', status: 'Open', deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[0]._id, postedBy: companyUsers[0]._id, title: 'AI/ML Intern',
        description: 'Exciting internship opportunity working on machine learning models for natural language processing.',
        requirements: ['Python', 'PyTorch', 'Basic ML', 'Mathematics'], type: 'Internship', location: 'San Francisco, CA',
        salary: '$35/hr', status: 'Open', deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[0]._id, postedBy: companyUsers[0]._id, title: 'DevOps Engineer',
        description: 'Manage CI/CD pipelines, Kubernetes clusters, and cloud infrastructure.',
        requirements: ['AWS', 'Kubernetes', 'Terraform', 'GitHub Actions'], type: 'Full-time', location: 'Remote',
        salary: '$110,000 - $150,000', status: 'Open', deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },

      // DataSystems jobs
      {
        company: companies[1]._id, postedBy: companyUsers[1]._id, title: 'Data Analyst',
        description: 'Analyze complex datasets and create dashboards to drive business decisions.',
        requirements: ['SQL', 'Python', 'Tableau', 'Statistics'], type: 'Full-time', location: 'New York, NY',
        salary: '$75,000 - $95,000', status: 'Open', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[1]._id, postedBy: companyUsers[1]._id, title: 'Full Stack Developer',
        description: 'Build end-to-end data management products using React and Python.',
        requirements: ['React', 'Python', 'PostgreSQL', 'Redis'], type: 'Full-time', location: 'New York, NY',
        salary: '$95,000 - $125,000', status: 'Open', deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[1]._id, postedBy: companyUsers[1]._id, title: 'Data Engineering Intern',
        description: 'Learn to build ETL pipelines and work with big data technologies.',
        requirements: ['Python', 'SQL', 'Spark', 'AWS'], type: 'Internship', location: 'Remote',
        salary: '$30/hr', status: 'Open', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[1]._id, postedBy: companyUsers[1]._id, title: 'UI/UX Designer',
        description: 'Design intuitive interfaces for our enterprise analytics platform.',
        requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], type: 'Contract', location: 'New York, NY',
        salary: '$80,000 - $100,000', status: 'Open', deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },

      // StartupXYZ jobs
      {
        company: companies[2]._id, postedBy: companyUsers[2]._id, title: 'Blockchain Developer',
        description: 'Work on smart contracts and DeFi protocols for our payment platform.',
        requirements: ['Solidity', 'Ethereum', 'Web3.js', 'Node.js'], type: 'Full-time', location: 'Austin, TX',
        salary: '$120,000 - $160,000', status: 'Open', deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[2]._id, postedBy: companyUsers[2]._id, title: 'Mobile Developer (React Native)',
        description: 'Build cross-platform mobile payment applications.',
        requirements: ['React Native', 'JavaScript', 'Firebase', 'Redux'], type: 'Full-time', location: 'Remote',
        salary: '$85,000 - $115,000', status: 'Open', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[2]._id, postedBy: companyUsers[2]._id, title: 'QA Engineer',
        description: 'Ensure the quality and reliability of our financial software.',
        requirements: ['Selenium', 'Jest', 'Cypress', 'API Testing'], type: 'Full-time', location: 'Austin, TX',
        salary: '$70,000 - $90,000', status: 'Open', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        company: companies[2]._id, postedBy: companyUsers[2]._id, title: 'Marketing Intern',
        description: 'Help grow our brand presence and manage social media campaigns.',
        requirements: ['Social Media', 'Content Writing', 'Analytics', 'SEO'], type: 'Internship', location: 'Austin, TX',
        salary: '$25/hr', status: 'Open', deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`   ✓ Created ${jobs.length} jobs\n`);

    // ═══════════════════════════════════════════════════════════
    // 5. APPLICATIONS (students applying to jobs)
    // ═══════════════════════════════════════════════════════════
    console.log('📝 Creating applications...');
    const applicationData = [
      { job: jobs[0]._id, student: studentProfiles[0]._id, studentUserId: studentProfiles[0].user, status: 'Applied', coverLetter: 'I am passionate about React and would love to contribute to your team.' },
      { job: jobs[0]._id, student: studentProfiles[1]._id, studentUserId: studentProfiles[1].user, status: 'Shortlisted', coverLetter: 'My strong CS fundamentals and React experience make me a great fit.' },
      { job: jobs[0]._id, student: studentProfiles[4]._id, studentUserId: studentProfiles[4].user, status: 'Interview', coverLetter: 'As a hackathon winner and frontend specialist, I bring unique value.' },
      { job: jobs[1]._id, student: studentProfiles[0]._id, studentUserId: studentProfiles[0].user, status: 'Applied', coverLetter: 'I have extensive experience with Node.js and MongoDB.' },
      { job: jobs[1]._id, student: studentProfiles[2]._id, studentUserId: studentProfiles[2].user, status: 'Shortlisted', coverLetter: 'Backend development is my passion and I am AWS certified.' },
      { job: jobs[2]._id, student: studentProfiles[1]._id, studentUserId: studentProfiles[1].user, status: 'Applied', coverLetter: 'ML research is my primary interest and I have published papers.' },
      { job: jobs[2]._id, student: studentProfiles[3]._id, studentUserId: studentProfiles[3].user, status: 'Applied', coverLetter: 'I am eager to learn ML and already have Python experience.' },
      { job: jobs[4]._id, student: studentProfiles[1]._id, studentUserId: studentProfiles[1].user, status: 'Applied', coverLetter: 'My Python and statistics background aligns with this role.' },
      { job: jobs[4]._id, student: studentProfiles[3]._id, studentUserId: studentProfiles[3].user, status: 'Shortlisted', coverLetter: 'I love working with data and have freelance analytics experience.' },
      { job: jobs[5]._id, student: studentProfiles[0]._id, studentUserId: studentProfiles[0].user, status: 'Applied', coverLetter: 'Full stack is my strength with React + Python skills.' },
      { job: jobs[5]._id, student: studentProfiles[2]._id, studentUserId: studentProfiles[2].user, status: 'Applied', coverLetter: 'I can build end-to-end features independently.' },
      { job: jobs[5]._id, student: studentProfiles[4]._id, studentUserId: studentProfiles[4].user, status: 'Rejected', coverLetter: 'Looking to expand my backend skills.' },
      { job: jobs[8]._id, student: studentProfiles[2]._id, studentUserId: studentProfiles[2].user, status: 'Applied', coverLetter: 'I am learning Solidity and very interested in blockchain.' },
      { job: jobs[9]._id, student: studentProfiles[0]._id, studentUserId: studentProfiles[0].user, status: 'Applied', coverLetter: 'I have React Native experience from personal projects.' },
      { job: jobs[9]._id, student: studentProfiles[3]._id, studentUserId: studentProfiles[3].user, status: 'Applied', coverLetter: 'Mobile development with React Native is something I enjoy.' },
      { job: jobs[9]._id, student: studentProfiles[4]._id, studentUserId: studentProfiles[4].user, status: 'Shortlisted', coverLetter: 'My UI/UX background helps me build beautiful mobile apps.' },
      { job: jobs[7]._id, student: studentProfiles[4]._id, studentUserId: studentProfiles[4].user, status: 'Applied', coverLetter: 'UI/UX design is my core strength with Figma expertise.' },
      { job: jobs[10]._id, student: studentProfiles[2]._id, studentUserId: studentProfiles[2].user, status: 'Applied', coverLetter: 'I have experience with Cypress and Jest testing frameworks.' },
      { job: jobs[3]._id, student: studentProfiles[2]._id, studentUserId: studentProfiles[2].user, status: 'Applied', coverLetter: 'Docker and Kubernetes are part of my daily workflow.' },
      { job: jobs[3]._id, student: studentProfiles[1]._id, studentUserId: studentProfiles[1].user, status: 'Applied', coverLetter: 'I have AWS certifications and CI/CD experience.' },
    ];
    const applications = await Application.create(applicationData);

    // Also add applicants to job.applicants arrays
    for (const app of applicationData) {
      const sp = await StudentProfile.findById(app.student);
      if (sp) {
        await Job.findByIdAndUpdate(app.job, {
          $push: { applicants: { user: sp.user, status: app.status } }
        });
      }
    }
    console.log(`   ✓ Created ${applications.length} applications\n`);

    // ═══════════════════════════════════════════════════════════
    // 6. AI INTERVIEW SESSIONS
    // ═══════════════════════════════════════════════════════════
    console.log('🤖 Creating AI interview sessions...');
    const sessionsData = [];
    const focusOptions = [['React', 'JavaScript'], ['Node.js', 'Express'], ['Python', 'ML'], ['System Design'], ['Communication', 'HR'], ['Data Structures', 'Algorithms']];
    const sessionTypes = ['Practice', 'Mock', 'Assessment'];

    for (let i = 0; i < studentUsers.length; i++) {
      const numSessions = 2 + Math.floor(Math.random() * 4); // 2-5 sessions per student
      for (let j = 0; j < numSessions; j++) {
        const score = 45 + Math.floor(Math.random() * 50); // 45-95
        const focus = focusOptions[Math.floor(Math.random() * focusOptions.length)];
        sessionsData.push({
          user: studentUsers[i]._id,
          sessionType: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
          difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
          focusAreas: focus,
          status: 'Completed',
          overallScore: score,
          overallFeedback: score >= 80 ? 'Excellent performance! Strong technical knowledge.' :
            score >= 60 ? 'Good performance. Some areas for improvement.' :
              'Needs more practice. Focus on fundamentals.',
          startedAt: new Date(Date.now() - (30 - j * 5) * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - (30 - j * 5) * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
          totalTimeTaken: 1200 + Math.floor(Math.random() * 600),
          questions: [
            {
              question: `Explain the key concepts of ${focus[0]}`,
              questionCategory: 'Technical',
              userAnswer: `${focus[0]} is a technology used for building modern applications...`,
              aiEvaluation: { score: score, feedback: 'Good understanding demonstrated.', strengths: ['Clear explanation'], improvements: ['Add more examples'], keywordsFound: [focus[0]] },
              timeTaken: 180
            },
            {
              question: `What are best practices in ${focus[0]}?`,
              questionCategory: 'Technical',
              userAnswer: 'Best practices include code organization, testing, and documentation...',
              aiEvaluation: { score: score - 5, feedback: 'Decent answer.', strengths: ['Structured response'], improvements: ['More depth needed'], keywordsFound: ['testing', 'documentation'] },
              timeTaken: 200
            }
          ]
        });
      }
    }
    const sessions = await AIInterviewSession.create(sessionsData);
    console.log(`   ✓ Created ${sessions.length} AI interview sessions\n`);

    // ═══════════════════════════════════════════════════════════
    // 7. LEGACY INTERVIEWS (for backward compat)
    // ═══════════════════════════════════════════════════════════
    console.log('📋 Creating legacy interviews...');
    const legacyInterviews = await LegacyInterview.create([
      { userId: studentUsers[0]._id.toString(), date: 'Feb 18, 2026', subject: 'React JS', score: 85, status: 'Excellent' },
      { userId: studentUsers[0]._id.toString(), date: 'Feb 15, 2026', subject: 'Node.js Backend', score: 72, status: 'Good' },
      { userId: studentUsers[0]._id.toString(), date: 'Feb 10, 2026', subject: 'HR Round', score: 90, status: 'Outstanding' },
      { userId: studentUsers[1]._id.toString(), date: 'Feb 20, 2026', subject: 'Machine Learning', score: 95, status: 'Outstanding' },
      { userId: studentUsers[1]._id.toString(), date: 'Feb 12, 2026', subject: 'Data Structures', score: 88, status: 'Excellent' },
    ]);
    console.log(`   ✓ Created ${legacyInterviews.length} legacy interviews\n`);

    // ═══════════════════════════════════════════════════════════
    // 8. COURSES
    // ═══════════════════════════════════════════════════════════
    console.log('📚 Creating courses...');
    const courses = await Course.create([
      {
        title: 'Mastering React 2024', description: 'A comprehensive guide to building modern web apps with React, Hooks, and Redux.',
        instructor: 'Sarah Drasner', thumbnail: 'https://placehold.co/300x200?text=React+Course',
        duration: '12 hours', level: 'Intermediate', category: 'Development', price: '49.99', status: 'published',
        chapters: [
          { chapterId: 'ch1', title: 'Introduction to React', content: '## Why React?\n\nReact is a declarative, component-based library for building UIs.', order: 1 },
          { chapterId: 'ch2', title: 'React Hooks', content: '## useState & useEffect\n\nHooks let you use state and lifecycle in functional components.', order: 2 },
          { chapterId: 'ch3', title: 'State Management', content: '## Context API & Redux\n\nManaging global state in large applications.', order: 3 }
        ]
      },
      {
        title: 'Node.js for Beginners', description: 'Learn the basics of Node.js, Express, and building RESTful APIs.',
        instructor: 'Andrew Mead', thumbnail: 'https://placehold.co/300x200?text=Node.js+Course',
        duration: '8 hours', level: 'Beginner', category: 'Development', price: '29.99', status: 'published',
        chapters: [
          { chapterId: 'ch1', title: 'Getting Started with Node.js', content: '## What is Node.js?\n\nNode.js is a JavaScript runtime built on V8.', order: 1 },
          { chapterId: 'ch2', title: 'Express Framework', content: '## Building REST APIs\n\nExpress makes building web servers fast.', order: 2 }
        ]
      },
      {
        title: 'System Design Interview Prep', description: 'Crack system design interviews. Learn scalability, load balancing, and DB design.',
        instructor: 'Gaurav Sen', thumbnail: 'https://placehold.co/300x200?text=System+Design',
        duration: '15 hours', level: 'Advanced', category: 'Development', price: '79.99', status: 'published',
        chapters: [
          { chapterId: 'ch1', title: 'Scalability Basics', content: '## Horizontal vs Vertical Scaling', order: 1 }
        ]
      },
      {
        title: 'Python for Data Science', description: 'Master Python for data analysis, visualization, and machine learning.',
        instructor: 'Jose Portilla', thumbnail: 'https://placehold.co/300x200?text=Python+DS',
        duration: '20 hours', level: 'Intermediate', category: 'Data Science', price: '59.99', status: 'published',
        chapters: [
          { chapterId: 'ch1', title: 'Python Basics', content: '## Variables and Data Types\n\nPython supports int, float, str, list, dict.', order: 1 },
          { chapterId: 'ch2', title: 'Pandas & NumPy', content: '## Data Manipulation Libraries', order: 2 }
        ]
      },
      {
        title: 'MongoDB Complete Guide', description: 'Learn MongoDB from basics to advanced aggregation pipelines.',
        instructor: 'Max Schwarz', thumbnail: 'https://placehold.co/300x200?text=MongoDB',
        duration: '10 hours', level: 'Beginner', category: 'Development', price: '39.99', status: 'published',
        chapters: [
          { chapterId: 'ch1', title: 'Introduction to MongoDB', content: '## NoSQL Databases\n\nMongoDB is a document-based NoSQL database.', order: 1 }
        ]
      }
    ]);
    console.log(`   ✓ Created ${courses.length} courses\n`);

    // ═══════════════════════════════════════════════════════════
    // 9. ENROLLMENTS
    // ═══════════════════════════════════════════════════════════
    console.log('📖 Creating enrollments...');
    const enrollments = await Enrollment.create([
      { student: studentProfiles[0]._id, course: courses[0]._id, progress: 65 },
      { student: studentProfiles[0]._id, course: courses[1]._id, progress: 100, completed: true, completionDate: new Date() },
      { student: studentProfiles[1]._id, course: courses[2]._id, progress: 40 },
      { student: studentProfiles[1]._id, course: courses[3]._id, progress: 80 },
      { student: studentProfiles[2]._id, course: courses[1]._id, progress: 50 },
      { student: studentProfiles[3]._id, course: courses[0]._id, progress: 25 },
      { student: studentProfiles[4]._id, course: courses[0]._id, progress: 90 },
      { student: studentProfiles[4]._id, course: courses[4]._id, progress: 10 }
    ]);
    console.log(`   ✓ Created ${enrollments.length} enrollments\n`);

    // ═══════════════════════════════════════════════════════════
    // 10. COMMUNITY POSTS
    // ═══════════════════════════════════════════════════════════
    console.log('💬 Creating community posts...');
    const posts = await CommunityPost.create([
      {
        author: studentUsers[0]._id, content: 'Just completed my first mock interview on CampusRecruit! Got 85% on React. The AI feedback was incredibly detailed. Highly recommend everyone to try it! 🚀',
        tags: ['interview', 'react', 'experience'], likes: [studentUsers[1]._id, studentUsers[2]._id, studentUsers[4]._id],
        comments: [
          { author: studentUsers[1]._id, content: 'Congrats Tirth! What topics did they cover?' },
          { author: studentUsers[0]._id, content: 'Thanks Alice! It covered hooks, state management, and component lifecycle.' },
          { author: studentUsers[3]._id, content: 'That\'s amazing! How do I start?' }
        ]
      },
      {
        author: studentUsers[1]._id, content: 'Share your best interview tips! I\'ll start: Always ask clarifying questions before diving into the solution. It shows the interviewer you think critically. 💡',
        tags: ['tips', 'interview'], likes: [studentUsers[0]._id, studentUsers[2]._id, studentUsers[3]._id, studentUsers[4]._id],
        comments: [
          { author: studentUsers[2]._id, content: 'Great tip! I also recommend practicing STAR method for behavioral questions.' },
          { author: studentUsers[4]._id, content: 'Always have a few questions ready to ask the interviewer at the end!' }
        ]
      },
      {
        author: studentUsers[2]._id, content: 'Anyone else preparing for backend interviews? I created a study group for Node.js and System Design. DM me if interested! 📚',
        tags: ['study-group', 'nodejs', 'system-design'], likes: [studentUsers[0]._id, studentUsers[3]._id],
        comments: [
          { author: studentUsers[0]._id, content: 'Count me in! I\'m also preparing for backend roles.' }
        ]
      },
      {
        author: studentUsers[4]._id, content: 'Just won my 4th hackathon! 🏆 Built a real-time collaboration tool using React and WebSockets. The CampusRecruit mock interviews really helped me prepare for the pitch round.',
        tags: ['hackathon', 'achievement'], likes: [studentUsers[0]._id, studentUsers[1]._id, studentUsers[2]._id, studentUsers[3]._id],
        comments: [
          { author: studentUsers[1]._id, content: 'You\'re on fire Diana! What was the project theme?' },
          { author: studentUsers[4]._id, content: 'It was about remote collaboration tools. Our team built everything in 24 hours!' }
        ]
      },
      {
        author: studentUsers[3]._id, content: 'Resource recommendation: The System Design Primer on GitHub is absolutely gold for anyone preparing for interviews. Combined with the mock interviews here, it\'s a game changer! 🎯',
        tags: ['resources', 'system-design'], likes: [studentUsers[0]._id, studentUsers[1]._id],
        comments: []
      },
      {
        author: studentUsers[0]._id, content: 'Just got my first job offer from Tech Corp! 🎉 The AI interview practice on this platform was a game changer. Thank you CampusRecruit team!',
        tags: ['success', 'job-offer'], likes: [studentUsers[1]._id, studentUsers[2]._id, studentUsers[3]._id, studentUsers[4]._id],
        comments: [
          { author: studentUsers[1]._id, content: 'Congratulations Tirth! Well deserved! 🎉🎉' },
          { author: studentUsers[2]._id, content: 'Inspiring! What role did you land?' },
          { author: studentUsers[4]._id, content: 'Amazing! You\'re going to do great things!' }
        ]
      }
    ]);
    console.log(`   ✓ Created ${posts.length} community posts\n`);

    // ═══════════════════════════════════════════════════════════
    // 11. SUPPORT TICKETS
    // ═══════════════════════════════════════════════════════════
    console.log('🎫 Creating support tickets...');
    const tickets = await SupportTicket.create([
      {
        user: studentUsers[0]._id, name: 'Tirth Patel', email: 'tirth@student.com',
        subject: 'Interview video not saving', message: 'My interview recording is not being saved after completion. I\'ve tried multiple times with Chrome and Firefox. Please help!',
        status: 'Open'
      },
      {
        user: studentUsers[1]._id, name: 'Alice Johnson', email: 'alice@student.com',
        subject: 'Course progress not updating', message: 'I completed Module 3 of the React course but my progress still shows 40%. Can you reset it?',
        status: 'In Progress'
      },
      {
        user: studentUsers[2]._id, name: 'Bob Smith', email: 'bob@student.com',
        subject: 'Payment failed but amount deducted', message: 'I tried to purchase the System Design course. Payment was deducted from my card but course is still locked. Transaction ID: TXN_2024_12345.',
        status: 'Open'
      },
      {
        user: companyUsers[0]._id, name: 'Tech Corp Recruiter', email: 'recruiter@techcorp.com',
        subject: 'Need to edit job posting', message: 'I need to update the salary range for the Senior React Developer position. Currently it shows the wrong amount.',
        status: 'Closed'
      }
    ]);
    console.log(`   ✓ Created ${tickets.length} support tickets\n`);

    // ═══════════════════════════════════════════════════════════
    // 12. STUDY RESOURCES
    // ═══════════════════════════════════════════════════════════
    console.log('📌 Creating study resources...');
    const resources = await StudyResource.create([
      { title: 'React Documentation', type: 'Documentation', link: 'https://react.dev', icon: 'BookOpen', category: 'Frontend' },
      { title: 'System Design Primer', type: 'Guide', link: 'https://github.com/donnemartin/system-design-primer', icon: 'Layers', category: 'Interview' },
      { title: 'JavaScript.info', type: 'Tutorial', link: 'https://javascript.info', icon: 'Code', category: 'Frontend' },
      { title: 'Tech Interview Handbook', type: 'Guide', link: 'https://www.techinterviewhandbook.org', icon: 'Briefcase', category: 'Interview' },
      { title: 'Node.js Best Practices', type: 'Guide', link: 'https://github.com/goldbergyoni/nodebestpractices', icon: 'Code', category: 'Backend' },
      { title: 'MongoDB University', type: 'Course', link: 'https://university.mongodb.com', icon: 'BookOpen', category: 'Database' }
    ]);
    console.log(`   ✓ Created ${resources.length} study resources\n`);

    // ═══════════════════════════════════════════════════════════
    // DONE!
    // ═══════════════════════════════════════════════════════════
    console.log('═══════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   Users:              ${1 + companyUsers.length + studentUsers.length}`);
    console.log(`   Company Profiles:   ${companies.length}`);
    console.log(`   Student Profiles:   ${studentProfiles.length}`);
    console.log(`   Jobs:               ${jobs.length}`);
    console.log(`   Applications:       ${applications.length}`);
    console.log(`   AI Sessions:        ${sessions.length}`);
    console.log(`   Legacy Interviews:  ${legacyInterviews.length}`);
    console.log(`   Courses:            ${courses.length}`);
    console.log(`   Enrollments:        ${enrollments.length}`);
    console.log(`   Community Posts:    ${posts.length}`);
    console.log(`   Support Tickets:    ${tickets.length}`);
    console.log(`   Study Resources:    ${resources.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:    admin@gmail.com / admin@123');
    console.log('   Company:  recruiter@techcorp.com / Recruiter@123');
    console.log('   Student:  tirth@student.com / Student@123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
