import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage'; 
import Navbar from './Navbar';
import Footer from './Footer'; 
import StoriesPage from './StoriesPage';
import QuranPage from './QuranPage';
import CalendarPage from './CalendarPage';
import WuduPage from './WuduPage';
import PrayerPage from './PrayerPage';
import GamesPage from './GamesPage';
import AzkarPage from './AzkarPage';
import ParentDashboard from './ParentDashboard'; 
import DoctorDashboard from './DoctorDashboard';
import ChildProfile from './ChildProfile';
import ChristianPage from './ChristianPage';
import CommunityPage from './CommunityPage';
import AboutPage from './AboutPage';
import SupportPage from './SupportPage'; // 👈 استدعاء صفحة الدعم الفني مرة واحدة بشكل صحيح
import LeaderboardPage from './LeaderboardPage';
// 👇 استدعاء صفحة الأدمين
import AdminDashboard from './AdminDashboard';

// 👇 استدعاء صفحة التواصل والاستشارات (نظام التذاكر)
import ConsultationTickets from './ConsultationTickets';

import './index.css';
import './App.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<App />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/quran" element={<QuranPage />} />
          <Route path="/Calendar" element={<CalendarPage />}/>
          <Route path="/wudu" element={<WuduPage />} />
          <Route path="/Prayer" element={<PrayerPage />} />
          <Route path="/games" element={<GamesPage/>}/>
          <Route path="/azkar" element={<AzkarPage/>}/>
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/profile" element={<ChildProfile />} />
          <Route path="/christian" element={<ChristianPage />} />
          <Route path="/community" element={<CommunityPage />} />
          
          
          {/* 👇 المسار الجديد للأدمين */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* 👇 المسار الجديد للتواصل مع الأطباء (الاستشارات) */}
          <Route path="/consultations" element={<ConsultationTickets />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          {/* 👇 صفحة عن المنصة */}
          <Route path="/about" element={<AboutPage />} />

          {/* 👇 المسار الجديد لصفحة الدعم الفني والسبورت */}
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </div>
      <Footer />
    </HashRouter>
  </React.StrictMode>
);