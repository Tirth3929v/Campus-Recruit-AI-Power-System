# How to Start the Campus Recruitment System

## Prerequisites
- MongoDB must be running
- Node.js installed
- All dependencies installed (`npm install` in each directory)

## Starting the Backend Server

```bash
cd server
npm run dev
```

The backend will start on **http://localhost:5000**

## Starting the Frontend Applications

Open separate terminals for each:

### Student Portal (Port 5173)
```bash
cd user
npm run dev
```

### Admin Portal (Port 5174)
```bash
cd admin
npm run dev
```

### Employee Portal (Port 5175)
```bash
cd employee
npm run dev
```

### Company Portal (Port 5177)
```bash
cd company
npm run dev
```

## Troubleshooting

### Backend not starting?
- Check if MongoDB is running
- Check if port 5000 is available
- Check `.env` file exists in `server/` directory

### Frontend showing connection errors?
- Make sure backend is running first
- Check browser console for specific errors
- Verify CORS settings allow your frontend port

### Socket.IO connection refused?
- Backend server must be running on port 5000
- Check Socket.IO configuration in `server/index.js`

## Environment Variables Required

Create `server/.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-recruitment
JWT_SECRET=your-jwt-secret-key
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```
