import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import "./App.css";

interface PostItem {
  id: number;
  created_at?: string;
  author: string;
  content: string;
  category: "child" | "parent" | "doctor";
  avatar?: string;
  comments_count?: number;
}

export default function CommunityPage() {
  const [userRole, setUserRole] = useState<string>("child");
  const [userName, setUserName] = useState<string>("مستخدم");

  const [childPosts, setChildPosts] = useState<PostItem[]>([]);
  const [parentPosts, setParentPosts] = useState<PostItem[]>([]);
  const [doctorPosts, setDoctorPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<"child" | "parent" | "doctor" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // جلب المنشورات الحية من Supabase
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error.message);
        loadFallbacks();
      } else if (data && data.length > 0) {
        setChildPosts(data.filter((p: PostItem) => p.category === "child"));
        setParentPosts(data.filter((p: PostItem) => p.category === "parent"));
        setDoctorPosts(data.filter((p: PostItem) => p.category === "doctor"));
      } else {
        loadFallbacks();
      }
    } catch (err) {
      console.error("Error:", err);
      loadFallbacks();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbacks = () => {
    setChildPosts([
      { id: 1, author: "ياسين", content: "كسب 50 نقطة في لعبة الذاكرة! 🏆", avatar: "👦", category: "child" },
      { id: 2, author: "مريم", content: "أنهت ورد القرآن اليوم 📖✨", avatar: "👧", category: "child" },
      { id: 3, author: "أحمد", content: "رسم لوحة جميلة 🎨", avatar: "👦", category: "child" },
    ]);

    setParentPosts([
      { id: 101, author: "أم أحمد", content: "تجاربكم مع تقليل وقت الشاشات؟", comments_count: 12, category: "parent" },
      { id: 102, author: "أبو يوسف", content: "طريقة فعالة لتحفيز الطفل على الصلاة", comments_count: 8, category: "parent" },
      { id: 103, author: "أم فاطمة", content: "كيف أتعامل مع نوبات الغضب المفاجئة؟", comments_count: 24, category: "parent" },
    ]);

    setDoctorPosts([
      { id: 201, author: "د. أحمد محمود", content: "نقاش حالة: تأخر نطق لعمر 4 سنوات مع تشتت انتباه", comments_count: 5, category: "doctor" },
      { id: 202, author: "د. سارة علي", content: "أحدث الأبحاث في العلاج الوظيفي (متاح للنقاش)", comments_count: 12, category: "doctor" },
      { id: 203, author: "د. مصطفى كمال", content: "استشارة للزملاء بخصوص مقياس كارز للتوحد", comments_count: 8, category: "doctor" },
    ]);
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "child";
    const name = localStorage.getItem("userName") || (role === "doctor" ? "طبيب" : role === "parent" ? "ولي أمر" : "بطل");

    setUserRole(role);
    setUserName(name);

    fetchPosts();
  }, []);

  // دالة عامة لإرسال أي منشور إلى جدول Supabase
  const handlePublishPost = async (category: "child" | "parent" | "doctor") => {
    if (!inputValue.trim() || isPosting) return;

    let authorName = userName;
    if (category === "doctor" && !authorName.startsWith("د.")) {
      authorName = `د. ${authorName}`;
    }

    const postPayload = {
      author: authorName,
      content: inputValue.trim(),
      category: category,
      avatar: category === "child" ? "👦" : undefined,
      comments_count: 0,
    };

    try {
      setIsPosting(true);
      const { data, error } = await supabase
        .from("community_posts")
        .insert([postPayload])
        .select()
        .single();

      if (error) {
        alert("حدث خطأ أثناء النشر: " + error.message);
      } else if (data) {
        if (category === "child") setChildPosts([data, ...childPosts]);
        if (category === "parent") setParentPosts([data, ...parentPosts]);
        if (category === "doctor") setDoctorPosts([data, ...doctorPosts]);

        setActiveModal(null);
        setInputValue("");
      }
    } catch (err: any) {
      alert("خطأ: " + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "140px", paddingBottom: "80px", minHeight: "100vh", direction: "rtl", textAlign: "right" }}>
      {loading ? (
        <p style={{ textAlign: "center", color: "#00b894", fontSize: "18px" }}>
          جاري تحميل منشورات المجتمع السحابي... ⏳
        </p>
      ) : (
        <>
          {/* مجتمع الأطفال */}
          {userRole === "child" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 style={{ color: "#fdcb6e", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>🎈 نادي الأبطال 🎈</h2>
              <div style={{ display: "grid", gap: "15px" }}>
                <AnimatePresence>
                  {childPosts.map((post) => (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={post.id} style={{ backgroundColor: "rgba(253, 203, 110, 0.1)", padding: "20px", borderRadius: "15px", border: "2px dashed #fdcb6e", display: "flex", alignItems: "center", gap: "15px" }}>
                      <span style={{ fontSize: "40px" }}>{post.avatar || "👦"}</span>
                      <div>
                        <h3 style={{ color: "white", margin: "0 0 5px 0" }}>البطل {post.author}</h3>
                        <p style={{ color: "#fdcb6e", margin: 0, fontSize: "16px", fontWeight: "bold" }}>{post.content}</p>
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

          {/* مجتمع أولياء الأمور */}
          {userRole === "parent" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 style={{ color: "#0984e3", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>👩‍👧‍👦 مجتمع الأمهات والآباء 👨‍👦</h2>
              <div style={{ display: "grid", gap: "15px" }}>
                <AnimatePresence>
                  {parentPosts.map((post) => (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={post.id} style={{ backgroundColor: "rgba(9, 132, 227, 0.1)", padding: "20px", borderRadius: "15px", border: "1px solid #0984e3" }}>
                      <h3 style={{ color: "white", margin: "0 0 10px 0" }}>{post.content}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#a0a0b5", fontSize: "14px", flexWrap: "wrap", gap: "10px" }}>
                        <span>بواسطة: {post.author}</span>
                        <span>💬 {post.comments_count || 0} تعليق | 🕒 {post.created_at ? new Date(post.created_at).toLocaleDateString("ar-EG") : "الآن"}</span>
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

          {/* ملتقى الأطباء */}
          {userRole === "doctor" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 style={{ color: "#00b894", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>🩺 ملتقى الأطباء والأخصائيين 🧠</h2>
              <div style={{ display: "grid", gap: "15px" }}>
                <AnimatePresence>
                  {doctorPosts.map((post) => (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={post.id} style={{ backgroundColor: "rgba(0, 184, 148, 0.1)", padding: "20px", borderRadius: "15px", border: "1px solid #00b894" }}>
                      <h3 style={{ color: "white", margin: "0 0 10px 0" }}>{post.content}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#a0a0b5", fontSize: "14px", flexWrap: "wrap", gap: "10px" }}>
                        <span style={{ color: "#00b894", fontWeight: "bold" }}>{post.author}</span>
                        <span>💬 {post.comments_count || 0} ردود الزملاء | 🕒 {post.created_at ? new Date(post.created_at).toLocaleDateString("ar-EG") : "الآن"}</span>
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
        </>
      )}

      {/* نافذة كتابة المنشور */}
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
                  disabled={isPosting}
                  onClick={() => handlePublishPost(activeModal)}
                  style={{ padding: "10px 30px", backgroundColor: isPosting ? "#636e72" : activeModal === "child" ? "#fdcb6e" : activeModal === "parent" ? "#0984e3" : "#00b894", color: activeModal === "child" ? "#2d3436" : "white", border: "none", borderRadius: "10px", cursor: isPosting ? "wait" : "pointer", fontWeight: "bold" }}
                >
                  {isPosting ? "جاري النشر..." : "نشر"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}