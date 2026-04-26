"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Timer, Flame, Target, BookOpen, Clock, Loader2, Award, Star, User, Building, ExternalLink, Library, LineChart, ShoppingCart, PlayCircle, Trophy } from "lucide-react";

export const dynamic = 'force-dynamic';

type Profile = { id: string; full_name: string; total_hours: number; streak: number; xp?: number; role?: string; onboarding_completed?: boolean; focus_targets?: string[]; education_level?: string; daily_goal?: string; };
type Trivia = { id: number; category: string; question: string; options: string[]; correct_answer: string };
type BilgiKosesi = { id: string; baslik: string; icerik: string; kategori: string; created_at: string };
type Haberler = { id: string; baslik: string; icerik: string; link?: string; kategori: string; created_at: string };

function OnboardingWizard({ profile, onComplete }: { profile: Profile; onComplete: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [focusTargets, setFocusTargets] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [dailyGoal, setDailyGoal] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const focusOptions = ["YKS (TYT/AYT)", "LGS", "KPSS / DGS / ALES", "Yabancı Dil (YDS/TOEFL)", "Sadece Okuma / Genel Odak"];
  const eduOptions = ["Lise (9, 10, 11. Sınıf)", "12. Sınıf / Sınav Senesi", "Mezun Grubu", "Üniversite Öğrencisi", "Çalışan / Profesyonel"];
  const goalOptions = ["🥉 1-2 Saat (Isınma Turu)", "🥈 3-5 Saat (Ciddi Rekabet)", "🥇 6+ Saat (Şampiyonlar Ligi)"];

  const handleNext = async () => {
    if (step === 1 && focusTargets.length === 0) return;
    if (step === 2 && !educationLevel) return;
    
    if (step === 3 && dailyGoal) {
      setLoading(true);
      await supabase.rpc('complete_onboarding', {
        p_user_id: profile.id,
        p_focus_targets: focusTargets,
        p_education_level: educationLevel,
        p_daily_goal: dailyGoal
      });
      setLoading(false);
      onComplete({ focusTargets, educationLevel, dailyGoal });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 w-full h-96 bg-primary/20 rounded-b-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 w-full h-96 bg-accent/20 rounded-t-full filter blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-2xl glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-between mb-12">
           <h2 className="text-xl font-bold tracking-widest uppercase text-muted-foreground">Kişiselleştirme</h2>
           <div className="flex space-x-2">
             {[1, 2, 3].map(i => (
               <div key={i} className={`w-3 h-3 rounded-full transition-colors duration-500 ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`} />
             ))}
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 leading-tight">Neye odaklanıyorsun? <span className="block text-lg font-medium text-muted-foreground mt-2">(Birden fazla seçebilirsin)</span></h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {focusOptions.map(opt => (
                  <button key={opt} onClick={() => setFocusTargets(prev => prev.includes(opt) ? prev.filter(t => t !== opt) : [...prev, opt])} className={`p-4 rounded-xl border text-left font-semibold transition-all ${focusTargets.includes(opt) ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 leading-tight">Şu anki eğitim durumun nedir?</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eduOptions.map(opt => (
                  <button key={opt} onClick={() => { setEducationLevel(opt); setTimeout(() => setStep(3), 400); }} className={`p-4 rounded-xl border text-left font-semibold transition-all ${educationLevel === opt ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 leading-tight">KampüsOdak'ta günlük hedefin kaç saat?</h1>
              <div className="grid grid-cols-1 gap-4">
                {goalOptions.map(opt => (
                  <button key={opt} onClick={() => setDailyGoal(opt)} className={`p-5 rounded-xl border text-left font-semibold transition-all text-lg ${dailyGoal === opt ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center">
          {step > 1 ? (
             <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-muted-foreground hover:text-white transition-colors font-medium">Geri</button>
          ) : <div />}
          <button 
            onClick={handleNext} 
            disabled={loading || (step === 1 && focusTargets.length === 0) || (step === 2 && !educationLevel) || (step === 3 && !dailyGoal)}
            className="px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <span>{loading ? 'Kaydediliyor...' : (step === 3 ? 'Başla' : 'Devam Et')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState("kontrol_paneli");

  // Fetch initial profile data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      let profileData = null;
      let retries = 5;
      
      while (retries > 0 && !profileData) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (data) {
           profileData = data;
        } else {
           await new Promise(res => setTimeout(res, 500));
           retries--;
        }
      }

      if (!profileData) {
        console.error("Error fetching profile, possibly banned or deleted");
        await supabase.auth.signOut();
        router.push("/");
        return;
      }

      setProfile(profileData);
      supabase.rpc('leave_pool', { p_user_id: profileData.id }).then();
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

  if (!profile.onboarding_completed) {
    return <OnboardingWizard profile={profile} onComplete={(data) => {
      setProfile({ ...profile, onboarding_completed: true, focus_targets: data.focusTargets, education_level: data.educationLevel, daily_goal: data.dailyGoal });
      if (data.focusTargets && data.focusTargets.length > 0) {
         let cat = "YKS";
         if (data.focusTargets.join(',').includes("LGS")) cat = "LGS";
         if (data.focusTargets.join(',').includes("KPSS")) cat = "KPSS";
         if (data.focusTargets.join(',').includes("Yabancı Dil")) cat = "YDS/TOEFL";
         setSelectedCategory(cat);
      }
    }} />;
  }

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
              <button onClick={() => setActiveTab("kontrol_paneli")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-lg transition-colors border-l-2 ${activeTab === "kontrol_paneli" ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"}`}>
                 <Target className="w-5 h-5" />
                 <span className="font-semibold tracking-wide text-sm">Kontrol Paneli</span>
              </button>
              <button onClick={() => setActiveTab("sanal_kutuphane")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-lg transition-colors border-l-2 ${activeTab === "sanal_kutuphane" ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"}`}>
                 <Library className="w-5 h-5" />
                 <span className="font-medium tracking-wide text-sm">Sanal Kütüphane</span>
              </button>
              <button onClick={() => setActiveTab("gelisim_raporu")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-lg transition-colors border-l-2 ${activeTab === "gelisim_raporu" ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"}`}>
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
              <button onClick={() => setActiveTab("kampus_market")} className={`w-full flex items-center justify-between px-4 py-3 rounded-r-lg transition-colors group border-l-2 ${activeTab === "kampus_market" ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"}`}>
                 <div className="flex items-center space-x-3">
                    <ShoppingCart className={`w-5 h-5 transition-colors ${activeTab === "kampus_market" ? "text-primary" : "group-hover:text-primary"}`} />
                    <span className="font-medium tracking-wide text-sm">Kampüs Market</span>
                 </div>
                 <span className="text-[9px] font-bold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse">YENİ</span>
              </button>
              <button onClick={() => setActiveTab("video_akademi")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-lg transition-colors group border-l-2 ${activeTab === "video_akademi" ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"}`}>
                 <PlayCircle className={`w-5 h-5 transition-colors ${activeTab === "video_akademi" ? "text-accent" : "group-hover:text-accent"}`} />
                 <span className="font-medium tracking-wide text-sm">Video Akademi</span>
              </button>
              <button onClick={() => setActiveTab("basari_odasi")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-lg transition-colors group border-l-2 ${activeTab === "basari_odasi" ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"}`}>
                 <Trophy className={`w-5 h-5 transition-colors ${activeTab === "basari_odasi" ? "text-yellow-400" : "group-hover:text-yellow-400"}`} />
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
        <header className="px-4 py-4 sm:p-6 flex justify-end items-center relative z-10 border-b border-white/5 bg-background/50 backdrop-blur-md">
          <div className="flex items-center space-x-2 sm:space-x-6">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-medium">
              <span className="flex items-center space-x-1 whitespace-nowrap"><Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" /> <span>{profile.streak} <span className="hidden sm:inline">Gün Serisi</span><span className="sm:hidden">Gün</span></span></span>
              <span className="text-white/20 px-1.5 sm:px-3">|</span>
              <span className="flex items-center space-x-1 whitespace-nowrap"><Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" /> <span>{profile.total_hours} <span className="hidden sm:inline">Saat Toplam Odak</span><span className="sm:hidden">Saat</span></span></span>
              <span className="text-white/20 px-1.5 sm:px-3">|</span>
              <span className="flex items-center space-x-1 whitespace-nowrap"><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" /> <span className="w-auto sm:w-20 text-left">{profile.xp || 0} <span className="hidden sm:inline">Toplam </span>XP</span></span>
            </div>
            
            {/* Mobile Menu Actions */}
            <div className="md:hidden flex items-center space-x-2 sm:space-x-3 border-l border-white/20 pl-2 sm:pl-4">
              <button onClick={() => router.push("/profile")} className="text-muted-foreground hover:text-white transition">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="text-muted-foreground hover:text-red-400 transition ml-1 sm:ml-2">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 relative z-10 pt-12 pb-24 md:pb-6">
        {activeTab === "kontrol_paneli" && (<>
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
        </>)}

        {/* SANAL KÜTÜPHANE */}
        {activeTab === "sanal_kutuphane" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
            <div className="flex items-center space-x-3 mb-8">
              <Library className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Sanal Kütüphane</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                     <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded-md uppercase tracking-wider">{i % 2 === 0 ? 'KPSS' : 'YKS'} SALONU</span>
                     <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div><span className="text-xs text-muted-foreground">{100 + i * 23} Kişi</span></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Odak Salonu {i}</h3>
                  <p className="text-sm text-muted-foreground mb-6">Sessiz çalışma ortamı. Kameralar açık, mikrofonlar kapalı.</p>
                  <button className="w-full py-2 bg-white/5 hover:bg-primary/20 text-white rounded-lg font-medium transition-colors border border-white/5 group-hover:border-primary/50 text-sm">
                    Göz At
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* GELİŞİM RAPORU */}
        {activeTab === "gelisim_raporu" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
            <div className="flex items-center space-x-3 mb-8">
              <LineChart className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Gelişim Raporu</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                 <h4 className="text-sm text-muted-foreground mb-2">Haftalık Toplam Odak</h4>
                 <div className="text-4xl font-extrabold text-white">24<span className="text-lg text-primary ml-1">sa</span></div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                 <h4 className="text-sm text-muted-foreground mb-2">En Verimli Gün</h4>
                 <div className="text-4xl font-extrabold text-white">Salı</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                 <h4 className="text-sm text-muted-foreground mb-2">Genel Sıralama</h4>
                 <div className="text-4xl font-extrabold text-white">#142</div>
              </div>
            </div>
            <div className="w-full h-64 glass-panel rounded-2xl border border-white/10 flex items-center justify-center">
               <span className="text-muted-foreground">Grafik verileri yakında yüklenecek...</span>
            </div>
          </motion.div>
        )}

        {/* KAMPÜS MARKET */}
        {activeTab === "kampus_market" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
               <div className="flex items-center space-x-3">
                 <ShoppingCart className="w-8 h-8 text-primary" />
                 <div>
                   <h2 className="text-3xl font-bold flex items-center space-x-2">Kampüs Market <span className="ml-3 px-2 py-1 bg-accent text-white text-xs font-bold rounded-lg uppercase tracking-wider animate-pulse">YENİ</span></h2>
                   <p className="text-sm text-muted-foreground mt-1">Sadece platform üyelerine özel indirimli fiyatlar ve fırsatlar.</p>
                 </div>
               </div>
               <div className="flex items-center space-x-2 bg-yellow-400/10 px-4 py-2 rounded-xl border border-yellow-400/20">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-yellow-400">{profile.xp || 0} XP Bakiye</span>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Limit YKS Seti", desc: "Tüm dersler soru bankası seti.", oldPrice: "₺1,200", price: "₺890", xp: "veya 5000 XP" },
                { title: "Dijital Deneme Kulübü", desc: "1 Aylık sınırsız deneme erişimi.", oldPrice: "₺200", price: "₺140", xp: "veya 800 XP" },
                { title: "Kahve Çeki (Starbucks)", desc: "1 Adet Tall boy filtre kahve.", oldPrice: "₺80", price: "₺0", xp: "Sadece 300 XP" },
              ].map((item, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all flex flex-col justify-between group">
                  <div>
                     <div className="w-full h-32 bg-background/50 rounded-xl mb-4 flex items-center justify-center border border-white/5">
                        <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                     </div>
                     <h3 className="text-lg font-bold mb-1 text-white group-hover:text-primary transition-colors">{item.title}</h3>
                     <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{item.desc}</p>
                  </div>
                  <div>
                     <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-muted-foreground line-through">{item.oldPrice}</span>
                        <span className="text-xl font-extrabold text-white">{item.price}</span>
                     </div>
                     <div className="text-xs font-bold text-yellow-400 mb-4">{item.xp}</div>
                     <button className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                       Sepete Ekle
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VİDEO AKADEMİ */}
        {activeTab === "video_akademi" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
            <div className="flex items-center space-x-3 mb-8">
              <PlayCircle className="w-8 h-8 text-accent" />
              <div>
                <h2 className="text-3xl font-bold">Video Akademi</h2>
                <p className="text-sm text-muted-foreground mt-1">Mola ve odaklanma rehberleri, seçilmiş ders özetleri.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                "Sınav Stresiyle Baş Etme (10 dk)",
                "4 Saat Aralıksız Odaklanma Rehberi",
                "Tarih Full Tekrar - YKS 2024",
                "Matematik Hızlı Çözüm Taktikleri",
                "Uyku Düzeni Nasıl Kurulur?",
                "Pomodoro Tekniği İle Çalışma"
              ].map((title, i) => (
                <div key={i} className="glass-panel p-0 overflow-hidden rounded-2xl border border-white/10 hover:border-accent/50 transition-all cursor-pointer group">
                  <div className="w-full h-40 bg-zinc-800 relative flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold">12:45</div>
                  </div>
                  <div className="p-4">
                     <h3 className="text-sm font-bold mb-1 text-white group-hover:text-accent transition-colors line-clamp-2">{title}</h3>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Eğitim</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* BAŞARI ODASI */}
        {activeTab === "basari_odasi" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
               <div className="flex items-center space-x-3">
                 <Trophy className="w-8 h-8 text-yellow-400" />
                 <div>
                   <h2 className="text-3xl font-bold">Başarı Odası</h2>
                   <p className="text-sm text-muted-foreground mt-1">Görevleri tamamla, XP kazan ve profilini özelleştir.</p>
                 </div>
               </div>
               <div className="flex items-center space-x-2 bg-yellow-400/10 px-4 py-2 rounded-xl border border-yellow-400/20">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-yellow-400">{profile.xp || 0} XP Toplam</span>
               </div>
            </div>

            <h3 className="text-lg font-bold mb-4 text-white">Günlük Görevler</h3>
            <div className="space-y-4 mb-12">
               {[
                 { title: "Güne Erken Başla", desc: "Sabah 08:00'den önce ilk odaklanmanı tamamla.", xp: "+20 XP", done: true },
                 { title: "Maraton Koşucusu", desc: "Bugün toplam 300 dakika odaklan.", xp: "+50 XP", done: false },
                 { title: "Soru Canavarı", desc: "Trivia zihin ısındırmasında 3 soruyu doğru bil.", xp: "+15 XP", done: false },
               ].map((q, i) => (
                 <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${q.done ? 'bg-green-500/10 border-green-500/20' : 'glass-panel border-white/10'}`}>
                    <div className="flex items-center space-x-4">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${q.done ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-muted-foreground'}`}>
                          {q.done ? <Award className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                       </div>
                       <div>
                          <h4 className={`text-sm font-bold ${q.done ? 'text-green-400 line-through' : 'text-white'}`}>{q.title}</h4>
                          <p className="text-xs text-muted-foreground">{q.desc}</p>
                       </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${q.done ? 'bg-green-500/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>{q.xp}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </main>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-lg border-t border-white/10 flex justify-between items-center px-4 py-2 z-50">
         <button onClick={() => setActiveTab("kontrol_paneli")} className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${activeTab === "kontrol_paneli" ? "text-primary" : "text-muted-foreground hover:text-white"}`}>
            <Target className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-wider">Kontrol</span>
         </button>
         <button onClick={() => setActiveTab("sanal_kutuphane")} className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${activeTab === "sanal_kutuphane" ? "text-primary" : "text-muted-foreground hover:text-white"}`}>
            <Library className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-wider">Odalar</span>
         </button>
         <button onClick={() => setActiveTab("kampus_market")} className={`flex flex-col items-center justify-center w-16 h-12 transition-colors relative ${activeTab === "kampus_market" ? "text-primary" : "text-muted-foreground hover:text-white"}`}>
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-wider">Market</span>
            <span className="absolute top-0 right-2 w-2 h-2 bg-accent rounded-full animate-pulse"></span>
         </button>
         <button onClick={() => setActiveTab("video_akademi")} className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${activeTab === "video_akademi" ? "text-accent" : "text-muted-foreground hover:text-white"}`}>
            <PlayCircle className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-wider">Akademi</span>
         </button>
         <button onClick={() => setActiveTab("basari_odasi")} className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${activeTab === "basari_odasi" ? "text-yellow-400" : "text-muted-foreground hover:text-white"}`}>
            <Trophy className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-wider">Başarı</span>
         </button>
      </nav>

      </div>
    </div>
  );
}
