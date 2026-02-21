"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Track = "nav" | "tension" | "battle" | "off";

interface AudioContextValue {
  ready: boolean;
  currentTrack: Track;
  playTrack: (track: Track) => void;
  playClick: () => void;
  unlock: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AudioCtx = createContext<AudioContextValue>({
  ready: false,
  currentTrack: "off",
  playTrack: () => {},
  playClick: () => {},
  unlock: () => {},
});

// ─── Music definitions ────────────────────────────────────────────────────────
// All music is procedurally generated — no files needed.

// Note frequencies (Hz)
const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, Eb3: 155.56, F3: 174.61, G3: 196.00, Ab3: 207.65, Bb3: 233.08,
  C4: 261.63, D4: 293.66, Eb4: 311.13, F4: 349.23, G4: 392.00, Ab4: 415.30, Bb4: 466.16,
  C5: 523.25, D5: 587.33, Eb5: 622.25, F5: 698.46, G5: 783.99,
};

// ── NAV theme: slow mysterious arpeggio in C minor, ambient pad ───────────────
function buildNavMusic(ac: AudioContext, masterGain: GainNode) {
  const stopFns: (() => void)[] = [];

  // Ambient low pad
  const pad = ac.createOscillator();
  const padGain = ac.createGain();
  const padFilter = ac.createBiquadFilter();
  pad.type = "sine";
  pad.frequency.value = NOTE.C3;
  padFilter.type = "lowpass";
  padFilter.frequency.value = 400;
  padGain.gain.value = 0.08;
  pad.connect(padFilter).connect(padGain).connect(masterGain);
  pad.start();
  stopFns.push(() => { try { pad.stop(); } catch {} });

  // Second pad for warmth
  const pad2 = ac.createOscillator();
  const pad2Gain = ac.createGain();
  pad2.type = "sine";
  pad2.frequency.value = NOTE.G3;
  pad2Gain.gain.value = 0.05;
  pad2.connect(pad2Gain).connect(masterGain);
  pad2.start();
  stopFns.push(() => { try { pad2.stop(); } catch {} });

  // Slow arpeggio melody
  const arpNotes = [NOTE.C4, NOTE.Eb4, NOTE.G4, NOTE.Bb4, NOTE.C5, NOTE.Bb4, NOTE.G4, NOTE.Eb4];
  const arpInterval = 600; // ms per note
  let arpIndex = 0;
  let stopped = false;

  function playArpNote() {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc.type = "triangle";
    osc.frequency.value = arpNotes[arpIndex % arpNotes.length];
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
    osc.connect(filter).connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.5);
    arpIndex++;
  }

  const arpTimer = setInterval(() => playArpNote(), arpInterval);
  playArpNote();
  stopFns.push(() => { stopped = true; clearInterval(arpTimer); });

  // Slow bass pulse on beat
  const bassNotes = [NOTE.C3, NOTE.C3, NOTE.G3, NOTE.Bb3];
  let bassIndex = 0;
  const bassInterval = 1200;

  function playBassNote() {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = bassNotes[bassIndex % bassNotes.length];
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.0);
    osc.connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 1.1);
    bassIndex++;
  }

  const bassTimer = setInterval(() => playBassNote(), bassInterval);
  playBassNote();
  stopFns.push(() => clearInterval(bassTimer));

  return () => stopFns.forEach(fn => fn());
}

// ── TENSION theme: building countdown feel ────────────────────────────────────
function buildTensionMusic(ac: AudioContext, masterGain: GainNode) {
  const stopFns: (() => void)[] = [];
  let stopped = false;

  // Drone
  const drone = ac.createOscillator();
  const droneGain = ac.createGain();
  drone.type = "sawtooth";
  drone.frequency.value = NOTE.C3;
  droneGain.gain.value = 0.04;
  const droneFilter = ac.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 300;
  drone.connect(droneFilter).connect(droneGain).connect(masterGain);
  drone.start();
  stopFns.push(() => { try { drone.stop(); } catch {} });

  // Rising pulse hits
  const pulseNotes = [NOTE.C4, NOTE.Eb4, NOTE.C4, NOTE.G4, NOTE.C4, NOTE.Eb4, NOTE.Ab4, NOTE.C5];
  let pulseIdx = 0;
  const pulseInterval = 400;

  function playPulse() {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.value = pulseNotes[pulseIdx % pulseNotes.length];
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.09, ac.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    osc.connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.35);
    pulseIdx++;
  }

  const pulseTimer = setInterval(playPulse, pulseInterval);
  playPulse();
  stopFns.push(() => { stopped = true; clearInterval(pulseTimer); });

  // Tension stabs
  const stabTimer = setInterval(() => {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = NOTE.C3 * (Math.random() > 0.5 ? 1 : 1.5);
    gain.gain.setValueAtTime(0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
    osc.connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.2);
  }, 800);
  stopFns.push(() => clearInterval(stabTimer));

  return () => stopFns.forEach(fn => fn());
}

// ── BATTLE theme: fast driving, energetic ─────────────────────────────────────
function buildBattleMusic(ac: AudioContext, masterGain: GainNode) {
  const stopFns: (() => void)[] = [];
  let stopped = false;
  const BPM = 140;
  const beat = (60 / BPM) * 1000; // ms per beat

  // Kick drum
  function playKick() {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    gain.gain.setValueAtTime(0.5, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    osc.connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.35);
  }

  // Snare drum
  function playSnare() {
    if (stopped) return;
    const noise = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    noise.type = "sawtooth";
    noise.frequency.value = 100 + Math.random() * 200;
    filter.type = "highpass";
    filter.frequency.value = 1000;
    gain.gain.setValueAtTime(0.2, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    noise.connect(filter).connect(gain).connect(masterGain);
    noise.start(ac.currentTime);
    noise.stop(ac.currentTime + 0.15);
  }

  // Hi-hat
  function playHihat(open = false) {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc.type = "square";
    osc.frequency.value = 8000 + Math.random() * 4000;
    filter.type = "highpass";
    filter.frequency.value = 7000;
    gain.gain.setValueAtTime(0.07, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (open ? 0.2 : 0.05));
    osc.connect(filter).connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + (open ? 0.25 : 0.08));
  }

  // Drum pattern: kick on 1&3, snare on 2&4, hihats every 8th
  let beatCount = 0;
  const drumTimer = setInterval(() => {
    if (stopped) return;
    const b = beatCount % 4;
    if (b === 0 || b === 2) playKick();
    if (b === 1 || b === 3) playSnare();
    playHihat(b === 3);
    // extra hihat on offbeat
    setTimeout(() => { if (!stopped) playHihat(); }, beat / 2);
    beatCount++;
  }, beat);
  stopFns.push(() => { stopped = true; clearInterval(drumTimer); });

  // Bass line - C minor pentatonic riff
  const bassLine = [
    NOTE.C3, NOTE.C3, NOTE.Eb3, NOTE.C3,
    NOTE.G3, NOTE.G3, NOTE.Bb3, NOTE.Ab3,
  ];
  let bassIdx = 0;
  const bassTimer = setInterval(() => {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc.type = "sawtooth";
    osc.frequency.value = bassLine[bassIdx % bassLine.length];
    filter.type = "lowpass";
    filter.frequency.value = 500;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, ac.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (beat / 1000) * 0.85);
    osc.connect(filter).connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + (beat / 1000));
    bassIdx++;
  }, beat);
  stopFns.push(() => clearInterval(bassTimer));

  // Lead melody riff
  const lead = [
    NOTE.C5, NOTE.Eb5, NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4,
    NOTE.C5, NOTE.G4, NOTE.Bb4, NOTE.Ab4, NOTE.G4, NOTE.F4, NOTE.Eb4, NOTE.C4,
  ];
  let leadIdx = 0;
  const leadTimer = setInterval(() => {
    if (stopped) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc.type = "square";
    osc.frequency.value = lead[leadIdx % lead.length];
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ac.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (beat / 1000) * 0.7);
    osc.connect(filter).connect(gain).connect(masterGain);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + (beat / 1000) * 0.75);
    leadIdx++;
  }, beat / 2); // lead plays at double speed (8th notes)
  stopFns.push(() => clearInterval(leadTimer));

  return () => stopFns.forEach(fn => fn());
}

// ─── Click sound ──────────────────────────────────────────────────────────────
function playClickSound(ac: AudioContext) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(800, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.05);
  gain.gain.setValueAtTime(0.15, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.07);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const acRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const stopCurrentRef = useRef<(() => void) | null>(null);
  const fadeGainRef = useRef<GainNode | null>(null);
  const [ready, setReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>("off");

  const unlock = useCallback(() => {
    if (acRef.current) return;
    const ac = new AudioContext();
    const master = ac.createGain();
    const fadeGain = ac.createGain();
    master.gain.value = 0.7;
    fadeGain.gain.value = 1;
    master.connect(fadeGain);
    fadeGain.connect(ac.destination);
    acRef.current = ac;
    masterRef.current = master;
    fadeGainRef.current = fadeGain;
    setReady(true);
  }, []);

  const playClick = useCallback(() => {
    if (!acRef.current) return;
    playClickSound(acRef.current);
  }, []);

  const playTrack = useCallback((track: Track) => {
    if (!acRef.current || !masterRef.current || !fadeGainRef.current) return;
    if (track === currentTrack) return;

    const ac = acRef.current;
    const fadeGain = fadeGainRef.current;

    // Fade out current
    fadeGain.gain.cancelScheduledValues(ac.currentTime);
    fadeGain.gain.setValueAtTime(fadeGain.gain.value, ac.currentTime);
    fadeGain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.5);

    setTimeout(() => {
      // Stop previous
      if (stopCurrentRef.current) {
        stopCurrentRef.current();
        stopCurrentRef.current = null;
      }

      if (track === "off") {
        setCurrentTrack("off");
        return;
      }

      // Start new track
      const master = masterRef.current!;
      let stop: () => void;
      if (track === "nav")     stop = buildNavMusic(ac, master);
      else if (track === "tension") stop = buildTensionMusic(ac, master);
      else                     stop = buildBattleMusic(ac, master);

      stopCurrentRef.current = stop;
      setCurrentTrack(track);

      // Fade in
      fadeGain.gain.cancelScheduledValues(ac.currentTime);
      fadeGain.gain.setValueAtTime(0, ac.currentTime);
      fadeGain.gain.linearRampToValueAtTime(1, ac.currentTime + 0.5);
    }, 520);
  }, [currentTrack]);

  // Global click sound on mousedown
  useEffect(() => {
    const handler = () => playClick();
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [playClick]);

  return (
    <AudioCtx.Provider value={{ ready, currentTrack, playTrack, playClick, unlock }}>
      {children}
    </AudioCtx.Provider>
  );
}

// ─── Hook: tell audio system which track this page needs ──────────────────────
export function useMusic(track: Track) {
  const { playTrack, unlock, ready } = useContext(AudioCtx);

  // Unlock on first interaction with the page
  useEffect(() => {
    const handler = () => {
      unlock();
    };
    window.addEventListener("click", handler, { once: true });
    return () => window.removeEventListener("click", handler);
  }, [unlock]);

  // Switch track once audio is ready
  useEffect(() => {
    if (ready) playTrack(track);
  }, [ready, track, playTrack]);
}

export function useAudio() {
  return useContext(AudioCtx);
}