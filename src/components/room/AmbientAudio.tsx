/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import { CloudRain, BookOpen, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SOUNDS = [
  { id: "rain", name: "Yağmur", icon: CloudRain, url: "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" },
  { id: "library", name: "Kütüphane", icon: BookOpen, url: "https://actions.google.com/sounds/v1/crowds/restaurant_chatter.ogg" },
  { id: "lofi", name: "Lo-Fi", icon: Music, url: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
];

export default function AmbientAudio() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleSound = (sound: any) => {
    if (activeSound === sound.id) {
      audioRef.current?.pause();
      setActiveSound(null);
    } else {
      setActiveSound(sound.id);
      if (audioRef.current) {
         audioRef.current.src = sound.url;
         audioRef.current.play().catch(e => console.error("Audio block", e));
      }
    }
  };

  return (
    <div className="relative z-50">
       <audio ref={audioRef} loop />
       
       <AnimatePresence>
       {isOpen && (
           <motion.div initial={{ opacity: 0, scale: 0.8, x: -20, y: 10 }} animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} exit={{ opacity: 0, scale: 0.8, x: -20, y: 10 }} className="absolute bottom-full left-0 mb-3 flex items-center bg-zinc-900/95 border border-white/20 rounded-full p-1.5 sm:p-2 md:p-3 space-x-1 md:space-x-2 backdrop-blur-3xl shadow-2xl origin-bottom-left">
               {SOUNDS.map(s => {
                  const Icon = s.icon;
                  const isActive = activeSound === s.id;
                  return (
                    <button 
                        key={s.id} 
                        onClick={() => toggleSound(s)} 
                        title={s.name}
                        className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'text-zinc-400 hover:bg-white/20 hover:text-white'}`}
                    >
                       <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                  )
               })}
               <div className="w-px h-5 sm:h-6 bg-white/20 mx-1 md:mx-2" />
               <input 
                 type="range" min="0" max="1" step="0.05" 
                 value={volume} onChange={e => setVolume(parseFloat(e.target.value))} 
                 className="w-12 sm:w-16 md:w-20 accent-primary opacity-90 hover:opacity-100 transition-opacity"
                 title="Ses Seviyesi"
               />
           </motion.div>
       )}
       </AnimatePresence>

       <button onClick={() => setIsOpen(!isOpen)} className={`p-2.5 sm:p-3 md:p-4 rounded-full text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-white/10 relative transition-all duration-300 ${isOpen ? 'bg-zinc-800' : 'bg-primary/80 backdrop-blur-xl'}`}>
           <Music className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
           {activeSound && !isOpen && (
                <span className="absolute -top-1 -right-1 bg-green-500 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-background"></span>
           )}
       </button>
    </div>
  )
}
