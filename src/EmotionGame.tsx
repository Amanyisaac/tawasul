import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

interface Emotion {
  id: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  color: string;
  bgCard: string;
}

const emotionsData: Emotion[] = [
  { id: "happy", nameAr: "فرحان وسعيد", nameEn: "Happy", emoji: "😊", color: "#00b894", bgCard: "rgba(0, 184, 148, 0.15)" },
  { id: "sad", nameAr: "زعلان ومحبط", nameEn: "Sad", emoji: "😢", color: "#0984e3", bgCard: "rgba(9, 132, 227, 0.15)" },
  { id: "angry", nameAr: "غاضب ومتعصب", nameEn: "Angry", emoji: "😡", color: "#ff7675", bgCard: "rgba(255, 118, 117, 0.15)" },
  { id: "excited", nameAr: "متحمس ومنشط", nameEn: "Excited", emoji: "🤩", color: "#fdcb6e", bgCard: "rgba(253, 203, 110, 0.15)" },
  { id: "calm", nameAr: "هادئ ومطمئن", nameEn: "Calm", emoji: "😌", color: "#00cec9", bgCard: "rgba(0, 206, 201, 0.15)" },
  { id: "tired", nameAr: "متعب ومرهق", nameEn: "Tired", emoji: "😴", color: "#b2bec3", bgCard: "rgba(178, 190, 195, 0.15)" },
];

// إضافة onBack هنا لحل مشكلة TypeScript
export default function EmotionGame({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const lang = localStorage.getItem("tawasul_lang") || "ar";

  const handleSelectEmotion = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setReasonText("");
    setSubmitted(false);
  };

  const handleSubmitReason = async () => {
    if (!selectedEmotion) return;
    setLoading(true);

    const userEmail = localStorage.getItem("userEmail");
    const earnedPoints = 15; // عدد النقاط المكتسبة

    try {
      if (userEmail) {
        // 1. جلب النقاط الحالية للمستخدم وتحديثها في جدول profiles
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("points")
          .eq("email", userEmail)
          .single();

        const newPoints = (currentProfile?.points || 0) + earnedPoints;

        await supabase
          .from("profiles")
          .update({ points: newPoints })
          .eq("email", userEmail);

        localStorage.setItem("childPoints", String(newPoints));
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error saving points:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "transparent", padding: "10px 15px", direction: lang === "ar" ? "rtl" : "ltr", boxSizing: "border-box" }}>
      
      {/* زر العودة لقائمة الألعاب */}
      {onBack && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button onClick={onBack} style={{ padding: "10px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>العودة للألعاب ✕</button>
        </div>
      )}

      {/* عنوان اللعبة */}
      <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 30px auto" }}>
        <h1 style={{ color: "white", fontSize: "28px", marginBottom: "10px" }}>
          {lang === "ar" ? "🎨 ركن المشاعر والأحاسيس" : "🎨 Feelings Corner"}
        </h1>
        <p style={{ color: "#a0a0b5", fontSize: "16px" }}>
          {lang === "ar" ? "كيف تشعر اليوم يا بطل؟ اختر البطاقة التي تعبر عنك واكسب نقاطاً!" : "How do you feel today? Choose your card and earn points!"}
        </p>
      </div>

      {!submitted ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          {/* شبكة الكاردات - متجاوبة مع كل الشاشات */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            {emotionsData.map((emotion) => {
              const isSelected = selectedEmotion?.id === emotion.id;
              return (
                <motion.div
                  key={emotion.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectEmotion(emotion)}
                  style={{
                    backgroundColor: emotion.bgCard,
                    border: isSelected ? `3px solid ${emotion.color}` : "2px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    padding: "25px 15px",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: isSelected ? `0 0 20px ${emotion.color}` : "0 5px 15px rgba(0,0,0,0.3)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ fontSize: "50px", marginBottom: "12px" }}>{emotion.emoji}</div>
                  <h3 style={{ color: "white", fontSize: "18px", margin: 0 }}>
                    {lang === "ar" ? emotion.nameAr : emotion.nameEn}
                  </h3>
                </motion.div>
              );
            })}
          </div>

          {/* خانة الكتابة تظهر فور اختيار أي شعور */}
          <AnimatePresence>
            {selectedEmotion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{
                  backgroundColor: "#1e272e",
                  padding: "25px",
                  borderRadius: "20px",
                  border: `2px solid ${selectedEmotion.color}`,
                  textAlign: "center",
                }}
              >
                <h3 style={{ color: "white", marginBottom: "12px", fontSize: "18px" }}>
                  {lang === "ar" ? `لقد اخترت "${selectedEmotion.nameAr}" ${selectedEmotion.emoji}, هل تريد أن تحكي لنا السبب؟ (اختياري)` : `You chose "${selectedEmotion.nameEn}". Want to share why?`}
                </h3>
                
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder={lang === "ar" ? "اكتب هنا لماذا تشعر بذلك اليوم..." : "Type here why you feel this way..."}
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "15px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    marginBottom: "15px",
                  }}
                />

                <button
                  onClick={handleSubmitReason}
                  disabled={loading}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: selectedEmotion.color,
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                  }}
                >
                  {loading ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "إرسال واكسب 15 نقطة ⭐" : "Submit & Earn 15 Points ⭐")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      ) : (
        /* شاشة النجاح عند إرسال الشعور */
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            maxWidth: "500px",
            margin: "40px auto",
            backgroundColor: "#1e272e",
            padding: "40px 20px",
            borderRadius: "24px",
            border: "2px solid #00b894",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>🎉</div>
          <h2 style={{ color: "white", marginBottom: "15px", fontSize: "24px" }}>
            {lang === "ar" ? "رائع يا بطل! تم تسجيل شعورك بنجاح" : "Awesome! Emotion recorded successfully"}
          </h2>
          <p style={{ color: "#fdcb6e", fontSize: "18px", fontWeight: "bold", marginBottom: "25px" }}>
            +15 ⭐ {lang === "ar" ? "تمت إضافة النقاط لرصيدك!" : "Points added to your balance!"}
          </p>
          
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => {
                setSelectedEmotion(null);
                setSubmitted(false);
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {lang === "ar" ? "اختيار شعور آخر 🔄" : "Choose Another 🔄"}
            </button>
            <button
              onClick={onBack || (() => navigate("/dashboard"))}
              style={{
                padding: "10px 25px",
                backgroundColor: "#00b894",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {lang === "ar" ? "العودة للألعاب 🏠" : "Back to Games 🏠"}
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}