import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import "./App.css";

interface Message {
  id?: number;
  ticket_id?: number;
  sender: "parent" | "doctor";
  text: string;
  time: string;
}

interface Ticket {
  id: number;
  subject: string;
  doctor_name: string;
  status: "مفتوح" | "مجدول (Zoom)" | "مغلق";
  messages?: Message[];
  meeting_time?: string;
  recording_url?: string;
  user_email?: string;
  user_name?: string;
}

export default function ConsultationTickets() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>("parent");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<Message[]>([]);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [meetingDate, setMeetingDate] = useState("");

  const [isInCall, setIsInCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const currentDateTime = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // جلب الاستشارات الحية
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const role = localStorage.getItem("userRole") || "parent";
      const email = localStorage.getItem("userEmail") || "";

      let query = supabase
        .from("consultation_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      // لو ولي أمر، يشوف تذاكره فقط، الطبيب أو الأدمن يشوف كل التذاكر
      if (role === "parent" && email) {
        query = query.eq("user_email", email);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      console.error("Error fetching tickets:", err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  // جلب رسائل التذكرة النشطة
  const fetchMessages = async (ticketId: number) => {
    try {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTicketMessages(data || []);
    } catch (err: any) {
      console.error("Error fetching messages:", err.message);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "parent";
    const email = localStorage.getItem("userEmail") || "";
    const name = localStorage.getItem("userName") || "مستخدم";

    setUserRole(role);
    setUserEmail(email);
    setUserName(name);
    if (role === "admin") setIsAdmin(true);

    fetchTickets();
  }, []);

  const handleSelectTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
    fetchMessages(ticket.id);
  };

  // إنشاء استشارة جديدة في Supabase
  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;

    try {
      // 1. إدراج التذكرة في جدول consultation_tickets
      const { data: ticketData, error: ticketError } = await supabase
        .from("consultation_tickets")
        .insert([
          {
            subject: newSubject.trim(),
            doctor_name: "سيتم تعيين طبيب",
            status: "مفتوح",
            user_email: userEmail,
            user_name: userName,
          },
        ])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // 2. إدراج الرسالة الأولى في جدول ticket_messages
      const initialMessageTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      await supabase.from("ticket_messages").insert([
        {
          ticket_id: ticketData.id,
          sender: "parent",
          text: newMessage.trim(),
          time: initialMessageTime,
        },
      ]);

      setTickets([ticketData, ...tickets]);
      setShowNewTicketModal(false);
      setNewSubject("");
      setNewMessage("");
    } catch (err: any) {
      alert("حدث خطأ أثناء فتح الاستشارة: " + err.message);
    }
  };

  // إرسال رسالة في الشات
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeTicket) return;

    const senderRole = userRole === "doctor" ? "doctor" : "parent";
    const msgTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const { data, error } = await supabase
        .from("ticket_messages")
        .insert([
          {
            ticket_id: activeTicket.id,
            sender: senderRole,
            text: chatInput.trim(),
            time: msgTime,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTicketMessages([...ticketMessages, data]);
      setChatInput("");
    } catch (err: any) {
      alert("خطأ أثناء إرسال الرسالة: " + err.message);
    }
  };

  // جدولة موعد الميتينج
  const handleScheduleMeeting = async () => {
    if (!meetingDate || !activeTicket) return;

    try {
      const { error } = await supabase
        .from("consultation_tickets")
        .update({
          status: "مجدول (Zoom)",
          meeting_time: meetingDate,
        })
        .eq("id", activeTicket.id);

      if (error) throw error;

      const scheduleMsgTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const { data: newMsg } = await supabase
        .from("ticket_messages")
        .insert([
          {
            ticket_id: activeTicket.id,
            sender: userRole === "doctor" ? "doctor" : "parent",
            text: `تم جدولة موعد جلسة فيديو بتاريخ: ${meetingDate.replace("T", " ")}`,
            time: scheduleMsgTime,
          },
        ])
        .select()
        .single();

      const updated = { ...activeTicket, status: "مجدول (Zoom)" as const, meeting_time: meetingDate };
      setActiveTicket(updated);
      setTickets(tickets.map((t) => (t.id === activeTicket.id ? updated : t)));
      if (newMsg) setTicketMessages([...ticketMessages, newMsg]);
      setMeetingDate("");
    } catch (err: any) {
      alert("خطأ في جدولة الموعد: " + err.message);
    }
  };

  // إنهاء الجلسة وحفظ رابط التسجيل في Supabase
  const handleEndCall = async () => {
    if (!activeTicket) return;
    const recordingUrl = `https://tawasul.com/recordings/session_${activeTicket.id}.mp4`;

    try {
      await supabase
        .from("consultation_tickets")
        .update({
          status: "مغلق",
          recording_url: recordingUrl,
        })
        .eq("id", activeTicket.id);

      const endMsgTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const { data: endMsg } = await supabase
        .from("ticket_messages")
        .insert([
          {
            ticket_id: activeTicket.id,
            sender: "doctor",
            text: "تم إنهاء الجلسة وتوثيق التسجيل السحابي بنجاح. 📼",
            time: endMsgTime,
          },
        ])
        .select()
        .single();

      const updated = { ...activeTicket, status: "مغلق" as const, recording_url: recordingUrl };
      setActiveTicket(updated);
      setTickets(tickets.map((t) => (t.id === activeTicket.id ? updated : t)));
      if (endMsg) setTicketMessages([...ticketMessages, endMsg]);
      setIsInCall(false);
    } catch (err: any) {
      console.error("Error ending call:", err);
      setIsInCall(false);
    }
  };

  // شاشة مكالمة الفيديو
  if (isInCall && activeTicket) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundColor: "#0f1319",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          direction: "rtl",
          color: "white",
        }}
      >
        <div
          style={{
            padding: "15px 30px",
            backgroundColor: "#1e272e",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #3d3d3d",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "white" }}>جلسة: {activeTicket.subject}</h3>
            <p style={{ margin: 0, color: "#00b894", display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  backgroundColor: "red",
                  borderRadius: "50%",
                }}
              ></span>
              جاري تسجيل الجلسة السحابية (Cloud Recording...)
            </p>
          </div>
          <button
            onClick={handleEndCall}
            style={{
              padding: "10px 25px",
              backgroundColor: "#ff7675",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            إنهاء الجلسة ✕
          </button>
        </div>

        <div style={{ flex: 1, padding: "20px", display: "flex", gap: "20px", justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              height: "100%",
              maxWidth: "600px",
              backgroundColor: "#2d3436",
              borderRadius: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              border: "2px solid #00b894",
            }}
          >
            <span style={{ fontSize: "80px" }}>👨‍⚕️</span>
            <div style={{ position: "absolute", bottom: "15px", left: "15px", backgroundColor: "rgba(0,0,0,0.6)", padding: "5px 15px", borderRadius: "10px" }}>
              {activeTicket.doctor_name}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              height: "100%",
              maxWidth: "600px",
              backgroundColor: "#2d3436",
              borderRadius: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isCamOff ? <span style={{ fontSize: "50px", color: "#a0a0b5" }}>الكاميرا مغلقة</span> : <span style={{ fontSize: "80px" }}>👩‍👦</span>}
            <div style={{ position: "absolute", bottom: "15px", left: "15px", backgroundColor: "rgba(0,0,0,0.6)", padding: "5px 15px", borderRadius: "10px", display: "flex", gap: "10px" }}>
              {userName} {isMicMuted && "🔇"}
            </div>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#1e272e", display: "flex", justifyContent: "center", gap: "20px", borderTop: "1px solid #3d3d3d" }}>
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: isMicMuted ? "#ff7675" : "#34495e",
              color: "white",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            {isMicMuted ? "🔇" : "🎤"}
          </button>
          <button
            onClick={() => setIsCamOff(!isCamOff)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: isCamOff ? "#ff7675" : "#34495e",
              color: "white",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            {isCamOff ? "📷" : "📸"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: "140px",
        paddingBottom: "80px",
        paddingRight: "20px",
        paddingLeft: "20px",
        direction: "rtl",
        textAlign: "right",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {!activeTicket ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h1 style={{ color: "white", margin: "0 0 5px 0", fontSize: "32px" }}>تواصل مع الأطباء 🩺</h1>
              <p style={{ color: "#a0a0b5", fontSize: "16px", margin: 0 }}>نظام الاستشارات والمتابعة السريرية السحابية</p>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              style={{
                backgroundColor: "#0984e3",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              + استشارة جديدة
            </button>
          </div>

          {loadingTickets ? (
            <p style={{ textAlign: "center", color: "#00b894", fontSize: "18px" }}>جاري تحميل الاستشارات السحابية...</p>
          ) : tickets.length === 0 ? (
            <div style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "30px", borderRadius: "16px", textAlign: "center" }}>
              <p style={{ color: "#a0a0b5", fontSize: "16px" }}>لا توجد استشارات حالية. يمكنك بدء استشارة جديدة الآن!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  style={{
                    backgroundColor: "rgba(30, 39, 46, 0.9)",
                    padding: "20px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 10px 0", color: "white", fontSize: "18px" }}>
                      {ticket.subject} <span style={{ fontSize: "14px", color: "#a0a0b5", marginRight: "10px" }}>#{ticket.id}</span>
                    </h3>
                    <p style={{ margin: 0, color: "#00b894", fontWeight: "bold" }}>الطبيب المتابع: {ticket.doctor_name}</p>
                  </div>
                  <span
                    style={{
                      backgroundColor:
                        ticket.status === "مفتوح"
                          ? "rgba(0, 184, 148, 0.2)"
                          : ticket.status === "مجدول (Zoom)"
                          ? "rgba(9, 132, 227, 0.2)"
                          : "rgba(255, 118, 117, 0.2)",
                      color: ticket.status === "مفتوح" ? "#00b894" : ticket.status === "مجدول (Zoom)" ? "#0984e3" : "#ff7675",
                      padding: "8px 20px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "30px", borderRadius: "24px", border: "2px solid #00b894" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #3d3d3d", paddingBottom: "20px", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h2 style={{ margin: "0 0 8px 0", color: "#00b894", fontSize: "24px" }}>{activeTicket.subject}</h2>
              <p style={{ margin: 0, color: "#a0a0b5", fontSize: "16px" }}>مع: <strong style={{ color: "white" }}>{activeTicket.doctor_name}</strong></p>
            </div>
            <button onClick={() => setActiveTicket(null)} style={{ padding: "10px 25px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>العودة ✕</button>
          </div>

          {activeTicket.status === "مغلق" && activeTicket.recording_url && isAdmin && (
            <div style={{ backgroundColor: "rgba(253, 203, 110, 0.1)", border: "1px solid #fdcb6e", padding: "20px", borderRadius: "15px", marginBottom: "25px", textAlign: "center", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, color: "#fdcb6e", fontWeight: "bold", fontSize: "18px" }}>📼 تم توثيق تسجيل الجلسة بنجاح.</p>
              <button onClick={() => alert("سيتم تشغيل ملف الـ MP4 من السيرفر: " + activeTicket.recording_url)} style={{ padding: "10px 20px", backgroundColor: "#fdcb6e", color: "#2d3436", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>▶️ مشاهدة التسجيل</button>
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
              <p style={{ margin: "0 0 15px", color: "#00b894", fontWeight: "bold", fontSize: "18px" }}>🎥 الميتينج مجدول بتاريخ: {activeTicket.meeting_time?.replace("T", " ")}</p>
              <button onClick={() => setIsInCall(true)} style={{ padding: "12px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>بدء الجلسة داخل المنصة 🎥</button>
            </div>
          )}

          {/* صندوق المحادثة الحي */}
          <div style={{ height: "350px", overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "15px" }}>
            {ticketMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === "parent" ? "flex-start" : "flex-end",
                  backgroundColor: msg.sender === "parent" ? "#0984e3" : "#34495e",
                  padding: "15px 20px",
                  borderRadius: "15px",
                  maxWidth: "75%",
                  whiteSpace: "pre-wrap",
                }}
              >
                <p style={{ margin: 0, fontSize: "16px", lineHeight: "1.6" }}>{msg.text}</p>
                <span style={{ display: "block", marginTop: "8px", fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: msg.sender === "parent" ? "right" : "left" }}>
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {activeTicket.status !== "مغلق" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="اكتب رسالتك..."
                style={{
                  flex: 1,
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "#2d3436",
                  color: "white",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
              <button onClick={handleSendMessage} style={{ padding: "15px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
                إرسال ✈️
              </button>
            </div>
          )}
        </div>
      )}

      {/* نافذة فتح استشارة جديدة */}
      <AnimatePresence>
        {showNewTicketModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ backgroundColor: "#1e272e", padding: "30px", borderRadius: "20px", width: "90%", maxWidth: "500px", border: "2px solid #0984e3" }}>
              <h3 style={{ color: "white", marginBottom: "25px", fontSize: "22px" }}>فتح استشارة جديدة 📝</h3>
              <input type="text" placeholder="عنوان الاستشارة" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} style={{ width: "100%", padding: "15px", marginBottom: "20px", borderRadius: "10px", backgroundColor: "#2d3436", color: "white", border: "none", boxSizing: "border-box" }} />
              <textarea placeholder="اشرح المشكلة أو استفسارك السريري..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ width: "100%", padding: "15px", borderRadius: "10px", backgroundColor: "#2d3436", color: "white", minHeight: "140px", marginBottom: "25px", border: "none", boxSizing: "border-box" }} />
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