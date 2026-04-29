import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Submitted successfully");
        setEmail("");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Network error");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Microbex Onboarding</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default App;