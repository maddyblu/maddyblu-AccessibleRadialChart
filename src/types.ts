export interface ChartDataItem {
  label: string;
  value: number;
  recency?: number;
  category?: string;
  meta?: {
    fullLabel?: string;
    [key: string]: any;
  };
}

export interface ChartConfig {
  width: number;
  height: number;
  backgroundColor: string;
  outerLabelPadding: number;
  fontSize: number;
  labelColor: string;
  truncateLabels: boolean;
  maxVisibleSlices: number;
  enableOthersSlice: boolean;
  showRadialLines: boolean;
  radialLineColor: string;
  showBorders: boolean;
  borderColor: string;
  recencyColorStart: string;
  recencyColorEnd: string;
  recencyColorException: string;
  gridColor: string;
}

export const DEFAULT_CHART_DATA: ChartDataItem[] = [
  { label: "Engineering", value: 85, recency: 20, category: "tech" },
  { label: "Product Design", value: 72, recency: 45, category: "tech" },
  { label: "Marketing Strategy", value: 45, recency: 90, category: "business" },
  { label: "Customer Experience", value: 92, recency: 10, category: "service" },
  { label: "Research & Dev", value: 64, recency: -1, category: "tech" },
  { label: "Legal Compliance", value: 28, recency: 60, category: "admin" },
  { label: "Operations", value: 55, recency: 30, category: "admin" },
  { label: "Sales Enablement", value: 40, recency: 75, category: "business" },
  { label: "HR Management", value: 33, recency: 95, category: "admin" },
];

export const DEFAULT_CONFIG: ChartConfig = {
  width: 700,
  height: 700,
  backgroundColor: "#ffffff",
  outerLabelPadding: 45,
  fontSize: 13,
  labelColor: "#1a1a1a",
  truncateLabels: true,
  maxVisibleSlices: 7,
  enableOthersSlice: true,
  showRadialLines: true,
  radialLineColor: "rgba(0,0,0,0.12)",
  showBorders: true,
  borderColor: "auto",
  recencyColorStart: "#10b981", // Emerald-500
  recencyColorEnd: "#eab308",   // Yellow-500
  recencyColorException: "#ef4444", // Red-500
  gridColor: "rgba(0,0,0,0.08)",
};
