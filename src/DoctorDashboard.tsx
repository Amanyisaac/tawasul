import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  // حالات نافذة التحذير (لو مش مسجل دخول)
  const [showAuthModal, setShowAuthModal] = useState(false);

  // حالات نافذة إرسال التقرير بنجاح
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      // إظهار نافذة منبثقة بتصميم السايت بدل الـ alert القديمة
      setShowAuthModal(true);
    }
  }, []);

  const [patients] = useState([
    { id: 1, name: "أحمد محمد", age: 7, specialtyNeeded: "تخاطب وعيوب النطق", status: "تحسن ملحوظ في مخارج الحروف" },
    { id: 2, name: "يوسف إبراهيم", age: 6, specialtyNeeded: "تعديل سلوك وتنمية مهارات", status: "بحاجة لجلسات تركيز إضافية" },
    { id: 3, name: "فاطمة علي", age: 8, specialtyNeeded: "تربية خاصة (توحد)", status: "منتظمة في البرنامج اليومي" }
  ]);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [reportText, setReportText] = useState("");

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    setSuccessMessage(`تم إرسال التقرير الطبي بنجاح للطفل: ${selectedPatient.name}`);
    setShowSuccessModal(true);
    
    setReportText("");
    setSelectedPatient(null);
  };

  return (
    <div className="container" style={{ paddingTop: "140px", direction: "rtl", textAlign: "right", minHeight: "100vh", paddingBottom: "80px", paddingRight: "40px", paddingLeft: "40px", position: "relative" }}>
      
      {/* 🌟 1. نافذة تنبيه تسجيل الدخول (تصميم مخصص بدل الـ Alert القديمة) 🌟 */}
      <AnimatePresence>
        {showAuthModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              style={{ backgroundColor: "#1e272e", padding: "40px", borderRadius: "24px", border: "2px solid #ff7675", textAlign: "center", maxWidth: "450px", boxShadow: "0 20px 50px rgba(255, 118, 117, 0.3)", direction: "rtl" }}
            >
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>🔒</div>
              <h2 style={{ color: "white", marginBottom: "15px", fontSize: "26px" }}>تنبيه أمني</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>
                برجاء تسجيل الدخول بحساب طبيب أولاً للوصول لهذه اللوحة.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                style={{ padding: "12px 35px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 8px 15px rgba(255, 118, 117, 0.3)" }}
              >
                تسجيل الدخول 🔑
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌟 2. نافذة منبثقة للتقرير المرسل بنجاح 🌟 */}
      <AnimatePresence>
        {showSuccessModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              style={{ backgroundColor: "#1e272e", padding: "40px", borderRadius: "24px", border: "2px solid #00b894", textAlign: "center", maxWidth: "450px", boxShadow: "0 20px 50px rgba(0, 184, 148, 0.3)", direction: "rtl" }}
            >
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>✅</div>
              <h2 style={{ color: "white", marginBottom: "15px", fontSize: "26px" }}>تم الإرسال بنجاح!</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>
                {successMessage}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSuccessModal(false)}
                style={{ padding: "12px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)" }}
              >
                حسناً 👍
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* شريط علوي للترحيب وزر الخروج */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", maxWidth: "1000px", margin: "0 auto 30px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "white", marginBottom: "5px" }}>لوحة تحكم الطبيب / الأخصائي 🩺</h1>
          <p style={{ color: "#a0a0b5", fontSize: "16px" }}>متابعة الحالات، التخصصات، وإضافة التقارير الطبية والتأهيلية</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            navigate('/login');
          }} 
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#e84393", 
            color: "white", 
            border: "none", 
            borderRadius: "12px", 
            cursor: "pointer", 
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
          }}
        >
          تسجيل الخروج 🚪
        </button>
      </div>

      {/* قائمة الأطفال المتابعين */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "#fdcb6e", marginBottom: "20px", fontSize: "22px" }}>📋 قائمة الأطفال والحالات المسجلة</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" }}>
          {patients.map((patient) => (
            <motion.div 
              key={patient.id}
              whileHover={{ scale: 1.02 }}
              style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <h3 style={{ color: "white", marginBottom: "8px" }}>👦 {patient.name}</h3>
              <p style={{ color: "#a0a0b5", fontSize: "14px", margin: "4px 0" }}>العمر: {patient.age} سنوات</p>
              <p style={{ color: "#00b894", fontSize: "14px", margin: "4px 0" }}>التخصص: {patient.specialtyNeeded}</p>
              <p style={{ color: "#fdcb6e", fontSize: "13px", margin: "8px 0 15px" }}>الحالة: {patient.status}</p>
              
              <button 
                onClick={() => setSelectedPatient(patient)}
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  backgroundColor: "#0984e3", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "10px", 
                  cursor: "pointer", 
                  fontWeight: "bold" 
                }}
              >
                كتابة تقرير / ملاحظة ✍️
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* نموذج كتابة تقرير حالة */}
      {selectedPatient && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.95)", padding: "25px", borderRadius: "20px", border: "2px solid #fdcb6e" }}
        >
          <h3 style={{ color: "white", marginBottom: "15px" }}>📝 كتابة تقرير تأهيلي للطفل: <span style={{ color: "#fdcb6e" }}>{selectedPatient.name}</span></h3>
          <form onSubmit={handleAddReport} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <textarea 
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="اكتب التقرير أو التوجيهات الطبية والسلوكية لولي الأمر هنا..."
              required
              style={{ width: "100%", padding: "12px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                onClick={() => setSelectedPatient(null)}
                style={{ padding: "10px 20px", backgroundColor: "transparent", color: "#a0a0b5", border: "1px solid #a0a0b5", borderRadius: "10px", cursor: "pointer" }}
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                style={{ padding: "10px 25px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                إرسال التقرير لولي الأمر 📤
              </button>
            </div>
          </form>
        </motion.div>
      )}

    </div>
  );
}