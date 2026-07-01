"use client";

import { useState, useRef } from "react";

type TestStage = "idle" | "preparing" | "downloading" | "measuring" | "done" | "error";

interface TestResult {
  speed: number;
  unit: string;
  latency: number;
}

export default function SpeedTest() {
  const [stage, setStage] = useState<TestStage>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef(0);

  const testSize = 10;

  const runSpeedTest = async () => {
    setError(null);
    setResult(null);
    setStage("preparing");
    setProgress(0);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      startTimeRef.current = performance.now();

      const latencyStart = performance.now();
      await fetch("/api/speedtest?size=1", {
        signal: controller.signal,
        cache: "no-store",
      });
      const latency = Math.round(performance.now() - latencyStart);

      setStage("downloading");

      const response = await fetch(`/api/speedtest?size=${testSize}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to start speed test");
      }

      const reader = response.body.getReader();
      const contentLength = parseInt(
        response.headers.get("Content-Length") || `${testSize * 1024 * 1024}`
      );

      let received = 0;
      const chunks: Uint8Array[] = [];

      setStage("measuring");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setProgress(Math.round((received / contentLength) * 100));
      }

      const totalBytes = chunks.reduce((acc, c) => acc + c.length, 0);
      const durationMs = performance.now() - startTimeRef.current;
      const durationSec = durationMs / 1000;

      const speedBps = (totalBytes * 8) / durationSec;
      const speedMbps = speedBps / (1024 * 1024);

      setResult({
        speed: Math.round(speedMbps * 100) / 100,
        unit: "Mbps",
        latency,
      });

      setStage("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setStage("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "Speed test failed");
      setStage("error");
    }
  };

  const cancelTest = () => {
    controllerRef.current?.abort();
    setStage("idle");
    setProgress(0);
  };

  const getSpeedLabel = (speed: number) => {
    if (speed >= 100) return { label: "Very Fast", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
    if (speed >= 50) return { label: "Fast", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    if (speed >= 20) return { label: "Good", color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" };
    if (speed >= 5) return { label: "Fair", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    return { label: "Slow", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {stage === "idle" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Internet Speed Test</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              Measure your download speed with a single click
            </p>
            <button
              onClick={runSpeedTest}
              className="px-10 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Start Test
            </button>
          </div>
        )}

        {(stage === "preparing" || stage === "downloading" || stage === "measuring") && (
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">{progress}%</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {stage === "preparing" && "Preparing..."}
              {stage === "downloading" && "Downloading..."}
              {stage === "measuring" && "Measuring speed..."}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {stage === "preparing" && "Measuring latency"}
              {stage === "downloading" && `Downloaded ${progress}% of test data`}
              {stage === "measuring" && "Analyzing your connection"}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={cancelTest}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Cancel
            </button>
          </div>
        )}

        {stage === "done" && result && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <div className="mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-1">
                {result.speed}
                <span className="text-2xl text-gray-400 ml-1">{result.unit}</span>
              </div>
              <div className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-medium border ${
                getSpeedLabel(result.speed).bg + " " + getSpeedLabel(result.speed).color
              }`}>
                {getSpeedLabel(result.speed).label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Download</div>
                <div className="text-lg font-semibold">
                  {result.speed} <span className="text-sm text-gray-400">{result.unit}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Latency</div>
                <div className="text-lg font-semibold">
                  {result.latency} <span className="text-sm text-gray-400">ms</span>
                </div>
              </div>
            </div>

            <button
              onClick={runSpeedTest}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Test Again
            </button>
          </div>
        )}

        {stage === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Test Failed</h3>
            <p className="text-gray-500 text-sm mb-6">{error || "Something went wrong"}</p>
            <button
              onClick={runSpeedTest}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
