import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function ChildProfile() {
  const navigate = useNavigate();
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [childName, setChildName] = useState("بطل تواصل 🦸‍♂️");
  const [totalPoints, setTotalPoints] = useState(0); 

  useEffect(() => {
    // 1. استرجاع الصورة
    const savedImage = localStorage.getItem("childProfilePic");
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // 2. استرجاع الاسم (من childName أو من userName اللي اتسجل بيه وقت الـ Signup)
    const savedName = localStorage.getItem("childName") || localStorage.getItem("userName");
    if (savedName && savedName.trim() !== "") {
      setChildName(savedName);
    }

    // 3. استرجاع النقاط
    const savedPoints = localStorage.getItem("childPoints");
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints));
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem("childProfilePic", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setChildName(newName);
    localStorage.setItem("childName", newName);
    localStorage.setItem("userName", newName); // تحديثه في الاثنين عشان يقرأ في كل مكان
  };

  return (
    <div className="container" style={{ paddingTop: "140px", direction: "rtl", textAlign: "right", minHeight: "100vh", paddingBottom: "80px", paddingRight: "20px", paddingLeft: "20px" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", maxWidth: "800px", margin: "0 auto 30px", flexWrap: "wrap", gap: "15px" }}>
        <h1 style={{ fontSize: "32px", color: "white", textAlign: "center", width: "100%" }}>ملفي الشخصي 🌟</h1>
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
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            margin: "0 auto"
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

        {/* تعديل وعرض اسم الطفل */}
        <div style={{ marginBottom: "30px" }}>
          <input 
            type="text" 
            value={childName}
            onChange={handleNameChange}
            style={{ 
              fontSize: "28px", 
              fontWeight: "bold", 
              color: "white", 
              backgroundColor: "transparent", 
              border: "none", 
              borderBottom: "2px solid #a0a0b5", 
              textAlign: "center", 
              width: "100%",
              maxWidth: "350px",
              outline: "none",
              paddingBottom: "5px"
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginTop: "30px" }}>
          
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

        <div style={{ marginTop: "40px", backgroundColor: "rgba(253, 203, 110, 0.1)", border: "2px dashed #fdcb6e", padding: "20px", borderRadius: "20px", textAlign: "right" }}>
          <h3 style={{ color: "#fdcb6e", marginBottom: "10px", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            ⭐المكافات والإنجازات
          </h3>
          <p style={{ color: "#a0a0b5", fontSize: "14px", margin: 0 }}>
            كل نجمة أو شهادة تقدير يرسلها لك "بطلك السري" هنا تضاف مباشرة إلى رصيد نقاطك وحسناتك.. واصل الإنجاز يا بطل! 🚀
          </p>
        </div>

      </motion.div>
    </div>
  );
}