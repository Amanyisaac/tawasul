import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedCardImage, setSelectedCardImage] = useState<string | null>(null);

  // حالات إدارة الدعم الفني
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem("tawasul_all_users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    const tickets = JSON.parse(localStorage.getItem("tawasul_support_tickets") || "[]");
    setSupportTickets(tickets);
  }, []);

  const clearAllUsers = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع سجلات المستخدمين؟")) {
      localStorage.removeItem("tawasul_all_users");
      setUsers([]);
    }
  };

  const handleUpdateDoctorStatus = (email: string, status: "approved" | "rejected") => {
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        return { ...user, doctorStatus: status };
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem("tawasul_all_users", JSON.stringify(updatedUsers));
  };

  const handleAdminReply = (id: number) => {
    if (!replyText.trim()) return;
    const updated = supportTickets.map(t => {
      if (t.id === id) {
        return { ...t, status: "تم الرد", adminReply: replyText };
      }
      return t;
    });
    setSupportTickets(updated);
    localStorage.setItem("tawasul_support_tickets", JSON.stringify(updated));
    setReplyText("");
    setActiveTicketId(null);
  };

  // تصنيف المستخدمين لسهولة العرض
  const pendingDoctors = users.filter(user => user.role === 'doctor' && user.doctorStatus === 'pending');
  const otherUsers = users.filter(user => !(user.role === 'doctor' && user.doctorStatus === 'pending'));

  return (
    <div className="container" style={{ paddingTop: "140px", direction: "rtl", textAlign: "right", minHeight: "100vh", paddingBottom: "80px", paddingRight: "20px", paddingLeft: "20px", position: "relative" }}>
      
      {/* 🌟 نافذة معاينة الكارنيه */}
      <AnimatePresence>
        {selectedCardImage && (
          <div className="video-overlay" onClick={() => setSelectedCardImage(null)} style={{ zIndex: 2000 }}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="video-modal" 
              style={{ padding: "30px", backgroundColor: "#1e272e", maxWidth: "600px", width: "90%", textAlign: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedCardImage(null)}>✕</button>
              <h3 style={{ color: "#00b894", marginBottom: "20px" }}>معاينة كارنيه المختص</h3>
              <div style={{ maxHeight: "60vh", overflow: "auto", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={selectedCardImage} alt="ID Card" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", maxWidth: "1000px", margin: "0 auto 30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "white", marginBottom: "5px" }}>لوحة الإدارة ⚙️</h1>
          <p style={{ color: "#a0a0b5", fontSize: "16px" }}>متابعة طلبات التسجيل، والدعم الفني</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate('/')} style={{ padding: "10px 20px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>الرئيسية</button>
          {users.length > 0 && (
            <button onClick={clearAllUsers} style={{ padding: "10px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>مسح الكل</button>
          )}
        </div>
      </div>

      {/* 👨‍⚕️ سكشن 1: طلبات انضمام المختصين (تحت المراجعة) */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid #fdcb6e" }}>
        <h2 style={{ color: "#fdcb6e", marginBottom: "20px", fontSize: "22px" }}>👨‍⚕️ طلبات انضمام المختصين الجديدة ({pendingDoctors.length})</h2>

        {pendingDoctors.length === 0 ? (
          <p style={{ color: "#a0a0b5", textAlign: "center", fontSize: "16px", padding: "20px 0" }}>لا توجد طلبات جديدة في انتظار المراجعة.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {pendingDoctors.map((doc, index) => (
              <div key={index} style={{ backgroundColor: "rgba(253, 203, 110, 0.1)", padding: "15px 20px", borderRadius: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", border: "1px solid rgba(253, 203, 110, 0.3)" }}>
                <div>
                  <h3 style={{ color: "white", marginBottom: "5px" }}>د. {doc.name}</h3>
                  <p style={{ color: "#a0a0b5", fontSize: "14px", margin: 0 }}>البريد: {doc.email} | تاريخ الطلب: {doc.date}</p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {doc.idCard && (
                    <button onClick={() => setSelectedCardImage(doc.idCard)} style={{ padding: "8px 15px", backgroundColor: "rgba(9, 132, 227, 0.2)", color: "#0984e3", border: "1px solid #0984e3", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
                      عرض الكارنيه 🪪
                    </button>
                  )}
                  <button onClick={() => handleUpdateDoctorStatus(doc.email, "approved")} style={{ padding: "8px 15px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>قبول ✅</button>
                  <button onClick={() => handleUpdateDoctorStatus(doc.email, "rejected")} style={{ padding: "8px 15px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>رفض ❌</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🛠️ سكشن 2: إدارة الدعم الفني والشكاوى */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid #00b894" }}>
        <h2 style={{ color: "#00b894", marginBottom: "20px", fontSize: "22px" }}>💬 متابعة الدعم الفني والشكاوى ({supportTickets.length})</h2>

        {supportTickets.length === 0 ? (
          <p style={{ color: "#a0a0b5", textAlign: "center", fontSize: "16px", padding: "20px 0" }}>لا توجد تذاكر دعم فني في الوقت الحالي.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {supportTickets.map((ticket) => (
              <div key={ticket.id} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h4 style={{ color: "white", margin: "0 0 5px 0" }}>{ticket.subject}</h4>
                    <span style={{ color: "#a0a0b5", fontSize: "13px" }}>المرسل: <strong style={{ color: "#0984e3" }}>{ticket.userName}</strong> ({ticket.userRole}) - {ticket.date}</span>
                  </div>
                  <span style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", backgroundColor: ticket.status === "تم الرد" ? "rgba(0, 184, 148, 0.2)" : "rgba(255, 118, 117, 0.2)", color: ticket.status === "تم الرد" ? "#00b894" : "#ff7675" }}>
                    {ticket.status}
                  </span>
                </div>

                <p style={{ color: "#d2dae2", margin: "10px 0", fontSize: "15px", lineHeight: "1.6" }}>{ticket.message}</p>

                {ticket.adminReply ? (
                  <div style={{ backgroundColor: "rgba(0, 184, 148, 0.1)", padding: "12px", borderRadius: "10px", marginTop: "10px", borderRight: "3px solid #00b894" }}>
                    <strong style={{ color: "#00b894" }}>ردك:</strong> {ticket.adminReply}
                  </div>
                ) : (
                  <div style={{ marginTop: "15px" }}>
                    {activeTicketId === ticket.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <textarea rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "#2d3436", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} />
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={() => handleAdminReply(ticket.id)} style={{ padding: "8px 20px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>إرسال الرد</button>
                          <button onClick={() => { setActiveTicketId(null); setReplyText(""); }} style={{ padding: "8px 15px", backgroundColor: "transparent", color: "#ff7675", border: "1px solid #ff7675", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setActiveTicketId(ticket.id)} style={{ padding: "8px 20px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>الرد على المشكلة ✍️</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📋 سكشن 3: باقي الحسابات المسجلة */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "25px", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "white", marginBottom: "20px", fontSize: "22px" }}>📋 إجمالي الحسابات المفعلة ({otherUsers.length})</h2>

        {otherUsers.length === 0 ? (
          <p style={{ color: "#a0a0b5", textAlign: "center", fontSize: "16px", padding: "20px 0" }}>لا توجد حسابات مفعلة حتى الآن.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {otherUsers.map((user, index) => (
              <div key={index} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px 20px", borderRadius: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <h3 style={{ color: "white", marginBottom: "5px" }}>{user.name}</h3>
                  <p style={{ color: "#a0a0b5", fontSize: "14px", margin: 0 }}>البريد: {user.email}</p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                  <span style={{ padding: "6px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold", backgroundColor: user.role === 'doctor' ? "rgba(0, 184, 148, 0.2)" : user.role === 'parent' ? "rgba(9, 132, 227, 0.2)" : "rgba(232, 67, 147, 0.2)", color: user.role === 'doctor' ? "#00b894" : user.role === 'parent' ? "#0984e3" : "#e84393" }}>
                    {user.role === 'doctor' ? 'مختص / مرشد' : user.role === 'parent' ? 'ولي أمر' : 'طفل'}
                  </span>

                  {user.role === 'doctor' && (
                    <span style={{ padding: "5px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", backgroundColor: user.doctorStatus === "approved" ? "rgba(0, 184, 148, 0.2)" : "rgba(255, 118, 117, 0.2)", color: user.doctorStatus === "approved" ? "#00b894" : "#ff7675" }}>
                      {user.doctorStatus === "approved" ? "مقبول" : "مرفوض"}
                    </span>
                  )}
                  <span style={{ color: "#a0a0b5", fontSize: "12px" }}>{user.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}