"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";
import { Trash2, Square, Circle, PenTool, MousePointer2, Eraser } from "lucide-react";
import { fabric } from "fabric";

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const room = useRoomContext();
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [color, setColor] = useState("#8b5cf6");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [mode, setMode] = useState<"draw" | "select" | "erase">("draw");
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: 'transparent'
    });

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = strokeWidth;

    setFabricCanvas(canvas);

    const handleResize = () => {
      if (containerRef.current) {
        canvas.setWidth(containerRef.current.clientWidth);
        canvas.setHeight(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Brush
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = mode === "draw";
      fabricCanvas.freeDrawingBrush.color = color;
      fabricCanvas.freeDrawingBrush.width = strokeWidth;
      fabricCanvas.selection = mode === "select";
    }
  }, [fabricCanvas, color, strokeWidth, mode]);

  // Sync Logic
  const syncCanvas = useCallback(() => {
    if (!fabricCanvas || !room?.localParticipant || isSyncingRef.current) return;
    const json = JSON.stringify({ type: 'WHITEBOARD_SYNC', state: fabricCanvas.toJSON() });
    const encoder = new TextEncoder();
    room.localParticipant.publishData(encoder.encode(json), { reliable: true });
  }, [fabricCanvas, room]);

  useEffect(() => {
    if (!fabricCanvas) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleErase = (opt: any) => {
        if (mode === 'erase' && opt.target) {
            fabricCanvas.remove(opt.target);
            syncCanvas();
        }
    };
    fabricCanvas.on('mouse:down', handleErase);
    return () => { fabricCanvas.off('mouse:down', handleErase); };
  }, [fabricCanvas, mode, syncCanvas]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const events = ['path:created', 'object:modified', 'object:removed', 'object:added'];
    
    const handler = () => {
        // Prevent echo
        if (isSyncingRef.current) return;
        syncCanvas();
    };

    events.forEach(ev => fabricCanvas.on(ev, handler));

    return () => {
      events.forEach(ev => fabricCanvas.off(ev, handler));
    };
  }, [fabricCanvas, syncCanvas]);

  // Receiver Logic
  useEffect(() => {
    if (!room || !fabricCanvas) return;
    const handleDataReceived = (payload: Uint8Array) => {
        const str = new TextDecoder().decode(payload);
        try {
            const data = JSON.parse(str);
            if (data.type === 'WHITEBOARD_SYNC') {
                isSyncingRef.current = true;
                fabricCanvas.loadFromJSON(data.state, () => {
                    fabricCanvas.renderAll();
                    isSyncingRef.current = false;
                });
            } else if (data.type === 'WHITEBOARD_CLEAR') {
                isSyncingRef.current = true;
                fabricCanvas.clear();
                fabricCanvas.backgroundColor = 'transparent';
                isSyncingRef.current = false;
            }
        } catch { }
    };
    room.on('dataReceived', handleDataReceived);
    return () => { room.off('dataReceived', handleDataReceived); };
  }, [room, fabricCanvas]);

  const clearCanvas = () => {
      if (fabricCanvas) {
          fabricCanvas.clear();
          fabricCanvas.backgroundColor = 'transparent';
          if (room?.localParticipant) {
              const enc = new TextEncoder();
              room.localParticipant.publishData(enc.encode(JSON.stringify({ type: 'WHITEBOARD_CLEAR' })), { reliable: true });
          }
      }
  };

  const addShape = (type: 'rect' | 'circle') => {
      if (!fabricCanvas) return;
      setMode("select");
      let shape;
      if (type === 'rect') {
          shape = new fabric.Rect({ left: 100, top: 100, fill: color, width: 100, height: 100, rx: 10, ry: 10 });
      } else {
          shape = new fabric.Circle({ left: 150, top: 150, fill: color, radius: 50 });
      }
      fabricCanvas.add(shape);
      fabricCanvas.setActiveObject(shape);
      syncCanvas(); // trigger sync manually for adding object
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background/40 rounded-3xl overflow-hidden backdrop-blur-md border object-contain border-white/10 group shadow-[inset_0_0_50px_rgba(255,255,255,0.02)]">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Toolbar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-2 bg-background/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center space-x-2 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-1 px-2">
               <button onClick={() => setMode('draw')} className={`p-2 rounded-full transition ${mode === 'draw' ? 'bg-primary text-white' : 'text-white/50 hover:bg-white/10'}`}><PenTool className="w-4 h-4" /></button>
               <button onClick={() => setMode('select')} className={`p-2 rounded-full transition ${mode === 'select' ? 'bg-primary text-white' : 'text-white/50 hover:bg-white/10'}`}><MousePointer2 className="w-4 h-4" /></button>
               <button onClick={() => setMode('erase')} className={`p-2 rounded-full transition ${mode === 'erase' ? 'bg-red-400 text-white' : 'text-white/50 hover:bg-white/10'}`}><Eraser className="w-4 h-4" /></button>
            </div>
            
            <div className="w-px h-6 bg-white/10 mx-1" />
            
            <div className="flex space-x-1 px-2">
                {['#ffffff', '#ef4444', '#3b82f6', '#8b5cf6', '#22c55e'].map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c }} />
                ))}
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <div className="flex space-x-2 px-2 items-center">
                 <input type="range" min="1" max="20" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} className="w-20 accent-primary" />
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <div className="flex space-x-1 px-2">
                <button onClick={() => addShape('rect')} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"><Square className="w-4 h-4" /></button>
                <button onClick={() => addShape('circle')} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"><Circle className="w-4 h-4" /></button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button onClick={clearCanvas} className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors ml-2">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
  )
}
