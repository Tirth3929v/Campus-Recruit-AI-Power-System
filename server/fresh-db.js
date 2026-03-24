/**
 * fresh-db.js
 * Run: node fresh-db.js
 * 
 * - Drops the old database completely
 * - Creates a brand new "campus_recruit_v2" database
 * - Seeds: 1 admin, 1 employee, 1 company, 1 student, sample jobs, courses
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── New DB name ──────────────────────────────────────────────
const NEW_DB_URI = 'mongodb://127.0.0.1:27017/campus_recruit_v2';

// ── Inline schemas (avoids import issues) ───────────────────
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['student', 'company', 'admin', 'employee'], default: 'student' },
  course: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  currentStreak: { type: Number, default: 0 },
  lastActiveDate: Date,
}, { timestamps: true });

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  phone: String,
  course: String,
  bio: String,
  skills: [String],
  resume: String,
  resumeName: String,
  cgpa: Number,
  graduationYear: Number,
  streak: { type: Number, default: 0 },
  weeklyGoal: { type: Number, default: 2 },
  lastAccessedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  lastAccessedAt: Date,
}, { timestamps: true });

const companyProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  companyName: { type: String, unique: true },
  description: String,
  website: String,
  location: String,
  logo: { type: String, default: 'https://placehold.co/150x150?text=Company' },
  industry: String,
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  requirements: [String],
  type: { type: String, default: 'Full-time' },
  location: String,
  salary: String,
  status: { type: String, default: 'approved' },
  department: String,
  applicants: [],
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: String,
  category: { type: String, default: 'Development' },
  courseType: { type: String, default: 'free' },
  level: { type: String, default: 'Beginner' },
  duration: String,
  rating: { type: Number, default: 4.5 },
  totalRatings: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  thumbnail: String,
  price: { type: Number, default: 0 },
  pdfUrl: String,
  pdfFile: String,
  status: { type: String, default: 'published' },
  createdBy: String,
  chapters: [{
    chapterId: String,
    title: String,
    content: String,
    videoUrl: String,
    order: Number,
  }],
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  type: { type: String, default: 'system' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// ── Models ───────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);
const Job = mongoose.model('Job', jobSchema);
const Course = mongoose.model('Course', courseSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// ── Seed Data ────────────────────────────────────────────────
const SEED_USERS = [
  {
    name: 'Super Admin',
    email: 'admin@campusrecruit.com',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'John Employee',
    email: 'employee@campusrecruit.com',
    password: 'Employee@123',
    role: 'employee',
    course: 'Engineering',
    isVerified: true,
  },
  {
    name: 'TechCorp HR',
    email: 'company@techcorp.com',
    password: 'Company@123',
    role: 'company',
    isVerified: true,
  },
  {
    name: 'Alice Student',
    email: 'student@campusrecruit.com',
    password: 'Student@123',
    role: 'student',
    course: 'B.Tech Computer Science',
    isVerified: true,
  },
];

const SEED_COURSES = [
  {
    title: 'Full Stack Web Development',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch.',
    instructor: 'John Employee',
    category: 'Development',
    courseType: 'free',
    level: 'Beginner',
    duration: '20h 00m',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    status: 'published',
    chapters: [
      { chapterId: 'ch1', title: 'Introduction to HTML', content: '<h2>HTML Basics</h2><p>HTML is the backbone of every webpage.</p>', order: 1 },
      { chapterId: 'ch2', title: 'CSS Styling', content: '<h2>CSS Basics</h2><p>CSS makes your pages beautiful.</p>', order: 2 },
      { chapterId: 'ch3', title: 'JavaScript Fundamentals', content: '<h2>JS Basics</h2><p>JavaScript adds interactivity.</p>', order: 3 },
    ],
  },
  {
    title: 'Python for Data Science',
    description: 'Master Python, Pandas, NumPy and data visualization for data science roles.',
    instructor: 'John Employee',
    category: 'Data Science',
    courseType: 'paid',
    level: 'Intermediate',
    duration: '15h 30m',
    price: 499,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    status: 'published',
    chapters: [
      { chapterId: 'py1', title: 'Python Basics', content: '<h2>Python</h2><p>Variables, loops, functions.</p>', order: 1 },
      { chapterId: 'py2', title: 'NumPy & Pandas', content: '<h2>Data Libraries</h2><p>Work with data efficiently.</p>', order: 2 },
    ],
  },
  {
    title: 'Interview Preparation Masterclass',
    description: 'Crack any technical interview with DSA, system design and behavioral tips.',
    instructor: 'John Employee',
    category: 'Soft Skills',
    courseType: 'free',
    level: 'Advanced',
    duration: '10h 00m',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    status: 'published',
    chapters: [
      { chapterId: 'int1', title: 'DSA Patterns', content: '<h2>DSA</h2><p>Arrays, trees, graphs.</p>', order: 1 },
      { chapterId: 'int2', title: 'System Design', content: '<h2>System Design</h2><p>Scalable architectures.</p>', order: 2 },
    ],
  },
];

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Campus Recruit — Fresh Database Setup');
  console.log('==========================================\n');

  // 1. Connect to new DB
  console.log(`📡 Connecting to: ${NEW_DB_URI}`);
  await mongoose.connect(NEW_DB_URI, { serverSelectionTimeoutMS: 5000, family: 4 });
  console.log('✅ Connected!\n');

  // 2. Drop all existing collections
  console.log('🗑️  Dropping all existing collections...');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
    console.log(`   Dropped: ${col.name}`);
  }
  console.log('✅ All collections dropped.\n');

  // 3. Create users
  console.log('👤 Creating users...');
  const createdUsers = {};
  for (const u of SEED_USERS) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(u.password, salt);
    const user = await User.create({ ...u, password: hashed });
    createdUsers[u.role] = user;
    console.log(`   ✅ ${u.role.toUpperCase()}: ${u.email} / ${u.password}`);
  }

  // 4. Create student profile
  console.log('\n📋 Creating student profile...');
  await StudentProfile.create({
    user: createdUsers.student._id,
    course: 'B.Tech Computer Science',
    bio: 'Passionate about software development and AI.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    cgpa: 8.5,
    graduationYear: 2026,
    weeklyGoal: 3,
  });
  console.log('   ✅ Student profile created');

  // 5. Create company profile
  console.log('\n🏢 Creating company profile...');
  const companyProfile = await CompanyProfile.create({
    userId: createdUsers.company._id,
    companyName: 'TechCorp Solutions',
    description: 'A leading technology company building next-gen software solutions.',
    website: 'https://techcorp.example.com',
    location: 'Bangalore, India',
    industry: 'Information Technology',
  });
  console.log('   ✅ Company profile created');

  // 6. Create jobs
  console.log('\n💼 Creating job postings...');
  const SEED_JOBS = [
    {
      title: 'Frontend Developer',
      description: 'Build responsive UIs using React and Tailwind CSS.',
      requirements: ['React', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
      type: 'Full-time',
      location: 'Bangalore, India',
      salary: '₹6L - ₹10L per annum',
      status: 'approved',
      department: 'Engineering',
    },
    {
      title: 'Backend Engineer',
      description: 'Design and build scalable Node.js APIs with MongoDB.',
      requirements: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      type: 'Full-time',
      location: 'Remote',
      salary: '₹8L - ₹14L per annum',
      status: 'approved',
      department: 'Engineering',
    },
    {
      title: 'Data Science Intern',
      description: 'Work on ML models and data pipelines using Python.',
      requirements: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
      type: 'Internship',
      location: 'Hyderabad, India',
      salary: '₹15,000/month stipend',
      status: 'approved',
      department: 'Data Science',
    },
  ];

  for (const job of SEED_JOBS) {
    await Job.create({
      ...job,
      company: companyProfile._id,
      postedBy: createdUsers.company._id,
    });
    console.log(`   ✅ Job: ${job.title}`);
  }

  // 7. Create courses
  console.log('\n📚 Creating courses...');
  for (const course of SEED_COURSES) {
    await Course.create({ ...course, createdBy: createdUsers.employee.email });
    console.log(`   ✅ Course: ${course.title}`);
  }

  // 8. Create welcome notification for student
  console.log('\n🔔 Creating welcome notification...');
  await Notification.create({
    recipientId: createdUsers.student._id,
    title: 'Welcome to Campus Recruit! 🎉',
    message: 'Your account is ready. Browse jobs, enroll in courses, and start your AI interview practice.',
    type: 'system',
  });
  console.log('   ✅ Welcome notification created');

  // 9. Print summary
  console.log('\n==========================================');
  console.log('✅ DATABASE SETUP COMPLETE!');
  console.log('==========================================');
  console.log(`\n📊 Database: campus_recruit_v2`);
  console.log(`🔗 URI: ${NEW_DB_URI}\n`);
  console.log('🔑 LOGIN CREDENTIALS:');
  console.log('─────────────────────────────────────────');
  console.log('ADMIN    → admin@campusrecruit.com    / Admin@123');
  console.log('EMPLOYEE → employee@campusrecruit.com / Employee@123');
  console.log('COMPANY  → company@techcorp.com       / Company@123');
  console.log('STUDENT  → student@campusrecruit.com  / Student@123');
  console.log('─────────────────────────────────────────');
  console.log('\n📝 Update your .env file:');
  console.log('MONGO_URI=mongodb://127.0.0.1:27017/campus_recruit_v2\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Setup failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
