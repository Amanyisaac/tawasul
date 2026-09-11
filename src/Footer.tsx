import "./App.css";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const FooterLink = ({ to, text, isPlaceholder = false }: { to: string, text: string, isPlaceholder?: boolean }) => (
    <motion.li 
      whileHover={{ x: 8 }} 
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link 
        to={to} 
        onClick={isPlaceholder ? handleScrollToTop : undefined}
        style={{ 
          color: "#a0a0b5", 
          textDecoration: "none", 
          fontSize: "14px", 
          display: "inline-block", 
          transition: "color 0.3s ease" 
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#00b894"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#a0a0b5"}
      >
        {text}
      </Link>
    </motion.li>
  );

  return (
    <footer style={{ backgroundColor: "#151a21", borderTop: "1px solid rgba(255, 255, 255, 0.05)", direction: "ltr", textAlign: "left", marginTop: "80px", overflow: "hidden" }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }}
        style={{ padding: "60px 40px 20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px", paddingBottom: "40px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          
          {/* العمود الأول: Explore - تم توجيه كل رابط لصفحته المحددة */}
          <div style={{ flex: "1 1 150px" }}>
            <h3 style={{ color: "white", marginBottom: "20px", fontSize: "16px", fontWeight: "bold", position: "relative", paddingBottom: "8px" }}>
              Explore
              <span style={{ position: "absolute", bottom: 0, left: 0, width: "30px", height: "2px", backgroundColor: "#00b894" }}></span>
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <FooterLink to="/dashboard" text="Kids Dashboard" />
              <FooterLink to="/games" text="Educational Games" />
              <FooterLink to="/stories" text="Inspiring Stories" />
              <FooterLink to="/azkar" text="Quran & Azkar" />
            </ul>
          </div>

          {/* العمود الثاني: Company */}
          <div style={{ flex: "1 1 150px" }}>
            <h3 style={{ color: "white", marginBottom: "20px", fontSize: "16px", fontWeight: "bold", position: "relative", paddingBottom: "8px" }}>
              Company
              <span style={{ position: "absolute", bottom: 0, left: 0, width: "30px", height: "2px", backgroundColor: "#00b894" }}></span>
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <FooterLink to="/about" text="About Us" />
              <FooterLink to="/" text="Our Vision" isPlaceholder={true} />
              <FooterLink to="/community" text="Tawasul Community" />
              <FooterLink to="/" text="Child Safe Standard" isPlaceholder={true} />
            </ul>
          </div>

          {/* العمود الثالث: Support */}
          <div style={{ flex: "1 1 150px" }}>
            <h3 style={{ color: "white", marginBottom: "20px", fontSize: "16px", fontWeight: "bold", position: "relative", paddingBottom: "8px" }}>
              Support
              <span style={{ position: "absolute", bottom: 0, left: 0, width: "30px", height: "2px", backgroundColor: "#00b894" }}></span>
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <FooterLink to="/support" text="Contact Support" />
              <FooterLink to="/support" text="FAQ" />
              <FooterLink to="/support" text="Submit a Ticket" />
              <FooterLink to="/consultations" text="Doctor Consultations" />
            </ul>
          </div>

          {/* العمود الرابع: Legal */}
          <div style={{ flex: "1 1 150px" }}>
            <h3 style={{ color: "white", marginBottom: "20px", fontSize: "16px", fontWeight: "bold", position: "relative", paddingBottom: "8px" }}>
              Legal
              <span style={{ position: "absolute", bottom: 0, left: 0, width: "30px", height: "2px", backgroundColor: "#00b894" }}></span>
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <FooterLink to="/" text="Privacy Policy" isPlaceholder={true} />
              <FooterLink to="/" text="Terms of Use" isPlaceholder={true} />
              <motion.li whileHover={{ scale: 1.05, originX: 0 }}>
                <span style={{ color: "#00b894", fontWeight: "bold", fontSize: "14px", display: "inline-block" }}>
                  Developed by Amany Isaac
                </span>
              </motion.li>
            </ul>
          </div>

        </div>

        {/* الشريط السفلي */}
        <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "10px", color: "#a0a0b5", fontSize: "14px", lineHeight: "1.8" }}>
          <p style={{ margin: "0 0 5px 0" }}><strong style={{ color: "white" }}>Tawasul Platform</strong> — Safe & Fun Learning for Kids</p>
          <p style={{ margin: 0 }}>&copy; 2027 Tawasul. All rights reserved.</p>
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer;