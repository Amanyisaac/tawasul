import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTask, setNewTask] = useState("");
  
  // حالات (States) نافذة النقاط
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  
  // 1. قراءة المهام من Local Storage عند تحميل الصفحة
  const [tasks, setTasks] = useState<Record<string, string[]>>(() => {
    const savedTasks = localStorage.getItem("tawasul_calendar_tasks");
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    // مهام افتراضية لو التطبيق بيفتح لأول مرة
    return {
      "2026-7-18": ["قراءة سورة الكهف", "مراجعة مشروع React", "أداء الصلاة في وقتها"],
    };
  });

  // 2. حفظ المهام في Local Storage كل ما تتغير
  useEffect(() => {
    localStorage.setItem("tawasul_calendar_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const daysOfWeek = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  // حساب أيام الشهر
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // دوال التنقل بين الشهور
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // تنسيق التاريخ كـ Text عشان نستخدمه كمفتاح (Key) للمهام
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  // إضافة مهمة جديدة
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    setTasks({
      ...tasks,
      [dateKey]: [...(tasks[dateKey] || []), newTask]
    });
    setNewTask("");
  };

  // حذف مهمة بدون نقاط (لو الطفل حابب يمسحها بس)
  const deleteTask = (dateKey: string, taskIndex: number) => {
    const updatedTasks = tasks[dateKey].filter((_, index) => index !== taskIndex);
    setTasks({
      ...tasks,
      [dateKey]: updatedTasks
    });
  };

  // ✅ إتمام المهمة بنجاح واستلام النقاط
  const completeTask = (dateKey: string, taskIndex: number) => {
    // 1. حذف المهمة من القائمة
    deleteTask(dateKey, taskIndex);
    
    // 2. حساب وإضافة النقاط
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);
    
    // 3. إظهار نافذة الجائزة
    setShowPointsModal(true);
  };

  // إنشاء مصفوفة بأيام الشهر مع الأيام الفارغة في البداية
  const renderDays = () => {
    const days = [];
    // أيام فارغة قبل بداية الشهر
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="empty-day" style={{ padding: "20px" }}></div>);
    }
    // أيام الشهر الفعلية
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const hasTasks = tasks[dateKey] && tasks[dateKey].length > 0;
      
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(date)}
          style={{
            padding: "20px",
            backgroundColor: isToday ? "#00b894" : "rgba(255, 255, 255, 0.05)",
            color: isToday ? "white" : "#e0e0e0",
            borderRadius: "15px",
            cursor: "pointer",
            position: "relative",
            border: isToday ? "none" : "1px solid rgba(255,255,255,0.1)",
            textAlign: "center"
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>{day}</span>
          {/* نقطة صغيرة تدل إن اليوم ده فيه مهام */}
          {hasTasks && (
            <div style={{
              width: "8px", height: "8px", backgroundColor: "#fdcb6e",
              borderRadius: "50%", margin: "5px auto 0"
            }}></div>
          )}
        </motion.div>
      );
    }
    return days;
  };

  return (
    <div className="container" style={{ paddingTop: "100px", direction: "rtl", position: "relative" }}>
      
      {/* 🌟 نافذة النقاط المنبثقة (Modal) 🌟 */}
      <AnimatePresence>
        {showPointsModal && (
          <div style={{ 
            position: "fixed", 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(0, 0, 0, 0.85)", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            zIndex: 1100 // أعلى من نافذة المهام
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
                boxShadow: "0 20px 50px rgba(0, 184, 148, 0.3)",
                direction: "rtl"
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
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة لإتمامك المهمة.. <br/>
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

      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="title"
      >
        التقويم والمهام 📅
      </motion.h1>

      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "rgba(0,0,0,0.5)", padding: "30px", borderRadius: "20px" }}>
        {/* رأس التقويم (الشهر والسنة) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <button onClick={nextMonth} style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "#00b894", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>الشهر التالي ◀</button>
          <h2 style={{ color: "white", margin: 0 }}>{months[month]} {year}</h2>
          <button onClick={prevMonth} style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "#00b894", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>▶ الشهر السابق</button>
        </div>

        {/* أيام الأسبوع */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", marginBottom: "15px", textAlign: "center", color: "#fdcb6e", fontWeight: "bold" }}>
          {daysOfWeek.map(day => <div key={day}>{day}</div>)}
        </div>

        {/* شبكة الأيام */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
          {renderDays()}
        </div>
      </div>

      {/* Modal إضافة وعرض المهام */}
      <AnimatePresence>
        {selectedDate && (
          <div className="video-overlay" onClick={() => setSelectedDate(null)} style={{ zIndex: 1000 }}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="video-modal" 
              style={{ padding: "30px", direction: "rtl", textAlign: "right", backgroundColor: "#2d3436", width: "90%", maxWidth: "550px" }} 
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedDate(null)}>✕</button>
              <h2 style={{ color: "#00b894", borderBottom: "1px solid #555", paddingBottom: "10px", marginBottom: "20px" }}>
                مهام يوم: {selectedDate.getDate()} {months[selectedDate.getMonth()]}
              </h2>

              {/* قائمة المهام */}
              <ul style={{ listStyle: "none", padding: 0, color: "white", marginBottom: "20px", maxHeight: "250px", overflowY: "auto" }}>
                {(tasks[formatDateKey(selectedDate)] || []).length > 0 ? (
                  tasks[formatDateKey(selectedDate)].map((task, index) => (
                    <li key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "rgba(255,255,255,0.1)", marginBottom: "10px", borderRadius: "10px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "bold" }}>📝 {task}</span>
                      
                      {/* أزرار الإتمام والحذف */}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                          onClick={() => completeTask(formatDateKey(selectedDate), index)}
                          style={{ padding: "8px 12px", backgroundColor: "#00b894", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
                        >
                          ✅ إتمام
                        </button>
                        <button 
                          onClick={() => deleteTask(formatDateKey(selectedDate), index)}
                          style={{ padding: "8px 12px", backgroundColor: "rgba(255,118,117,0.2)", border: "1px solid #ff7675", color: "#ff7675", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
                          title="حذف المهمة"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p style={{ color: "#aaa", textAlign: "center", fontSize: "16px" }}>لا توجد مهام لهذا اليوم. أضف مهمة جديدة وابدأ الإنجاز!</p>
                )}
              </ul>

              {/* نموذج إضافة مهمة */}
              <form onSubmit={addTask} style={{ display: "flex", gap: "10px" }}>
                <input 
                  type="text" 
                  value={newTask} 
                  onChange={(e) => setNewTask(e.target.value)} 
                  placeholder="اكتب مهمة جديدة..."
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", outline: "none", fontFamily: "inherit", fontSize: "16px" }}
                />
                <button type="submit" style={{ padding: "12px 25px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
                  ➕ إضافة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CalendarPage;