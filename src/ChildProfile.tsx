import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function ChildProfile() {
  const navigate = useNavigate();
  
  // حالات لحفظ الصورة، الاسم، والنقاط
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [childName, setChildName] = useState("بطل تواصل 🦸‍♂️");
  const [totalPoints, setTotalPoints] = useState(0); // 👈 حالة جديدة لحفظ النقاط الحقيقية

  // استرجاع البيانات من الـ localStorage أول ما الصفحة تفتح
  useEffect(() => {
    // 1. استرجاع الصورة
    const savedImage = localStorage.getItem("childProfilePic");
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // 2. استرجاع النقاط الحقيقية المجمعة 👈 (ده اللي كان ناقص)
    const savedPoints = localStorage.getItem("childPoints");
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints));
    }
  }, []);

  // دالة التعامل مع رفع الصورة
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        // حفظ الصورة في المتصفح عشان تفضل موجودة
        localStorage.setItem("childProfilePic", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "140px", direction: "rtl", textAlign: "right", minHeight: "100vh", paddingBottom: "80px", paddingRight: "20px", paddingLeft: "20px" }}>
      
      {/* شريط علوي */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", maxWidth: "800px", margin: "0 auto 30px" }}>
        <h1 style={{ fontSize: "32px", color: "white" }}>ملفي الشخصي 🌟</h1>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#0984e3", 
            color: "white", 
            border: "none", 
            borderRadius: "12px", 
            cursor: "pointer", 
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
          }}
        >
          العودة للرئيسية 🏠
        </button>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.9)", padding: "40px", borderRadius: "30px", border: "3px solid #fdcb6e", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
      >
        
        {/* منطقة الصورة الشخصية */}
        <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto 20px" }}>
          <div style={{ 
            width: "100%", 
            height: "100%", 
            borderRadius: "50%", 
            backgroundColor: "rgba(255,255,255,0.1)", 
            border: "5px dashed #00b894", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            overflow: "hidden",
            position: "relative"
          }}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "60px" }}>👦</span>
            )}
          </div>
          
          {/* زر رفع الصورة */}
          <label style={{ 
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
            height: "40px"
          }}>
            📷
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          </label>
        </div>

        {/* تعديل الاسم */}
        <div style={{ marginBottom: "30px" }}>
          <input 
            type="text" 
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            style={{ 
              fontSize: "28px", 
              fontWeight: "bold", 
              color: "white", 
              backgroundColor: "transparent", 
              border: "none", 
              borderBottom: "2px solid #a0a0b5", 
              textAlign: "center", 
              width: "250px",
              outline: "none",
              paddingBottom: "5px"
            }}
          />
        </div>

        {/* إحصائيات ونياشين الطفل */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginTop: "30px" }}>
          
          {/* 👈 هنا خلينا النقاط تظهر من المتغير totalPoints بدل ما كانت 150 ثابتة */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "20px", border: "1px solid #e84393" }}>
            <span style={{ fontSize: "40px" }}>🏅</span>
            <h3 style={{ color: "#fdcb6e", margin: "10px 0 5px" }}>النقاط</h3>
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

      </motion.div>
    </div>
  );
}