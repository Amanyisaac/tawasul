import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gamesData from './gamesData.json';
import "./App.css";

// ==========================================
// 🌟 مكون نافذة النقاط المشترك لجميع الألعاب 🌟
// ==========================================
function PointsModal({ isVisible, totalPoints, onContinue }: { isVisible: boolean; totalPoints: number; onContinue: () => void }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            style={{ backgroundColor: "#1e272e", padding: "40px", borderRadius: "24px", border: "2px solid #00b894", textAlign: "center", maxWidth: "400px", boxShadow: "0 20px 50px rgba(0, 184, 148, 0.3)", direction: "rtl" }}
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: "60px", marginBottom: "15px" }}>
              🏅
            </motion.div>
            <h2 style={{ color: "white", marginBottom: "15px", fontSize: "28px" }}>عاش يا بطل! 🦸‍♂️</h2>
            <p style={{ color: "#a0a0b5", fontSize: "18px", lineHeight: "1.6", marginBottom: "30px" }}>
              كسبت <span style={{ color: "#fdcb6e", fontWeight: "bold" }}>10 نقاط</span> جديدة..<br />
              مجموع نقاطك أصبح: <span style={{ color: "#00b894", fontSize: "24px", fontWeight: "bold" }}>{totalPoints}</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              style={{ padding: "12px 35px", backgroundColor: "#00b894", color: "white", border: "none", borderRadius: "15px", fontSize: "18px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 8px 15px rgba(0, 184, 148, 0.3)" }}
            >
              استمرار للمستوى التالي 👍
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 1. لعبة الكلمات 🧩
// ==========================================
function WordGame({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  
  const levelData = gamesData.wordGame[currentLevel];

  useEffect(() => {
    if (!levelData) return;
    setAvailableLetters(levelData.scrambled);
    setSelectedLetters([]);
    setIsSuccess(false);
    setShowError(false);
  }, [currentLevel, levelData]);

  const handleSelectLetter = (letter: string, index: number) => {
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);
    const newAvailable = [...availableLetters];
    newAvailable.splice(index, 1);
    setAvailableLetters(newAvailable);
    setShowError(false);

    if (newSelected.length === levelData.word.length) {
      if (newSelected.join("") === levelData.word) {
        setTimeout(() => setIsSuccess(true), 300);
      } else {
        setShowError(true);
      }
    }
  };

  const handleUndoLetter = (letter: string, index: number) => {
    const newSelected = [...selectedLetters];
    newSelected.splice(index, 1);
    setSelectedLetters(newSelected);
    setAvailableLetters([...availableLetters, letter]);
    setShowError(false);
  };

  const handleWin = () => {
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);
    setShowPointsModal(true);
  };

  const handleContinue = () => {
    setShowPointsModal(false);
    setCurrentLevel(prev => (prev < gamesData.wordGame.length - 1 ? prev + 1 : 0));
  };

  const retry = () => { setAvailableLetters(levelData.scrambled); setSelectedLetters([]); setShowError(false); };

  return (
    <div style={{ paddingBottom: "50px", direction: "rtl", position: "relative" }}>
      <PointsModal isVisible={showPointsModal} totalPoints={totalPoints} onContinue={handleContinue} />
      
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button onClick={onBack} style={{ padding: "10px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>العودة للألعاب ✕</button>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.8)", padding: "40px", borderRadius: "24px", textAlign: "center" }}>
        <h3 style={{ color: "#00b894", marginBottom: "15px" }}>المستوى {currentLevel + 1} من {gamesData.wordGame.length}</h3>
        <div style={{ fontSize: "100px", marginBottom: "20px" }}>{levelData.image}</div>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px", minHeight: "60px" }}>
          {Array.from({ length: levelData.word.length }).map((_, index) => (
            <div key={index} onClick={() => selectedLetters[index] && handleUndoLetter(selectedLetters[index], index)} style={{ width: "50px", height: "50px", backgroundColor: selectedLetters[index] ? "#00b894" : "rgba(255,255,255,0.1)", border: "2px dashed #555", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px", color: "white", cursor: "pointer" }}>
              {selectedLetters[index] || ""}
            </div>
          ))}
        </div>

        {showError && (
          <p style={{ color: "#ff7675", fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>⚠️ إجابة خاطئة، حاول مرة أخرى!</p>
        )}

        {isSuccess ? (
          <div>
            <h3 style={{ color: "#fdcb6e", marginBottom: "15px" }}>أحسنت! إجابة صحيحة 🎉</h3>
            <button onClick={handleWin} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>استلام الجائزة 🎁</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
              {availableLetters.map((letter, index) => (
                <button key={index} onClick={() => handleSelectLetter(letter, index)} style={{ width: "50px", height: "50px", backgroundColor: "#3498db", color: "white", fontSize: "22px", border: "none", borderRadius: "10px", cursor: "pointer" }}>{letter}</button>
              ))}
            </div>
            {selectedLetters.length > 0 && (
              <button onClick={retry} style={{ padding: "8px 20px", backgroundColor: "transparent", border: "2px solid #ff7675", color: "#ff7675", borderRadius: "15px", cursor: "pointer" }}>إعادة المحاولة 🔄</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. تحدي المعلومات 💡
// ==========================================
function QuizGame({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const levelData = gamesData.quizGame[currentLevel];

  const handleAnswer = (option: string) => {
    if (option === levelData.correctAnswer) {
      setIsSuccess(true);
      setWrongAnswer(null);
    } else {
      setWrongAnswer(option);
    }
  };

  const handleWin = () => {
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);
    setShowPointsModal(true);
  };

  const handleContinue = () => {
    setShowPointsModal(false);
    setCurrentLevel(prev => (prev < gamesData.quizGame.length - 1 ? prev + 1 : 0));
    setIsSuccess(false);
    setWrongAnswer(null);
  };

  return (
    <div style={{ paddingBottom: "50px", direction: "rtl", textAlign: "center", position: "relative" }}>
      <PointsModal isVisible={showPointsModal} totalPoints={totalPoints} onContinue={handleContinue} />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button onClick={onBack} style={{ padding: "10px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>العودة للألعاب ✕</button>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.8)", padding: "40px", borderRadius: "24px" }}>
        <h3 style={{ color: "white", marginBottom: "20px" }}>{levelData.question}</h3>
        {isSuccess ? (
          <div>
            <h3 style={{ color: "#00b894", marginBottom: "15px" }}>إجابة صحيحة يا بطل! 🌟</h3>
            <button onClick={handleWin} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>استلام الجائزة 🎁</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {wrongAnswer && <p style={{ color: "#ff7675", fontWeight: "bold" }}>⚠️ إجابة خاطئة، حاول اختيار الإجابة الصحيحة!</p>}
            {levelData.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(option)} style={{ padding: "15px", fontSize: "18px", backgroundColor: wrongAnswer === option ? "#ff7675" : "#34495e", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>{option}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. لعبة الذاكرة 🎴
// ==========================================
function MemoryGame({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWin, setIsWin] = useState(false);
  
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const levelData = gamesData.memoryGame[currentLevel];

  const initializeGame = () => {
    if (!levelData) return;
    const emojis = levelData.emojis;
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setIsWin(false);
  };

  useEffect(() => { initializeGame(); }, [currentLevel, levelData]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves(moves + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;
      if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
        setTimeout(() => {
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          if (newCards.every(card => card.isMatched)) setIsWin(true);
        }, 500);
      } else {
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleWinPoints = () => {
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);
    setShowPointsModal(true);
  };

  const handleContinue = () => {
    setShowPointsModal(false);
    setCurrentLevel(prev => (prev < gamesData.memoryGame.length - 1 ? prev + 1 : 0));
  };

  const totalCards = levelData ? levelData.emojis.length * 2 : 6;
  const columns = totalCards <= 6 ? 3 : 4;

  return (
    <div style={{ paddingBottom: "50px", direction: "rtl", textAlign: "center", position: "relative" }}>
      <PointsModal isVisible={showPointsModal} totalPoints={totalPoints} onContinue={handleContinue} />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button onClick={onBack} style={{ padding: "10px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>العودة للألعاب ✕</button>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.8)", padding: "40px", borderRadius: "24px" }}>
        <h3 style={{ color: "#0984e3", marginBottom: "20px" }}>المستوى {currentLevel + 1} من {gamesData.memoryGame.length}</h3>
        {isWin ? (
          <div>
            <h3 style={{ color: "#00b894", marginBottom: "15px" }}>ذاكرة قوية! 🏆</h3>
            <button onClick={handleWinPoints} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>استلام الجائزة 🎁</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "10px" }}>
            {cards.map((card, index) => (
              <div key={card.id} onClick={() => handleCardClick(index)} style={{ height: "80px", backgroundColor: card.isFlipped || card.isMatched ? "white" : "#0984e3", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "35px", cursor: "pointer" }}>
                {card.isFlipped || card.isMatched ? card.emoji : "❓"}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. لعبة الحساب 🔢
// ==========================================
function MathGame({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wrongOption, setWrongOption] = useState<number | null>(null);
  
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const levelData = gamesData.mathGame[currentLevel];

  const handleAnswer = (option: number) => {
    if (option === levelData.answer) {
      setIsSuccess(true);
      setWrongOption(null);
    } else {
      setWrongOption(option);
    }
  };

  const handleWin = () => {
    const currentPoints = parseInt(localStorage.getItem("childPoints") || "0");
    const newPoints = currentPoints + 10;
    localStorage.setItem("childPoints", newPoints.toString());
    setTotalPoints(newPoints);
    setShowPointsModal(true);
  };

  const handleContinue = () => {
    setShowPointsModal(false);
    setCurrentLevel(prev => (prev < gamesData.mathGame.length - 1 ? prev + 1 : 0));
    setIsSuccess(false);
    setWrongOption(null);
  };

  return (
    <div style={{ paddingBottom: "50px", direction: "rtl", textAlign: "center", position: "relative" }}>
      <PointsModal isVisible={showPointsModal} totalPoints={totalPoints} onContinue={handleContinue} />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button onClick={onBack} style={{ padding: "10px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>العودة للألعاب ✕</button>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "rgba(30, 39, 46, 0.8)", padding: "40px", borderRadius: "24px" }}>
        <div style={{ fontSize: "50px", color: "white", fontWeight: "bold", marginBottom: "20px" }}>
          {levelData.num1} {levelData.operator} {levelData.num2} = ؟
        </div>
        {wrongOption !== null && <p style={{ color: "#ff7675", fontWeight: "bold", marginBottom: "15px" }}>⚠️ إجابة خاطئة، جرب رقماً آخر!</p>}
        {isSuccess ? (
          <div>
            <h3 style={{ color: "#00b894", marginBottom: "15px" }}>حساب ممتاز! 🧮</h3>
            <button onClick={handleWin} style={{ padding: "12px 30px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>استلام الجائزة 🎁</button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
            {levelData.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(option)} style={{ width: "70px", height: "70px", fontSize: "24px", fontWeight: "bold", backgroundColor: wrongOption === option ? "#ff7675" : "#fdcb6e", color: wrongOption === option ? "white" : "#2d3436", border: "none", borderRadius: "15px", cursor: "pointer" }}>{option}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 🕹️ القائمة الرئيسية 🕹️
// ==========================================
export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const gamesList = [
    { id: 'word', title: "لعبة الكلمات", icon: "🧩", desc: "رتب الحروف لتكوين الكلمة.", color: "#00b894", isReady: true },
    { id: 'quiz', title: "تحدي المعلومات", icon: "💡", desc: "أجب عن الأسئلة الممتعة.", color: "#e67e22", isReady: true },
    { id: 'memory', title: "لعبة الذاكرة", icon: "🎴", desc: "طابق الصور المتشابهة.", color: "#0984e3", isReady: true },
    { id: 'math', title: "لعبة الحساب", icon: "🔢", desc: "حل المسائل الرياضية.", color: "#fdcb6e", isReady: true },
  ];

  return (
    <div className="container" style={{ paddingTop: "100px", direction: "rtl", textAlign: "center", minHeight: "100vh" }}>
      {!activeGame && (
        <>
          <h1 style={{ fontSize: "40px", marginBottom: "10px", color: "white" }}>عالم الألعاب 🎮</h1>
          <p style={{ color: "#a0a0b5", fontSize: "18px", marginBottom: "40px" }}>اختر لعبتك المفضلة وابدأ المرح!</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", maxWidth: "900px", margin: "0 auto", padding: "0 20px 50px" }}>
            {gamesList.map((game) => (
              <div key={game.id} onClick={() => setActiveGame(game.id)} style={{ backgroundColor: "rgba(30, 39, 46, 0.8)", padding: "30px 20px", borderRadius: "24px", cursor: "pointer", border: `2px solid ${game.color}`, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: "60px", marginBottom: "15px" }}>{game.icon}</div>
                <h3 style={{ color: "white", fontSize: "24px", marginBottom: "10px" }}>{game.title}</h3>
                <p style={{ color: "#a0a0b5", fontSize: "16px" }}>{game.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <>
        {activeGame === 'word' && <WordGame onBack={() => setActiveGame(null)} />}
        {activeGame === 'quiz' && <QuizGame onBack={() => setActiveGame(null)} />}
        {activeGame === 'memory' && <MemoryGame onBack={() => setActiveGame(null)} />}
        {activeGame === 'math' && <MathGame onBack={() => setActiveGame(null)} />}
      </>
    </div>
  );
}