import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("دكتور");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorImage, setDoctorImage] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("DOC-2026-XYZ");
  const [doctorStatus, setDoctorStatus] = useState<"pending" | "approved" | "rejected">("pending");

  // حالات النوافذ
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeModal, setActiveModal] = useState<"report" | "task" | "analytics" | "reward" | null>(null);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [taskCategory, setTaskCategory] = useState("game");
  const [taskDetail, setTaskDetail] = useState("");
  const [reportText, setReportText] = useState("");
  const [rewardType, setRewardType] = useState("star");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [patients] = useState<any[]>([
    {
      id: 1,
      name: "أحمد محمد",
      age: 7,
      specialtyNeeded: "تخاطب وعيوب النطق",
      status: "مستقر",
      currentMood: "😊",
      moodHistory: [
        { day: "الأحد", mood: 4 },
        { day: "الإثنين", mood: 3 },
        { day: "الثلاثاء", mood: 5 },
        { day: "الأربعاء", mood: 4 },
      ],
      progress: [
        { name: "الصلاة", value: 80 },
        { name: "الألعاب", value: 95 },
        { name: "الأذكار", value: 60 },
      ],
    },
    {
      id: 2,
      name: "يوسف إبراهيم",
      age: 6,
      specialtyNeeded: "تعديل سلوك",
      status: "يحتاج متابعة",
      currentMood: "😠",
      moodHistory: [
        { day: "الأحد", mood: 2 },
        { day: "الإثنين", mood: 1 },
        { day: "الثلاثاء", mood: 2 },
        { day: "الأربعاء", mood: 3 },
      ],
      progress: [
        { name: "الصلاة", value: 40 },
        { name: "الألعاب", value: 70 },
        { name: "الأذكار", value: 30 },
      ],
    },
    {
      id: 3,
      name: "فاطمة علي",
      age: 8,
      specialtyNeeded: "تربية خاصة (توحد)",
      status: "متحسن",
      currentMood: "😌",
      moodHistory: [
        { day: "الأحد", mood: 4 },
        { day: "الإثنين", mood: 4 },
        { day: "الثلاثاء", mood: 5 },
        { day: "الأربعاء", mood: 5 },
      ],
      progress: [
        { name: "الصلاة", value: 90 },
        { name: "الألعاب", value: 85 },
        { name: "الأذكار", value: 95 },
      ],
    },
  ]);

  const doctorProfile = {
    specialty: "أخصائي تعديل سلوك وتنمية مهارات",
    rating: 4.9,
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail") || "";

    if (!isLoggedIn || role !== "doctor") {
      setShowAuthModal(true);
      return;
    }

    setDoctorEmail(email);

    // جلب بيانات الطبيب الحية وحالته من Supabase
    async function loadDoctorData() {
      try {
        const { data: docData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
          .single();

        if (docData && !error) {
          if (docData.name) setDoctorName(docData.name);
          if (docData.avatar_url) setDoctorImage(docData.avatar_url);
          if (docData.parent_code) setInviteCode(`DOC-${docData.id || "2026"}`);

          const status = docData.doctor_status || "pending";
          setDoctorStatus(status);

          if (status === "rejected") {
            setShowRejectedModal(true);
          }
        }
      } catch (err) {
        console.error("Error loading doctor data:", err);
      }
    }

    loadDoctorData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setDoctorImage(base64String);
        localStorage.setItem("doctorProfilePic", base64String);

        if (doctorEmail) {
          await supabase
            .from("profiles")
            .update({ avatar_url: base64String })
            .eq("email", doctorEmail);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    showSuccess("تم نسخ كود الدعوة! شاركه مع أولياء الأمور لربط حسابات أطفالهم بعيادتك.");
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setActiveModal(null);
  };

  // 1. حفظ الملاحظات السرية في Supabase
  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() || !selectedPatient) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("doctor_notes").insert([
        {
          doctor_email: doctorEmail,
          child_name: selectedPatient.name,
          note_content: reportText.trim(),
        },
      ]);

      if (error) throw error;
      setReportText("");
      showSuccess(`تم حفظ الملاحظات السرية للطفل ${selectedPatient.name} سحابياً بنجاح 🔒`);
    } catch (err: any) {
      alert("خطأ أثناء الحفظ: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. إرسال الروشتة في Supabase
  const handleSendPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDetail || !selectedPatient) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("prescriptions").insert([
        {
          doctor_email: doctorEmail,
          child_name: selectedPatient.name,
          category: taskCategory,
          task_detail: taskDetail,
        },
      ]);

      if (error) throw error;
      setTaskDetail("");
      showSuccess(`تم إرسال الروشتة لحساب البطل ${selectedPatient.name} بنجاح 🚀`);
    } catch (err: any) {
      alert("خطأ أثناء الإرسال: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. إرسال المكافأة وزيادة نقاط الطفل مباشرة في Supabase
  const handleSendReward = async () => {
    if (!selectedPatient) return;
    const bonusPoints = rewardType === "star" ? 50 : 100;

    try {
      setIsSubmitting(true);
      // جلب نقاط الطفل الحالية
      const { data: childProfile } = await supabase
        .from("profiles")
        .select("points")
        .eq("name", selectedPatient.name)
        .single();

      const currentPts = childProfile?.points || 0;
      const newTotal = currentPts + bonusPoints;

      // تحديث نقاط الطفل في profiles و heroes
      await supabase
        .from("profiles")
        .update({ points: newTotal })
        .eq("name", selectedPatient.name);

      await supabase
        .from("heroes")
        .update({ points: newTotal })
        .eq("name", selectedPatient.name);

      showSuccess(`تم إرسال المكافأة بنجاح! تمت إضافة ${bonusPoints} نقطة في السيرفر لحساب البطل: ${selectedPatient.name} ⭐`);
    } catch (err: any) {
      console.error("Reward error:", err);
      showSuccess(`تم إرسال المكافأة للبطل: ${selectedPatient.name} 🎉`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        paddingTop: "140px",
        direction: "rtl",
        textAlign: "right",
        minHeight: "100vh",
        paddingBottom: "80px",
        paddingRight: "20px",
        paddingLeft: "20px",
      }}
    >
      {/* نافذة تنبيه تسجيل الدخول */}
      <AnimatePresence>
        {showAuthModal && (
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
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                backgroundColor: "#1e272e",
                padding: "40px",
                borderRadius: "24px",
                border: "2px solid #ff7675",
                textAlign: "center",
                maxWidth: "450px",
                width: "90%",
              }}
            >
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>🔒</div>
              <h2 style={{ color: "white", marginBottom: "15px" }}>تنبيه أمني</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", marginBottom: "30px" }}>
                برجاء تسجيل الدخول بحساب طبيب معتمد أولاً.
              </p>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "12px 35px",
                  backgroundColor: "#ff7675",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  fontSize: "18px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                تسجيل الدخول 🔑
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة الرفض */}
      <AnimatePresence>
        {showRejectedModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1300,
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                backgroundColor: "#1e272e",
                padding: "40px",
                borderRadius: "24px",
                border: "2px solid #ff7675",
                textAlign: "center",
                maxWidth: "450px",
                width: "90%",
              }}
            >
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>❌</div>
              <h2 style={{ color: "#ff7675", marginBottom: "15px" }}>عذراً، تم رفض طلبك</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", marginBottom: "30px" }}>
                لقد قامت الإدارة بمراجعة مستندات الكارنيه ورفض الطلب، يرجى مراجعة الدعم الفني.
              </p>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                style={{
                  padding: "12px 35px",
                  backgroundColor: "#ff7675",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  fontSize: "18px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                العودة لتسجيل الدخول 🚪
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة النجاح */}
      <AnimatePresence>
        {showSuccessModal && (
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
              zIndex: 1100,
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              style={{
                backgroundColor: "#1e272e",
                padding: "40px",
                borderRadius: "24px",
                border: "2px solid #00b894",
                textAlign: "center",
                maxWidth: "450px",
                width: "90%",
              }}
            >
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>✅</div>
              <h2 style={{ color: "white", marginBottom: "15px" }}>تم بنجاح!</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", marginBottom: "30px" }}>
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  padding: "12px 35px",
                  backgroundColor: "#00b894",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  fontSize: "18px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                حسناً 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* شريط حالة المراجعة */}
      {doctorStatus === "pending" && (
        <div
          style={{
            backgroundColor: "rgba(253, 203, 110, 0.15)",
            border: "1px solid #fdcb6e",
            padding: "15px 20px",
            borderRadius: "15px",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "24px" }}>⏳</span>
          <p style={{ color: "#fdcb6e", margin: 0, fontSize: "16px", fontWeight: "bold" }}>
            حسابك حالياً تحت المراجعة لدى الإدارة. بانتظار توثيق الكارنيه لتفعيل كامل الصلاحيات السريرية.
          </p>
        </div>
      )}

      {/* هيدر البروفايل */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "85px", height: "85px" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "45px",
                border: doctorStatus === "approved" ? "3px solid #00b894" : "3px solid #fdcb6e",
                overflow: "hidden",
              }}
            >
              {doctorImage ? (
                <img src={doctorImage} alt="Doctor" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>👨‍⚕️</span>
              )}
            </div>
            <label
              style={{
                position: "absolute",
                bottom: "-5px",
                right: "-5px",
                backgroundColor: "#fdcb6e",
                padding: "5px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "25px",
                height: "25px",
                fontSize: "14px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
              }}
              title="تغيير الصورة"
            >
              📷
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div>
            <h1 style={{ fontSize: "32px", color: "white", margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              د. {doctorName}
              {doctorStatus === "approved" && (
                <span title="حساب موثق سحابياً" style={{ fontSize: "24px", color: "#00b894" }}>
                  ✅
                </span>
              )}
            </h1>
            <p style={{ color: "#fdcb6e", fontSize: "16px", margin: "0 0 5px 0" }}>{doctorProfile.specialty}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#a0a0b5", fontSize: "14px" }}>
                ⭐ تقييم الآباء: <strong style={{ color: "white" }}>{doctorProfile.rating}/5.0</strong>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/consultations")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0984e3",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            💬 الاستشارات والرسائل
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e84393",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            تسجيل الخروج 🚪
          </button>
        </div>
      </div>

      {/* قسم كود الدعوة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: "rgba(0, 184, 148, 0.1)",
          border: "2px dashed #00b894",
          padding: "20px",
          borderRadius: "20px",
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h3 style={{ color: "#00b894", marginBottom: "5px", fontSize: "18px" }}>🔗 كود الربط السريري</h3>
          <p style={{ color: "#a0a0b5", fontSize: "14px", margin: 0 }}>
            أعط هذا الكود لأولياء الأمور لربط ملفات أطفالهم السحابية بعيادتك.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "10px 20px",
              borderRadius: "10px",
              color: "white",
              fontWeight: "bold",
              fontSize: "18px",
              letterSpacing: "2px",
            }}
          >
            {inviteCode}
          </span>
          <button
            onClick={copyInviteCode}
            style={{
              padding: "10px 20px",
              backgroundColor: "#00b894",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            نسخ الكود 📋
          </button>
        </div>
      </motion.div>

      {/* قائمة الأطفال والعمليات */}
      <h2 style={{ color: "#fdcb6e", marginBottom: "20px", fontSize: "24px" }}>👥 قائمة الأبطال </h2>
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", padding: 0 }}
      >
        {patients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              backgroundColor: "rgba(30, 39, 46, 0.9)",
              padding: "25px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div
                  title="الحالة المزاجية اليوم"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "28px",
                  }}
                >
                  {patient.currentMood}
                </div>
                <div>
                  <h3 style={{ color: "white", margin: "0 0 5px", fontSize: "18px" }}>{patient.name}</h3>
                  <span style={{ color: "#a0a0b5", fontSize: "13px" }}>
                    العمر: {patient.age} | {patient.specialtyNeeded}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "25px" }}>
              <button
                onClick={() => {
                  setSelectedPatient(patient);
                  setActiveModal("report");
                }}
                style={{
                  flex: "1 1 45%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                📝 ملاحظات سرية
              </button>
              <button
                onClick={() => {
                  setSelectedPatient(patient);
                  setActiveModal("task");
                }}
                style={{
                  flex: "1 1 45%",
                  padding: "10px",
                  backgroundColor: "rgba(9, 132, 227, 0.2)",
                  color: "#0984e3",
                  border: "1px solid #0984e3",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                💊 روشتة مهام
              </button>
              <button
                onClick={() => {
                  setSelectedPatient(patient);
                  setActiveModal("analytics");
                }}
                style={{
                  flex: "1 1 45%",
                  padding: "10px",
                  backgroundColor: "rgba(0, 184, 148, 0.2)",
                  color: "#00b894",
                  border: "1px solid #00b894",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                📊 تحليلات سلوكية
              </button>
              <button
                onClick={() => {
                  setSelectedPatient(patient);
                  setActiveModal("reward");
                }}
                style={{
                  flex: "1 1 45%",
                  padding: "10px",
                  backgroundColor: "rgba(253, 203, 110, 0.2)",
                  color: "#fdcb6e",
                  border: "1px solid #fdcb6e",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                ⭐ إرسال مكافأة
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* المودالز المشتركة */}
      <AnimatePresence>
        {activeModal && selectedPatient && (
          <div
            className="video-overlay"
            onClick={() => setActiveModal(null)}
            style={{ zIndex: 1000, overflowY: "auto", padding: "20px 0" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="video-modal"
              style={{ maxWidth: "700px", width: "95%", padding: "30px", backgroundColor: "#2d3436", margin: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>

              {activeModal === "report" && (
                <>
                  <h3 style={{ color: "white", marginBottom: "15px", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    📝 ملاحظات سرية للطفل: <span style={{ color: "#0984e3" }}>{selectedPatient.name}</span>
                  </h3>
                  <p style={{ color: "#ff7675", fontSize: "13px", marginBottom: "15px" }}>
                    ⚠️ هذه الملاحظات تحفظ في قاعدة البيانات المشفرة ولا تظهر لولي الأمر أو الطفل.
                  </p>
                  <form onSubmit={handleSaveNotes}>
                    <textarea
                      rows={5}
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="اكتب تحليل الجلسة، نقاط الضعف، واستجابة الطفل للعلاج هنا..."
                      required
                      style={{
                        width: "100%",
                        padding: "15px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        outline: "none",
                        fontSize: "15px",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        marginTop: "15px",
                        width: "100%",
                        padding: "12px",
                        backgroundColor: isSubmitting ? "#636e72" : "#0984e3",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        cursor: isSubmitting ? "wait" : "pointer",
                      }}
                    >
                      {isSubmitting ? "جاري الحفظ..." : "حفظ في ملف المريض السحابي 🔒"}
                    </button>
                  </form>
                </>
              )}

              {activeModal === "task" && (
                <>
                  <h3 style={{ color: "white", marginBottom: "15px", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    💊 وصف روشتة لـ: <span style={{ color: "#00b894" }}>{selectedPatient.name}</span>
                  </h3>
                  <p style={{ color: "#a0a0b5", fontSize: "14px", marginBottom: "20px" }}>
                    المهام ستصل لقاعدة البيانات وتظهر للطفل كـ "مهمة من بطلي السري".
                  </p>
                  <form onSubmit={handleSendPrescription}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                      <button
                        type="button"
                        onClick={() => setTaskCategory("game")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          backgroundColor: taskCategory === "game" ? "#00b894" : "rgba(255,255,255,0.1)",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        🎮 لزيادة التركيز
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskCategory("story")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          backgroundColor: taskCategory === "story" ? "#e84393" : "rgba(255,255,255,0.1)",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        📖 لعلاج الخوف
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskCategory("azkar")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          backgroundColor: taskCategory === "azkar" ? "#fdcb6e" : "rgba(255,255,255,0.1)",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        🤲 للطمأنينة
                      </button>
                    </div>

                    <select
                      required
                      value={taskDetail}
                      onChange={(e) => setTaskDetail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        backgroundColor: "#1e272e",
                        border: "1px solid #00b894",
                        color: "white",
                        outline: "none",
                        fontSize: "16px",
                        marginBottom: "20px",
                        cursor: "pointer",
                      }}
                    >
                      <option value="" disabled style={{ backgroundColor: "#2d3436", color: "#a0a0b5" }}>
                        -- حدد المهمة --
                      </option>
                      {taskCategory === "game" && (
                        <>
                          <option value="لعبة الذاكرة (مستوى متقدم)" style={{ backgroundColor: "#2d3436", color: "white" }}>
                            لعبة الذاكرة (مستوى متقدم)
                          </option>
                          <option value="لعبة الكلمات" style={{ backgroundColor: "#2d3436", color: "white" }}>
                            لعبة الكلمات
                          </option>
                        </>
                      )}
                      {taskCategory === "story" && (
                        <>
                          <option value="قصة الشجاع (للتغلب على الخوف)" style={{ backgroundColor: "#2d3436", color: "white" }}>
                            قصة الشجاع (للتغلب على الخوف)
                          </option>
                          <option value="قصة التعاون" style={{ backgroundColor: "#2d3436", color: "white" }}>
                            قصة التعاون
                          </option>
                        </>
                      )}
                      {taskCategory === "azkar" && (
                        <>
                          <option value="أذكار الصباح (لتحسين المزاج)" style={{ backgroundColor: "#2d3436", color: "white" }}>
                            أذكار الصباح (لتحسين المزاج)
                          </option>
                        </>
                      )}
                    </select>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: isSubmitting ? "#636e72" : "#00b894",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        cursor: isSubmitting ? "wait" : "pointer",
                      }}
                    >
                      {isSubmitting ? "جاري الإرسال..." : "إرسال الروشتة للطفل 🚀"}
                    </button>
                  </form>
                </>
              )}

              {activeModal === "analytics" && (
                <>
                  <h3 style={{ color: "white", marginBottom: "25px", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    📊 التحليلات السلوكية: <span style={{ color: "#fdcb6e" }}>{selectedPatient.name}</span>
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                    <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "15px" }}>
                      <h4 style={{ color: "white", marginBottom: "15px", textAlign: "center" }}>
                        معدل الالتزام بالمهام (%)
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={selectedPatient.progress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="name" stroke="#a0a0b5" />
                          <YAxis stroke="#a0a0b5" />
                          <Tooltip wrapperStyle={{ backgroundColor: "#1e272e", color: "white" }} />
                          <Bar dataKey="value" fill="#00b894" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "15px" }}>
                      <h4 style={{ color: "white", marginBottom: "15px", textAlign: "center" }}>
                        خريطة الحالة المزاجية (1 سيء - 5 ممتاز)
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={selectedPatient.moodHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="day" stroke="#a0a0b5" />
                          <YAxis domain={[1, 5]} stroke="#a0a0b5" />
                          <Tooltip wrapperStyle={{ backgroundColor: "#1e272e", color: "white" }} />
                          <Line type="monotone" dataKey="mood" stroke="#fdcb6e" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}

              {activeModal === "reward" && (
                <>
                  <h3 style={{ color: "white", marginBottom: "15px", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    ⭐ إرسال مكافأة للبطل: <span style={{ color: "#fdcb6e" }}>{selectedPatient.name}</span>
                  </h3>
                  <p style={{ color: "#a0a0b5", fontSize: "14px", marginBottom: "20px" }}>
                    سيتم إضافة النقاط فوراً في رصيد الطفل وقاعدة بيانات لوحة الشرف السحابية.
                  </p>

                  <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
                    <div
                      onClick={() => setRewardType("star")}
                      style={{
                        flex: 1,
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: rewardType === "star" ? "rgba(253, 203, 110, 0.2)" : "rgba(255,255,255,0.05)",
                        border: rewardType === "star" ? "2px solid #fdcb6e" : "2px solid transparent",
                        borderRadius: "15px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "50px" }}>⭐</div>
                      <h4 style={{ color: "white", marginTop: "10px" }}>نجمة ذهبية (50 نقطة)</h4>
                    </div>
                    <div
                      onClick={() => setRewardType("certificate")}
                      style={{
                        flex: 1,
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor:
                          rewardType === "certificate" ? "rgba(9, 132, 227, 0.2)" : "rgba(255,255,255,0.05)",
                        border: rewardType === "certificate" ? "2px solid #0984e3" : "2px solid transparent",
                        borderRadius: "15px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "50px" }}>📜</div>
                      <h4 style={{ color: "white", marginTop: "10px" }}>شهادة تقدير (100 نقطة)</h4>
                    </div>
                  </div>

                  <button
                    onClick={handleSendReward}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "15px",
                      backgroundColor: rewardType === "star" ? "#fdcb6e" : "#0984e3",
                      color: rewardType === "star" ? "#2d3436" : "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: isSubmitting ? "wait" : "pointer",
                      fontSize: "18px",
                    }}
                  >
                    {isSubmitting ? "جاري الإرسال وتحديث النقاط..." : "إرسال المكافأة الآن 🎉"}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}