import { Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setError("");

      // API CALL HERE

      console.log({
        email,
        password
      });

      // Example success
      alert("Login Successful");

    }

    catch (err) {

      setError("Invalid credentials");
    }

    finally {

      setLoading(false);
    }
  };

  return (

    <div
      style={{
        margin: 0,
        position: "relative",
        fontFamily: "sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f8f7ff 0%, #ede9ff 30%, #fdf4ff 55%, #fff8f0 80%, #fff 100%)"
      }}
    >

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow:
            "0 20px 60px rgba(108,99,255,0.12), 0 4px 20px rgba(0,0,0,0.06)"
        }}
      >

        <h2 style={{ marginBottom: "0.3rem" }}>
          Welcome back
        </h2>

        <p style={{ color: "#6b7280" }}>
          Sign in to your account
        </p>

        {error && (

          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.6rem",
              borderRadius: "8px",
              marginBottom: "1rem"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: "1rem" }}>

            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600
              }}
            >
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginTop: "0.3rem"
              }}
            />

          </div>

          <div style={{ marginBottom: "1rem" }}>

            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600
              }}
            >
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginTop: "0.3rem"
              }}
            />

          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.8rem",
              background:
                "linear-gradient(135deg, #6c63ff, #a855f7)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >

            {loading ? "Signing in..." : "Sign In →"}

          </button>

        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1rem"
          }}
        >
          Don't have an account?{" "}

          <Link
            to="/register"
            style={{
              color: "#6c63ff",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Create one
          </Link>

        </p>

      </div>

    </div>
  );
}