"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Timer, Flame, Target, BookOpen, Clock, Loader2, Award, Star, User, Building, ExternalLink, Library, LineChart, ShoppingCart, PlayCircle, Trophy } from "lucide-react";

export const dynamic = 'force-dynamic';

type Profile = { id: string; full_name: string; total_hours: number; streak: number; xp?: number; role?: string };
type Trivia = { id: number; category: string; question: string; options: string[]; correct_answer: string };
type BilgiKosesi = { id: string; baslik: string; icerik: string; kategori: string; created_at: string };
type Haberler = { id: string; baslik: string; icerik: string; link?: string; kategori: string; created_at: string };

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
  const [bilgiler, setBilgiler] = useState<BilgiKosesi[]>([]);
  const [haberler, setHaberler] = useState<Haberler[]>([]);

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

  // Fetch Bilgi Köşesi and Haberler
  useEffect(() => {
    const fetchContent = async () => {
      const { data: bilgiData } = await supabase
        .from("bilgi_kosesi")
        .select("*")
        .eq("aktif", true)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: haberData } = await supabase
        .from("haberler")
        .select("*")
        .eq("aktif", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (bilgiData) setBilgiler(bilgiData);
      if (haberData) setHaberler(haberData);
    };
    fetchContent();
  }, []);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background text-white relative flex overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 w-full h-96 bg-primary/10 rounded-b-full filter blur-[100px] pointer-events-none" />

      {/* SaaS Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-background/50 backdrop-blur-md hidden md:flex flex-col z-20">
         <div className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Kampus<span className="text-primary">Odak</span></h1>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto mt-2 pb-4 scrollbar-hide">
           {/* GRUP A: ÇALIŞMA ALANI */}
           <div className="px-6 mb-2 mt-4">
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Çalışma Alanı</span>
           </div>
           <nav className="px-4 space-y-1 mb-8">
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-primary/10 border-l-2 border-primary text-primary rounded-r-lg transition-colors">
                 <Target className="w-5 h-5" />
                 <span className="font-semibold tracking-wide text-sm">Kontrol Paneli</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                 <Library className="w-5 h-5" />
                 <span className="font-medium tracking-wide text-sm">Sanal Kütüphane</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                 <LineChart className="w-5 h-5" />
                 <span className="font-medium tracking-wide text-sm">Gelişim Raporu</span>
              </button>
           </nav>

           <div className="mx-6 h-px bg-white/5 mb-8"></div>

           {/* GRUP B: KAMPÜS EKOSİSTEMİ */}
           <div className="px-6 mb-2">
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Kampüs Ekosistemi</span>
           </div>
           <nav className="px-4 space-y-1 mb-8">
              <button className="w-full flex items-center justify-between px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-colors group">
                 <div className="flex items-center space-x-3">
                    <ShoppingCart className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span className="font-medium tracking-wide text-sm">Kampüs Market</span>
                 </div>
                 <span className="text-[9px] font-bold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse">YENİ</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-colors group">
                 <PlayCircle className="w-5 h-5 group-hover:text-accent transition-colors" />
                 <span className="font-medium tracking-wide text-sm">Video Akademi</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-colors group">
                 <Trophy className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
                 <span className="font-medium tracking-wide text-sm">Başarı Odası</span>
              </button>
           </nav>
           
           <div className="mx-6 h-px bg-white/5 mb-8"></div>

           {/* HESAP */}
           <div className="px-6 mb-2">
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Hesap</span>
           </div>
           <nav className="px-4 space-y-1">
              <button onClick={() => router.push("/profile")} className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                 <User className="w-5 h-5" />
                 <span className="font-medium tracking-wide text-sm">Profilim</span>
              </button>
              {profile.role === 'dershane' && (
              <button onClick={() => router.push("/dershane")} className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                 <Building className="w-5 h-5" />
                 <span className="font-medium tracking-wide text-sm">Kurum Paneli</span>
              </button>
              )}
           </nav>
         </div>
         <div className="p-4 border-t border-white/5">
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors">
               <LogOut className="w-5 h-5" />
               <span className="font-medium tracking-wide">Çıkış Yap</span>
            </button>
         </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <header className="p-6 flex justify-end items-center relative z-10 border-b border-white/5 bg-background/50 backdrop-blur-md">
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm font-medium hidden sm:flex">
              <span className="flex items-center space-x-1"><Flame className="w-4 h-4 text-orange-400" /> <span>{profile.streak} Gün Serisi</span></span>
              <span className="text-white/20 px-3">|</span>
              <span className="flex items-center space-x-1"><Timer className="w-4 h-4 text-accent" /> <span>{profile.total_hours} Saat Toplam Odak</span></span>
              <span className="text-white/20 px-3">|</span>
              <span className="flex items-center space-x-1"><Star className="w-4 h-4 text-yellow-400" /> <span className="w-20 text-left">{profile.xp || 0} Toplam XP</span></span>
            </div>
            
            {/* Mobile Menu Actions */}
            <div className="md:hidden flex items-center space-x-3 border-l border-white/20 pl-4">
              <button onClick={() => router.push("/profile")} className="text-muted-foreground hover:text-white transition">
                <User className="w-5 h-5" />
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="text-muted-foreground hover:text-red-400 transition ml-2">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 relative z-10 pt-12">
        <AnimatePresence mode="wait">
          {!matchmaking ? (
            // STANDBY STATE
            <motion.div key="standby" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center w-full max-w-4xl">
              <div className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-2xl mb-8 border border-white/10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Merhaba, {profile.full_name ? profile.full_name.charAt(0).toUpperCase() + profile.full_name.slice(1) : 'Öğrenci'}!</h2>
                  <p className="text-muted-foreground text-sm">Oturum hedefinizi ve çalışma sürenizi belirleyin.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["YKS", "KPSS", "Üniversite", "VIP Odalar"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-3 rounded-xl text-center font-medium transition-all text-sm flex items-center justify-center space-x-1 ${selectedCategory === cat ? "bg-accent/20 border-accent shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] text-accent border" : "bg-white/5 border-transparent text-muted-foreground border hover:bg-white/10 hover:text-white"}`}
                    >
                      {cat === "VIP Odalar" && <Award className="w-4 h-4 mr-1 text-yellow-400" />}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-8">
                  {[25, 50].map((dur) => (
                    <button
                      key={dur} onClick={() => setSelectedDuration(dur)}
                      className={`p-3 rounded-xl text-center font-medium transition-all flex items-center justify-center space-x-2 text-sm ${selectedDuration === dur ? "bg-accent/20 border-accent shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] text-accent border" : "bg-white/5 border-transparent text-muted-foreground border hover:bg-white/10 hover:text-white"}`}
                    >
                      <Clock className="w-4 h-4" /> <span>{dur} Dakika</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={startMatchmaking}
                  className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center space-x-2 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <Clock className="w-5 h-5" />
                  <span>Odaklanmaya Başla</span>
                </button>
              </div>

              {/* Social Proof & Leaderboard Modules */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                 {/* Social Proof Module */}
                 <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-center shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-colors" />
                    <div className="flex items-center space-x-2 mb-4 relative z-10">
                       <div className="relative flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                       </div>
                       <h3 className="font-bold text-white tracking-wide">{selectedCategory} Odalarında Şu An</h3>
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-6 relative z-10">
                      {Math.floor(Math.random() * 500) + 1200} <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Öğrenci Çalışıyor</span>
                    </div>
                    <div className="flex -space-x-3 overflow-hidden relative z-10">
                       {[11, 23, 34, 45, 56].map((imgId) => (
                          <img key={imgId} className="inline-block h-10 w-10 rounded-full ring-4 ring-background object-cover" src={`https://i.pravatar.cc/100?img=${imgId}`} alt="Öğrenci"/>
                       ))}
                       <div className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-background bg-zinc-800 text-[10px] font-bold text-white shadow-inner">+1k</div>
                    </div>
                 </div>

                 {/* Leaderboard Module */}
                 <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-accent/10 transition-colors" />
                    <div className="flex items-center justify-between mb-5 relative z-10">
                       <div className="flex items-center space-x-2">
                          <Flame className="w-5 h-5 text-accent" />
                          <h3 className="font-bold text-white tracking-wide">Haftalık Liderler</h3>
                       </div>
                       <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded-md">Seri</span>
                    </div>
                    <div className="space-y-3 relative z-10">
                       <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center space-x-3"><span className="text-yellow-400 font-extrabold w-5 text-center">#1</span><span className="text-sm font-semibold text-white">mert34</span></div>
                          <span className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded-md">14 Gün</span>
                       </div>
                       <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center space-x-3"><span className="text-gray-400 font-extrabold w-5 text-center">#2</span><span className="text-sm font-semibold text-white">ayşe_study</span></div>
                          <span className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded-md">12 Gün</span>
                       </div>
                       <div className="flex items-center justify-between p-3 rounded-xl bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                          <div className="flex items-center space-x-3"><span className="text-primary font-extrabold w-5 text-center">#3</span><span className="text-sm font-bold text-white">{profile.full_name?.toLowerCase().replace(/\s/g, '') || 'sen'}</span></div>
                          <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/20 rounded-md">{profile.streak} Gün</span>
                       </div>
                    </div>
                 </div>
              </div>

            </motion.div>
          ) : (
            // MATCHMAKING & TRIVIA STATE
            <motion.div
              key="matchmaking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: roomFound ? 1.2 : 1, filter: roomFound ? "blur(4px)" : "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={`max-w-xl w-full text-center space-y-8 mb-12`}
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

        {/* Bilgi Köşesi Section */}
        {bilgiler.length > 0 && (
          <section className="w-full max-w-4xl mt-8 space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-muted-foreground">Bilgi Köşesi</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bilgiler.map((bilgi) => (
                <motion.div
                  key={bilgi.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-accent uppercase tracking-wider">{bilgi.kategori}</span>
                    <span className="text-xs text-muted-foreground">{new Date(bilgi.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{bilgi.baslik}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bilgi.icerik}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Haberler Section */}
        {haberler.length > 0 && (
          <section className="w-full max-w-4xl mt-12 space-y-4 pb-12">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Okul & Sınav Haberleri</h2>
            </div>
            <div className="space-y-4">
              {haberler.map((haber) => (
                <motion.div
                  key={haber.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{haber.kategori}</span>
                    <span className="text-xs text-muted-foreground">{new Date(haber.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{haber.baslik}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{haber.icerik}</p>
                  {haber.link && (
                    <a
                      href={haber.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
                    >
                      Detaylar için tıklayın
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
      </div>
    </div>
  );
}
