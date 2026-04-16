"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Award, Clock, Flame, Shield, User, Building, ExternalLink } from "lucide-react";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  total_hours: number;
  streak: number;
  xp: number;
  role: string;
  dershane_id: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dershaneName, setDershaneName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      
      if (error || !data) {
        await supabase.auth.signOut();
        router.push("/");
        return;
      }
      
      setProfile(data);
        
      // Fetch Dershane name if exists
      if (data.dershane_id) {
        const { data: dData } = await supabase.from("profiles").select("full_name").eq("id", data.dershane_id).single();
        if (dData) {
          setDershaneName(dData.full_name);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-y-auto">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation */}
        <button 
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 text-muted-foreground hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Dashboard&apos;a Dön</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-bl-[100px] -z-10" />
              
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center overflow-hidden relative">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{profile.full_name || 'Öğrenci'}</h1>
                    <p className="text-muted-foreground mt-1 flex items-center space-x-2">
                       <span>{profile.email}</span>
                       <span className={`px-2 py-0.5 text-xs rounded-full border ${profile.role === 'admin' ? 'bg-red-500/20 border-red-500/50 text-red-400' : profile.role === 'dershane' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-primary/20 border-primary/50 text-primary-light'}`}>
                         {profile.role.toUpperCase()}
                       </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Dahil edilme: {new Date(profile.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </div>

              {/* Kurum Bilgisi */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Eğitim Organizasyonu</h3>
                {dershaneName ? (
                  <div className="flex items-center space-x-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Building className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">{dershaneName}</h4>
                      <p className="text-sm text-blue-400/80">Bu kurumun özel davetlik öğrencisisiniz.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 bg-white/5 border border-white/10 p-4 rounded-xl opacity-70">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <Building className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Bireysel Kullanıcı</h4>
                      <p className="text-sm text-muted-foreground">Herhangi bir kuruma bağlı değilsiniz.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <Flame className="w-8 h-8 text-orange-400 mb-2" />
                <div className="text-3xl font-bold">{profile.streak}</div>
                <div className="text-sm text-muted-foreground mt-1">Günde Çelik Seri</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 text-accent mb-2" />
                <div className="text-3xl font-bold">{profile.total_hours}</div>
                <div className="text-sm text-muted-foreground mt-1">Saat Odaklanma</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <Award className="w-8 h-8 text-yellow-400 mb-2" />
                <div className="text-3xl font-bold">{profile.xp || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Kazanılan XP</div>
              </div>
            </div>
          </div>

          {/* Right Column: Advertisement Panels */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent" />
              <span>Destekçilerimiz</span>
            </h3>
            <p className="text-sm text-muted-foreground">KampusOdak ekosistemini destekleyen çözüm ortaklarımız.</p>
            
            {/* Ad 1 */}
            <a href="#" className="block group">
              <div className="glass-panel rounded-2xl overflow-hidden relative border border-white/10 transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <div className="h-40 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                     {/* Placeholder for Sponsor Image */}
                     <span className="text-2xl font-bold opacity-30 tracking-widest uppercase">GÜNCEL YAYINLAR</span>
                   </div>
                </div>
                <div className="p-5 relative">
                   <div className="absolute top-0 right-4 -translate-y-1/2 p-2 bg-primary text-xs rounded-full font-bold shadow-lg">
                     %20 İndirim
                   </div>
                   <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
                      Güncel Yayınları
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </h4>
                   <p className="text-sm text-muted-foreground line-clamp-2">KampusOdak öğrencilerine özel tüm TYT-AYT denemelerinde net indirim fırsatı.</p>
                </div>
              </div>
            </a>

            {/* Ad 2 */}
            <a href="#" className="block group">
              <div className="glass-panel rounded-2xl overflow-hidden relative border border-white/10 transition-all group-hover:border-accent/50 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                 <div className="h-40 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-2xl font-bold opacity-30 tracking-widest uppercase">MERKEZ KİTABEVİ</span>
                   </div>
                </div>
                <div className="p-5">
                   <h4 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors flex items-center justify-between">
                      Merkez Kitabevi (Denizli)
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </h4>
                   <p className="text-sm text-muted-foreground">Mağazamızda geçerli öğrenci kartınızı gösterin, anında avantajları yakalayın.</p>
                </div>
              </div>
            </a>
            
          </div>
        </div>
      </div>
    </div>
  );
}
