# Course Update Approval System

## Overview
Employees can request updates to courses (edit or delete), which require admin approval before being applied.

## Features

### Employee Portal
- **View All Courses**: Browse all available courses
- **Request Edit**: Submit changes to course details (title, description, instructor, category, level, duration)
- **Request Delete**: Request course deletion with reason
- **Track Requests**: View status of all submitted requests (pending, approved, rejected)
- **Admin Feedback**: See admin responses on approved/rejected requests

### Admin Portal
- **Review Requests**: View all course update requests
- **Filter by Status**: Filter requests by pending, approved, or rejected
- **View Details**: See full details of proposed changes
- **Approve/Reject**: Approve or reject requests with optional feedback
- **Auto-Apply**: Approved changes are automatically applied to courses

## Database Models

### CourseUpdateRequest
```javascript
{
  course: ObjectId (ref: Course),
  requestedBy: ObjectId (ref: Employee),
  requestedByName: String,
  requestedByEmail: String,
  status: 'pending' | 'approved' | 'rejected',
  updateType: 'edit' | 'delete',
  updatedFields: Object,
  reason: String,
  adminResponse: String,
  reviewedBy: ObjectId (ref: Admin),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Employee Endpoints
- `POST /api/course-updates/request` - Submit update request
  - Body: `{ courseId, updateType, updatedFields, reason }`
  - Auth: Employee only
  
- `GET /api/course-updates/my-requests` - Get employee's own requests
  - Auth: Employee only

### Admin Endpoints
- `GET /api/course-updates/all?status=pending` - Get all requests (with optional status filter)
  - Auth: Admin only
  
- `PUT /api/course-updates/approve/:requestId` - Approve request
  - Body: `{ adminResponse }` (optional)
  - Auth: Admin only
  
- `PUT /api/course-updates/reject/:requestId` - Reject request
  - Body: `{ adminResponse }` (optional)
  - Auth: Admin only

## Usage Flow

### Employee Workflow
1. Navigate to "Update Courses" in employee portal
2. Search for the course to update
3. Click "Edit" or "Delete" button
4. Fill in the update form:
   - For Edit: Modify course fields
   - For Delete: Provide deletion reason
5. Submit request
6. Track request status in "My Update Requests" section

### Admin Workflow
1. Navigate to "Course Updates" in admin portal
2. View pending requests (default filter)
3. Click "View Details" on any request
4. Review proposed changes
5. Add optional admin response
6. Click "Approve" or "Reject"
7. Changes are automatically applied if approved

## Files Created

### Backend
- `server/models/CourseUpdateRequest.js` - Database model
- `server/controllers/courseUpdateController.js` - Business logic
- `server/routes/courseUpdateRoutes.js` - API routes
- `server/index.js` - Route registration (updated)

### Employee Portal
- `employee/src/pages/CourseUpdateManager.jsx` - Main UI component
- `employee/src/pages/EmployeeLayout.jsx` - Navigation (updated)
- `employee/src/App.jsx` - Route registration (updated)

### Admin Portal
- `admin/src/pages/CourseUpdateApprovals.jsx` - Approval UI component
- `admin/src/pages/AdminLayout.jsx` - Navigation (updated)
- `admin/src/App.jsx` - Route registration (updated)

## Security
- All endpoints protected with JWT authentication
- Role-based access control (employeeOnly, adminOnly middleware)
- Employees can only view their own requests
- Admins can view all requests
- Changes only applied after admin approval

## UI Features
- Real-time search for courses
- Status badges (pending, approved, rejected)
- Modal dialogs for detailed views
- Form validation
- Loading states
- Error handling
- Responsive design with Framer Motion animations

## Testing Checklist
- [ ] Employee can submit edit request
- [ ] Employee can submit delete request
- [ ] Employee can view their request history
- [ ] Admin can view all pending requests
- [ ] Admin can approve edit request (changes applied)
- [ ] Admin can approve delete request (course deleted)
- [ ] Admin can reject request with feedback
- [ ] Status updates correctly after approval/rejection
- [ ] Admin response visible to employee
- [ ] Search functionality works
- [ ] Filter tabs work (pending, approved, rejected)
