// ProjectFinanceReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import FinanceLayout from "./FinanceLayout";

export default function ProjectFinanceReport() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setIsFetching(true);
        const res = await fetch(
          "http://localhost:8000/api/finance/project-report"
        );
        if (!res.ok) throw new Error("Failed to load project finance report");
        const payload = await res.json();
        if (!active) return;
        setData(Array.isArray(payload) ? payload : []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch project finance data");
        setData([]);
      } finally {
        if (active) setIsFetching(false);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const formatCurrency = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    return `₱${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString()
      : "—";
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
    anchor.download = `project_finance_report_${new Date()
      .toISOString()
      .slice(0, 10)}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const getStatusTone = (status) => {
    const normalized = (status || "—").toString().toLowerCase();
    if (normalized.includes("completed"))
      return "bg-emerald-100 text-emerald-700";
    if (normalized.includes("over budget") || normalized.includes("at risk"))
      return "bg-rose-100 text-rose-700";
    if (normalized.includes("progress")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [data]);

  const metrics = useMemo(() => {
    if (!sortedData.length) {
      return [
        { label: "Active Projects", value: "0" },
        { label: "Total Budget", value: formatCurrency(0) },
        { label: "Budget Spent", value: formatCurrency(0) },
        { label: "Cost Variance", value: formatCurrency(0) },
        { label: "At Risk Projects", value: "0" },
      ];
    }

    const totalBudget = sortedData.reduce(
      (sum, project) => sum + (project.totalBudget || 0),
      0
    );
    const totalSpent = sortedData.reduce(
      (sum, project) => sum + (project.actualCost || project.spent || 0),
      0
    );
    const atRiskProjects = sortedData.filter((project) => {
      const variance =
        (project.totalBudget || 0) - (project.actualCost || project.spent || 0);
      return (
        variance < 0 || project.status?.toLowerCase().includes("over budget")
      );
    }).length;

    return [
      { label: "Active Projects", value: sortedData.length.toLocaleString() },
      { label: "Total Budget", value: formatCurrency(totalBudget) },
      { label: "Budget Spent", value: formatCurrency(totalSpent) },
      {
        label: "Cost Variance",
        value: formatCurrency(totalBudget - totalSpent),
      },
      { label: "At Risk Projects", value: atRiskProjects.toLocaleString() },
    ];
  }, [sortedData]);

  const exportCsv = () => {
    const headers = [
      "Project Name",
      "Status",
      "Total Budget",
      "Actual Cost",
      "Variance",
      "Start Date",
      "End Date",
    ];
    const rows = sortedData.map((project) => [
      `"${sanitize(project.projectName)}"`,
      `"${sanitize(project.status)}"`,
      formatCurrency(project.totalBudget),
      formatCurrency(project.actualCost || project.spent),
      formatCurrency(
        (project.totalBudget || 0) - (project.actualCost || project.spent || 0)
      ),
      `"${sanitize(formatDate(project.startDate))}"`,
      `"${sanitize(formatDate(project.endDate))}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );
    downloadFile(csv, "text/csv", "csv");
  };

  return (
    <FinanceLayout title="Project Finance Report" showNavigation={false}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-blue-600">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={isFetching || !sortedData.length}
          >
            Download CSV
          </button>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/80 p-8 text-center text-rose-600">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Project Name
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Budget
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actual Cost
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Variance
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedData.length ? (
                  sortedData.map((project) => {
                    const actualCost = project.actualCost || project.spent || 0;
                    const variance = (project.totalBudget || 0) - actualCost;

                    return (
                      <tr
                        key={project._id || project.id}
                        className="transition hover:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {project.projectName}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-700">
                          {formatCurrency(project.totalBudget)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                          {formatCurrency(actualCost)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            variance < 0 ? "text-rose-700" : "text-emerald-700"
                          }`}
                        >
                          {formatCurrency(variance)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {formatDate(project.startDate)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {formatDate(project.endDate)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-sm text-slate-500"
                      colSpan={7}
                    >
                      {isFetching
                        ? "Loading project finance data..."
                        : "No project finance data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FinanceLayout>
  );
}
