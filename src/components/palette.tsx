"use client";

const COLORS = ["#000000", "#FFFFFF", "#373737", "#7F7F7F", "#C3C3C3", "#FF0000", 
  "#008000", "#FFC0CB", "#F5DEB3", "#8B4513", "#FFEBCD", "#EFE4B0", "#FF7F27",
  "#FFC90E", "#FFF200"];

interface PaletteProps {
  colors?: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

export function Palette({ selectedColor, onSelect }: PaletteProps) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {COLORS.map(c => (
        <div 
          key={c} 
          onClick={() => onSelect(c)} 
          style={{ 
            width: '40px', 
            height: '40px', 
            background: c, 
            border: selectedColor === c ? '4px solid #3b82f6' : '1px solid #fff', 
            cursor: 'pointer', 
            borderRadius: '4px' 
          }} 
        />
      ))}
    </div>
  );
}