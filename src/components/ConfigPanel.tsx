import React from "react";
import { ChartConfig } from "../types";
import { Settings, Maximize, Type, Palette, LayoutGrid, Eye } from "lucide-react";

interface Props {
  config: ChartConfig;
  onChange: (config: ChartConfig) => void;
}

export default function ConfigPanel({ config, onChange }: Props) {
  const handleChange = (key: keyof ChartConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full bg-white/50 backdrop-blur-md border-r border-black/10">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-black/60" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-black/80 font-mono">Parameters</h2>
      </div>

      {/* Dimensions */}
      <Section icon={<Maximize size={16} />} title="Canvas Size">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Width">
            <input 
              type="number" 
              value={config.width} 
              onChange={(e) => handleChange("width", Number(e.target.value))}
              className="w-full bg-black/5 border-b border-black/20 focus:border-black py-1 px-2 text-sm font-mono outline-none"
            />
          </InputGroup>
          <InputGroup label="Height">
            <input 
              type="number" 
              value={config.height} 
              onChange={(e) => handleChange("height", Number(e.target.value))}
              className="w-full bg-black/5 border-b border-black/20 focus:border-black py-1 px-2 text-sm font-mono outline-none"
            />
          </InputGroup>
        </div>
      </Section>

      {/* Spacing & Typography */}
      <Section icon={<Type size={16} />} title="Labels">
        <InputGroup label="Outer Padding">
          <input 
            type="range" 
            min="0" max="150" 
            value={config.outerLabelPadding} 
            onChange={(e) => handleChange("outerLabelPadding", Number(e.target.value))}
            className="w-full accent-black"
          />
          <span className="text-[10px] text-black/40 font-mono">{config.outerLabelPadding}px</span>
        </InputGroup>
        <InputGroup label="Font Size">
          <input 
            type="range" 
            min="8" max="24" 
            value={config.fontSize} 
            onChange={(e) => handleChange("fontSize", Number(e.target.value))}
            className="w-full accent-black"
          />
          <span className="text-[10px] text-black/40 font-mono">{config.fontSize}px</span>
        </InputGroup>
      </Section>

      {/* Colors */}
      <Section icon={<Palette size={16} />} title="Theme">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Label Color">
            <input 
              type="color" 
              value={config.labelColor} 
              onChange={(e) => handleChange("labelColor", e.target.value)}
              className="w-full h-8 bg-transparent border-none cursor-pointer"
            />
          </InputGroup>
          <InputGroup label="Background">
            <input 
              type="color" 
              value={config.backgroundColor} 
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
              className="w-full h-8 bg-transparent border-none cursor-pointer"
            />
          </InputGroup>
        </div>
      </Section>

      {/* Recency Colors */}
      <Section icon={<Palette size={16} />} title="Recency Tones">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={config.recencyGradientMode === "single"} 
                onChange={() => handleChange("recencyGradientMode", "single")}
                className="accent-black"
              />
              <span className="text-[10px] uppercase font-bold text-black/60">Single</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={config.recencyGradientMode === "gradient"} 
                onChange={() => handleChange("recencyGradientMode", "gradient")}
                className="accent-black"
              />
              <span className="text-[10px] uppercase font-bold text-black/60">Gradient</span>
            </label>
          </div>
          <InputGroup label="Tone Count">
            <input 
              type="range" 
              min="2" max="10" step="1"
              value={config.recencyToneCount} 
              onChange={(e) => handleChange("recencyToneCount", Number(e.target.value))}
              className="w-full accent-black"
            />
            <span className="text-[10px] text-black/40 font-mono">{config.recencyToneCount} Tones</span>
          </InputGroup>
          <div className="grid grid-cols-3 gap-2">
            <InputGroup label="Start">
              <input 
                type="color" 
                value={config.recencyColorStart} 
                onChange={(e) => handleChange("recencyColorStart", e.target.value)}
                className="w-full h-8 bg-transparent border-none cursor-pointer"
              />
            </InputGroup>
            <InputGroup label="End">
              <input 
                type="color" 
                value={config.recencyColorEnd} 
                onChange={(e) => handleChange("recencyColorEnd", e.target.value)}
                disabled={config.recencyGradientMode === "single"}
                className={`w-full h-8 bg-transparent border-none cursor-pointer ${config.recencyGradientMode === "single" ? "opacity-20" : ""}`}
              />
            </InputGroup>
            <InputGroup label="Exc.">
              <input 
                type="color" 
                value={config.recencyColorException} 
                onChange={(e) => handleChange("recencyColorException", e.target.value)}
                className="w-full h-8 bg-transparent border-none cursor-pointer"
              />
            </InputGroup>
          </div>
        </div>
      </Section>

      {/* Slicing */}
      <Section icon={<LayoutGrid size={16} />} title="Composition">
        <InputGroup label="Max Slices">
          <input 
            type="number" 
            min="1" max="20"
            value={config.maxVisibleSlices} 
            onChange={(e) => handleChange("maxVisibleSlices", Number(e.target.value))}
            className="w-full bg-black/5 border-b border-black/20 focus:border-black py-1 px-2 text-sm font-mono outline-none"
          />
        </InputGroup>
        <div className="flex items-center gap-2 mt-2">
          <input 
            type="checkbox" 
            checked={config.enableOthersSlice} 
            onChange={(e) => handleChange("enableOthersSlice", e.target.checked)}
            id="others"
            className="accent-black"
          />
          <label htmlFor="others" className="text-[10px] uppercase font-bold text-black/60 cursor-pointer">Group "Others"</label>
        </div>
      </Section>

      {/* Advanced Typography */}
      <Section icon={<Type size={16} />} title="Advanced Labels">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Font Family">
              <input 
                type="text" 
                value={config.labelFontFamily} 
                onChange={(e) => handleChange("labelFontFamily", e.target.value)}
                className="w-full bg-black/5 border-b border-black/20 focus:border-black py-1 px-2 text-xs font-mono outline-none"
              />
            </InputGroup>
            <InputGroup label="Font Style">
              <input 
                type="text" 
                value={config.labelFontStyle} 
                onChange={(e) => handleChange("labelFontStyle", e.target.value)}
                className="w-full bg-black/5 border-b border-black/20 focus:border-black py-1 px-2 text-xs font-mono outline-none"
              />
            </InputGroup>
          </div>
          
          <InputGroup label="Char Padding">
            <input 
              type="range" 
              min="-2" max="5" step="0.1"
              value={config.characterPadding} 
              onChange={(e) => handleChange("characterPadding", Number(e.target.value))}
              className="w-full accent-black"
            />
            <span className="text-[10px] text-black/40 font-mono">{config.characterPadding}px</span>
          </InputGroup>

          <InputGroup label="Position">
            <select 
              value={config.labelPosition}
              onChange={(e) => handleChange("labelPosition", e.target.value)}
              className="w-full bg-black/5 border-b border-black/20 focus:border-black py-1 px-2 text-sm font-mono outline-none"
            >
              <option value="outside">Outside (Curved)</option>
              <option value="inside-radial">Inside (Radial)</option>
              <option value="outer-radial">Outer Radial Segments</option>
            </select>
          </InputGroup>
        </div>
      </Section>

      {/* Visibility */}
      <Section icon={<Eye size={16} />} title="Stroke & Guides">
        <div className="flex flex-col gap-4">
          {/* Radial Lines */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={config.showRadialLines} 
                  onChange={(e) => handleChange("showRadialLines", e.target.checked)}
                  id="radial"
                  className="accent-black"
                />
                <label htmlFor="radial" className="text-[10px] uppercase font-bold text-black/60 cursor-pointer">Radial Axis Lines</label>
              </div>
              {config.showRadialLines && (
                <InputGroup label="Axis Color">
                  <input 
                    type="color" 
                    value={config.radialLineColor.startsWith('rgba') ? '#cccccc' : config.radialLineColor} 
                    onChange={(e) => handleChange("radialLineColor", e.target.value)}
                    className="w-full h-8 bg-transparent border-none cursor-pointer"
                  />
                </InputGroup>
              )}
            </div>

            <div className="space-y-2">
              <InputGroup label="Grid Rings Color">
                <input 
                  type="color" 
                  value={config.gridColor.startsWith('rgba') ? '#eeeeee' : config.gridColor} 
                  onChange={(e) => handleChange("gridColor", e.target.value)}
                  className="w-full h-8 bg-transparent border-none cursor-pointer"
                />
              </InputGroup>
            </div>
          </div>

          {/* Slice Borders */}
          <div className="space-y-2 pt-2 border-t border-black/5">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={config.showBorders} 
                onChange={(e) => handleChange("showBorders", e.target.checked)}
                id="borders"
                className="accent-black"
              />
              <label htmlFor="borders" className="text-[10px] uppercase font-bold text-black/60 cursor-pointer">Slice Borders</label>
            </div>
            {config.showBorders && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                   <input 
                     type="checkbox"
                     checked={config.borderColor === "auto"}
                     onChange={(e) => handleChange("borderColor", e.target.checked ? "auto" : "#000000")}
                     id="autoBorder"
                     className="accent-black"
                   />
                   <label htmlFor="autoBorder" className="text-[9px] uppercase font-medium text-black/40 cursor-pointer">Auto Color</label>
                </div>
                {config.borderColor !== "auto" && (
                  <InputGroup label="Border Color">
                    <input 
                      type="color" 
                      value={config.borderColor} 
                      onChange={(e) => handleChange("borderColor", e.target.value)}
                      className="w-full h-8 bg-transparent border-none cursor-pointer"
                    />
                  </InputGroup>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-black/5">
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-black/5 pb-6 last:border-0">
      <div className="flex items-center gap-2 opacity-50">
        {icon}
        <h3 className="text-[10px] font-bold uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase font-medium text-black/40">{label}</label>
      {children}
    </div>
  );
}
