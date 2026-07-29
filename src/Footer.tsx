import "./App.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* قسم اللوجو والوصف */}
        <div className="footer-section">
          <h2 className="footer-logo"><span style={{ color: '#00b894' }}>Tawa</span>sul</h2>
          <p className="footer-desc">
            Your smart companion designed to bridge the gap between fun learning, parental monitoring, and expert guidance.
          </p>
        </div>

        {/* قسم الروابط السريعة */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>

        {/* قسم التواصل وحقوق الملكية */}
        <div className="footer-section">
          <h3>Contact & Info</h3>
          <p style={{ marginBottom: '10px' }}>Email: support@tawasul.com</p>
          <p>Developed with ❤️ by Senior 2027 Team</p>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="footer-bottom">
        <p>&copy; 2026 Tawasul. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;