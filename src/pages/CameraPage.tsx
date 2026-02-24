import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import { useWellbeing } from "@/context/WellbeingContext";

const emotions = ["Happy 😊", "Calm 😌", "Neutral 😐", "Tired 😴", "Sad 😢", "Stressed 😰"];
const emotionColors: Record<string, string> = {
  "Happy 😊": "text-success",
  "Calm 😌": "text-accent",
  "Neutral 😐": "text-muted-foreground",
  "Tired 😴": "text-warning",
  "Sad 😢": "text-info",
  "Stressed 😰": "text-destructive",
};

const CameraPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { addEntry } = useWellbeing();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
    setEmotion(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const detectEmotion = () => {
    setAnalyzing(true);
    // Simulated emotion detection (in production, would use TensorFlow.js face-api)
    setTimeout(() => {
      const detected = emotions[Math.floor(Math.random() * emotions.length)];
      setEmotion(detected);
      setAnalyzing(false);
      addEntry({ cameraEmotion: detected });
    }, 1500);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Mood Camera</h1>
        <p className="mt-2 text-muted-foreground">Use your webcam for real-time facial emotion detection.</p>

        <div className="mt-8">
          <div className="relative overflow-hidden rounded-xl bg-primary/5 aspect-video flex items-center justify-center border border-border">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${streaming ? "block" : "hidden"}`}
              style={{ transform: "scaleX(-1)" }}
            />
            {!streaming && (
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">Camera is off</p>
              </div>
            )}
            {emotion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 left-4 right-4 rounded-lg glass p-4 text-center"
              >
                <p className="text-sm text-muted-foreground">Detected Emotion</p>
                <p className={`text-2xl font-display font-bold ${emotionColors[emotion] || "text-foreground"}`}>
                  {emotion}
                </p>
              </motion.div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            {!streaming ? (
              <button
                onClick={startCamera}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg gradient-accent px-4 py-3 font-medium text-accent-foreground shadow-glow"
              >
                <Camera className="h-4 w-4" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={detectEmotion}
                  disabled={analyzing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg gradient-accent px-4 py-3 font-medium text-accent-foreground shadow-glow disabled:opacity-50"
                >
                  {analyzing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {analyzing ? "Analyzing..." : "Detect Emotion"}
                </button>
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 font-medium text-foreground hover:bg-muted"
                >
                  <CameraOff className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Privacy:</strong> All processing happens in your browser. No video data is stored or transmitted. This is a demo simulation — production versions would use TensorFlow.js face-api for real detection.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CameraPage;
