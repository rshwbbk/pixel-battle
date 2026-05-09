"use client";
import { useState } from "react";
import { loginUser } from "../app/actions";

interface AuthUIProps {
  onLogin: (user: { login: string; role: string }) => void;
}

export function AuthUI({ onLogin }: AuthUIProps) {
  const [auth, setAuth] = useState({ login: "", pass: "" });
  const handleLogin = async () => {
    const res = await loginUser(auth.login, auth.pass);
    if (res.success && res.user) {
      onLogin(res.user);
    } else {
      alert(res.error || "Ошибка входа!");
    }
  };

  return (
    <div style={{ 
      padding: '50px', 
      background: '#ffffff', 
      borderRadius: '20px', 
      textAlign: 'center', 
      color: 'white',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    }}>
      <h2 style={{ marginBottom: '20px', letterSpacing: '2px',  color: '#000' }}>Авторизация</h2>
      <input 
        style={{ display: 'block', margin: '10px auto', padding: '12px', borderRadius: '8px', border: 'none', width: '250px', color: '#000' }} 
        placeholder="username" 
        onChange={e => setAuth({...auth, login: e.target.value})} 
      />
      <input 
        type="password" 
        style={{ display: 'block', margin: '10px auto', padding: '12px', borderRadius: '8px', border: 'none', width: '250px', color: '#000' }} 
        placeholder="password" 
        onChange={e => setAuth({...auth, pass: e.target.value})} 
      />
      <button 
        style={{ 
          marginTop: '10px', padding: '12px 30px', background: '#3b82f6', 
          color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
        }}
        onClick={handleLogin}
      >
        Войти
      </button>
    </div>
  );
}