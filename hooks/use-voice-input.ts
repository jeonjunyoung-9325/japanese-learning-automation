"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const onTranscriptRef = useRef(onTranscript);
  const shouldKeepListeningRef = useRef(false);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

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
      onTranscriptRef.current(combinedTranscript);
    };
    instance.onerror = () => {
      shouldKeepListeningRef.current = false;
      setListening(false);
    };
    instance.onend = () => {
      if (shouldKeepListeningRef.current) {
        try {
          recognitionRef.current?.start();
        } catch {
          shouldKeepListeningRef.current = false;
          setListening(false);
        }
        return;
      }

      setListening(false);
    };
    recognitionRef.current = instance;
    setSupported(true);

    return () => {
      shouldKeepListeningRef.current = false;
      try {
        instance.stop();
      } catch {
        // Ignore cleanup errors from already-stopped recognition instances.
      }
      instance.onresult = null;
      instance.onerror = null;
      instance.onend = null;
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) {
      return;
    }

    transcriptRef.current = "";
    shouldKeepListeningRef.current = true;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      shouldKeepListeningRef.current = false;
      setListening(false);
    }
  }, [listening]);

  const stop = useCallback(() => {
    shouldKeepListeningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors if recognition already ended.
    }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    transcriptRef.current = "";
  }, [stop]);

  return { supported, listening, start, stop, reset };
}
