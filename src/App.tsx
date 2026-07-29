import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const navigate = useNavigate();

  const cardData = [
    { icon: "📖", title: "My Quran", path: "/quran" },
    { icon: "🕊️", title: "Christian", path: "/christian" }, // 👈 تمت إضافة هذا الكارت هنا
    { icon: "🎮", title: "Games", path: "/games" },
    { icon: "📅", title: "Calendar", path: "/calendar" },
    { icon: "📚", title: "Stories", path: "/stories" },
    { icon: "🕌", title: "Prayer", path: "/prayer" },
    { icon: "💧", title: "Wudu", path: "/wudu" },
    { icon: "📿", title: "Azkar", path: "/azkar" },
  ];

  return (
    <div className="container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="hero-wrapper"
      >
        <img src="src\assets\hero.png" alt="Hero" className="hero-image" />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="title"
      >
        Hello Hero! 👋
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="subtitle"
      >
        Let's start our journey!
      </motion.p>

      <div className="dashboard-grid">
        {cardData.map((card, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            className="card"
            onClick={() => navigate(card.path)}
            style={{ cursor: "pointer" }}
          >
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default App;