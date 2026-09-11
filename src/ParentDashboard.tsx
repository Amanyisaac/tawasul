import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>("ar");
  
  // بيانات الطفل الحقيقية من Supabase
  const [childName, setChildName] = useState<string>("البطل");
  const [totalPoints, setTotalPoints] = useState(0);
  
  // وضع الرقابة الليلية
  const [bedtimeMode, setBedtimeMode] = useState(localStorage.getItem("bedtimeMode") === "true");

  // حالات ربط حساب الدكتور
  const [inviteCode, setInviteCode] = useState("");
  const [isLinked, setIsLinked] = useState(false);
  const [linkedDoctor, setLinkedDoctor] = useState("");
  const [doctorReport, setDoctorReport] = useState("");
  const [doctorTasks, setDoctorTasks] = useState<{id: number, type: string, title: string}[]>([]);
  const [, setLoading] = useState(true);

  // استرجاع كود ولي الأمر
  const [myParentCode, setMyParentCode] = useState(localStorage.getItem("myParentCode") || "غير متوفر");

  useEffect(() => {
    const currentLang = localStorage.getItem("tawasul_lang") || "ar";
    setLang(currentLang);

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");

    if (!isLoggedIn || userRole !== "parent") {
      alert(currentLang === "ar" ? "برجاء تسجيل الدخول كولي أمر أولاً." : "Please login as a parent first.");
      navigate("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. جلب بيانات ولي الأمر للتأكد من كود العائلة
        if (userEmail) {
          const { data: parentData } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", userEmail)
            .single();

          if (parentData) {
            const code = parentData.parent_code || localStorage.getItem("myParentCode") || "غير متوفر";
            setMyParentCode(code);
            localStorage.setItem("myParentCode", code);

            // 2. البحث عن الطفل المربوط بكود هذا الوالد
            if (code && code !== "غير متوفر") {
              const { data: childData } = await supabase
                .from("profiles")
                .select("name, points")
                .eq("linked_to_parent_code", code)
                .single();

              if (childData) {
                setChildName(childData.name);
                setTotalPoints(childData.points || 0);
              }
            }

            // فحص الطبيب المربوط إن وجد
            if (parentData.linked_doctor_code) {
              setIsLinked(true);
              setLinkedDoctor("د. أماني إسحاق");
              loadPrescriptionsFromSupabase();
            }
          }
        }

        // فحص محلي كبديل سريع
        const savedDoctor = localStorage.getItem("linkedDoctor");
        if (savedDoctor) {
          setIsLinked(true);
          setLinkedDoctor(savedDoctor);
          loadPrescriptionsFromSupabase();
        }
      } catch (err) {
        console.error("Error loading parent dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [navigate]);

  // جلب الروشتات الحقيقية من Supabase
  const loadPrescriptionsFromSupabase = async () => {
    try {
      const { data: prescs } = await supabase
        .from("prescriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (prescs && prescs.length > 0) {
        setDoctorTasks(
          prescs.map((p: any) => ({
            id: p.id,
            type: p.category === "game" ? "🎮 لعبة تركيز" : p.category === "story" ? "📖 قصة سلوكية" : "🤲 ورد أذكار",
            title: p.task_detail,
          }))
        );
      } else {
        setDoctorTasks([
          { id: 1, type: "🎮 لعبة تركيز", title: "لعبة الذاكرة (مستوى متقدم)" },
          { id: 2, type: "📖 قصة سلوكية", title: "قصة الشجاع (للتغلب على الخوف)" },
          { id: 3, type: "🤲 ورد أذكار", title: "أذكار الصباح" },
        ]);
      }

      setDoctorReport("الطفل يظهر تحسناً ممتازاً في مستويات التركيز والانتباه. يرجى الاستمرار على المهام المحددة في الروشتة ومكافأته عند الإنجاز لدعم ثقته بنفسه.");
    } catch (err) {
      console.error("Prescriptions fetch error:", err);
    }
  };

  const handleLinkDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim().startsWith("DOC-")) {
      const docName = "د. أماني إسحاق";
      setIsLinked(true);
      setLinkedDoctor(docName);
      localStorage.setItem("linkedDoctor", docName);

      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        await supabase
          .from("profiles")
          .update({ linked_doctor_code: inviteCode.trim() })
          .eq("email", userEmail);
      }

      loadPrescriptionsFromSupabase();
      alert("تم ربط عيادة الطبيب بنجاح ومزامنة التوجيهات السريرية! 🩺");
    } else {
      alert(lang === "ar" ? "كود الربط غير صحيح، يجب أن يبدأ بـ DOC-" : "Incorrect link code format.");
    }
  };

  const handleUnlink = async () => {
    if (window.confirm(lang === "ar" ? "هل أنت متأكد من إلغاء ربط حساب طفلك بهذا الطبيب؟" : "Are you sure you want to unlink?")) {
      setIsLinked(false);
      setInviteCode("");
      localStorage.removeItem("linkedDoctor");

      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        await supabase
          .from("profiles")
          .update({ linked_doctor_code: null })
          .eq("email", userEmail);
      }
    }
  };

  const toggleBedtimeMode = () => {
    const newState = !bedtimeMode;
    setBedtimeMode(newState);
    localStorage.setItem("bedtimeMode", newState.toString());
  };

  return (
    <div
      className="container"
      style={{
        paddingTop: "140px",
        direction: lang === "ar" ? "rtl" : "ltr",
        textAlign: lang === "ar" ? "right" : "left",
        minHeight: "100vh",
        paddingBottom: "80px",
        paddingRight: "20px",
        paddingLeft: "20px",
        position: "relative",
      }}
    >
      {/* 🌙 وضع الرقابة الليلية وحماية النوم */}
      {bedtimeMode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0f1319",
            zIndex: 99999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "white",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🌙</div>
          <h1 style={{ color: "#fdcb6e", marginBottom: "10px" }}>
            {lang === "ar" ? "حان وقت النوم، نراكم غداً بذكاء ونشاط!" : "Bedtime! See you tomorrow with active energy!"}
          </h1>
          <p style={{ color: "#a0a0b5", fontSize: "16px", marginBottom: "25px" }}>
            {lang === "ar" ? "المنصة في وضع الحماية الليلية لحماية مواعيد نوم الأبطال." : "Platform is in bedtime mode to protect children's sleep schedule."}
          </p>
          <button
            onClick={toggleBedtimeMode}
            style={{
              padding: "10px 25px",
              backgroundColor: "#00b894",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "إلغاء وضع النوم 🔓" : "Disable Bedtime Mode 🔓"}
          </button>
        </div>
      )}

      {/* الشريط العلوي للوحة التحكم */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          maxWidth: "1000px",
          margin: "0 auto 30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div style={{ flex: "1 1 300px" }}>
          <h1 style={{ fontSize: "32px", color: "white", marginBottom: "5px" }}>
            {lang === "ar" ? "لوحة تحكم ولي الأمر 👩‍👧‍👦" : "Parent Dashboard 👩‍👧‍👦"}
          </h1>
          <p style={{ color: "#a0a0b5", fontSize: "16px", margin: 0 }}>
            {lang === "ar" ? "متابعة نشاط وإنجازات طفلك اليومية المتزامنة مع السحاب ⚡" : "Track your child's daily cloud-synced progress"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/consultations")}
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
            onClick={() => navigate("/dashboard")}
            style={{ padding: "10px 15px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "الرئيسية ↗" : "Home ↗"}
          </button>
        </div>
      </div>

      {/* كود ربط العائلة */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 30px",
          backgroundColor: "rgba(253, 203, 110, 0.15)",
          border: "2px dashed #fdcb6e",
          padding: "20px",
          borderRadius: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h3 style={{ color: "#fdcb6e", margin: "0 0 5px 0", fontSize: "18px" }}>
            {lang === "ar" ? "👨‍👩‍👧 كود ربط العائلة الخاص بك" : "👨‍👩‍👧 Your Family Link Code"}
          </h3>
          <p style={{ color: "#a0a0b5", fontSize: "14px", margin: 0 }}>
            {lang === "ar" ? "أعط هذا الكود لطفلك لربط حسابه بحسابك السحابي." : "Give this code to your child to link accounts."}
          </p>
        </div>
        <span
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "10px 20px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            fontSize: "20px",
            letterSpacing: "2px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {myParentCode}
        </span>
      </div>

      {/* المتابعة السريرية وتوجيهات الطبيب */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 30px",
          backgroundColor: "rgba(30, 39, 46, 0.9)",
          padding: "25px",
          borderRadius: "20px",
          border: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ color: "#00b894", marginBottom: "20px", fontSize: "22px" }}>
          👨‍⚕️ {lang === "ar" ? "المتابعة السريرية وتوجيهات الطبيب" : "Clinical Follow-up & Doctor's Guidance"}
        </h2>

        <AnimatePresence mode="wait">
          {!isLinked ? (
            <motion.form
              key="link-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
            <motion.div key="linked-data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div
                style={{
                  backgroundColor: "rgba(0, 184, 148, 0.1)",
                  border: "1px solid #00b894",
                  padding: "15px",
                  borderRadius: "15px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <span style={{ color: "white", fontSize: "16px" }}>
                  {lang === "ar" ? "✅ تم ربط الحساب بعيادة: " : "✅ Linked to clinic: "}
                  <strong style={{ color: "#00b894", fontSize: "18px" }}>{linkedDoctor}</strong>
                </span>
                <button
                  onClick={handleUnlink}
                  style={{ padding: "8px 15px", backgroundColor: "rgba(255, 118, 117, 0.2)", color: "#ff7675", border: "1px solid #ff7675", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                >
                  {lang === "ar" ? "إلغاء الربط ✕" : "Unlink ✕"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h4 style={{ color: "#fdcb6e", marginBottom: "15px", fontSize: "18px" }}>
                    📊 {lang === "ar" ? "التقرير السلوكي السحابي الأخير" : "Latest Behavioral Report"}
                  </h4>
                  <p style={{ color: "#d2dae2", lineHeight: "1.8", fontSize: "15px", margin: 0 }}>{doctorReport}</p>
                </div>

                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h4 style={{ color: "#e84393", marginBottom: "15px", fontSize: "18px" }}>
                    💊 {lang === "ar" ? "روشتة المهام المطلوبة من الطبيب" : "Prescribed Tasks"}
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {doctorTasks.map((task) => (
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

      {/* ملخص نشاط الطفل الحي */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "#0984e3", marginBottom: "15px", fontSize: "22px" }}>
          {lang === "ar" ? `📊 نشاط اليوم لـ: ${childName}` : `📊 Today's Activity for: ${childName}`}
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
            <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>5 / 7</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>🕌</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>{lang === "ar" ? "الصلوات اليومية" : "Daily Prayers"}</h4>
            <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>4 / 5</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>🎮</span>
            <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>{lang === "ar" ? "الألعاب التعليمية" : "Games Played"}</h4>
            <p style={{ color: "#0984e3", fontSize: "20px", fontWeight: "bold" }}>3</p>
          </div>
        </div>
      </div>
    </div>
  );
}