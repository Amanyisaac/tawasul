import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";
import stories from "./storiesData.json";

function StoriesPage() {
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isSavingPoints, setIsSavingPoints] = useState(false);

  const handleFinishStory = async () => {
    if (isSavingPoints) return;
    setIsSavingPoints(true);
    setSelectedStory(null);

    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const localPoints = parseInt(localStorage.getItem("childPoints") || "0");
    let currentDbPoints = localPoints;

    try {
      if (userEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("email", userEmail)
          .single();

        if (profile && typeof profile.points === "number") {
          currentDbPoints = profile.points;
        }
      }

      const updatedPoints = currentDbPoints + 10;

      if (userEmail) {
        await supabase
          .from("profiles")
          .update({ points: updatedPoints })
          .eq("email", userEmail);
      }

      if (userName) {
        await supabase
          .from("heroes")
          .update({ points: updatedPoints })
          .eq("name", userName);
      }

      localStorage.setItem("childPoints", updatedPoints.toString());
      setTotalPoints(updatedPoints);
      setTimeout(() => {
        setShowPointsModal(true);
      }, 400);
    } catch (err) {
      console.error("Error updating story points:", err);
      const fallbackPoints = localPoints + 10;
      localStorage.setItem("childPoints", fallbackPoints.toString());
      setTotalPoints(fallbackPoints);
      setTimeout(() => {
        setShowPointsModal(true);
      }, 400);
    } finally {
      setIsSavingPoints(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "120px", paddingRight: "20px", paddingLeft: "20px", position: "relative", minHeight: "100vh", paddingBottom: "60px" }}>
      {/* زر العودة */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 15px", display: "flex", justifyContent: "flex-start" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 20px",
            backgroundColor: "#ff7675",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ✕ Back to Dashboard
        </button>
      </div>

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
                width: "90%",
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
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة مسجلة سحابياً لقراءتك القصة.. <br/>
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
                  boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)",
                  width: "100%"
                }}
              >
                استمرار 👍
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.h1 className="title" style={{ textAlign: "center", color: "white" }}>Inspiring Stories 📚</motion.h1>

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
              style={{ maxWidth: "600px", width: "90%", padding: "30px 20px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedStory(null)}>✕</button>
              <h2 style={{ color: "#00b894", marginBottom: "15px", textAlign: "center" }}>{selectedStory.title}</h2>
              
              <div style={{ maxHeight: "50vh", overflowY: "auto", paddingRight: "10px", marginBottom: "20px" }}>
                <p style={{ color: "#d1d1e0", fontSize: "18px", lineHeight: "1.8", textAlign: "justify" }}>
                  {selectedStory.content}
                </p>
              </div>

              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSavingPoints}
                  onClick={handleFinishStory}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: isSavingPoints ? "#636e72" : "#0984e3",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: isSavingPoints ? "wait" : "pointer",
                    boxShadow: "0 8px 15px rgba(9, 132, 227, 0.3)"
                  }}
                >
                  {isSavingPoints ? "Saving points..." : "أتممت القراءة واستلام الجائزة 🎁"}
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