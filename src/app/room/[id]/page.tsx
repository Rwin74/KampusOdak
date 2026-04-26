"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ShieldAlert, Users, Clock, AlertTriangle, Hand, Mic, MicOff, Coffee, Settings, Video, Edit3, MessageSquareText, Menu, X } from "lucide-react";
import { LiveKitRoom, useTracks, VideoTrack, useLocalParticipant, useRoomContext, RoomAudioRenderer, TrackToggle, MediaDeviceMenu } from "@livekit/components-react";
import { Track } from "livekit-client";
import AmbientAudio from "@/components/room/AmbientAudio";
import Whiteboard from "@/components/room/Whiteboard";
import ChatPanel from "@/components/room/ChatPanel";

export const dynamic = 'force-dynamic';

const playNotifySound = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch {}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BottomControlBar({ micTimer, requestMic, requestBreak, toggleWhiteboard, isWhiteboardOpen, toggleChat, unreadChatCount, leaveRoom, cellId, category }: any) {
  useLocalParticipant();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
    {/* Desktop Control Bar */}
    <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center space-x-3 bg-background/80 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
         
         {/* Camera Toggle */}
         <div className="relative group">
             <TrackToggle source={Track.Source.Camera} showIcon={true} className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition data-[state=off]:bg-red-500/20 data-[state=off]:text-red-400" />
             <button onClick={() => setShowSettings(!showSettings)} className="absolute -top-2 -right-2 p-1.5 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition shadow-xl border border-white/10">
                <Settings className="w-3 h-3" />
             </button>
             
             {/* Device Settings Popover */}
             <AnimatePresence>
                 {showSettings && (
                     <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 p-4 rounded-2xl w-64 shadow-2xl">
                         <h4 className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-3">Kamera Seçimi</h4>
                         <MediaDeviceMenu kind="videoinput" className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                         <div className="h-px bg-white/10 my-3" />
                         <h4 className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-3">Mikrofon Seçimi</h4>
                         <MediaDeviceMenu kind="audioinput" className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                     </motion.div>
                 )}
             </AnimatePresence>
         </div>

         <div className="w-px h-8 bg-white/10 mx-2" />

         {/* Phase 5 Soru Sor Protocol (Mic) */}
         <button onClick={requestMic} className={`relative p-4 rounded-full font-bold shadow-xl transition-all flex items-center justify-center space-x-2 ${micTimer ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-primary/20 hover:bg-primary/40 text-primary border border-primary/20'}`}>
             {micTimer ? (
                 <motion.span initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="font-mono text-sm font-bold tracking-widest absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-xl text-white px-3 py-1 rounded-full shadow-2xl border border-red-400/50 whitespace-nowrap">
                     00:{micTimer.toString().padStart(2, '0')}
                 </motion.span>
             ) : null}
             {micTimer ? <Mic className="w-5 h-5 relative z-10" /> : <MicOff className="w-5 h-5 relative z-10" />}
         </button>

         <div className="w-px h-8 bg-white/10 mx-2" />

         {/* Whiteboard Toggle */}
         <button onClick={toggleWhiteboard} className={`p-4 rounded-full transition-all text-white ${isWhiteboardOpen ? 'bg-accent shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}>
             <Edit3 className="w-5 h-5" />
         </button>

         {/* Chat Toggle */}
         <button onClick={toggleChat} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all ml-2 relative">
             <MessageSquareText className="w-5 h-5" />
             {unreadChatCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg z-50">
                     {unreadChatCount}
                 </span>
             )}
         </button>

         <div className="w-px h-8 bg-white/10 mx-2" />
         
         <button onClick={requestBreak} className="px-6 py-4 bg-background/50 hover:bg-white/10 text-white rounded-full font-semibold transition-all border border-white/5 flex items-center space-x-2">
             <Hand className="w-4 h-4"/> <span>Mola İste</span>
         </button>
      </div>
    </div>

    {/* Mobile Floating Menu Button */}
    <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        <AnimatePresence>
            {mobileMenuOpen && (
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col space-y-4 w-56 mb-2 mr-2">
                   {/* Mobile Controls */}
                   <div className="flex items-center justify-between mb-1">
                       <div className="flex flex-col">
                           <span className="text-xs font-bold text-white tracking-wider flex items-center space-x-1.5"><Users className="w-3.5 h-3.5 text-primary" /> <span>Hücre: {cellId}</span></span>
                           <span className="text-[10px] text-primary/70 uppercase font-bold ml-5">{category}</span>
                       </div>
                       <button onClick={leaveRoom} className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                           <LogOut className="w-4 h-4" />
                       </button>
                   </div>
                   <div className="h-px bg-white/10 w-full mb-1" />

                   <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white tracking-wider uppercase ml-1">Kamera</span>
                       <div className="flex items-center space-x-3">
                           <TrackToggle source={Track.Source.Camera} showIcon={true} className="p-2.5 rounded-full bg-white/10 text-white data-[state=off]:bg-red-500/20 data-[state=off]:text-red-400" />
                           <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 bg-zinc-800 rounded-full text-white">
                               <Settings className="w-4 h-4" />
                           </button>
                       </div>
                   </div>

                   {/* Settings Popover inside mobile menu */}
                   <AnimatePresence>
                   {showSettings && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-zinc-950 border border-white/5 p-3 rounded-2xl overflow-hidden">
                            <h4 className="text-[10px] text-muted-foreground uppercase font-bold mb-2 tracking-widest">Kamera Seçimi</h4>
                            <MediaDeviceMenu kind="videoinput" className="w-full bg-background border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none mb-3" />
                            <h4 className="text-[10px] text-muted-foreground uppercase font-bold mb-2 tracking-widest">Mikrofon Seçimi</h4>
                            <MediaDeviceMenu kind="audioinput" className="w-full bg-background border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none" />
                       </motion.div>
                   )}
                   </AnimatePresence>

                   <div className="h-px bg-white/10 w-full" />

                   <button onClick={requestMic} className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${micTimer ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary border border-primary/20'}`}>
                       {micTimer ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                       <span>{micTimer ? `Soru Sor (00:${micTimer.toString().padStart(2, '0')})` : 'Söz Hakkı İste'}</span>
                   </button>
                   
                   <button onClick={() => { toggleWhiteboard(); setMobileMenuOpen(false); }} className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${isWhiteboardOpen ? 'bg-accent text-white' : 'bg-white/10 text-white'}`}>
                       <Edit3 className="w-4 h-4" />
                       <span>Beyaz Tahta</span>
                   </button>
                   
                   <button onClick={() => { toggleChat(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all bg-white/10 text-white relative">
                       <MessageSquareText className="w-4 h-4" />
                       <span>Sohbet</span>
                       {unreadChatCount > 0 && (
                           <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">{unreadChatCount}</span>
                       )}
                   </button>
                   
                   <button onClick={() => { requestBreak(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all bg-background/50 border border-white/10 text-white hover:bg-white/10">
                       <Hand className="w-4 h-4" />
                       <span>Mola İste</span>
                   </button>
               </motion.div>
            )}
        </AnimatePresence>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-4 rounded-full text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-white/10 relative transition-all duration-300 ${mobileMenuOpen ? 'bg-zinc-800 rotate-90' : 'bg-primary/80 backdrop-blur-xl'}`}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            {unreadChatCount > 0 && !mobileMenuOpen && (
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                     {unreadChatCount}
                 </span>
            )}
        </button>
    </div>
    </>
  );
}

function TracksRenderer({ isWhiteboardOpen, fullscreenId, setFullscreenId }: { isWhiteboardOpen: boolean, fullscreenId: string | null, setFullscreenId: (id: string | null) => void }) {
    const videoTracks = useTracks([Track.Source.Camera]);

    return (
        <motion.div layout className={`flex w-full h-full relative z-30 ${isWhiteboardOpen ? 'gap-4 md:gap-[140px] h-[100px] md:h-[160px] justify-center items-start mb-6 mt-4' : 'flex-col md:flex-row gap-2 md:gap-6 flex-1 items-center justify-center'}`}>
             <AnimatePresence>
             {videoTracks.map((track) => {
                 const isFullscreen = fullscreenId === track.participant.identity;
                 const hidden = fullscreenId && !isFullscreen;

                 return (
                 <motion.div 
                    layout 
                    key={track.participant.identity} 
                    onClick={() => setFullscreenId(isFullscreen ? null : track.participant.identity)}
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.8 }} 
                    transition={{stiffness: 200, damping: 20}} 
                    className={`relative overflow-hidden glass-panel border border-white/10 bg-zinc-900/50 shadow-2xl group transition-all duration-300 cursor-pointer ${
                        isFullscreen ? 'absolute inset-0 z-[60] rounded-2xl md:rounded-[3rem] m-0' : (
                            hidden ? 'hidden' : (
                                isWhiteboardOpen ? 'rounded-3xl md:rounded-[2rem] w-1/2 md:w-[284px] h-full md:h-[160px]' : 'rounded-3xl md:rounded-[2rem] flex-1 basis-0 min-h-0 w-full md:h-auto md:w-full md:aspect-video md:max-w-3xl'
                            )
                        )
                    }`}>
                     <VideoTrack trackRef={track} className="w-full h-full object-cover transform pointer-events-none" />
                     {/* Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                     
                     <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-background/60 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-[10px] md:text-xs font-bold font-mono tracking-wider text-white backdrop-blur-xl border border-white/10 flex items-center space-x-2 md:space-x-3 shadow-2xl">
                         {/* Connection Dot */}
                         <div className="relative">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50" />
                         </div>
                         <span className="truncate max-w-[100px] md:max-w-none">{track.participant.name || track.participant.identity}</span>
                         {!track.participant.isMicrophoneEnabled ? <MicOff className="w-3 h-3 md:w-3.5 md:h-3.5 text-red-400 shrink-0" /> : <Mic className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-400 animate-pulse shrink-0" />}
                     </div>
                 </motion.div>
             )})}
             </AnimatePresence>
             {/* Audio Rendering Engine */}
             <RoomAudioRenderer />
        </motion.div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RoomManager({ duration, onTimerEnd, isWhiteboardOpen, toggleWhiteboard, toggleChat, isChatOpen, leaveRoom, cellId, category, isFullscreen }: any) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [micTimer, setMicTimer] = useState<number | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<{text: string, action?: () => void} | null>(null);

  useEffect(() => {
     if (isChatOpen) setUnreadChatCount(0);
  }, [isChatOpen]);

  // Focus Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
            clearInterval(interval);
            onTimerEnd();
            return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onTimerEnd]);

  // Data Channel Communication
  useEffect(() => {
     if(!room) return;
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const handleData = (payload: Uint8Array, participant: any) => {
         const str = new TextDecoder().decode(payload);
         try {
             const data = JSON.parse(str);
             if (data.type === 'ASK_MIC') {
                 playNotifySound();
                 setToastMsg({ text: `${participant?.name || 'Partner'} mikrofon izni istiyor.`, action: () => {
                         const enc = new TextEncoder();
                         room.localParticipant.publishData(enc.encode(JSON.stringify({ type: 'GRANT_MIC' })), { reliable: true });
                         setToastMsg(null);
                 }});
                 setTimeout(() => setToastMsg(null), 10000);
             } else if (data.type === 'GRANT_MIC') {
                 localParticipant.setMicrophoneEnabled(true);
                 setMicTimer(30);
             } else if (data.type === 'REQUEST_BREAK') {
                 playNotifySound();
                 setToastMsg({ text: `Partner mola teklif ediyor. Onaylıyor musun?`, action: () => {
                         const enc = new TextEncoder();
                         room.localParticipant.publishData(enc.encode(JSON.stringify({ type: 'ACCEPT_BREAK' })), { reliable: true });
                         setToastMsg(null);
                         onTimerEnd();
                 }});
                 setTimeout(() => setToastMsg(null), 10000);
             } else if (data.type === 'ACCEPT_BREAK') {
                 onTimerEnd();
             } else if (data.type === 'CHAT_MSG') {
                 if (!isChatOpen) {
                     setUnreadChatCount(prev => prev + 1);
                     playNotifySound();
                 }
             }
         } catch { }
     };
     room.on('dataReceived', handleData);
     return () => { room.off('dataReceived', handleData); };
  }, [room, localParticipant, onTimerEnd, isChatOpen]);

  useEffect(() => {
      if (micTimer !== null && micTimer > 0) {
          const timeout = setTimeout(() => setMicTimer(micTimer - 1), 1000);
          return () => clearTimeout(timeout);
      } else if (micTimer === 0) {
          localParticipant.setMicrophoneEnabled(false);
          setMicTimer(null);
      }
  }, [micTimer, localParticipant]);

  const requestMic = () => {
      if(!room?.localParticipant) return;
      const enc = new TextEncoder();
      room.localParticipant.publishData(enc.encode(JSON.stringify({ type: 'ASK_MIC'})), { reliable: true });
  };
  
  const requestBreak = () => {
      if(!room?.localParticipant) return;
      const enc = new TextEncoder();
      room.localParticipant.publishData(enc.encode(JSON.stringify({ type: 'REQUEST_BREAK'})), { reliable: true });
  };

  const currentDurationFormatted = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
      <>
        {/* Neon Central Timer Layout V2 */}
        <motion.div layout className={`absolute transition-all duration-700 z-[70] left-1/2 -translate-x-1/2 ${isFullscreen ? 'top-4 md:top-6 scale-75 md:scale-[0.8] origin-top' : (isWhiteboardOpen ? 'top-2 md:top-6 scale-75 md:scale-[0.65] origin-top' : 'top-1/2 -translate-y-1/2 md:top-10 md:translate-y-0 scale-100 origin-center md:origin-top')}`}>
          <div className="flex flex-col items-center justify-center p-[2px] rounded-full bg-gradient-to-r from-accent via-primary to-accent shadow-[0_0_20px_rgba(139,92,246,0.3)] md:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-shadow">
             <div className="flex items-center space-x-2 md:space-x-3 bg-background rounded-full px-5 py-2 md:px-8 md:py-3">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-accent animate-pulse" />
                <span className="font-mono text-xl md:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{currentDurationFormatted}</span>
             </div>
          </div>
        </motion.div>
        
        {/* Toast System */}
        <AnimatePresence>
            {toastMsg && (
                <motion.div initial={{ scale: 0.95, y: -20, opacity: 0}} animate={{ scale: 1, y: 0, opacity: 1}} exit={{ scale: 0.95, y: -20, opacity: 0}} className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-zinc-950/90 backdrop-blur-3xl text-white px-8 py-8 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col items-center text-center space-y-5 min-w-[320px]">
                    <div className="flex flex-col items-center space-y-3 mb-2">
                       <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center ring-4 ring-accent/10">
                           <AlertTriangle className="w-8 h-8 text-accent animate-pulse" />
                       </div>
                       <span className="font-semibold text-lg tracking-wide max-w-[250px] leading-relaxed">{toastMsg.text}</span>
                    </div>
                    {toastMsg.action && (
                        <button onClick={toastMsg.action} className="bg-white text-black hover:bg-gray-200 px-6 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 w-full shadow-lg">Talebi Onayla</button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
        
        <BottomControlBar 
            micTimer={micTimer} 
            requestMic={requestMic} 
            requestBreak={requestBreak} 
            toggleWhiteboard={toggleWhiteboard} 
            isWhiteboardOpen={isWhiteboardOpen}
            toggleChat={toggleChat}
            unreadChatCount={unreadChatCount}
            leaveRoom={leaveRoom}
            cellId={cellId}
            category={category}
        />
      </>
  )
}

function RoomContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [partnerDropped, setPartnerDropped] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);
  
  const duration = parseInt(searchParams?.get('duration') || '50');
  const category = searchParams?.get('category') || 'Genel';

  const [camSetupStatus, setCamSetupStatus] = useState<"pending" | "granted" | "selected">("pending");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");

  useEffect(() => {
    const setupRoom = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
          setProfile(data);
          // Request LiveKit Token
          const roomNameStr = Array.isArray(id) ? id[0] : id;
          const res = await fetch('/api/livekit/token', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ roomName: roomNameStr, participantIdentity: session.user.id, participantName: data.full_name || 'Öğrenci' })
          });
          if(res.ok) {
              setToken((await res.json()).token);
          }
      }
    };
    setupRoom();
  }, [id, router]);

  useEffect(() => {
     if (camSetupStatus === "pending") {
         navigator.mediaDevices.getUserMedia({ video: true, audio: true })
             .then((stream) => {
                 setCamSetupStatus("granted");
                 navigator.mediaDevices.enumerateDevices().then(devs => {
                     const videoDevs = devs.filter(d => d.kind === 'videoinput');
                     const audioDevs = devs.filter(d => d.kind === 'audioinput');
                     setDevices(videoDevs);
                     setMics(audioDevs);
                     if(videoDevs.length > 0) setSelectedCameraId(videoDevs[0].deviceId);
                     if(audioDevs.length > 0) setSelectedMicId(audioDevs[0].deviceId);
                     stream.getTracks().forEach(t => t.stop());
                 });
             })
             .catch((err) => {
                 console.error("Camera error:", err);
             });
     }
  }, [camSetupStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (profile && breakTimeRemaining === 0) {
      const pingRoom = async () => {
        try {
          const { data } = await supabase.rpc('ping_room', { p_room_id: id, p_user_id: profile.id });
          if (data === 'partner_dropped') {
            setPartnerDropped(true);
            setTimeout(() => router.push("/dashboard"), 7000); 
          }
          } catch { }
      };
      pingRoom(); 
      interval = setInterval(pingRoom, 5000); 
    }
    return () => clearInterval(interval);
  }, [id, profile, breakTimeRemaining, router]);

  const leaveRoom = async () => {
    if (profile && breakTimeRemaining === 0) supabase.rpc('log_early_exit', { p_room_id: id }).then();
    router.push("/dashboard");
  };

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (breakTimeRemaining > 0) {
        t = setInterval(() => {
            setBreakTimeRemaining(prev => prev - 1);
        }, 1000);
    }
    return () => clearInterval(t);
  }, [breakTimeRemaining]);

  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;



  if (camSetupStatus !== "selected") {
      return (
          <div className="min-h-screen bg-background flex items-center justify-center p-6 text-white relative">
              <div className="max-w-md w-full bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl text-center space-y-6">
                 <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Video className="w-10 h-10 text-primary animate-pulse" />
                 </div>
                 <h2 className="text-2xl font-bold tracking-tight">Kamera Ayarları</h2>
                 
                 {camSetupStatus === "pending" ? (
                    <p className="text-muted-foreground text-sm">Odaya bağlanmadan önce kamera ve mikrofon erişimine izin vermelisiniz. Lütfen tarayıcı uyarısını onaylayın.</p>
                 ) : (
                    <div className="space-y-4 text-left">
                        <div>
                            <label className="text-muted-foreground text-sm font-semibold tracking-widest uppercase ml-1 block mb-2">Kamera Seçin</label>
                            <select 
                               className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white"
                               value={selectedCameraId}
                               onChange={(e) => setSelectedCameraId(e.target.value)}
                            >
                                {devices.map(d => (
                                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Kamera ' + d.deviceId.slice(0,5)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-semibold tracking-widest uppercase ml-1 block mb-2 mt-2">Mikrofon Seçin</label>
                            <select 
                               className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white"
                               value={selectedMicId}
                               onChange={(e) => setSelectedMicId(e.target.value)}
                            >
                                {mics.map(d => (
                                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Mikrofon ' + d.deviceId.slice(0,5)}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                           onClick={() => setCamSetupStatus("selected")}
                           className="w-full py-4 mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg"
                        >
                           Onayla ve Odaya Gir
                        </button>
                    </div>
                 )}
              </div>
          </div>
      );
  }

  return (
    <div className="h-[100dvh] bg-background text-white relative flex flex-col overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-black to-black pointer-events-none" />

      <AnimatePresence>
        {partnerDropped && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-zinc-950 border border-red-500/30 p-10 rounded-[3rem] text-center space-y-6 shadow-[0_0_150px_rgba(239,68,68,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500/20"><motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 7, ease: "linear" }} className="h-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]" /></div>
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Partner Koptu</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">Bağlantı kesildi. Güvenliğiniz için havuza aktarılıyorsunuz...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="hidden md:flex p-6 justify-between items-start relative z-50">
        <div className="flex items-center space-x-4">
          <button onClick={leaveRoom} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-muted-foreground hover:text-white transition-all group shadow-2xl backdrop-blur-md">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col bg-background/50 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/5 shadow-xl">
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center space-x-2"><Users className="w-4 h-4 text-primary" /> <span>Hücre: {id?.slice(0,6)}...</span></h1>
            <span className="text-primary/60 text-[10px] mt-1 tracking-widest uppercase font-bold">{category}</span>
          </div>
        </div>
      </header>

      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
         <AmbientAudio />
      </div>

      <main className="flex-1 w-full max-w-[1800px] mx-auto p-2 md:p-8 flex flex-col relative z-10 md:pb-24 pb-2 overflow-hidden">
         {token && liveKitUrl ? (
             <LiveKitRoom 
                 video={true} 
                 audio={false} 
                 token={token} 
                 serverUrl={liveKitUrl} 
                 options={{ 
                     videoCaptureDefaults: { deviceId: selectedCameraId },
                     audioCaptureDefaults: { deviceId: selectedMicId }
                 }}
                 className="flex-1 flex flex-col h-full rounded-2xl md:rounded-[3rem] relative overflow-hidden"
             >
                 {breakTimeRemaining > 0 && (
                     <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-white border-4 border-accent/20 rounded-[3rem]">
                        <Coffee className="w-32 h-32 text-accent mb-8 drop-shadow-[0_0_50px_rgba(236,72,153,0.5)] animate-pulse" />
                        <h1 className="text-6xl font-extrabold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Mola Odası</h1>
                        
                        <div className="text-[150px] font-mono font-black tracking-widest text-accent drop-shadow-[0_0_100px_rgba(236,72,153,0.6)] leading-none mb-10">
                           {Math.floor(breakTimeRemaining / 60).toString().padStart(2, '0')}:{(breakTimeRemaining % 60).toString().padStart(2, '0')}
                        </div>
                        
                        <button onClick={() => setBreakTimeRemaining(0)} className="bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95">Erken Bitir ve Dön</button>
                     </motion.div>
                 )}
                  <RoomManager 
                      duration={duration} 
                      onTimerEnd={() => setBreakTimeRemaining(300)} 
                      isWhiteboardOpen={isWhiteboardOpen} 
                      toggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                      toggleChat={() => setIsChatOpen(!isChatOpen)}
                      isChatOpen={isChatOpen}
                      leaveRoom={leaveRoom}
                      cellId={Array.isArray(id) ? id[0].slice(0,6) : id?.slice(0,6)}
                      category={category}
                      isFullscreen={!!fullscreenId}
                  />
                  
                  {/* Dynamic Layout Engine */}
                  <div className="flex flex-col flex-1 relative w-full h-full">
                      {/* Cameras Area */}
                      <TracksRenderer isWhiteboardOpen={isWhiteboardOpen} fullscreenId={fullscreenId} setFullscreenId={setFullscreenId} />
                      
                      {/* Whiteboard Area */}
                      <AnimatePresence>
                          {isWhiteboardOpen && (
                              <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 50 }} transition={{type: "spring", stiffness: 300, damping: 25}} className="flex-1 w-full relative z-30 mt-4 h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
                                  <Whiteboard />
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
                  
                  <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
              </LiveKitRoom>
         ) : (
             <div className="flex-1 flex items-center justify-center">
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_30px_rgba(139,92,246,0.3)] mb-4"></div>
                    <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold animate-pulse">Odak ortamı hazırlanıyor...</span>
                 </div>
             </div>
         )}
      </main>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RoomContent />
    </Suspense>
  );
}
