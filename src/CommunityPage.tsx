import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunityPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("مستخدم");

  const [childPosts, setChildPosts] = useState<any[]>([]);
  const [parentPosts, setParentPosts] = useState<any[]>([]);
  const [doctorPosts, setDoctorPosts] = useState<any[]>([]);

  const [activeModal, setActiveModal] = useState<"child" | "parent" | "doctor" | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "child"; 
    const name = localStorage.getItem("userName") || (role === "doctor" ? "طبيب" : role === "parent" ? "ولي أمر" : "بطل");
    
    setUserRole(role);
    setUserName(name);

    const savedChild = JSON.parse(localStorage.getItem("tawasul_child_posts") || "null");
    if (savedChild) setChildPosts(savedChild);
    else setChildPosts([
      { id: 1, name: "ياسين", action: "كسب 50 نقطة في لعبة الذاكرة! 🏆", avatar: "👦" },
      { id: 2, name: "مريم", action: "أنهت ورد القرآن اليوم 📖✨", avatar: "👧" },
      { id: 3, name: "أحمد", action: "رسم لوحة جميلة 🎨", avatar: "👦" }
    ]);

    const savedParent = JSON.parse(localStorage.getItem("tawasul_parent_posts") || "null");
    if (savedParent) setParentPosts(savedParent);
    else setParentPosts([
      { id: 1, author: "أم أحمد", title: "تجاربكم مع تقليل وقت الشاشات؟", comments: 12, time: "منذ ساعتين" },
      { id: 2, author: "أبو يوسف", title: "طريقة فعالة لتحفيز الطفل على الصلاة", comments: 8, time: "منذ 5 ساعات" },
      { id: 3, author: "أم فاطمة", title: "كيف أتعامل مع نوبات الغضب المفاجئة؟", comments: 24, time: "أمس" }
    ]);

    const savedDoctor = JSON.parse(localStorage.getItem("tawasul_doctor_posts") || "null");
    if (savedDoctor) setDoctorPosts(savedDoctor);
    else setDoctorPosts([
      { id: 1, author: "د. أحمد محمود", title: "نقاش حالة: تأخر نطق لعمر 4 سنوات مع تشتت انتباه", replies: 5 },
      { id: 2, author: "د. سارة علي", title: "أحدث الأبحاث في العلاج الوظيفي (PDF مرفق)", replies: 12 },
      { id: 3, author: "د. مصطفى كمال", title: "استشارة للزملاء بخصوص مقياس كارز للتوحد", replies: 8 }
    ]);
  }, []);

  const handleAddChildPost = () => {
    if (!inputValue.trim()) return;
    const newPost = { id: Date.now(), name: userName, action: inputValue, avatar: "👦" };
    const updated = [newPost, ...childPosts];
    setChildPosts(updated);
    localStorage.setItem("tawasul_child_posts", JSON.stringify(updated));
    setActiveModal(null);
    setInputValue("");
  };

  const handleAddParentPost = () => {
    if (!inputValue.trim()) return;
    const newPost = { id: Date.now(), author: userName, title: inputValue, comments: 0, time: "الآن" };
    const updated = [newPost, ...parentPosts];
    setParentPosts(updated);
    localStorage.setItem("tawasul_parent_posts", JSON.stringify(updated));
    setActiveModal(null);
    setInputValue("");
  };

  const handleAddDoctorPost = () => {
    if (!inputValue.trim()) return;
    const docName = userName.startsWith("د.") || userName.startsWith("دكتور") ? userName : `د. ${userName}`;
    const newPost = { id: Date.now(), author: docName, title: inputValue, replies: 0 };
    const updated = [newPost, ...doctorPosts];
    setDoctorPosts(updated);
    localStorage.setItem("tawasul_doctor_posts", JSON.stringify(updated));
    setActiveModal(null);
    setInputValue("");
  };

  return (
    <div className="container" style={{ paddingTop: "140px", paddingBottom: "80px", minHeight: "100vh", direction: "rtl" }}>
      {userRole === "child" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ color: "#fdcb6e", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>🎈 نادي الأبطال 🎈</h2>
          <div style={{ display: "grid", gap: "15px" }}>
            <AnimatePresence>
              {childPosts.map((post) => (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={post.id} style={{ backgroundColor: "rgba(253, 203, 110, 0.1)", padding: "20px", borderRadius: "15px", border: "2px dashed #fdcb6e", display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "40px" }}>{post.avatar}</span>
                  <div>
                    <h3 style={{ color: "white", margin: "0 0 5px 0" }}>البطل {post.name}</h3>
                    <p style={{ color: "#fdcb6e", margin: 0, fontSize: "16px", fontWeight: "bold" }}>{post.action}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button onClick={() => setActiveModal("child")} style={{ width: "100%", marginTop: "20px", padding: "15px", backgroundColor: "#fdcb6e", color: "#2d3436", border: "none", borderRadius: "15px", fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}>
            شارك إنجازك اليوم 🌟
          </button>
        </div>
      )}

      {userRole === "parent" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ color: "#0984e3", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>👩‍👧‍👦 مجتمع الأمهات والآباء 👨‍👦</h2>
          <div style={{ display: "grid", gap: "15px" }}>
            <AnimatePresence>
              {parentPosts.map((post) => (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={post.id} style={{ backgroundColor: "rgba(9, 132, 227, 0.1)", padding: "20px", borderRadius: "15px", border: "1px solid #0984e3" }}>
                  <h3 style={{ color: "white", margin: "0 0 10px 0" }}>{post.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#a0a0b5", fontSize: "14px" }}>
                    <span>بواسطة: {post.author}</span>
                    <span>💬 {post.comments} تعليق | 🕒 {post.time}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button onClick={() => setActiveModal("parent")} style={{ width: "100%", marginTop: "20px", padding: "15px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}>
            + كتابة منشور جديد
          </button>
        </div>
      )}

      {userRole === "doctor" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ color: "#00b894", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>🩺 ملتقى الأطباء والأخصائيين 🧠</h2>
          <div style={{ display: "grid", gap: "15px" }}>
            <AnimatePresence>
              {doctorPosts.map((post) => (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={post.id} style={{ backgroundColor: "rgba(0, 184, 148, 0.1)", padding: "20px", borderRadius: "15px", border: "1px solid #00b894" }}>
                  <h3 style={{ color: "white", margin: "0 0 10px 0" }}>{post.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#a0a0b5", fontSize: "14px" }}>
                    <span style={{ color: "#00b894", fontWeight: "bold" }}>{post.author}</span>
                    <span>💬 {post.replies} ردود الزملاء</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button onClick={() => setActiveModal("doctor")} style={{ width: "100%", marginTop: "20px", padding: "15px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}>
            + طرح نقاش طبي جديد
          </button>
        </div>
      )}

      <AnimatePresence>
        {activeModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ backgroundColor: "#1e272e", padding: "30px", borderRadius: "20px", width: "90%", maxWidth: "500px", border: `2px solid ${activeModal === "child" ? "#fdcb6e" : activeModal === "parent" ? "#0984e3" : "#00b894"}` }}>
              <h3 style={{ color: "white", marginBottom: "20px" }}>
                {activeModal === "child" ? "إنجاز جديد 🌟" : activeModal === "parent" ? "منشور جديد 📝" : "نقاش طبي 🩺"}
              </h3>
              <textarea 
                placeholder={activeModal === "child" ? "ماذا أنجزت اليوم؟" : "اكتب موضوع النقاش هنا..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ width: "100%", padding: "15px", borderRadius: "10px", backgroundColor: "#2d3436", color: "white", border: "none", outline: "none", minHeight: "120px", marginBottom: "20px", fontSize: "16px", resize: "vertical", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button onClick={() => { setActiveModal(null); setInputValue(""); }} style={{ padding: "10px 20px", backgroundColor: "transparent", color: "#ff7675", border: "1px solid #ff7675", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>إلغاء</button>
                <button 
                  onClick={activeModal === "child" ? handleAddChildPost : activeModal === "parent" ? handleAddParentPost : handleAddDoctorPost} 
                  style={{ padding: "10px 30px", backgroundColor: activeModal === "child" ? "#fdcb6e" : activeModal === "parent" ? "#0984e3" : "#00b894", color: activeModal === "child" ? "#2d3436" : "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
                >
                  نشر
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}