import { useState, useCallback, useRef, useEffect } from 'react';

export type DetectionStatus = 'idle' | 'detecting' | 'detected' | 'error';

interface UseSignDetectionReturn {
  currentLetter: string | null;
  status: DetectionStatus;
  statusMessage: string;
  simulateDetection: (letter: string) => void;
  clearDetection: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  remainingTime: number;
  stablePrediction: string;
  stableCount: number;
  isConnected: boolean;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
}

const WS_URL = 'ws://localhost:8000/ws/detect';
const FRAME_INTERVAL = 200; // Send frame every 200ms

/**
 * Hook for real-time sign language detection using WebSocket
 */
export const useSignDetection = (): UseSignDetectionReturn => {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [stablePrediction, setStablePrediction] = useState<string>('nothing');
  const [stableCount, setStableCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getStatusMessage = (status: DetectionStatus, letter: string | null): string => {
    switch (status) {
      case 'idle':
        return 'Show me a sign! 👋';
      case 'detecting':
        return 'Looking for your sign... 👀';
      case 'detected':
        return letter ? `Great job! You signed "${letter}" 🎉` : 'Keep going!';
      case 'error':
        return 'Oops! Try again 💪';
      default:
        return '';
    }
  };

  // Initialize canvas for frame capture
  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    canvasRef.current.width = 640;
    canvasRef.current.height = 480;
  }, []);

  // Capture and send frame to backend
  const captureAndSendFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Send to backend
    try {
      wsRef.current.send(JSON.stringify({
        type: 'frame',
        data: imageData
      }));
    } catch (error) {
      console.error('Error sending frame:', error);
    }
  }, []);

  // Start webcam and WebSocket connection
  const startDetection = useCallback(async () => {
    try {
      // Get webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Connect to WebSocket
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Connected to detection server');
        setIsConnected(true);
        setStatus('detecting');

        // Start sending frames
        frameIntervalRef.current = setInterval(captureAndSendFrame, FRAME_INTERVAL);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'prediction') {
          setStablePrediction(data.stable_prediction);
          setStableCount(data.stable_count);
          setRemainingTime(data.remaining_time);

          // If letter is accepted
          if (data.should_accept && data.accepted_letter) {
            setCurrentLetter(data.accepted_letter);
            setStatus('detected');

            // Clear after a moment
            setTimeout(() => {
              setStatus('detecting');
            }, 500);
          }
          
          // Handle delete
          if (data.should_delete) {
            setCurrentLetter('DEL');
            setStatus('detected');
            
            setTimeout(() => {
              setStatus('detecting');
            }, 500);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('❌ Disconnected from detection server');
        setIsConnected(false);
        setStatus('idle');
      };

    } catch (error) {
      console.error('Error starting detection:', error);
      setStatus('error');
    }
  }, [captureAndSendFrame]);

  // Stop detection and cleanup
  const stopDetection = useCallback(() => {
    // Stop frame capture
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop webcam
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsConnected(false);
    setStatus('idle');
    setCurrentLetter(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // Mock detection for testing (when backend is not available)
  const simulateDetection = useCallback((letter: string) => {
    setStatus('detecting');
    
    setTimeout(() => {
      setCurrentLetter(letter.toUpperCase());
      setStatus('detected');
    }, 300);
  }, []);

  const clearDetection = useCallback(() => {
    setCurrentLetter(null);
    setStatus(isConnected ? 'detecting' : 'idle');
  }, [isConnected]);

  return {
    currentLetter,
    status,
    statusMessage: getStatusMessage(status, currentLetter),
    simulateDetection,
    clearDetection,
    videoRef,
    remainingTime,
    stablePrediction,
    stableCount,
    isConnected,
    startDetection,
    stopDetection,
  };
};
