import SpeedTest from "@/components/SpeedTest";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Free & Anonymous
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Test your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              internet speed
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-lg mx-auto">
            Accurate speed test in seconds. No ads, no signup required.
          </p>
        </div>

        <SpeedTest />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto w-full">
          {[
            { title: "Fast", desc: "Results in under 10 seconds", icon: "⚡" },
            { title: "Accurate", desc: "Multi-threaded testing", icon: "🎯" },
            { title: "Private", desc: "No personal data stored", icon: "🔒" },
          ].map((item) => (
            <div key={item.title} className="text-center p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
