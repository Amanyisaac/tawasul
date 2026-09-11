import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

interface Ticket {
  id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  subject: string;
  message: string;
  status: "مفتوح" | "تم الرد";
  created_at: string;
  admin_reply?: string;
}

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "مستخدم مجهول";
  const userRole = localStorage.getItem("userRole") || "مستخدم";

  // جلب التذاكر الخاصة بالمستخدم الحالي من Supabase
  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (userEmail) {
        query = query.eq("user_email", userEmail);
      } else {
        query = query.eq("user_name", userName);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMyTickets(data || []);
    } catch (err: any) {
      console.error("Error fetching support tickets:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [userEmail, userName]);

  // إرسال تذكرة جديدة إلى Supabase
  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newTicketPayload = {
        user_name: userName,
        user_email: userEmail,
        user_role: userRole,
        subject: subject.trim(),
        message: message.trim(),
        status: "مفتوح",
      };

      const { data, error } = await supabase
        .from("support_tickets")
        .insert([newTicketPayload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMyTickets([data, ...myTickets]);
      }

      setSubject("");
      setMessage("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      alert("حدث خطأ أثناء إرسال التذكرة: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        paddingTop: "140px",
        paddingBottom: "80px",
        maxWidth: "800px",
        margin: "0 auto",
        direction: "rtl",
        textAlign: "right",
        color: "white",
        paddingRight: "20px",
        paddingLeft: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(30, 39, 46, 0.9)",
          padding: "30px",
          borderRadius: "24px",
          border: "2px solid #00b894",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ color: "#00b894", marginBottom: "10px", fontSize: "26px" }}>
          الدعم الفني والمساعدة 🛠️
        </h2>
        <p style={{ color: "#a0a0b5", marginBottom: "25px" }}>
          تواجه مشكلة في المنصة أو لديك استفسار؟ أرسل تذكرتك وسيقوم فريق الإدارة بالرد عليك في أقرب وقت.
        </p>

        {showSuccess && (
          <div
            style={{
              backgroundColor: "rgba(0, 184, 148, 0.2)",
              border: "1px solid #00b894",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
              color: "#00b894",
              fontWeight: "bold",
            }}
          >
            تم إرسال تذكرتك بنجاح وسُجلت في قاعدة البيانات! سيتم الرد عليك قريباً. ✅
          </div>
        )}

        <form onSubmit={handleSendTicket} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px" }}>
              عنوان المشكلة أو الاستفسار
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: مشكلة في تسجيل النقاط أو الدخول للألعاب"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#2d3436",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                outline: "none",
                boxSizing: "border-box",
                fontSize: "15px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#a0a0b5", marginBottom: "8px" }}>
              تفاصيل المشكلة
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اشرح المشكلة بالتفصيل..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#2d3436",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                fontSize: "15px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "14px",
              backgroundColor: isSubmitting ? "#636e72" : "#00b894",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: isSubmitting ? "wait" : "pointer",
            }}
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال التذكرة 🚀"}
          </button>
        </form>
      </div>

      <h3 style={{ color: "white", marginBottom: "20px" }}>تذاكري السابقة</h3>

      {loading ? (
        <p style={{ color: "#a0a0b5", textAlign: "center" }}>جاري تحميل تذاكر الدعم... ⏳</p>
      ) : myTickets.length === 0 ? (
        <div
          style={{
            backgroundColor: "rgba(30, 39, 46, 0.9)",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            color: "#a0a0b5",
          }}
        >
          لا توجد تذاكر مفتوحة حالياً.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {myTickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                backgroundColor: "rgba(30, 39, 46, 0.9)",
                padding: "20px",
                borderRadius: "15px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                <h4 style={{ margin: 0, color: "#fdcb6e", fontSize: "18px" }}>{ticket.subject}</h4>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#a0a0b5" }}>
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("ar-EG") : ""}
                  </span>
                  <span
                    style={{
                      backgroundColor:
                        ticket.status === "مفتوح" ? "rgba(255, 118, 117, 0.2)" : "rgba(0, 184, 148, 0.2)",
                      color: ticket.status === "مفتوح" ? "#ff7675" : "#00b894",
                      padding: "4px 12px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
              <p style={{ color: "#d2dae2", margin: "0 0 10px 0", lineHeight: "1.6" }}>{ticket.message}</p>
              {ticket.admin_reply && (
                <div
                  style={{
                    backgroundColor: "rgba(0, 184, 148, 0.1)",
                    padding: "12px",
                    borderRadius: "8px",
                    marginTop: "12px",
                    borderRight: "3px solid #00b894",
                  }}
                >
                  <strong style={{ color: "#00b894" }}>رد الإدارة: </strong> {ticket.admin_reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}