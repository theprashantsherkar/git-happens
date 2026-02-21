import React, { useState } from 'react';

const sessionOptions = [
  { label: '2 Minutes', value: 2 },
  { label: '5 Minutes', value: 5 },
  { label: '10 Minutes', value: 10 },
  { label: '20 Minutes', value: 20 },
];

const LandingPage = () => {
  const [showSession, setShowSession] = useState(false);

  const handleStart = () => setShowSession(true);
  const handleSessionSelect = (minutes: number) => {
    window.location.href = `/game?session=${minutes}`;
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      color: '#fff',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 24 }}>Welcome to Flagzilla</h1>
      <p style={{ fontSize: 20, maxWidth: 600, textAlign: 'center', marginBottom: 32 }}>
        Run, chase, and battle for the flag! Avoid obstacles, hit the flag bearer, and climb the leaderboard. Whoever holds the flag longest wins!
      </p>
      {!showSession ? (
        <button style={{
          fontSize: 20,
          padding: '16px 40px',
          borderRadius: 8,
          background: '#FFD700',
          color: '#232526',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          marginTop: 16,
          transition: 'background 0.2s',
        }}
          onClick={handleStart}
        >
          Start Game
        </button>
      ) : (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>Choose Session Duration</h2>
          {sessionOptions.map(opt => (
            <button
              key={opt.value}
              style={{
                fontSize: 18,
                padding: '12px 32px',
                borderRadius: 8,
                background: '#FFD700',
                color: '#232526',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                margin: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'background 0.2s',
              }}
              onClick={() => handleSessionSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
