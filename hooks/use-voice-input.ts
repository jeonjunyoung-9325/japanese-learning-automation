"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionInstance = {
  lang: string;
  continuous?: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = {
  resultIndex?: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function useVoiceInput(onTranscript: (value: string) => void) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");
  const shouldKeepListeningRef = useRef(false);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }

    const instance = new Recognition();
    instance.lang = "ja-JP";
    instance.continuous = true;
    instance.interimResults = false;
    instance.maxAlternatives = 1;
    instance.onresult = (event) => {
      const startIndex = event.resultIndex ?? 0;
      let combinedTranscript = transcriptRef.current;

      for (let index = startIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript?.trim() ?? "";
        if (!transcript) {
          continue;
        }

        combinedTranscript = `${combinedTranscript} ${transcript}`.trim();
      }

      transcriptRef.current = combinedTranscript;
      onTranscript(combinedTranscript);
    };
    instance.onerror = () => setListening(false);
    instance.onend = () => {
      if (shouldKeepListeningRef.current) {
        recognitionRef.current?.start();
        return;
      }

      setListening(false);
    };
    recognitionRef.current = instance;
    setSupported(true);
  }, [onTranscript]);

  function start() {
    transcriptRef.current = "";
    shouldKeepListeningRef.current = true;
    recognitionRef.current?.start();
    setListening(true);
  }

  function stop() {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { supported, listening, start, stop };
}
