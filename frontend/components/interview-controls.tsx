"use client";

import { useEffect, useRef } from "react";
import AISpeakingBars from "./ai-speaking-bars";
import MicVisualizer from "./mic-visualizer";
import SegmentedToggle from "./segmented-toggle";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function InterviewControls({
  aiSpeaking,
  mode,
  listening,
  text,
  setMode,
  setListening,
  setText,
  handleSend,
}: {
  aiSpeaking: boolean;
  mode: "voice" | "text";
  listening: boolean;
  text: string;
  setMode: (mode: "voice" | "text") => void;
  setListening: (listening: boolean | ((prev: boolean) => boolean)) => void;
  setText: (text: string) => void;
  handleSend: (text: string) => void;
}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [setText, setListening]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    listening ? recognition.start() : recognition.stop();
  }, [listening]);

  useEffect(() => {
    if (!aiSpeaking) return;
    setListening(false);
  }, [aiSpeaking, setListening]);

  return (
    <div className="w-full p-2">
      {aiSpeaking ? (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-muted">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              AI is responding...
            </span>
          </div>
          <AISpeakingBars />
        </div>
      ) : (
        <div className="space-y-2">
          <SegmentedToggle
            value={mode}
            onChange={(v) => setMode(v as "voice" | "text")}
            options={[
              { label: "Voice", value: "voice" },
              { label: "Text", value: "text" },
            ]}
            className="w-full"
          />

          {/* Voice */}
          {mode === "voice" && (
            <div className="flex flex-col items-center gap-2">
              <MicVisualizer active={listening} />
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-muted-foreground"
              >
                {listening ? "Listening..." : "Tap mic to speak"}
              </motion.div>
              <div className="flex gap-2">
                <button
                  onClick={() => setListening((s) => !s)}
                  className="flex-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow hover:opacity-90"
                >
                  {listening ? "Stop" : "Start"} Mic
                </button>
                {text && (
                  <button
                    onClick={() => {
                      setListening(false);
                      handleSend(text.trim());
                      setText("");
                    }}
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
                  >
                    Send
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Text */}
          {mode === "text" && (
            <div className="flex gap-2">
              <Input
                placeholder="Type your answer..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && text.trim()) {
                    handleSend(text.trim());
                    setText("");
                  }
                }}
                className="flex-1 text-sm"
              />
              <button
                onClick={() => {
                  if (text.trim()) {
                    handleSend(text.trim());
                    setText("");
                  }
                }}
                className="rounded-md bg-primary px-2 py-1 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
