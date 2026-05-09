"use client";

import { useEffect, useRef, useState } from "react";
import { placePixel, clearMyPixels, getSettings } from "../app/actions";
import { Palette } from "./palette";
import { Sidebar } from "./sidebar";
import { Leaderboard } from "./leaderboard";
import { AuthUI } from "./auth";
import { AdminUI } from "./admin";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

export default function Canvas({ initialPixels = [] }: { initialPixels?: Pixel[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<Pixel[]>(initialPixels);
  const [user, setUser] = useState<{ login: string, role: string } | null>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [imgKey, setImgKey] = useState("1");
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const syncSettings = async () => {
    const s = await getSettings();
    if (!s) return;
    if (s.targetImage !== imgKey) {
      setImgKey(s.targetImage ?? "1");
      setCacheBuster(Date.now());
    }
  };

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    syncSettings();
    const interval = setInterval(syncSettings, 5000);
    return () => clearInterval(interval);
  }, [user, imgKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !user || user.role === 'admin') return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 32, 32);
    pixels.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 1, 1);
    });
  }, [pixels, user]);

  const handleDraw = async (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas || !user || user.role === 'admin') return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 32));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 32));
    if (x >= 0 && x < 32 && y >= 0 && y < 32) {
      const newPixel = { x, y, color: selectedColor };
      setPixels(prev => [...prev.filter(p => !(p.x === x && p.y === y)), newPixel]);
      const res = await placePixel(x, y, selectedColor, user.login);
      if (res?.success) {
        setAccuracy(res.accuracy ?? 0);
        if (res.leaderboard) {
          setLeaderboard(res.leaderboard);
        }
        if (res.isWinner) {
          alert("ВЫ ПОБЕДИЛИ! 100% ТОЧНОСТЬ!!!");
        }
      } else if (res?.success === false) {
        alert("Доступ ограничен или вы заблокированы!");
        setUser(null);
      }
    }
  };

  if (!user) return <AuthUI onLogin={setUser} />;
  if (user.role === 'admin') return <AdminUI onLogout={() => setUser(null)} />;
  const currentImageUrl = `/${imgKey}.png?v=${cacheBuster}`;
  return (
    <div style={{ display: 'flex', gap: '40px', padding: '40px', alignItems: 'flex-start', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Sidebar
          login={user.login}
          onClear={async () => {
            const res = await clearMyPixels(user.login);
            if (res.success) { setPixels([]); setAccuracy(0); }
          }}
          onLogout={() => setUser(null)}
        />
        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: '#888', marginBottom: '15px', fontSize: '12px', fontWeight: 'bold' }}>НУЖНО НАРИСОВАТЬ:</h4>
          <div style={{
              width: '250px', height: '250px', margin: '0 auto',
              borderRadius: '8px', border: '3px solid #0082fc',
              backgroundImage: `url(${currentImageUrl})`,
              backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
              imageRendering: 'pixelated', backgroundColor: '#fff'
          }} />     
          <div style={{ marginTop: '15px' }}>
             <div style={{ fontSize: '14px', color: '#666' }}>Ваша точность:</div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0082fc' }}>
               {accuracy !== null ? `${accuracy}%` : '0%'}
             </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
        <div style={{ position: 'relative', borderRadius: '12px', border: '4px solid #0082fc', overflow: 'hidden', background: '#fff', lineHeight: 0 }}>
          <img
            src={currentImageUrl}
            alt="reference"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '512px', height: '512px',
              opacity: 0.2, pointerEvents: 'none',
              imageRendering: 'pixelated'
            }}
          />
          <canvas
            ref={canvasRef}
            width={32} height={32}
            onMouseDown={(e) => { setIsDrawing(true); handleDraw(e); }}
            onMouseMove={(e) => isDrawing && handleDraw(e)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            style={{ width: '512px', height: '512px', imageRendering: 'pixelated', cursor: 'crosshair', position: 'relative', zIndex: 1 }}
          />
        </div>
        <Palette selectedColor={selectedColor} onSelect={setSelectedColor} />
      </div>
      <Leaderboard players={leaderboard} currentUserLogin={user.login} />
    </div>
  );
}