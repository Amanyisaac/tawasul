import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

interface TaskItem {
  id: number;
  task_title: string;
  task_date: string;
  is_completed: boolean;
}

function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // حالات نافذة النقاط
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "";

  // 1. جلب مهام المستخدم من Supabase
  const fetchTasks = async () => {
    if (!userEmail) return;
    try {
      setLoadingTasks(true);
      const { data, error } = await supabase
        .from("calendar_tasks")
        .select("*")
        .eq("user_email", userEmail)
        .eq("is_completed", false);

      if (error) {
        console.error("Error fetching tasks:", error.message);
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userEmail]);

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

  // تنسيق التاريخ كـ Text للبحث والمقارنة
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  // إضافة مهمة جديدة وحفظها في Supabase
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !selectedDate) return;

    const dateKey = formatDateKey(selectedDate);
    const taskTitle = newTask.trim();

    try {
      const { data, error } = await supabase
        .from("calendar_tasks")
        .insert([
          {
            task_title: taskTitle,
            task_date: dateKey,
            user_email: userEmail,
            is_completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        alert("فشل إضافة المهمة: " + error.message);
      } else if (data) {
        setTasks((prev) => [...prev, data]);
        setNewTask("");
      }
    } catch (err: any) {
      alert("خطأ: " + err.message);
    }
  };

  // حذف مهمة من Supabase
  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from("calendar_tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        alert("فشل حذف المهمة: " + error.message);
      } else {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err: any) {
      alert("خطأ: " + err.message);
    }
  };

  // ✅ إتمام المهمة بنجاح وزيادة النقاط في Supabase
  const completeTask = async (taskId: number) => {
    try {
      // 1. تحديث حالة المهمة كمكتملة
      const { error: taskError } = await supabase
        .from("calendar_tasks")
        .update({ is_completed: true })
        .eq("id", taskId);

      if (taskError) throw taskError;

      // إزالتها من القائمة المعروضة
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      // 2. تحديث النقاط في profiles و heroes
      let currentPoints = parseInt(localStorage.getItem("childPoints") || "0");

      if (userEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("email", userEmail)
          .single();

        if (profile && typeof profile.points === "number") {
          currentPoints = profile.points;
        }
      }

      const newPoints = currentPoints + 10;

      if (userEmail) {
        await supabase
          .from("profiles")
          .update({ points: newPoints })
          .eq("email", userEmail);
      }

      if (userName) {
        await supabase
          .from("heroes")
          .update({ points: newPoints })
          .eq("name", userName);
      }

      localStorage.setItem("childPoints", newPoints.toString());
      setTotalPoints(newPoints);
      setShowPointsModal(true);
    } catch (err: any) {
      console.error("Complete task error:", err);
      // Fallback محلي
      const localPoints = parseInt(localStorage.getItem("childPoints") || "0") + 10;
      localStorage.setItem("childPoints", localPoints.toString());
      setTotalPoints(localPoints);
      setShowPointsModal(true);
    }
  };

  // مهام اليوم المختار
  const currentDayTasks = selectedDate
    ? tasks.filter((t) => t.task_date === formatDateKey(selectedDate))
    : [];

  // إنشاء شبكة الأيام
  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="empty-day" style={{ padding: "10px 5px" }}></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const hasTasks = tasks.some((t) => t.task_date === dateKey);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(date)}
          style={{
            padding: "10px 5px",
            backgroundColor: isToday ? "#00b894" : "rgba(255, 255, 255, 0.05)",
            color: isToday ? "white" : "#e0e0e0",
            borderRadius: "15px",
            cursor: "pointer",
            position: "relative",
            border: isToday ? "none" : "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>{day}</span>
          {hasTasks && (
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#fdcb6e",
                borderRadius: "50%",
                margin: "5px auto 0",
              }}
            ></div>
          )}
        </motion.div>
      );
    }
    return days;
  };

  return (
    <div className="container" style={{ paddingTop: "120px", direction: "rtl", position: "relative", minHeight: "100vh", paddingBottom: "60px" }}>
      {/* زر الرجوع */}
      <div style={{ maxWidth: "800px", margin: "0 auto 15px", display: "flex", justifyContent: "flex-start" }}>
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

      {/* 🌟 نافذة النقاط المنبثقة (Modal) 🌟 */}
      <AnimatePresence>
        {showPointsModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1100,
            }}
          >
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
                direction: "rtl",
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
                كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة لإتمامك المهمة.. <br />
                مجموع نقاطك أصبح:{" "}
                <span style={{ color: "#00b894", fontSize: "24px", fontWeight: "bold" }}>
                  {totalPoints}
                </span>
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
                }}
              >
                استمرار 👍
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="title" style={{ textAlign: "center", color: "white", marginBottom: "25px" }}>
        التقويم والمهام 📅
      </motion.h1>

      <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* رأس التقويم */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "10px" }}>
          <button onClick={nextMonth} style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "#00b894", color: "white", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
            الشهر التالي ◀
          </button>
          <h2 style={{ color: "white", margin: 0, fontSize: "20px" }}>
            {months[month]} {year}
          </h2>
          <button onClick={prevMonth} style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "#00b894", color: "white", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
            ▶ الشهر السابق
          </button>
        </div>

        {/* أيام الأسبوع */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", marginBottom: "15px", textAlign: "center", color: "#fdcb6e", fontWeight: "bold", fontSize: "14px" }}>
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* شبكة الأيام */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
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
                {loadingTasks ? (
                  <p style={{ color: "#aaa", textAlign: "center" }}>جاري تحميل المهام...</p>
                ) : currentDayTasks.length > 0 ? (
                  currentDayTasks.map((task) => (
                    <li
                      key={task.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        padding: "12px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        marginBottom: "10px",
                        borderRadius: "10px",
                      }}
                    >
                      <span style={{ fontSize: "16px", fontWeight: "bold" }}>📝 {task.task_title}</span>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => completeTask(task.id)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#00b894",
                            border: "none",
                            color: "white",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          ✅ إتمام
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "rgba(255,118,117,0.2)",
                            border: "1px solid #ff7675",
                            color: "#ff7675",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                          title="حذف المهمة"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p style={{ color: "#aaa", textAlign: "center", fontSize: "16px" }}>
                    لا توجد مهام لهذا اليوم. أضف مهمة جديدة وابدأ الإنجاز!
                  </p>
                )}
              </ul>

              {/* نموذج إضافة مهمة */}
              <form onSubmit={addTask} style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="اكتب مهمة جديدة..."
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "16px",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 25px",
                    backgroundColor: "#0984e3",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
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