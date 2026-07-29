import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [childPic, setChildPic] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // الـ useEffect ده بيشتغل كل ما المسار (اللينك) يتغير عشان يحدّث حالة الـ Navbar فوراً
  useEffect(() => {
    const status = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(status);
    
    // محاولة استرجاع صورة الطفل لو كان رافعها في صفحة الملف الشخصي
    const savedImage = localStorage.getItem("childProfilePic");
    if (savedImage) {
      setChildPic(savedImage);
    }
  }, [location]);

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("childProfilePic"); // اختياري: لو حابة تمسحي الصورة مع الخروج
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      backgroundColor: 'transparent', // أو لون الخلفية بتاعك
      color: 'white',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }}>
      {/* اللوجو */}
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <span style={{ color: '#00b894' }}>Tawa</span>sul
        </Link>
      </div>

      {/* الروابط في المنتصف */}
      <div style={{ display: 'flex', gap: '30px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Our Vision</Link>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Features</Link>
      </div>

      {/* الأزرار على اليمين */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Link to="/parent-dashboard" style={{ 
          padding: '8px 15px', 
          border: '1px solid #fdcb6e', 
          color: '#fdcb6e', 
          borderRadius: '20px', 
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Parent Dashboard
        </Link>

        {isLoggedIn ? (
          /* في حالة تسجيل الدخول: إظهار أيقونة الحساب الشخصي وزر الخروج */
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* أيقونة الملف الشخصي */}
            <div 
              onClick={() => navigate('/profile')}
              title="ملفي الشخصي"
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                border: '2px solid #00b894',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {childPic ? (
                <img src={childPic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '20px' }}>👦</span>
              )}
            </div>

            {/* زر تسجيل الخروج (اختياري) */}
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 15px',
                backgroundColor: 'transparent',
                border: '1px solid #ff7675',
                color: '#ff7675',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          /* في حالة عدم تسجيل الدخول: إظهار زر Login فقط */
          <Link to="/login" style={{ 
            padding: '8px 20px', 
            border: '1px solid #00b894', 
            color: '#00b894', 
            borderRadius: '20px', 
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}