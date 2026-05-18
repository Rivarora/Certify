
import Navbar from "./components/Navbar";
import AppRoutes from "./routes";

function App() {

  return (

    <div style={{ fontFamily:"'Inter',sans-serif" }}>

      <Navbar />

      <main style={{ paddingTop:"70px" }}>
        <AppRoutes />
      </main>

      <footer
        style={{
          background:"#1e1b4b",
          padding:"2rem",
          textAlign:"center",
          color:"#a78bfa",
          fontSize:"0.875rem",
        }}
      >
        © 2024 CertiVerify · AI Certificate Analyzer · Built by Team CertiVerify
      </footer>

    </div>
  );
}

export default App;