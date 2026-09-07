import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [childPic, setChildPic] = useState<string | null>(null);
  const [lang, setLang] = useState<string>("ar");
  
  // حالات الإشعارات
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const status = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole");
    const currentLang = localStorage.getItem("tawasul_lang") || "ar";
    
    setIsLoggedIn(status);
    setUserRole(role);
    setLang(currentLang);

    // جلب الإشعارات الحية المخزنة
    const savedNotes = JSON.parse(localStorage.getItem("tawasul_notifications") || "[]");
    if (savedNotes.length === 0 && status) {
      setNotifications([
        currentLang === "ar" ? "👋 أهلاً بك في منصة تواصل!" : "👋 Welcome to Tawasul!",
        currentLang === "ar" ? "⭐ حقق بطلك إنجازاً جديداً اليوم!" : "⭐ Your hero achieved a new milestone!"
      ]);
    } else {
      setNotifications(savedNotes);
    }

    // تطبيق اتجاه الصفحة فوري
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.className = currentLang === "ar" ? "app-rtl" : "app-ltr";
    
    const savedImage = localStorage.getItem("childProfilePic");
    if (savedImage) {
      setChildPic(savedImage);
    }
  }, [location]);

  // دالة تغيير اللغة لتحديث المنصة بالكامل
  const toggleLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("tawasul_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.className = newLang === "ar" ? "app-rtl" : "app-ltr";
    window.location.reload(); 
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("childProfilePic");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar" style={{ direction: lang === "ar" ? "rtl" : "ltr", padding: "12px 30px" }}>
        
        {/* 1. اللوجو */}
        <div className="nav-logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'white', fontSize: '26px', fontWeight: 'bold' }}>
            <span style={{ color: '#00b894' }}>Tawa</span>sul
          </Link>
        </div>

        {/* 2. الروابط العامة في المنتصف */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '15px' }}>{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
          <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '15px' }}>{lang === 'ar' ? 'عن المنصة' : 'About'}</Link>
          <Link to="/#features" style={{ color: 'white', textDecoration: 'none', fontSize: '15px' }}>{lang === 'ar' ? 'المميزات' : 'Features'}</Link>
          <Link to="/leaderboard" style={{ color: '#fdcb6e', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
            🏆 {lang === 'ar' ? 'لوحة الشرف' : 'Leaderboard'}
          </Link>
          <Link to="/admin-dashboard" style={{ color: '#ff7675', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
            ⚙️ {lang === 'ar' ? 'الإدارة' : 'Admin'}
          </Link>
        </div>

        {/* 3. الأزرار والأدوات على اليمين */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          
          {/* 🔔 أيقونة الإشعارات */}
          <div style={{ position: "relative", cursor: "pointer", fontSize: "18px", padding: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setShowNotifications(!showNotifications)} title="الإشعارات">
            🔔
            {notifications.length > 0 && (
              <span style={{ position: "absolute", top: "2px", [lang === "ar" ? "left" : "right"]: "2px", backgroundColor: "#ff7675", color: "white", borderRadius: "50%", width: "16px", height: "16px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "9px", fontWeight: "bold" }}>
                {notifications.length}
              </span>
            )}

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  style={{ position: "absolute", top: "45px", [lang === "ar" ? "left" : "right"]: "0", width: "260px", backgroundColor: "#1e272e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 2000, cursor: "default", textAlign: lang === "ar" ? "right" : "left", color: "white" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 style={{ color: "#00b894", margin: "0 0 8px 0", fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "5px" }}>
                    {lang === "ar" ? "الإشعارات الذكية 🔔" : "Notifications 🔔"}
                  </h4>
                  {notifications.length === 0 ? (
                    <p style={{ color: "#a0a0b5", fontSize: "12px", margin: 0 }}>{lang === "ar" ? "لا توجد إشعارات" : "No notifications"}</p>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
                      {notifications.map((note, index) => (
                        <li key={index} style={{ fontSize: "12px", color: "white", backgroundColor: "rgba(255,255,255,0.05)", padding: "6px 8px", borderRadius: "6px" }}>
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🌐 زرار تغيير اللغة */}
          <button 
            onClick={toggleLanguage}
            style={{
              padding: '6px 10px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {lang === 'ar' ? 'English 🌐' : 'عربي 🌐'}
          </button>

          {!isLoggedIn ? (
            <>
              <Link to="/login" style={{ padding: '7px 14px', backgroundColor: 'transparent', border: '1px solid #00b894', color: '#00b894', borderRadius: '16px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Link>
              <Link to="/signup" style={{ padding: '7px 14px', backgroundColor: '#00b894', border: 'none', color: 'white', borderRadius: '16px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
              </Link>
            </>
          ) : (
            <>
              {userRole === "parent" && (
                <Link to="/parent-dashboard" style={{ padding: '7px 10px', border: '1px solid #fdcb6e', color: '#fdcb6e', fontSize: '12px', borderRadius: '16px', textDecoration: 'none', fontWeight: 'bold' }}>
                  {lang === 'ar' ? 'ولي الأمر' : 'Parent'}
                </Link>
              )}

              {userRole === "doctor" && (
                <Link to="/doctor-dashboard" style={{ padding: '7px 10px', border: '1px solid #0984e3', color: '#0984e3', fontSize: '12px', borderRadius: '16px', textDecoration: 'none', fontWeight: 'bold' }}>
                  {lang === 'ar' ? 'الطبيب' : 'Doctor'}
                </Link>
              )}

              {userRole === "child" && (
                <Link to="/dashboard" style={{ padding: '7px 10px', border: '1px solid #00b894', color: '#00b894', fontSize: '12px', borderRadius: '16px', textDecoration: 'none', fontWeight: 'bold' }}>
                  {lang === 'ar' ? 'الأبطال 🎈' : 'Heroes 🎈'}
                </Link>
              )}

              <button 
                onClick={() => navigate('/community')}
                style={{
                  padding: '7px 10px',
                  backgroundColor: '#00b894',
                  border: 'none',
                  color: 'white',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {lang === 'ar' ? '💬 المجتمع' : '💬 Community'}
              </button>

              <div 
                onClick={() => navigate('/profile')}
                title="Profile"
                style={{ 
                  width: '34px', 
                  height: '34px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '2px solid #00b894',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {childPic ? (
                  <img src={childPic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '16px' }}>👦</span>
                )}
              </div>

              <button 
                onClick={handleLogout}
                style={{
                  padding: '7px 10px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ff7675',
                  color: '#ff7675',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* زر الدعم الفني العائم */}
      <motion.div
        drag
        dragMomentum={false} 
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 1.2, cursor: "grabbing" }}
        onClick={() => navigate('/support')}
        title={lang === 'ar' ? "الدعم الفني" : "Support"}
        style={{
          position: 'fixed',
          bottom: '25px',
          [lang === 'ar' ? 'left' : 'right']: '25px',
          backgroundColor: '#00b894',
          color: 'white',
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '26px',
          boxShadow: '0 8px 20px rgba(0, 184, 148, 0.4)',
          cursor: 'grab',
          zIndex: 9999, 
          touchAction: 'none' 
        }}
      >
        🎧
      </motion.div>
    </>
  );
}