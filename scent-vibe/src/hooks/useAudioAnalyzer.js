import { useEffect, useRef, useState } from 'react';

export default function useAudioAnalyzer({ fftSize = 128 } = {}) {
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const [audioData, setAudioData] = useState(new Uint8Array(fftSize / 2));
  const [bassEnergy, setBassEnergy] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
        streamRef.current = stream;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = fftSize;
        analyserRef.current.smoothingTimeConstant = 0.85;
        sourceRef.current.connect(analyserRef.current);
        setIsActive(true);
      } catch (err) {
        // fallback: oscillator so analyser has data
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        const osc = audioCtxRef.current.createOscillator();
        osc.frequency.value = 110; // low tone
        osc.start();
        sourceRef.current = osc;
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = fftSize;
        analyserRef.current.smoothingTimeConstant = 0.85;
        osc.connect(analyserRef.current);
        setIsActive(false);
      }

      const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);

      const tick = () => {
        if (!mounted) return;
        analyserRef.current.getByteFrequencyData(buffer);
        setAudioData(new Uint8Array(buffer));
        // bass: average of first 8 bins
        const bass = buffer.slice(0, 8).reduce((s, v) => s + v, 0) / (8 * 255);
        setBassEnergy(bass);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    init();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (sourceRef.current?.stop) try { sourceRef.current.stop(); } catch (e) {}
      if (audioCtxRef.current) try { audioCtxRef.current.close(); } catch (e) {}
    };
  }, [fftSize]);

  return { audioData, bassEnergy, isActive, audioCtx: audioCtxRef.current };
}
