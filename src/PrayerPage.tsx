import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

// استيراد صور الخطوات
import sallah1 from "./assets/sallah1.png";
import sallah2 from "./assets/sallah2.png";
import sallah3 from "./assets/sallah3.png";
import sallah4 from "./assets/sallah4.png";
import sallah5 from "./assets/sallah5.png";
import sallah6 from "./assets/sallah6.png";
import sallah7 from "./assets/sallah7.png";
import sallah8 from "./assets/sallah8.png";

const prayerSteps = [
  { id: 1, title: "تكبيرة الإحرام", desc: "الوقوف واستقبال القبلة، ثم رفع اليدين بمحاذاة الأذنين وقول: (الله أكبر).", img: sallah1 },
  { id: 2, title: "القيام وقراءة الفاتحة", desc: "وضع اليد اليمنى فوق اليسرى على الصدر، وقراءة سورة الفاتحة وما تيسر من القرآن.", img: sallah2 },
  { id: 3, title: "الركوع", desc: "الانحناء بحيث يستوي الظهر، ووضع اليدين على الركبتين، وقول: (سبحان ربي العظيم) ثلاث مرات.", img: sallah3 },
  { id: 4, title: "الرفع من الركوع", desc: "الاعتدال واقفاً باطمئنان وقول: (سمع الله لمن حمده، ربنا ولك الحمد).", img: sallah4 },
  { id: 5, title: "السجود", desc: "النزول للأرض والسجود على الأعضاء السبعة، وقول: (سبحان ربي الأعلى) ثلاث مرات.", img: sallah5 },
  { id: 6, title: "الجلوس بين السجدتين", desc: "الرفع من السجود والجلوس باطمئنان، وقول: (رب اغفر لي، وارحمني).", img: sallah6 },
  { id: 7, title: "التشهد", desc: "الجلوس بعد السجدة الثانية لقراءة التشهد، مع الإشارة بالسبابة عند ذكر الله.", img: sallah7 },
  { id: 8, title: "التسليم", desc: "الالتفات يميناً وقول (السلام عليكم ورحمة الله)، ثم يساراً وقول مثلها لإنهاء الصلاة.", img: sallah8 },
];

function PrayerPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isSavingPoints, setIsSavingPoints] = useState(false);

  // تسجيل النقاط سحابياً في Supabase عند إتمام الصلاة
  const completePrayerAndSavePoints = async () => {
    setIsCompleted(true);
    setIsSavingPoints(true);

    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const localPoints = parseInt(localStorage.getItem("childPoints") || "0");
    let currentDbPoints = localPoints;

    try {
      if (userEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("email", userEmail)
          .single();

        if (profile && typeof profile.points === "number") {
          currentDbPoints = profile.points;
        }
      }

      const updatedPoints = currentDbPoints + 10;

      // تحديث جدول profiles
      if (userEmail) {
        await supabase
          .from("profiles")
          .update({ points: updatedPoints })
          .eq("email", userEmail);
      }

      // تحديث جدول heroes للوحة الشرف
      if (userName) {
        await supabase
          .from("heroes")
          .update({ points: updatedPoints })
          .eq("name", userName);
      }

      localStorage.setItem("childPoints", updatedPoints.toString());
      setTotalPoints(updatedPoints);
      setTimeout(() => setShowPointsModal(true), 400);
    } catch (err) {
      console.error("Error updating prayer points:", err);
      const fallbackPoints = localPoints + 10;
      localStorage.setItem("childPoints", fallbackPoints.toString());
      setTotalPoints(fallbackPoints);
      setTimeout(() => setShowPointsModal(true), 400);
    } finally {
      setIsSavingPoints(false);
    }
  };

  const nextStep = () => {
    if (currentStep < prayerSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completePrayerAndSavePoints();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const restartPrayer = () => {
    setIsCompleted(false);
    setCurrentStep(0);
    setShowPointsModal(false);
  };

  return (
    <div className="container" style={{ paddingTop: "100px", direction: "rtl", textAlign: "center", minHeight: "100vh", position: "relative", paddingBottom: "60px" }}>
      
      {/* زر العودة السريع */}
      <div style={{ maxWidth: "700px", margin: "0 auto 15px", display: "flex", justifyContent: "flex-start", padding: "0 15px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 20px",
            backgroundColor: "#ff7675",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ✕ العودة للرئيسية
        </button>
      </div>

      <AnimatePresence>
        {showPointsModal && (
          <div style={{ 
            position: "fixed", 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(0, 0, 0, 0.8)", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            zIndex: 1000 
          }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              style={{ 
                backgroundColor: "#1e272e", 
                padding: "40px", 
                borderRadius: "24px", 
                border: "2px solid #00b894", 
                textAlign: "center", 
                maxWidth: "400px",
                width: "90%",
                boxShadow: "0 20px 50px rgba(0, 184, 148, 0.3)"
              }}
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: "60px", marginBottom: "15px" }}
              >
                🏅
              </motion.div>
              <h2 style={{ color: "white", marginBottom: "15px", fontSize: "28px" }}>عاش يا بطل! 🦸‍♂️</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة ومسجلة سحابياً لتعلمك الصلاة.. <br/>
                مجموع نقاطك أصبح: <span style={{ color: "#00b894", fontSize: "24px", fontWeight: "bold" }}>{totalPoints}</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPointsModal(false)}
                style={{ 
                  padding: "12px 35px", 
                  backgroundColor: "#00b894", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "15px", 
                  fontSize: "18px", 
                  cursor: "pointer", 
                  fontWeight: "bold",
                  boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)",
                  width: "100%"
                }}
              >
                استمرار 👍
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="title"
        style={{ fontSize: "40px", marginBottom: "10px", color: "white" }}
      >
        تعلم الصلاة 🕌
      </motion.h1>

      <p style={{ color: "#a0a0b5", fontSize: "18px", marginBottom: "40px", padding: "0 15px" }}>
        خطوة بخطوة لنتعلم كيف نصلي بخشوع ونكسب النقاط
      </p>

      {!isCompleted && (
        <div style={{ maxWidth: "700px", width: "90%", margin: "0 auto 40px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", height: "8px", overflow: "hidden" }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / prayerSteps.length) * 100}%` }}
            style={{ height: "100%", backgroundColor: "#00b894", borderRadius: "20px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {isCompleted ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          style={{
            maxWidth: "600px",
            width: "90%",
            margin: "0 auto",
            padding: "50px 20px",
            backgroundColor: "rgba(0, 184, 148, 0.1)",
            borderRadius: "30px",
            border: "2px solid #00b894",
            boxShadow: "0 20px 40px rgba(0, 184, 148, 0.2)"
          }}
        >
          <motion.div 
            initial={{ y: -20 }} 
            animate={{ y: [0, -20, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: "80px", marginBottom: "20px" }}
          >
            🕋✨
          </motion.div>
          <h2 style={{ color: "#00b894", fontSize: "32px", marginBottom: "20px", fontWeight: "bold" }}>
            تقبل الله صلاتك!
          </h2>
          <p style={{ color: "white", fontSize: "18px", lineHeight: "1.8", marginBottom: "40px" }}>
            لقد أتممت خطوات الصلاة بنجاح. تذكر دائماً أن الصلاة هي نور حياتنا وصلتنا الدائمة بالله عز وجل. بارك الله فيك!
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartPrayer}
            style={{ 
              padding: "15px 30px", 
              fontSize: "18px", 
              fontWeight: "bold",
              backgroundColor: "#00b894", 
              color: "white", 
              border: "none", 
              borderRadius: "50px", 
              cursor: "pointer",
              boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)"
            }}
          >
            إعادة الخطوات 🔄
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div style={{ position: "relative", minHeight: "450px", maxWidth: "700px", width: "95%", margin: "0 auto", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ 
                  width: "100%", 
                  padding: "40px 20px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center",
                  backgroundColor: "rgba(30, 39, 46, 0.8)",
                  borderRadius: "24px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ 
                  width: "180px", 
                  height: "180px", 
                  backgroundColor: "rgba(255, 255, 255, 0.1)", 
                  borderRadius: "50%", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  marginBottom: "30px",
                  border: "4px solid #00b894",
                  boxShadow: "0 10px 20px rgba(0, 184, 148, 0.2)",
                  overflow: "hidden"
                }}>
                  <img 
                    src={prayerSteps[currentStep].img} 
                    alt={prayerSteps[currentStep].title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span style="font-size: 80px;">🕌</span>`;
                    }}
                  />
                </div>
                
                <h2 style={{ color: "white", fontSize: "24px", marginBottom: "15px", fontWeight: "bold" }}>
                  <span style={{ color: "#00b894", marginRight: "10px" }}>{currentStep + 1}.</span> 
                  {prayerSteps[currentStep].title}
                </h2>
                <p style={{ color: "#d2dae2", fontSize: "18px", lineHeight: "1.8", maxWidth: "95%" }}>
                  {prayerSteps[currentStep].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px", marginTop: "40px", paddingBottom: "50px" }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSavingPoints}
              onClick={nextStep} 
              style={{ 
                padding: "15px 30px", 
                fontSize: "18px", 
                fontWeight: "bold",
                backgroundColor: isSavingPoints ? "#636e72" : "#00b894", 
                color: "white", 
                border: "none", 
                borderRadius: "50px", 
                cursor: isSavingPoints ? "wait" : "pointer",
                boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)",
                flex: "1 1 200px",
                maxWidth: "300px"
              }}
            >
              {currentStep === prayerSteps.length - 1 ? (isSavingPoints ? "جاري الحفظ..." : "أتممت الصلاة ✨") : "الخطوة التالية ◀"}
            </motion.button>

            <motion.button 
              whileHover={{ scale: currentStep === 0 ? 1 : 1.05 }}
              whileTap={{ scale: currentStep === 0 ? 1 : 0.95 }}
              onClick={prevStep} 
              disabled={currentStep === 0}
              style={{ 
                padding: "15px 30px", 
                fontSize: "18px", 
                fontWeight: "bold",
                backgroundColor: "transparent", 
                color: currentStep === 0 ? "#555" : "#00b894", 
                border: `2px solid ${currentStep === 0 ? "#555" : "#00b894"}`, 
                borderRadius: "50px", 
                cursor: currentStep === 0 ? "not-allowed" : "pointer",
                flex: "1 1 200px",
                maxWidth: "300px"
              }}
            >
              ▶ السابق
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}

export default PrayerPage;