import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar"; 
import "./App.css";

function LandingPage() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");

    if (isLoggedIn === "true") {
      if (role === "doctor") navigate("/doctor-dashboard");
      else if (role === "parent") navigate("/parent-dashboard");
      else navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const features = [
    { icon: "🎮", title: "Interactive Games", desc: "A rich collection of at least six interactive games and activities designed for fun learning." },
    { icon: "🕌", title: "Prayer & Wudu", desc: "Step-by-step interactive guides to teach children the correct ways of Wudu (Ablution) and daily Prayers." },
    { icon: "📖", title: "My Quran", desc: "A dedicated module for Quranic studies to help children read, memorize, and understand with ease." },
    { icon: "📚", title: "Inspiring Stories", desc: "A curated library of educational and moral stories to build character and safely entertain children." },
    { icon: "📅", title: "Tracking Calendar", desc: "A smart progress-tracking calendar to organize daily activities and keep the learning journey on schedule." },
    { icon: "📊", title: "Parental Dashboard", desc: "A comprehensive control panel allowing parents to monitor progress and receive detailed monthly reports." },
    { icon: "👩‍⚕️", title: "Specialist Portal", desc: "A secure communication section connecting families with specialists for expert guidance and support." },
    { icon: "💻", title: "Cross-Platform", desc: "A seamless experience available as both a responsive website and a mobile application." }
  ];

  return (
    <div className="landing-page-wrapper">
      <Navbar />
      
      <section id="home" className="hero-section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", paddingBottom: "40px" }}>
        <div className="landing-container">
          <motion.h1 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="title"
          >
            Welcome to Tawasul
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="description"
          >
            Tawasul is your smart companion designed to support children's learning
            journey through interactive Quranic studies, fun games, and daily
            progress tracking.
          </motion.p>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="button-wrapper"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="login-button" 
              onClick={handleGetStarted} 
            >
              Get Started
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="video-button" 
              onClick={() => setShowVideo(true)}
            >
              Watch Video 🎥
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* قسم Our Vision */}
      <section id="vision" style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 20px" }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            backgroundColor: "rgba(30, 39, 46, 0.85)",
            border: "1px solid rgba(0, 184, 148, 0.3)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            textAlign: "left"
          }}
        >
          <h2 style={{ color: "#00b894", fontSize: "28px", marginBottom: "20px", fontWeight: "bold" }}>Our Vision</h2>
          <p style={{ color: "#d2dae2", fontSize: "16px", lineHeight: "1.8", margin: 0 }}>
            Tawasul was born from a simple yet powerful idea: creating a seamless digital ecosystem where children, parents, and specialists connect. We provide a safe environment filled with interactive games and activities, while offering parents a smart dashboard to track progress. Through our dedicated specialist portal, we ensure every child receives the professional guidance they need to thrive.
          </p>
        </motion.div>
      </section>

      {/* قسم المميزات */}
      <section id="features" className="features-section" style={{ marginTop: "60px", paddingBottom: "80px" }}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-title"
          style={{ marginBottom: "40px", textAlign: "center" }}
        >
          Key Features
        </motion.h2>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="feature-card"
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {showVideo && (
        <div className="video-overlay" onClick={() => setShowVideo(false)}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="video-modal" 
            onClick={(e) => e.stopPropagation()} 
          >
            <button className="close-btn" onClick={() => setShowVideo(false)}>✕</button>
            <div className="video-placeholder">
              <h3>سيتم إضافة الفيديو التعريفي هنا 🎥</h3>
            </div>
          </motion.div>
        </div>
      )}
      
    </div>
  );
}

export default LandingPage;