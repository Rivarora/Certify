import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#fff", minHeight: "100vh" }}>

      {/* HERO */}
      <div style={{
        minHeight: "calc(100vh - 68px)",
        background: "linear-gradient(135deg, #f8f7ff 0%, #ede9ff 30%, #fdf4ff 55%, #fff8f0 80%, #fff 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}>

        {/* Wave */}
        <svg style={{ position:"absolute", bottom:0, width:"100%" }}
          viewBox="0 0 1440 200">
          <path d="M0,100 C200,160 400,20 600,100 C800,180 1000,40 1200,100 C1300,130 1380,90 1440,100 L1440,200 L0,200 Z"
            fill="rgba(108,99,255,0.06)"/>
        </svg>

        {/* Glow top-right orange */}
        <div style={{
          position:"absolute", top:"-100px", right:"200px",
          width:"500px", height:"500px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(251,146,60,0.18), transparent 70%)",
        }}/>

        {/* Glow purple */}
        <div style={{
          position:"absolute", top:"0px", right:"100px",
          width:"600px", height:"600px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)",
        }}/>

        <div style={{
          maxWidth:"1200px",
          margin:"0 auto",
          padding:"4rem 2rem",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          gap:"2rem",
          width:"100%",
          position:"relative",
          zIndex:1,
        }}>

          {/* LEFT */}
          <div style={{ maxWidth:"380px" }}>
            <div style={{
              display:"inline-flex",
              background:"rgba(108,99,255,0.08)",
              border:"1px solid rgba(108,99,255,0.2)",
              borderRadius:"999px",
              padding:"0.4rem 1rem",
              fontSize:"0.75rem",
              fontWeight:"700",
              color:"#6c63ff",
              marginBottom:"1.75rem",
            }}>
              ✦ AI POWERED VERIFICATION
            </div>

            <h1 style={{
              fontSize:"3rem",
              fontWeight:"900",
              color:"#1a1a2e",
              marginBottom:"1.25rem",
              lineHeight:"1.1",
            }}>
              Verify. Analyze.<br/>
              <span style={{ color:"#6c63ff" }}>Trust.</span>
            </h1>

            <p style={{
              color:"#6b7280",
              marginBottom:"2.25rem",
              lineHeight:"1.7",
              fontSize:"1rem",
            }}>
              AI-powered certificate verification and risk detection in seconds.
            </p>

            <button
              onClick={() => navigate("/upload")}
              style={{
                background:"linear-gradient(135deg, #6c63ff, #a855f7)",
                color:"white",
                padding:"0.9rem 2rem",
                borderRadius:"999px",
                border:"none",
                cursor:"pointer",
                fontWeight:"700",
                fontSize:"1rem",
                boxShadow:"0 8px 28px rgba(108,99,255,0.45)",
                display:"inline-flex",
                alignItems:"center",
                gap:"0.5rem",
              }}
              onMouseOver={e => e.currentTarget.style.transform="translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
            >
              Get Started →
            </button>
          </div>

          {/* CENTER IMAGE */}
          <div style={{
            flex: "1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            minHeight: "420px",
          }}>

            {/* Soft purple glow behind image */}
            <div style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)",
              filter: "blur(40px)",
            }}/>

            {/* IMAGE — borderless blend */}
            <img
              src="/Certify.png"
              alt="Certificate Illustration"
              style={{
                width: "100%",
                maxWidth: "520px",
                objectFit: "contain",
                mixBlendMode: "multiply",
                opacity: 1,
                filter: "drop-shadow(0 30px 60px rgba(108,99,255,0.25)) contrast(1.02)",
                position: "relative",
                background: "transparent",
                WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)",
                maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)",
              }}
            />
          </div>

        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding:"5rem 2rem", background:"#fafafa" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
          <p style={{ textAlign:"center", color:"#6c63ff", fontWeight:"700", fontSize:"0.8rem", letterSpacing:"0.12em", marginBottom:"0.5rem" }}>
            WHAT WE DETECT
          </p>
          <h2 style={{ textAlign:"center", fontSize:"2rem", fontWeight:"900", color:"#1a1a2e", marginBottom:"3rem" }}>
            Powerful AI Detection Engine
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px,1fr))", gap:"1.5rem" }}>
            {[
              { icon:"📧", title:"Email Detection",  desc:"Flags free providers like Gmail, Yahoo, Hotmail",  bg:"#f0eeff", accent:"#6c63ff" },
              { icon:"🌐", title:"Domain Analysis",  desc:"Detects fake or suspicious company domains",       bg:"#fff0f9", accent:"#ec4899" },
              { icon:"📅", title:"Duration Check",   desc:"Catches impossible internship duration claims",    bg:"#f0fff4", accent:"#10b981" },
              { icon:"📊", title:"Risk Scoring",     desc:"Low / Medium / High report with detailed reasons", bg:"#fffbeb", accent:"#f59e0b" },
            ].map(({ icon, title, desc, bg, accent }) => (
              <div key={title} style={{
                background: bg,
                borderRadius: "20px",
                padding: "2rem",
                border: `1px solid ${accent}22`,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
                onMouseOver={e => { e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow=`0 16px 40px ${accent}22`; }}
                onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
              >
                <div style={{
                  width:"52px", height:"52px", borderRadius:"14px",
                  background: accent,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.5rem", marginBottom:"1.25rem",
                  boxShadow:`0 6px 16px ${accent}44`,
                }}>{icon}</div>
                <h3 style={{ fontWeight:"800", color:"#1a1a2e", fontSize:"1.05rem", marginBottom:"0.5rem" }}>{title}</h3>
                <p style={{ color:"#6b7280", fontSize:"0.88rem", lineHeight:"1.65" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background:"linear-gradient(135deg, #6c63ff, #a855f7)",
        padding:"5rem 2rem",
        textAlign:"center",
      }}>
        <h2 style={{ color:"white", fontSize:"2.2rem", fontWeight:"900", marginBottom:"1rem" }}>
          Ready to Verify Your Certificate?
        </h2>
        <p style={{ color:"rgba(255,255,255,0.75)", marginBottom:"2rem", fontSize:"1.05rem" }}>
          Free, fast, and accurate — results in under 3 seconds.
        </p>
      </div>

    </div>
  );
}