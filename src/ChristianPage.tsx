import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import christianData from './christianData.json';
import "./App.css";

const arabicBookNames: { [key: string]: string } = {
  "Genesis": "سفر التكوين",
  "Exodus": "سفر الخروج",
  "Leviticus": "سفر اللاويين",
  "Numbers": "سفر العدد",
  "Deuteronomy": "سفر التثنية",
  "Joshua": "سفر يشوع",
  "Judges": "سفر القضاه",
  "Ruth": "سفر راعوث",
  "1 Samuel": "سفر صموئيل الأول",
  "2 Samuel": "سفر صموئيل الثاني",
  "1 Kings": "سفر الملوك الأول",
  "2 Kings": "سفر الملوك الثاني",
  "1 Chronicles": "سفر أخبار الأيام الأول",
  "2 Chronicles": "سفر أخبار الأيام الثاني",
  "Ezra": "سفر عزرا",
  "Nehemiah": "سفر نحميا",
  "Esther": "سفر أستير",
  "Job": "سفر أيوب",
  "Psalms": "سفر المزامير",
  "Proverbs": "سفر الأمثال",
  "Ecclesiastes": "سفر الجامعة",
  "Song of Songs": "نشيد الأنشاد",
  "Isaiah": "سفر إشعياء",
  "Jeremiah": "سفر إرميا",
  "Lamentations": "مراثي إرميا",
  "Ezekiel": "سفر حزقيال",
  "Daniel": "سفر دانيال",
  "Hosea": "سفر هوشع",
  "Joel": "سفر يوئيل",
  "Amos": "سفر عاموس",
  "Obadiah": "سفر عوبديا",
  "Jonah": "سفر يونان",
  "Micah": "سفر ميخا",
  "Nahum": "سفر ناحوم",
  "Habakkuk": "سفر حبقوق",
  "Zephaniah": "سفر صفنيا",
  "Haggai": "سفر حجي",
  "Zechariah": "سفر زكريا",
  "Malachi": "سفر ملاخي",
  "Matthew": "إنجيل متى",
  "Mark": "إنجيل مرقس",
  "Luke": "إنجيل لوقا",
  "John": "إنجيل يوحنا",
  "Acts": "أعمال الرسل",
  "Romans": "رسالة رومية",
  "1 Corinthians": "رسالة كورنثوس الأولى",
  "2 Corinthians": "رسالة كورنثوس الثانية",
  "Galatians": "رسالة غلاطية",
  "Ephesians": "رسالة أفسس",
  "Philippians": "رسالة فيلبي",
  "Colossians": "رسالة كولوسي",
  "1 Thessalonics": "رسالة تسالونيكي الأولى",
  "2 Thessalonics": "رسالة تسالونيكي الثانية",
  "1 Timothy": "رسالة تيموثاوس الأولى",
  "2 Timothy": "رسالة تيموثاوس الثانية",
  "Titus": "رسالة تيطس",
  "Philemon": "رسالة فيلمون",
  "Hebrews": "رسالة العبرانيين",
  "James": "رسالة يعقوب",
  "1 Peter": "رسالة بطرس الأولى",
  "2 Peter": "رسالة بطرس الثانية",
  "1 John": "رسالة يوحنا الأولى",
  "2 John": "رسالة يوحنا الثانية",
  "3 John": "رسالة يوحنا الثالثة",
  "Jude": "رسالة يهوذا",
  "Revelation": "سفر الرؤيا"
};

export default function ChristianPage() {
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState<"bible" | "agpeya" | "rosary" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [hailMaryCount, setHailMaryCount] = useState(0);

  const [bibleBooks, setBibleBooks] = useState<any[]>([]);
  const [selectedBibleBook, setSelectedBibleBook] = useState<any>(null);
  const [isLoadingBible, setIsLoadingBible] = useState(false);

  const mainCategories = [
    { id: "bible", title: "الكتاب المقدس", icon: "📖", color: "#0984e3", desc: "الأسفار الكاملة باللغة العربية" },
    { id: "agpeya", title: "الأجبية", icon: "🕊️", color: "#e67e22", desc: "صلوات السواعي اليومية" },
    { id: "rosary", title: "المسبحة الوردية", icon: "📿", color: "#e84393", desc: "أسرار وتأملات المسبحة" }
  ];

  const loadBibleBooks = () => {
    if (bibleBooks.length === 0) {
      setIsLoadingBible(true);
      fetch('https://bolls.life/get-books/SVD/')
        .then(res => res.json())
        .then(data => {
          setBibleBooks(data);
          setIsLoadingBible(false);
        })
        .catch(err => {
          console.error("خطأ:", err);
          setIsLoadingBible(false);
        });
    }
  };

  const fetchChapter = (bookid: number, chapter: number, bookName: string) => {
    setIsLoadingBible(true);
    fetch(`https://bolls.life/get-text/SVD/${bookid}/${chapter}/`)
      .then(res => res.json())
      .then(data => {
        setIsLoadingBible(false);
        setSelectedItem({
          type: 'bible_chapter',
          title: `${arabicBookNames[bookName] || bookName} - أصحاح ${chapter}`,
          subtitle: "الكتاب المقدس",
          icon: "📖",
          content: data
        });
      })
      .catch(err => {
        console.error("خطأ:", err);
        setIsLoadingBible(false);
      });
  };

  const handleSectionClick = (id: string) => {
    setActiveSection(id as any);
    if (id === "bible") loadBibleBooks();
  };

  const handleBack = () => {
    if (selectedBibleBook) {
      setSelectedBibleBook(null);
    } else if (activeSection) {
      setActiveSection(null);
    } else {
      navigate('/dashboard');
    }
  };

  const handleFinishReading = () => {
    setSelectedItem(null);
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);
    setTimeout(() => setShowPointsModal(true), 500);
  };

  return (
    <div className="container" style={{ paddingTop: "120px", position: "relative", minHeight: "100vh", direction: "rtl", textAlign: "right" }}>
      
      {/* نافذة النقاط */}
      <AnimatePresence>
        {showPointsModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} style={{ backgroundColor: "#1e272e", padding: "40px", borderRadius: "24px", border: "2px solid #00b894", textAlign: "center", maxWidth: "400px" }}>
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>🏅</div>
              <h2 style={{ color: "white", marginBottom: "15px", fontSize: "28px" }}>عاش يا بطل! 🦸‍♂️</h2>
              <p style={{ color: "#a0a0b5", fontSize: "18px", marginBottom: "30px" }}>كسبت 10 نقاط جديدة! مجموع نقاطك: {totalPoints}</p>
              <button onClick={() => setShowPointsModal(false)} style={{ padding: "12px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", cursor: "pointer", fontWeight: "bold" }}>استمرار</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* الهيدر */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", maxWidth: "1200px", margin: "0 auto 40px", padding: "0 20px" }}>
        <h1 className="title" style={{ margin: 0, fontSize: "34px" }}>
          {activeSection === "bible" ? "الكتاب المقدس 📖" : activeSection === "agpeya" ? "الأجبية 🕊️" : activeSection === "rosary" ? "المسبحة الوردية 📿" : "صلواتي وآياتي ⛪"}
        </h1>
        <button onClick={handleBack} style={{ padding: "10px 20px", backgroundColor: "#34495e", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>
          {selectedBibleBook ? "العودة للأسفار 🔙" : activeSection ? "العودة للأقسام 🔙" : "العودة للرئيسية 🏠"}
        </button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", paddingBottom: "50px" }}>
        
        {/* الأقسام الرئيسية */}
        {!activeSection && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "25px" }}>
            {mainCategories.map((cat) => (
              <div 
                key={cat.id}
                style={{ backgroundColor: "rgba(30, 39, 46, 0.9)", border: `3px solid ${cat.color}`, cursor: "pointer", textAlign: "center", padding: "30px", borderRadius: "20px", flex: "1 1 280px", maxWidth: "330px" }}
                onClick={() => handleSectionClick(cat.id)}
              >
                <div style={{ fontSize: "60px", marginBottom: "15px" }}>{cat.icon}</div>
                <h2 style={{ color: "white", marginBottom: "10px", fontSize: "24px" }}>{cat.title}</h2>
                <p style={{ color: "#a0a0b5", fontSize: "15px", margin: 0 }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* أسفار الكتاب المقدس */}
        {activeSection === "bible" && (
          isLoadingBible ? (
            <h2 style={{ color: "white", textAlign: "center", marginTop: "80px" }}>جاري تحميل الأسفار... ⏳</h2>
          ) : !selectedBibleBook ? (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
              {bibleBooks.map((book) => (
                <div 
                  key={book.bookid}
                  style={{ 
                    backgroundColor: "rgba(30, 39, 46, 0.9)", 
                    border: "2px solid rgba(255,255,255,0.1)", 
                    padding: "25px 15px", 
                    borderRadius: "16px", 
                    cursor: "pointer", 
                    textAlign: "center",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                    flex: "1 1 200px",
                    maxWidth: "240px"
                  }}
                  onClick={() => setSelectedBibleBook(book)}
                >
                  <div style={{ fontSize: "35px", marginBottom: "10px" }}>⛪</div>
                  <h3 style={{ fontSize: "18px", color: "white", margin: "0 0 8px 0" }}>{arabicBookNames[book.name] || book.name}</h3>
                  <span style={{ backgroundColor: "rgba(0, 184, 148, 0.2)", color: "#00b894", padding: "4px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold" }}>
                    {book.chapters} أصحاح
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h2 style={{ color: "#fdcb6e", textAlign: "center", marginBottom: "25px", fontSize: "26px" }}>{arabicBookNames[selectedBibleBook.name] || selectedBibleBook.name}</h2>
              
              {/* 👈 تم جعل الأصحاحات تظهر جنب بعضها باستخدام Flexbox */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px" }}>
                {Array.from({ length: selectedBibleBook.chapters }).map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchChapter(selectedBibleBook.bookid, index + 1, selectedBibleBook.name)}
                    style={{ 
                      padding: "15px 20px", backgroundColor: "#0984e3", color: "white", border: "none", 
                      borderRadius: "14px", fontSize: "16px", fontWeight: "bold", cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)", textAlign: "center",
                      flex: "0 1 110px"
                    }}
                  >
                    أصحاح {index + 1}
                  </motion.button>
                ))}
              </div>
            </div>
          )
        )}

        {/* الأجبية والمسبحة */}
        {(activeSection === "agpeya" || activeSection === "rosary") && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
            {christianData[activeSection].map((item: any) => (
              <div 
                key={item.id}
                style={{ backgroundColor: "rgba(45, 52, 54, 0.9)", border: "1px solid rgba(255,255,255,0.1)", padding: "20px", borderRadius: "15px", cursor: "pointer", textAlign: "center", flex: "1 1 250px", maxWidth: "300px" }}
                onClick={() => { setSelectedItem(item); if (activeSection === "rosary") setHailMaryCount(0); }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>{item.icon}</div>
                <h3 style={{ fontSize: "19px", color: "white", marginBottom: "5px" }}>{item.title}</h3>
                <span style={{ color: "#fdcb6e", fontSize: "13px" }}>{item.subtitle}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة العرض وقراءة النص */}
      <AnimatePresence>
        {selectedItem && (
          <div className="video-overlay" onClick={() => setSelectedItem(null)} style={{ zIndex: 900 }}>
            <div 
              className="video-modal"
              style={{ maxWidth: "750px", width: "90%", padding: "35px", backgroundColor: "#2d3436", borderRadius: "20px", direction: "rtl", textAlign: "right" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
              
              <h2 style={{ color: "#00b894", marginBottom: "10px", fontSize: "24px" }}>{selectedItem.title}</h2>
              <p style={{ color: "#fdcb6e", fontSize: "14px", marginBottom: "20px" }}>{selectedItem.subtitle}</p>
              
              <div style={{ maxHeight: "45vh", overflowY: "auto", paddingRight: "10px", marginBottom: "25px", whiteSpace: "pre-line" }}>
                {selectedItem.type === 'bible_chapter' ? (
                  <p style={{ color: "white", fontSize: "20px", lineHeight: "2", textAlign: "justify" }}>
                    {selectedItem.content.map((verseObj: any) => (
                      <span key={verseObj.pk}>
                        {verseObj.text} <span style={{ color: "#fdcb6e", fontSize: "16px", margin: "0 4px" }}>﴿{verseObj.verse}﴾</span>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p style={{ color: "#d1d1e0", fontSize: "20px", lineHeight: "1.8" }}>{selectedItem.content}</p>
                )}

                {activeSection === "rosary" && (
                  <div style={{ marginTop: "25px", backgroundColor: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "12px", textAlign: "center" }}>
                    <h4 style={{ color: "white", marginBottom: "10px", fontSize: "18px" }}>🙏 أبانا الذي في السماوات...</h4>
                    <button 
                      onClick={() => setHailMaryCount(prev => prev < 10 ? prev + 1 : 10)}
                      style={{ padding: "12px 25px", backgroundColor: hailMaryCount === 10 ? "#00b894" : "#e84393", color: "white", border: "none", borderRadius: "15px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", width: "100%", marginBottom: "10px" }}
                    >
                      {hailMaryCount === 10 ? "✅ أتممت 10 مرات" : `السلام عليك يا مريم (${hailMaryCount}/10)`}
                    </button>
                    {hailMaryCount === 10 && <h4 style={{ color: "#fdcb6e", fontSize: "17px" }}>✨ المجد للآب والابن والروح القدس...</h4>}
                  </div>
                )}
              </div>

              <div style={{ textAlign: "center" }}>
                {activeSection === "rosary" ? (
                   hailMaryCount === 10 && (
                    <button onClick={handleFinishReading} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "15px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
                      أتممت السر واستلام الجائزة 🎁
                    </button>
                   )
                ) : (
                  <button onClick={handleFinishReading} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "15px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
                    أتممت القراءة واستلام الجائزة 🎁
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}