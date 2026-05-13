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
      labelColor: string;
      outerLabelPadding: number;
      truncateLabels: boolean;
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
    const { prepared, fontSize, labelColor, outerLabelPadding, truncateLabels, truncateFormatter } = options;

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
      const radius = scaleRadius + outerLabelPadding;

      // Normalize middle angle to [0, 2PI]
      const midNormalized = ((middle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      
      /**
       * User preference:
       * Upper quadrants (top half): clockwise flow
       * Bottom quadrants (bottom half): anti-clockwise flow
       * In canvas, 0 to PI is the bottom half, PI to 2PI is the top half.
       */
      const flip = midNormalized >= 0 && midNormalized <= Math.PI;

      ctx.font = `bold ${fontSize}px Inter, sans-serif`;

      let displayText = label;
      if (truncateLabels) {
        displayText = truncateFormatter
          ? truncateFormatter(label, 12)
          : truncateToFit(ctx, label, (end - start) * radius * 0.9, fontSize);
      }

      const chars = displayText.split("");
      const textWidth = ctx.measureText(displayText).width;
      const charAngle = textWidth / radius / chars.length;

      // Start calculating angle so the word is centered on 'middle'
      // flip (bottom half): Start at top (middle + offset) and move counter-clockwise towards bottom
      // normal (top half): Start at top (middle - offset) and move clockwise towards bottom
      let angle = flip 
        ? middle + (charAngle * (chars.length - 1)) / 2 
        : middle - (charAngle * (chars.length - 1)) / 2;

      chars.forEach((char) => {
        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;

        ctx.save();
        ctx.translate(x, y);

        let rotation = angle + Math.PI / 2;
        if (flip) rotation += Math.PI;

        ctx.rotate(rotation);
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, 0, 0);
        ctx.restore();

        angle += flip ? -charAngle : charAngle;
      });
    });

    ctx.restore();
  },
};

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

function truncateToFit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number = 14) {
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
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
  excHex: string = "#ef4444"
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
}: Props) {
  const prepared = useMemo(
    () => prepareData(data, maxVisibleSlices, enableOthersSlice),
    [data, maxVisibleSlices, enableOthersSlice]
  );

  const chartData = useMemo(() => ({
    labels: prepared.map((x) => x.label),
    datasets: [{
      data: prepared.map((x) => x.value),
      backgroundColor: prepared.map((x) => getColorForRecency(x.recency, 0.6, recencyColorStart, recencyColorEnd, recencyColorException)),
      borderColor: prepared.map((x) => {
        if (!showBorders) return "transparent";
        return configBorderColor === "auto" 
          ? getColorForRecency(x.recency, 1, recencyColorStart, recencyColorEnd, recencyColorException)
          : configBorderColor;
      }),
      borderWidth: showBorders ? 1.5 : 0,
    }],
  }), [prepared, showBorders, configBorderColor, recencyColorStart, recencyColorEnd, recencyColorException]);

  const options: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: outerLabelPadding + 20,
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
        labelColor,
        outerLabelPadding,
        truncateLabels,
      } as any,
      radialLines: {
        showRadialLines,
        radialLineColor,
        outerLabelPadding,
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
