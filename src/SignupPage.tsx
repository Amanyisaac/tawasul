import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"parent" | "doctor">("parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [targetRoute, setTargetRoute] = useState("/parent-dashboard");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPassword = password.trim();

    try {
      // 1. فحص البريد الإلكتروني
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingUser) {
        alert("❌ هذا البريد الإلكتروني مسجل بالفعل! يرجى تسجيل الدخول أو استخدام بريد آخر.");
        setLoading(false);
        return;
      }

      // 2. تحويل صورة الكارنيه لو طبيب
      let idCardBase64: string | null = null;
      if (role === "doctor" && idCardFile) {
        idCardBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(idCardFile);
        });
      }

      // 3. توليد كود العائلة لولي الأمر
      const generatedParentCode = role === "parent" ? `PRNT-${Math.floor(1000 + Math.random() * 9000)}` : null;

      // 4. الحفظ في Supabase
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            name: cleanName,
            email: cleanEmail,
            password: cleanPassword,
            role: role,
            parent_code: generatedParentCode,
            id_card: idCardBase64,
            doctor_status: role === "doctor" ? "pending" : null,
            points: 0,
          },
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      // 5. حفظ الجلسة
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", cleanName);
      localStorage.setItem("userEmail", cleanEmail);
      if (generatedParentCode) {
        localStorage.setItem("myParentCode", generatedParentCode);
      }

      if (role === "doctor") {
        setModalMessage("تم إنشاء حساب الطبيب، وهو قيد المراجعة حالياً من الإدارة!");
        setTargetRoute("/doctor-dashboard");
      } else {
        setModalMessage(`تم إنشاء حسابك كولي أمر بنجاح! كود عائلتك هو: ${generatedParentCode}. يمكنك الآن إنشاء حساب لطفلك ومتابعته.`);
        setTargetRoute("/parent-dashboard");
      }

      setShowModal(true);
    } catch (err: any) {
      alert("حدث خطأ أثناء التسجيل: " + (err.message || "يرجى المحاولة لاحقاً"));
    } finally {
      setLoading(false);
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
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2 style={{ fontSize: "28px", color: "white", marginBottom: "10px" }}>إنشاء حساب جديد ✨</h2>
          <p style={{ color: "#a0a0b5", fontSize: "15px" }}>اختر نوع الحساب لبدء الاستخدام</p>
        </div>

        {/* اختيار النوع: ولي أمر أو طبيب فقط */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          <button type="button" onClick={() => setRole("parent")} style={{ padding: "12px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "parent" ? "#0984e3" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: 1 }}>👩‍👧 ولي أمر</button>
          <button type="button" onClick={() => setRole("doctor")} style={{ padding: "12px 20px", borderRadius: "15px", border: "none", backgroundColor: role === "doctor" ? "#00b894" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", cursor: "pointer", flex: 1 }}>🩺 طبيب / مرشد</button>
        </div>

        {/* تنبيه الأطفال اللطيف */}
        <div style={{ backgroundColor: "rgba(232, 67, 147, 0.1)", border: "1px dashed #e84393", borderRadius: "12px", padding: "12px", marginBottom: "20px", textAlign: "center" }}>
          <p style={{ color: "#fdcb6e", margin: 0, fontSize: "13px", fontWeight: "bold" }}>
            👦 هل أنت بطل صغير؟ اطلب من والدك أو والدتك تسجيل الدخول وإنشاء حسابك من داخل لوحة تحكم ولي الأمر!
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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

          <AnimatePresence>
            {role === "doctor" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px", fontSize: "14px" }}>صورة الكارنيه 🪪</label>
                <input type="file" accept="image/*,.pdf" required={role === "doctor"} onChange={(e) => setIdCardFile(e.target.files?.[0] || null)} style={{ width: "100%", padding: "12px", borderRadius: "12px", backgroundColor: "rgba(0, 184, 148, 0.05)", border: "1px dashed #00b894", color: "#a0a0b5", fontSize: "14px", outline: "none", boxSizing: "border-box", cursor: "pointer" }} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" style={{ marginTop: "10px", padding: "15px", backgroundColor: loading ? "#636e72" : "#0984e3", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
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