# Module_8style CSS Files Backup

**Date Created:** January 5, 2026  
**Purpose:** Backup of all CSS files in Module_8style directory before switching modules  
**Location:** `frontend/src/pages/SalesCustomer/Module_8style/`

---

## File Structure

```
Module_8style/
├── After_Sales.css
├── CM_management.css
├── Sales_order.css
└── Sales_report.css
```

---

## 1. After_Sales.css

```css
.aftersales-container {
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  background: linear-gradient(90deg, #232526 0%, #414345 100%);
  color: #f5f5f5;
  padding: 30px 0;
  border-radius: 0;
  font-family: "Poppins", "Segoe UI", Arial, sans-serif;
  box-shadow: 0 4px 24px rgba(34, 34, 34, 0.15);
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2, h3 {
  text-align: center;
  color: #ee7829;
  margin-bottom: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.form-card {
  background: #fff;
  color: #232526;
  padding: 24px 32px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(34, 34, 34, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 700px;
}

label {
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 4px;
  color: #414345;
}

input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  background: #f7f7f7;
  color: #232526;
  font-size: 1rem;
  transition: border-color 0.2s;
}
input:focus {
  border-color: #ee7829;
}

input::placeholder {
  color: #bdbdbd;
}

button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #ee7829;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: #ff924d;
}

.case-card {
  background: #fff;
  color: #232526;
  padding: 24px 32px;
  margin: 20px 0;
  border-radius: 12px;
  transition: 0.3s;
  border-left: 5px solid #ee7829;
  font-size: 1.15rem;
  box-shadow: 0 2px 12px rgba(34, 34, 34, 0.08);
  word-break: break-word;
}

.case-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(238, 120, 41, 0.15);
}

select {
  background: #f7f7f7;
  color: #232526;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 1rem;
}

.case-card p {
  margin-bottom: 12px;
  line-height: 1.6;
  font-size: 1.15rem;
}

.status {
  font-weight: bold;
  text-transform: capitalize;
}

.status.open {
  color: #ff4d4d;
}

.status.in-progress {
  color: #f5c542;
}

.status.resolved {
  color: #4caf50;
}

.no-cases {
  text-align: center;
  color: #ccc;
  font-style: italic;
}

.table-wrapper {
  width: 100%;
  max-width: 1000px;
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(34, 34, 34, 0.08);
  margin-bottom: 25px;
}

.cases-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #232526;
}

.cases-table thead {
  background: #ee7829;
  color: #fff;
}

.cases-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.9rem;
  white-space: nowrap;
}

.cases-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.cases-table tbody tr:hover {
  background-color: #f7f7f7;
}

.cases-table td {
  padding: 12px;
  font-size: 0.9rem;
}

.table-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f7f7f7;
  color: #232526;
  font-size: 0.85rem;
  cursor: pointer;
}

.table-select:focus {
  border-color: #ee7829;
  outline: none;
}

.satisfaction-input {
  width: 50px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f7f7f7;
  color: #232526;
  font-size: 0.85rem;
  text-align: center;
}

.satisfaction-input:focus {
  border-color: #ee7829;
  outline: none;
}

.btn-delete-case {
  padding: 6px 12px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.3s;
}

.btn-delete-case:hover {
  background: #dc2626;
}
```

---

## 2. CM_management.css

```css
.container, .crm-container, .aftersales-container, .report-container {
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  background: linear-gradient(90deg, #232526 0%, #414345 100%);
  color: #f5f5f5;
  padding: 30px 0;
  border-radius: 0;
  font-family: "Poppins", "Segoe UI", Arial, sans-serif;
  box-shadow: 0 4px 24px rgba(34, 34, 34, 0.15);
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-card, .order-card, .crm-card, .case-card {
  background: #fff;
  color: #232526;
  padding: 24px 32px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(34, 34, 34, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 700px;
}

button {
  background: #ee7829;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  margin-top: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: #ff924d;
  color: #232526;
}

select, input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f7f7f7;
  color: #232526;
  font-size: 1rem;
  transition: border-color 0.2s;
}
input:focus, select:focus {
  border-color: #ee7829;
}

.crm-table {
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  background: #fff;
  color: #232526;
  box-shadow: 0 2px 12px rgba(34, 34, 34, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 25px;
}

.crm-table thead {
  background: #ee7829;
  color: #fff;
}

.crm-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

.crm-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.crm-table tbody tr:hover {
  background-color: #f7f7f7;
}

.crm-table td {
  padding: 14px 16px;
  font-size: 0.95rem;
}

.segment-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.segment-badge.vip {
  background: #fbbf24;
  color: #78350f;
}

.segment-badge.regular {
  background: #d1d5db;
  color: #374151;
}

.logs-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.85rem;
}

.logs-list li {
  padding: 4px 0;
  color: #232526;
}

.logs-list .no-logs {
  color: #999;
  font-style: italic;
}

.crm-table-container {
  width: 100%;
  max-width: 1200px;
}

.btn-manage {
  background: #ee7829;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.3s;
}

.btn-manage:hover {
  background: #d66d21;
}

.expanded-row {
  background: #f5f5f5 !important;
}

.expanded-row td {
  padding: 20px !important;
  border-top: 2px solid #ddd;
}

.log-management h4 {
  margin: 0 0 15px 0;
  color: #232526;
  font-size: 1rem;
}

.logs-section {
  margin-bottom: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.logs-list-edit {
  list-style: none;
  padding: 0;
  margin: 0;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.log-item:hover {
  background: #f0f0f0;
}

.log-display {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  width: 100%;
}

.log-display span {
  flex: 1;
  color: #232526;
  font-size: 0.95rem;
}

.log-edit {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.log-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #232526;
  background: #fff;
}

.log-input:focus {
  border-color: #ee7829;
  outline: none;
  box-shadow: 0 0 0 3px rgba(238, 120, 41, 0.1);
}

.btn-edit, .btn-save, .btn-cancel, .btn-delete-log, .btn-add-log {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-edit {
  background: #3b82f6;
  color: #fff;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-save {
  background: #10b981;
  color: #fff;
}

.btn-save:hover {
  background: #059669;
}

.btn-cancel {
  background: #6b7280;
  color: #fff;
}

.btn-cancel:hover {
  background: #4b5563;
}

.btn-delete-log {
  background: #ef4444;
  color: #fff;
}

.btn-delete-log:hover {
  background: #dc2626;
}

.add-log-section {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.add-log-section .log-input {
  flex: 1;
}

.btn-add-log {
  background: #ee7829;
  color: #fff;
  padding: 8px 16px;
}

.btn-add-log:hover {
  background: #d66d21;
}

.no-logs {
  color: #999;
  font-style: italic;
  padding: 10px;
}
```

---

## 3. Sales_order.css

```css
body{
  background: #ccc;
}

.container {
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  background: linear-gradient(90deg, #232526 0%, #414345 100%);
  color: #f5f5f5;
  padding: 30px 0;
  border-radius: 0;
  font-family: "Poppins", "Segoe UI", Arial, sans-serif;
  box-shadow: 0 4px 24px rgba(34, 34, 34, 0.15);
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2, h3 {
  color: #ee7829;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.form-card, .order-card {
  background: #fff;
  color: #232526;
  padding: 24px 32px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(34, 34, 34, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 700px;
}

label {
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 4px;
  color: #414345;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  margin-top: 5px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f7f7f7;
  color: #232526;
  font-size: 1rem;
  transition: border-color 0.2s;
}
input:focus, select:focus {
  border-color: #ee7829;
}
.btn-primary {
  background: #ee7829;
  color: #fff;
  padding: 10px 20px;
  margin-top: 15px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.btn-secondary {
  background: #414345;
  color: #fff;
  padding: 8px 16px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.status {
  font-weight: bold;
  color: #961a1a;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #d1d5db;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #232526;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: #ee7829;
}

.tab-btn.active {
  color: #ee7829;
  border-bottom-color: #ee7829;
}

.orders-table {
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  background: #fff;
  color: #232526;
  box-shadow: 0 2px 12px rgba(34, 34, 34, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 25px;
}

.orders-table thead {
  background: #ee7829;
  color: #fff;
}

.orders-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

.orders-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.orders-table tbody tr:hover {
  background-color: #f7f7f7;
}

.orders-table td {
  padding: 14px 16px;
  font-size: 0.95rem;
}

.orders-table select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f7f7f7;
  color: #232526;
  font-size: 0.9rem;
}

.orders-table select:focus {
  border-color: #ee7829;
  outline: none;
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action, .btn-delete {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: 0.3s;
}

.btn-action {
  background: #ee7829;
  color: #fff;
}

.btn-action:hover {
  background: #d66d21;
}

.btn-delete {
  background: #dc2626;
  color: #fff;
}

.btn-delete:hover {
  background: #b91c1c;
}

.btn-action:disabled, .btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action:disabled:hover, .btn-delete:disabled:hover {
  background: #ee7829;
}
```

---

## 4. Sales_report.css

```css
/* Sales Report Styles */
.report-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  color: #232526;
  padding: 40px 20px;
  border-radius: 16px;
  font-family: "Poppins", "Segoe UI", Arial, sans-serif;
  box-shadow: 0 8px 32px rgba(34, 34, 34, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.report-container h2 {
  text-align: center;
  color: #ee7829;
  margin-bottom: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.form-card {
  background: #fff;
  color: #232526;
  padding: 32px 40px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 6px 24px rgba(34, 34, 34, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(34, 34, 34, 0.12);
}

label {
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 4px;
  color: #414345;
}

select {
  background: #fff;
  color: #232526;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  background: #fff;
  box-shadow: 0 6px 24px rgba(34, 34, 34, 0.08);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

th, td {
  padding: 16px 18px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

th {
  background: linear-gradient(135deg, #ee7829 0%, #ff924d 100%);
  color: #fff;
  font-weight: 700;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background-color: #f9fafb;
}

.form-card h4 {
  margin-top: 0;
  color: #ee7829;
}
```

---

## Notes

- **Original Theme**: Dark gradient backgrounds with bright orange accents (`#ee7829`)
- **Status**: These are the original CSS files before the orangey theme update
- **Usage**: These files are used by other modules and should be preserved for backward compatibility
- **SalesCustomer Module**: Uses Tailwind classes instead of these CSS files for isolation

## Restoration Instructions

If you need to restore these files:

1. Copy the content from the appropriate section above
2. Paste into the corresponding CSS file in `Module_8style/`
3. Save the file

## Related Files

- **Updated Versions**: See `ORANGEY_THEME_UPDATE_SUMMARY.md` for the new color scheme
- **CSS Isolation**: See `CSS_ISOLATION_README.md` for module isolation approach
- **Usage Examples**: See `USAGE_EXAMPLE_FOR_OTHER_MODULES.jsx` for implementation patterns