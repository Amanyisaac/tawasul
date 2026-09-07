import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// 🌟 استيراد الصور بشكل صحيح عشان تترفع مع المشروع 🌟
import wudu1 from "./assets/wudu1.png";
import wudu2 from "./assets/wudu2.png";
import wudu3 from "./assets/wudu3.png";
import wudu4 from "./assets/wudu4.png";
import wudu5 from "./assets/wudu5.png";
import wudu6 from "./assets/wudu6.png";
import wudu7 from "./assets/wudu7.png";
import wudu8 from "./assets/wudu8.png";
import wudu9 from "./assets/wudu9.png";
import wudu10 from "./assets/wudu10.png";

// بيانات خطوات الوضوء بالترتيب مع استخدام المتغيرات
const wuduSteps = [
  { id: 1, title: "النية والبسملة", desc: "أن تنوي الوضوء بقلبك، ثم تقول: بسم الله.", img: wudu1 },
  { id: 2, title: "غسل الكفين", desc: "غسل الكفين إلى الرسغين ثلاث مرات.", img: wudu2 },
  { id: 3, title: "المضمضة", desc: "إدخال الماء في الفم والمضمضة ثلاث مرات.",   img: wudu3 },
  { id: 4, title: "الاستنشاق والاستنثار", desc: "جذب الماء بالأنف وإخراجه ثلاث مرات.",  img: wudu4 },
  { id: 5, title: "غسل الوجه", desc: "غسل الوجه بالكامل من منبت الشعر إلى الذقن ثلاث مرات.", img: wudu5 },
  { id: 6, title: "غسل اليدين للمرفقين", desc: "غسل اليد اليمنى ثم اليسرى إلى المرفقين ثلاث مرات.", img: wudu6 },
  { id: 7, title: "مسح الرأس", desc: "مسح الرأس بالماء مرة واحدة من الأمام للخلف ثم العودة.", img: wudu7 },
  { id: 8, title: "مسح الأذنين", desc: "مسح الأذنين من الداخل والخارج بالماء مرة واحدة.",   img: wudu8 },
  { id: 9, title: "غسل الرجلين", desc: "غسل الرجل اليمنى ثم اليسرى مع الكعبين ثلاث مرات.", img: wudu9 },
  { id: 10, title: "دعاء ما بعد الوضوء", desc: "أشهد أن لا إله إلا الله، وأشهد أن محمداً عبده ورسوله. اللهم اجعلني من التوابين واجعلني من المتطهرين.", img: wudu10 }
];

function WuduPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const nextStep = () => {
    if (currentStep < wuduSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      
      const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
      const newPoints = currentPoints + 10;
      localStorage.setItem("childPoints", newPoints.toString());
      setTotalPoints(newPoints);
      
      setTimeout(() => {
        setShowPointsModal(true);
      }, 500);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const restartWudu = () => {
    setIsCompleted(false);
    setCurrentStep(0);
    setShowPointsModal(false);
  };

  return (
    <div className="container" style={{ paddingTop: "100px", direction: "rtl", textAlign: "center", minHeight: "100vh", position: "relative" }}>
      
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
              /* 👇 إضافة عرض 90% للمودال */
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
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة لتعلمك الوضوء.. <br/>
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
        style={{ fontSize: "40px", marginBottom: "10px" }}
      >
        تعلم الوضوء 💧
      </motion.h1>

      <p style={{ color: "#a0a0b5", fontSize: "18px", marginBottom: "40px", padding: "0 15px" }}>
        خطوة بخطوة لنتعلم كيف نتوضأ بشكل صحيح
      </p>

      {!isCompleted && (
        <div style={{ maxWidth: "700px", width: "90%", margin: "0 auto 40px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", height: "8px", overflow: "hidden" }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / wuduSteps.length) * 100}%` }}
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
            🌟🎉
          </motion.div>
          <h2 style={{ color: "#00b894", fontSize: "32px", marginBottom: "20px", fontWeight: "bold" }}>
            ما شاء الله يا بطل!
          </h2>
          <p style={{ color: "white", fontSize: "18px", lineHeight: "1.8", marginBottom: "40px" }}>
            لقد أتممت خطوات الوضوء بنجاح. أنت الآن طاهرٌ ومستعدٌ للقاء الله عز وجل في الصلاة. تقبل الله منك! ✨
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartWudu}
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
                    src={wuduSteps[currentStep].img} 
                    alt={wuduSteps[currentStep].title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span style="font-size: 80px;">💧</span>`;
                    }}
                  />
                </div>
                
                <h2 style={{ color: "white", fontSize: "24px", marginBottom: "15px", fontWeight: "bold" }}>
                  <span style={{ color: "#00b894", marginRight: "10px" }}>{currentStep + 1}.</span> 
                  {wuduSteps[currentStep].title}
                </h2>
                <p style={{ color: "#d2dae2", fontSize: "18px", lineHeight: "1.8", maxWidth: "95%" }}>
                  {wuduSteps[currentStep].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 👇 إضافة flexWrap لأزرار التحكم */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px", marginTop: "40px", paddingBottom: "50px" }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep} 
              style={{ 
                padding: "15px 30px", 
                fontSize: "18px", 
                fontWeight: "bold",
                backgroundColor: "#00b894", 
                color: "white", 
                border: "none", 
                borderRadius: "50px", 
                cursor: "pointer",
                boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)",
                flex: "1 1 200px",
                maxWidth: "300px"
              }}
            >
              {currentStep === wuduSteps.length - 1 ? "أتممت الوضوء ✨" : "الخطوة التالية ◀"}
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

export default WuduPage;