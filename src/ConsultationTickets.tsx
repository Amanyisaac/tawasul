import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "parent" | "doctor";
  text: string;
  time: string;
}

interface Ticket {
  id: number;
  subject: string;
  doctor: string;
  status: "مفتوح" | "مجدول (Zoom)" | "مغلق";
  messages: Message[];
  meetingTime?: string;
  recordingUrl?: string; 
}

export default function ConsultationTickets() {
  // 👇 حالة جديدة للتحقق هل المستخدم أدمن أم لا
  const [isAdmin, setIsAdmin] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 101,
      subject: "استفسار بخصوص نوبات الغضب",
      doctor: "د. أحمد محمود",
      status: "مفتوح",
      messages: [
        { sender: "parent", text: "مرحباً دكتور، أواجه صعوبة في التعامل مع نوبات الغضب الأخيرة.", time: "10:00 AM" },
        { sender: "doctor", text: "أهلاً بكِ، متى بدأت هذه النوبات تزداد؟", time: "10:30 AM" }
      ]
    }
  ]);

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  
  const [isInCall, setIsInCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const currentDateTime = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  // 👇 التحقق من الـ Role عند تحميل الصفحة
  useEffect(() => {
    const userRole = localStorage.getItem("userRole"); // تأكدي إنك بتسجلي الـ role في صفحة الـ Login
    if (userRole === "admin") {
      setIsAdmin(true);
    }
  }, []);

  const handleCreateTicket = () => {
    if (!newSubject || !newMessage) return;
    const newTicket: Ticket = {
      id: Math.floor(Math.random() * 1000) + 100,
      subject: newSubject,
      doctor: "سيتم تعيين طبيب",
      status: "مفتوح",
      messages: [{ sender: "parent", text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    };
    setTickets([newTicket, ...tickets]);
    setShowNewTicketModal(false);
    setNewSubject("");
    setNewMessage("");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeTicket) return;
    const msg: Message = { sender: "parent", text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updatedTickets = tickets.map(t => {
      if (t.id === activeTicket.id) {
        const updatedTicket = { ...t, messages: [...t.messages, msg] };
        setActiveTicket(updatedTicket); 
        return updatedTicket;
      }
      return t;
    });
    setTickets(updatedTickets);
    setChatInput("");
  };

  const handleScheduleMeeting = () => {
    if (!meetingDate || !activeTicket) return;
    const updatedTickets = tickets.map(t => {
      if (t.id === activeTicket.id) {
        const updatedTicket = { 
          ...t, 
          status: "مجدول (Zoom)" as const, 
          meetingTime: meetingDate,
          messages: [
            ...t.messages, 
            { sender: "parent" as const, text: `تم طلب اجتماع فيديو مدمج بتاريخ: ${meetingDate.replace('T', ' ')}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
        setActiveTicket(updatedTicket);
        return updatedTicket;
      }
      return t;
    });
    setTickets(updatedTickets);
    setMeetingDate("");
  };

  const handleEndCall = () => {
    if (!activeTicket) return;
    const mockRecordingUrl = "https://tawasul.com/recordings/session_" + activeTicket.id + ".mp4";
    const updatedTickets = tickets.map(t => {
      if (t.id === activeTicket.id) {
        const updatedTicket = { 
          ...t, 
          status: "مغلق" as const, 
          recordingUrl: mockRecordingUrl,
          messages: [
            ...t.messages, 
            { sender: "doctor" as const, text: `تم إنهاء الجلسة وحفظ التسجيل بنجاح. 📼`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
        setActiveTicket(updatedTicket);
        return updatedTicket;
      }
      return t;
    });

    setTickets(updatedTickets);
    setIsInCall(false);
  };

  if (isInCall && activeTicket) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", backgroundColor: "#0f1319", zIndex: 9999, display: "flex", flexDirection: "column", direction: "rtl", color: "white" }}>
        <div style={{ padding: "15px 30px", backgroundColor: "#1e272e", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #3d3d3d" }}>
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "white" }}>جلسة: {activeTicket.subject}</h3>
            <p style={{ margin: 0, color: "#00b894", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "red", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span>
              جاري تسجيل الجلسة (Recording...)
            </p>
          </div>
          <button onClick={handleEndCall} style={{ padding: "10px 25px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>إنهاء الجلسة ✕</button>
        </div>

        <div style={{ flex: 1, padding: "20px", display: "flex", gap: "20px", justifyContent: "center", alignItems: "center" }}>
          <div style={{ flex: 1, height: "100%", maxWidth: "600px", backgroundColor: "#2d3436", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", border: "2px solid #00b894" }}>
            <span style={{ fontSize: "80px" }}>👨‍⚕️</span>
            <div style={{ position: "absolute", bottom: "15px", left: "15px", backgroundColor: "rgba(0,0,0,0.6)", padding: "5px 15px", borderRadius: "10px" }}>د. {activeTicket.doctor}</div>
          </div>
          <div style={{ flex: 1, height: "100%", maxWidth: "600px", backgroundColor: "#2d3436", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden" }}>
            {isCamOff ? <span style={{ fontSize: "50px", color: "#a0a0b5" }}>الكاميرا مغلقة</span> : <span style={{ fontSize: "80px" }}>👩‍👦</span>}
            <div style={{ position: "absolute", bottom: "15px", left: "15px", backgroundColor: "rgba(0,0,0,0.6)", padding: "5px 15px", borderRadius: "10px", display: "flex", gap: "10px" }}>
              أنت (ولي الأمر) {isMicMuted && "🔇"}
            </div>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#1e272e", display: "flex", justifyContent: "center", gap: "20px", borderTop: "1px solid #3d3d3d" }}>
          <button onClick={() => setIsMicMuted(!isMicMuted)} style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: isMicMuted ? "#ff7675" : "#34495e", color: "white", border: "none", fontSize: "24px", cursor: "pointer" }}>
            {isMicMuted ? "🔇" : "🎤"}
          </button>
          <button onClick={() => setIsCamOff(!isCamOff)} style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: isCamOff ? "#ff7675" : "#34495e", color: "white", border: "none", fontSize: "24px", cursor: "pointer" }}>
            {isCamOff ? "📷" : "📸"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "140px", paddingBottom: "80px", paddingRight: "20px", paddingLeft: "20px", direction: "rtl", minHeight: "100vh", color: "white" }}>
      {!activeTicket ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h1 style={{ color: "white", margin: "0 0 5px 0", fontSize: "32px" }}>تواصل مع الأطباء 🩺</h1>
              <p style={{ color: "#a0a0b5", fontSize: "16px", margin: 0 }}>نظام الاستشارات والمتابعة السريرية</p>
            </div>
            <button onClick={() => setShowNewTicketModal(true)} style={{ backgroundColor: "#0984e3", color: "white", padding: "12px 24px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>+ استشارة جديدة</button>
          </div>

          <div style={{ display: "grid", gap: "15px" }}>
            {tickets.map(ticket => (
              <div key={ticket.id} onClick={() => setActiveTicket(ticket)} style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "20px", borderRadius: "16px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", color: "white", fontSize: "18px" }}>{ticket.subject} <span style={{ fontSize: "14px", color: "#a0a0b5", marginRight: "10px" }}>#{ticket.id}</span></h3>
                  <p style={{ margin: 0, color: "#00b894", fontWeight: "bold" }}>الطبيب المتابع: {ticket.doctor}</p>
                </div>
                <span style={{ backgroundColor: ticket.status === "مفتوح" ? "rgba(0, 184, 148, 0.2)" : ticket.status === "مجدول (Zoom)" ? "rgba(9, 132, 227, 0.2)" : "rgba(255, 118, 117, 0.2)", color: ticket.status === "مفتوح" ? "#00b894" : ticket.status === "مجدول (Zoom)" ? "#0984e3" : "#ff7675", padding: "8px 20px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" }}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "30px", borderRadius: "24px", border: "2px solid #00b894" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #3d3d3d", paddingBottom: "20px", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h2 style={{ margin: "0 0 8px 0", color: "#00b894", fontSize: "24px" }}>{activeTicket.subject}</h2>
              <p style={{ margin: 0, color: "#a0a0b5", fontSize: "16px" }}>مع: <strong style={{ color: "white" }}>{activeTicket.doctor}</strong></p>
            </div>
            <button onClick={() => setActiveTicket(null)} style={{ padding: "10px 25px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>العودة ✕</button>
          </div>

          {/* 👇 هنا أضفنا شرط (&& isAdmin) عشان ما تظهرش غير للأدمن بس */}
          {activeTicket.status === "مغلق" && activeTicket.recordingUrl && isAdmin && (
            <div style={{ backgroundColor: "rgba(253, 203, 110, 0.1)", border: "1px solid #fdcb6e", padding: "20px", borderRadius: "15px", marginBottom: "25px", textAlign: "center", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, color: "#fdcb6e", fontWeight: "bold", fontSize: "18px" }}>📼 تم حفظ تسجيل الجلسة بنجاح.</p>
              <button onClick={() => alert("سيتم تشغيل ملف الـ MP4 من السيرفر: " + activeTicket.recordingUrl)} style={{ padding: "10px 20px", backgroundColor: "#fdcb6e", color: "#2d3436", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>▶️ مشاهدة التسجيل</button>
            </div>
          )}

          {activeTicket.status !== "مجدول (Zoom)" && activeTicket.status !== "مغلق" && (
            <div style={{ backgroundColor: "rgba(9, 132, 227, 0.1)", border: "1px solid #0984e3", padding: "20px", borderRadius: "15px", marginBottom: "25px", display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "30px" }}>📹</span>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ margin: "0 0 10px 0", fontWeight: "bold", color: "#0984e3", fontSize: "16px" }}>طلب اجتماع فيديو مدمج (Video SDK)</p>
                <input type="datetime-local" value={meetingDate} min={currentDateTime} onChange={(e) => setMeetingDate(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "#2d3436", color: "white", outline: "none", colorScheme: "dark" }} />
              </div>
              <button onClick={handleScheduleMeeting} style={{ padding: "12px 25px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", alignSelf: "flex-end", height: "45px" }}>تأكيد الموعد</button>
            </div>
          )}

          {activeTicket.status === "مجدول (Zoom)" && (
            <div style={{ backgroundColor: "rgba(0, 184, 148, 0.1)", border: "1px solid #00b894", padding: "20px", borderRadius: "15px", marginBottom: "25px", textAlign: "center" }}>
              <p style={{ margin: "0 0 15px", color: "#00b894", fontWeight: "bold", fontSize: "18px" }}>🎥 الميتينج مجدول بتاريخ: {activeTicket.meetingTime?.replace("T", " ")}</p>
              <button onClick={() => setIsInCall(true)} style={{ padding: "12px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>بدء الجلسة داخل المنصة 🎥</button>
            </div>
          )}

          <div style={{ height: "350px", overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "15px" }}>
            {activeTicket.messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === "parent" ? "flex-start" : "flex-end", backgroundColor: msg.sender === "parent" ? "#0984e3" : "#34495e", padding: "15px 20px", borderRadius: "15px", maxWidth: "75%", whiteSpace: "pre-wrap" }}>
                <p style={{ margin: 0, fontSize: "16px", lineHeight: "1.6" }}>{msg.text}</p>
                <span style={{ display: "block", marginTop: "8px", fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: msg.sender === "parent" ? "right" : "left" }}>{msg.time}</span>
              </div>
            ))}
          </div>

          {activeTicket.status !== "مغلق" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="اكتب رسالتك..." style={{ flex: 1, padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "#2d3436", color: "white", outline: "none", fontSize: "16px" }} />
              <button onClick={handleSendMessage} style={{ padding: "15px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>إرسال ✈️</button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showNewTicketModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ backgroundColor: "#1e272e", padding: "30px", borderRadius: "20px", width: "90%", maxWidth: "500px", border: "2px solid #0984e3" }}>
              <h3 style={{ color: "white", marginBottom: "25px", fontSize: "22px" }}>فتح استشارة جديدة 📝</h3>
              <input type="text" placeholder="عنوان الاستشارة" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} style={{ width: "100%", padding: "15px", marginBottom: "20px", borderRadius: "10px", backgroundColor: "#2d3436", color: "white", border: "none", boxSizing: "border-box" }} />
              <textarea placeholder="اشرح المشكلة..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ width: "100%", padding: "15px", borderRadius: "10px", backgroundColor: "#2d3436", color: "white", minHeight: "140px", marginBottom: "25px", border: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                <button onClick={() => setShowNewTicketModal(false)} style={{ padding: "12px 25px", backgroundColor: "transparent", color: "#ff7675", border: "1px solid #ff7675", borderRadius: "10px", cursor: "pointer" }}>إلغاء</button>
                <button onClick={handleCreateTicket} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>إرسال الاستشارة</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}