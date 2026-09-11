import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>("ar");
  
  // بيانات الطفل الحقيقية
  const [childName, setChildName] = useState<string>("");
  const [totalPoints, setTotalPoints] = useState(0);
  
  // حالات إنشاء حساب الطفل من قِبل ولي الأمر
  const [showChildModal, setShowChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildEmail, setNewChildEmail] = useState("");
  const [newChildPassword, setNewChildPassword] = useState("");
  const [isCreatingChild, setIsCreatingChild] = useState(false);

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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem("userEmail");

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

          if (code && code !== "غير متوفر") {
            const { data: childData } = await supabase
              .from("profiles")
              .select("name, points")
              .eq("linked_to_parent_code", code)
              .maybeSingle();

            if (childData) {
              setChildName(childData.name);
              setTotalPoints(childData.points || 0);
            }
          }

          if (parentData.linked_doctor_code) {
            setIsLinked(true);
            setLinkedDoctor("د. أماني إسحاق");
            loadPrescriptionsFromSupabase();
          }
        }
      }
    } catch (err) {
      console.error("Error loading parent dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentLang = localStorage.getItem("tawasul_lang") || "ar";
    setLang(currentLang);

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");

    if (!isLoggedIn || userRole !== "parent") {
      alert(currentLang === "ar" ? "برجاء تسجيل الدخول كولي أمر أولاً." : "Please login as a parent first.");
      navigate("/login");
      return;
    }

    loadDashboardData();
  }, [navigate]);

  // إنشاء حساب الطفل وربطه سحابياً
  const handleCreateChildAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingChild(true);

    const cleanChildEmail = newChildEmail.trim().toLowerCase();
    const cleanChildName = newChildName.trim();
    const cleanChildPassword = newChildPassword.trim();

    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", cleanChildEmail)
        .maybeSingle();

      if (existingUser) {
        alert("❌ هذا البريد مسجل لطفل آخر! اختر بريداً مختلفاً لطفلك.");
        setIsCreatingChild(false);
        return;
      }

      const initialPoints = 100;

      // 1. تسجيل حساب الطفل وربطه بكود عائلة الأب
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          name: cleanChildName,
          email: cleanChildEmail,
          password: cleanChildPassword,
          role: "child",
          linked_to_parent_code: myParentCode,
          points: initialPoints,
        },
      ]);

      if (insertError) throw insertError;

      // 2. إضافته في لوحة الشرف
      await supabase.from("heroes").insert([
        {
          name: cleanChildName,
          points: initialPoints,
          role: "child",
        },
      ]);

      alert(`تم إنشاء حساب البطل (${cleanChildName}) بنجاح! يمكنه الآن الدخول بالبريد وكلمة المرور.`);
      setShowChildModal(false);
      setNewChildName("");
      setNewChildEmail("");
      setNewChildPassword("");
      loadDashboardData();
    } catch (err: any) {
      alert("حدث خطأ أثناء إنشاء حساب الطفل: " + err.message);
    } finally {
      setIsCreatingChild(false);
    }
  };

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

      setDoctorReport("الطفل يظهر تحسناً ممتازاً في مستويات التركيز والانتباه.");
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
      {/* 🌟 نافذة إنشاء حساب الطفل من قِبل ولي الأمر 🌟 */}
      <AnimatePresence>
        {showChildModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1200,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                backgroundColor: "#1e272e",
                padding: "30px",
                borderRadius: "24px",
                border: "2px solid #e84393",
                maxWidth: "450px",
                width: "90%",
                textAlign: "right",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "white", margin: 0, fontSize: "20px" }}>👦 إنشاء حساب لبطل جديد</h3>
                <button onClick={() => setShowChildModal(false)} style={{ background: "transparent", border: "none", color: "#a0a0b5", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleCreateChildAccount} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", color: "#a0a0b5", marginBottom: "5px", fontSize: "13px" }}>اسم الطفل</label>
                  <input type="text" required value={newChildName} onChange={(e) => setNewChildName(e.target.value)} placeholder="مثال: يوسف أحمد" style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "white", outline: "none", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ display: "block", color: "#a0a0b5", marginBottom: "5px", fontSize: "13px" }}>البريد الإلكتروني للطفل (لتسجيل دخوله)</label>
                  <input type="email" required value={newChildEmail} onChange={(e) => setNewChildEmail(e.target.value)} placeholder="youssef@hero.com" style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "white", outline: "none", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ display: "block", color: "#a0a0b5", marginBottom: "5px", fontSize: "13px" }}>كلمة المرور للطفل</label>
                  <input type="password" required value={newChildPassword} onChange={(e) => setNewChildPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "white", outline: "none", boxSizing: "border-box" }} />
                </div>

                <p style={{ color: "#fdcb6e", fontSize: "12px", margin: 0 }}>
                  * سيتم ربط هذا الحساب تلقائياً بكود عائلتك ({myParentCode}) وإيداع 100 نقطة ترحيبية له.
                </p>

                <button type="submit" disabled={isCreatingChild} style={{ marginTop: "10px", padding: "12px", backgroundColor: "#e84393", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", cursor: isCreatingChild ? "wait" : "pointer" }}>
                  {isCreatingChild ? "جاري إنشاء الحساب..." : "إنشاء وتفعيل الحساب ✨"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            {lang === "ar" ? "متابعة نشاط وإنجازات طفلك اليومية المتزامنة مع السحاب ⚡" : "Track your child's progress"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* زر فتح مودال إنشاء حساب الطفل */}
          <button
            onClick={() => setShowChildModal(true)}
            style={{ padding: "10px 16px", backgroundColor: "#e84393", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            👦 إضافة حساب للبطل
          </button>

          <button
            onClick={() => navigate("/consultations")}
            style={{ padding: "10px 15px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "💬 الاستشارات" : "💬 Consultations"}
          </button>

          <button
            onClick={() => window.print()}
            style={{ padding: "10px 15px", backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "📥 تحميل PDF" : "📥 Export PDF"}
          </button>

          <button
            onClick={toggleBedtimeMode}
            style={{ padding: "10px 15px", backgroundColor: bedtimeMode ? "#00b894" : "#fdcb6e", color: bedtimeMode ? "white" : "#2d3436", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            {lang === "ar" ? "🌙 وضع النوم" : "🌙 Bedtime Mode"}
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
            كودك التعريفي المسجل لربط أي أبطال تابعين لك:
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

      {/* ملخص نشاط الطفل أو دعوة لإضافته */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        {childName ? (
          <>
            <h2 style={{ color: "#0984e3", marginBottom: "15px", fontSize: "22px" }}>
              {lang === "ar" ? `📊 نشاط اليوم للبطل: ${childName}` : `📊 Today's Activity: ${childName}`}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center", border: "1px solid #e84393" }}>
                <span style={{ fontSize: "28px" }}>🏅</span>
                <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>النقاط المكتسبة</h4>
                <p style={{ color: "#e84393", fontSize: "24px", fontWeight: "bold" }}>{totalPoints}</p>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
                <span style={{ fontSize: "28px" }}>📿</span>
                <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>الأذكار المنجزة</h4>
                <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>5 / 7</p>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
                <span style={{ fontSize: "28px" }}>🕌</span>
                <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>الصلوات اليومية</h4>
                <p style={{ color: "#00b894", fontSize: "20px", fontWeight: "bold" }}>4 / 5</p>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
                <span style={{ fontSize: "28px" }}>🎮</span>
                <h4 style={{ color: "#a0a0b5", margin: "10px 0 5px" }}>الألعاب التعليمية</h4>
                <p style={{ color: "#0984e3", fontSize: "20px", fontWeight: "bold" }}>3</p>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3 style={{ color: "white", marginBottom: "10px" }}>لم تقم بإضافة حساب طفل حتى الآن 👦</h3>
            <p style={{ color: "#a0a0b5", marginBottom: "20px" }}>قم بإنشاء حساب لطفلك لتبدأ بمتابعة ألعابه ونقاطه وصلواته.</p>
            <button onClick={() => setShowChildModal(true)} style={{ padding: "12px 25px", backgroundColor: "#e84393", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>
              ➕ اضغط هنا لإضافة حساب طفلك
            </button>
          </div>
        )}
      </div>

      {/* المتابعة السريرية وتوجيهات الطبيب */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "#00b894", marginBottom: "20px", fontSize: "22px" }}>
          👨‍⚕️ {lang === "ar" ? "المتابعة السريرية وتوجيهات الطبيب" : "Clinical Guidance"}
        </h2>

        <AnimatePresence mode="wait">
          {!isLinked ? (
            <motion.form key="link-form" onSubmit={handleLinkDoctor} style={{ display: "flex", gap: "10px", flexWrap: "wrap", backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px" }}>
              <div style={{ flex: "1 1 250px" }}>
                <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>
                  هل تتابع مع أخصائي؟ أدخل كود الربط هنا:
                </label>
                <input type="text" placeholder="مثال: DOC-2026-XYZ" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", fontSize: "16px", boxSizing: "border-box" }} required />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="submit" style={{ padding: "12px 25px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", height: "45px" }}>
                  ربط الحساب 🔗
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div key="linked-data">
              <div style={{ backgroundColor: "rgba(0, 184, 148, 0.1)", border: "1px solid #00b894", padding: "15px", borderRadius: "15px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ color: "white", fontSize: "16px" }}>
                  ✅ تم ربط الحساب بعيادة: <strong style={{ color: "#00b894", fontSize: "18px" }}>{linkedDoctor}</strong>
                </span>
                <button onClick={handleUnlink} style={{ padding: "8px 15px", backgroundColor: "rgba(255, 118, 117, 0.2)", color: "#ff7675", border: "1px solid #ff7675", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                  إلغاء الربط ✕
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h4 style={{ color: "#fdcb6e", marginBottom: "15px", fontSize: "18px" }}>📊 التقرير السلوكي السحابي الأخير</h4>
                  <p style={{ color: "#d2dae2", lineHeight: "1.8", fontSize: "15px", margin: 0 }}>{doctorReport}</p>
                </div>

                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h4 style={{ color: "#e84393", marginBottom: "15px", fontSize: "18px" }}>💊 روشتة المهام المطلوبة من الطبيب</h4>
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
    </div>
  );
}