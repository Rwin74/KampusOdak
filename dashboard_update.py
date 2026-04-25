import sys
import re

with open("src/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add activeTab state
state_injection = """  const [bilgiler, setBilgiler] = useState<BilgiKosesi[]>([]);
  const [haberler, setHaberler] = useState<Haberler[]>([]);
  const [activeTab, setActiveTab] = useState("kontrol_paneli");"""
content = content.replace("  const [bilgiler, setBilgiler] = useState<BilgiKosesi[]>([]);\n  const [haberler, setHaberler] = useState<Haberler[]>([]);", state_injection)

# 2. Update Sidebar buttons
sidebar_old = """           <nav className="px-4 space-y-1 mb-8">
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
           </nav>"""

sidebar_new = """           <nav className="px-4 space-y-1 mb-8">
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
           </nav>"""
content = content.replace(sidebar_old, sidebar_new)

# 3. Main Content Replacement
# Wrapping the current `<main>` children with {activeTab === "kontrol_paneli" && ( ... )} and adding padding to bottom
content = content.replace('<main className="flex-1 flex flex-col items-center justify-start p-6 relative z-10 pt-12">', '<main className="flex-1 flex flex-col items-center justify-start p-6 relative z-10 pt-12 pb-24 md:pb-6">\n        {activeTab === "kontrol_paneli" && (')

# And adding the other tabs before closing `</main>`
other_tabs = """        )}

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
      </main>"""

content = content.replace("        )}\n      </main>", other_tabs)


# 4. Mobile Bottom Navigation
mobile_nav = """      {/* Mobile Bottom Navigation */}
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
}"""

content = content.replace("      </div>\n    </div>\n  );\n}", mobile_nav)

with open("src/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
