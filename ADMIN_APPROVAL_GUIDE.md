# Admin Approval Quick Reference

## 🎓 Course Approval

### View Pending Courses
```bash
GET /api/courses/admin/pending
Authorization: Bearer <admin_token>
```

### Approve Course
```bash
PATCH /api/courses/:courseId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "published"
}
```

### Reject Course
```bash
PATCH /api/courses/:courseId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "rejected"
}
```

---

## 💼 Job Approval

### View Jobs Awaiting Admin Review
```bash
GET /api/jobs/admin/pending
Authorization: Bearer <admin_token>
```

### Approve Job
```bash
PUT /api/jobs/:jobId/approve
Authorization: Bearer <admin_token>
```

### Reject Job
```bash
PUT /api/jobs/:jobId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "Job description does not meet quality standards"
}
```

---

## 📊 Status Overview

| Content Type | Pending Status | Approved Status | Visible to Students |
|--------------|----------------|-----------------|---------------------|
| Course | `pending_approval` | `published` | Only when `published` |
| Job | `admin_review` | `approved` | Only when `approved` |

---

## 🔄 Workflow Summary

### Course Workflow
```
Employee → Creates Course (pending_approval)
         ↓
Admin → Reviews Course
         ↓
Admin → Approves (published) OR Rejects (rejected)
         ↓
Students → Can see course (if published)
```

### Job Workflow
```
Company → Creates Job (pending)
         ↓
Employee → Reviews & Submits to Admin (admin_review)
         ↓
Admin → Approves (approved) OR Rejects (rejected)
         ↓
Students → Can see job (if approved)
```

---

## ✅ Implementation Status

- ✅ **Courses**: Require admin approval (implemented)
- ✅ **Jobs**: Require admin approval (implemented)
- ✅ **Student Visibility**: Only approved content visible
- ✅ **Status Tracking**: Full audit trail
- ✅ **Rejection Reasons**: Documented for transparency

---

## 🎯 Key Changes Made

1. **Course Creation** (`courseRoutes.js` Line 648)
   - Changed from auto-publish to `pending_approval` for non-admin users

2. **Job Creation** (`jobRoutes.js` Line 636)
   - Changed from `status: 'approved'` to `status: 'pending'`

3. **Student Endpoints**
   - Courses: Filter by `status: 'published'`
   - Jobs: Filter by `status: 'approved'`

---

## 🧪 Testing Checklist

- [ ] Employee creates course → Status is `pending_approval`
- [ ] Course NOT visible in student portal
- [ ] Admin can see course in pending list
- [ ] Admin approves course → Status changes to `published`
- [ ] Course NOW visible in student portal
- [ ] Company creates job → Status is `pending`
- [ ] Job NOT visible in student portal
- [ ] Employee reviews and submits to admin
- [ ] Admin can see job in pending list
- [ ] Admin approves job → Status changes to `approved`
- [ ] Job NOW visible in student portal

---

## 📝 Notes

- Admins can create courses that are immediately `published` (bypass approval)
- Companies cannot bypass the approval process
- Employees cannot bypass the approval process
- Rejected content can be edited and resubmitted
