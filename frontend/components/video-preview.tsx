"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import MetricsPanel from "@/components/MetricsPanel";

interface EmotionData {
  timestamp: number;
  confidence: number;
  happy: number;
  sad: number;
  nervous: number;
  surprised: number;
  blink: number;
}

export default function EmotionAnalyzerPage({ startFn, stopFn }: any) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(true);

  const [blinkRate, setBlinkRate] = useState(0);
  const [nervousness, setNervousness] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [surprised, setSurprised] = useState(0);
  const [happy, setHappy] = useState(0);
  const [sad, setSad] = useState(0);

  const blinkTimestampsRef = useRef<number[]>([]);
  const earHistoryRef = useRef<number[]>([]);
  const lastEmotionRef = useRef({
    happy: 0,
    sad: 0,
    nervous: 0,
    surprised: 0,
    confidence: 0,
    mar: 0,
    ear: 0,
    blink: 0,
    nose: 0,
  });

  // **Session recording**
  const sessionDataRef = useRef<EmotionData[]>([]);

  const euclid = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  const smooth = (prev: number, current: number, alpha = 0.3) =>
    prev * (1 - alpha) + current * alpha;

  const eyeAspectRatio = (lm: any, idxs: number[]) => {
    const [p0, p1, p2, p3, p4, p5] = idxs.map((i) => lm[i]);
    const A = euclid(p1, p5);
    const B = euclid(p2, p4);
    const C = euclid(p0, p3);
    return C === 0 ? 0 : (A + B) / (2 * C);
  };

  const mouthAspectRatio = (lm: any) => {
    const vertical = euclid(lm[13], lm[14]);
    const horizontal = euclid(lm[61], lm[291]);
    return horizontal === 0 ? 0 : vertical / horizontal;
  };

  const smileScore = (lm: any) => {
    const mouthWidth = euclid(lm[61], lm[291]);
    const mouthHeight = euclid(lm[13], lm[14]);
    const faceWidth = euclid(lm[234], lm[454]);
    if (!faceWidth) return 0;
    const ratio = (mouthWidth / faceWidth) * (mouthHeight / faceWidth) * 12;
    return Math.min(Math.max(ratio, 0), 1);
  };

  const headPose = (lm: any) => {
    const nose = lm[1];
    const centerX = (lm[234].x + lm[454].x) / 2;
    const centerY = (lm[152].y + lm[10].y) / 2;
    return { yaw: nose.x - centerX, pitch: nose.y - centerY };
  };

  // ------------------- On Results -------------------
  const onResults = (results: any) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d")!;
    const videoWidth = canvas.clientWidth;
    const videoHeight = canvas.clientHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) return;

    const lm = results.multiFaceLandmarks[0];
    // Draw face mesh overlays
    // @ts-ignore
    drawConnectors(ctx, lm, FACEMESH_TESSELATION, {
      color: "#C0C0C080",
      lineWidth: 1,
    });
    // @ts-ignore
    drawConnectors(ctx, lm, FACEMESH_LEFT_EYE, { color: "#30FF30" });
    // @ts-ignore
    drawConnectors(ctx, lm, FACEMESH_RIGHT_EYE, { color: "#FF3030" });
    // @ts-ignore
    drawConnectors(ctx, lm, FACEMESH_LIPS, { color: "#E0E0E0" });

    // Blink detection
    const leftEAR = eyeAspectRatio(lm, [33, 160, 158, 133, 153, 144]);
    const rightEAR = eyeAspectRatio(lm, [263, 387, 385, 362, 380, 373]);
    const ear = (leftEAR + rightEAR) / 2;
    earHistoryRef.current.push(ear);
    if (earHistoryRef.current.length > 300) earHistoryRef.current.shift();

    const prevEar =
      earHistoryRef.current[earHistoryRef.current.length - 2] || ear;
    if (prevEar > 0.2 && ear <= 0.2)
      blinkTimestampsRef.current.push(Date.now());
    const oneMinuteAgo = Date.now() - 60000;
    blinkTimestampsRef.current = blinkTimestampsRef.current.filter(
      (t) => t > oneMinuteAgo
    );
    const br = blinkTimestampsRef.current.length;
    setBlinkRate(blinkTimestampsRef.current.length);

    // Features
    const mar = mouthAspectRatio(lm);
    const smile = smileScore(lm);
    const pose = headPose(lm);

    const blinkFeature = Math.min(blinkTimestampsRef.current.length / 30, 1);
    const marFeature = Math.min(mar / 0.45, 1);
    const gazeAversion = Math.min(Math.abs(pose.yaw) / 0.15, 1);
    const headDown = Math.min(Math.max(pose.pitch / 0.15, -1), 1);

    // Surprise
    const earMean =
      earHistoryRef.current.reduce((a, b) => a + b, 0) /
      earHistoryRef.current.length;
    const earStd =
      Math.sqrt(
        earHistoryRef.current.reduce((s, x) => s + (x - earMean) ** 2, 0) /
          earHistoryRef.current.length
      ) || 0.0001;
    const eyeWideFeature = Math.min(
      Math.max((ear - earMean) / (2 * earStd), 0),
      1
    );
    const browDist = euclid(lm[105], lm[159]);
    const faceHeight = euclid(lm[10], lm[152]) || 1;
    const browFeature = Math.min(
      Math.max((browDist / faceHeight - 0.03) / 0.06, 0),
      1
    );
    const deltaMar = Math.min(
      Math.max((mar - (lastEmotionRef.current.mar || mar)) * 10, 0),
      1
    );
    const deltaEar = Math.min(
      Math.max((ear - (lastEmotionRef.current.ear || ear)) * 10, 0),
      1
    );

    let rawSurprise =
      0.4 * marFeature +
      0.3 * eyeWideFeature +
      0.2 * browFeature +
      0.1 * Math.max(deltaMar, deltaEar);
    rawSurprise *= 1 - smile;
    const finalSurprise = smooth(lastEmotionRef.current.surprised, rawSurprise);
    setSurprised(Number(finalSurprise.toFixed(2)));

    // Happiness
    const gazeFactor = 1 - gazeAversion;
    const happyRaw = smooth(
      lastEmotionRef.current.happy,
      Math.min(
        Math.max(0.6 * smile + 0.3 * browFeature + 0.1 * (1 - marFeature), 0),
        1
      ) * gazeFactor
    );
    setHappy(Number(happyRaw.toFixed(2)));

    // Sadness
    const mouthDown = (lm[61].y + lm[291].y) / 2 - lm[0].y;
    const originalSad =
      Math.min(
        Math.max(
          0.4 * headDown +
            0.3 * Math.max(-mouthDown / faceHeight, 0) +
            0.2 * (1 - browFeature) +
            0.1 * marFeature,
          0
        ),
        1
      ) * gazeFactor;
    const sadRaw = smooth(
      lastEmotionRef.current.sad,
      0.5 * (1 - happyRaw) + 0.5 * originalSad
    );
    setSad(Number(sadRaw.toFixed(2)));

    // Nervous
    const nervousRaw = smooth(
      lastEmotionRef.current.nervous,
      Math.min(
        1,
        0.5 * blinkFeature +
          0.3 * gazeAversion +
          0.2 * marFeature +
          0.2 * (1 - happyRaw) // Increase nervousness if happy is low
        //   0.2 * (1 - finalConf)       // Increase nervousness if confidence is low
      )
    );
    setNervousness(Number(nervousRaw.toFixed(2)));

    // Confidence
    const gazeFeature = 1 - gazeAversion;
    const nose = lm[1];
    const lastNose = lastEmotionRef.current.nose || nose;

    const headJitter =
      Math.hypot(nose.x - lastNose.x, nose.y - lastNose.y) * 50;
    lastEmotionRef.current.nose = nose;

    const jitterFeature = Math.min(1, headJitter);
    const stabilityFeature = 1 - jitterFeature;

    //const stabilityFeature = Math.min(1, 0.5 / (earStd + 0.0001));
    const lastMar = lastEmotionRef.current.mar || mar;
    const speakingJitter = Math.min(1, Math.abs(mar - lastMar) * 4);
    const speakingPenalty = (marFeature + speakingJitter) / 2;
    const surprisePenalty = finalSurprise * (1 - smile);
    const eyeSmile = (browFeature + eyeWideFeature) / 2;
    const fakeSmilePenalty = Math.max(smile - eyeSmile, 0);

    const gazeStability =
      Math.min(1, 1 - Math.abs(pose.yaw) * 2) *
      Math.min(1, 1 - Math.abs(pose.pitch) * 2);

    const pos =
      0.35 * smile +
      0.25 * gazeFeature +
      0.2 * gazeStability + // NEW
      0.15 * (1 - headDown) +
      0.25 * stabilityFeature;
    const nervousPenalty = Math.pow(nervousRaw, 1.3); // nonlinear: spikes matter more

    const keyPoints = [1, 33, 133, 362, 263, 61, 291]; // nose, eyes, mouth points
    let visibleCount = 0;

    keyPoints.forEach((i) => {
      const p = lm[i];
      if (p.x > 0 && p.x < 1 && p.y > 0 && p.y < 1) visibleCount++;
    });

    const visibilityScore = visibleCount / keyPoints.length;
    const hidingPenalty = 1 - visibilityScore;

    const neg =
      0.6 * nervousRaw +
      0.25 * speakingPenalty +
      0.15 * surprisePenalty +
      0.4 * hidingPenalty + // NEW: big impact if hiding
      0.4 * gazeAversion; // NEW: turning face away hurts confidence
    const rawConf = Math.max(-1, Math.min(1, pos - neg));
    const logistic = 1 / (1 + Math.exp(-3 * rawConf));
    let finalConf = smooth(lastEmotionRef.current.confidence, logistic, 0.2);
    if (visibilityScore < 0.4) {
      finalConf *= visibilityScore; // force drop
    }

    setConfidence(Number(finalConf.toFixed(2)));
    if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) {
      setConfidence((prev) => Math.max(prev * 0.5, 0.1)); // drop confidence fast
      return;
    }

    lastEmotionRef.current = {
      happy: happyRaw,
      sad: sadRaw,
      nervous: nervousRaw,
      surprised: finalSurprise,
      confidence: finalConf,
      mar,
      ear,
      blink: br,
      nose,
    };

    // ------------------- Record session -------------------
    sessionDataRef.current.push({
      timestamp: Date.now(),
      confidence: finalConf,
      happy: happyRaw,
      sad: sadRaw,
      nervous: nervousRaw,
      surprised: finalSurprise,
      blink: br,
    });

    // Draw overlays
    const confPercent = Math.round(finalConf * 100);
    ctx.fillStyle = "white";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(`EAR: ${ear.toFixed(3)}`, 8, 18); // EAR – Effective Address Register ->  CPU first calculates the effective address using addressing modes → then stores it in EAR.Once EAR has the final address, it can be moved to MAR to actually fetch the data.
    ctx.fillText(`MAR: ${mar.toFixed(3)}`, 8, 34); // MAR – Memory Address Register -> It holds the address in memory where the CPU either wants to read data from or write data to.
    ctx.fillText(`Smile: ${Number(smile * 100).toFixed(0)}`, 8, 50);
    ctx.fillText(`Blinks/min: ${br}`, 8, 66);
    ctx.fillText(`Yaw: ${pose.yaw.toFixed(3)}`, 8, 82); // Left/Right (rotate around vertical axis).
    ctx.fillText(`Pitch: ${pose.pitch.toFixed(3)}`, 8, 98); // Up/Down (rotate around side axis).
    ctx.fillText(`Confidence: ${confPercent}%`, 8, 114); // place under your other overlays
  };

  // ------------------- Feedback Generation -------------------
  const generateFeedback = () => {
    const data = sessionDataRef.current;
    if (!data.length) return "No session data recorded.";

    const avg = (key: keyof EmotionData) =>
      data.reduce((sum, d) => sum + d[key], 0) / data.length;
    const feedback: string[] = [];

    const conf = avg("confidence");
    const nerv = avg("nervous");
    const happ = avg("happy");
    const sadScore = avg("sad");
    const smileScore = avg("surprised"); // can also track smile separately
    const blink = avg("blink"); // can also track blink separately

    /* feedback.push(`Confidence: ${(conf * 100).toFixed(1)}%`);
    feedback.push(`Nervousness: ${(nerv * 100).toFixed(1)}%`);
    feedback.push(`Happiness: ${(happ * 100).toFixed(1)}%`);
    feedback.push(`Sadness: ${(sadScore * 100).toFixed(1)}%`);
    feedback.push(`Smile/Surprise: ${(smileScore * 100).toFixed(1)}%`);
    feedback.push(`Blink Rate: ${blink.toFixed(1)} blinks/min`); */

    feedback.push(
      conf < 0.8
        ? "Try to maintain eye contact and speak confidently, need to improve confidence."
        : "Good job maintaining confidence."
    );
    feedback.push(
      nerv > 0.2
        ? "Try to relax and avoid fidgeting, it may indicate nervousness. Take deep breaths, need to decrease nervousness."
        : "Good job staying calm, no nervousness."
    );
    feedback.push(
      happ < 0.45
        ? "Smile more naturally to appear approachable, need to smile and be happy."
        : "Good job being friendly."
    );
    feedback.push(
      sadScore > 0.3
        ? "Avoid showing too much sadness; stay positive."
        : "Good job staying positive."
    );
    feedback.push(
      blink < 5
        ? "Remember to blink naturally to avoid staring."
        : "Good job blinking normally."
    );
    feedback.push(
      blink > 20
        ? "Try to reduce excessive blinking, it may indicate nervousness."
        : ""
    );
    return feedback.join("\n");
  };

  const stop = () => {
    try {
      cameraRef.current?.stop();
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
    setRunning(false);

    // Show feedback
    const feedback = generateFeedback();
 //    alert(`Session Feedback:\n\n${feedback}`);
    // Optionally, console.log for dev

    return feedback;
  };

  // ------------------- UI & Scripts -------------------
  const start = async () => {
    if (running) return;
    if (!loaded) return alert("MediaPipe not loaded yet.");
    const video = videoRef.current!;
    if (!faceMeshRef.current) {
      faceMeshRef.current = new (window as any).FaceMesh({
        locateFile: (f: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
      });
      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      faceMeshRef.current.onResults(onResults);
    }

    if (!cameraRef.current) {
      const Camera = (window as any).Camera;
      cameraRef.current = new Camera(video, {
        onFrame: async () => await faceMeshRef.current.send({ image: video }),
        width: 1280,
        height: 720,
      });
    }

    try {
      await cameraRef.current.start();
      setRunning(true);
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        video.srcObject = stream;
        await video.play();
        cameraRef.current.start();
        setRunning(true);
      } catch {
        alert("Camera permission required.");
      }
    }
  };

  useEffect(() => {
    startFn(() => start);
    stopFn(() => stop);
  }, [startFn, stopFn]);

  const reset = () => {
    blinkTimestampsRef.current = [];
    earHistoryRef.current = [];
    lastEmotionRef.current = {
      happy: 0,
      sad: 0,
      nervous: 0,
      surprised: 0,
      confidence: 0,
      mar: 0,
      ear: 0,
      blink: 0,
      nose: 0,
    };
    sessionDataRef.current = [];
    setBlinkRate(0);
    setHappy(0);
    setSad(0);
    setNervousness(0);
    setSurprised(0);
    setConfidence(0);
  };

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Right Video Feed */}
      <div className="flex-1 flex flex-col py-4  items-center justify-center bg-black">
        <video ref={videoRef} className="hidden" playsInline></video>
        <canvas
          ref={canvasRef}
          width="440"
          height="300"
          className="rounded-xl shadow-lg"
        ></canvas>
        <p className="text-white mt-2">Live Camera Feed with Emotion Overlay</p>
      </div>
      <div className=" bg-secondary border-r overflow-scroll no-scrollbar w-full p-4">
        {/*  <h1 className="text-2xl font-bold mb-4">Emotion Analysis Dashboard</h1> */}
        {/* <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-md shadow cursor-pointer text-white ${
              running ? "bg-red-500" : "bg-green-600"
            }`}
            onClick={() => (running ? stop() : start())}
          >
            {running ? "Stop" : "Start"}
          </button>
          <button
            className="px-4 py-2 rounded-md cursor-pointer border"
            onClick={reset}
          >
            Reset
          </button>
        </div> */}
        <MetricsPanel
          blinkRate={blinkRate}
          confidence={confidence}
          nervousness={nervousness}
          happy={happy}
          sad={sad}
        />
      </div>

      {/* <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        onLoad={() => setLoaded(true)}
      />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" /> */}
    </div>
  );
}
