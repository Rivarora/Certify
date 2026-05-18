import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-[#6D28D9] opacity-20">404</p>
        <p className="text-xl font-semibold text-gray-700 mt-4">Page not found</p>
        <p className="text-gray-400 mt-2 mb-6">This route doesn't exist.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#6D28D9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5B21B6] transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}