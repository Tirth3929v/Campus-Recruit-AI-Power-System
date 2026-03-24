# Employee AI Assistant Fix

## Issue
Employee portal shows Vite 500 error when loading AIChatInterface component.

## Root Cause
The error "Failed to load resource: the server responded with a status of 500" for `/src/components/AIChatInterface.jsx` indicates a **Vite compilation error**, not a backend API error.

## Solution Steps

### 1. Restart the Employee Portal Dev Server
```bash
cd employee
# Stop the current dev server (Ctrl+C)
npm run dev
```

### 2. Clear Vite Cache (if restart doesn't work)
```bash
cd employee
rm -rf node_modules/.vite
npm run dev
```

### 3. Verify Backend is Running
Make sure the backend server is running on port 5000:
```bash
cd server
npm start
```

### 4. Test the AI Assistant
1. Login to employee portal at http://localhost:5176
2. Click on "AI Assistant" in the sidebar
3. Select "Text Generator" or "Code Generator"
4. Type a prompt and submit

## Files Involved
- `employee/src/components/AIChatInterface.jsx` - Main AI chat component
- `employee/src/pages/TextGenerator.jsx` - Text generation wrapper
- `employee/src/pages/CodeGenerator.jsx` - Code generation wrapper
- `employee/src/pages/EmployeeLayout.jsx` - Navigation with AI Assistant dropdown
- `employee/src/App.jsx` - Routes for /employee/ai/text and /employee/ai/code

## Backend Endpoints Used
- `GET /api/ai-chat?type=text` - Fetch chat history
- `GET /api/ai-chat/:id` - Get specific chat
- `POST /api/ai-chat/message` - Save message
- `DELETE /api/ai-chat/:id` - Delete chat
- `POST /api/ai/generate-text` - Generate text with AI
- `POST /api/ai/generate-code` - Generate code with AI

## Authentication
- Uses `employeeToken` from localStorage
- Sent via Authorization header: `Bearer <token>`
- Backend middleware validates token and extracts user info

## Common Issues

### Issue: "Not authorized, no token"
**Solution**: Make sure you're logged in. Token is stored in localStorage as `employeeToken`.

### Issue: "User not found"
**Solution**: Token might be expired or invalid. Logout and login again.

### Issue: Vite 500 error on component load
**Solution**: Restart Vite dev server or clear cache.

### Issue: Backend 500 error on API call
**Solution**: Check backend console for detailed error. Usually related to:
- Missing GEMINI_API_KEY in .env
- Database connection issues
- Invalid user ID in token
