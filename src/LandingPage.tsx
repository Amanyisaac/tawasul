import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar"; // استيراد الـ Navbar الجديد
import "./App.css";

function LandingPage() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

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
      {/* وضع الـ Navbar هنا */}
      <Navbar />
      
      {/* القسم الأول: أضفنا id="home" */}
      <section id="home" className="hero-section">
        <div className="landing-container">
          <motion.h1 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="title"
            style={{ fontSize: '55px' }}
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
              onClick={() => navigate("/login")} 
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

      {/* القسم الثاني: أضفنا id="vision" */}
      <section id="vision" className="story-section">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="story-card"
        >
          <h2 className="section-title">Our Vision</h2>
          <p className="story-text">
            Tawasul was born from a simple yet powerful idea: creating a seamless digital ecosystem where children, parents, and specialists connect. We provide a safe environment filled with interactive games and activities, while offering parents a smart dashboard to track progress. Through our dedicated specialist portal, we ensure every child receives the professional guidance they need to thrive.
          </p>
        </motion.div>
      </section>

      {/* القسم الثالث: أضفنا id="features" */}
      <section id="features" className="features-section">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-title"
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
              transition={{ delay: index * 0.2 }}
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