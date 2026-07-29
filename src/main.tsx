import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
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

 
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
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
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>
);