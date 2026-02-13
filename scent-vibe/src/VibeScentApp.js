import React, { useEffect, useState } from 'react';

const VibeScentApp = () => {
  const [scent, setScent] = useState('Lavender');

  // 1. Voice Activation Function
  const speakScent = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new window.SpeechSynthesisUtterance(`Now diffusing ${text} scent`);
    utterance.rate = 0.9; // calmer voice
    utterance.pitch = 1.2;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore speech errors
    }
  };

  useEffect(() => {
    // Trigger voice when scent changes
    speakScent(scent);
  }, [scent]);

  return (
    <div style={styles.container}>
      {/* Background Animated Smoke (CSS Particles) */}
      <div className="smoke-container">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              backgroundColor: i % 3 === 0 ? '#E6E6FA' : i % 3 === 1 ? '#FFB6C1' : '#B19CD9',
              animationDelay: `${(i * 0.4) % 6}s`,
              left: `${Math.random() * 100}%`,
              width: 30 + Math.floor(Math.random() * 50),
              height: 30 + Math.floor(Math.random() * 50),
              opacity: 0.45 + Math.random() * 0.35,
            }}
          />
        ))}
      </div>

      {/* Glassmorphism UI Overlay */}
      <div style={styles.overlay}>
        <h1 style={styles.title}>Vibe Scent</h1>
        <p style={styles.subtitle}>
          Current Fragrance: <strong>{scent}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setScent('Lavender')} style={styles.button}>
            Lavender
          </button>
          <button onClick={() => setScent('Rose')} style={styles.button}>
            Rose
          </button>
          <button onClick={() => setScent('Citrus')} style={styles.button}>
            Citrus
          </button>
        </div>
      </div>

      <style>{`
        .smoke-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          inset: 0;
          background: linear-gradient(180deg, #fff 0%, #f7f7fb 100%);
        }
        .particle {
          position: absolute;
          bottom: -80px;
          border-radius: 50%;
          filter: blur(20px);
          animation: rise 8s infinite linear;
        }
        @keyframes rise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 0.4; }
          60% { opacity: 0.6; }
          100% { transform: translateY(-120vh) scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Inter, Arial, sans-serif',
    color: '#111',
  },
  overlay: {
    zIndex: 10,
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(12px)',
    padding: '28px',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  },
  title: { fontSize: '2rem', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: '1rem', color: '#333', marginBottom: 12 },
  button: {
    padding: '10px 16px',
    cursor: 'pointer',
    borderRadius: 10,
    border: 'none',
    background: '#222',
    color: '#fff',
    fontWeight: 600,
  },
};

export default VibeScentApp;
