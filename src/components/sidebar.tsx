"use client";

interface SidebarProps {
  login: string;
  onClear: () => void;
  onLogout: () => void;
}

export function Sidebar({ login, onClear, onLogout }: SidebarProps) {
  return (
    <div style={{ width: '200px', textAlign: 'center' }}>
      <h4 style={{ 
        color: '#000',
        alignContent: "center"
      }}>{login}</h4>
            <button 
        onClick={() => confirm("Вы действительно хотите очистить холст?") && onClear()} 
        style={{ 
          marginTop: '20px', padding: '10px', background: '#f59e0b', 
          color: 'white', border: 'none', cursor: 'pointer', width: '100%' 
        }}
      >
        Очистить холст
      </button>
      <button 
        onClick={onLogout} 
        style={{ 
          marginTop: '10px', padding: '10px', background: '#666', 
          color: 'white', border: 'none', cursor: 'pointer', width: '100%' 
        }}
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}