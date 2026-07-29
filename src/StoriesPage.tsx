import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import stories from './storiesData.json';

function StoriesPage() {
  const [selectedStory, setSelectedStory] = useState<any>(null);
  
  // حالات (States) نافذة النقاط
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  // دالة التعامل مع إنهاء قراءة القصة
  const handleFinishStory = () => {
    // 1. نقفل نافذة القصة
    setSelectedStory(null);

    // 2. نجيب النقاط القديمة ونزود 10
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    
    // 3. نحفظ النقاط الجديدة
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);

    // 4. نظهر نافذة النقاط بعد تأخير بسيط عشان الأنيميشن
    setTimeout(() => {
      setShowPointsModal(true);
    }, 500);
  };

  return (
    <div className="container" style={{ paddingTop: "120px", position: "relative" }}>
      
      {/* 🌟 نافذة النقاط المنبثقة (Modal) 🌟 */}
      <AnimatePresence>
        {showPointsModal && (
          <div style={{ 
            position: "fixed", 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(0, 0, 0, 0.8)", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            zIndex: 1000 
          }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              style={{ 
                backgroundColor: "#1e272e", 
                padding: "40px", 
                borderRadius: "24px", 
                border: "2px solid #00b894", 
                textAlign: "center", 
                maxWidth: "400px",
                boxShadow: "0 20px 50px rgba(0, 184, 148, 0.3)",
                direction: "rtl"
              }}
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: "60px", marginBottom: "15px" }}
              >
                🏅
              </motion.div>
              <h2 style={{ color: "white", marginBottom: "15px", fontSize: "28px" }}>عاش يا بطل! 🦸‍♂️</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة لقراءتك القصة.. <br/>
                مجموع نقاطك أصبح: <span style={{ color: "#00b894", fontSize: "24px", fontWeight: "bold" }}>{totalPoints}</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPointsModal(false)}
                style={{ 
                  padding: "12px 35px", 
                  backgroundColor: "#00b894", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "15px", 
                  fontSize: "18px", 
                  cursor: "pointer", 
                  fontWeight: "bold",
                  boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)"
                }}
              >
                استمرار 👍
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.h1 className="title">Inspiring Stories 📚</motion.h1>

      <div className="dashboard-grid" style={{ marginTop: "40px" }}>
        {stories.map((story, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.05 }}
            className="card"
            style={{ height: "auto", padding: "20px", cursor: "pointer" }}
            onClick={() => setSelectedStory(story)}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📖</div>
            <h3 style={{ fontSize: "18px" }}>{story.title}</h3>
            <p style={{ color: "#a0a0b5", fontSize: "14px", marginTop: "10px" }}>{story.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* 📖 نافذة القصة (Modal) 📖 */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="video-overlay" 
            onClick={() => setSelectedStory(null)}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.9 }}
              className="video-modal"
              style={{ maxWidth: "600px", padding: "30px", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedStory(null)}>✕</button>
              <h2 style={{ color: "#00b894", marginBottom: "15px" }}>{selectedStory.title}</h2>
              
              {/* حاوية السكرول عشان لو القصة طويلة الزرار يفضل باين تحت */}
              <div style={{ maxHeight: "50vh", overflowY: "auto", paddingRight: "10px", marginBottom: "20px" }}>
                <p style={{ color: "#d1d1e0", fontSize: "18px", lineHeight: "1.8", textAlign: "justify" }}>
                  {selectedStory.content}
                </p>
              </div>

              {/* 🎁 زرار إنهاء القراءة لاستلام النقاط 🎁 */}
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinishStory}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: "#0984e3",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 8px 15px rgba(9, 132, 227, 0.3)"
                  }}
                >
                  أتممت القراءة واستلام الجائزة 🎁
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StoriesPage;