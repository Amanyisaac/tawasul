import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>("ar");
  
  // حالة لحفظ نقاط الطفل الحقيقية
  const [totalPoints, setTotalPoints] = useState(0);
  
  // وضع الرقابة الليلية (Bedtime Mode)
  const [bedtimeMode, setBedtimeMode] = useState(localStorage.getItem("bedtimeMode") === "true");

  // حالات ربط حساب الدكتور
  const [inviteCode, setInviteCode] = useState("");
  const [isLinked, setIsLinked] = useState(false);
  const [linkedDoctor, setLinkedDoctor] = useState("");
  const [doctorReport, setDoctorReport] = useState("");
  const [doctorTasks, setDoctorTasks] = useState<{id: number, type: string, title: string}[]>([]);

  // استرجاع كود ولي الأمر
  const myParentCode = localStorage.getItem("myParentCode") || "غير متوفر";

  // التحقق من تسجيل الدخول وجلب بيانات الطفل عند تحميل الصفحة
  useEffect(() => {
    const currentLang = localStorage.getItem("tawasul_lang") || "ar";
    setLang(currentLang);

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      alert(currentLang === "ar" ? "برجاء تسجيل الدخول أو إنشاء حساب ولي أمر أولاً للوصول لوحة التحكم." : "Please login as a parent first.");
      navigate("/login");
    }

    // جلب نقاط الطفل من الذاكرة المحلية
    const savedPoints = localStorage.getItem("childPoints");
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints));
    }
    
    // التحقق لو كان الحساب مربوط قبل كدة
    const savedDoctor = localStorage.getItem("linkedDoctor");
    if (savedDoctor) {
      setIsLinked(true);
      setLinkedDoctor(savedDoctor);
      loadMockDoctorData(currentLang);
    }
  }, [navigate]);

  const loadMockDoctorData = (currentLang: string) => {
    if (currentLang === "ar") {
      setDoctorReport("الطفل يظهر تحسناً ممتازاً في مستويات التركيز والانتباه. يرجى الاستمرار على المهام المحددة في الروشتة يومياً ومكافأته عند الإنجاز لدعم ثقته بنفسه.");
      setDoctorTasks([
        { id: 1, type: "🎮 لعبة تركيز", title: "لعبة الذاكرة (مستوى متقدم)" },
        { id: 2, type: "📖 قصة سلوكية", title: "قصة الشجاع (للتغلب على الخوف)" },
        { id: 3, type: "🤲 ورد أذكار", title: "أذكار الصباح" }
      ]);
    } else {
      setDoctorReport("The child shows excellent improvement in focus and attention levels. Please continue prescribed tasks and reward achievements.");
      setDoctorTasks([
        { id: 1, type: "🎮 Focus Game", title: "Memory Game (Advanced)" },
        { id: 2, type: "📖 Behavioral Story", title: "The Brave Story (Overcoming Fear)" },
        { id: 3, type: "🤲 Daily Azkar", title: "Morning Azkar" }
      ]);
    }
  };

  const handleLinkDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim() === "DOC-2026-XYZ") {
      setIsLinked(true);
      const docName = localStorage.getItem("userName") || (lang === "ar" ? "أماني إسحاق" : "Amany Isaac");
      setLinkedDoctor(docName);
      localStorage.setItem("linkedDoctor", docName);
      loadMockDoctorData(lang);
    } else {
      alert(lang === "ar" ? "كود الربط غير صحيح، يرجى التأكد من الكود المكتوب." : "Incorrect link code.");
    }
  };

  const handleUnlink = () => {
    if(window.confirm(lang === "ar" ? "هل أنت متأكد من إلغاء ربط حساب طفلك بهذا الطبيب؟" : "Are you sure you want to unlink?")) {
      setIsLinked(false);
      setInviteCode("");
      localStorage.removeItem("linkedDoctor");
    }
  };

  const toggleBedtimeMode = () => {
    const newState = !bedtimeMode;
    setBedtimeMode(newState);
    localStorage.setItem("bedtimeMode", newState.toString());
  };

  const childStats = {
    name: lang === "ar" ? "البطل (أحمد)" : "Hero (Ahmed)",
    completedAzkar: 5,
    totalAzkar: 7,
    quranProgress: lang === "ar" ? "سورة الفاتحة وجزء عم" : "Surat Al-Fatihah & Juz Amma",
    prayedToday: 4,
    gamesPlayed: 3
  };

  return (
    <div className="container" style={{ paddingTop: "140px", direction: lang === "ar" ? "rtl" : "ltr", textAlign: lang === "ar" ? "right" : "left", minHeight: "100vh", paddingBottom: "80px", paddingRight: "20px", paddingLeft: "20px", position: "relative" }}>
      
      {/* 🌙 وضع الرقابة الليلية وحماية النوم */}
      {bedtimeMode && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0f1319", zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "white", textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🌙</div>
          <h1 style={{ color: "#fdcb6e", marginBottom: "10px" }}>{lang === "ar" ? "حان وقت النوم، نراكم غداً بذكاء ونشاط!" : "Bedtime! See you tomorrow with active energy!"}</h1>
          <p style={{ color: "#a0a0b5", fontSize: "16px", marginBottom: "25px" }}>{lang === "ar" ? "المنصة في وضع الحماية الليلية لأوقات نوم الأبطال." : "Platform is in bedtime mode to protect children's sleep schedule."}</p>
          <button onClick={toggleBedtimeMode} style={{ padding: "10px 25px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
            {lang === "ar" ? "إلغاء وضع النوم 🔓" : "Disable Bedtime Mode 🔓"}
          </button>
        </div>
      )}

      {/* شريط علوي للترحيب وأزرار التحكم الجديدة */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", maxWidth: "1000px", margin: "0 auto", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h1 style={{ fontSize: "32px", color: "white", marginBottom: "5px" }}>
            {lang === "ar" ? "لوحة تحكم ولي الأمر 👩‍👧‍👦" : "Parent Dashboard 👩‍👧‍👦"}
          </h1>
          <p style={{ color: "#a0a0b5", fontSize: "16px" }}>
            {lang === "ar" ? "متابعة نشاط وإنجازات طفلك اليومية" : "Track your child's daily activity and progress"}
          </p>
        </div>
        
        {/* الأزرار (الاستشارات، طباعة PDF، وضع النوم، العودة) */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button 
            onClick={() => navigate('/consultations')} 
            style={{ padding: "10px 15px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "💬 الاستشارات" : "💬 Consultations"}
          </button>
          
          <button 
            onClick={() => window.print()} 
            style={{ padding: "10px 15px", backgroundColor: "#e84393", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "📥 تحميل PDF" : "📥 Export PDF"}
          </button>

          <button 
            onClick={toggleBedtimeMode} 
            style={{ padding: "10px 15px", backgroundColor: bedtimeMode ? "#00b894" : "#fdcb6e", color: bedtimeMode ? "white" : "#2d3436", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "🌙 وضع النوم" : "🌙 Bedtime Mode"}
          </button>

          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ padding: "10px 15px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "الرئيسية ↗" : "Home ↗"}
          </button>
        </div>
      </div>

      {/* كود ربط العائلة */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(253, 203, 110, 0.15)", border: "2px dashed #fdcb6e", padding: "20px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h3 style={{ color: "#fdcb6e", margin: "0 0 5px 0", fontSize: "18px" }}>
            {lang === "ar" ? "👨‍👩‍👧 كود ربط العائلة الخاص بك" : "👨‍👩‍👧 Your Family Link Code"}
          </h3>
          <p style={{ color: "#a0a0b5", fontSize: "14px", margin: 0 }}>
            {lang === "ar" ? "أعطي هذا الكود لطفلك ليتمكن من إنشاء حسابه وربطه بك." : "Give this code to your child to link accounts."}
          </p>
        </div>
        <span style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "10px 20px", borderRadius: "10px", color: "white", fontWeight: "bold", fontSize: "20px", letterSpacing: "2px", border: "1px solid rgba(255,255,255,0.1)" }}>
          {myParentCode}
        </span>
      </div>

      {/* المتابعة السريرية وتوجيهات الطبيب */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "#00b894", marginBottom: "20px", fontSize: "22px" }}>
          👨‍⚕️ {lang === "ar" ? "المتابعة السريرية وتوجيهات الطبيب" : "Clinical Follow-up & Doctor's Guidance"}
        </h2>
        
        <AnimatePresence mode="wait">
          {!isLinked ? (
            <motion.form 
              key="link-form"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              onSubmit={handleLinkDoctor} 
              style={{ display: "flex", gap: "10px", flexWrap: "wrap", backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px" }}
            >
              <div style={{ flex: "1 1 250px" }}>
                <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>
                  {lang === "ar" ? "هل تتابع مع أخصائي؟ أدخل كود الربط هنا:" : "Following a specialist? Enter link code here:"}
                </label>
                <input 
                  type="text" 
                  placeholder="مثال: DOC-2026-XYZ"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", fontSize: "16px", boxSizing: "border-box" }}
                  required
                />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="submit" style={{ padding: "12px 25px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", height: "45px" }}>
                  {lang === "ar" ? "ربط الحساب 🔗" : "Link Account 🔗"}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="linked-data"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <div style={{ backgroundColor: "rgba(0, 184, 148, 0.1)", border: "1px solid #00b894", padding: "15px", borderRadius: "15px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ color: "white", fontSize: "16px" }}>
                  {lang === "ar" ? "✅ تم ربط الحساب بعيادة: " : "✅ Linked to clinic: "}
                  <strong style={{ color: "#00b894", fontSize: "18px" }}>{linkedDoctor}</strong>
                </span>
                <button onClick={handleUnlink} style={{ padding: "8px 15px", backgroundColor: "rgba(255, 118, 117, 0.2)", color: "#ff7675", border: "1px solid #ff7675", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                  {lang === "ar" ? "إلغاء الربط ✕" : "Unlink ✕"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h4 style={{ color: "#fdcb6e", marginBottom: "15px", fontSize: "18px" }}>📊 {lang === "ar" ? "التقرير السلوكي الأخير" : "Latest Behavioral Report"}</h4>
                  <p style={{ color: "#d2dae2", lineHeight: "1.8", fontSize: "15px", margin: 0 }}>{doctorReport}</p>
                </div>
                
                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h4 style={{ color: "#e84393", marginBottom: "15px", fontSize: "18px" }}>💊 {lang === "ar" ? "روشتة المهام المطلوبة" : "Required Task Prescription"}</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {doctorTasks.map(task => (
                      <li key={task.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px 15px", borderRadius: "10px", marginBottom: "10px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>{task.type}</span>
                        <span>|</span>
                        <span style={{ fontWeight: "bold" }}>{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ملخص نشاط الطفل */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "#0984e3", marginBottom: "15px", fontSize: "22px" }}>
          {lang === "ar" ? `📊 نشاط اليوم لـ: ${childStats.name}` : `📊 Today's Activity for: ${childStats.name}`}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
          
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center", border: "1px solid #e84393" }}>
            <span style={{ fontSize: "28px" }}>🏅</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>{lang === "ar" ? "النقاط المكتسبة" : "Earned Points"}</h4>
            <p style={{ color: "#e84393", fontSize: "24px", fontWeight: "bold" }}>{totalPoints}</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>📿</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>{lang === "ar" ? "الأذكار المنجزة" : "Completed Azkar"}</h4>
            <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>{childStats.completedAzkar} / {childStats.totalAzkar}</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>🕌</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>{lang === "ar" ? "الصلوات اليومية" : "Daily Prayers"}</h4>
            <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>{childStats.prayedToday} / 5</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>🎮</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>{lang === "ar" ? "الألعاب التعليمية" : "Games Played"}</h4>
            <p style={{ color: "#0984e3", fontSize: "20px", fontWeight: "bold" }}>{childStats.gamesPlayed}</p>
          </div>

        </div>
      </div>

    </div>
  );
}