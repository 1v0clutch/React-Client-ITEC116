# Phase 2: Module 7 (BI) - Complete Testing Guide

## Overview
This guide demonstrates that Phase 2 requirements are fully implemented and working:
1. ✅ Architecture Setup (Database Schema)
2. ✅ Multi-Module Integration (Mass Read)
3. ✅ Dummy Data Pull, Processing, and Structuring

## Prerequisites
- MongoDB running and connected
- Backend server running on port 5000 (or configured port)
- Node.js dependencies installed (`npm install` in backend folder)

## Step-by-Step Testing

### Step 1: Start the Backend Server
```bash
cd backend
npm start
# or
npm run dev
```

You should see: `Server running on port 5000`

### Step 2: Generate Dummy Data (Requirement 3)
This proves Module 7 can receive, process, and structure dummy data.

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/bi/generate-dummy-data
```

**Using Postman:**
- Method: POST
- URL: `http://localhost:5000/api/bi/generate-dummy-data`
- Headers: `Content-Type: application/json`

**Expected Response:**
```json
{
  "message": "Dummy data generated, saved, and processed for all modules",
  "summary": {
    "totalModules": 8,
    "snapshotsCreated": 8,
    "summariesCreated": 8
  },
  "modules": [
    {
      "moduleId": 1,
      "moduleName": "Inventory",
      "recordCount": 10,
      "snapshotId": "...",
      "summaryId": "..."
    },
    // ... more modules
  ]
}
```

**What This Proves:**
- ✅ Dummy data generated for all 8 modules (1, 2, 3, 4, 5, 8, 9, 10)
- ✅ Data saved as snapshots in `BIDataSnapshot` collection
- ✅ Data automatically processed into summaries in `BISummary` collection
- ✅ Module 7 successfully receives, processes, and structures data

### Step 3: Verify Snapshots (Dummy Data Storage)
```bash
curl http://localhost:5000/api/bi/snapshots?snapshotType=dummy_data
```

**Expected:** List of 8 snapshots, one per module, with metadata showing record counts.

### Step 4: Verify Summaries (Processed Data)
```bash
curl http://localhost:5000/api/bi/summaries
```

**Expected:** List of 8 summaries with aggregated metrics for each module.

### Step 5: Test Mass Read from All Modules (Requirement 2)
This proves Module 7 can call APIs of all completed modules.

**Using cURL:**
```bash
curl http://localhost:5000/api/bi/pull-all
```

**Using Postman:**
- Method: GET
- URL: `http://localhost:5000/api/bi/pull-all`

**Expected Response:**
```json
{
  "message": "Data pull completed for all modules",
  "results": [
    {
      "moduleId": 1,
      "moduleName": "Inventory",
      "endpoint": "/api/inventory/getItems",
      "success": true,
      "recordCount": 5,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    // ... more modules
  ],
  "summary": {
    "totalModules": 8,
    "totalEndpoints": 12,
    "successful": 10,
    "failed": 2,
    "snapshotsCreated": 10
  }
}
```

**What This Proves:**
- ✅ Module 7 calls APIs from all modules (1, 2, 3, 4, 5, 8, 9, 10)
- ✅ Handles multiple endpoints per module (e.g., Procurement has 4 endpoints)
- ✅ Creates snapshots for successful pulls
- ✅ Gracefully handles failures (modules 8 & 9 may not exist yet)

### Step 6: Test Individual Module Pull
```bash
# Pull from Module 1 (Inventory)
curl http://localhost:5000/api/bi/pull-module/1

# Pull from Module 4 (Procurement) with specific endpoint
curl "http://localhost:5000/api/bi/pull-module/4?endpoint=/api/suppliers"
```

### Step 7: Process and Summarize Data
```bash
curl http://localhost:5000/api/bi/process-summarize
```

This processes all snapshots (including dummy data) into summaries.

### Step 8: Generate Comprehensive Dashboard
```bash
curl http://localhost:5000/api/bi/dashboard
```

**Expected:** Dashboard with aggregated data from all modules.

### Step 9: View All Reports
```bash
curl http://localhost:5000/api/bi/reports
```

## Frontend Testing

### Step 1: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 2: Navigate to Report Page
- Go to: `http://localhost:5173/report` (or your frontend URL)
- You should see the ERP Report Module page

### Step 3: Generate Dummy Data (Frontend)
1. Click the **"Pull All Modules Data"** button
2. Wait for completion
3. Check the system logs for confirmation

### Step 4: Generate Reports
1. Select any report from the list (e.g., "Inventory Stock")
2. Click **"Generate"**
3. The report should display real data from the BI module or direct APIs
4. Try different reports to test all modules

### Step 5: Test Real-Time Updates
1. Select a report
2. Enable **"Real-Time Data Retrieval"** checkbox
3. Watch the data update every 5 seconds

### Step 6: Export Reports
1. Generate a report
2. Click **CSV**, **Excel**, or **PDF** to export
3. Verify the exported file contains the data

## Database Verification

### Check MongoDB Collections

Connect to MongoDB and verify:

```javascript
// Check BIDataSnapshot collection
db.bidatasnapshots.find().count()
// Should show snapshots (dummy data + real pulls)

// Check BISummary collection
db.bisummaries.find().count()
// Should show summaries (processed data)

// Check BIReport collection
db.bireports.find().count()
// Should show report structures (if any created)
```

### View Dummy Data
```javascript
// View dummy data snapshots
db.bidatasnapshots.find({ snapshotType: "dummy_data" }).pretty()

// View a specific module's dummy data
db.bidatasnapshots.findOne({ 
  moduleId: 1, 
  snapshotType: "dummy_data" 
})
```

## Verification Checklist

### ✅ Requirement 1: Architecture Setup
- [x] `BIReport` model created - stores report structures
- [x] `BISummary` model created - stores summarized data
- [x] `BIDataSnapshot` model created - stores raw data snapshots
- [x] All models properly indexed for performance
- [x] Schema supports all module types

### ✅ Requirement 2: Multi-Module Integration (Mass Read)
- [x] `GET /api/bi/pull-all` - pulls from all modules
- [x] `GET /api/bi/pull-module/:moduleId` - pulls from specific module
- [x] Supports modules: 1, 2, 3, 4, 5, 8, 9, 10
- [x] Handles multiple endpoints per module
- [x] Creates snapshots for successful pulls
- [x] Graceful error handling

### ✅ Requirement 3: Dummy Data Pull
- [x] `POST /api/bi/generate-dummy-data` - generates dummy data
- [x] Creates realistic data arrays for each module
- [x] Saves data as snapshots
- [x] Automatically processes into summaries
- [x] Proves Module 7 can receive, process, and structure data
- [x] Frontend can display dummy data

## Data Generated Per Module

| Module | Records Generated | Data Type |
|--------|------------------|-----------|
| 1 - Inventory | 10 items | Array |
| 2 - Transaction | 15 transactions | Array |
| 3 - Warehouse | 5 warehouses | Array |
| 4 - Procurement | 8 suppliers, 12 requisitions, 10 POs, 8 invoices | Nested Object |
| 5 - Finance | 20 transactions, 15 invoices | Nested Object |
| 8 - Sales | 15 orders | Array |
| 9 - Customer Service | 12 tickets | Array |
| 10 - HR | 20 payroll records | Array |

**Total: 115+ records across 8 modules**

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:** Ensure MongoDB is running and `MONGO_URI` is set in `.env`

### Issue: "Module API not found" (404 errors)
**Solution:** This is expected for modules 8 & 9 if they're not implemented yet. The BI module handles this gracefully.

### Issue: "No data in frontend"
**Solution:** 
1. Generate dummy data first: `POST /api/bi/generate-dummy-data`
2. Process it: `GET /api/bi/process-summarize`
3. Then generate reports in frontend

### Issue: "Port already in use"
**Solution:** Change `PORT` in `.env` or `server.js`

## Success Criteria

✅ **All three requirements are met when:**
1. Dummy data can be generated and saved
2. Data can be pulled from all module APIs
3. Data is successfully processed into summaries
4. Frontend can display the data in reports
5. All 8 modules are integrated

## Next Steps

After Phase 2 is verified:
- Phase 3: Real-time data integration
- Phase 4: Advanced reporting features
- Phase 5: Data visualization and dashboards

