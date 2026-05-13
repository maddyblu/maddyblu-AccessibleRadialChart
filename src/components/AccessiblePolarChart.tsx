import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Plugin,
  ChartOptions,
  ChartType,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";
import { ChartDataItem, ChartConfig } from "../types";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

/* ========================================================
TYPES & DECLARATIONS
======================================================== */

declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    curvedLabels?: {
      prepared: ChartDataItem[];
      fontSize: number;
      fontFamily: string;
      fontStyle: string;
      labelColor: string;
      outerLabelPadding: number;
      truncateLabels: boolean;
      characterPadding: number;
      labelPosition: "outside" | "inside-radial" | "outer-radial";
    };
    radialLines?: {
      showRadialLines: boolean;
      radialLineColor: string;
      outerLabelPadding: number;
    };
  }
}

/* ========================================================
PLUGINS
======================================================== */

const curvedLabelsPlugin: Plugin<"polarArea"> = {
  id: "curvedLabels",
  afterDatasetsDraw(chart, _args, options) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const { 
      prepared, 
      fontSize, 
      fontFamily, 
      fontStyle, 
      labelColor, 
      outerLabelPadding, 
      truncateLabels, 
      truncateFormatter,
      characterPadding,
      labelPosition
    } = options;

    if (!prepared) return;

    ctx.save();

    meta.data.forEach((arc: any, index: number) => {
      const item = prepared[index];
      if (!item) return;
      
      const label = item.label;
      const start = arc.startAngle;
      const end = arc.endAngle;
      const middle = (start + end) / 2;
      const scaleRadius = (chart.scales.r as any).drawingArea;

      // Normalize middle angle to [0, 2PI]
      const midNormalized = ((middle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      
      /**
       * User preference:
       * Upper quadrants (top half): clockwise flow
       * Bottom quadrants (bottom half): anti-clockwise flow
       * In canvas, 0 to PI is the bottom half, PI to 2PI is the top half.
       */
      const flip = midNormalized >= 0 && midNormalized <= Math.PI;

      ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}, sans-serif`;

      let displayText = label;
      if (truncateLabels) {
        const maxWidth = labelPosition === "inside-radial" 
          ? arc.outerRadius * 0.8 
          : (end - start) * (scaleRadius + outerLabelPadding) * 0.9;
        
        displayText = truncateFormatter
          ? truncateFormatter(label, 12)
          : truncateToFit(ctx, label, maxWidth, fontSize, fontFamily, fontStyle);
      }

      const chars = displayText.split("");
      const radiusMax = scaleRadius + outerLabelPadding;

      if (labelPosition === "inside-radial") {
        const charSpacing = fontSize * 0.85 + (characterPadding || 0);
        let r = arc.outerRadius - 8;
        
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        chars.forEach((char) => {
          if (r < 10) return; // Don't draw too close to center
          const x = arc.x + Math.cos(middle) * r;
          const y = arc.y + Math.sin(middle) * r;

          ctx.save();
          ctx.translate(x, y);
          // Orientation: top of character points outward
          let rotation = middle + Math.PI / 2;
          ctx.rotate(rotation);
          ctx.fillText(char, 0, 0);
          ctx.restore();
          r -= charSpacing;
        });
      } else {
        // curved: either outside or outer-radial (inside with wrap)
        const isOuterRadial = labelPosition === "outer-radial";
        const radiusInitial = isOuterRadial ? scaleRadius : (scaleRadius + outerLabelPadding);
        const arcAngle = (end - start);
        
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (isOuterRadial) {
          const words = displayText.split(" ");
          const outerR = radiusInitial - (fontSize * 0.7);
          const innerR = outerR - (fontSize * 1.1);

          // Try putting everything on the outer line first
          const fullWidth = ctx.measureText(displayText).width + (displayText.length - 1) * (characterPadding || 0);
          if (fullWidth <= arcAngle * outerR * 0.95) {
            drawCurvedLine(ctx, displayText, arc.x, arc.y, outerR, middle, flip, characterPadding);
          } else {
            // Split into 2 lines
            const line1Radius = flip ? innerR : outerR;
            const line2Radius = flip ? outerR : innerR;

            let splitIndex = 1; 
            for (let i = 1; i <= words.length; i++) {
              const line1 = words.slice(0, i).join(" ");
              const w1 = ctx.measureText(line1).width + (line1.length - 1) * (characterPadding || 0);
              if (w1 <= arcAngle * line1Radius * 0.95) {
                splitIndex = i;
              } else {
                break;
              }
            }

            let line1Text = words.slice(0, splitIndex).join(" ");
            let line2Text = words.slice(splitIndex).join(" ");

            // Truncate line 1 if even the first word is too long
            const maxW1 = arcAngle * line1Radius * 0.95;
            if (ctx.measureText(line1Text).width + (line1Text.length - 1) * (characterPadding || 0) > maxW1) {
              line1Text = truncateToFit(ctx, line1Text, maxW1, fontSize, fontFamily, fontStyle);
              line2Text = ""; // Stop after truncation
            }

            if (line1Text) {
              drawCurvedLine(ctx, line1Text, arc.x, arc.y, line1Radius, middle, flip, characterPadding);
            }
            
            if (line2Text) {
              const maxW2 = arcAngle * line2Radius * 0.95;
              if (ctx.measureText(line2Text).width + (line2Text.length - 1) * (characterPadding || 0) > maxW2) {
                line2Text = truncateToFit(ctx, line2Text, maxW2, fontSize, fontFamily, fontStyle);
              }
              drawCurvedLine(ctx, line2Text, arc.x, arc.y, line2Radius, middle, flip, characterPadding);
            }
          }
        } else {
          drawCurvedLine(ctx, displayText, arc.x, arc.y, radiusInitial, middle, flip, characterPadding);
        }
      }
    });

    ctx.restore();
  },
};

/**
 * Helper to draw a curved line of text
 */
function drawCurvedLine(
  ctx: CanvasRenderingContext2D, 
  text: string, 
  centerX: number,
  centerY: number,
  r: number, 
  middle: number, 
  flip: boolean, 
  characterPadding: number
) {
  const chars = text.split("");
  const textWidth = ctx.measureText(text).width + (chars.length - 1) * (characterPadding || 0);
  const charAngle = textWidth / r / chars.length;

  let angle = flip 
    ? middle + (charAngle * (chars.length - 1)) / 2 
    : middle - (charAngle * (chars.length - 1)) / 2;

  chars.forEach((char) => {
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;

    ctx.save();
    ctx.translate(x, y);

    let rotation = angle + Math.PI / 2;
    if (flip) rotation += Math.PI;

    ctx.rotate(rotation);
    ctx.fillText(char, 0, 0);
    ctx.restore();

    angle += flip ? -charAngle : charAngle;
  });
}

const radialLinesPlugin: Plugin<"polarArea"> = {
  id: "radialLines",
  afterDraw(chart, _args, options) {
    if (!options.showRadialLines) return;
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);

    ctx.save();
    ctx.strokeStyle = options.radialLineColor;
    ctx.lineWidth = 1.25;

    const scaleRadius = (chart.scales.r as any).drawingArea;
    const radius = scaleRadius + (options.outerLabelPadding || 0);

    meta.data.forEach((arc: any) => {
      ctx.beginPath();
      ctx.moveTo(arc.x, arc.y);
      ctx.lineTo(
        arc.x + Math.cos(arc.startAngle) * radius,
        arc.y + Math.sin(arc.startAngle) * radius
      );
      ctx.stroke();
    });
    ctx.restore();
  },
};

ChartJS.register(curvedLabelsPlugin, radialLinesPlugin);

/* ========================================================
UTILS
======================================================== */

function truncateToFit(
  ctx: CanvasRenderingContext2D, 
  text: string, 
  maxWidth: number, 
  fontSize: number = 14,
  fontFamily: string = "Inter",
  fontStyle: string = "bold"
) {
  ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}, sans-serif`;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 3 && ctx.measureText(t + "...").width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "...";
}

function prepareData(data: ChartDataItem[], maxVisibleSlices: number, enableOthersSlice: boolean) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  if (!enableOthersSlice || sorted.length <= maxVisibleSlices) return sorted;

  const visible = sorted.slice(0, maxVisibleSlices);
  const hidden = sorted.slice(maxVisibleSlices);

  const hiddenRecencies = hidden.map(h => h.recency).filter(r => r !== undefined && r !== -1) as number[];
  const avgRecency = hiddenRecencies.length > 0 
    ? hiddenRecencies.reduce((a, b) => a + b, 0) / hiddenRecencies.length
    : -1;

  visible.push({
    label: `Others (${hidden.length})`,
    value: hidden.reduce((s, x) => s + x.value, 0),
    recency: avgRecency,
    category: "other",
    meta: { hiddenItems: hidden },
  });
  return visible;
}

const PALETTE = [
  "rgba(255, 99, 132, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(255, 206, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(255, 159, 64, 0.6)",
  "rgba(201, 203, 207, 0.6)",
  "rgba(255, 99, 132, 0.4)",
  "rgba(54, 162, 235, 0.4)",
];

function getColorForRecency(
  recency: number | undefined, 
  alpha: number = 0.6,
  startHex: string = "#10b981",
  endHex: string = "#eab308",
  excHex: string = "#ef4444",
  mode: "single" | "gradient" = "gradient"
) {
  if (recency === undefined) return `rgba(156, 163, 175, ${alpha})`; // gray-400
  
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  if (recency === -1) {
    const { r, g, b } = hexToRgb(excHex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const start = hexToRgb(startHex);
  
  if (mode === "single") {
    // Luminescence-based coloring: 
    // Recency 0 -> Selected Color
    // Recency 100 -> Washed out (lighter/white)
    
    let r1 = start.r / 255, g1 = start.g / 255, b1 = start.b / 255;
    let max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r1) h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
      else if (max === g1) h = (b1 - r1) / d + 2;
      else h = (r1 - g1) / d + 4;
      h /= 6;
    }

    const recV = recency !== undefined ? Math.max(0, Math.min(100, recency)) : 50;
    const v = recV / 100; // 0 is exact, 1 is washed out

    // Washout: Saturation drops to 20% of anchor, Lightness increases
    const newL = l + (0.95 - l) * v * 0.8;
    const newS = s * (1 - 0.8 * v); // drops to 20% at v=1

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
    let p = 2 * newL - q;
    let resR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    let resG = Math.round(hue2rgb(p, q, h) * 255);
    let resB = Math.round(hue2rgb(p, q, h - 1/3) * 255);

    return `rgba(${resR}, ${resG}, ${resB}, ${alpha})`;
  }

  const end = hexToRgb(endHex);
  const v = Math.max(0, Math.min(100, recency)) / 100;
  const r = Math.round(start.r + (end.r - start.r) * v);
  const g = Math.round(start.g + (end.g - start.g) * v);
  const b = Math.round(start.b + (end.b - start.b) * v);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ========================================================
COMPONENT
======================================================== */

interface Props extends ChartConfig {
  data: ChartDataItem[];
}

export default function AccessiblePolarChart({
  data,
  width,
  height,
  backgroundColor,
  outerLabelPadding,
  fontSize,
  labelColor,
  truncateLabels,
  maxVisibleSlices,
  enableOthersSlice,
  showRadialLines,
  radialLineColor,
  showBorders,
  borderColor: configBorderColor,
  recencyColorStart,
  recencyColorEnd,
  recencyColorException,
  gridColor,
  labelFontFamily,
  labelFontStyle,
  recencyGradientMode,
  characterPadding,
  labelPosition,
}: Props) {
  const prepared = useMemo(
    () => prepareData(data, maxVisibleSlices, enableOthersSlice),
    [data, maxVisibleSlices, enableOthersSlice]
  );

  const chartData = useMemo(() => ({
    labels: prepared.map((x) => x.label),
    datasets: [{
      data: prepared.map((x) => x.value),
      backgroundColor: prepared.map((x) => getColorForRecency(x.recency, 0.6, recencyColorStart, recencyColorEnd, recencyColorException, recencyGradientMode)),
      borderColor: prepared.map((x) => {
        if (!showBorders) return "transparent";
        return configBorderColor === "auto" 
          ? getColorForRecency(x.recency, 1, recencyColorStart, recencyColorEnd, recencyColorException, recencyGradientMode)
          : configBorderColor;
      }),
      borderWidth: showBorders ? 1.5 : 0,
    }],
  }), [prepared, showBorders, configBorderColor, recencyColorStart, recencyColorEnd, recencyColorException, recencyGradientMode]);

  const options: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    layout: {
      padding: labelPosition === "inside-radial" ? 20 : (outerLabelPadding + 20),
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        bodyFont: {
          family: "'JetBrains Mono', 'Fira Code', monospace",
        },
        callbacks: {
          label: (context: any) => {
            const item = prepared[context.dataIndex];
            const value = context.formattedValue;
            const recency = item.recency === -1 ? "Exception" : (item.recency !== undefined ? Math.round(item.recency) : "N/A");
            return `Value: ${value} | Recency: ${recency}`;
          },
          afterBody: (context: any) => {
            const index = context[0].dataIndex;
            const item = prepared[index];
            if (item?.meta?.hiddenItems) {
              const items = item.meta.hiddenItems as ChartDataItem[];
              const header = "LABEL          VALUE  RECENCY";
              const divider = "-----------------------------";
              const rows = items.map(h => {
                const l = h.label.length > 14 ? h.label.slice(0, 11) + "..." : h.label.padEnd(14);
                const v = String(h.value).padEnd(6);
                const r = h.recency === -1 ? "EXC" : String(h.recency).padEnd(7);
                return `${l} ${v} ${r}`;
              });
              return ["", header, divider, ...rows];
            }
            return "";
          }
        }
      },
      curvedLabels: {
        prepared,
        fontSize,
        fontFamily: labelFontFamily,
        fontStyle: labelFontStyle,
        labelColor,
        outerLabelPadding,
        truncateLabels,
        characterPadding,
        labelPosition,
      } as any,
      radialLines: {
        showRadialLines,
        radialLineColor,
        outerLabelPadding: labelPosition === "inside-radial" ? 0 : outerLabelPadding,
      } as any,
    },
    scales: {
      r: {
        backgroundColor: "transparent",
        ticks: { display: false },
        grid: { circular: true, color: gridColor },
      },
    },
  };

  return (
    <div 
      className="relative flex items-center justify-center p-4" 
      style={{ 
        width: "100%", 
        height: "100%", 
        background: backgroundColor,
        borderRadius: "1rem" 
      }}
    >
      <div style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%', maxHeight: '100%' }}>
        <PolarArea data={chartData} options={options} />
      </div>
    </div>
  );
}
