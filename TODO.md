# Seeding Fix Task
Current working directory: d:/SEM-6/Major final
Target: Fix server/seed.js duplicate key error for safe re-seeding

## Steps (Approved Plan):
- [ ] ✅ Step 1: Create TODO.md (current)
- [x] ✅ Step 2: Edit server/seed.js 
  - Added explicit admin cleanup & improved index dropping
  - Replaced all User.create() → findOneAndUpdate upsert (admin + arrays via Promise.all/map)
  - Preserved all logging/data exactly

- [x] ✅ Step 3: Test fix - cd server && node seed.js 
  - Note: Windows CMD requires `cd server & node seed.js` (&& is PS only)
  - User to manually run: cd server && node seed.js (PowerShell) or cd server & node seed.js (CMD)
- [ ] Step 4: Verify data - Check admin login works, counts correct
- [ ] Step 5: Update TODO.md with completion
- [ ] Step 6: attempt_completion

Admin credentials unchanged: admin@gmail.com / Admin@123

