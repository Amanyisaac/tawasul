import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

function QuranPage() {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // حالات نافذة النقاط
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isSavingPoints, setIsSavingPoints] = useState(false);

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

  // 🌟 تسجيل النقاط سحابياً في Supabase عند إنهاء التلاوة
  const handleFinishReading = async () => {
    if (isSavingPoints) return;
    setIsSavingPoints(true);
    setSelectedSurah(null);

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

      // تحديث profiles
      if (userEmail) {
        await supabase
          .from("profiles")
          .update({ points: updatedPoints })
          .eq("email", userEmail);
      }

      // تحديث heroes في لوحة الشرف
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
      console.error("Error updating quran points:", err);
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

  if (loading)
    return (
      <div style={{ color: "white", textAlign: "center", paddingTop: "200px", fontSize: "24px" }}>
        جاري تحميل القرآن الكريم... ⏳
      </div>
    );

  return (
    <div
      className="container"
      style={{
        paddingTop: "120px",
        paddingRight: "20px",
        paddingLeft: "20px",
        position: "relative",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* زر العودة */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 20px", display: "flex", justifyContent: "flex-start" }}>
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
          ✕ العودة للرئيسية
        </button>
      </div>

      {/* 🌟 نافذة النقاط المنبثقة 🌟 */}
      <AnimatePresence>
        {showPointsModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
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
                direction: "rtl",
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
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة ومسجلة سحابياً لتلاوتك القرآن الكريم.. <br />
                مجموع نقاطك أصبح:{" "}
                <span style={{ color: "#00b894", fontSize: "24px", fontWeight: "bold" }}>
                  {totalPoints}
                </span>
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
                  width: "100%",
                }}
              >
                استمرار 👍
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.h1 className="title" style={{ textAlign: "center", color: "white", marginBottom: "10px" }}>
        القرآن الكريم 📖
      </motion.h1>
      <p style={{ textAlign: "center", color: "#a0a0b5", fontSize: "16px", marginBottom: "35px" }}>
        اقرأ آيات الذكر الحكيم واكسب الحسنات والنقاط في رصيدك
      </p>

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

      {/* 📖 نافذة قراءة السورة 📖 */}
      <AnimatePresence>
        {selectedSurah && (
          <div className="video-overlay" onClick={() => setSelectedSurah(null)}>
            <motion.div
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.9 }}
              className="video-modal"
              style={{
                maxWidth: "800px",
                width: "95%",
                padding: "30px 20px",
                direction: "rtl",
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedSurah(null)}>
                ✕
              </button>

              <h2
                style={{
                  color: "#00b894",
                  textAlign: "center",
                  marginBottom: "20px",
                  fontSize: "28px",
                  borderBottom: "2px solid rgba(0, 184, 148, 0.2)",
                  paddingBottom: "10px",
                }}
              >
                {selectedSurah.name}
              </h2>

              <div
                style={{
                  maxHeight: "55vh",
                  overflowY: "auto",
                  paddingRight: "15px",
                  marginBottom: "20px",
                  paddingBottom: "10px",
                }}
              >
                <p style={{ fontSize: "22px", lineHeight: "2.5", color: "white", textAlign: "justify" }}>
                  {selectedSurah.ayahs?.map((a: any) => (
                    <span key={a.numberInSurah}>
                      {a.text}{" "}
                      <span style={{ color: "#fdcb6e", fontSize: "16px", margin: "0 5px" }}>
                        ﴿{a.numberInSurah}﴾
                      </span>
                    </span>
                  ))}
                </p>
              </div>

              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSavingPoints}
                  onClick={handleFinishReading}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: isSavingPoints ? "#636e72" : "#0984e3",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: isSavingPoints ? "wait" : "pointer",
                    boxShadow: "0 8px 15px rgba(9, 132, 227, 0.3)",
                  }}
                >
                  {isSavingPoints ? "جاري تسجيل النقاط..." : "أتممت التلاوة واستلام الجائزة 🎁"}
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