/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import { CloudRain, BookOpen, Music } from "lucide-react";

const SOUNDS = [
  { id: "rain", name: "Yağmur", icon: CloudRain, url: "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" },
  { id: "library", name: "Kütüphane", icon: BookOpen, url: "https://actions.google.com/sounds/v1/crowds/restaurant_chatter.ogg" },
  { id: "lofi", name: "Lo-Fi", icon: Music, url: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
];

export default function AmbientAudio() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);

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
    <div className="flex items-center bg-background/40 border border-white/10 rounded-full p-2 space-x-2 backdrop-blur-md shadow-lg">
       <audio ref={audioRef} loop />
       {SOUNDS.map(s => {
          const Icon = s.icon;
          const isActive = activeSound === s.id;
          return (
            <button 
                key={s.id} 
                onClick={() => toggleSound(s)} 
                title={s.name}
                className={`p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'text-muted-foreground hover:bg-white/10 hover:text-white'}`}
            >
               <Icon className="w-5 h-5" />
            </button>
          )
       })}
       <div className="w-px h-6 bg-white/10 mx-2" />
       <input 
         type="range" min="0" max="1" step="0.05" 
         value={volume} onChange={e => setVolume(parseFloat(e.target.value))} 
         className="w-20 accent-primary opacity-70 hover:opacity-100 transition-opacity"
         title="Ses Seviyesi"
       />
    </div>
  )
}
