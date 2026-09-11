import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function ChildProfile() {
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [childName, setChildName] = useState("بطل تواصل 🦸‍♂️");
  const [totalPoints, setTotalPoints] = useState(0);
  const [isSavingName, setIsSavingName] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";

  // 1. جلب بيانات الطفل الحية من Supabase
  useEffect(() => {
    async function loadProfileData() {
      // تحميل مبدئي سريع من LocalStorage
      const localName = localStorage.getItem("childName") || localStorage.getItem("userName");
      if (localName) setChildName(localName);

      const localPoints = localStorage.getItem("childPoints");
      if (localPoints) setTotalPoints(parseInt(localPoints));

      const localPic = localStorage.getItem("childProfilePic");
      if (localPic) setProfileImage(localPic);

      // جلب البيانات الرسمية من السيرفر
      if (userEmail) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("name, points, avatar_url")
            .eq("email", userEmail)
            .single();

          if (data && !error) {
            if (data.name) {
              setChildName(data.name);
              localStorage.setItem("childName", data.name);
              localStorage.setItem("userName", data.name);
            }
            if (typeof data.points === "number") {
              setTotalPoints(data.points);
              localStorage.setItem("childPoints", String(data.points));
            }
            if (data.avatar_url) {
              setProfileImage(data.avatar_url);
              localStorage.setItem("childProfilePic", data.avatar_url);
            }
          }
        } catch (err) {
          console.error("Failed to load live profile:", err);
        }
      }
    }

    loadProfileData();
  }, [userEmail]);

  // 2. رفع وتحديث صورة البروفايل في Supabase
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem("childProfilePic", base64String);

        if (userEmail) {
          try {
            await supabase
              .from("profiles")
              .update({ avatar_url: base64String })
              .eq("email", userEmail);
          } catch (err) {
            console.error("Error updating avatar in Supabase:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. تحديث الاسم محلياً
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setChildName(newName);
  };

  // 4. حفظ الاسم الجديد في Supabase (profiles + heroes)
  const handleSaveName = async () => {
    if (!childName.trim() || !userEmail) return;
    setIsSavingName(true);

    try {
      // تحديث profiles
      await supabase
        .from("profiles")
        .update({ name: childName.trim() })
        .eq("email", userEmail);

      // تحديث heroes لوحة الشرف
      const oldName = localStorage.getItem("userName") || "";
      if (oldName) {
        await supabase
          .from("heroes")
          .update({ name: childName.trim() })
          .eq("name", oldName);
      }

      localStorage.setItem("childName", childName.trim());
      localStorage.setItem("userName", childName.trim());
      alert("تم حفظ اسم البطل بنجاح في قاعدة البيانات! 🌟");
    } catch (err: any) {
      console.error("Error saving name:", err);
      alert("حدث خطأ أثناء حفظ الاسم: " + err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        paddingTop: "140px",
        direction: "rtl",
        textAlign: "right",
        minHeight: "100vh",
        paddingBottom: "80px",
        paddingRight: "20px",
        paddingLeft: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          maxWidth: "800px",
          margin: "0 auto 30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h1 style={{ fontSize: "32px", color: "white", textAlign: "center", width: "100%" }}>
          ملفي الشخصي 🌟
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0984e3",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            margin: "0 auto",
          }}
        >
          العودة للرئيسية 🏠
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "rgba(30, 39, 46, 0.9)",
          padding: "40px",
          borderRadius: "30px",
          border: "3px solid #fdcb6e",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* الصورة الشخصية */}
        <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto 20px" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "5px dashed #00b894",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "60px" }}>👦</span>
            )}
          </div>

          <label
            style={{
              position: "absolute",
              bottom: "0",
              right: "10px",
              backgroundColor: "#fdcb6e",
              padding: "10px",
              borderRadius: "50%",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "40px",
              height: "40px",
            }}
          >
            📷
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          </label>
        </div>

        {/* تعديل وحفظ اسم الطفل */}
        <div style={{ marginBottom: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <input
            type="text"
            value={childName}
            onChange={handleNameChange}
            placeholder="اسم البطل"
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: "white",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "2px solid #00b894",
              textAlign: "center",
              width: "100%",
              maxWidth: "350px",
              outline: "none",
              paddingBottom: "5px",
            }}
          />
          <button
            onClick={handleSaveName}
            disabled={isSavingName}
            style={{
              padding: "6px 16px",
              backgroundColor: "#00b894",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: isSavingName ? "wait" : "pointer",
            }}
          >
            {isSavingName ? "جاري الحفظ..." : "حفظ التعديل 💾"}
          </button>
        </div>

        {/* إحصائيات الطفل الحية */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "20px",
              border: "1px solid #e84393",
            }}
          >
            <span style={{ fontSize: "40px" }}>🏅</span>
            <h3 style={{ color: "#fdcb6e", margin: "10px 0 5px" }}>النقاط السحابية</h3>
            <p style={{ color: "#e84393", fontSize: "28px", fontWeight: "bold" }}>{totalPoints}</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "20px" }}>
            <span style={{ fontSize: "40px" }}>🎮</span>
            <h3 style={{ color: "#0984e3", margin: "10px 0 5px" }}>الألعاب المنجزة</h3>
            <p style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>12</p>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "20px" }}>
            <span style={{ fontSize: "40px" }}>📖</span>
            <h3 style={{ color: "#00b894", margin: "10px 0 5px" }}>القصص المقروءة</h3>
            <p style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>5</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            backgroundColor: "rgba(253, 203, 110, 0.1)",
            border: "2px dashed #fdcb6e",
            padding: "20px",
            borderRadius: "20px",
            textAlign: "right",
          }}
        >
          <h3
            style={{
              color: "#fdcb6e",
              marginBottom: "10px",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⭐ المكافآت والإنجازات
          </h3>
          <p style={{ color: "#a0a0b5", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
            كل إنجاز تحققه يتم حفظه في قاعدة البيانات ويظهر في لوحة الشرف العامة مع باقي أبطال المنصة.. واصل الإنجاز يا بطل! 🚀
          </p>
        </div>
      </motion.div>
    </div>
  );
}