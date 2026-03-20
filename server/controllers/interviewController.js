const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');

// Initialize Drive API
// Ensure 'service-account-key.json' is in your server root directory
const KEYFILEPATH = path.join(__dirname, '..', 'service-account-key.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

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