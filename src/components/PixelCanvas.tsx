import { useRef, useEffect } from "react";

export function PixelCanvas({ pixels, onDraw, currentImageUrl }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 32, 32);
    pixels.forEach((p: any) => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 1, 1);
    });
  }, [pixels]);
  return (
    <div className="canvas-container" style={{ position: 'relative', border: '4px solid #0082fc' }}>
      <img src={currentImageUrl} style={{ position: 'absolute', opacity: 0.3, width: '512px', height: '512px', imageRendering: 'pixelated' }} />
      <canvas
        ref={canvasRef}
        width={32} height={32}
        onMouseDown={(e) => onDraw(e)}
        style={{ width: '512px', height: '512px', imageRendering: 'pixelated', position: 'relative', zIndex: 1 }}
      />
    </div>
  );
}