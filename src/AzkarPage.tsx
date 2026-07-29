import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import azkarData from './azkarData.json';
import "./App.css";

export default function AzkarPage({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'morning' | 'daily'>('morning');
  const [counts, setCounts] = useState<{ [key: number]: number }>({});

  // حالات (States) نافذة النقاط
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const handleIncrement = (id: number, maxCount: number) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      if (current < maxCount) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  // دالة التعامل مع إنهاء الأذكار واستلام الجائزة
  const handleFinishAzkar = () => {
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);
    setShowPointsModal(true);
  };

  const currentList = activeTab === 'morning' ? azkarData.morningEvening : azkarData.dailyDuas;

  return (
    <div className="container" style={{ paddingTop: "120px", direction: "rtl", textAlign: "center", minHeight: "100vh", paddingBottom: "50px", position: "relative" }}>
      
      {/* 🌟 نافذة النقاط المنبثقة (Modal) 🌟 */}
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
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة لقراءتك الأذكار.. <br/>
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
                  boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)"
                }}
              >
                استمرار 👍
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* عنوان الصفحة الرئيسي */}
      <h1 style={{ fontSize: "36px", color: "white", marginBottom: "10px" }}>حصن البطل 🤲</h1>
      <p style={{ color: "#a0a0b5", fontSize: "16px", marginBottom: "20px" }}>اقرأ الأذكار واكسب الحسنات كل يوم!</p>

      {/* زر العودة بارز وواضح */}
      <div style={{ maxWidth: "800px", margin: "0 auto 25px", padding: "0 20px", display: "flex", justifyContent: "flex-start" }}>
        <button 
          onClick={handleBackClick} 
          style={{ 
            padding: "10px 24px", 
            backgroundColor: "#ff7675", 
            color: "white", 
            border: "none", 
            borderRadius: "14px", 
            cursor: "pointer", 
            fontWeight: "bold",
            fontSize: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }}
        >
          ✕ العودة للرئيسية
        </button>
      </div>

      {/* أزرار التنقل بين الأقسام */}
      <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "30px" }}>
        <button 
          onClick={() => setActiveTab('morning')} 
          style={{ padding: "12px 25px", backgroundColor: activeTab === 'morning' ? "#00b894" : "rgba(30, 39, 46, 0.8)", color: "white", border: "2px solid #00b894", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
        >
          ☀️ أذكار الصباح والمساء
        </button>
        <button 
          onClick={() => setActiveTab('daily')} 
          style={{ padding: "12px 25px", backgroundColor: activeTab === 'daily' ? "#0984e3" : "rgba(30, 39, 46, 0.8)", color: "white", border: "2px solid #0984e3", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
        >
          🌟 الأدعية اليومية
        </button>
      </div>

      {/* قائمة الأذكار */}
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px", padding: "0 20px" }}>
        {currentList.map((item) => {
          const currentCount = counts[item.id] || 0;
          const isCompleted = currentCount >= item.count;

          return (
            <motion.div 
              key={item.id}
              whileHover={{ scale: 1.01 }}
              style={{ 
                backgroundColor: "rgba(30, 39, 46, 0.9)", 
                padding: "25px", 
                borderRadius: "20px", 
                border: isCompleted ? "2px solid #00b894" : "2px solid rgba(255,255,255,0.1)",
                textAlign: "right",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ color: "#fdcb6e", fontSize: "20px", margin: 0 }}>{item.title}</h3>
                <span style={{ fontSize: "12px", backgroundColor: "rgba(255,255,255,0.1)", color: "#a0a0b5", padding: "4px 10px", borderRadius: "10px" }}>{item.category}</span>
              </div>

              <p style={{ color: "white", fontSize: "18px", lineHeight: "1.6", marginBottom: "20px" }}>{item.text}</p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: isCompleted ? "#00b894" : "#a0a0b5", fontWeight: "bold" }}>
                  {isCompleted ? "🎉 أحسنت! أتممت الذكر" : `المطلوب: ${item.count} مرات`}
                </span>

                <button 
                  onClick={() => handleIncrement(item.id, item.count)}
                  style={{ 
                    padding: "10px 25px", 
                    backgroundColor: isCompleted ? "#00b894" : "#e84393", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "15px", 
                    cursor: isCompleted ? "default" : "pointer", 
                    fontWeight: "bold",
                    fontSize: "16px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                  }}
                >
                  {isCompleted ? "✓ تم" : `ضغط (${currentCount} / ${item.count})`}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* 🎁 زرار إنهاء الأذكار لاستلام النقاط 🎁 */}
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "30px" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinishAzkar}
            style={{
              padding: "15px 40px",
              backgroundColor: "#0984e3",
              color: "white",
              border: "none",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 8px 15px rgba(9, 132, 227, 0.3)"
            }}
          >
            أتممت الأذكار واستلام الجائزة 🎁
          </motion.button>
        </div>

      </div>
    </div>
  );
}