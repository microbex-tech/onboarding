import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function App() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "website" })
      });

      const data = await res.json();
      setMessage(data.message || "Something went wrong");
      setIsSuccess(Boolean(data.success));

      if (data.success) setEmail("");
    } catch (error) {
      setMessage("Unable to submit email. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Microbex</p>
        <h1>Onboarding</h1>
        <p className="subtitle">
          Enter your email ID to start your Microbex onboarding journey.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="email">Email ID</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>

        {message && (
          <p className={isSuccess ? "message success" : "message error"}>
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
