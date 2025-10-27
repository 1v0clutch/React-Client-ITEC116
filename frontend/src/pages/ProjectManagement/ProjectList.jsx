import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_PROJECT = "http://localhost:8000/api/project";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_PROJECT}/projects`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setEditFields({
      name: project.name,
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({ name: "", startDate: "", endDate: "" });
  };

  const saveEdit = async (id) => {
    if (!editFields.name.trim()) return alert("Project name cannot be empty.");
    try {
      const res = await fetch(`${API_PROJECT}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFields),
      });
      if (res.ok) {
        alert("Project updated successfully!");
        setEditingId(null);
        fetchProjects();
      } else {
        alert("Failed to update project.");
      }
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const res = await fetch(`${API_PROJECT}/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Project deleted successfully.");
        fetchProjects();
      } else {
        alert("Failed to delete project.");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Project List</h1>
        <button
          onClick={() => navigate("/project-management/project")}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          <FiArrowLeft /> Back to Projects
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No projects found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-3">Project Name</th>
                <th className="text-left px-4 py-3">Start Date</th>
                <th className="text-left px-4 py-3">End Date</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-3">
                    {editingId === p._id ? (
                      <input
                        type="text"
                        value={editFields.name}
                        onChange={(e) =>
                          setEditFields({ ...editFields, name: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">
                        {p.name}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === p._id ? (
                      <input
                        type="date"
                        value={editFields.startDate}
                        onChange={(e) =>
                          setEditFields({
                            ...editFields,
                            startDate: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : p.startDate ? (
                      new Date(p.startDate).toLocaleDateString()
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === p._id ? (
                      <input
                        type="date"
                        value={editFields.endDate}
                        onChange={(e) =>
                          setEditFields({
                            ...editFields,
                            endDate: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : p.endDate ? (
                      new Date(p.endDate).toLocaleDateString()
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {editingId === p._id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => saveEdit(p._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FiSave />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteProject(p._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
