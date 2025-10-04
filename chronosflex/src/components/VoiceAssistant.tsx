"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useImpactStore } from "@/lib/store/impactStore";

interface BasicSpeechRecognitionEvent {
  results: ArrayLike<{ 0: { transcript: string } }>;
}

interface BasicSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: BasicSpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => BasicSpeechRecognition;

export function VoiceAssistant() {
  const { setInputs, runSimulation } = useImpactStore();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<BasicSpeechRecognition | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    speechSynthesis.speak(utter);
  }, []);

  const tryParseCommand = useCallback((text: string) => {
    const patterns: Array<[RegExp, (n: number) => void]> = [
      [/speed\s*(to)?\s*(\d+(?:\.\d+)?)/, (n) => setInputs({ impactSpeedKmPerS: n })],
      [/angle\s*(to)?\s*(\d+(?:\.\d+)?)/, (n) => setInputs({ impactAngleDeg: n })],
      [/diameter\s*(to)?\s*(\d+(?:\.\d+)?)/, (n) => setInputs({ asteroidDiameterMeters: n })],
      [/density\s*(to)?\s*(\d+(?:\.\d+)?)/, (n) => setInputs({ asteroidDensityKgPerM3: n })],
      [/fragment(ation)?\s*(to)?\s*(\d+(?:\.\d+)?)/, (n) => setInputs({ fragmentationFactor: Math.min(1, Math.max(0, n)) })],
    ];
    for (const [re, fn] of patterns) {
      const m = text.match(re);
      if (m) {
        const v = Number(m[m.length - 1]);
        if (Number.isFinite(v)) {
          fn(v);
          speak("Updated.");
          return;
        }
      }
    }
    if (/simulate|run/.test(text)) {
      runSimulation();
      speak("Simulation running.");
      return;
    }
    speak("Sorry, I did not understand.");
  }, [runSimulation, setInputs, speak]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor; SpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: BasicSpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      tryParseCommand(transcript);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [tryParseCommand]);

  function toggle() {
    const rec = recognitionRef.current;
    if (!rec) {
      speak("Voice recognition not supported in this browser.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      rec.start();
      setListening(true);
    }
  }

  return (
    <button onClick={toggle} className={`px-3 py-2 rounded border ${listening ? "bg-green-600 text-white" : ""}`}>
      {listening ? "Listening…" : "Voice Assistant"}
    </button>
  );
}
