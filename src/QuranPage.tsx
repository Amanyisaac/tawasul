import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function QuranPage() {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // حالات (States) نافذة النقاط
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  // جلب قائمة السور
  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("خطأ في جلب بيانات السور:", err);
        setLoading(false);
      });
  }, []);

  // جلب نص السورة
  const fetchSurahContent = (id: number) => {
    fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setSelectedSurah(data.data[0]);
        }
      })
      .catch((err) => console.error("خطأ في جلب نص السورة:", err));
  };

  // دالة التعامل مع إنهاء التلاوة
  const handleFinishReading = () => {
    // 1. نقفل نافذة السورة
    setSelectedSurah(null);

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

  if (loading) return <div style={{ color: "white", textAlign: "center", paddingTop: "200px", fontSize: "24px" }}>جاري تحميل القرآن الكريم... ⏳</div>;

  return (
    <div className="container" style={{ paddingTop: "100px", position: "relative" }}>
      
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
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة في ميزان حسناتك لتلاوتك القرآن الكريم.. <br/>
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

      <motion.h1 className="title">القرآن الكريم 📖</motion.h1>
      <div className="dashboard-grid">
        {surahs.map((surah) => (
          <motion.div 
            key={surah.number} 
            className="card" 
            whileHover={{ scale: 1.05 }}
            onClick={() => fetchSurahContent(surah.number)}
            style={{ cursor: "pointer", padding: "20px" }}
          >
            <div style={{ fontSize: "30px", marginBottom: "10px" }}>🕋</div>
            <h3>{surah.name}</h3>
          </motion.div>
        ))}
      </div>

      {/* 📖 نافذة قراءة السورة (Modal) 📖 */}
      <AnimatePresence>
        {selectedSurah && (
          <div className="video-overlay" onClick={() => setSelectedSurah(null)}>
            <motion.div 
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.9 }}
              className="video-modal" 
              style={{ maxWidth: "800px", padding: "30px", direction: "rtl", textAlign: "right", display: "flex", flexDirection: "column" }} 
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedSurah(null)}>✕</button>
              
              <h2 style={{ color: "#00b894", textAlign: "center", marginBottom: "20px", fontSize: "32px", borderBottom: "2px solid rgba(0, 184, 148, 0.2)", paddingBottom: "10px" }}>
                {selectedSurah.name}
              </h2>
              
              {/* حاوية السكرول للنص القرآني */}
              <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: "15px", marginBottom: "20px", paddingBottom: "10px" }}>
                <p style={{ fontSize: "24px", lineHeight: "2.5", color: "white", textAlign: "justify" }}>
                  {selectedSurah.ayahs?.map((a: any) => (
                    <span key={a.numberInSurah}>
                      {a.text} <span style={{ color: "#fdcb6e", fontSize: "18px", margin: "0 5px" }}>﴿{a.numberInSurah}﴾</span>
                    </span>
                  ))}
                </p>
              </div>

              {/* 🎁 زرار إنهاء القراءة لاستلام النقاط 🎁 */}
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinishReading}
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
                  أتممت التلاوة واستلام الجائزة 🎁
                </motion.button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuranPage;