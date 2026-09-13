import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// استيراد جميع الصور المطابقة تماماً لأسماء الملفات في مجلد assets
import imgAngry from "./assets/angry.png";
import imgBored from "./assets/Bored.png";
import imgBrave from "./assets/Brave.png";
import imgConcentrating from "./assets/Concentrating.png";
import imgCurious from "./assets/Curious.png";
import imgDisappointed from "./assets/Disappointed.png";
import imgDisgusted from "./assets/Disgusted.png";
import imgDreamy from "./assets/Dreamy.png";
import imgEmbarrassed from "./assets/Embarrassed.png";
import imgGrumpy from "./assets/Grumpy.png";
import imgHappy from "./assets/happy.png";
import imgImpatient from "./assets/Impatient.png";
import imgJealous from "./assets/Jealous.png";
import imgLonely from "./assets/lonely.png";
import imgLoved from "./assets/loved.png";
import imgPlayful from "./assets/Playful.png";
import imgProud from "./assets/proud (1).png";
import imgSad from "./assets/sad.png";
import imgShy from "./assets/shy.png";
import imgSick from "./assets/sick.png";
import imgSleep from "./assets/sleep.png";
import imgSorry from "./assets/sorry.png";
import imgSurprised from "./assets/Surprised.png";

interface Emotion {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
  descAr: string;
  descEn: string;
  color: string;
  bgCard: string;
}

// مكتبة المشاعر الشاملة 23 شعوراً
const emotionsData: Emotion[] = [
  { id: "happy", nameAr: "فرحان وسعيد", nameEn: "Happy", image: imgHappy, descAr: "أشعر بطاقة إيجابية وفرح", descEn: "Feeling positive and joyful", color: "#00b894", bgCard: "rgba(0, 184, 148, 0.15)" },
  { id: "sad", nameAr: "زعلان ومحبط", nameEn: "Sad", image: imgSad, descAr: "أحتاج لبعض العناق والمواساة", descEn: "Need some hugs and comfort", color: "#0984e3", bgCard: "rgba(9, 132, 227, 0.15)" },
  { id: "angry", nameAr: "غاضب ومتعصب", nameEn: "Angry", image: imgAngry, descAr: "أشعر بالغضب وأحتاج للهدوء", descEn: "Feeling mad and need to calm down", color: "#ff7675", bgCard: "rgba(255, 118, 117, 0.15)" },
  { id: "sleep", nameAr: "متعب ومرهق", nameEn: "Tired / Sleepy", image: imgSleep, descAr: "طاقتي قليلة وأحتاج للنوم", descEn: "Low energy, need to sleep", color: "#b2bec3", bgCard: "rgba(178, 190, 195, 0.15)" },
  { id: "playful", nameAr: "مرح ونشيط", nameEn: "Playful", image: imgPlayful, descAr: "أريد اللعب والضحك كثيراً", descEn: "I want to play and laugh", color: "#f1c40f", bgCard: "rgba(241, 196, 15, 0.15)" },
  { id: "proud", nameAr: "فخور وواثق", nameEn: "Proud", image: imgProud, descAr: "أنا فخور بما أنجزته اليوم", descEn: "Proud of what I achieved", color: "#6c5ce7", bgCard: "rgba(108, 92, 231, 0.15)" },
  { id: "bored", nameAr: "ملول وزهقان", nameEn: "Bored", image: imgBored, descAr: "أحتاج لشيء ممتع لأفعله", descEn: "Need something fun to do", color: "#95a5a6", bgCard: "rgba(149, 165, 166, 0.15)" },
  { id: "brave", nameAr: "شجاع وقوي", nameEn: "Brave", image: imgBrave, descAr: "أستطيع مواجهة أي تحدي", descEn: "I can face any challenge", color: "#27ae60", bgCard: "rgba(39, 174, 96, 0.15)" },
  { id: "concentrating", nameAr: "مركز ومندمج", nameEn: "Concentrating", image: imgConcentrating, descAr: "أفكر بعمق في إنجاز مهمتي", descEn: "Thinking deeply about my task", color: "#16a085", bgCard: "rgba(22, 160, 133, 0.15)" },
  { id: "curious", nameAr: "فضولي ومتساءل", nameEn: "Curious", image: imgCurious, descAr: "أريد أن أتعلم وأستكشف", descEn: "I want to learn and explore", color: "#f39c12", bgCard: "rgba(243, 156, 18, 0.15)" },
  { id: "disappointed", nameAr: "محبط وخائب الأمل", nameEn: "Disappointed", image: imgDisappointed, descAr: "الأمور لم تسر كما تمنيت", descEn: "Things didn't go as I hoped", color: "#7f8c8d", bgCard: "rgba(127, 140, 141, 0.15)" },
  { id: "disgusted", nameAr: "مشمئز ومنزعج", nameEn: "Disgusted", image: imgDisgusted, descAr: "لا أحب هذا الشيء أبداً", descEn: "I really don't like this", color: "#8e44ad", bgCard: "rgba(142, 68, 173, 0.15)" },
  { id: "dreamy", nameAr: "حالم ومتفائل", nameEn: "Dreamy", image: imgDreamy, descAr: "أتخيل أشياء جميلة ورائعة", descEn: "Imagining beautiful things", color: "#3498db", bgCard: "rgba(52, 152, 219, 0.15)" },
  { id: "embarrassed", nameAr: "محرج ومكسوف", nameEn: "Embarrassed", image: imgEmbarrassed, descAr: "أشعر ببعض الإحراج مما حدث", descEn: "Feeling a bit embarrassed", color: "#e84393", bgCard: "rgba(232, 67, 147, 0.15)" },
  { id: "grumpy", nameAr: "متعكر المزاج", nameEn: "Grumpy", image: imgGrumpy, descAr: "مزاجي ليس جيداً الآن", descEn: "Not in a good mood right now", color: "#d35400", bgCard: "rgba(211, 84, 0, 0.15)" },
  { id: "impatient", nameAr: "غير صبور", nameEn: "Impatient", image: imgImpatient, descAr: "أجد صعوبة في الانتظار", descEn: "Finding it hard to wait", color: "#c0392b", bgCard: "rgba(192, 57, 43, 0.15)" },
  { id: "jealous", nameAr: "غيران", nameEn: "Jealous", image: imgJealous, descAr: "أشعر بالغيرة قليلاً", descEn: "Feeling a little jealous", color: "#2ecc71", bgCard: "rgba(46, 204, 113, 0.15)" },
  { id: "lonely", nameAr: "وحيد ومنعزل", nameEn: "Lonely", image: imgLonely, descAr: "أرغب في صديق يلعب معي", descEn: "Want a friend to play with", color: "#34495e", bgCard: "rgba(52, 73, 94, 0.15)" },
  { id: "loved", nameAr: "محبوب وممتن", nameEn: "Loved", image: imgLoved, descAr: "أشعر بحب عائلتي وأصدقائي", descEn: "Feeling the love of my family", color: "#fd79a8", bgCard: "rgba(253, 121, 168, 0.15)" },
  { id: "shy", nameAr: "خجول", nameEn: "Shy", image: imgShy, descAr: "أشعر ببعض الخجل اليوم", descEn: "Feeling a bit shy today", color: "#9b59b6", bgCard: "rgba(155, 89, 182, 0.15)" },
  { id: "sick", nameAr: "مريض ومتألم", nameEn: "Sick", image: imgSick, descAr: "جسدي يؤلمني وأحتاج للطبيب", descEn: "My body hurts, need care", color: "#1abc9c", bgCard: "rgba(26, 188, 156, 0.15)" },
  { id: "sorry", nameAr: "متأسف وندمان", nameEn: "Sorry", image: imgSorry, descAr: "أعتذر لأنني أخطأت", descEn: "I apologize for my mistake", color: "#e67e22", bgCard: "rgba(230, 126, 34, 0.15)" },
  { id: "surprised", nameAr: "متفاجئ ومندهش", nameEn: "Surprised", image: imgSurprised, descAr: "لم أتوقع حدوث هذا!", descEn: "Didn't expect this to happen!", color: "#fdcb6e", bgCard: "rgba(253, 203, 110, 0.15)" }
];

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
    const earnedPoints = 15;

    try {
      if (userEmail) {
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
      
      {onBack && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button onClick={onBack} style={{ padding: "10px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>العودة للألعاب ✕</button>
        </div>
      )}

      <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 30px auto" }}>
        <h1 style={{ color: "white", fontSize: "28px", marginBottom: "10px" }}>
          {lang === "ar" ? "🎨 ركن المشاعر والأحاسيس" : "🎨 Feelings Corner"}
        </h1>
        <p style={{ color: "#a0a0b5", fontSize: "16px" }}>
          {lang === "ar" ? "كيف تشعر اليوم يا بطل؟ اختر البطاقة التي تعبر عنك واكسب نقاطاً!" : "How do you feel today? Choose your card and earn points!"}
        </p>
      </div>

      {!submitted ? (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", 
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
                    padding: "20px 10px",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: isSelected ? `0 0 20px ${emotion.color}` : "0 5px 15px rgba(0,0,0,0.3)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <img 
                    src={emotion.image} 
                    alt={emotion.nameEn} 
                    style={{ 
                      width: "80px", 
                      height: "80px", 
                      objectFit: "contain", 
                      marginBottom: "15px",
                      filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.4))"
                    }} 
                  />
                  <div>
                    <h3 style={{ color: "white", fontSize: "17px", margin: "0 0 8px", fontWeight: "bold" }}>
                      {lang === "ar" ? emotion.nameAr : emotion.nameEn}
                    </h3>
                    <p style={{ color: "#d2dae2", fontSize: "12px", margin: 0, lineHeight: "1.4" }}>
                      {lang === "ar" ? emotion.descAr : emotion.descEn}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

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
                  maxWidth: "800px",
                  margin: "0 auto"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", marginBottom: "15px" }}>
                  <img src={selectedEmotion.image} alt="Selected" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
                  <h3 style={{ color: "white", fontSize: "18px", margin: 0 }}>
                    {lang === "ar" ? `لقد اخترت "${selectedEmotion.nameAr}", هل تريد أن تحكي لنا السبب؟ (اختياري)` : `You chose "${selectedEmotion.nameEn}". Want to share why?`}
                  </h3>
                </div>
                
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
          
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
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