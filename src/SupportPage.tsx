import React, { useState, useEffect } from "react";

interface Ticket {
  id: number;
  userName: string;
  userRole: string;
  subject: string;
  message: string;
  status: "مفتوح" | "تم الرد";
  date: string;
  adminReply?: string;
}

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedTickets = JSON.parse(localStorage.getItem("tawasul_support_tickets") || "[]");
    setMyTickets(savedTickets);
  }, []);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const userName = localStorage.getItem("userName") || "مستخدم مجهول";
    const userRole = localStorage.getItem("userRole") || "مستخدم";

    const newTicket: Ticket = {
      id: Date.now(),
      userName,
      userRole,
      subject,
      message,
      status: "مفتوح",
      date: new Date().toLocaleDateString()
    };

    const updatedTickets = [newTicket, ...myTickets];
    setMyTickets(updatedTickets);
    localStorage.setItem("tawasul_support_tickets", JSON.stringify(updatedTickets));

    setSubject("");
    setMessage("");
    setShowSuccess(true);
  };

  return (
    <div className="container" style={{ paddingTop: "140px", paddingBottom: "80px", maxWidth: "800px", margin: "0 auto", direction: "rtl", color: "white" }}>
      <div style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "30px", borderRadius: "24px", border: "2px solid #00b894", marginBottom: "40px" }}>
        <h2 style={{ color: "#00b894", marginBottom: "10px", fontSize: "26px" }}>الدعم الفني والمساعدة 🛠️</h2>
        <p style={{ color: "#a0a0b5", marginBottom: "25px" }}>تواجه مشكلة في المنصة أو لديك استفسار؟ أرسل تذكرتك وسنقوم بالرد عليك في أقرب وقت.</p>

        {showSuccess && (
          <div style={{ backgroundColor: "rgba(0, 184, 148, 0.2)", border: "1px solid #00b894", padding: "15px", borderRadius: "10px", marginBottom: "20px", color: "#00b894", fontWeight: "bold" }}>
            تم إرسال رسالتك بنجاح سيتم متابعة طلبك قريباً. ✅
          </div>
        )}

        <form onSubmit={handleSendTicket} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px" }}>عنوان المشكلة أو الاستفسار</label>
            <input 
              type="text" 
              required
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: مشكلة في تسجيل النقاط أو الدخول للألعاب"
              style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#2d3436", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px" }}>تفاصيل المشكلة</label>
            <textarea 
              required
              rows={4}
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اشرح المشكلة بالتفصيل..."
              style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#2d3436", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          <button type="submit" style={{ padding: "14px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}>
            submit   
          </button>
        </form>
      </div>

      <h3 style={{ color: "white", marginBottom: "20px" }}>تذاكري السابقة</h3>
      <div style={{ display: "grid", gap: "15px" }}>
        {myTickets.map(ticket => (
          <div key={ticket.id} style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <h4 style={{ margin: 0, color: "#fdcb6e" }}>{ticket.subject}</h4>
              <span style={{ color: ticket.status === "مفتوح" ? "#ff7675" : "#00b894", fontWeight: "bold", fontSize: "14px" }}>{ticket.status}</span>
            </div>
            <p style={{ color: "#d2dae2", margin: "0 0 10px 0" }}>{ticket.message}</p>
            {ticket.adminReply && (
              <div style={{ backgroundColor: "rgba(0, 184, 148, 0.1)", padding: "10px", borderRadius: "8px", marginTop: "10px", borderRight: "3px solid #00b894" }}>
                <strong style={{ color: "#00b894" }}>رد الأدمن:</strong> {ticket.adminReply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}