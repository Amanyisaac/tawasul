import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function ParentDashboard() {
  const navigate = useNavigate();
  
  // حالة لحفظ نقاط الطفل الحقيقية
  const [totalPoints, setTotalPoints] = useState(0);
  
  // التحقق من تسجيل الدخول وجلب بيانات الطفل عند تحميل الصفحة
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      alert("برجاء تسجيل الدخول أو إنشاء حساب ولي أمر أولاً للوصول لوحة التحكم.");
      navigate("/login");
    }

    // جلب نقاط الطفل من الذاكرة المحلية
    const savedPoints = localStorage.getItem("childPoints");
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints));
    }
  }, [navigate]);

  const [childStats] = useState({
    name: "البطل (أحمد)",
    completedAzkar: 5,
    totalAzkar: 7,
    quranProgress: "سورة الفاتحة وجزء عم",
    prayedToday: 4,
    gamesPlayed: 3
  });

  return (
    <div className="container" style={{ paddingTop: "140px", direction: "rtl", textAlign: "right", minHeight: "100vh", paddingBottom: "80px", paddingRight: "40px", paddingLeft: "40px" }}>
      
      {/* شريط علوي للترحيب وزر العودة */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", maxWidth: "1000px", margin: "0 auto 30px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "white", marginBottom: "5px" }}>لوحة تحكم ولي الأمر 👩‍👧‍👦</h1>
          <p style={{ color: "#a0a0b5", fontSize: "16px" }}>متابعة نشاط وإنجازات طفلك اليومية</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#0984e3", 
            color: "white", 
            border: "none", 
            borderRadius: "12px", 
            cursor: "pointer", 
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
          }}
        >
          العودة لوضع الطفل ↗
        </button>
      </div>

      {/* كارد ملخص معلومات الطفل */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "#fdcb6e", marginBottom: "15px", fontSize: "22px" }}>📊 تقرير اليوم لـ: {childStats.name}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
          
          {/* كارت النقاط المكتسبة (جديد ديناميكي) */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center", border: "1px solid #e84393" }}>
            <span style={{ fontSize: "28px" }}>🏅</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>النقاط المكتسبة</h4>
            <p style={{ color: "#e84393", fontSize: "24px", fontWeight: "bold" }}>{totalPoints}</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>📿</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>الأذكار المنجزة</h4>
            <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>{childStats.completedAzkar} / {childStats.totalAzkar}</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>🕌</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>الصلوات اليومية</h4>
            <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>{childStats.prayedToday} / 5</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>🎮</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>الألعاب التعليمية</h4>
            <p style={{ color: "#0984e3", fontSize: "20px", fontWeight: "bold" }}>{childStats.gamesPlayed} ألعاب</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>📖</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>ورد القرآن</h4>
            <p style={{ color: "#fdcb6e", fontSize: "16px", fontWeight: "bold" }}>{childStats.quranProgress}</p>
          </div>

        </div>
      </div>

      {/* قسم الملاحظات أو الإعدادات */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h3 style={{ color: "white", marginBottom: "15px" }}>💡 نصيحة تربوية لليوم</h3>
        <p style={{ color: "#a0a0b5", lineHeight: "1.6" }}>
          "الاستمرارية في قراءة الأذكار القصيرة يومياً تُرسخ في قلب الطفل حب الإتصال بالله عز وجل منذ الصباح. شجعي طفلك دائماً بكلمات إيجابية عند إتمام أهدافه!"
        </p>
      </div>

    </div>
  );
}