"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Timer, Flame, Target, BookOpen, Clock, Loader2, Award, Star, User, Building } from "lucide-react";

type Profile = { id: string; full_name: string; total_hours: number; streak: number; xp?: number; role?: string };
type Trivia = { id: number; category: string; question: string; options: string[]; correct_answer: string };

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matchmaking, setMatchmaking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("YKS");
  const [selectedDuration, setSelectedDuration] = useState<number>(50);
  const [triviaList, setTriviaList] = useState<Trivia[]>([]);
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  const [triviaFeedback, setTriviaFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [roomFound, setRoomFound] = useState<string | null>(null);

  // Fetch initial profile data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (error || !data) {
        console.error("Error fetching profile, possibly banned or deleted:", error);
        await supabase.auth.signOut();
        router.push("/");
        return;
      }
      
      setProfile(data);
      supabase.rpc('leave_pool', { p_user_id: data.id }).then();
    };
    fetchUser();
  }, [router]);

  // Matchmaking Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchmaking && profile && !roomFound) {
      const ping = async () => {
        try {
          const { data } = await supabase.rpc('ping_matchmaking', {
            p_user_id: profile.id,
            p_category: selectedCategory,
            p_duration: selectedDuration
          });
          if (data && typeof data === 'string') {
            setRoomFound(data);
          }
        } catch (e) {
          console.error("Matchmaking ping error:", e);
        }
      };
      
      ping(); // Initial trigger
      interval = setInterval(ping, 5000); // 5 sec interval heartbeat
    }
    return () => clearInterval(interval);
  }, [matchmaking, profile, selectedCategory, selectedDuration, roomFound]);

  // Handle Matchmaking click
  const startMatchmaking = async () => {
    setMatchmaking(true);
    setRoomFound(null);
    setCurrentTriviaIndex(0);
    
    // Fetch Trivia questions
    const { data } = await supabase.from("trivia").select("*").eq("category", selectedCategory);
    if (data && data.length > 0) {
      setTriviaList(data.sort(() => 0.5 - Math.random()));
    }
  };

  const cancelMatchmaking = async () => {
    setMatchmaking(false);
    if (profile) {
      await supabase.rpc('leave_pool', { p_user_id: profile.id });
    }
  };

  // Switch to room when found
  useEffect(() => {
    if (roomFound) {
      const timer = setTimeout(() => {
        router.push(`/room/${roomFound}?duration=${selectedDuration}&category=${selectedCategory}`);
      }, 2000); 
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [roomFound, router]);

  const handleTriviaAnswer = async (answer: string) => {
    const current = triviaList[currentTriviaIndex];
    if (answer === current.correct_answer) {
      setTriviaFeedback("correct");
      if (profile) {
        setProfile({ ...profile, xp: (profile.xp || 0) + 5 });
        supabase.rpc('increment_xp', { p_user_id: profile.id, p_amount: 5 }).then();
      }
    } else {
      setTriviaFeedback("incorrect");
    }

    setTimeout(() => {
      setTriviaFeedback(null);
      setCurrentTriviaIndex((prev) => (prev + 1) % triviaList.length);
    }, 1500);
  };

  if (!profile) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-0 w-full h-96 bg-primary/10 rounded-b-full filter blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Kampus<span className="text-primary">Odak</span></h1>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex space-x-4 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm font-medium">
            <span className="flex items-center space-x-1"><Flame className="w-4 h-4 text-orange-400" /> <span>{profile.streak} Gün Serisi</span></span>
            <span className="text-white/20">|</span>
            <span className="flex items-center space-x-1"><Timer className="w-4 h-4 text-accent" /> <span>{profile.total_hours} Saat Odak</span></span>
            <span className="text-white/20">|</span>
            <span className="flex items-center space-x-1"><Star className="w-4 h-4 text-yellow-400" /> <span className="w-12 text-left">{profile.xp || 0} XP</span></span>
          </div>
          
          <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
            <button onClick={() => router.push("/profile")} className="text-muted-foreground hover:text-white transition" title="Profilim">
              <User className="w-5 h-5" />
            </button>

            {profile.role === 'dershane' && (
               <button onClick={() => router.push("/dershane")} className="text-blue-400 hover:text-blue-300 transition" title="Kurum Paneli">
                 <Building className="w-5 h-5" />
               </button>
            )}

            <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="text-muted-foreground hover:text-red-400 transition ml-2" title="Çıkış Yap">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          {!matchmaking ? (
            // STANDBY STATE
            <motion.div key="standby" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">Hoş geldin, {profile.full_name || 'Öğrenci'}</h2>
                <p className="text-muted-foreground text-sm">Hedefini ve pomodoro süreni seç.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {["YKS", "KPSS", "Üniversite"].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-3 rounded-xl text-center font-medium transition-all text-sm ${selectedCategory === cat ? "bg-primary/20 border-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] text-primary border" : "bg-white/5 border-transparent text-muted-foreground border hover:bg-white/10 hover:text-white"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-8">
                {[25, 50].map((dur) => (
                  <button 
                    key={dur} onClick={() => setSelectedDuration(dur)}
                    className={`p-3 rounded-xl text-center font-medium transition-all flex items-center justify-center space-x-2 text-sm ${selectedDuration === dur ? "bg-accent/20 border-accent shadow-[inset_0_0_20px_rgba(236,72,153,0.1)] text-accent border" : "bg-white/5 border-transparent text-muted-foreground border hover:bg-white/10 hover:text-white"}`}
                  >
                    <Clock className="w-4 h-4" /> <span>{dur} Dakika</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={startMatchmaking}
                className="w-full py-5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 relative group overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Clock className="w-5 h-5" />
                <span>Odaklanmaya Başla</span>
              </button>
            </motion.div>
          ) : (
            // MATCHMAKING & TRIVIA STATE
            <motion.div 
              key="matchmaking" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: roomFound ? 1.2 : 1, filter: roomFound ? "blur(4px)" : "blur(0px)" }} 
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={`max-w-xl w-full text-center space-y-8`}
            >
              
              <div className="flex flex-col items-center justify-center space-y-4 mb-12">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary animate-spin ${roomFound ? "!border-green-500 !border-t-green-500" : ""}`} />
                  <Target className={`w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${roomFound ? "text-green-500" : "text-primary"}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold tracking-widest uppercase transition-colors ${roomFound ? "text-green-400" : "text-white"}`}>
                    {roomFound ? "Eşleşme Bulundu!" : "Eş Aranıyor..."}
                  </h2>
                  <p className="text-primary/70 text-sm mt-1">
                    {roomFound ? "Odak odasına aktarılıyorsunuz..." : `${selectedCategory} • ${selectedDuration}dk havuzu taranıyor`}
                  </p>
                </div>
              </div>

              {!roomFound && triviaList.length > 0 && (
                <div className="glass-panel p-8 rounded-2xl text-left relative overflow-hidden">
                  {triviaFeedback === "correct" && <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center z-20"><div className="flex flex-col items-center"><Award className="w-20 h-20 text-green-400 animate-bounce" /><span className="text-green-400 font-bold mt-2 text-xl shadow-black drop-shadow-lg">+5 XP</span></div></div>}
                  {triviaFeedback === "incorrect" && <div className="absolute inset-0 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center z-20"><span className="text-4xl text-red-400 font-bold shadow-black drop-shadow-md">Yanlış!</span></div>}

                  <div className="text-xs font-bold text-accent mb-4 tracking-widest uppercase">Zihin Isındırması (Soru {currentTriviaIndex + 1})</div>
                  <h3 className="text-lg text-white mb-6 leading-relaxed">{triviaList[currentTriviaIndex].question}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {triviaList[currentTriviaIndex].options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleTriviaAnswer(opt)}
                        disabled={triviaFeedback !== null}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-3 rounded-lg text-sm text-left transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!roomFound && (
                <button onClick={cancelMatchmaking} className="text-muted-foreground hover:text-white text-sm underline underline-offset-4 transition-colors z-20 relative">Aramayı İptal Et</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
