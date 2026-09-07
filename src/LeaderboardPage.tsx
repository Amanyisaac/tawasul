import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>("ar");
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const currentLang = localStorage.getItem("tawasul_lang") || "ar";
    setLang(currentLang);

    async function fetchHeroesFromSupabase() {
      try {
        setLoading(true);

        // 1. جلب البيانات من جدول heroes في Supabase وترتيبها تنازلياً حسب النقاط
        const { data, error } = await supabase
          .from("heroes")
          .select("*")
          .order("points", { ascending: false });

        if (error) {
          console.error("Error fetching from Supabase:", error.message);
          useFallbackData(currentLang);
        } else if (data && data.length > 0) {
          // إضافة الميداليات حسب الترتيب
          const formattedHeroes = data.map((hero: any, index: number) => ({
            id: hero.id,
            name: hero.name,
            points: hero.points,
            badge: index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : "⭐"
          }));
          setHeroes(formattedHeroes);
        } else {
          // لو الجدول لسه فاضي نستخدم بيانات افتراضية مؤقتاً
          useFallbackData(currentLang);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        useFallbackData(currentLang);
      } finally {
        setLoading(false);
      }
    }

    // دالة احتياطية في حالة عدم وجود بيانات
    function useFallbackData(selectedLang: string) {
      const fallback = [
        { id: 1, name: selectedLang === "ar" ? "أحمد محمد" : "Ahmed Mohamed", points: 200, badge: "👑" },
        { id: 2, name: selectedLang === "ar" ? "مريم علي" : "Mariam Ali", points: 150, badge: "🥈" },
        { id: 3, name: selectedLang === "ar" ? "يوسف إبراهيم" : "Youssef Ibrahim", points: 95, badge: "🥉" }
      ];
      setHeroes(fallback);
    }

    fetchHeroesFromSupabase();
  }, []);

  return (
    <div className="container" style={{ paddingTop: "140px", direction: lang === "ar" ? "rtl" : "ltr", textAlign: lang === "ar" ? "right" : "left", minHeight: "100vh", paddingBottom: "80px", paddingRight: "20px", paddingLeft: "20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <h1 style={{ color: "#fdcb6e", textAlign: "center", marginBottom: "10px", fontSize: "32px" }}>
          {lang === "ar" ? "🏆 لوحة الشرف العامة وقصص النجاح 🌟" : "🏆 Public Honor Board & Success Stories 🌟"}
        </h1>
        <p style={{ color: "#a0a0b5", textAlign: "center", marginBottom: "30px", fontSize: "16px" }}>
          {lang === "ar" ? "تجميع لأكثر أبطال المنصة تفاعلاً وإنجازاً (بيانات حية ⚡)" : "All platform heroes ranked by activity and points (Live ⚡)"}
        </p>

        {loading ? (
          <p style={{ textAlign: "center", color: "#00b894", fontSize: "18px" }}>
            {lang === "ar" ? "جاري جلب الأبطال من قاعدة البيانات..." : "Loading heroes from database..."}
          </p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {heroes.map((hero, index) => (
              <motion.div 
                key={hero.id} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }}
                style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "20px", borderRadius: "16px", border: index === 0 ? "2px solid #fdcb6e" : "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "30px" }}>{hero.badge}</span>
                  <div>
                    <h3 style={{ color: "white", margin: "0 0 5px 0", fontSize: "18px" }}>{hero.name}</h3>
                    <span style={{ color: "#00b894", fontSize: "14px", fontWeight: "bold" }}>
                      {lang === "ar" ? `المركز #${index + 1}` : `Rank #${index + 1}`}
                    </span>
                  </div>
                </div>
                <div style={{ backgroundColor: "rgba(253, 203, 110, 0.2)", color: "#fdcb6e", padding: "8px 20px", borderRadius: "20px", fontWeight: "bold", fontSize: "16px" }}>
                  {hero.points} {lang === "ar" ? "نقطة" : "Pts"}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
            {lang === "ar" ? "العودة للرئيسية 🏠" : "Back to Dashboard 🏠"}
          </button>
        </div>

      </div>
    </div>
  );
}