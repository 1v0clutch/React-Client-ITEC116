import { useEffect, useMemo, useState } from "react";

export default function EmployeePayrollReport() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let active = true;

    const toArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === "object") {
        for (const key of ["data", "items", "results", "records", "rows", "list", "content"]) {
          if (Array.isArray(payload[key])) return payload[key];
        }
      }
      return [];
    };

    const load = async () => {
      try {
        setIsFetching(true);
        setError(null);

        // Fetch from multiple HR endpoints for comprehensive payroll data
        const [payrollRes, attendanceRes, leaveRes, financePayrollRes] = await Promise.allSettled([
          fetch("http://localhost:8000/api/hr/payroll"),
          fetch("http://localhost:8000/api/attendance"),
          fetch("http://localhost:8000/api/leaves"),
          fetch("http://localhost:8000/api/finance/payroll-report") // Fallback
        ]);

        if (!active) return;

        let payrollData = [];
        let attendanceRecords = [];
        let leaveRecords = [];

        // Process payroll data (primary source)
        if (payrollRes.status === "fulfilled" && payrollRes.value.ok) {
          const payload = await payrollRes.value.json();
          payrollData = toArray(payload);
        } else if (financePayrollRes.status === "fulfilled" && financePayrollRes.value.ok) {
          // Fallback to finance endpoint
          const payload = await financePayrollRes.value.json();
          payrollData = toArray(payload);
        }

        // Process attendance data
        if (attendanceRes.status === "fulfilled" && attendanceRes.value.ok) {
          const payload = await attendanceRes.value.json();
          attendanceRecords = toArray(payload);
        }

        // Process leave data
        if (leaveRes.status === "fulfilled" && leaveRes.value.ok) {
          const payload = await leaveRes.value.json();
          leaveRecords = toArray(payload);
        }

        // Enhance payroll data with attendance and leave information
        const enhancedPayrollData = payrollData.map(payroll => {
          const employeeId = payroll.employeeId || payroll.employee || payroll.name;
          
          // Find related attendance records
          const employeeAttendance = attendanceRecords.filter(att => 
            att.employeeId === employeeId || att.employee === employeeId || att.employeeName === employeeId
          );
          
          // Find related leave records
          const employeeLeaves = leaveRecords.filter(leave => 
            leave.employeeId === employeeId || leave.employee === employeeId || leave.employeeName === employeeId
          );

          // Calculate additional metrics
          const totalWorkingDays = employeeAttendance.length;
          const totalLeaves = employeeLeaves.reduce((sum, leave) => sum + (Number(leave.days) || 0), 0);
          const attendanceRate = totalWorkingDays > 0 ? ((totalWorkingDays - totalLeaves) / totalWorkingDays * 100).toFixed(1) : 0;

          return {
            ...payroll,
            totalWorkingDays,
            totalLeaves,
            attendanceRate: `${attendanceRate}%`,
            source: payrollRes.status === "fulfilled" ? "HR Module" : "Finance Module"
          };
        });

        setData(enhancedPayrollData);
        setLastUpdated(new Date());
        setError(enhancedPayrollData.length === 0 ? "No payroll data available from HR or Finance modules" : null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch payroll data from HR modules");
        setData([]);
        console.error("Payroll data loading error:", err);
      } finally {
        if (active) setIsFetching(false);
      }
    };

    load();
    const interval = setInterval(load, 8000); // Real-time updates every 8 seconds
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.dateProcessed || a.createdAt || 0).getTime();
      const dateB = new Date(b.dateProcessed || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [data]);

  const formatCurrency = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : "—";
  };

  const sanitize = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).replace(/"/g, '""');
  };

  const downloadFile = (content, mime, extension) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `comprehensive_payroll_report_${new Date().toISOString().slice(0, 10)}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const metrics = useMemo(() => {
    if (!sortedData.length) {
      return [
        { label: "Payroll Runs", value: "0", color: "blue" },
        { label: "Employees Paid", value: "0", color: "green" },
        { label: "Total Gross Pay", value: formatCurrency(0), color: "purple" },
        { label: "Total Deductions", value: formatCurrency(0), color: "orange" },
        { label: "Total Net Pay", value: formatCurrency(0), color: "emerald" },
        { label: "Avg Attendance", value: "0%", color: "cyan" },
        { label: "Total Leave Days", value: "0", color: "pink" },
        { label: "Last Updated", value: "Never", color: "gray" }
      ];
    }
    
    const uniqueEmployees = new Set(
      sortedData.map((row) => row.employeeId || row.name || row._id || "")
    );
    
    const totalGross = sortedData.reduce((sum, row) => {
      return sum + (typeof row.grossPay === "number" ? row.grossPay : 0);
    }, 0);
    
    const totalNet = sortedData.reduce((sum, row) => {
      return sum + (typeof row.netPay === "number" ? row.netPay : 0);
    }, 0);
    
    const totalDeductions = sortedData.reduce((sum, row) => {
      return sum + (typeof row.deductions === "number" ? row.deductions : 0);
    }, 0);

    const avgAttendance = sortedData.length > 0 ? 
      (sortedData.reduce((sum, row) => sum + parseFloat(row.attendanceRate || 0), 0) / sortedData.length).toFixed(1) : 0;

    const totalLeaveDays = sortedData.reduce((sum, row) => sum + (row.totalLeaves || 0), 0);
    
    return [
      { label: "Payroll Runs", value: sortedData.length.toLocaleString(), color: "blue" },
      { label: "Employees Paid", value: uniqueEmployees.size.toLocaleString(), color: "green" },
      { label: "Total Gross Pay", value: formatCurrency(totalGross), color: "purple" },
      { label: "Total Deductions", value: formatCurrency(totalDeductions), color: "orange" },
      { label: "Total Net Pay", value: formatCurrency(totalNet), color: "emerald" },
      { label: "Avg Attendance", value: `${avgAttendance}%`, color: "cyan" },
      { label: "Total Leave Days", value: totalLeaveDays.toLocaleString(), color: "pink" },
      { label: "Last Updated", value: lastUpdated ? lastUpdated.toLocaleTimeString() : "Never", color: "gray" }
    ];
  }, [sortedData, lastUpdated]);

  const exportCsv = () => {
    const headers = [
      "Employee ID",
      "Name",
      "Pay Period",
      "Gross Pay",
      "Deductions",
      "Net Pay",
      "Working Days",
      "Leave Days",
      "Attendance Rate",
      "Date Processed",
      "Source"
    ];
    const rows = sortedData.map((row) => [
      `"${sanitize(row.employeeId || "—")}"`,
      `"${sanitize(row.name || "—")}"`,
      `"${sanitize(row.payPeriod || "—")}"`,
      formatCurrency(row.grossPay),
      formatCurrency(row.deductions),
      formatCurrency(row.netPay),
      row.totalWorkingDays || 0,
      row.totalLeaves || 0,
      `"${sanitize(row.attendanceRate || "—")}"`,
      `"${sanitize(formatDate(row.dateProcessed || row.createdAt))}"`,
      `"${sanitize(row.source || "Unknown")}"`
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, "text/csv", "csv");
  };

  const getMetricColor = (color) => {
    const colors = {
      blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
      green: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
      purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
      orange: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
      emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100",
      cyan: "border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100",
      pink: "border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100",
      gray: "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Comprehensive Payroll Report</h1>
            <p className="text-white/80 text-sm">Integrated HR payroll, attendance, and leave analytics</p>
          </div>
          {isFetching && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        {/* Enhanced Metrics Section */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Multi-Module HR Analytics</h2>
              <p className="text-white/80 text-sm">Real-time payroll, attendance, and leave integration</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${getMetricColor(metric.color)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`rounded-xl p-2 ${
                    metric.color === 'blue' ? 'bg-blue-500' :
                    metric.color === 'green' ? 'bg-green-500' :
                    metric.color === 'purple' ? 'bg-purple-500' :
                    metric.color === 'orange' ? 'bg-orange-500' :
                    metric.color === 'emerald' ? 'bg-emerald-500' :
                    metric.color === 'cyan' ? 'bg-cyan-500' :
                    metric.color === 'pink' ? 'bg-pink-500' :
                    'bg-gray-500'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {index === 0 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      ) : index === 1 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      ) : index === 5 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : index === 6 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <p className={`text-sm font-semibold uppercase tracking-wide ${
                    metric.color === 'blue' ? 'text-blue-700' :
                    metric.color === 'green' ? 'text-green-700' :
                    metric.color === 'purple' ? 'text-purple-700' :
                    metric.color === 'orange' ? 'text-orange-700' :
                    metric.color === 'emerald' ? 'text-emerald-700' :
                    metric.color === 'cyan' ? 'text-cyan-700' :
                    metric.color === 'pink' ? 'text-pink-700' :
                    'text-gray-700'
                  }`}>
                    {metric.label}
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Enhanced Export Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Export Data</h3>
                  <p className="text-sm text-gray-600">Download payroll report in CSV format</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={exportCsv}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isFetching || !sortedData.length}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>
          </div>

          {/* Enhanced Data Table */}
          {error ? (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-8 border-2 border-red-200">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-red-500 rounded-xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">Error Loading Data</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Payroll Records</h3>
                    <p className="text-white/80 text-sm">{sortedData.length} records found</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Employee ID
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Name
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
                          </svg>
                          Pay Period
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Gross Pay
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          Deductions
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Net Pay
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Attendance
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7" />
                          </svg>
                          Date Processed
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Source
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length ? (
                      sortedData.map((row, index) => (
                        <tr key={row._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {row.employeeId || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-800">{row.name || "—"}</td>
                          <td className="py-4 px-4">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-sm font-medium">
                              {row.payPeriod || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg font-semibold">
                              {formatCurrency(row.grossPay)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg font-semibold">
                              {formatCurrency(row.deductions)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-semibold">
                              {formatCurrency(row.netPay)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded-lg text-sm font-medium">
                              {row.attendanceRate || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            {formatDate(row.dateProcessed || row.createdAt)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                              {row.source || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-12 text-center" colSpan={9}>
                          <div className="flex flex-col items-center">
                            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xl font-semibold text-gray-500">
                              {isFetching ? "Loading comprehensive payroll data..." : "No payroll data available"}
                            </p>
                            {!isFetching && (
                              <p className="text-gray-400 mt-2">Payroll records from HR modules will appear here when available</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
