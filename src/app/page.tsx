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
    <main className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center" style={{ backgroundColor: '#F5F4F0' }}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob" style={{ backgroundColor: '#f59e0b33' }} />
      <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000" style={{ backgroundColor: '#6366f133' }} />
      <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000" style={{ backgroundColor: '#f59e0b22' }} />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Copy & Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 14px', borderRadius:'999px', border:'1.5px solid #1c2e5e', background:'rgba(28,46,94,0.07)', color:'#1c2e5e', fontSize:'0.875rem', fontWeight:500 }}>
            <Lock style={{ width:'14px', height:'14px' }} />
            <span>Şuanlık Sadece davetiye ile</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight flex items-center" style={{ color: '#1c2e5e' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="KampusOdak Logo"
              style={{
                height: '0.85em',
                width: 'auto',
                display: 'inline-block',
                verticalAlign: 'middle',
                marginLeft: '0',
                marginRight: '0.08em',
              }}
            />
            ampus<span style={{ color: '#f59e0b' }}>Odak</span>
          </h1>
          
          <p className="text-xl max-w-lg leading-relaxed" style={{ color: '#1c2e5e' }}>
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
                <label className="text-sm font-medium text-white">Davetiye / Kurum Kodu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/25 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-white/60 uppercase tracking-widest"
                    placeholder="KURUM-V123 VEYA XYZ-123-ABC"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">E-posta Adresi</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/25 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-white/60"
                placeholder="isim@universite.edu.tr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Şifre</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/25 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-white/60"
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
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {isLogin ? "Davetiyeniz var mı? Kayıt Olun" : "Zaten üye misiniz? Giriş Yapın"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}


