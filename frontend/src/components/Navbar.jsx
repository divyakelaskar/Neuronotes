import React from "react";

const Navbar = ({ onCreateNode }) => {
  const handleLogout = () => {
    // ✅ Only clear auth tokens, keep remembered email if any
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth";
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-100 shadow">
      <h1 className="text-xl font-bold">Neuronotes</h1>

      <div className="flex items-center space-x-4">
        <button
          onClick={onCreateNode}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + New Node
        </button>

        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
