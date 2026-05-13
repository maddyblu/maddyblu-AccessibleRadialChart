import React, { useState, useEffect, useCallback } from "react";
import AccessiblePolarChart from "./components/AccessiblePolarChart";
import ConfigPanel from "./components/ConfigPanel";
import DataPanel from "./components/DataPanel";
import { ChartConfig, ChartDataItem, DEFAULT_CHART_DATA, DEFAULT_CONFIG } from "./types";
import { Share2, RefreshCcw, ChartPie, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [data, setData] = useState<ChartDataItem[]>(DEFAULT_CHART_DATA);
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CONFIG);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<"config" | "data">("config");

  // Load from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("data");
    const sharedConfig = params.get("config");

    if (sharedData) {
      try {
        setData(JSON.parse(atob(sharedData)));
      } catch (e) {
        console.error("Failed to parse shared data", e);
      }
    }
    if (sharedConfig) {
      try {
        setConfig(JSON.parse(atob(sharedConfig)));
      } catch (e) {
        console.error("Failed to parse shared config", e);
      }
    }
  }, []);

  const handleShare = useCallback(() => {
    const dataStr = btoa(JSON.stringify(data));
    const configStr = btoa(JSON.stringify(config));
    const url = new URL(window.location.href);
    url.searchParams.set("data", dataStr);
    url.searchParams.set("config", configStr);
    
    navigator.clipboard.writeText(url.toString());
    alert("Experiment URL copied to clipboard!");
  }, [data, config]);

  const resetAll = () => {
    if (confirm("Reset all parameters to default?")) {
      setData(DEFAULT_CHART_DATA);
      setConfig(DEFAULT_CONFIG);
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  return (
    <div className="flex h-screen bg-[#faf9f6] text-black overflow-hidden selection:bg-black selection:text-white">
      {/* Sidebar Controls */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        className="relative z-20 flex flex-col h-full bg-white border-r border-black/5 overflow-hidden shadow-2xl"
      >
        <div className="flex h-full min-w-[320px]">
          {/* Tab Rail */}
          <div className="w-16 border-r border-black/5 flex flex-col items-center py-6 gap-6 bg-black/[0.02]">
            <button 
              onClick={() => setActivePanel("config")}
              className={`p-2 rounded-xl transition-all ${activePanel === "config" ? "bg-black text-white shadow-lg shadow-black/20" : "text-black/40 hover:text-black"}`}
              title="Configuration"
            >
              <RefreshCcw size={20} />
            </button>
            <button 
              onClick={() => setActivePanel("data")}
              className={`p-2 rounded-xl transition-all ${activePanel === "data" ? "bg-black text-white shadow-lg shadow-black/20" : "text-black/40 hover:text-black"}`}
              title="Data Editor"
            >
              <ChartPie size={20} />
            </button>
            <div className="mt-auto flex flex-col gap-4 pb-4">
               <button onClick={resetAll} className="p-2 text-black/40 hover:text-red-500 transition-colors" title="Reset to Defaults">
                 <RefreshCcw size={20} className="transform rotate-180" />
               </button>
               <button onClick={() => setSidebarOpen(false)} className="p-2 text-black/40 hover:text-black" title="Collapse Sidebar">
                 <Settings size={20} />
               </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <AnimatePresence mode="wait">
              {activePanel === "config" ? (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="h-full"
                >
                  <ConfigPanel config={config} onChange={setConfig} />
                </motion.div>
              ) : (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="h-full"
                >
                  <DataPanel data={data} onChange={setData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Preview Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Header Bar */}
        <header className="h-16 border-b border-black/5 px-8 flex items-center justify-between bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-black flex items-center justify-center rounded-lg text-white font-black italic shadow-inner">P</div>
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] font-mono">Polar Experimenter <span className="opacity-30 text-[10px]">v1.0.4</span></h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/20"
            >
              <Share2 size={14} />
              Share Link
            </button>
          </div>
        </header>

        {/* Chart Viewport */}
        <div className="flex-1 flex items-center justify-center p-12 overflow-auto">
          <motion.div 
            layout
            className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-2xl bg-white min-w-fit min-h-fit ring-1 ring-black/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
             <AccessiblePolarChart {...config} data={data} />
          </motion.div>
        </div>

        {/* Footer Stats / Status */}
        <footer className="h-10 px-8 border-t border-black/5 bg-white/40 backdrop-blur-md flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-black/40">
          <div className="flex gap-6">
            <span>Points: {data.length}</span>
            <span>Dominant: {preparedSummary(data)}</span>
          </div>
          <div className="flex gap-4">
             <span className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
               Engine: ChartJS v4 + Canvas
             </span>
          </div>
        </footer>

        {/* Floating Sidebar Toggle (if closed) */}
        {!isSidebarOpen && (
           <button 
             onClick={() => setSidebarOpen(true)}
             className="absolute left-6 bottom-16 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-90 z-30"
           >
             <Settings size={20} />
           </button>
        )}
      </main>
    </div>
  );
}

function preparedSummary(data: ChartDataItem[]) {
  if (!data.length) return "N/A";
  const max = [...data].sort((a, b) => b.value - a.value)[0];
  return `${max.label} (${max.value})`;
}
