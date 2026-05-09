"use client";

import { useState, useEffect } from "react";
import { adminGetUsers, adminToggleBan, getLogs, updateActiveTask, updateAdminData} from "../app/actions";

export function AdminUI({ onLogout }: { onLogout: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [canvasSize, setCanvasSize] = useState(32);
  const [isProcessing, setIsProcessing] = useState(false);
  const [colorInput, setColorInput] = useState("#000000");
  const [size, setSize] = useState(32);
  const [targetPixels, setTargetPixels] = useState<any[]>([]);
  const availableImages = [
    { name: "Кот 1", path: "/1.png", key: "1" },
    { name: "Кот 2", path: "/2.png", key: "2" },
    { name: "Зайчик", path: "/3.png", key: "3" },
  ];
  const handleImage = (e: any) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const px = [];
    const colorSet = new Set<string>(); 
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a < 10) continue;
        const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        px.push({ x, y, color: hex });
        colorSet.add(hex.toUpperCase());
      }
    }
    setTargetPixels(px);
    const detectedPalette = Array.from(colorSet);
    updateAdminData(px, size, detectedPalette);
    alert(`Загружено! Найдено цветов: ${detectedPalette.length}`);
  };
  img.src = URL.createObjectURL(file);
};
  const refreshData = async () => {
    const u = await adminGetUsers();
    const l = await getLogs();
    setUsers(u);
    setLogs(l);
  };
  useEffect(() => {
    refreshData();
  }, []);
 const processAndSetTask = async (imgKey: string, imgPath: string) => {
    console.log("1. Начинаю процесс для:", imgKey, imgPath);
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
     img.onload = async () => {
      console.log("2. Картинка загружена успешно!");
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasSize;
      tempCanvas.height = canvasSize;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) {
        console.error("Ошибка: не удалось создать контекст канваса");
        return;
      }
      ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
      const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
      console.log("3. Данные пикселей получены");
      const map: Record<string, string> = {};
      for (let i = 0; i < imageData.data.length; i += 4) {
        const a = imageData.data[i + 3];
        if (a < 128) continue;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toUpperCase();
        const pixelIndex = i / 4;
        map[`${pixelIndex % canvasSize}-${Math.floor(pixelIndex / canvasSize)}`] = hex;
      }
      console.log("4. Карта пикселей готова, отправляю на сервер...");
      try {
        const res = await updateActiveTask(imgKey, map);
        console.log("5. Ответ сервера:", res);
        if (res.success) {
          alert("Референс успешно обновлён!");
          refreshData();
        }
      } catch (err) {
        console.error("Ошибка при вызове updateActiveTask:", err);
      }
      setIsProcessing(false);
    };
    img.onerror = (err) => {
      console.error("ОШИБКА: Файл не смог загрузиться по пути:", imgPath, err);
      setIsProcessing(false);
    };
    img.src = `${imgPath}?t=${Date.now()}`;
  };
  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "monospace", background: "#f4f7f6", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Панель управления</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <h3> Настройки холста</h3>
            <p style={{ fontSize: "12px", color: "#666" }}>Выберите размер, в котором сервер будет проверять пиксели</p>
            <div style={{ marginTop: "10px" }}>
              <label>Разрешение: </label>
              <select value={canvasSize} onChange={(e) => setCanvasSize(Number(e.target.value))} style={{ padding: "5px" }}>
                <option value={32}>32x32 (Стандарт)</option>
                <option value={64}>64x64</option>
                <option value={128}>128x128</option>
              </select>
            </div>
          </div>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <h3> Выберите референс</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "15px", marginTop: "15px" }}>
              {availableImages.map((img) => (
                <div key={img.key} style={{
                  textAlign: "center",
                  border: "1px solid #eee",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#fafafa"
                }}>
                  <img
                    src={img.path}
                    style={{ width: "60px", height: "60px", imageRendering: "pixelated", marginBottom: "8px", borderRadius: "4px" }}
                    alt={img.name}
                  />
                  <button
                    disabled={isProcessing}
                    onClick={() => processAndSetTask(img.key, img.path)}
                    style={{
                      fontSize: "11px",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      width: "100%",
                      padding: "5px",
                      background: "#0082fc",
                      color: "white",
                      border: "none",
                      borderRadius: "4px"
                    }}
                  >
                    {isProcessing ? "..." : "АКТИВИРОВАТЬ"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3> Активные игроки</h3>
          <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "15px" }}>
            {users.map((u) => (
              <div key={u.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                padding: "8px",
                background: u.isBanned ? "#fff1f1" : "#f9f9f9",
                borderRadius: "6px"
              }}>
                <span>{u.login} <b style={{color: "#0082fc"}}>[{u.score}]</b></span>
                {u.role !== "admin" && (
                  <button
                    style={{
                      padding: "4px 10px",
                      background: u.isBanned ? "#2ecc71" : "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                    onClick={async () => { await adminToggleBan(u.id, !u.isBanned); refreshData(); }}
                  >
                    {u.isBanned ? "РАЗБАН" : "БАН"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
     <div style={{ marginTop: "20px", background: "#fff", color: "#333", padding: "20px", borderRadius: "12px", border: "1px solid #ddd" }}>
  <h3 style={{ borderBottom: "1px solid #000000" }}>Логи событий</h3>
  <pre style={{ fontSize: '10px' }}>{JSON.stringify(logs, null, 2)}</pre>
  <div style={{ height: "150px", overflowY: "auto" }}>
    {logs.map((l, i) => (
  <div key={i} style={{ padding: "5px 0", borderBottom: "1px dotted #ff0000", fontSize: "13px" }}>
    <span style={{ color: "#666", marginRight: '10px' }}>
      {l.createdAt ? new Date(l.createdAt).toLocaleTimeString() : "---"}
    </span> 
    <span style={{ fontWeight: 'bold' }}>{l.action}</span>
  </div>
))}
  </div>
</div>
      <button onClick={onLogout} style={{
        width: "100%",
        marginTop: "20px",
        padding: "15px",
        background: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        letterSpacing: "1px"
      }}>
        ВЫЙТИ ИЗ СИСТЕМЫ
      </button>
    </div>
  );
}