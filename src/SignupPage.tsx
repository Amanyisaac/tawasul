import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"child" | "parent" | "doctor">("parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 👇 حالة جديدة خاصة بكود ربط ولي الأمر للطفل
  const [parentCodeInput, setParentCodeInput] = useState("");
  
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [targetRoute, setTargetRoute] = useState("/dashboard");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingUsers = JSON.parse(localStorage.getItem("tawasul_all_users") || "[]");

    // 👇 1. لو بيسجل كطفل، لازم نتأكد إن كود الأم صحيح وموجود
    if (role === "child") {
      const linkedParent = existingUsers.find((u: any) => u.role === "parent" && u.parentCode === parentCodeInput);
      if (!linkedParent) {
        alert("❌ كود ولي الأمر غير صحيح! يجب أن تقوم والدتك/والدك بإنشاء حساب أولاً لإعطائك الكود.");
        return; // نوقف التسجيل لو الكود غلط
      }
    }

    const saveUserDataAndRedirect = (idCardBase64: string | null = null) => {
      // 👇 2. لو بيسجل كولي أمر، نولد له كود عائلة جديد
      const generatedParentCode = role === "parent" ? `PRNT-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);
      
      // حفظ كود الأم في اللوكال ستوريدج عشان يظهرلها في الداشبورد بتاعتها
      if (role === "parent") {
        localStorage.setItem("myParentCode", generatedParentCode as string);
      }

      const newUser = {
        name: name,
        email: email,
        role: role,
        date: new Date().toLocaleDateString(),
        idCard: idCardBase64,
        doctorStatus: role === "doctor" ? "pending" : undefined,
        parentCode: generatedParentCode, // بيتحفظ مع بيانات الأم
        linkedToParentCode: role === "child" ? parentCodeInput : undefined // بيتحفظ مع بيانات الطفل عشان نعرف ابن مين
      };
      
      existingUsers.push(newUser);
      localStorage.setItem("tawasul_all_users", JSON.stringify(existingUsers));

      if (role === "doctor") {
        setModalMessage("تم إنشاء حساب الطبيب بنجاح وجاري مراجعة الكارنيه! أهلاً بك دكتور.");
        setTargetRoute("/doctor-dashboard");
      } else if (role === "parent") {
        setModalMessage("تم إنشاء الحساب بنجاح! أهلاً بك كولي أمر.");
        setTargetRoute("/parent-dashboard");
      } else {
        setModalMessage("تم إنشاء الحساب بنجاح وربطه بحساب ولي أمرك يا بطل! 🚀");
        setTargetRoute("/dashboard");
      }

      setShowModal(true);
    };

    if (role === "doctor" && idCardFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveUserDataAndRedirect(reader.result as string);
      };
      reader.readAsDataURL(idCardFile);
    } else {
      saveUserDataAndRedirect(null);
    }
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
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} style={{ backgroundColor: "#1e272e", padding: "40px", borderRadius: "24px", border: "2px solid #00b894", textAlign: "center", maxWidth: "450px", width: "90%", boxShadow: "0 20px 50px rgba(0, 184, 148, 0.3)" }}>
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>✨</div>
              <h2 style={{ color: "white", marginBottom: "15px", fontSize: "26px" }}>تهانينا!</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>{modalMessage}</p>
              <button onClick={handleModalClose} style={{ padding: "12px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>البدء الآن 🚀</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: "500px", width: "100%", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "40px 20px", borderRadius: "30px", border: "2px solid rgba(255,255,255,0.1)", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", color: "white", marginBottom: "10px" }}>إنشاء حساب جديد ✨</h2>
          <p style={{ color: "#a0a0b5", fontSize: "15px" }}>انضم إلينا الآن، اختر نوع الحساب وأدخل بياناتك</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setRole("child")} style={{ padding: "10px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "child" ? "#e84393" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: "1 1 100px" }}>👦 طفل</button>
          <button type="button" onClick={() => setRole("parent")} style={{ padding: "10px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "parent" ? "#0984e3" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: "1 1 100px" }}>👩‍👧 ولي أمر</button>
          <button type="button" onClick={() => setRole("doctor")} style={{ padding: "10px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "doctor" ? "#00b894" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: "1 1 150px" }}>🩺 طبيب</button>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>الاسم الكامل</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>البريد الإلكتروني</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>كلمة المرور</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* 👇 يظهر كود ولي الأمر للطفل فقط 👇 */}
          <AnimatePresence>
            {role === "child" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ display: "block", color: "#fdcb6e", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>كود ربط ولي الأمر 👨‍👩‍👧</label>
                <input type="text" required={role === "child"} value={parentCodeInput} onChange={(e) => setParentCodeInput(e.target.value)} placeholder="مثال: PRNT-1234" style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "rgba(253, 203, 110, 0.1)", border: "1px solid #fdcb6e", color: "white", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
                <p style={{ color: "#a0a0b5", fontSize: "12px", marginTop: "8px" }}>* اسأل والدتك/والدك عن هذا الكود بعد إنشاء حسابهم.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {role === "doctor" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>صورة الكارنيه 🪪</label>
                <input type="file" accept="image/*,.pdf" required={role === "doctor"} onChange={(e) => setIdCardFile(e.target.files?.[0] || null)} style={{ width: "100%", padding: "12px", borderRadius: "12px", backgroundColor: "rgba(0, 184, 148, 0.05)", border: "1px dashed #00b894", color: "#a0a0b5", fontSize: "14px", outline: "none", boxSizing: "border-box", cursor: "pointer" }} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ marginTop: "10px", padding: "15px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}>
            إنشاء حساب
          </motion.button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span style={{ color: "#a0a0b5", fontSize: "14px" }}>لديك حساب بالفعل؟ </span>
          <span style={{ color: "#e84393", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }} onClick={() => navigate('/login')}>تسجيل الدخول</span>
        </div>
      </motion.div>
    </div>
  );
}