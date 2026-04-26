/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // GİRİŞ YAP (LOGIN)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          setError(error.message);
        } else if (data.session) {
          // Başarılı giriş, role göre yönlendir
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
          if (profile?.role === 'admin') {
            router.push("/admin");
          } else {
            router.push("/dashboard"); // Ana kullanıcı dashboard rotası (ileride yapılacak)
          }
        }
      } else {
        // KAYIT OL (REGISTER) - Sıfırdan
        // Önce davetiye kodunu kontrol edelim (Admin bypass yok, herkes davetiye ile girebilir ya da panelden manuel eklenebilir)
        const { data: inviteList, error: inviteError } = await supabase.from('invites').select('*').eq('code', inviteCode.trim()).eq('is_active', true);
        
        if (inviteError || !inviteList || inviteList.length === 0) {
          setError("Geçersiz veya kullanılmış davetiye kodu!");
          setLoading(false);
          return;
        }


        // Davetiye geçerli, hesabı oluşturalım
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: email.split('@')[0],
              invite_code: inviteCode.trim() 
            }
          }
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (authData.user) {
          // NOT: Davetiye aktifleştirme (is_active = false) ve Kurum (dershane_id) atama işlemleri
          // artık Supabase tarafında (handle_new_user) Trigger içinde otomatik, hatasız ve 0 gecikmeyle yapılacak!

          if (authData.session) {
            router.push("/dashboard");
          } else {
            // Force sign in if session was not returned immediately
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signInData.session) {
              router.push("/dashboard");
            } else {
              console.error("Auto-login error:", signInError);
              alert("Kayıt başarılı! Lütfen giriş yapın.");
              setIsLogin(true);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-center items-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Copy & Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-sm text-accent">
            <Lock className="w-4 h-4" />
            <span>Şuanlık Sadece davetiye ile</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '2px solid rgba(255,255,255,0.18)',
              borderRadius: '16px',
              padding: '0.18em 0.55em 0.18em 0.3em',
              backdropFilter: 'blur(4px)',
              background: 'rgba(255,255,255,0.04)',
              gap: '0.12em',
            }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground flex items-center" style={{ margin: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="KampusOdak Logo"
                style={{
                  height: '0.85em',
                  width: 'auto',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginRight: '0.05em',
                }}
              />
              ampus<span className="text-primary">Odak</span>
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
            Yeni nesil dijital çalışma kütüphanesi. Evdeki dikkat dağıtıcıları geride bırakın ve hedeflerinize binlerce öğrenciyle birlikte kesintisiz odaklanın
          </p>


        </motion.div>

        {/* Right Side: Glassmorphism Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-panel rounded-2xl p-8 lg:p-12 shadow-2xl relative"
        >
          {/* Subtle top reflection */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Platforma Giriş Yap</h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center text-balance">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Davetiye / Kurum Kodu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary/60" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-white/30 uppercase tracking-widest"
                    placeholder="KURUM-V123 VEYA XYZ-123-ABC"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">E-posta Adresi</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-white/30"
                placeholder="isim@universite.edu.tr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Şifre</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-white/30"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 group disabled:opacity-50"
            >
              <span>{loading ? "İşleniyor..." : (isLogin ? "Giriş Yap" : "Davetiye ile Kayıt Ol")}</span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {isLogin ? "Davetiyeniz var mı? Kayıt Olun" : "Zaten üye misiniz? Giriş Yapın"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}


