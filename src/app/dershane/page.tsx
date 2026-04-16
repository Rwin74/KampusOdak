"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Send, Copy, Check, Clock, Flame, ShieldAlert } from "lucide-react";

type Student = {
  id: string;
  email: string;
  full_name: string;
  total_hours: number;
  streak: number;
  created_at: string;
};

type Invite = {
  code: string;
  is_active: boolean;
  created_at: string;
  used_by: string | null;
};

export default function DershanePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      // Check role
      const { data: profile, error } = await supabase.from("profiles").select("id, role").eq("id", session.user.id).single();
      if (error || !profile || profile.role !== 'dershane') {
        if (error || !profile) await supabase.auth.signOut();
        router.push("/dashboard");
        return;
      }

      // Fetch Students
      const { data: studentsData } = await supabase.from("profiles")
        .select("id, email, full_name, total_hours, streak, created_at")
        .eq("dershane_id", profile.id)
        .order("total_hours", { ascending: false });

      if (studentsData) setStudents(studentsData);

      // Fetch Invites
      const { data: invitesData } = await supabase.from("invites")
        .select("code, is_active, created_at, used_by")
        .eq("created_by", profile.id)
        .order("created_at", { ascending: false });
        
      if (invitesData) setInvites(invitesData);

      setLoading(false);
    };

    init();
  }, [router]);

  const generateInviteCode = async () => {
    setIsGenerating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Generate a code (e.g. KURUM-XXXX-YYYY)
    const code = `KURUM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const { error } = await supabase.from("invites").insert({
      code,
      created_by: session.user.id,
      is_active: true
    });

    if (!error) {
      setInvites([{ code, is_active: true, created_at: new Date().toISOString(), used_by: null }, ...invites]);
    } else {
      console.error("DAVETIYE_INSERT_ERROR:", error);
      alert("Davetiye oluşturulamadı: " + error.message);
    }
    setIsGenerating(false);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
         <header className="flex justify-between items-center mb-10">
           <div>
             <button onClick={() => router.push("/dashboard")} className="flex items-center space-x-2 text-muted-foreground hover:text-white transition-colors mb-4">
                <ArrowLeft className="w-5 h-5" />
                <span>Geri Dön</span>
             </button>
             <h1 className="text-3xl font-bold flex items-center space-x-3">
               <Building className="w-8 h-8 text-blue-500" />
               <span>Kurum / Dershane Paneli</span>
             </h1>
             <p className="text-muted-foreground mt-2">Öğrencilerinizin performansını takip edin ve yeni davetiyeler oluşturun.</p>
           </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Col: Invites & Actions */}
           <div className="lg:col-span-1 space-y-6">
             <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-4">Öğrenci Davet Et</h3>
                <p className="text-sm text-muted-foreground mb-6">Kurumunuza özel davetiye kodları oluşturarak öğrencilerinizi KampusOdak sistemine dahil edebilirsiniz.</p>
                
                <button 
                  onClick={generateInviteCode}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isGenerating ? "Oluşturuluyor..." : "Yeni Davetiye Kodu Üret"}</span>
                </button>
             </div>

             <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-4">Özel Kodlarınız</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {invites.length === 0 && <p className="text-sm text-muted-foreground">Henüz kod oluşturmadınız.</p>}
                  
                  {invites.map(inv => (
                    <div key={inv.code} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                       <div>
                         <div className="font-mono text-sm tracking-wider font-semibold">{inv.code}</div>
                         <div className="text-xs mt-1">
                           {inv.is_active ? 
                             <span className="text-green-400">🟢 Boşta</span> : 
                             <span className="text-muted-foreground">🔴 Kullanıldı</span>
                           }
                         </div>
                       </div>
                       <button 
                         onClick={() => handleCopy(inv.code)}
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                         title="Kodu Kopyala"
                       >
                         {copiedCode === inv.code ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                       </button>
                    </div>
                  ))}
                </div>
             </div>
           </div>

           {/* Right Col: Students Leaderboard */}
           <div className="lg:col-span-2">
              <div className="glass-panel p-6 rounded-2xl h-full">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>Öğrenci Performans Tablosu</span>
                  </h3>
                  <div className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                    {students.length} Öğrenci Kayıtlı
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                    <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
                    <p>Kurumunuza atanmış henüz hiçbir öğrenci bulunmuyor.</p>
                    <p className="text-sm mt-2">Öğrencilerinize sol taraftan ürettiğiniz davetiye kodlarını vererek kayıt olmalarını isteyin.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-sm text-muted-foreground">
                          <th className="p-4 font-medium uppercase tracking-wider">Öğrenci Kodu/Adı</th>
                          <th className="p-4 font-medium uppercase tracking-wider text-center">Seri (Gün)</th>
                          <th className="p-4 font-medium uppercase tracking-wider text-right">Odak (Saat)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, idx) => (
                          <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-white">{student.full_name}</div>
                                  <div className="text-xs text-muted-foreground">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                               <div className="inline-flex flex-col items-center justify-center">
                                 <Flame className="w-4 h-4 text-orange-400 mb-1" />
                                 <span className="font-medium">{student.streak}</span>
                               </div>
                            </td>
                            <td className="p-4 text-right">
                               <div className="inline-flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                 <Clock className="w-4 h-4 text-accent" />
                                 <span className="font-mono text-lg">{student.total_hours} <span className="text-xs text-muted-foreground">st</span></span>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
           </div>

         </div>
      </div>

    </div>
  );
}

// Temporary Building icon if lucide-react doesn't have it explicitly
function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}
