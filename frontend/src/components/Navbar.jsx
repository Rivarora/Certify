import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const linkStyle = (isActive) => ({
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: isActive ? "700" : "500",
    color: isActive ? "#6c63ff" : "#444",
    padding: "0.25rem 0",
    borderBottom: isActive ? "2px solid #6c63ff" : "2px solid transparent",
    transition: "color 0.2s",
  });

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid #f0eeff",
      boxShadow: scrolled ? "0 2px 16px rgba(108,99,255,0.08)" : "none",
      height: "68px",
      transition: "box-shadow 0.3s",
    }}>
      <div style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "0 2rem", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, #6c63ff, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(108,99,255,0.35)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" opacity="0.3"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: "800", fontSize: "1.15rem", color: "#1a1a2e" }}>
            Certi<span style={{ color: "#6c63ff" }}>Verify</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          {[
            { path: "/",       label: "Home"        },
            { path: "/upload", label: "How it Works" },
            { path: "/result", label: "Features"     },
            { path: "/result", label: "About Us"     },
            { path: "/result", label: "Contact"      },
          ].map(({ path, label }) => (
            <NavLink key={label} to={path} end={path === "/"}
              style={({ isActive }) => linkStyle(isActive && label === "Home")}
            >{label}</NavLink>
          ))}
        </nav>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <NavLink to="/login" style={{
            textDecoration: "none", padding: "0.55rem 1.4rem",
            borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem",
            color: "#6c63ff", border: "1.5px solid #6c63ff",
            background: "white", transition: "all 0.2s",
          }}>Log In</NavLink>
          <NavLink to="/signup" style={{
            textDecoration: "none", padding: "0.55rem 1.4rem",
            borderRadius: "8px", fontWeight: "700", fontSize: "0.9rem",
            color: "white",
            background: "linear-gradient(135deg, #6c63ff, #a855f7)",
            boxShadow: "0 4px 14px rgba(108,99,255,0.4)",
            transition: "all 0.2s",
          }}>Sign Up</NavLink>
        </div>
      </div>
    </header>
  );
}