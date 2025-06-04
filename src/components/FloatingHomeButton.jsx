import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // Import Home icon from lucide-react

function FloatingHomeButton() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <button
      onClick={() => navigate("/")} // Redirect to homepage
      className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
    >
      <Home size={24} />
    </button>
  );
}

export default FloatingHomeButton;
