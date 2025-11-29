import React from "react";
import "./Table.css";

export default function Table({ reportType, data }) {
  if (!reportType || data.length === 0)
    return <p className="text-gray-400">No data to display yet.</p>;

  // Dynamically extract headers from the first data row
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="table-container">
      <table className="report-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>
                  {row[header] !== null && row[header] !== undefined ? row[header] : "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
