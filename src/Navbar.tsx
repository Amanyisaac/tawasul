import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [, setChildPic] = useState<string | null>(null);
  const [childPoints, setChildPoints] = useState<number>(0);
  const [lang, setLang] = useState<string>("ar");

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setShowNotifications] = useState(false);
  const [, setNotifications] = useState<string[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location]);

  useEffect(() => {
    const status = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole");
    const currentLang = localStorage.getItem("tawasul_lang") || "ar";
    const userEmail = localStorage.getItem("userEmail");

    setIsLoggedIn(status);
    setUserRole(role);
    setLang(currentLang);

    const savedPoints = localStorage.getItem("childPoints");
    if (savedPoints) {
      setChildPoints(parseInt(savedPoints, 10));
    }

    async function syncUserData() {
      if (status && userEmail) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("points, avatar_url")
            .eq("email", userEmail)
            .single();

          if (!error && data) {
            if (data.points !== undefined && data.points !== null) {
              setChildPoints(data.points);
              localStorage.setItem("childPoints", String(data.points));
            }
            if (data.avatar_url) {
              setChildPic(data.avatar_url);
              localStorage.setItem("childProfilePic", data.avatar_url);
            }
          }
        } catch (err) {
          console.error("Navbar sync error:", err);
        }
      }
    }

    syncUserData();

    const savedNotes = JSON.parse(localStorage.getItem("tawasul_notifications") || "[]");
    if (savedNotes.length === 0 && status) {
      setNotifications([
        currentLang === "ar" ? "👋 أهلاً بك في منصة تواصل!" : "👋 Welcome to Tawasul!",
        currentLang === "ar" ? "⭐ حقق بطلك إنجازاً جديداً اليوم!" : "⭐ Your hero achieved a new milestone!",
      ]);
    } else {
      setNotifications(savedNotes);
    }

    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.className = currentLang === "ar" ? "app-rtl" : "app-ltr";

    const localPic = localStorage.getItem("childProfilePic");
    if (localPic) setChildPic(localPic);
  }, [location]);

  // تحديث النقاط اللحظي من Supabase
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    const channel = supabase
      .channel("navbar_profile_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `email=eq.${userEmail}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.points !== undefined) {
            setChildPoints(payload.new.points);
            localStorage.setItem("childPoints", String(payload.new.points));
          }
          if (payload.new && payload.new.avatar_url) {
            setChildPic(payload.new.avatar_url);
            localStorage.setItem("childProfilePic", payload.new.avatar_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  const toggleLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("tawasul_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.className = newLang === "ar" ? "app-rtl" : "app-ltr";
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  const isMobile = windowWidth < 950;
  const isAdminUser = localStorage.getItem("userEmail") === "adora9073@gmail.com";

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "65px",
          backgroundColor: "#151a21", // معتم تماماً 100% لمنع ظهور أي شيء خلفه أثناء السكرول
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          zIndex: 999999, // أعلى طبقة في الصفحة كلها
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          direction: lang === "ar" ? "rtl" : "ltr",
          boxSizing: "border-box",
        }}
      >
        {/* اللوجو وشارة النقاط */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <Link to="/" style={{ textDecoration: "none", color: "#ffffff", fontSize: "20px", fontWeight: "bold", whiteSpace: "nowrap" }}>
            <span style={{ color: "#00b894" }}>Tawa</span>sul
          </Link>
          {isLoggedIn && userRole === "child" && (
            <span
              style={{
                backgroundColor: "rgba(253, 203, 110, 0.15)",
                color: "#fdcb6e",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "bold",
                border: "1px solid #fdcb6e",
                whiteSpace: "nowrap",
              }}
            >
              ⭐ {childPoints}
            </span>
          )}
        </div>

        {/* الروابط في الشاشات الكبيرة */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "18px", flexShrink: 0 }}>
            <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "14px", whiteSpace: "nowrap" }}>
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <Link to="/about" style={{ color: "white", textDecoration: "none", fontSize: "14px", whiteSpace: "nowrap" }}>
              {lang === "ar" ? "عن المنصة" : "About"}
            </Link>
            <Link to="/#features" style={{ color: "white", textDecoration: "none", fontSize: "14px", whiteSpace: "nowrap" }}>
              {lang === "ar" ? "المميزات" : "Features"}
            </Link>
            <Link to="/leaderboard" style={{ color: "#fdcb6e", textDecoration: "none", fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap" }}>
              🏆 {lang === "ar" ? "لوحة الشرف" : "Leaderboard"}
            </Link>
            {/* يظهر فقط للمستخدم صاحب إيميل الأدمن المصرح به */}
            {isAdminUser && (
              <Link to="/admin-dashboard" style={{ color: "#ff7675", textDecoration: "none", fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap" }}>
                ⚙️ {lang === "ar" ? "الإدارة" : "Admin"}
              </Link>
            )}
          </div>
        )}

        {/* الأدوات والأزرار */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={toggleLanguage}
            style={{
              padding: "4px 8px",
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            {lang === "ar" ? "EN 🌐" : "عربي 🌐"}
          </button>

          {!isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Link
                to="/login"
                style={{
                  padding: "5px 12px",
                  border: "1px solid #00b894",
                  color: "#00b894",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "ar" ? "دخول" : "Login"}
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: "5px 12px",
                  backgroundColor: "#00b894",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "ar" ? "تسجيل" : "Sign Up"}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {userRole === "parent" && (
                <Link to="/parent-dashboard" style={{ padding: "4px 8px", border: "1px solid #fdcb6e", color: "#fdcb6e", fontSize: "11px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {lang === "ar" ? "ولي الأمر" : "Parent"}
                </Link>
              )}
              {userRole === "doctor" && (
                <Link to="/doctor-dashboard" style={{ padding: "4px 8px", border: "1px solid #0984e3", color: "#0984e3", fontSize: "11px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {lang === "ar" ? "الطبيب" : "Doctor"}
                </Link>
              )}
              {userRole === "child" && (
                <Link to="/dashboard" style={{ padding: "4px 8px", border: "1px solid #00b894", color: "#00b894", fontSize: "11px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {lang === "ar" ? "الأبطال" : "Heroes"}
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "rgba(255, 118, 117, 0.2)",
                  border: "1px solid #ff7675",
                  color: "#ff7675",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "ar" ? "خروج" : "Exit"}
              </button>
            </div>
          )}

          {/* زر القائمة للشاشات الصغيرة */}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#ffffff",
                fontSize: "18px",
                padding: "3px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </header>

      {/* حاجز بارتفاع 65px يحجز مكان الناف بار */}
      <div style={{ height: "65px", width: "100%", flexShrink: 0 }} />

      {/* قائمة الموبايل المنسدلة */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed",
              top: "65px",
              left: 0,
              right: 0,
              width: "100%",
              backgroundColor: "#151a21",
              borderBottom: "2px solid #00b894",
              padding: "15px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              zIndex: 999998,
              textAlign: lang === "ar" ? "right" : "left",
              direction: lang === "ar" ? "rtl" : "ltr",
              boxShadow: "0 10px 25px rgba(0,0,0,0.9)",
              boxSizing: "border-box",
            }}
          >
            <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "14px" }}>
              {lang === "ar" ? "🏠 الرئيسية" : "🏠 Home"}
            </Link>
            <Link to="/about" style={{ color: "white", textDecoration: "none", fontSize: "14px" }}>
              {lang === "ar" ? "ℹ️ عن المنصة" : "ℹ️ About"}
            </Link>
            <Link to="/#features" style={{ color: "white", textDecoration: "none", fontSize: "14px" }}>
              {lang === "ar" ? "⭐ المميزات" : "⭐ Features"}
            </Link>
            <Link to="/leaderboard" style={{ color: "#fdcb6e", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
              🏆 {lang === "ar" ? "لوحة الشرف" : "Leaderboard"}
            </Link>
            {/* يظهر في الموبايل فقط لنفس الإيميل */}
            {isAdminUser && (
              <Link to="/admin-dashboard" style={{ color: "#ff7675", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
                ⚙️ {lang === "ar" ? "لوحة الإدارة" : "Admin"}
              </Link>
            )}
            <Link to="/community" style={{ color: "#00b894", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
              💬 {lang === "ar" ? "المجتمع" : "Community"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}