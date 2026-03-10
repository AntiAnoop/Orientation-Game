/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, ArrowRight, SkipForward, RotateCcw, User, Info } from 'lucide-react';

// --- TYPES ---
interface Question {
  id: number;
  q: string;
  opts: string[];
  correct: number;
}

interface Player {
  id: number;
  name: string;
  color: string;
  avatar: string;
  score: number;
  round1Qs: Question[];
  round2Qs: Question[];
}

type GamePhase = 'setup-count' | 'setup-names' | 'transition' | 'handoff' | 'question' | 'kismat' | 'final';

// --- CONSTANTS ---
const COLORS = ["#FF7043", "#42A5F5", "#66BB6A", "#FFA726", "#AB47BC", "#FF8A65", "#4DB6AC", "#D4E157", "#BA68C8"];
const AVATARS = ["👤", "🐱", "🦊", "🐲", "🐼", "🐨", "🦁", "🐯", "🐸"];

const QUESTION_BANK: Question[] = [
  { id:1, q:"What does 'Konnichiwa' mean?", opts:["Good Morning","Good Night","Hello / Good Afternoon","Goodbye"], correct:2 },
  { id:2, q:"Japan is made up of how many main islands?", opts:["2","3","4","5"], correct:2 },
  { id:3, q:"Which hiragana character represents the sound 'A'?", opts:["い","う","あ","お"], correct:2 },
  { id:4, q:"What does SSW stand for in the Japan visa context?", opts:["Special Skill Worker","Specified Skilled Worker","Standard Skilled Worker","Supervised Skilled Worker"], correct:1 },
  { id:5, q:"What is 'Ramen'?", opts:["A rice dish","A sushi roll","Japanese noodle soup","A grilled meat dish"], correct:2 },
  { id:6, q:"What sound does the katakana 'ス' make?", opts:["shi","sa","su","se"], correct:2 },
  { id:7, q:"How do you say 'Thank you' in Japanese?", opts:["Sumimasen","Gomen nasai","Hai","Arigatou gozaimasu"], correct:3 },
  { id:8, q:"What is a 'Zairyu Card'?", opts:["A health insurance card","A train pass","A residence card for foreigners","A bank ATM card"], correct:2 },
  { id:9, q:"What is the traditional Japanese robe called?", opts:["Sari","Hanbok","Kimono","Yukata"], correct:2 },
  { id:10, q:"How many basic hiragana characters are there?", opts:["26","36","46","56"], correct:2 },
  { id:11, q:"What does 'Ikura desu ka?' mean?", opts:["Where is it?","What time is it?","How much does it cost?","What is this?"], correct:2 },
  { id:12, q:"What does 'テレビ' mean?", opts:["Telephone","Television","Table","Telegram"], correct:1 },
  { id:13, q:"What is Japan's currency?", opts:["Won","Yuan","Dollar","Yen"], correct:3 },
  { id:14, q:"What does 'Ohayou gozaimasu' mean?", opts:["Good Evening","Good Morning","Good Afternoon","Good Night"], correct:1 },
  { id:15, q:"Which katakana represents the sound 'ka'?", opts:["ケ","キ","カ","コ"], correct:2 },
  { id:16, q:"What is 'Onsen'?", opts:["A Japanese school","A Shinto shrine","A type of sushi","A natural hot spring bath"], correct:3 },
  { id:17, q:"What does 'Hachi' mean in Japanese numbers?", opts:["6","7","8","9"], correct:2 },
  { id:18, q:"What does 'Iie' mean?", opts:["Yes","Maybe","No","Please"], correct:2 },
  { id:19, q:"What is 'Karaoke'?", opts:["A Japanese board game","A street food festival","Singing along to recorded music","A type of martial art"], correct:2 },
  { id:20, q:"Which hiragana represents 're'?", opts:["ろ","ら","れ","り"], correct:2 },
  { id:21, q:"What does 'Sensei' mean?", opts:["Student","Friend","Teacher","Boss"], correct:2 },
  { id:22, q:"How do you write 'coffee' (koohii) in katakana?", opts:["ごはん","コーヒー","コヒ","かふぇ"], correct:1 },
  { id:23, q:"What does 'Kyuujitsu' mean in a work context?", opts:["Overtime","Night shift","Morning shift","Holiday or Day off"], correct:3 },
  { id:24, q:"What sound does the hiragana 'き' make?", opts:["si","ti","ki","ni"], correct:2 },
  { id:25, q:"What is the capital city of Japan?", opts:["Osaka","Kyoto","Hiroshima","Tokyo"], correct:3 },
  { id:26, q:"What does 'Tabemasu' mean?", opts:["To drink","To sleep","To work","To eat"], correct:3 },
  { id:27, q:"Katakana is mainly used for writing what?", opts:["Japanese grammar","Children's books","Foreign or loan words","Ancient Japanese"], correct:2 },
  { id:28, q:"What does 'Shakai Hoken' refer to?", opts:["Car insurance","Life insurance","Social insurance for health and pension","Travel insurance"], correct:2 },
  { id:29, q:"What does 'Sayonara' mean?", opts:["Hello","Please","Thank you","Goodbye"], correct:3 },
  { id:30, q:"Which flower is the national flower of Japan?", opts:["Rose","Lotus","Cherry Blossom (Sakura)","Chrysanthemum"], correct:2 },
  { id:31, q:"What sound does 'の' make in hiragana?", opts:["mo","ne","no","nu"], correct:2 },
  { id:32, q:"What is Japan's famous high-speed train called?", opts:["Metro Rail","Express Rail","Shinkansen","Rapid Rail"], correct:2 },
  { id:33, q:"What does 'Keiyaku' mean in a Japanese workplace?", opts:["Salary","Contract","Leave application","Job interview"], correct:1 },
  { id:34, q:"How do you say 'Yes' in Japanese?", opts:["Iie","Hai","Nani","Doko"], correct:1 },
  { id:35, q:"What does 'バス' mean in katakana?", opts:["Base","Bass guitar","Bus","Vase"], correct:2 },
  { id:36, q:"What is 'Bento'?", opts:["A Japanese bow greeting","A packed meal box","A type of Japanese tea","A traditional robe"], correct:1 },
  { id:37, q:"What does 'Nan-ji desu ka?' mean?", opts:["What day is it?","What time is it?","How old are you?","Where are you going?"], correct:1 },
  { id:38, q:"Which hiragana represents 'su'?", opts:["せ","そ","さ","す"], correct:3 },
  { id:39, q:"What does 'Nenkin' mean in Japan?", opts:["Annual bonus","Monthly salary","Pension system","Travel allowance"], correct:2 },
  { id:40, q:"What is the Japanese concept of 'Ikigai'?", opts:["A type of food","A greeting ritual","A reason for being or life purpose","A traditional dance"], correct:2 },
  { id:41, q:"How do you say '10' in Japanese?", opts:["Kyuu","Juu","Hyaku","Hachi"], correct:1 },
  { id:42, q:"What does 'Sumimasen' mean?", opts:["You're welcome","Goodbye","Excuse me or Sorry","Good morning"], correct:2 },
  { id:43, q:"How is 'taxi' written in katakana?", opts:["タクシ","タクシー","タクシイ","たくしー"], correct:1 },
  { id:44, q:"What does bowing represent in Japanese culture?", opts:["Anger","Asking for money","Challenging someone","Respect and greeting"], correct:3 },
  { id:45, q:"What is 'Ichi-man' in numbers?", opts:["1,000","100","10,000","100,000"], correct:2 },
  { id:46, q:"What does 'Wakarimasen' mean?", opts:["I understand","I am hungry","I don't understand","I don't know your name"], correct:2 },
  { id:47, q:"What is Kabuki?", opts:["A type of food","A card game","Traditional Japanese theatre","A martial art"], correct:2 },
  { id:48, q:"Which hiragana is 'mi'?", opts:["め","む","み","も"], correct:2 },
  { id:49, q:"What does 'ホテル' mean in katakana?", opts:["Hospital","House","Hotel","Hostel"], correct:2 },
  { id:50, q:"How do you say 'Monday' in Japanese?", opts:["Kayoubi","Getsuyoubi","Suiyoubi","Mokuyoubi"], correct:1 },
  { id:51, q:"What does 'Doko desu ka?' mean?", opts:["What is this?","Where is it?","When is it?","Who is it?"], correct:1 },
  { id:52, q:"What is 'Manga'?", opts:["A type of Japanese food","A Japanese festival","Japanese comic books","A Japanese greeting"], correct:2 },
  { id:53, q:"What sound does the hiragana 'て' make?", opts:["de","ne","se","te"], correct:3 },
  { id:54, q:"Which document must a foreign worker carry at all times in Japan?", opts:["Passport only","Visa only","Bank statement","Zairyu Card (Residence Card)"], correct:3 },
  { id:55, q:"How do you say 'Water' in Japanese?", opts:["Gohan","Ocha","Mizu","Sake"], correct:2 },
  { id:56, q:"What does 'アイスクリーム' mean?", opts:["Cold drink","Shaved ice","Ice cream","Frozen yogurt"], correct:2 },
  { id:57, q:"What does 'Itadakimasu' mean?", opts:["Goodbye","Thank you for everything","Said before eating a meal","Good morning"], correct:2 },
  { id:58, q:"How do you say '3' in Japanese?", opts:["Ichi","Ni","San","Shi"], correct:2 },
  { id:59, q:"What is a 'Dojo'?", opts:["A Japanese restaurant","A Japanese garden","A traditional house","A martial arts training hall"], correct:3 },
  { id:60, q:"What sound does 'は' make in hiragana?", opts:["ba","pa","ha","wa"], correct:2 },
  { id:61, q:"How do you say 'I am tired' in Japanese?", opts:["Samui desu","Nemui desu","Tsukaremashita","Isogashii desu"], correct:2 },
  { id:62, q:"Which season is famous in Japan for cherry blossom viewing?", opts:["Summer","Autumn","Winter","Spring"], correct:3 },
  { id:63, q:"What does 'Kaisha' mean?", opts:["School","Hospital","Company or workplace","Shop"], correct:2 },
  { id:64, q:"How do you say 'half past' (30 minutes) in Japanese?", opts:["Fun","Juu","Han","Pun"], correct:2 },
  { id:65, q:"Which is the tallest mountain in Japan?", opts:["Mount Aso","Mount Koya","Mount Fuji","Mount Hiei"], correct:2 },
  { id:66, q:"What does 'Watashi wa ___ desu' mean?", opts:["Where are you from?","What is your name?","My name is ___","I am going to ___"], correct:2 },
  { id:67, q:"How do you write 'ice cream' in katakana?", opts:["アイスクリン","アイスクリーム","アイスクリャム","アイスクリーン"], correct:1 },
  { id:68, q:"How many SSW visa job categories exist in Japan?", opts:["5","7","10","12"], correct:3 },
  { id:69, q:"What does 'ト' sound like in katakana?", opts:["te","ta","tsu","to"], correct:3 },
  { id:70, q:"What does 'Gochisousama deshita' mean?", opts:["Welcome to our home","Please eat more","The food is delicious","Said after finishing a meal to express gratitude"], correct:3 }
];

// --- COMPONENTS ---

const SakuraPetals = () => {
  const petals = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      size: Math.random() * 15 + 10 + 'px',
      duration: Math.random() * 8 + 6 + 's',
      delay: Math.random() * 5 + 's',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute bg-[#FFAB91] rounded-[150%_0_150%_0] opacity-60 animate-fall"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            top: '-20px',
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(100px, 110vh) rotate(360deg); }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

const Scoreboard = ({ players }: { players: Player[] }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const leadingScore = sortedPlayers[0]?.score || 0;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 w-64 max-h-[80vh] caricature-card p-5 z-50 hidden lg:flex flex-col gap-3 overflow-y-auto">
      <h3 className="text-center font-title text-black text-2xl font-black mb-2 flex items-center justify-center gap-2">
        <Trophy size={24} /> SCORES
      </h3>
      {sortedPlayers.map((p, i) => (
        <motion.div
          key={p.id}
          layout
          className={`flex items-center gap-3 p-3 bg-white rounded-xl border-4 transition-all relative ${
            p.score === leadingScore && p.score > 0 ? 'border-[#FFD600]' : 'border-black'
          }`}
        >
          {p.score === leadingScore && p.score > 0 && (
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 -right-2 text-2xl drop-shadow-md"
            >
              👑
            </motion.div>
          )}
          <div
            className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: p.color }}
          >
            {p.avatar}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-black truncate uppercase tracking-tight">{p.name}</div>
            <div className="font-title text-[#FF5252] text-2xl font-black leading-none">{p.score}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const MobileScoreboard = ({ players }: { players: Player[] }) => {
  const [expanded, setExpanded] = useState(false);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-50 lg:hidden transition-all duration-300 ${
        expanded ? 'max-h-[400px]' : 'max-h-16'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full h-16 flex items-center justify-center gap-2 font-title font-black text-xl text-black"
      >
        SCORES {expanded ? '▼' : '▲'}
      </button>
      {expanded && (
        <div className="p-4 flex flex-col gap-2 overflow-y-auto max-h-[336px]">
          {sortedPlayers.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white border-4 border-black rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: p.color }}
                >
                  {p.avatar}
                </div>
                <span className="font-black uppercase">{p.name}</span>
              </div>
              <span className="font-title text-[#FF5252] text-2xl font-black">{p.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup-count');
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [transitionData, setTransitionData] = useState({ title: '', sub: '' });
  const [timer, setTimer] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [kismatValues, setKismatValues] = useState<number[]>([]);
  const [kismatRevealed, setKismatRevealed] = useState<number[]>([]);
  const [revealAll, setRevealAll] = useState(false);
  const [round3Pool, setRound3Pool] = useState<Question[]>([]);
  const [round3Results, setRound3Results] = useState({ correct: 0, wrong: 0, skipped: 0 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC ---

  const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleSetupPlayers = () => {
    const initialPlayers = Array.from({ length: playerCount }).map((_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      color: COLORS[i % COLORS.length],
      avatar: AVATARS[i % AVATARS.length],
      score: 0,
      round1Qs: [],
      round2Qs: [],
    }));
    setPlayers(initialPlayers);
    setPhase('setup-names');
  };

  const handleStartGame = () => {
    const shuffledBank = shuffle(QUESTION_BANK);
    let qIdx = 0;

    const gamePlayers = players.map((p) => {
      const r1 = shuffledBank.slice(qIdx, qIdx + 4);
      qIdx += 4;
      const r2 = shuffledBank.slice(qIdx, qIdx + 3);
      qIdx += 3;
      return { ...p, round1Qs: r1, round2Qs: r2 };
    });

    setPlayers(gamePlayers);
    setRound3Pool(shuffledBank.slice(qIdx));
    showTransition('ROUND 1', '4 Questions each! +10 for correct.', 'handoff');
  };

  const showTransition = (title: string, sub: string, nextPhase: GamePhase) => {
    setTransitionData({ title, sub });
    setPhase('transition');
    setTimeout(() => {
      setPhase(nextPhase);
    }, 2500);
  };

  const startPlayerTurn = () => {
    if (currentRound === 3) {
      setTimer(60);
      setRound3Results({ correct: 0, wrong: 0, skipped: 0 });
    } else {
      setTimer(60);
    }
    setPhase('question');
  };

  const startTimer = () => {
    setIsReady(true);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleTimeout();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timer]);

  const handleTimeout = () => {
    setTimerRunning(false);
    if (currentRound === 3) {
      endPlayerTurn();
    } else {
      // Show correct answer for a bit then move on
      setSelectedOption(-1); // special value for timeout
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    
    const currentQ = getCurrentQuestion();
    const isCorrect = idx === currentQ.correct;

    setSelectedOption(idx);

    if (currentRound < 3) {
      setTimerRunning(false);
    }

    if (isCorrect) {
      updatePlayerScore(currentPlayerIdx, 10);
      if (currentRound === 3) setRound3Results(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      if (currentRound === 3) {
        updatePlayerScore(currentPlayerIdx, -5);
        setRound3Results(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      }
    }

    setTimeout(() => {
      nextQuestion();
    }, 1200);
  };

  const skipQuestion = () => {
    setRound3Results(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    nextQuestion();
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsReady(false);
    setTimer(60);
    setTimerRunning(false);

    const maxQs = currentRound === 1 ? 4 : (currentRound === 2 ? 3 : 999);

    if (currentRound < 3) {
      // Round-robin per question logic
      if (currentPlayerIdx + 1 < players.length) {
        setCurrentPlayerIdx(prev => prev + 1);
        setPhase('handoff');
      } else {
        // All players answered this question index
        if (currentQuestionIdx + 1 < maxQs) {
          setCurrentPlayerIdx(0);
          setCurrentQuestionIdx(prev => prev + 1);
          setPhase('handoff');
        } else {
          // Round ends
          setCurrentPlayerIdx(0);
          setCurrentQuestionIdx(0);
          startKismatPhase();
        }
      }
    } else {
      // Speed round logic (Round 3)
      if (timerRunning && timer > 0) {
        setCurrentQuestionIdx(prev => prev + 1);
        // Phase stays 'question'
      } else {
        endPlayerTurn();
      }
    }
  };

  const endPlayerTurn = () => {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentQuestionIdx(0);
    setIsReady(false);
    setTimer(60);

    if (currentRound === 3) {
      if (currentPlayerIdx + 1 < players.length) {
        setCurrentPlayerIdx(prev => prev + 1);
        setPhase('handoff');
      } else {
        setCurrentPlayerIdx(0);
        startKismatPhase();
      }
    } else {
      // For R1/R2, endPlayerTurn is only called from timeout if we want to force next
      nextQuestion();
    }
  };

  const startKismatPhase = () => {
    setKismatValues(shuffle([+15, +10, +5, -5, -10]));
    setKismatRevealed([]);
    setRevealAll(false);
    showTransition(`KISMAT PALAT ${currentRound}`, 'Fate decides your destiny!', 'kismat');
  };

  const handleKismatPick = (idx: number) => {
    if (kismatRevealed.includes(idx) || revealAll) return;
    
    setKismatRevealed(prev => [...prev, idx]);
    const val = kismatValues[idx];
    updatePlayerScore(currentPlayerIdx, val);

    // After 1.5s, reveal all other cards
    setTimeout(() => {
      setRevealAll(true);
    }, 1500);

    setTimeout(() => {
      if (currentPlayerIdx + 1 < players.length) {
        // Reshuffle for next player
        setKismatValues(shuffle([+15, +10, +5, -5, -10]));
        setKismatRevealed([]);
        setRevealAll(false);
        setCurrentPlayerIdx(prev => prev + 1);
      } else {
        setCurrentPlayerIdx(0);
        goToNextRound();
      }
    }, 4500); // Increased delay to allow seeing all cards
  };

  const goToNextRound = () => {
    if (currentRound === 1) {
      setCurrentRound(2);
      showTransition('ROUND 2', '3 Questions each! +10 for correct.', 'handoff');
    } else if (currentRound === 2) {
      setCurrentRound(3);
      showTransition('SPEED ROUND', '60 seconds total! +10 correct, -5 wrong.', 'handoff');
    } else {
      setPhase('final');
    }
  };

  const updatePlayerScore = (idx: number, amount: number) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[idx].score += amount;
      return newPlayers;
    });
  };

  const getCurrentQuestion = () => {
    const p = players[currentPlayerIdx];
    if (currentRound === 1) return p.round1Qs[currentQuestionIdx];
    if (currentRound === 2) return p.round2Qs[currentQuestionIdx];
    return round3Pool[currentQuestionIdx];
  };

  // --- RENDER HELPERS ---

  const renderSetupCount = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
      <div className="caricature-card p-10 w-full max-w-md text-center">
        <h1 className="font-title text-5xl font-black mb-4 text-black drop-shadow-[4px_4px_0_white]">QUIZ TIME!</h1>
        <p className="text-xl font-bold mb-8 text-black/70">How many players are joining?</p>
        <div className="flex justify-center gap-4 mb-10">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setPlayerCount(n)}
              className={`w-16 h-16 rounded-2xl border-4 border-black font-title text-2xl font-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                playerCount === n ? 'bg-[#FFD600] translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-[#FFF9C4]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button onClick={handleSetupPlayers} className="btn-caricature-primary w-full">
          NEXT STEP <ArrowRight className="inline ml-2" />
        </button>
      </div>
    </motion.div>
  );

  const renderSetupNames = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-center w-full">
      <div className="caricature-card p-10 w-full max-w-2xl">
        <h1 className="font-title text-4xl font-black mb-8 text-center uppercase">Player Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-h-[50vh] overflow-y-auto p-2">
          {players.map((p, i) => (
            <div key={p.id} className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-2xl text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: p.color }}
                >
                  {p.avatar}
                </div>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    newPlayers[i].name = e.target.value.slice(0, 15);
                    setPlayers(newPlayers);
                  }}
                  className="flex-1 bg-transparent border-b-4 border-black font-title font-bold text-xl focus:outline-none"
                  placeholder={`Player ${i + 1}`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      const newPlayers = [...players];
                      newPlayers[i].avatar = av;
                      setPlayers(newPlayers);
                    }}
                    className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center transition-all ${
                      p.avatar === av ? 'bg-[#FFD600] scale-110' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleStartGame} className="btn-caricature-primary w-full">
          START THE GAME! 🚀
        </button>
      </div>
    </motion.div>
  );

  const renderTransition = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-[#FFEB3B]">
      <motion.h1
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className="text-8xl font-title font-black text-black drop-shadow-[8px_8px_0_#FF5252]"
      >
        {transitionData.title}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-black/80 mt-8 uppercase tracking-widest"
      >
        {transitionData.sub}
      </motion.p>
    </div>
  );

  const renderHandoff = () => {
    const p = players[currentPlayerIdx];
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
        <div className="caricature-card p-12 w-full max-w-md text-center">
          <h2 className="font-title text-3xl font-black mb-8 text-black uppercase">
            {currentRound === 3 ? 'SPEED ROUND!' : `ROUND ${currentRound}`}
          </h2>
          <div
            className="w-32 h-32 rounded-full border-4 border-black mx-auto mb-8 flex items-center justify-center text-6xl text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: p.color }}
          >
            {p.avatar}
          </div>
          <h1 className="text-5xl font-title font-black text-black mb-2 uppercase tracking-tight">{p.name}</h1>
          <p className="text-2xl font-bold text-black/60 mb-10 uppercase">It's your turn!</p>
          <button onClick={startPlayerTurn} className="btn-caricature-primary w-full py-5 text-2xl">
            {currentRound === 3 ? 'START 60s! ⚡' : "I'M READY! 🎯"}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderQuestion = () => {
    const p = players[currentPlayerIdx];
    const q = getCurrentQuestion();
    const totalQs = currentRound === 1 ? 4 : (currentRound === 2 ? 3 : 10);

    return (
      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-2xl text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: p.color }}
            >
              {p.avatar}
            </div>
            <div>
              <div className="text-xs font-black uppercase text-black/50">Playing Now</div>
              <div className="font-title font-black text-xl leading-none">{p.name}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-[#FF5252] text-white px-4 py-1 rounded-full text-xs font-black mb-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">ROUND {currentRound}</div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1.5 justify-center">
                {currentRound < 3 ? (
                  Array.from({ length: totalQs }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 border-black ${
                        i < currentQuestionIdx ? 'bg-[#FFD600]' : i === currentQuestionIdx ? 'bg-white animate-pulse' : 'bg-black/10'
                      }`}
                    />
                  ))
                ) : (
                  <span className="text-xs font-black text-black uppercase">SPEED ROUND!</span>
                )}
              </div>
              <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                {currentRound < 3 ? `Q ${currentQuestionIdx + 1} / ${totalQs}` : `SCORE: ${round3Results.correct}`}
              </span>
            </div>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E0E0E0" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={timer > 15 ? '#4CAF50' : timer > 5 ? '#FFD600' : '#FF5252'}
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={283 - (timer / 60) * 283}
                strokeLinecap="round"
                className="transition-all duration-1000 linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-title font-black text-xl">{timer}</div>
          </div>
        </div>

        <div className="caricature-card p-10 relative min-h-[350px] flex flex-col justify-center">
          {!isReady && (
            <div className="absolute inset-0 bg-white/95 rounded-[12px] z-10 flex items-center justify-center p-6">
              <button onClick={startTimer} className="btn-caricature-primary w-full max-w-sm py-6 text-2xl">
                REVEAL QUESTION! 🎯
              </button>
            </div>
          )}
          <h2 className="text-3xl font-black text-black mb-10 leading-tight">{q.q}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {q.opts.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = selectedOption === i;
              const showCorrect = selectedOption !== null && isCorrect;
              const showWrong = isSelected && !isCorrect;

              return (
                <button
                  key={i}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(i)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-4 font-bold text-xl text-left transition-all ${
                    showCorrect
                      ? 'bg-[#4CAF50] border-black text-white scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : showWrong
                      ? 'bg-[#FF5252] border-black text-white animate-shake shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border-black hover:bg-[#FFD600] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-black shrink-0 ${showCorrect || showWrong ? 'bg-white/20 text-white' : 'bg-[#FFD600] text-black'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {currentRound === 3 && (
          <div className="flex justify-center">
            <button onClick={skipQuestion} className="btn-caricature-secondary">
              <SkipForward size={24} className="mr-2" /> SKIP QUESTION
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderKismat = () => {
    const p = players[currentPlayerIdx];
    const cardColors = ["#FF5252", "#448AFF", "#69F0AE", "#E040FB", "#FFAB40"];

    return (
      <div className="flex flex-col items-center gap-10 w-full max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-7xl font-title font-black text-black drop-shadow-[6px_6px_0_#E040FB] uppercase">KISMAT PALAT</h1>
          <p className="text-2xl font-bold text-black/60 mt-4 uppercase tracking-widest">Fate decides your destiny!</p>
        </div>
        <div className="caricature-card p-12 w-full text-center">
          <h2 className="text-3xl font-black mb-12 uppercase tracking-tight">{p.name}, pick your fate!</h2>
          <div className="flex flex-wrap justify-center gap-8 perspective-1000">
            {kismatValues.map((val, i) => {
              const isRevealed = kismatRevealed.includes(i);
              const shouldShowBack = isRevealed || revealAll;
              
              return (
                <motion.div
                  key={`${currentPlayerIdx}-${i}`}
                  onClick={() => !isRevealed && !revealAll && handleKismatPick(i)}
                  initial={{ rotateY: 0, scale: 0.9, opacity: 0 }}
                  animate={{ 
                    rotateY: shouldShowBack ? 180 : 0,
                    scale: 1,
                    opacity: 1
                  }}
                  whileHover={!shouldShowBack ? { y: -15, scale: 1.05, rotate: [0, -2, 2, 0] } : {}}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className={`w-36 h-56 relative preserve-3d cursor-pointer ${shouldShowBack ? 'cursor-default' : ''}`}
                >
                  {/* Front of Card */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: cardColors[i] }}
                  >
                    <div className="w-20 h-32 border-4 border-white/40 rounded-xl flex items-center justify-center">
                      <div className="w-10 h-16 border-2 border-white/30 rounded-lg rotate-45 flex items-center justify-center">
                         <div className="w-4 h-4 bg-white/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Back of Card */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center rotate-y-180 ${isRevealed ? 'bg-white' : 'bg-gray-100 opacity-80'}`}
                  >
                    <div className={`text-5xl font-title font-black ${val >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                      {val >= 0 ? `+${val}` : val}
                    </div>
                    <div className="text-xs font-black text-black/40 mt-3 uppercase tracking-[0.2em]">POINTS</div>
                    {isRevealed && (
                       <div className="absolute top-2 right-2 w-6 h-6 bg-[#FFD600] border-2 border-black rounded-full flex items-center justify-center text-[10px] font-black">✓</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFinal = () => {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center w-full max-w-4xl mx-auto">
        <div className="caricature-card p-12 w-full text-center">
          <Crown className="w-24 h-24 text-[#FFD600] mx-auto mb-6 drop-shadow-[4px_4px_0_black]" />
          <h1 className="font-title text-6xl font-black mb-2 text-black uppercase tracking-tighter">GAME OVER!</h1>
          <p className="text-2xl font-bold text-black/50 mb-12 uppercase">The results are in...</p>
          
          <div className="flex flex-col gap-6 mb-12">
            {sorted.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className={`flex items-center justify-between p-6 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${i === 0 ? 'bg-[#FFD600] scale-105' : 'bg-white'}`}
              >
                <div className="flex items-center gap-6">
                  <span className="font-title text-4xl font-black text-black/20">#{i + 1}</span>
                  <div
                    className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center text-4xl text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.avatar}
                  </div>
                  <span className="text-3xl font-black uppercase tracking-tight">{p.name}</span>
                </div>
                <span className="font-title text-5xl font-black text-black">{p.score}</span>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="btn-caricature-primary w-full py-6 text-3xl flex items-center justify-center gap-4"
          >
            <RotateCcw size={32} /> PLAY AGAIN
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen selection:bg-[#FF5252]/30">
      {players.length > 0 && phase !== 'setup-names' && phase !== 'setup-count' && (
        <>
          <Scoreboard players={players} />
          <MobileScoreboard players={players} />
        </>
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {phase === 'setup-count' && <div key="count">{renderSetupCount()}</div>}
          {phase === 'setup-names' && <div key="names">{renderSetupNames()}</div>}
          {phase === 'transition' && <div key="transition">{renderTransition()}</div>}
          {phase === 'handoff' && <div key="handoff">{renderHandoff()}</div>}
          {phase === 'question' && <div key="question">{renderQuestion()}</div>}
          {phase === 'kismat' && <div key="kismat">{renderKismat()}</div>}
          {phase === 'final' && <div key="final">{renderFinal()}</div>}
        </AnimatePresence>
      </main>

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .perspective-1000 { perspective: 1000px; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}
