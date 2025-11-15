# Module 7: Business Intelligence (BI) - Documentation

## Overview
Module 7 (Business Intelligence) is designed to aggregate, process, and structure data from all other modules (1, 2, 3, 4, 5, 8, 9, 10) for reporting and analytics purposes.

## Architecture

### Database Schema

The BI module uses three main models:

1. **BIReport** - Stores report structures and configurations
   - Report definitions with module sources
   - Report structure with sections and aggregations
   - Filters and date ranges

2. **BISummary** - Stores summarized/aggregated data
   - Metrics and KPIs from each module
   - Period-based summaries (daily, weekly, monthly, etc.)
   - Breakdown by categories

3. **BIDataSnapshot** - Stores raw data snapshots from modules
   - Raw data pulled from module APIs
   - Metadata about the data pull
   - Processing status

## API Endpoints

### Base URL
All BI endpoints are prefixed with `/api/bi`

### 1. Data Pull Endpoints

#### Pull Data from All Modules (Mass Read)
```
GET /api/bi/pull-all
```
Pulls data from all modules (1, 2, 3, 4, 5, 8, 9, 10) and saves snapshots.

**Response:**
```json
{
  "message": "Data pull completed for all modules",
  "results": [
    {
      "moduleId": 1,
      "moduleName": "Inventory",
      "endpoint": "/api/inventory/getItems",
      "success": true,
      "recordCount": 10,
      "timestamp": "2024-01-15T10:30:00Z"
    }
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

#### Pull Data from Specific Module
```
GET /api/bi/pull-module/:moduleId
Query Params: ?endpoint=/api/custom/endpoint (optional)
```
Pulls data from a specific module.

**Example:**
```
GET /api/bi/pull-module/1
GET /api/bi/pull-module/4?endpoint=/api/suppliers
```

### 2. Dummy Data Endpoints

#### Generate Dummy Data for All Modules
```
POST /api/bi/generate-dummy-data
```
Generates and saves dummy/mock data for all modules. Useful for testing and development.

**Response:**
```json
{
  "message": "Dummy data generated and saved for all modules",
  "modules": [
    {
      "moduleId": 1,
      "moduleName": "Inventory",
      "data": { "name": "Sample Item 1", "sku": "SKU-001", ... },
      "snapshotId": "507f1f77bcf86cd799439011"
    }
  ]
}
```

### 3. Data Processing Endpoints

#### Process and Summarize Data
```
GET /api/bi/process-summarize
Query Params:
  - moduleId (optional): Filter by module ID
  - startDate (optional): Start date for filtering
  - endDate (optional): End date for filtering
```
Processes snapshots and creates summaries.

**Example:**
```
GET /api/bi/process-summarize?moduleId=1&startDate=2024-01-01&endDate=2024-01-31
```

#### Get All Summaries
```
GET /api/bi/summaries
Query Params:
  - moduleId (optional): Filter by module ID
  - summaryType (optional): Filter by summary type
```
Retrieves all summaries.

#### Get All Snapshots
```
GET /api/bi/snapshots
Query Params:
  - moduleId (optional): Filter by module ID
  - snapshotType (optional): Filter by snapshot type (full_pull, incremental, dummy_data)
```
Retrieves all data snapshots.

### 4. Report Endpoints

#### Create Report Structure
```
POST /api/bi/reports
Body:
{
  "reportName": "Monthly Inventory Report",
  "reportType": "inventory_summary",
  "description": "Monthly summary of inventory data",
  "moduleSources": [
    {
      "moduleId": 1,
      "moduleName": "Inventory",
      "dataFields": ["name", "quantity", "category"]
    }
  ],
  "reportStructure": {
    "sections": [
      {
        "sectionName": "Stock Levels",
        "dataFields": ["quantity"],
        "aggregationType": "sum"
      }
    ]
  }
}
```

#### Get All Reports
```
GET /api/bi/reports
```
Retrieves all active report structures.

#### Generate Dashboard
```
GET /api/bi/dashboard
```
Generates a comprehensive dashboard with data from all modules.

## Module Mapping

| Module ID | Module Name | Endpoints |
|-----------|------------|-----------|
| 1 | Inventory | `/api/inventory/getItems` |
| 2 | Transaction | `/api/transactions` |
| 3 | Warehouse | `/api/warehouses/getAllWarehouse` |
| 4 | Procurement | `/api/suppliers`, `/api/requisitions`, `/api/purchase-orders`, `/api/invoices` |
| 5 | Finance | `/api/finance/inventory-transactions`, `/api/finance/payroll-report` |
| 8 | Sales | `/api/sales/orders` (may need to be created) |
| 9 | Customer Service | `/api/customer-service/tickets` (may need to be created) |
| 10 | HR | `/api/hr/payroll`, `/api/attendance`, `/api/leaves` |

## Usage Examples

### 1. Pull Data from All Modules
```javascript
// Using fetch
const response = await fetch('http://localhost:5000/api/bi/pull-all');
const data = await response.json();
console.log(data.summary);
```

### 2. Generate Dummy Data
```javascript
const response = await fetch('http://localhost:5000/api/bi/generate-dummy-data', {
  method: 'POST'
});
const data = await response.json();
```

### 3. Process and View Summaries
```javascript
// First, pull data
await fetch('http://localhost:5000/api/bi/pull-all');

// Then process it
await fetch('http://localhost:5000/api/bi/process-summarize');

// View summaries
const summaries = await fetch('http://localhost:5000/api/bi/summaries');
const data = await summaries.json();
```

### 4. Generate Dashboard
```javascript
const response = await fetch('http://localhost:5000/api/bi/dashboard');
const dashboard = await response.json();
console.log(dashboard.modules);
```

## Data Flow

1. **Data Pull**: BI module calls APIs from all modules
2. **Snapshot Storage**: Raw data is stored in `BIDataSnapshot` collection
3. **Processing**: Snapshots are processed to create summaries
4. **Summary Storage**: Aggregated data is stored in `BISummary` collection
5. **Report Generation**: Reports are generated from summaries using `BIReport` structures

## Configuration

The base URL for API calls can be configured via environment variable:
```env
API_BASE_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

## Error Handling

- Failed API calls are logged but don't stop the entire process
- Each module pull is independent - if one fails, others continue
- Error information is included in the response for debugging

## Testing

To test the BI module:

1. **Generate Dummy Data**: Start by generating dummy data for all modules
   ```
   POST /api/bi/generate-dummy-data
   ```

2. **Pull Real Data**: Pull actual data from existing modules
   ```
   GET /api/bi/pull-all
   ```

3. **Process Data**: Process snapshots into summaries
   ```
   GET /api/bi/process-summarize
   ```

4. **View Results**: Check summaries and snapshots
   ```
   GET /api/bi/summaries
   GET /api/bi/snapshots
   ```

5. **Generate Dashboard**: Create a comprehensive dashboard
   ```
   GET /api/bi/dashboard
   ```

## Notes

- Modules 8 (Sales) and 9 (Customer Service) may need their backend APIs created if they don't exist yet
- The BI module gracefully handles missing endpoints (returns error but continues)
- All timestamps are stored in UTC
- Data snapshots preserve the exact structure from source modules

