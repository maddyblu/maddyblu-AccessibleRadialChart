import React, { useState } from "react";
import { ChartDataItem } from "../types";
import { Database, Upload, AlertCircle, Check } from "lucide-react";

interface Props {
  data: ChartDataItem[];
  onChange: (data: ChartDataItem[]) => void;
}

export default function DataPanel({ data, onChange }: Props) {
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("Data must be an array");
      
      // Basic validation
      parsed.forEach((item, i) => {
        if (!item.label || typeof item.value !== 'number') {
          throw new Error(`Item at index ${i} is missing label or value`);
        }
      });

      onChange(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full bg-white/50 backdrop-blur-md border-l border-black/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-black/60" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-black/80 font-mono">Data Context</h2>
        </div>
        <label className="cursor-pointer hover:bg-black hover:text-white transition-colors p-1.5 rounded-full">
          <Upload size={16} />
          <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-bold text-black/40">JSON Editor</label>
          {error && (
            <div className="flex items-center gap-1 text-red-500 text-[9px] font-bold">
              <AlertCircle size={10} />
              {error}
            </div>
          )}
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="flex-1 w-full bg-black/5 p-4 rounded-lg font-mono text-xs outline-none focus:ring-1 focus:ring-black/20 resize-none"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleApply}
          className="w-full bg-black text-white py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-2"
        >
          Apply Changes
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full bg-white border border-black/10 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-black/5 transition-all flex items-center justify-center gap-2"
        >
          {copied ? <Check size={16} className="text-green-500" /> : "Export JSON"}
        </button>
      </div>
    </div>
  );
}
