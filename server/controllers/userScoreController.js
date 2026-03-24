const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const AIInterviewSession = require('../models/AIInterviewSession');
const LegacyInterview = require('../models/LegacyInterview');

exports.getUserScorecard = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const studentProfile = await StudentProfile.findOne({ user: userId });

    // 1. Gather Course Scores
    let totalMcqScore = 0;
    let completedCoursesCount = 0;
    
    if (studentProfile) {
      const completedEnrollments = await Enrollment.find({
        student: studentProfile._id,
        completed: true
      });
      
      completedCoursesCount = completedEnrollments.length;
      totalMcqScore = completedEnrollments.reduce((sum, enr) => sum + (enr.mcqScore || 0), 0);
    }
    
    const avgCourseScore = completedCoursesCount > 0 
      ? Math.round(totalMcqScore / completedCoursesCount) 
      : 0;

    // 2. Gather AI Interview Scores
    const aiSessions = await AIInterviewSession.find({ 
      user: userId, 
      status: { $in: ['Completed', 'Evaluated'] } 
    });
    
    const legacyInterviews = await LegacyInterview.find({ userId });
    
    const totalInterviewsCount = aiSessions.length + legacyInterviews.length;
    
    const totalAiScore = aiSessions.reduce((sum, sess) => sum + (sess.overallScore || 0), 0);
    const totalLegacyScore = legacyInterviews.reduce((sum, legacy) => sum + (legacy.score || 0), 0);
    
    const avgInterviewScore = totalInterviewsCount > 0 
      ? Math.round((totalAiScore + totalLegacyScore) / totalInterviewsCount)
      : 0;

    // 3. Compute Overall Performance Score
    let overallScore = 0;
    if (completedCoursesCount > 0 && totalInterviewsCount > 0) {
      overallScore = Math.round((avgCourseScore + avgInterviewScore) / 2);
    } else if (completedCoursesCount > 0) {
      overallScore = avgCourseScore;
    } else if (totalInterviewsCount > 0) {
      overallScore = avgInterviewScore;
    }

    // 4. Return Scorecard Data
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      scoreCard: {
        courses: {
          completed: completedCoursesCount,
          averageScore: avgCourseScore
        },
        interviews: {
          completed: totalInterviewsCount,
          averageScore: avgInterviewScore
        },
        overallScore: overallScore
      }
    });

  } catch (error) {
    console.error('getUserScorecard Error:', error);
    res.status(500).json({ error: 'Server error while computing scorecard.' });
  }
};
