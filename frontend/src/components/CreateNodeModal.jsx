import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const CreateNodeModal = ({ parentNode, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [existingNodes, setExistingNodes] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(parentNode?.id || null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await api.get("/graph");
        setExistingNodes(res.data.nodes || []);
      } catch (err) {
        console.error("Failed to fetch nodes:", err);
      }
    };
    fetchNodes();
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/notes", {
        title: title.trim(),
        parentId: selectedParentId || null,
      });
      onCreated(res.data);
      setTitle("");
    } catch (err) {
      console.error("Failed to create node:", err);
    }
  }, [title, selectedParentId, onCreated]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleCreate();
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleCreate, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[90vw] p-6 flex flex-col animate-scaleIn">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Create Node</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter node title..."
          className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-semibold">
            Link to parent node (optional)
          </label>
          <select
            value={selectedParentId || ""}
            onChange={(e) =>
              setSelectedParentId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">No parent / top-level node</option>
            {existingNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreateNodeModal);
