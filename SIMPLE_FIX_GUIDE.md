# Simple Attendance & Leave Fix Guide

## What I Fixed

1. **Port Issue**: Changed API calls from port 5000 to port 8000 (your backend port)
2. **Simplified Frontend**: Created a clean, simple attendance component
3. **Reverted Backend**: Restored original simple backend code
4. **Fixed API Endpoints**: Ensured proper connection between frontend and backend

## Files Changed

### Frontend:
- `frontend/src/pages/HR/Attendance.jsx` - Completely rewritten with simple forms
- `frontend/src/App.jsx` - Fixed API port from 5000 to 8000

### Backend:
- All backend files reverted to original simple versions
- No complex error handling or extra features

## How to Test

### Step 1: Start Backend
```bash
cd React-Client-ITEC116/backend
npm start
```
You should see: "🚀 Server running on port 8000"

### Step 2: Test Backend (Optional)
```bash
cd React-Client-ITEC116/backend
node simple-test.js
```

### Step 3: Create Sample Data (Optional)
```bash
cd React-Client-ITEC116/backend
node create-sample-data.js
```

### Step 4: Start Frontend
```bash
cd React-Client-ITEC116/frontend
npm run dev
```

### Step 5: Test the Pages
1. Go to HR → Attendance
2. You should see two tabs: "Attendance" and "Leave Management"
3. Try adding attendance records and leave applications

## What the New Component Does

### Attendance Tab:
- Simple form to add attendance records
- Dropdown to select employees
- Date, time in, time out fields
- Table showing all attendance records

### Leave Management Tab:
- Simple form to apply for leave
- Dropdown for employee and leave type
- Reason, start date, end date fields
- Table showing all leave applications

## Expected Behavior

1. **Data Loading**: Should fetch and display existing records
2. **Adding Records**: Forms should submit and add new records
3. **Employee Dropdown**: Should show employees from your database
4. **Simple Interface**: Clean, easy-to-use forms and tables

## Troubleshooting

### If still not working:

1. **Check Backend is Running**:
   - Open http://localhost:8000 in browser
   - Should see "✅ API is running successfully..."

2. **Check Database Connection**:
   - Look at backend console for "MongoDB connected"

3. **Check Browser Console**:
   - Open F12 → Console tab
   - Look for any error messages

4. **Test Individual Endpoints**:
   - http://localhost:8000/api/employees
   - http://localhost:8000/api/attendance
   - http://localhost:8000/api/leaves

### Common Issues:
- **Port 8000 in use**: Change PORT in .env file
- **MongoDB connection**: Check MONGO_URI in .env file
- **No employees**: Run the create-sample-data.js script
- **CORS errors**: Backend has CORS enabled for all origins

## The Simple Approach

This version is intentionally simple:
- No complex validation
- No advanced features
- Just basic CRUD operations
- Clean, working forms
- Proper data display

The goal is to get it working first, then add features later if needed.