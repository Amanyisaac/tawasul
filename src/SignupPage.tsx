import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"child" | "parent" | "doctor">("parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentCodeInput, setParentCodeInput] = useState("");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [targetRoute, setTargetRoute] = useState("/dashboard");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPassword = password.trim();

    try {
      // 1. فحص ما إذا كان البريد مسجلاً مسبقاً
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

      // 2. التحقق من كود ولي الأمر إذا كان الحساب لطفل
      if (role === "child") {
        const { data: parentData, error: parentError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "parent")
          .eq("parent_code", parentCodeInput.trim())
          .maybeSingle();

        if (parentError || !parentData) {
          alert("❌ كود ولي الأمر غير صحيح أو غير مسجل! اطلب من والدك/والدتك إنشاء حساب أولاً لمشاركتك الكود.");
          setLoading(false);
          return;
        }
      }

      // 3. تحويل صورة الكارنيه إلى Base64 لو طبيب
      let idCardBase64: string | null = null;
      if (role === "doctor" && idCardFile) {
        idCardBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(idCardFile);
        });
      }

      // 4. توليد كود عائلة إذا كان المسجل ولي أمر
      const generatedParentCode = role === "parent" ? `PRNT-${Math.floor(1000 + Math.random() * 9000)}` : null;
      const initialPoints = role === "child" ? 100 : 0;

      // 5. حفظ الحساب الجديد في جدول profiles
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            name: cleanName,
            email: cleanEmail,
            password: cleanPassword,
            role: role,
            parent_code: generatedParentCode,
            linked_to_parent_code: role === "child" ? parentCodeInput.trim() : null,
            id_card: idCardBase64,
            doctor_status: role === "doctor" ? "pending" : null,
            points: initialPoints,
          },
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      // 6. لو طفل، إدراجه في جدول heroes للوحة الشرف
      if (role === "child") {
        await supabase.from("heroes").insert([
          {
            name: cleanName,
            points: initialPoints,
            role: "child",
          },
        ]);
      }

      // 7. مزامنة بيانات الجلسة الحالية
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", cleanName);
      localStorage.setItem("userEmail", cleanEmail);
      if (role === "child") {
        localStorage.setItem("childPoints", String(initialPoints));
      }
      if (generatedParentCode) {
        localStorage.setItem("myParentCode", generatedParentCode);
      }

      // تخصيص رسالة النجاح والتوجه
      if (role === "doctor") {
        setModalMessage("تم إنشاء حساب الطبيب وحفظه في قاعدة البيانات السحابية، وطلب التوثيق قيد المراجعة!");
        setTargetRoute("/doctor-dashboard");
      } else if (role === "parent") {
        setModalMessage(`تم إنشاء الحساب بنجاح! كود عائلتك لربط الأبناء هو: ${generatedParentCode}`);
        setTargetRoute("/parent-dashboard");
      } else {
        setModalMessage("تم إنشاء الحساب بنجاح وربطه بولي أمرك وإدراجك في لوحة الشرف السحابية مع 100 نقطة ترحيبية! 🚀");
        setTargetRoute("/dashboard");
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
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", color: "white", marginBottom: "10px" }}>إنشاء حساب جديد ✨</h2>
          <p style={{ color: "#a0a0b5", fontSize: "15px" }}>انضم إلينا الآن، بياناتك تُحفظ مباشرة في السيرفر السحابي</p>
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

          <AnimatePresence>
            {role === "child" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ display: "block", color: "#fdcb6e", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>كود ربط ولي الأمر 👨‍👩‍👧</label>
                <input type="text" required={role === "child"} value={parentCodeInput} onChange={(e) => setParentCodeInput(e.target.value)} placeholder="مثال: PRNT-1234" style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "rgba(253, 203, 110, 0.1)", border: "1px solid #fdcb6e", color: "white", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
                <p style={{ color: "#a0a0b5", fontSize: "12px", marginTop: "8px" }}>* اسأل والدتك/والدك عن هذا الكود بعد إنشاء حسابهم المسجل في المنصة.</p>
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

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" style={{ marginTop: "10px", padding: "15px", backgroundColor: loading ? "#636e72" : "#0984e3", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "جاري إنشاء الحساب وحفظ البيانات..." : "إنشاء حساب"}
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