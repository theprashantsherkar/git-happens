"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
// import { useMusic } from "./hooks/useAudio";

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
    // useMusic("nav");
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
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
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
        setTimeout(() => { window.location.href = "/game"; }, 2000);
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
          --panel-bg: rgba(8, 4, 24, 0.93);
          --panel-border: #ff6b1a;
          --grass-green: #3dba4e;
          --earth-brown: #8b5e3c;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'VT323', monospace;
          min-height: 100vh;
          overflow-x: hidden;
          overflow-y: auto;
        }

        /* ─── SCENE ─── */
        .scene {
          position: fixed; inset: 0;
          background: linear-gradient(
            180deg,
            #050115 0%, #0d0221 10%, #1a0533 22%,
            #2d1b69 42%, #1e3a5f 58%,
            #2a6e44 70%, #3dba4e 75%,
            #2a8a36 80%, #0a1f0e 100%
          );
        }

        .stars { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .star  { position: absolute; background: #fff; animation: twinkle 2s infinite alternate; }
        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }

        .sun {
          position: absolute; top: 7%; right: 10%;
          width: 72px; height: 72px; background: #ffd700;
          box-shadow: 0 0 0 8px #ffaa00, 0 0 50px 20px rgba(255,210,0,0.35);
        }
        .sunset-stripes { position: absolute; top: 19%; right: 4%; display: flex; flex-direction: column; gap: 3px; }
        .stripe { height: 4px; }

        .mountain {
          position: absolute; bottom: 18%; width: 0; height: 0;
          border-style: solid; border-color: transparent;
          border-left-style: solid; border-right-style: solid; border-bottom-style: solid;
          border-left-color: transparent; border-right-color: transparent;
        }
        .m1 { right: 4%;  border-left-width: 90px;  border-right-width: 90px;  border-bottom-width: 130px; border-bottom-color: #4a6e8f; }
        .m2 { right: 17%; border-left-width: 65px;  border-right-width: 65px;  border-bottom-width: 95px;  border-bottom-color: #6a8faf; }
        .m3 { left: 1%;   border-left-width: 55px;  border-right-width: 55px;  border-bottom-width: 80px;  border-bottom-color: #5a7e9e; }

        .island { position: absolute; animation: floatIsland 4s ease-in-out infinite alternate; }
        .island-grass { background: #3dba4e; }
        .island-earth { background: #8b5e3c; }
        @keyframes floatIsland { from { transform: translateY(0); } to { transform: translateY(-14px); } }

        .pixel-tree { position: absolute; bottom: 100%; }
        .tree-trunk  { width: 8px; height: 12px; background: #5c3d1a; margin: 0 auto; }
        .tree-top    { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; }
        .tree-top-2  { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; margin-top: -8px; }

        .crate {
          position: absolute; background: #c47a2a;
          border: 2px solid #7a4a10;
          box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040;
          animation: floatIsland 3s ease-in-out infinite alternate;
        }
        .coin {
          position: absolute; background: #ffd700;
          border: 2px solid #b8860b; border-radius: 50%;
          animation: floatIsland 2s ease-in-out infinite alternate;
        }

        /* ─── GROUND ─── */
        .ground {
          position: absolute; bottom: 0; left: 0; right: 0; height: 20%;
          background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%);
        }
        .ground::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px;
          background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px);
        }

        /* ─── STICK FIGURES ─── */
        /*
          Panel is max-width 400px centered.
          On a ~1200px screen the panel occupies roughly 33% of width (center third).
          LEFT side  figures: 3% – 28%   (blue at ~10%, red at ~22%)
          RIGHT side figures: 72% – 97%  (green at ~74%, yellow at ~86%)
          Figures are scaled up ~1.7× vs old version.
        */
        .figures-scene {
          position: absolute;
          bottom: 19.5%;
          left: 0; right: 0;
          height: 260px;      /* taller to fit bigger figures */
          pointer-events: none;
        }

        @keyframes runBob {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        @keyframes legSwingF { from { transform: rotate(-24deg); } to { transform: rotate(20deg); } }
        @keyframes legSwingB { from { transform: rotate(20deg);  } to { transform: rotate(-24deg); } }
        @keyframes armSwing  { from { transform: rotate(-20deg); } to { transform: rotate(24deg);  } }
        /* hammer: big overhead swing */
        @keyframes hammerUp  { from { transform: rotate(-100deg); } to { transform: rotate(-50deg); } }
        /* sword: wide slash */
        @keyframes swordSlash { from { transform: rotate(-70deg); } to { transform: rotate(-20deg); } }
        /* pickaxe: downward chop */
        @keyframes pickSwing  { from { transform: rotate(-75deg); } to { transform: rotate(-25deg); } }
        @keyframes flagWave   { from { transform: skewY(-5deg) scaleX(1);   } to { transform: skewY(5deg) scaleX(0.9); } }
        @keyframes dustPuff   {
          from { opacity: 0.5; transform: translateY(0) scale(1); }
          to   { opacity: 0;   transform: translateY(-10px) scale(1.6); }
        }
        @keyframes explodePulse {
          from { transform: scale(0.85) rotate(-8deg); opacity: 0.8; }
          to   { transform: scale(1.2)  rotate(8deg);  opacity: 1;   }
        }

        /* common figure wrapper */
        .figure { position: absolute; bottom: 0; animation: runBob 0.35s ease-in-out infinite; }

        /* ══════════════════════════════════════
           BLUE  — flag carrier  (LEFT side)
           Scale: ~1.7× original
        ══════════════════════════════════════ */
        .blue-head {
          width: 46px; height: 46px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #4fc3f7, #0277bd);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .blue-head::before { /* bandana */
          content: ''; position: absolute;
          top: 23px; left: -3px; right: -3px; height: 9px;
          background: linear-gradient(90deg, #e0e0e0, #bdbdbd);
          border-radius: 4px;
        }
        .blue-head::after { /* eye glint */
          content: ''; position: absolute;
          top: 11px; left: 11px;
          width: 13px; height: 8px;
          background: rgba(255,255,255,0.85);
          border-radius: 50% 50% 0 0;
        }
        .blue-torso {
          width: 40px; height: 50px;
          background: linear-gradient(160deg, #1565c0, #0d47a1);
          border-radius: 7px 7px 10px 10px;
          margin: -3px auto 0; position: relative;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        .blue-arm-back {
          position: absolute; top: 4px; left: -15px;
          width: 16px; height: 36px;
          background: linear-gradient(180deg, #1976d2, #0d47a1);
          border-radius: 8px;
          transform: rotate(25deg); transform-origin: top center;
          animation: armSwing 0.35s ease-in-out infinite alternate;
        }
        .blue-arm-flag {
          position: absolute; top: -6px; right: -13px;
          width: 16px; height: 40px;
          background: linear-gradient(180deg, #1976d2, #0d47a1);
          border-radius: 8px;
          transform: rotate(-15deg); transform-origin: top center;
        }
        .flag-pole {
          position: absolute; top: -90px; right: -3px;
          width: 6px; height: 94px;
          background: linear-gradient(90deg, #a1887f, #5d4037);
          border-radius: 3px;
        }
        .flag-cloth {
          position: absolute; top: 0; left: 6px;
          width: 50px; height: 36px;
          background: linear-gradient(140deg, #e53935 50%, #c62828);
          clip-path: polygon(0 0, 100% 22%, 100% 78%, 0 100%);
          animation: flagWave 0.4s ease-in-out infinite alternate;
          transform-origin: left center;
          box-shadow: 3px 3px 8px rgba(0,0,0,0.45);
        }
        .flag-cloth::after {
          content: ''; position: absolute; inset: 6px 12px;
          background: rgba(255,255,255,0.12);
          clip-path: polygon(0 0, 100% 22%, 100% 78%, 0 100%);
        }
        .blue-legs { position: relative; width: 40px; height: 46px; margin: 0 auto; }
        .blue-leg-l {
          position: absolute; left: 2px; top: 0;
          width: 17px; height: 44px;
          background: linear-gradient(180deg, #1a237e, #283593);
          border-radius: 8px;
          animation: legSwingF 0.35s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .blue-leg-r {
          position: absolute; right: 2px; top: 0;
          width: 17px; height: 44px;
          background: linear-gradient(180deg, #1a237e, #283593);
          border-radius: 8px;
          animation: legSwingB 0.35s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .blue-foot-l, .blue-foot-r {
          position: absolute; bottom: -6px;
          width: 22px; height: 10px;
          background: #0d47a1; border-radius: 0 5px 5px 0;
        }
        .blue-foot-l { left: -3px; }
        .blue-foot-r { right: -3px; transform: scaleX(-1); }

        /* ══════════════════════════════════════
           RED  — hammer chaser  (LEFT side, close behind blue)
        ══════════════════════════════════════ */
        .red-head {
          width: 43px; height: 43px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #ef5350, #b71c1c);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .red-head::after {
          content: ''; position: absolute;
          top: 10px; left: 10px;
          width: 12px; height: 8px;
          background: rgba(255,255,255,0.8);
          border-radius: 50% 50% 0 0;
        }
        .red-torso {
          width: 35px; height: 46px;
          background: linear-gradient(160deg, #c62828, #b71c1c);
          border-radius: 6px 6px 9px 9px;
          margin: -2px auto 0; position: relative;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        .red-arm-back {
          position: absolute; top: 4px; left: -13px;
          width: 14px; height: 32px;
          background: linear-gradient(180deg, #e53935, #c62828);
          border-radius: 7px;
          transform: rotate(20deg); transform-origin: top center;
          animation: armSwing 0.35s ease-in-out infinite alternate;
        }
        .red-arm-hammer {
          position: absolute; top: -14px; right: -15px;
          width: 14px; height: 36px;
          background: linear-gradient(180deg, #e53935, #c62828);
          border-radius: 7px;
          transform-origin: bottom center;
          animation: hammerUp 0.45s ease-in-out infinite alternate;
        }
        .hammer-head {
          position: absolute; top: -14px; left: -10px;
          width: 33px; height: 18px;
          background: linear-gradient(90deg, #757575, #424242);
          border-radius: 4px;
          box-shadow: 0 3px 7px rgba(0,0,0,0.6);
        }
        .hammer-head::after {
          content: ''; position: absolute;
          top: 3px; left: 3px; right: 3px; bottom: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
        }
        .red-legs { position: relative; width: 35px; height: 44px; margin: 0 auto; }
        .red-leg-l {
          position: absolute; left: 2px; top: 0;
          width: 15px; height: 42px;
          background: linear-gradient(180deg, #7f0000, #b71c1c);
          border-radius: 7px;
          animation: legSwingB 0.32s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .red-leg-r {
          position: absolute; right: 2px; top: 0;
          width: 15px; height: 42px;
          background: linear-gradient(180deg, #7f0000, #b71c1c);
          border-radius: 7px;
          animation: legSwingF 0.32s ease-in-out infinite alternate;
          transform-origin: top center;
        }

        /* ══════════════════════════════════════
           GREEN  — sword fighter  (RIGHT side)
        ══════════════════════════════════════ */
        .green-head {
          width: 43px; height: 43px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #66bb6a, #2e7d32);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .green-head::after {
          content: ''; position: absolute;
          top: 10px; left: 9px;
          width: 12px; height: 7px;
          background: rgba(255,255,255,0.8);
          border-radius: 50% 50% 0 0;
        }
        .green-torso {
          width: 35px; height: 46px;
          background: linear-gradient(160deg, #388e3c, #2e7d32);
          border-radius: 6px 6px 9px 9px;
          margin: -2px auto 0; position: relative;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        /* green faces RIGHT (toward yellow), arms mirrored */
        .green-arm-back {
          position: absolute; top: 4px; right: -13px;
          width: 14px; height: 32px;
          background: linear-gradient(180deg, #43a047, #2e7d32);
          border-radius: 7px;
          transform: rotate(-20deg); transform-origin: top center;
          animation: armSwing 0.38s ease-in-out infinite alternate;
        }
        .green-arm-sword {
          position: absolute; top: -12px; left: -16px;
          width: 14px; height: 34px;
          background: linear-gradient(180deg, #43a047, #2e7d32);
          border-radius: 7px;
          transform-origin: bottom center;
          animation: swordSlash 0.5s ease-in-out infinite alternate;
        }
        .sword-guard {
          position: absolute; top: -2px; left: -8px;
          width: 30px; height: 8px;
          background: linear-gradient(90deg, #795548, #4e342e);
          border-radius: 3px;
        }
        .sword-blade {
          position: absolute; top: -52px; left: 2px;
          width: 11px; height: 56px;
          background: linear-gradient(180deg, #e0f7fa, #4dd0e1 40%, #00838f);
          border-radius: 5px 5px 0 0;
          box-shadow: 0 0 12px rgba(0,245,255,0.8);
        }
        .green-legs { position: relative; width: 35px; height: 44px; margin: 0 auto; }
        .green-leg-l {
          position: absolute; left: 2px; top: 0;
          width: 15px; height: 42px;
          background: linear-gradient(180deg, #1b5e20, #2e7d32);
          border-radius: 7px;
          /* green is planted, facing yellow — less running, more combat stance */
          animation: legSwingF 0.6s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .green-leg-r {
          position: absolute; right: 2px; top: 0;
          width: 15px; height: 42px;
          background: linear-gradient(180deg, #1b5e20, #2e7d32);
          border-radius: 7px;
          animation: legSwingB 0.6s ease-in-out infinite alternate;
          transform-origin: top center;
        }

        /* ══════════════════════════════════════
           YELLOW  — pickaxe fighter  (RIGHT side, facing green)
        ══════════════════════════════════════ */
        .yellow-head {
          width: 41px; height: 41px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #ffee58, #f9a825);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .yellow-head::after {
          content: ''; position: absolute;
          top: 9px; left: 8px;
          width: 11px; height: 7px;
          background: rgba(255,255,255,0.8);
          border-radius: 50% 50% 0 0;
        }
        .yellow-torso {
          width: 32px; height: 44px;
          background: linear-gradient(160deg, #f9a825, #e65100);
          border-radius: 6px 6px 8px 8px;
          margin: -2px auto 0; position: relative;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        /* yellow faces LEFT (toward green) */
        .yellow-arm-back {
          position: absolute; top: 4px; left: -12px;
          width: 13px; height: 29px;
          background: linear-gradient(180deg, #fbc02d, #f9a825);
          border-radius: 6px;
          transform: rotate(20deg); transform-origin: top center;
          animation: armSwing 0.4s ease-in-out infinite alternate;
        }
        .yellow-arm-pick {
          position: absolute; top: -15px; right: -15px;
          width: 13px; height: 35px;
          background: linear-gradient(180deg, #fbc02d, #f9a825);
          border-radius: 6px;
          transform-origin: bottom center;
          animation: pickSwing 0.5s ease-in-out infinite alternate;
        }
        .pick-head {
          position: absolute; top: -14px; left: -12px;
          width: 36px; height: 13px;
          background: linear-gradient(90deg, #9e9e9e, #616161);
          border-radius: 3px;
          box-shadow: 0 3px 7px rgba(0,0,0,0.55);
        }
        .pick-tip {
          position: absolute; right: -8px; top: -8px;
          width: 14px; height: 20px;
          background: linear-gradient(180deg, #bdbdbd, #757575);
          clip-path: polygon(0 0, 100% 50%, 0 100%);
        }
        .yellow-legs { position: relative; width: 32px; height: 42px; margin: 0 auto; }
        .yellow-leg-l {
          position: absolute; left: 2px; top: 0;
          width: 13px; height: 40px;
          background: linear-gradient(180deg, #e65100, #bf360c);
          border-radius: 6px;
          animation: legSwingB 0.6s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .yellow-leg-r {
          position: absolute; right: 2px; top: 0;
          width: 13px; height: 40px;
          background: linear-gradient(180deg, #e65100, #bf360c);
          border-radius: 6px;
          animation: legSwingF 0.6s ease-in-out infinite alternate;
          transform-origin: top center;
        }

        /* ─── Shared figure utils ─── */
        .fig-shadow {
          width: 46px; height: 9px;
          background: rgba(0,0,0,0.28);
          border-radius: 50%;
          margin: 3px auto 0;
        }
        .dust-cloud { display: flex; gap: 4px; justify-content: center; margin-top: 2px; }
        .dust-puff {
          width: 14px; height: 9px;
          background: rgba(255,255,255,0.22);
          border-radius: 50%;
          animation: dustPuff 0.4s ease-out infinite alternate;
        }
        .dust-puff:nth-child(2) { animation-delay: 0.12s; width: 10px; }
        .dust-puff:nth-child(3) { animation-delay: 0.22s; width: 12px; }

        /* Explosion between the fighters */
        .explosion-fx {
          position: absolute; font-size: 42px;
          animation: explodePulse 0.7s ease-in-out infinite alternate;
        }

        /* ─── CRT OVERLAYS ─── */
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
          border: 3px solid; border-image: linear-gradient(135deg, #ff6b1a, #ff2d78, #ffd700, #ff6b1a) 1;
        }

        /* ─── PAGE ─── */
        .page {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start;
          padding: 26px 20px 60px;
        }

        /* ─── LOGO ─── */
        .logo-wrapper {
          text-align: center; margin-bottom: 12px;
          animation: panelIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both;
        }
        @keyframes panelIn {
          from { transform: translateY(-28px) scale(0.88); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        .logo-title {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(22px, 4.5vw, 44px);
          display: block;
          background: linear-gradient(135deg, #ff6b1a, #ffd700, #ff2d78, #ff6b1a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(3px 3px 0 #000);
          letter-spacing: 4px;
        }
        .logo-subtitle {
          font-family: 'VT323', monospace; font-size: 20px; color: #fff;
          background: rgba(0,0,0,0.65); padding: 3px 18px;
          border: 2px solid #fff; display: inline-block;
          margin-top: 7px; letter-spacing: 2px;
        }

        /* ─── GAME INFO PILLS ─── */
        .game-info {
          display: flex; gap: 8px; margin-bottom: 13px;
          flex-wrap: wrap; justify-content: center;
          animation: panelIn 0.5s 0.1s both;
        }
        .info-pill {
          background: rgba(0,0,0,0.7);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 5px 11px;
          display: flex; align-items: center; gap: 5px;
          white-space: nowrap;
        }
        .info-pill-icon { font-size: 14px; }
        .info-pill-text {
          font-family: 'VT323', monospace; font-size: 15px;
          color: rgba(255,255,255,0.72); letter-spacing: 1px;
        }
        .info-pill-text strong { color: #ffd700; font-weight: normal; }

        /* ─── PANEL (compact) ─── */
        .panel {
          background: var(--panel-bg);
          border: 3px solid var(--panel-border);
          box-shadow: 0 0 0 2px #000, 0 0 28px rgba(255,107,26,0.28), 8px 8px 0 rgba(0,0,0,0.85);
          padding: 20px 26px 18px;
          width: 100%; max-width: 400px;
          position: relative;
          animation: panelIn 0.5s 0.2s cubic-bezier(0.175,0.885,0.32,1.275) both;
        }
        .panel-corner { position: absolute; width: 8px; height: 8px; background: var(--neon-orange); }
        .panel-corner.tl { top: -1px; left: -1px; }
        .panel-corner.tr { top: -1px; right: -1px; }
        .panel-corner.bl { bottom: -1px; left: -1px; }
        .panel-corner.br { bottom: -1px; right: -1px; }

        .panel-title {
          font-family: 'Press Start 2P', monospace; font-size: 11px;
          color: var(--neon-orange); margin-bottom: 16px; text-align: center;
          text-shadow: 0 0 10px var(--neon-orange); letter-spacing: 1px;
        }

        /* Two-col layout for username + email */
        .fields-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }

        .field { margin-bottom: 11px; }
        .field-label {
          display: block; font-family: 'Press Start 2P', monospace;
          font-size: 7px; color: #ffbb88; margin-bottom: 5px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .field-input {
          width: 100%; background: rgba(0,10,30,0.82);
          border: 2px solid #553322; color: #ffe8d0;
          font-family: 'VT323', monospace; font-size: 18px;
          padding: 7px 10px; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input::placeholder { color: #553322; }
        .field-input:focus {
          border-color: var(--neon-orange);
          box-shadow: 0 0 0 2px rgba(255,107,26,0.2);
        }

        /* Strength meter */
        .strength-bar { display: flex; gap: 3px; margin-top: 4px; height: 3px; }
        .strength-seg { flex: 1; border: 1px solid #333; transition: background 0.2s; }
        .strength-label { font-family: 'VT323', monospace; font-size: 13px; margin-top: 2px; }

        /* Error / success */
        .error-box {
          background: rgba(255,45,120,0.15); border: 2px solid var(--neon-pink);
          color: var(--neon-pink); font-family: 'VT323', monospace;
          font-size: 16px; padding: 7px 11px; margin-bottom: 11px; text-align: center;
        }
        .success-box {
          background: rgba(57,255,20,0.1); border: 2px solid var(--neon-green);
          color: var(--neon-green); font-family: 'Press Start 2P', monospace;
          font-size: 9px; padding: 14px; text-align: center; line-height: 1.8;
          animation: successPulse 0.8s ease-in-out infinite alternate;
        }
        @keyframes successPulse {
          from { box-shadow: 0 0 10px rgba(57,255,20,0.2); }
          to   { box-shadow: 0 0 25px rgba(57,255,20,0.5); }
        }

        .shake { animation: shakeAnim 0.5s ease-in-out; }
        @keyframes shakeAnim {
          0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }   60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        .btn-primary {
          width: 100%; background: var(--neon-orange); color: #fff;
          border: 3px solid #000; font-family: 'Press Start 2P', monospace;
          font-size: 10px; padding: 13px; cursor: pointer;
          box-shadow: 4px 4px 0 #000; letter-spacing: 1px;
          transition: transform 0.08s, box-shadow 0.08s;
          text-transform: uppercase; margin-top: 4px;
        }
        .btn-primary:hover:not(:disabled) {
          background: #ff8c3a; transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000;
        }
        .btn-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-loading { display: inline-flex; align-items: center; gap: 8px; }
        .pixel-spinner {
          width: 12px; height: 12px; background: #fff;
          animation: pixelSpin 0.6s steps(4) infinite;
        }
        @keyframes pixelSpin {
          0%   { clip-path: polygon(0 0,50% 0,50% 50%,0 50%); }
          25%  { clip-path: polygon(50% 0,100% 0,100% 50%,50% 50%); }
          50%  { clip-path: polygon(50% 50%,100% 50%,100% 100%,50% 100%); }
          75%  { clip-path: polygon(0 50%,50% 50%,50% 100%,0 100%); }
          100% { clip-path: polygon(0 0,50% 0,50% 50%,0 50%); }
        }

        .divider { display: flex; align-items: center; gap: 10px; margin: 13px 0; }
        .divider-line {
          flex: 1; height: 2px;
          background: repeating-linear-gradient(90deg, #553322 0px, #553322 4px, transparent 4px, transparent 8px);
        }
        .divider-text { font-family: 'VT323', monospace; font-size: 14px; color: #775544; white-space: nowrap; }

        .login-link { text-align: center; }
        .login-link p { font-family: 'VT323', monospace; font-size: 16px; color: #997766; }
        .login-link a { color: var(--neon-orange); text-decoration: none; transition: text-shadow 0.2s; }
        .login-link a:hover { text-shadow: 0 0 10px var(--neon-orange); text-decoration: underline; }
      `}</style>

      {/* ── SCENE ── */}
      <div className="scene">
        <div className="stars">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="star" style={{
              width:  `${((i * 17) % 3) + 1}px`,
              height: `${((i * 17) % 3) + 1}px`,
              top:    `${(i * 37 + 13) % 55}%`,
              left:   `${(i * 61 + 7)  % 100}%`,
              animationDelay:    `${((i * 7)  % 30) / 10}s`,
              animationDuration: `${1.5 + ((i * 11) % 20) / 10}s`,
            }} />
          ))}
        </div>

        <div className="sun" />
        <div className="sunset-stripes">
          {[80, 65, 50, 38, 26].map((w, i) => (
            <div key={i} className="stripe" style={{
              width: `${w}px`,
              background: i % 2 === 0 ? '#ff2d78' : '#ff6b1a',
              opacity: 0.7 - i * 0.1,
            }} />
          ))}
        </div>

        <div className="mountain m1" /><div className="mountain m2" /><div className="mountain m3" />

        {/* Island 1 */}
        <div className="island" style={{ top: '13%', left: '3%', animationDelay: '0s' }}>
          <div className="island-grass" style={{ width: 80, height: 14, borderRadius: '3px 3px 0 0', position: 'relative' }}>
            <div className="pixel-tree" style={{ left: 8 }}>
              <div className="tree-top-2" /><div className="tree-top" /><div className="tree-trunk" />
            </div>
            <div className="pixel-tree" style={{ left: 46 }}>
              <div className="tree-top" style={{ width: 18 }} />
              <div className="tree-trunk" style={{ width: 6, height: 8 }} />
            </div>
          </div>
          <div className="island-earth" style={{ width: 80, height: 18, clipPath: 'polygon(0 0,100% 0,85% 100%,15% 100%)' }} />
        </div>
        {/* Island 2 */}
        <div className="island" style={{ top: '25%', left: '20%', animationDelay: '1.5s' }}>
          <div className="island-grass" style={{ width: 50, height: 11, borderRadius: '3px 3px 0 0', position: 'relative' }}>
            <div className="pixel-tree" style={{ left: 12 }}>
              <div className="tree-top" style={{ width: 18 }} />
              <div className="tree-trunk" style={{ height: 8 }} />
            </div>
          </div>
          <div className="island-earth" style={{ width: 50, height: 13, clipPath: 'polygon(0 0,100% 0,80% 100%,20% 100%)' }} />
        </div>

        <div className="crate" style={{ width: 18, height: 18, top: '20%', left: '28%', animationDelay: '0.4s' }} />
        <div className="crate" style={{ width: 14, height: 14, top: '15%', left: '42%', animationDelay: '0.9s' }} />
        <div className="coin"  style={{ width: 9,  height: 9,  top: '29%', left: '35%', animationDelay: '0s' }} />
        <div className="coin"  style={{ width: 7,  height: 7,  top: '18%', left: '47%', animationDelay: '0.7s' }} />

        <div className="ground" />

        {/* ══════════════════════════════════════════════════════
            FIGURES SCENE
            Panel ≈ 400px centred  →  roughly 33%–66% of viewport
            LEFT  figures stay at  5%–28%   (clear of panel)
            RIGHT figures stay at 72%–92%   (clear of panel)
        ══════════════════════════════════════════════════════ */}
        <div className="figures-scene">

          {/* ── BLUE – flag carrier, leading the chase to the left ── */}
          <div className="figure" style={{ left: '8%', animationDuration: '0.32s' }}>
            <div className="blue-head" />
            <div className="blue-torso">
              <div className="blue-arm-back" />
              <div className="blue-arm-flag">
                <div className="flag-pole">
                  <div className="flag-cloth" />
                </div>
              </div>
            </div>
            <div className="blue-legs">
              <div className="blue-leg-l"><div className="blue-foot-l" /></div>
              <div className="blue-leg-r"><div className="blue-foot-r" /></div>
            </div>
            <div className="dust-cloud">
              <div className="dust-puff" /><div className="dust-puff" /><div className="dust-puff" />
            </div>
            <div className="fig-shadow" />
          </div>

          {/* ── RED – chasing blue, hammer raised, right behind ── */}
          <div className="figure" style={{ left: '22%', animationDuration: '0.29s', animationDelay: '0.05s' }}>
            <div className="red-head" />
            <div className="red-torso">
              <div className="red-arm-back" />
              <div className="red-arm-hammer">
                <div className="hammer-head" />
              </div>
            </div>
            <div className="red-legs">
              <div className="red-leg-l" /><div className="red-leg-r" />
            </div>
            <div className="fig-shadow" />
          </div>

          {/* ── RIGHT SIDE: GREEN vs YELLOW — weapon clash ── */}

          {/* GREEN – sword, facing right toward yellow */}
          <div className="figure" style={{ left: '70%', animationDuration: '0.55s', animationDelay: '0.08s' }}>
            <div className="green-head" />
            <div className="green-torso">
              <div className="green-arm-back" />
              <div className="green-arm-sword">
                <div className="sword-guard" />
                <div className="sword-blade" />
              </div>
            </div>
            <div className="green-legs">
              <div className="green-leg-l" /><div className="green-leg-r" />
            </div>
            <div className="fig-shadow" />
          </div>

          {/* Explosion spark between green and yellow */}
          <div className="explosion-fx" style={{ bottom: 18, left: '80%' }}>💥</div>

          {/* YELLOW – pickaxe, facing left toward green */}
          <div className="figure" style={{ left: '86%', animationDuration: '0.58s', animationDelay: '0.15s' }}>
            <div className="yellow-head" />
            <div className="yellow-torso">
              <div className="yellow-arm-back" />
              <div className="yellow-arm-pick">
                <div className="pick-head">
                  <div className="pick-tip" />
                </div>
              </div>
            </div>
            <div className="yellow-legs">
              <div className="yellow-leg-l" /><div className="yellow-leg-r" />
            </div>
            <div className="fig-shadow" />
          </div>

        </div>{/* end figures-scene */}
      </div>{/* end scene */}

      <div className="scanlines" />
      <div className="vignette" />
      <div className="border-frame" />

      {/* ── MAIN CONTENT ── */}
      <main className="page">

        {/* Logo */}
        <div className="logo-wrapper">
          <span className="logo-title">FLAGZiLLA</span>
          <div className="logo-subtitle">⚔ a fun multiplayer game ⚔</div>
        </div>

        {/* Game info pills */}
        <div className="game-info">
          <div className="info-pill">
            <span className="info-pill-icon">👥</span>
            <span className="info-pill-text"><strong>4 Players</strong> · free-for-all</span>
          </div>
          <div className="info-pill">
            <span className="info-pill-icon">🚩</span>
            <span className="info-pill-text">Hold the flag the <strong>longest</strong></span>
          </div>
          <div className="info-pill">
            <span className="info-pill-icon">⚔️</span>
            <span className="info-pill-text">Flag <strong>or</strong> weapon — not both</span>
          </div>
          <div className="info-pill">
            <span className="info-pill-icon">⏱</span>
            <span className="info-pill-text"><strong>5 min</strong> matches</span>
          </div>
        </div>

        {/* Register panel */}
        <div className={`panel ${shake ? 'shake' : ''}`}>
          <div className="panel-corner tl" /><div className="panel-corner tr" />
          <div className="panel-corner bl" /><div className="panel-corner br" />

          <h2 className="panel-title">✦ CREATE ACCOUNT ✦</h2>

          {success ? (
            <div className="success-box">
              ✅ ACCOUNT CREATED!<br /><br />
              ENTERING THE GAME...<br />GET READY TO PLAY!
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <div className="error-box">⚠ {error}</div>}

              {/* Row 1: Username + Email */}
              <div className="fields-2col">
                <div>
                  <label className="field-label" htmlFor="username">🎮 Player Name</label>
                  <input className="field-input" id="username" type="text" name="username"
                    value={form.username} onChange={handleChange}
                    placeholder="Player123" required autoComplete="username" maxLength={20} />
                </div>
                <div>
                  <label className="field-label" htmlFor="email">📧 Email</label>
                  <input className="field-input" id="email" type="email" name="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@gg.com" required autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label" htmlFor="password">🔒 Password</label>
                <input className="field-input" id="password" type="password" name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" required autoComplete="new-password" />
                {form.password.length > 0 && (
                  <>
                    <div className="strength-bar">
                      <div className="strength-seg" style={{ background: passwordStrength === 'weak' ? '#ff2d78' : passwordStrength === 'medium' ? '#ffd700' : '#39ff14' }} />
                      <div className="strength-seg" style={{ background: passwordStrength === 'medium' ? '#ffd700' : passwordStrength === 'strong' ? '#39ff14' : '#333' }} />
                      <div className="strength-seg" style={{ background: passwordStrength === 'strong' ? '#39ff14' : '#333' }} />
                    </div>
                    <div className="strength-label" style={{ color: passwordStrength === 'weak' ? '#ff2d78' : passwordStrength === 'medium' ? '#ffd700' : '#39ff14' }}>
                      {passwordStrength === 'weak'   && '⚠ WEAK'}
                      {passwordStrength === 'medium' && '◆ MEDIUM'}
                      {passwordStrength === 'strong' && '✓ STRONG'}
                    </div>
                  </>
                )}
              </div>

              {/* Confirm password */}
              <div className="field">
                <label className="field-label" htmlFor="confirmPassword">🔒 Confirm Password</label>
                <input className="field-input" id="confirmPassword" type="password" name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" required autoComplete="new-password"
                  style={{
                    borderColor: form.confirmPassword.length > 0
                      ? (form.confirmPassword === form.password ? '#39ff14' : '#ff2d78')
                      : undefined,
                  }} />
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading
                  ? <span className="btn-loading"><span className="pixel-spinner" />CREATING...</span>
                  : '✦ JOIN THE GAME'}
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
                <p>Already a player? <Link href="/auth/login">Log in here →</Link></p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

