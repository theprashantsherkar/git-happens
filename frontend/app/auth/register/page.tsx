"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  token?: string;
  message?: string;
}

type PasswordStrength = "weak" | "medium" | "strong" | "";

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return "";
  if (password.length < 6) return "weak";
  if (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
    return "strong";
  return "medium";
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = (): string | null => {
    if (!form.username.trim()) return "Choose a player name!";
    if (form.username.length < 3) return "Username must be 3+ characters.";
    if (!form.email.includes("@")) return "Enter a valid email address.";
    if (form.password.length < 6) return "Password must be 6+ characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match!";
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Try again!");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/game";
        }, 2000);
      }
    } catch {
      setError("Server error. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

        :root {
          --neon-cyan: #00f5ff;
          --neon-orange: #ff6b1a;
          --neon-pink: #ff2d78;
          --neon-green: #39ff14;
          --sun-yellow: #ffd700;
          --panel-bg: rgba(10, 5, 30, 0.88);
          --panel-border: #ff6b1a;
          --grass-green: #3dba4e;
          --earth-brown: #8b5e3c;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'VT323', monospace;
          min-height: 100vh;
          overflow: hidden;
        }

        .scene {
          position: fixed;
          inset: 0;
          background: linear-gradient(
            180deg,
            #050115 0%,
            #0d0221 10%,
            #1a0533 25%,
            #2d1b69 45%,
            #1e3a5f 60%,
            #4a9eca 74%,
            #7ec8e3 80%,
            #3dba4e 82%,
            #2a8a36 85%,
            #0a1f0e 100%
          );
        }

        /* Animated pixel stars */
        .stars { position: absolute; inset: 0; overflow: hidden; }
        .star {
          position: absolute;
          background: #fff;
          animation: twinkle 2s infinite alternate;
        }
        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }

        /* Dual suns (register has more energy!) */
        .sun {
          position: absolute;
          width: 70px;
          height: 70px;
          background: var(--sun-yellow);
          box-shadow: 0 0 0 6px #ffaa00, 0 0 40px 15px rgba(255,200,0,0.35);
        }
        .sun-main  { top: 10%; right: 12%; }
        .sun-small { top: 30%; left: 10%; width: 30px; height: 30px; background: #ffcc44; box-shadow: 0 0 0 3px #ffa000, 0 0 20px 8px rgba(255,160,0,0.2); }

        /* Sunset stripes */
        .sunset-stripes {
          position: absolute;
          top: 20%;
          right: 4%;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .stripe { height: 4px; }

        /* Mountains */
        .mountain {
          position: absolute;
          bottom: 18%;
          width: 0; height: 0;
          border-left-style: solid;
          border-right-style: solid;
          border-bottom-style: solid;
          border-left-color: transparent;
          border-right-color: transparent;
        }
        .m1 { right: 6%;  border-left-width: 90px;  border-right-width: 90px;  border-bottom-width: 130px; border-bottom-color: #4a6e8f; }
        .m2 { right: 18%; border-left-width: 65px;  border-right-width: 65px;  border-bottom-width: 95px;  border-bottom-color: #6a8faf; }
        .m3 { left: 3%;   border-left-width: 50px;  border-right-width: 50px;  border-bottom-width: 75px;  border-bottom-color: #5a7e9e; }

        /* Floating islands */
        .island { position: absolute; animation: float 4s ease-in-out infinite alternate; }
        .island-top    { background: var(--grass-green); }
        .island-bottom { background: var(--earth-brown); }
        .i1 { top: 18%; left: 3%;  animation-delay: 0s;   }
        .i2 { top: 28%; left: 20%; animation-delay: 1.5s; }
        .i3 { top: 12%; right: 32%; animation-delay: 0.7s;}

        @keyframes float {
          from { transform: translateY(0); }
          to   { transform: translateY(-14px); }
        }

        .pixel-tree { position: absolute; bottom: 100%; }
        .tree-trunk  { width: 8px;  height: 12px; background: #5c3d1a; margin: 0 auto; }
        .tree-top    { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; }
        .tree-top-2  { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; margin-top: -8px; }

        /* Crates & coins */
        .crate {
          position: absolute;
          background: #c47a2a;
          border: 2px solid #7a4a10;
          box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040;
          animation: float 3s ease-in-out infinite alternate;
        }
        .coin {
          position: absolute;
          background: var(--sun-yellow);
          border: 2px solid #b8860b;
          border-radius: 50%;
          animation: float 2s ease-in-out infinite alternate;
        }

        /* Ground */
        .ground {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 20%;
          background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%);
        }
        .ground::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 8px;
          background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px);
        }

        /* Explosion sparkle (register is exciting!) */
        .sparkle {
          position: absolute;
          animation: sparkle 1.5s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50%       { opacity: 1; transform: scale(1); }
        }

        /* Visual overlays */
        .scanlines {
          position: fixed; inset: 0; z-index: 5; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }
        .vignette {
          position: fixed; inset: 0; z-index: 4; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%);
        }
        .border-frame {
          position: fixed; inset: 8px; z-index: 3; pointer-events: none;
          border: 3px solid;
          border-image: linear-gradient(135deg, #ff6b1a, #ff2d78, #ffd700, #ff6b1a) 1;
          box-shadow: inset 0 0 20px rgba(255,107,26,0.1);
        }

        /* Page layout */
        .page {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* Logo */
        .logo-wrapper {
          text-align: center;
          margin-bottom: 20px;
          animation: logoEntrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes logoEntrance {
          from { transform: translateY(-40px) scale(0.8); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        .logo-title {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(26px, 5.5vw, 48px);
          display: block;
          background: linear-gradient(135deg, #ff6b1a, #ffd700, #ff2d78, #ff6b1a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(3px 3px 0 #000);
          letter-spacing: 4px;
        }
        .logo-subtitle {
          font-family: 'VT323', monospace;
          font-size: 22px;
          color: #fff;
          background: rgba(0,0,0,0.6);
          padding: 4px 20px;
          border: 2px solid #fff;
          display: inline-block;
          margin-top: 8px;
          letter-spacing: 2px;
        }

        /* Panel */
        .panel {
          background: var(--panel-bg);
          border: 3px solid var(--panel-border);
          box-shadow: 0 0 0 2px #000, 0 0 30px rgba(255,107,26,0.25), 8px 8px 0 rgba(0,0,0,0.8);
          padding: 32px 38px;
          width: 100%;
          max-width: 440px;
          position: relative;
          animation: panelEntrance 0.5s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes panelEntrance {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }

        .panel-corner {
          position: absolute;
          width: 8px; height: 8px;
          background: var(--neon-orange);
        }
        .panel-corner.tl { top: -1px; left: -1px; }
        .panel-corner.tr { top: -1px; right: -1px; }
        .panel-corner.bl { bottom: -1px; left: -1px; }
        .panel-corner.br { bottom: -1px; right: -1px; }

        .panel-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          color: var(--neon-orange);
          margin-bottom: 24px;
          text-align: center;
          text-shadow: 0 0 10px var(--neon-orange);
          letter-spacing: 1px;
        }

        /* Fields */
        .fields-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 0;
        }
        .field { margin-bottom: 16px; }
        .field-label {
          display: block;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          color: #ffbb88;
          margin-bottom: 7px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .field-input {
          width: 100%;
          background: rgba(0, 10, 30, 0.8);
          border: 2px solid #553322;
          color: #ffe8d0;
          font-family: 'VT323', monospace;
          font-size: 20px;
          padding: 9px 12px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input::placeholder { color: #553322; }
        .field-input:focus {
          border-color: var(--neon-orange);
          box-shadow: 0 0 0 2px rgba(255,107,26,0.2), inset 0 0 10px rgba(255,107,26,0.05);
        }

        /* Password strength meter */
        .strength-bar {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          height: 4px;
        }
        .strength-seg {
          flex: 1;
          height: 100%;
          border: 1px solid #333;
          transition: background 0.2s;
        }
        .strength-label {
          font-family: 'VT323', monospace;
          font-size: 14px;
          margin-top: 3px;
        }

        /* Error / success */
        .error-box {
          background: rgba(255,45,120,0.15);
          border: 2px solid var(--neon-pink);
          color: var(--neon-pink);
          font-family: 'VT323', monospace;
          font-size: 18px;
          padding: 10px 14px;
          margin-bottom: 16px;
          text-align: center;
        }
        .success-box {
          background: rgba(57,255,20,0.1);
          border: 2px solid var(--neon-green);
          color: var(--neon-green);
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          padding: 16px;
          text-align: center;
          line-height: 1.8;
          animation: successPulse 0.8s ease-in-out infinite alternate;
        }
        @keyframes successPulse {
          from { box-shadow: 0 0 10px rgba(57,255,20,0.2); }
          to   { box-shadow: 0 0 25px rgba(57,255,20,0.5); }
        }

        .shake { animation: shake 0.5s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }

        /* Buttons */
        .btn-primary {
          width: 100%;
          background: var(--neon-orange);
          color: #fff;
          border: 3px solid #000;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          padding: 14px;
          cursor: pointer;
          box-shadow: 4px 4px 0 #000;
          letter-spacing: 1px;
          transition: transform 0.08s, box-shadow 0.08s;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .btn-primary:hover:not(:disabled) {
          background: #ff8c3a;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 #000;
        }
        .btn-primary:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #000;
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-loading { display: inline-flex; align-items: center; gap: 8px; }
        .pixel-spinner {
          width: 12px; height: 12px; background: #fff;
          animation: pixelSpin 0.6s steps(4) infinite;
        }
        @keyframes pixelSpin {
          0%   { clip-path: polygon(0 0, 50% 0, 50% 50%, 0 50%); }
          25%  { clip-path: polygon(50% 0, 100% 0, 100% 50%, 50% 50%); }
          50%  { clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%); }
          75%  { clip-path: polygon(0 50%, 50% 50%, 50% 100%, 0 100%); }
          100% { clip-path: polygon(0 0, 50% 0, 50% 50%, 0 50%); }
        }

        /* Divider & login link */
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line {
          flex: 1; height: 2px;
          background: repeating-linear-gradient(90deg, #553322 0px, #553322 4px, transparent 4px, transparent 8px);
        }
        .divider-text { font-family: 'VT323', monospace; font-size: 16px; color: #775544; white-space: nowrap; }

        .login-link { text-align: center; }
        .login-link p { font-family: 'VT323', monospace; font-size: 18px; color: #997766; }
        .login-link a { color: var(--neon-orange); text-decoration: none; transition: text-shadow 0.2s; }
        .login-link a:hover { text-shadow: 0 0 10px var(--neon-orange); text-decoration: underline; }
      `}</style>

      {/* Scene */}
      <div className="scene">
        <div className="stars">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 55}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="sun sun-main" />
        <div className="sun sun-small" />

        <div className="sunset-stripes">
          {[80, 65, 50, 38, 28].map((w, i) => (
            <div
              key={i}
              className="stripe"
              style={{
                width: `${w}px`,
                background: i % 2 === 0 ? "#ff2d78" : "#ff6b1a",
                opacity: 0.7 - i * 0.1,
              }}
            />
          ))}
        </div>

        <div className="mountain m1" />
        <div className="mountain m2" />
        <div className="mountain m3" />

        {/* Island 1 */}
        <div className="island i1">
          <div className="island-top" style={{ width: 72, height: 14, borderRadius: "3px 3px 0 0" }}>
            <div className="pixel-tree" style={{ left: 8 }}>
              <div className="tree-top-2" style={{ width: 16 }} />
              <div className="tree-top" style={{ width: 20 }} />
              <div className="tree-trunk" />
            </div>
            <div className="pixel-tree" style={{ left: 42 }}>
              <div className="tree-top" style={{ width: 16 }} />
              <div className="tree-trunk" style={{ width: 6, height: 8 }} />
            </div>
          </div>
          <div className="island-bottom" style={{ width: 72, height: 18, clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)" }} />
        </div>

        {/* Island 2 */}
        <div className="island i2">
          <div className="island-top" style={{ width: 50, height: 12, borderRadius: "3px 3px 0 0" }}>
            <div className="pixel-tree" style={{ left: 14 }}>
              <div className="tree-top" style={{ width: 18 }} />
              <div className="tree-trunk" style={{ height: 8 }} />
            </div>
          </div>
          <div className="island-bottom" style={{ width: 50, height: 13, clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }} />
        </div>

        {/* Crates */}
        <div className="crate" style={{ width: 20, height: 20, top: "25%", left: "28%", animationDelay: "0.4s" }} />
        <div className="crate" style={{ width: 16, height: 16, top: "42%", right: "20%", animationDelay: "1.1s" }} />
        <div className="crate" style={{ width: 14, height: 14, top: "20%", left: "40%", animationDelay: "0.7s" }} />

        {/* Coins */}
        <div className="coin" style={{ width: 10, height: 10, top: "32%", left: "33%", animationDelay: "0s" }} />
        <div className="coin" style={{ width: 8, height: 8, top: "22%", left: "46%", animationDelay: "0.6s" }} />

        {/* Sparkles */}
        {[
          { top: "35%", left: "15%", delay: "0s", color: "#ffd700" },
          { top: "20%", right: "40%", delay: "0.8s", color: "#ff6b1a" },
          { top: "45%", right: "15%", delay: "1.4s", color: "#00f5ff" },
        ].map((s, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              top: s.top,
              left: "left" in s ? s.left : undefined,
              right: "right" in s ? s.right : undefined,
              animationDelay: s.delay,
              color: s.color,
              fontSize: 20,
            }}
          >
            ✦
          </div>
        ))}

        <div className="ground" />
      </div>

      <div className="scanlines" />
      <div className="vignette" />
      <div className="border-frame" />

      {/* Main content */}
      <main className="page">
        <div className="logo-wrapper">
          <span className="logo-title">FLAGZiLLA</span>
          <div className="logo-subtitle">⚔ a fun multiplayer game ⚔</div>
        </div>

        <div className={`panel ${shake ? "shake" : ""}`}>
          <div className="panel-corner tl" />
          <div className="panel-corner tr" />
          <div className="panel-corner bl" />
          <div className="panel-corner br" />

          <h2 className="panel-title">✦ CREATE ACCOUNT ✦</h2>

          {success ? (
            <div className="success-box">
              ✅ ACCOUNT CREATED!
              <br />
              <br />
              ENTERING THE GAME...
              <br />
              GET READY TO PLAY!
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <div className="error-box">⚠ {error}</div>}

              <div className="field">
                <label className="field-label" htmlFor="username">
                  🎮 Player Name
                </label>
                <input
                  className="field-input"
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="CoolPlayer123"
                  required
                  autoComplete="username"
                  maxLength={20}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="email">
                  📧 Email Address
                </label>
                <input
                  className="field-input"
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="player@flagzilla.gg"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">
                  🔒 Password
                </label>
                <input
                  className="field-input"
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                {form.password.length > 0 && (
                  <>
                    <div className="strength-bar">
                      <div
                        className="strength-seg"
                        style={{
                          background:
                            passwordStrength === "weak" ? "#ff2d78"
                            : passwordStrength === "medium" ? "#ffd700"
                            : "#39ff14",
                        }}
                      />
                      <div
                        className="strength-seg"
                        style={{
                          background:
                            passwordStrength === "medium" ? "#ffd700"
                            : passwordStrength === "strong" ? "#39ff14"
                            : "#333",
                        }}
                      />
                      <div
                        className="strength-seg"
                        style={{
                          background: passwordStrength === "strong" ? "#39ff14" : "#333",
                        }}
                      />
                    </div>
                    <div
                      className="strength-label"
                      style={{
                        color:
                          passwordStrength === "weak" ? "#ff2d78"
                          : passwordStrength === "medium" ? "#ffd700"
                          : "#39ff14",
                      }}
                    >
                      {passwordStrength === "weak" && "⚠ WEAK PASSWORD"}
                      {passwordStrength === "medium" && "◆ MEDIUM STRENGTH"}
                      {passwordStrength === "strong" && "✓ STRONG PASSWORD"}
                    </div>
                  </>
                )}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="confirmPassword">
                  🔒 Confirm Password
                </label>
                <input
                  className="field-input"
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  style={{
                    borderColor:
                      form.confirmPassword.length > 0
                        ? form.confirmPassword === form.password
                          ? "#39ff14"
                          : "#ff2d78"
                        : undefined,
                  }}
                />
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="pixel-spinner" />
                    CREATING...
                  </span>
                ) : (
                  "✦ JOIN THE GAME"
                )}
              </button>
            </form>
          )}

          {!success && (
            <>
              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">— HAVE ACCOUNT? —</span>
                <div className="divider-line" />
              </div>
              <div className="login-link">
                <p>
                  Already a player?{" "}
                  <Link href="/auth/login">Log in here →</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
