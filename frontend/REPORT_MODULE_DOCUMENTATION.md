# ERP Report Module - Complete Documentation

## Overview
The ERP Report Module (Module 7) is a Business Intelligence component that provides comprehensive reporting and analytics capabilities across all ERP modules. It fetches data from various backend APIs, displays it in interactive tables, and allows users to filter, export, and schedule reports.

---

## File Structure

### Main Components
- **ERPReportModule.jsx** - Main report generation and management component
- **ReportPage.jsx** - Simple wrapper component that renders ERPReportModule

---

## Core Features

### 1. Report Types
The module supports 7 different report types:

| Report ID | Report Name | Department | Module ID |
|-----------|-------------|------------|-----------|
| 1 | Sales Summary | Sales | 8 |
| 2 | Inventory Stock | Inventory | 1 |
| 3 | Profit & Loss | Finance | 5 |
| 4 | Transaction Report | Finance | 2 |
| 5 | Warehouse Report | Warehouse | 3 |
| 6 | Procurement Report | Procurement | 4 |
| 7 | HR Report | HR | 10 |

### 2. Filtering System

#### Filter Options
- **Date Range**: `dateFrom` and `dateTo` filters
- **Department**: All, Sales, Finance, Inventory, Warehouse, Procurement, HR
- **Region**: All, NCR, Region I-XIII, CAR, BARMM

#### Department-Based Report Filtering
```javascript
useEffect(() => {
  if (filters.department === "All") {
    setFilteredReports(reports);
  } else {
    const filtered = reports.filter(report => 
      report.department === filters.department || report.department === "All"
    );
    setFilteredReports(filtered);
  }
}, [filters.department, reports]);
```

**Behavior**: When a department is selected, only reports matching that department are displayed in the "Available Reports" section.

#### Client-Side Data Filtering
```javascript
useEffect(() => {
  if (data.length === 0) {
    setFilteredData([]);
    return;
  }

  let filtered = [...data];

  // Date range filtering
  if (filters.dateFrom || filters.dateTo) {
    // Searches for date fields: Date, Updated, Created, date, updatedAt, createdAt
    // Filters rows based on date range
  }

  // Department filtering
  if (filters.department !== "All") {
    // Searches for fields: Department, department, Type, type
    // Case-insensitive matching
  }

  // Region filtering
  if (filters.region !== "All") {
    // Searches for fields: Region, region, Location, location
    // Case-insensitive matching
  }

  setFilteredData(filtered);
}, [data, filters]);
```

**Behavior**: Filters the table data without re-fetching from the API. Works on already loaded data.

---

## Data Fetching Architecture

### API Endpoints

#### Base URLs
```javascript
const API_BASE_URL = "http://localhost:8000/api/bi"; // BI Module API
const API_MODULES_BASE = "http://localhost:8000/api"; // Direct module APIs
```

### Data Fetching Strategy

The module uses a **fallback approach**:

1. **Try BI Module First** (Summaries)
   ```
   GET /api/bi/summaries?moduleId={moduleId}&startDate={dateFrom}&endDate={dateTo}
   ```

2. **Try BI Snapshots** (Dummy Data)
   ```
   GET /api/bi/snapshots?moduleId={moduleId}&snapshotType=dummy_data
   GET /api/bi/snapshots/{snapshotId}
   ```

3. **Fallback to Direct Module APIs**
   - Each report type has specific API endpoints

### Report-Specific API Calls

#### Inventory Report
```
GET /api/inventory/getItems
```
Returns items with: name, sku, category, quantity, unit, updatedAt

#### Transaction Report
```
GET /api/transactions
```
Returns transactions with: type, quantity, itemId, transactionDate, remarks

#### Warehouse Report
```
GET /api/warehouses/getAllWarehouse
```
Returns warehouses with: name, location, capacity, currentStock

#### Procurement Report
```javascript
const [suppliersRes, requisitionsRes, posRes, invoicesRes] = await Promise.all([
  fetch(`${API_MODULES_BASE}/suppliers`),
  fetch(`${API_MODULES_BASE}/requisitions`),
  fetch(`${API_MODULES_BASE}/purchase-orders`),
  fetch(`${API_MODULES_BASE}/invoices`),
]);
```
Combines data from 4 endpoints:
- Suppliers: name, contactPerson, status
- Requisitions: description, quantity, status
- Purchase Orders: description, status, orderDate
- Invoices: totalAmount, status, dateReceived

#### Finance Report
```javascript
const [financeTransRes, payrollRes] = await Promise.all([
  fetch(`${API_MODULES_BASE}/finance/inventory-transactions`),
  fetch(`${API_MODULES_BASE}/finance/payroll-report`),
]);
```
Combines:
- Finance Transactions: amount, date
- Payroll: name, netPay, payPeriod

#### HR Report
```javascript
const [payrollHrRes, attendanceRes, leavesRes] = await Promise.all([
  fetch(`${API_MODULES_BASE}/hr/payroll`),
  fetch(`${API_MODULES_BASE}/attendance`),
  fetch(`${API_MODULES_BASE}/leaves`),
]);
```
Combines:
- Payroll: name, department, netPay
- Attendance: employeeId, date, status
- Leave: employeeId, type, status

#### Sales Report
```
GET /api/sales-orders/all
```
Returns sales orders with: orderNumber, productId, customerName, totalAmount, status, createdAt

#### Customer Service Report
```
GET /api/customer-service/tickets
```
Returns tickets with: ticketNumber, customerName, issue, status, createdAt

---

## Summary Calculation

### Function: `calculateSummary()`

Calculates statistics from filtered data:

```javascript
const calculateSummary = () => {
  if (filteredData.length === 0) return null;

  const summary = {
    totalRecords: filteredData.length,
    originalRecords: data.length,
    filterApplied: filteredData.length !== data.length,
  };

  // Numeric field summaries (total, average, min, max)
  // Category breakdowns (counts by Department, Type, Status, Category, Region)

  return summary;
};
```

**Output Structure**:
- `totalRecords`: Number of filtered records
- `originalRecords`: Total records before filtering
- `filterApplied`: Boolean indicating if filters reduced the dataset
- For each numeric field: `{ total, average, min, max }`
- For each category field: `{ [value]: count }` breakdown

---

## Export Features

### 1. Export CSV
```javascript
const exportCSV = () => {
  const dataToExport = filteredData.length > 0 ? filteredData : data;
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.name);
  XLSX.writeFile(workbook, `${selectedReport.name}.csv`);
};
```
**Library**: `xlsx`

### 2. Export Excel
```javascript
const exportExcel = () => {
  const dataToExport = filteredData.length > 0 ? filteredData : data;
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.name);
  XLSX.writeFile(workbook, `${selectedReport.name}.xlsx`);
};
```
**Library**: `xlsx`

### 3. Export PDF
```javascript
const exportPDF = () => {
  const dataToExport = filteredData.length > 0 ? filteredData : data;
  const doc = new jsPDF("landscape", "pt", "a4");
  
  // Header section with title, date, filters
  // Table generation using autoTable
  // Footer with page numbers
  
  doc.save(fileName);
};
```
**Libraries**: `jspdf`, `jspdf-autotable`

**PDF Structure**:
- Header: Title, report name, generation date
- Filter metadata: Date range, department, region
- Table: Dynamic headers and rows from data
- Footer: Page numbers and timestamp

---

## Real-Time Data Updates

### Feature: Live Data Polling

```javascript
useEffect(() => {
  if (isRealTime && selectedReport) {
    const interval = setInterval(async () => {
      try {
        if (selectedReport.type === "dashboard") {
          await fetchDashboardData(true);
        } else {
          await fetchModuleData(selectedReport, true);
        }
        addLog(`Pulled live data for ${selectedReport.name}`);
      } catch (err) {
        addLog(`Error pulling live data: ${err.message}`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }
}, [isRealTime, selectedReport]);
```

**Behavior**: When enabled, refreshes data every 5 seconds (5000ms)

---

## Auto-Sync Feature

### Prevents Data Silos

```javascript
useEffect(() => {
  const autoSync = setInterval(async () => {
    if (selectedReport && !isRealTime) {
      try {
        if (selectedReport.type === "dashboard") {
          await fetchDashboardData(true);
        } else {
          await fetchModuleData(selectedReport, true);
        }
        addLog(`Auto-synced data to prevent outdated reports`);
      } catch (err) {
        addLog(`Auto-sync error: ${err.message}`);
      }
    }
  }, 15000);
  return () => clearInterval(autoSync);
}, [selectedReport, isRealTime]);
```

**Behavior**: 
- Runs every 15 seconds (15000ms)
- Only active when a report is selected
- Disabled when real-time mode is active (to avoid duplicate polling)

---

## Report Scheduling

### Function: `scheduleReport(frequency)`

```javascript
const scheduleReport = async (frequency) => {
  if (!selectedReport) {
    addLog("Please select a report first.");
    return;
  }

  setSchedule(frequency);
  addLog(`Scheduling ${selectedReport.name} to run ${frequency.toLowerCase()}...`);

  try {
    const response = await fetch("http://localhost:8000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: selectedReport.id,
        reportType: selectedReport.type,
        frequency,
        filters,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      addLog(`Report "${selectedReport.name}" scheduled successfully!`);
    } else {
      addLog(`Failed to schedule report: ${result.message}`);
    }
  } catch (error) {
    addLog(`Error scheduling report: ${error.message}`);
  }
};
```

**Frequency Options**:
- Daily: Every day at 9:00 AM
- Weekly: Every Monday at 9:00 AM
- Monthly: 1st of every month at 9:00 AM

**API Endpoint**:
```
POST /api/schedules
Body: { reportId, reportType, frequency, filters }
```

---

## Dashboard Data

### Function: `fetchDashboardData()`

```javascript
const fetchDashboardData = async (isRefresh = false) => {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  const dashboard = await response.json();
  
  // Transform dashboard data to table format
  const tableData = [];
  Object.values(dashboard.modules || {}).forEach((module, idx) => {
    module.summaries?.forEach((summary, sIdx) => {
      tableData.push({
        ID: `${idx + 1}-${sIdx + 1}`,
        Module: module.moduleName,
        SummaryType: summary.summaryType,
        TotalCount: summary.metrics?.totalCount || 0,
        TotalValue: summary.metrics?.totalValue || 0,
        Period: summary.period?.periodType || "N/A",
      });
    });
  });

  setData(tableData);
};
```

**API Endpoint**:
```
GET /api/bi/dashboard
```

---

## Pull All Modules Data

### Function: `pullAllModulesData()`

```javascript
const pullAllModulesData = async () => {
  setLoading(true);
  addLog("Pulling data from all modules...");
  try {
    const response = await fetch(`${API_BASE_URL}/pull-all`);
    const result = await response.json();
    addLog(`Pulled data from ${result.summary.successful} modules successfully`);
    if (result.summary.failed > 0) {
      addLog(`Warning: ${result.summary.failed} modules failed to pull data`);
    }
  } catch (error) {
    addLog(`Error pulling all modules: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

**API Endpoint**:
```
GET /api/bi/pull-all
```

**Purpose**: Triggers data collection from all module APIs into the BI database

---

## State Management

### Main State Variables

```javascript
const [filters, setFilters] = useState({
  dateFrom: "",
  dateTo: "",
  department: "All",
  region: "All",
});

const [reports] = useState([...]); // Static list of 7 reports
const [filteredReports, setFilteredReports] = useState(reports); // Department-filtered reports
const [selectedReport, setSelectedReport] = useState(null); // Currently selected report
const [data, setData] = useState([]); // Raw data from API
const [filteredData, setFilteredData] = useState([]); // Client-side filtered data
const [isRealTime, setIsRealTime] = useState(false); // Real-time polling toggle
const [log, setLog] = useState([]); // System activity logs (max 15 entries)
const [schedule, setSchedule] = useState(null); // Current schedule frequency
const [loading, setLoading] = useState(false); // Loading state
const [error, setError] = useState(null); // Error messages
```

---

## Data Transformation Functions

### 1. Transform Raw Data to Table
```javascript
const transformRawDataToTableData = (rawData, reportType) => {
  // Handles array data or nested objects
  // Converts field names to display format (camelCase → Title Case)
  // Formats dates to locale string
  return data;
};
```

### 2. Transform Summary to Table
```javascript
const transformSummaryToTableData = (summary, reportType) => {
  // Extracts metrics from BI summary
  // Creates table rows for inventory, finance, or generic metrics
  return data;
};
```

---

## Logging System

### Function: `addLog(message)`

```javascript
const addLog = (message) => {
  setLog((prev) => [message, ...prev].slice(0, 15));
};
```

**Behavior**: 
- Adds new log entry to the beginning
- Keeps only the most recent 15 entries
- Displayed in "System Logs" section at bottom of page

---

## UI Components

### 1. Header Section
- Gradient background (indigo → purple → pink)
- Title: "Business Intelligence"
- Subtitle: "Module 7 - Advanced Reporting & Analytics"
- "Sync All Data" button (calls `pullAllModulesData()`)

### 2. Error Alert
- Red border and background
- Displays error message
- Dismissible with × button

### 3. Loading Indicator
- Blue gradient background
- Spinning icon
- "Loading data, please wait..." message

### 4. Filters Section
- 4 filter inputs: Date From, Date To, Department, Region
- Gradient header (indigo → purple)
- Grid layout (responsive: 1 column mobile, 4 columns desktop)

### 5. Available Reports Section
- Lists all reports (filtered by department)
- Shows count: "X of Y reports"
- Each report card has:
  - Icon
  - Report name
  - Department badge
  - "Generate" button
- Empty state when no reports match filter

### 6. Summary Section
- Only shown when data exists
- Grid of metric cards:
  - Total Records
  - Numeric field summaries (total, average)
  - Category breakdowns (distribution charts)

### 7. Table Preview
- Shows filtered data count badge
- Renders Table component with data
- Export buttons: CSV, Excel, PDF

### 8. Real-Time Toggle
- Checkbox to enable/disable live polling

### 9. Schedule Section
- Only shown when report is selected
- 3 buttons: Daily, Weekly, Monthly
- Active schedule highlighted
- "Cancel Schedule" button when active

### 10. System Logs
- Scrollable list (max height: 160px)
- Shows recent 15 activities
- Empty state: "No recent activity"

---

## Dependencies

### Required npm Packages
```json
{
  "react": "^18.x",
  "xlsx": "^0.18.x",
  "jspdf": "^2.x",
  "jspdf-autotable": "^3.x"
}
```

### Component Dependencies
- `Table` component from `../../components/layouts/Table`

---

## Error Handling

### API Fetch Errors
- Try-catch blocks around all API calls
- Fallback to alternative data sources
- Error messages logged and displayed to user
- Graceful degradation (shows error in table if all sources fail)

### Example Error Handling Pattern
```javascript
try {
  // Try BI API
  const response = await fetch(biEndpoint);
  if (response.ok) {
    // Use BI data
  }
} catch (biError) {
  // Fallback to direct API
  try {
    const response = await fetch(directEndpoint);
    // Use direct data
  } catch (error) {
    // Show error to user
    setError(`Failed to fetch data: ${error.message}`);
    setData([{ ID: 1, Error: error.message }]);
  }
}
```

---

## Key Behaviors

### 1. Report Generation Flow
1. User selects department filter (optional)
2. Available reports list updates
3. User clicks "Generate" on a report
4. `handleGenerateReport()` called
5. `fetchModuleData()` attempts to fetch from:
   - BI summaries
   - BI snapshots
   - Direct module API
6. Data transformed and stored in `data` state
7. Client-side filters applied → `filteredData`
8. Table and summary rendered

### 2. Filter Application
- Department filter: Affects available reports list
- Date/Region filters: Affect table data display (client-side)
- Filters do NOT trigger new API calls
- Filters work on already loaded data

### 3. Export Behavior
- Always exports `filteredData` if available
- Falls back to `data` if no filters applied
- Filename includes report name and timestamp (PDF only)

### 4. Real-Time vs Auto-Sync
- Real-time: User-controlled, 5-second interval
- Auto-sync: Always active (unless real-time enabled), 15-second interval
- Both prevent stale data

---

## Best Practices Implemented

1. **Separation of Concerns**: Data fetching, transformation, and rendering are separate
2. **Graceful Degradation**: Multiple fallback data sources
3. **User Feedback**: Loading states, error messages, activity logs
4. **Performance**: Client-side filtering avoids unnecessary API calls
5. **Accessibility**: Semantic HTML, clear labels, keyboard navigation
6. **Responsive Design**: Mobile-first grid layouts
7. **Error Recovery**: Try-catch blocks, fallback data sources

---

## Known Limitations

1. **No Pagination**: All data loaded at once (could be slow for large datasets)
2. **No Server-Side Filtering**: Filters work only on loaded data
3. **Fixed Polling Intervals**: Not configurable by user
4. **No Export Progress**: Large exports may appear frozen
5. **Schedule API Dependency**: Scheduling requires backend implementation
6. **No Data Caching**: Each report generation fetches fresh data

---

## Future Enhancement Opportunities

1. Add pagination for large datasets
2. Implement server-side filtering
3. Add configurable polling intervals
4. Show export progress indicators
5. Add data caching layer
6. Support custom date ranges in schedules
7. Add email delivery for scheduled reports
8. Implement report templates
9. Add chart visualizations
10. Support custom report builder

---

## Testing Recommendations

### Unit Tests
- Test filter logic independently
- Test data transformation functions
- Test summary calculation with various data shapes

### Integration Tests
- Test API fallback chain
- Test export functions with sample data
- Test real-time polling behavior

### E2E Tests
- Test complete report generation flow
- Test filter interactions
- Test export downloads
- Test schedule creation

---

## Conclusion

The ERP Report Module provides a comprehensive, user-friendly interface for generating, filtering, and exporting reports from multiple ERP modules. It implements robust error handling, multiple data sources, and real-time capabilities to ensure users always have access to current, accurate business intelligence data.
