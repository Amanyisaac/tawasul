import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>("ar");
  const [heroName, setHeroName] = useState<string>("");
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    // 1. تحديد اللغة
    const currentLang = localStorage.getItem("tawasul_lang") || "ar";
    setLang(currentLang);

    // 2. الاسم المبدئي من الجلسة
    const savedName = localStorage.getItem("userName") || (currentLang === "ar" ? "يا بطل" : "Hero");
    const savedEmail = localStorage.getItem("userEmail");
    setHeroName(savedName);

    // 3. جلب نقاط الطفل المباشرة من Supabase للتحديث اللحظي
    async function fetchHeroLiveStats() {
      if (!savedEmail) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, points")
          .eq("email", savedEmail)
          .single();

        if (data && !error) {
          if (data.name) setHeroName(data.name);
          setPoints(data.points || 0);
          localStorage.setItem("childPoints", String(data.points || 0));
        }
      } catch (err) {
        console.error("Error fetching live child stats:", err);
      }
    }

    fetchHeroLiveStats();
  }, []);

  const cardData = [
    { icon: "📖", title: lang === "ar" ? "قرآني" : "My Quran", path: "/quran" },
    { icon: "🕊️", title: lang === "ar" ? "مسيحي" : "Christian", path: "/christian" },
    { icon: "🎮", title: lang === "ar" ? "ألعاب تفاعلية" : "Games", path: "/games" },
    { icon: "📅", title: lang === "ar" ? "الجدول اليومي" : "Calendar", path: "/calendar" },
    { icon: "📚", title: lang === "ar" ? "قصص مصورة" : "Stories", path: "/stories" },
    { icon: "🕌", title: lang === "ar" ? "صلاتي" : "Prayer", path: "/prayer" },
    { icon: "💧", title: lang === "ar" ? "وضوئي" : "Wudu", path: "/wudu" },
    { icon: "📿", title: lang === "ar" ? "أذكاري" : "Azkar", path: "/azkar" },
  ];

  return (
    <div
      className="container"
      style={{
        paddingTop: "140px",
        textAlign: "center",
        minHeight: "100vh",
        paddingBottom: "80px",
        direction: lang === "ar" ? "rtl" : "ltr",
      }}
    >
      {/* 🌟 هيدر الترحيب بالبطل مع رصيد النقاط الحي */}
      <div style={{ maxWidth: "800px", margin: "0 auto 30px", padding: "0 15px" }}>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="title"
          style={{ fontSize: "34px", color: "white", marginBottom: "10px" }}
        >
          {lang === "ar" ? `أهلاً بك يا ${heroName}! 👋` : `Hello, ${heroName}! 👋`}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtitle"
          style={{ color: "#a0a0b5", fontSize: "16px", marginBottom: "25px" }}
        >
          {lang === "ar" ? "جاهز لرحلة جديدة من التحديات والمرح؟ 🚀" : "Ready for a new adventure of fun and learning? 🚀"}
        </motion.p>

        {/* كارت عرض النقاط والوصول السريع للوحة الشرف */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "20px",
            backgroundColor: "rgba(30, 39, 46, 0.9)",
            border: "2px solid #fdcb6e",
            borderRadius: "20px",
            padding: "12px 25px",
            boxShadow: "0 10px 25px rgba(253, 203, 110, 0.15)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>⭐</span>
            <span style={{ color: "#fdcb6e", fontWeight: "bold", fontSize: "18px" }}>
              {points} {lang === "ar" ? "نقطة إنجاز" : "Pts"}
            </span>
          </div>

          <div style={{ width: "1px", height: "25px", backgroundColor: "rgba(255,255,255,0.2)" }} />

          <button
            onClick={() => navigate("/leaderboard")}
            style={{
              backgroundColor: "transparent",
              color: "#00b894",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🏆 {lang === "ar" ? "لوحة الشرف" : "Leaderboard"}
          </button>
        </motion.div>
      </div>

      {/* شبكة الأنشطة والبطاقات */}
      <div className="dashboard-grid">
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            whileHover={{ scale: 1.05, translateY: -5 }}
            whileTap={{ scale: 0.96 }}
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