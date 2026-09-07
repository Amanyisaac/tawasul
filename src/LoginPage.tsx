import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"child" | "parent" | "doctor">("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [targetRoute, setTargetRoute] = useState("/dashboard");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);

    if (role === "doctor") {
      setModalMessage("تم تسجيل الدخول بنجاح كطبيب! أهلاً بك.");
      setTargetRoute("/doctor-dashboard");
    } else if (role === "parent") {
      setModalMessage("تم تسجيل الدخول بنجاح لولي الأمر!");
      setTargetRoute("/parent-dashboard");
    } else {
      setModalMessage("تم تسجيل الدخول بنجاح يا بطل!");
      setTargetRoute("/dashboard");
    }

    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate(targetRoute);
  };

  return (
    <div className="container" style={{ paddingTop: "140px", direction: "rtl", textAlign: "right", minHeight: "100vh", paddingBottom: "80px", position: "relative" }}>
      
      <AnimatePresence>
        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              /* 👇 تم إضافة width: "90%" لضمان تجاوب المودال على الموبايل */
              style={{ backgroundColor: "#1e272e", padding: "40px", borderRadius: "24px", border: "2px solid #00b894", textAlign: "center", maxWidth: "450px", width: "90%", boxShadow: "0 20px 50px rgba(0, 184, 148, 0.3)", direction: "rtl" }}
            >
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>🎉</div>
              <h2 style={{ color: "white", marginBottom: "15px", fontSize: "26px" }}>أهلاً بك</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>
                {modalMessage}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleModalClose}
                style={{ padding: "12px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)", width: "100%" }}
              >
                متابعة 🚀
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        /* 👇 تم إضافة width: "100%" لضمان عدم خروج الكارت من الشاشة */
        style={{ maxWidth: "500px", width: "100%", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "40px 20px", borderRadius: "30px", border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 15px 35px rgba(0,0,0,0.5)", boxSizing: "border-box" }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", color: "white", marginBottom: "10px" }}>تسجيل الدخول 👋</h2>
          <p style={{ color: "#a0a0b5", fontSize: "15px" }}>مرحباً بك مجدداً، أدخل بياناتك للمتابعة</p>
        </div>

        {/* 👇 تم إضافة flexWrap للزراير عشان تنزل تحت بعض براحتها لو الشاشة ضيقة */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setRole("child")}
            style={{ padding: "10px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "child" ? "#e84393" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: "1 1 100px" }}
          >
            👦 طفل
          </button>
          <button
            type="button"
            onClick={() => setRole("parent")}
            style={{ padding: "10px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "parent" ? "#0984e3" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: "1 1 100px" }}
          >
            👩‍👧 ولي أمر
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            style={{ padding: "10px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "doctor" ? "#00b894" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: "1 1 150px" }}
          >
            🩺 دكتور / أخصائي
          </button>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            style={{ marginTop: "10px", padding: "15px", backgroundColor: "#e84393", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 8px 20px rgba(232, 67, 147, 0.4)" }}
          >
            تسجيل الدخول
          </motion.button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span style={{ color: "#a0a0b5", fontSize: "14px" }}>ليس لديك حساب؟ </span>
          <span style={{ color: "#00b894", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }} onClick={() => navigate('/signup')}>
            إنشاء حساب جديد
          </span>
        </div>
      </motion.div>
    </div>
  );
}