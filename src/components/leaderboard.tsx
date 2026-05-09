"use client";

interface Player {
  login: string;
  score: number;
  accuracy?: number;
}
interface LeaderboardProps {
  players: Player[];
  currentUserLogin?: string;
}

export function Leaderboard({ players, currentUserLogin }: LeaderboardProps) {
  return (
    <div style={{ 
      background: '#0155a3', 
      padding: '20px', 
      borderRadius: '15px', 
      minWidth: '260px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      border: '2px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ 
        borderBottom: '2px solid rgba(255,255,255,0.2)', 
        paddingBottom: '10px', 
        marginTop: 0,
        color: 'white',
        fontSize: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Лидеры:
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {players.length > 0 ? (
          players.map((u, i) => {
            const isWinner = u.accuracy === 100;
            const isMe = u.login === currentUserLogin;
            return (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px 0', 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  alignItems: 'center',
                  background: isWinner ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                  margin: '0 -10px',
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontWeight: isMe ? 'bold' : 'normal',
                    color: isMe ? '#4ade80' : 'white',
                    fontSize: '15px'
                  }}>
                    {i + 1}. {u.login} {isWinner && "👑"}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                    Пикселей: {u.score}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: isWinner ? '#4ade80' : '#fbbf24', 
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {u.accuracy || 0}%
                  </div>
                  {isWinner && (
                    <div style={{ 
                      fontSize: '9px', 
                      color: '#4ade80', 
                      textTransform: 'uppercase',
                      fontWeight: 'black' 
                    }}>
                      Победа!
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
            Ожидание игроков...
          </span>
        )}
      </div>
    </div>
  );
}