import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: "140px", paddingBottom: "80px", minHeight: "100vh", direction: "ltr", textAlign: "left", color: "white" }}>
      
      {/* Back Button */}
      <div style={{ maxWidth: "900px", margin: "0 auto 20px" }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: "10px 20px", backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px", transition: "0.3s" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
        >
          <span>←</span> Back
        </button>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>
        
        {/* ==========================================
            1. The Story of Tawasul
            ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "40px", borderRadius: "24px", border: "2px solid #0984e3", boxShadow: "0 15px 40px rgba(9, 132, 227, 0.2)" }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 style={{ color: "#0984e3", margin: "0 0 10px 0", fontSize: "36px" }}>The Story of "Tawasul"</h1>
            <p style={{ color: "#a0a0b5", fontSize: "18px", margin: 0 }}>A bridge connecting family, children, and specialists.</p>
          </div>
          
          <p style={{ fontSize: "18px", lineHeight: "1.8", color: "#d2dae2", textAlign: "justify" }}>
            The idea of <strong>"Tawasul"</strong> stems from a deep belief that a child's behavioral and educational development is incomplete without an effective link between three core pillars: the child, the family, and the specialist or doctor. Many parents face difficulties tracking their children's behavioral tasks accurately, and children often get bored with traditional methods.
            <br /><br />
            Therefore, this platform was built to provide a <strong>safe, interactive, and gamified</strong> environment that motivates children through games, points, and rewards, while offering parents and doctors advanced clinical tracking tools, appointment scheduling, secure report sharing, and specialized community support.
          </p>
        </motion.div>

        {/* ==========================================
            2. Meet the Developer
            ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "40px", borderRadius: "24px", border: "2px solid #00b894", boxShadow: "0 15px 40px rgba(0, 184, 148, 0.2)" }}
        >
          <div style={{ marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px" }}>
            <h3 style={{ color: "#fdcb6e", margin: "0 0 8px 0", fontSize: "28px" }}>
              Behind the Scenes
            </h3>
            <p style={{ color: "#00b894", margin: 0, fontSize: "16px", fontWeight: "bold" }}>
              Amany Isaac — SW Engineer & Creator of Tawasul
            </p>
          </div>

          <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#d2dae2", textAlign: "justify", margin: 0 }}>
            I designed and developed the "Tawasul" interfaces entirely, relying on modern front-end technologies like <strong>React</strong> and <strong>TypeScript</strong> to ensure a seamless, fast, and intuitive user experience (UX).
            <br /><br />
            As a software engineer and developer, my goal was to transform a complex medical and educational concept into a visually appealing, user-friendly, and delightful platform for children. This project represents the culmination of my passion for blending aesthetic UI design with robust code logic to deliver a product that creates a meaningful and positive impact.
          </p>
        </motion.div>

      </div>
    </div>
  );
}