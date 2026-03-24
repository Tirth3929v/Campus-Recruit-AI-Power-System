# Admin Approval System Documentation

## Overview
This system ensures that **all courses and jobs** created by employees and companies require admin approval before going live to students.

---

## 🎓 Course Approval Workflow

### Status Flow
```
Employee Creates Course → pending_approval → Admin Reviews → published (visible to students)
                                          ↓
                                      rejected (not visible)
```

### Implementation Details

#### 1. Course Creation (Employee/Company)
- **File**: `server/routes/courseRoutes.js` (Line 648)
- **Status**: `pending_approval` (non-admin users)
- **Status**: `published` (admin users only)
- **Visibility**: Courses with `pending_approval` status are NOT visible to students

```javascript
status: req.user.role === 'admin' ? 'published' : 'pending_approval'
```

#### 2. Student Course List (GET /api/courses)
- **File**: `server/routes/courseRoutes.js` (Line 193)
- **Filter**: Only shows courses with `status: 'published'`
- **Result**: Students cannot see pending courses

```javascript
const filter = status ? { status } : { status: 'published' };
```

#### 3. Admin Pending Courses Endpoint
- **Endpoint**: `GET /api/courses/admin/pending`
- **Access**: Admin only
- **Returns**: All courses with `status: 'pending_approval'`

#### 4. Admin Approval Actions
- **Approve**: `PATCH /api/courses/:id/status` with `{ "status": "published" }`
- **Reject**: `PATCH /api/courses/:id/status` with `{ "status": "rejected" }`

### Course Status Values
- `draft` - Not submitted yet
- `pending_approval` - Awaiting admin review
- `published` - Live and visible to students
- `rejected` - Rejected by admin

---

## 💼 Job Approval Workflow

### Status Flow
```
Company Creates Job → pending → Employee Reviews → admin_review → Admin Approves → approved (visible to students)
                                                                              ↓
                                                                          rejected (not visible)
```

### Implementation Details

#### 1. Job Creation (Company)
- **File**: `server/routes/jobRoutes.js` (Line 636)
- **Status**: `pending` (requires approval)
- **Visibility**: Jobs with `pending` status are NOT visible to students

```javascript
status: 'pending'  // Require admin approval - companies cannot auto-publish
```

#### 2. Student Job List (GET /api/jobs)
- **File**: `server/routes/jobRoutes.js` (Line 14)
- **Filter**: Only shows jobs with `status: 'approved'`
- **Result**: Students cannot see pending/rejected jobs

```javascript
const filter = { status: 'approved' };
```

#### 3. Employee Review Queue
- **Endpoint**: `GET /api/jobs/employee/pending`
- **Access**: Employee only
- **Returns**: All jobs with `status: 'pending'`
- **Action**: Employee can assign themselves and review

#### 4. Employee Actions
- **Assign**: `PUT /api/jobs/:id/assign` - Claims job for review
- **Submit to Admin**: `PUT /api/jobs/:id/submit-to-admin` - Sends to admin with notes
  - Changes status from `pending` or `employee_review` → `admin_review`

#### 5. Admin Pending Jobs Endpoint
- **Endpoint**: `GET /api/jobs/admin/pending`
- **Access**: Admin only
- **Returns**: All jobs with `status: 'admin_review'`

#### 6. Admin Approval Actions
- **Approve**: `PUT /api/jobs/:id/approve` - Makes job live
  - Changes status to `approved`
  - Sets `approvedAt` timestamp
- **Reject**: `PUT /api/jobs/:id/reject` - Rejects with reason
  - Changes status to `rejected`
  - Requires `rejectionReason` in request body

### Job Status Values
- `pending` - Awaiting employee review
- `employee_review` - Employee is reviewing
- `admin_review` - Submitted to admin for final approval
- `approved` - Live and visible to students
- `rejected` - Rejected by admin with reason

---

## 🔒 Security & Access Control

### Role-Based Permissions

#### Students
- ✅ Can view only `published` courses
- ✅ Can view only `approved` jobs
- ❌ Cannot see pending/rejected content

#### Employees
- ✅ Can create courses (status: `pending_approval`)
- ✅ Can review pending jobs
- ✅ Can submit jobs to admin
- ❌ Cannot publish courses directly
- ❌ Cannot approve jobs directly

#### Companies
- ✅ Can create jobs (status: `pending`)
- ✅ Can view their own jobs with all statuses
- ❌ Cannot publish jobs directly
- ❌ Cannot create courses

#### Admins
- ✅ Can create courses (status: `published` - auto-approved)
- ✅ Can approve/reject courses
- ✅ Can approve/reject jobs
- ✅ Can view all content regardless of status

---

## 📊 Admin Dashboard Integration

### Pending Courses View
```javascript
// Fetch pending courses
GET /api/courses/admin/pending

// Approve course
PATCH /api/courses/:id/status
Body: { "status": "published" }

// Reject course
PATCH /api/courses/:id/status
Body: { "status": "rejected" }
```

### Pending Jobs View
```javascript
// Fetch jobs awaiting admin review
GET /api/jobs/admin/pending

// Approve job
PUT /api/jobs/:id/approve

// Reject job
PUT /api/jobs/:id/reject
Body: { "rejectionReason": "Reason here..." }
```

---

## 🎯 Key Benefits

1. **Quality Control**: Admin reviews all content before it goes live
2. **Security**: Prevents spam or inappropriate content
3. **Compliance**: Ensures all jobs/courses meet platform standards
4. **Transparency**: Clear status tracking for all parties
5. **Accountability**: Rejection reasons documented

---

## 🚀 Testing the System

### Test Course Approval
1. Login as Employee
2. Create a new course
3. Verify course has `status: 'pending_approval'`
4. Check student portal - course should NOT appear
5. Login as Admin
6. View pending courses at `/api/courses/admin/pending`
7. Approve course
8. Check student portal - course should NOW appear

### Test Job Approval
1. Login as Company
2. Create a new job
3. Verify job has `status: 'pending'`
4. Check student portal - job should NOT appear
5. Login as Employee
6. View pending jobs and assign to yourself
7. Submit to admin with notes
8. Login as Admin
9. View pending jobs at `/api/jobs/admin/pending`
10. Approve job
11. Check student portal - job should NOW appear

---

## 📝 Database Queries

### Find All Pending Content
```javascript
// Pending courses
db.courses.find({ status: 'pending_approval' })

// Pending jobs (employee queue)
db.jobs.find({ status: 'pending' })

// Jobs awaiting admin
db.jobs.find({ status: 'admin_review' })
```

### Find All Approved Content
```javascript
// Published courses
db.courses.find({ status: 'published' })

// Approved jobs
db.jobs.find({ status: 'approved' })
```

---

## ⚠️ Important Notes

1. **Admin Bypass**: Admins can create courses that are immediately published
2. **Employee Role**: Employees act as first-level reviewers for jobs
3. **Rejection Handling**: Companies can edit and resubmit rejected jobs
4. **Status Immutability**: Once approved, content cannot be reverted to pending
5. **Visibility**: Only `published` courses and `approved` jobs are visible to students

---

## 🔧 Configuration Files

- **Course Routes**: `server/routes/courseRoutes.js`
- **Job Routes**: `server/routes/jobRoutes.js`
- **Course Model**: `server/models/Course.js`
- **Job Model**: `server/models/Job.js`

---

## 📞 Support

For issues or questions about the approval system:
1. Check server logs for status changes
2. Verify user roles are correctly assigned
3. Ensure authentication middleware is working
4. Check database for status field values
