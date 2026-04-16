/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Users, Key, AlertTriangle, Terminal, Zap, Plus, LogOut, Activity, Network, Building, BookOpen, Newspaper } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";

export const dynamic = 'force-dynamic';

type Profile = { id: string; email: string; full_name: string; total_hours: number; streak: number; role: string; created_at: string; org_id?: string; dershane_id?: string };
type Invite = { code: string; created_by: string; used_by: string | null; is_active: boolean; created_at: string };
type Log = { id: string; event_type: string; description: string; user_id: string; created_at: string };
type OrgStats = { org_id: string; org_name: string; total_hours: number; student_count: number };
type ChurnStat = { user_id: string; full_name: string; churn_count: number; total_hours: number };
type BilgiKonesi = { id: string; baslik: string; icerik: string; kategori: string; aktif: boolean; created_at: string; updated_at: string };
type Haberler = { id: string; baslik: string; icerik: string; link?: string; kategori: string; aktif: boolean; created_at: string; updated_at: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "invites" | "users" | "logs" | "tree" | "content">("analytics");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Data states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [orgStats, setOrgStats] = useState<OrgStats[]>([]);
  const [churnStats, setChurnStats] = useState<ChurnStat[]>([]);
  const [bilgiler, setBilgiler] = useState<BilgiKonesi[]>([]);
  const [haberler, setHaberler] = useState<Haberler[]>([]);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (error || !profile) {
        await supabase.auth.signOut();
        router.push("/");
        return;
      }

      if (profile.role === 'admin' || profile.role === 'sub_admin') {
        setIsAdmin(true);
        setUserProfile(profile);
        fetchData();
      } else {
        router.push("/");
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchData = async () => {
    const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (usersData) setProfiles(usersData as Profile[]);

    const { data: invitesData } = await supabase.from("invites").select("*").order("created_at", { ascending: false });
    if (invitesData) setInvites(invitesData as Invite[]);

    if (userProfile?.role === 'admin') {
      const { data: logsData } = await supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (logsData) setLogs(logsData as Log[]);
    }

    if (usersData) {
       const orgMap = new Map();
       usersData.filter((u: any) => u.role === 'dershane').forEach((org: any) => {
          orgMap.set(org.id, { org_id: org.id, org_name: org.full_name || org.email, total_hours: 0, student_count: 0 });
       });
       usersData.forEach((u: any) => {
          if (u.dershane_id && orgMap.has(u.dershane_id)) {
              const stat = orgMap.get(u.dershane_id);
              stat.student_count += 1;
              stat.total_hours += u.total_hours || 0;
          }
       });
       setOrgStats(Array.from(orgMap.values()));
    }

    const { data: churnData } = await supabase.from("vw_user_churn").select("*").order("churn_count", { ascending: false }).limit(10);
    if (churnData) setChurnStats(churnData as ChurnStat[]);

    // Fetch Bilgi Köşesi and Haberler
    const { data: bilgiData } = await supabase.from("bilgi_kosesi").select("*").order("created_at", { ascending: false });
    if (bilgiData) setBilgiler(bilgiData as BilgiKonesi[]);

    const { data: haberData } = await supabase.from("haberler").select("*").order("created_at", { ascending: false });
    if (haberData) setHaberler(haberData as Haberler[]);
  };

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center text-primary"><Zap className="w-12 h-12 animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-zinc-950 flex flex-col pt-8 p-4 z-10 relative shadow-2xl">
        <div className="flex items-center space-x-3 text-accent mb-12 px-2">
          {userProfile?.role === 'admin' ? <Server className="w-8 h-8" /> : <Building className="w-8 h-8"/>}
          <h1 className="text-xl font-bold tracking-widest uppercase">{userProfile?.role === 'admin' ? "God Mode" : "Kurum Paneli"}</h1>
        </div>

        <nav className="flex flex-col space-y-2 flex-grow">
          <TabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} icon={<Activity className="w-5 h-5"/>} label="Derin Analitik" />
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="w-5 h-5"/>} label="Kullanıcı Radarı" />
          <TabButton active={activeTab === "invites"} onClick={() => setActiveTab("invites")} icon={<Key className="w-5 h-5"/>} label="Davetiyeler" />
          <TabButton active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={<Newspaper className="w-5 h-5"/>} label="İçerik Yönetimi" />

          {userProfile?.role === 'admin' && (
            <>
              <TabButton active={activeTab === "tree"} onClick={() => setActiveTab("tree")} icon={<Network className="w-5 h-5"/>} label="Davetiye Ağacı" />
              <TabButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")} icon={<Terminal className="w-5 h-5"/>} label="Sistem Logları" />
            </>
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="text-xs text-muted-foreground mb-4 break-words">Yetkili: {userProfile?.email}</div>
          <button onClick={async () => { 
            await supabase.auth.signOut();
            router.push("/"); 
          }} className="flex items-center justify-center space-x-2 text-black bg-white hover:bg-gray-200 w-full p-3 rounded-lg font-bold transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            <span>Sistemi Kapat</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-12 overflow-y-auto relative no-scrollbar">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full filter blur-[150px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {activeTab === "analytics" && <AnalyticsPanel key="analytics" orgStats={orgStats} churnStats={churnStats} />}
          {activeTab === "invites" && <InvitesPanel key="invites" invites={invites} refreshData={fetchData} userProfile={userProfile} />}
          {activeTab === "users" && <UsersPanel key="users" profiles={profiles} refreshData={fetchData} userProfile={userProfile} />}
          {activeTab === "content" && <ContentPanel key="content" bilgiler={bilgiler} haberler={haberler} refreshData={fetchData} />}
          {activeTab === "logs" && userProfile?.role === 'admin' && <LogsPanel key="logs" logs={logs} />}
          {activeTab === "tree" && userProfile?.role === 'admin' && <InviteTreePanel key="tree" invites={invites} profiles={profiles} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all font-semibold ${active ? "bg-accent/20 text-accent border border-accent/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]" : "hover:bg-white/5 text-muted-foreground hover:text-white"}`}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="tab-indicator" className="w-1.5 h-6 bg-accent rounded-full ml-auto" />}
    </button>
  );
}

// ==========================================
// 1. ANALYTICS DASHBOARD (RECHARTS)
// ==========================================
function AnalyticsPanel({ orgStats, churnStats }: { orgStats: OrgStats[], churnStats: ChurnStat[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold flex items-center space-x-3"><Activity className="w-8 h-8 text-accent"/> <span>Derin Analitik</span></h2>
        <p className="text-muted-foreground text-sm mt-2 max-w-2xl">Odak saatleri, kurum kıyaslamaları ve &apos;Churn&apos; (Erken Ayrılma) disiplin oranlarını inceleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Peak Study Hours Leaderboard */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-6 text-white flex items-center space-x-2">
            <Server className="w-5 h-5 text-primary" /> <span>Kurum Performans Sıralaması (Saat)</span>
          </h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgStats} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#ffffff50" />
                <YAxis dataKey="org_name" type="category" stroke="#ffffff50" width={100} tick={{fill: '#fff', fontSize: 12}} />
                <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#000', borderColor: '#333', borderRadius: '8px'}} />
                <Bar dataKey="total_hours" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Toplam Saat" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Rate (Drop off) */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-6 text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> <span>Erken Ayrılma (Churn) Disiplin Puanı</span>
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Focus bittikten önce masadan kalkanlar (Highest Churn)</p>
          <div className="w-full h-[270px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={churnStats.slice(0,5)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="full_name" stroke="#ffffff50" tick={{fontSize: 11}} />
                 <YAxis stroke="#ffffff50" />
                 <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', borderRadius: '8px'}} />
                 <Area type="monotone" dataKey="churn_count" stroke="#ef4444" fillOpacity={1} fill="url(#colorChurn)" name="Kaçış S." />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 2. VIP DAVETİYE ÜRETİCİ
// ==========================================
function InvitesPanel({ invites, refreshData, userProfile }: { invites: Invite[], refreshData: () => void, userProfile: Profile | null }) {
  const [generating, setGenerating] = useState(false);

  const generateInvites = async (count: number) => {
    if (!userProfile) return;
    setGenerating(true);
    const newInvites = Array.from({ length: count }).map(() => ({
      code: "VIP-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      created_by: userProfile.id,
      is_active: true,
    }));
    await supabase.from("invites").insert(newInvites);
    await refreshData();
    setGenerating(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2"><Key className="w-6 h-6 text-primary"/> <span>Davetiye Üretici</span></h2>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => generateInvites(1)} disabled={generating} className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 px-4 py-2 rounded-lg flex items-center space-x-2 transition disabled:opacity-50">
            <Plus className="w-4 h-4"/> <span>+1</span>
          </button>
          {userProfile?.role === 'admin' && (
              <button onClick={() => generateInvites(50)} disabled={generating} className="bg-accent/20 hover:bg-accent/40 text-accent border border-accent/50 px-4 py-2 rounded-lg flex items-center space-x-2 transition disabled:opacity-50">
                <AlertTriangle className="w-4 h-4"/> <span>+50 (Toplu)</span>
              </button>
          )}
        </div>
      </div>
      <div className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Davetiye Kodu</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Kullanan ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invites.map(inv => (
              <tr key={inv.code} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-lg tracking-widest">{inv.code}</td>
                <td className="px-6 py-4">
                  {inv.is_active ? 
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">🟢 Aktif</span> : 
                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-semibold">🔴 Kullanıldı</span>
                  }
                </td>
                <td className="px-6 py-4 text-muted-foreground">{inv.used_by || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. KULLANICI RADARI VE BAN SİSTEMİ
// ==========================================
function UsersPanel({ profiles, refreshData, userProfile }: { profiles: Profile[], refreshData: () => void, userProfile: Profile | null }) {
  const banUser = async (id: string, name: string) => {
    if (confirm(`DİKKAT! ${name} kalıcı olarak sistemden silinecek (Sadece profil).`)) {
      await supabase.from("logs").insert([{ event_type: "HARD_BAN", description: `Banned: ${name}`, user_id: userProfile?.id }]);
      await supabase.from("profiles").delete().eq("id", id);
      await refreshData();
    }
  };

  const deleteAuthUser = async (id: string, name: string) => {
    if (confirm(`KRİTİK UYARI! ${name} hesabının giriş bilgileri dahil (Auth.users tablosu) tüm veritabanından KALICI olarak silinecek. Onaylıyor musunuz?`)) {
      await supabase.from("logs").insert([{ event_type: "PERMA_DELETE", description: `Auth Deleted: ${name}`, user_id: userProfile?.id }]);
      const { error } = await supabase.rpc('delete_user_account', { target_user_id: id });
      if (error) {
        alert("Hesap silinemedi: " + error.message + "\n(Lütfen ana dizindeki supabase-phase9.sql dosyasını Supabase'de çalıştırdığınızdan emin olun!)");
      } else {
        await refreshData();
        alert("Hesap kökünden silindi.");
      }
    }
  };

  const setRole = async (id: string, role: string) => {
    if (confirm(`Kullanıcı rolü '${role}' olarak güncellenecek. Onaylıyor musunuz?`)) {
      await supabase.from("profiles").update({ role }).eq("id", id);
      await refreshData();
    }
  };

  const getDershaneName = (dId?: string) => {
    if (!dId) return null;
    const d = profiles.find(pr => pr.id === dId);
    return d ? d.full_name || d.email : null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center space-x-2"><Users className="w-6 h-6 text-primary"/> <span>Kullanıcı Radarı</span></h2>
      </div>

      <div className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Kullanıcı</th>
              <th className="px-6 py-4">Toplam Odak.</th>
              <th className="px-6 py-4">Rol</th>
              {userProfile?.role === 'admin' && <th className="px-6 py-4 text-right">Aksiyon</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profiles.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold">{p.full_name || 'İsimsiz Öğrenci'}</div>
                  <div className="text-xs text-muted-foreground">{p.email}</div>
                </td>
                <td className="px-6 py-4"><span className="text-accent font-bold text-lg">{p.total_hours}</span> saat</td>
                <td className="px-6 py-4">
                  {p.role === 'admin' ? <span className="text-primary font-bold">GOD</span> : 
                   p.role === 'dershane' ? <span className="text-blue-400 font-bold">KURUM (Dershane)</span> : 
                   p.role === 'sub_admin' ? <span className="text-green-400 font-bold">KURUM YÖN.</span> : 
                   p.dershane_id ? 
                     <div className="flex flex-col"><span className="text-gray-300 font-bold text-sm">ÖĞRENCİ</span><span className="text-xs text-blue-400 mt-1">({getDershaneName(p.dershane_id)})</span></div> : 
                     <span className="text-gray-300">BİREYSEL ÖĞRENCİ</span>
                  }
                </td>
                {userProfile?.role === 'admin' && (
                  <td className="px-6 py-4 text-right">
                      {p.role !== 'admin' && (
                        <div className="flex items-center justify-end space-x-2">
                          {p.role !== 'dershane' && (
                             <button onClick={() => setRole(p.id, 'dershane')} className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-500 hover:text-white transition">Kurum Yap</button>
                          )}
                          {p.role === 'dershane' && (
                             <button onClick={() => setRole(p.id, 'user')} className="bg-white/10 text-white px-3 py-1.5 rounded hover:bg-white/20 transition">Öğrenci Yap</button>
                          )}
                          <button onClick={() => banUser(p.id, p.full_name || p.email)} className="bg-destructive/10 text-destructive px-3 py-1.5 rounded hover:bg-destructive hover:text-white transition">Banla</button>
                          <button onClick={() => deleteAuthUser(p.id, p.full_name || p.email)} className="bg-red-800/80 text-white border border-red-500/50 px-3 py-1.5 rounded hover:bg-red-600 transition shadow-[0_0_10px_rgba(220,38,38,0.3)]">Sil (Kökten)</button>
                        </div>
                      )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ==========================================
// 4. INVITE TREE (DAVETİYE AĞACI)
// ==========================================
function InviteTreePanel({ invites, profiles }: { invites: Invite[], profiles: Profile[] }) {
  
  // Build relationship map
  const treeNodes = useMemo(() => {
     const map = new Map<string, any>();
     // Seed maps
     profiles.forEach(p => map.set(p.id, { ...p, children: [] }));
     
     // Link using invites
     invites.forEach(inv => {
         if (inv.used_by && map.has(inv.created_by) && map.has(inv.used_by)) {
             map.get(inv.created_by).children.push(map.get(inv.used_by));
         }
     });

     // Find roots (Admins or users who were not invited by anyone in current active invites)
     const rootNodes: any[] = [];
     const usedIds = new Set(invites.filter(i => i.used_by).map(i => i.used_by));
     
     profiles.forEach(p => {
         if (!usedIds.has(p.id)) {
             rootNodes.push(map.get(p.id));
         }
     });

     return rootNodes;
  }, [invites, profiles]);

  const renderNode = (node: any, depth: number = 0) => {
      if (!node) return null;
      return (
          <div key={node.id} className="relative" style={{ marginLeft: depth > 0 ? '24px' : '0' }}>
              <div className="flex items-center space-x-3 my-2 bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors w-fit pr-12">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black ${node.role === 'admin' ? 'bg-primary' : node.role === 'sub_admin' ? 'bg-green-400' : 'bg-white'}`}>
                      {node.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                      <div className="font-bold text-sm flex items-center space-x-2">
                          <span>{node.full_name || node.email}</span>
                          {node.role === 'admin' && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/50">KÖK</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{node.email}</div>
                  </div>
              </div>
              {/* Children Line */}
              {node.children.length > 0 && (
                  <div className="pl-4 border-l border-white/10 ml-4 relative">
                      {node.children.map((child: any) => renderNode(child, depth + 1))}
                  </div>
              )}
          </div>
      );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center space-x-2"><Network className="w-6 h-6 text-primary"/> <span>Davetiye Ağacı</span></h2>
        <p className="text-muted-foreground text-sm mt-1">Hangi üyenin hangi kanalla/zincirleme kim tarafından davet edildiğini izleyin.</p>
      </div>
      <div className="bg-black border border-white/10 p-6 rounded-2xl overflow-x-auto shadow-2xl">
          {treeNodes.map(node => renderNode(node, 0))}
      </div>
    </motion.div>
  );
}

// ==========================================
// 5. CANLI SİSTEM LOGLARI
// ==========================================
function LogsPanel({ logs }: { logs: Log[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      <div className="bg-black border border-green-900/50 rounded-lg p-6 flex-1 overflow-y-auto font-mono text-sm text-green-500 shadow-[inset_0_0_50px_rgba(0,255,0,0.05)]">
        {logs.map(log => (
          <div key={log.id} className="mb-2 leading-relaxed flex items-start space-x-4 border-b border-green-900/30 pb-2">
            <span className="text-green-700 whitespace-nowrap">[{new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19)}]</span>
            <span className={`font-bold ${log.event_type.includes('BAN') || log.event_type.includes('EXIT') ? 'text-red-500' : 'text-accent'}`}>{log.event_type}</span>
            <span className="flex-1 opacity-90">{log.description}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ==========================================
// 6. İÇERİK YÖNETİMİ (Bilgi Köşesi & Haberler)
// ==========================================
function ContentPanel({ bilgiler, haberler, refreshData }: { bilgiler: BilgiKonesi[], haberler: Haberler[], refreshData: () => void }) {
  const [activeSection, setActiveSection] = useState<"bilgi" | "haber">("bilgi");
  const [editingItem, setEditingItem] = useState<BilgiKonesi | Haberler | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = async (data: any, type: "bilgi" | "haber") => {
    const table = type === "bilgi" ? "bilgi_kosesi" : "haberler";
    const { error } = await supabase.from(table).insert(data);
    if (error) {
      alert("Hata: " + error.message);
    } else {
      await refreshData();
      setShowAddForm(false);
    }
  };

  const handleUpdate = async (id: string, data: any, type: "bilgi" | "haber") => {
    const table = type === "bilgi" ? "bilgi_kosesi" : "haberler";
    const { error } = await supabase.from(table).update(data).eq("id", id);
    if (error) {
      alert("Hata: " + error.message);
    } else {
      await refreshData();
      setEditingItem(null);
    }
  };

  const handleDelete = async (id: string, type: "bilgi" | "haber") => {
    if (!confirm("Bu içeriği silmek istediğinizden emin misiniz?")) return;
    const table = type === "bilgi" ? "bilgi_kosesi" : "haberler";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      alert("Hata: " + error.message);
    } else {
      await refreshData();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, type: "bilgi" | "haber") => {
    const table = type === "bilgi" ? "bilgi_kosesi" : "haberler";
    const { error } = await supabase.from(table).update({ aktif: !currentStatus }).eq("id", id);
    if (error) {
      alert("Hata: " + error.message);
    } else {
      await refreshData();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center space-x-2"><Newspaper className="w-6 h-6 text-accent"/> <span>İçerik Yönetimi</span></h2>
        <p className="text-muted-foreground text-sm mt-1">Bilgi Köşesi ve Haberler içeriklerini buradan yönetebilirsiniz.</p>
      </div>

      {/* Section Toggle */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => { setActiveSection("bilgi"); setShowAddForm(false); setEditingItem(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeSection === "bilgi" ? "bg-primary/20 text-primary border border-primary/50" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Bilgi Köşesi</span>
        </button>
        <button
          onClick={() => { setActiveSection("haber"); setShowAddForm(false); setEditingItem(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeSection === "haber" ? "bg-accent/20 text-accent border border-accent/50" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
        >
          <Newspaper className="w-5 h-5" />
          <span>Haberler</span>
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="flex items-center space-x-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Yeni {activeSection === "bilgi" ? "Bilgi" : "Haber"} Ekle</span>
      </button>

      {/* Add Form */}
      {showAddForm && (
        <ContentForm
          type={activeSection}
          onSave={(data) => handleAdd(data, activeSection)}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingItem && (
        <ContentForm
          type={activeSection}
          item={editingItem}
          onSave={(data) => handleUpdate(editingItem.id, data, activeSection)}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Content List */}
      <div className="space-y-4">
        {activeSection === "bilgi" ? (
          bilgiler.map((bilgi) => (
            <ContentCard
              key={bilgi.id}
              item={bilgi}
              type="bilgi"
              onEdit={() => setEditingItem(bilgi)}
              onDelete={() => handleDelete(bilgi.id, "bilgi")}
              onToggleActive={() => handleToggleActive(bilgi.id, bilgi.aktif, "bilgi")}
            />
          ))
        ) : (
          haberler.map((haber) => (
            <ContentCard
              key={haber.id}
              item={haber}
              type="haber"
              onEdit={() => setEditingItem(haber)}
              onDelete={() => handleDelete(haber.id, "haber")}
              onToggleActive={() => handleToggleActive(haber.id, haber.aktif, "haber")}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

function ContentForm({ type, item, onSave, onCancel }: { type: "bilgi" | "haber", item?: BilgiKonesi | Haberler, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    baslik: item?.baslik || "",
    icerik: item?.icerik || "",
    kategori: item?.kategori || "genel",
    link: type === "haber" ? (item as Haberler)?.link || "" : "",
    aktif: item?.aktif !== undefined ? item.aktif : true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      baslik: formData.baslik,
      icerik: formData.icerik,
      kategori: formData.kategori,
      aktif: formData.aktif
    };
    if (type === "haber" && formData.link) {
      data.link = formData.link;
    }
    onSave(data);
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4">{item ? "Düzenle" : "Yeni Ekle"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Başlık</label>
          <input
            type="text"
            value={formData.baslik}
            onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">İçerik</label>
          <textarea
            value={formData.icerik}
            onChange={(e) => setFormData({ ...formData, icerik: e.target.value })}
            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary min-h-[100px]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Kategori</label>
          <select
            value={formData.kategori}
            onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="genel">Genel</option>
            <option value="ytks">YKS</option>
            <option value="kpss">KPSS</option>
            <option value="universite">Üniversite</option>
            <option value="okul">Okul</option>
            <option value="sinav">Sınav</option>
            <option value="duyuru">Duyuru</option>
          </select>
        </div>
        {type === "haber" && (
          <div>
            <label className="block text-sm font-medium mb-2">Link (Opsiyonel)</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              placeholder="https://..."
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="aktif"
            checked={formData.aktif}
            onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="aktif" className="text-sm font-medium">Aktif</label>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Kaydet
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

function ContentCard({ item, type, onEdit, onDelete, onToggleActive }: { item: BilgiKonesi | Haberler, type: "bilgi" | "haber", onEdit: () => void, onDelete: () => void, onToggleActive: () => void }) {
  const isHaber = type === "haber";
  const haber = item as Haberler;

  return (
    <div className={`bg-white/5 border ${item.aktif ? "border-white/10" : "border-red-500/30"} p-6 rounded-2xl hover:bg-white/10 transition-colors`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs font-medium uppercase tracking-wider px-2 py-1 rounded ${isHaber ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>
              {item.kategori}
            </span>
            {!item.aktif && (
              <span className="text-xs font-medium text-red-400">Pasif</span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{item.baslik}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.icerik}</p>
          {isHaber && haber.link && (
            <a href={haber.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent/80 mt-2 inline-block">
              {haber.link}
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-xs text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString('tr-TR')}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={onToggleActive}
            className={`text-xs px-3 py-1 rounded ${item.aktif ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"} transition-colors`}
          >
            {item.aktif ? "Pasife Al" : "Aktife Al"}
          </button>
          <button
            onClick={onEdit}
            className="text-xs px-3 py-1 rounded text-blue-400 hover:text-blue-300 transition-colors"
          >
            Düzenle
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-3 py-1 rounded text-red-400 hover:text-red-300 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
