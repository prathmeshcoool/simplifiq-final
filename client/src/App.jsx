import { useState } from "react";
import axios from "axios";

// Use VITE_API_URL from .env — falls back to localhost for local dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success"|"error", message: "" }
  const [audit, setAudit] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus(null);
      setAudit(null);

      const response = await axios.post(`${API_URL}/api/lead`, formData);

      setStatus({ type: "success", message: response.data.message });
      setAudit(response.data.audit);
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong. Please try again.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-zinc-900 p-8 rounded-2xl shadow-2xl">

        <h1 className="text-4xl font-bold mb-2">SimplifiQ AI Lead System</h1>
        <p className="text-zinc-400 mb-8">AI-powered company audit automation</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 transition"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 transition"
            required
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 transition"
            required
          />

          <input
            type="url"
            name="website"
            placeholder="Company Website (https://...)"
            value={formData.website}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
                Generating Audit...
              </span>
            ) : (
              "Generate AI Audit"
            )}
          </button>
        </form>

        {status && (
          <div
            className={`mt-6 text-center text-sm font-medium ${
              status.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {status.message}
          </div>
        )}

        {audit && (
          <div className="mt-8 bg-zinc-800 p-6 rounded-xl space-y-6">

            <div>
              <h2 className="text-xl font-bold mb-2">Company Summary</h2>
              <p className="text-zinc-300 leading-7">{audit.companySummary}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Pain Points</h2>
              <ul className="list-disc list-inside text-zinc-300 space-y-2">
                {audit.painPoints.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">AI Opportunities</h2>
              <ul className="list-disc list-inside text-zinc-300 space-y-2">
                {audit.aiOpportunities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Recommendations</h2>
              <ul className="list-disc list-inside text-zinc-300 space-y-2">
                {audit.recommendations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
