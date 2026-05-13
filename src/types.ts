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

export interface DataMapping {
  label: string;
  value: string;
  recency: string;
}

export interface ChartConfig {
  width: number;
  height: number;
  backgroundColor: string;
  outerLabelPadding: number;
  fontSize: number;
  labelColor: string;
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
  labelFontFamily: string;
  labelFontStyle: string;
  recencyGradientMode: "single" | "gradient";
  characterPadding: number;
  labelPosition: "outside" | "inside-radial" | "outer-radial";
  recencyToneCount: number;
  dataMapping: DataMapping;
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
  width: 500,
  height: 500,
  backgroundColor: "#ffffff",
  outerLabelPadding: 0,
  fontSize: 13,
  labelColor: "#1a1a1a",
  maxVisibleSlices: 10,
  enableOthersSlice: true,
  showRadialLines: true,
  radialLineColor: "#cccccc",
  showBorders: false,
  borderColor: "auto",
  recencyColorStart: "#0cb678", 
  recencyColorEnd: "#eab308",   
  recencyColorException: "#ef4444", 
  gridColor: "#eeeeee",
  labelFontFamily: "Courier",
  labelFontStyle: "normal",
  recencyGradientMode: "single",
  characterPadding: 0.3,
  labelPosition: "outer-radial",
  recencyToneCount: 3,
  dataMapping: {
    label: "label",
    value: "value",
    recency: "recency"
  }
};
