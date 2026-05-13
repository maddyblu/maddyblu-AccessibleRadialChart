# Accessible Polar Chart Component Documentation

The `AccessiblePolarChart` is a highly customizable, data-driven visualization component built on top of Chart.js. It features a unique "Outer Radial" labeling system designed for maximum readability and accessibility, alongside a sophisticated "Recency" coloring system.

## 1. Component Props (Configuration Options)

The component is configured via the `Props` interface found in `src/types.ts`.

### Core Data & Dimensions
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `ChartDataItem[]` | Required | Array of objects: `{ label: string, value: number, recency?: number }`. |
| `width` | `number` | `500` | Width of the chart canvas in pixels. |
| `height` | `number` | `500` | Height of the chart canvas in pixels. |
| `backgroundColor` | `string` | `"#ffffff"` | Background color of the chart container. |

### Label Configuration
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `labelPosition` | `"outside"` \| `"inside-radial"` \| `"outer-radial"` | `"outer-radial"` | **outside**: Standard labels outside. <br>**inside-radial**: Straight vertical text inside slices. <br>**outer-radial**: Curved text wrapped along the edges. |
| `fontSize` | `number` | `13` | Font size in pixels. |
| `labelColor` | `string` | `"#1a1a1a"` | Text color for labels. |
| `labelFontFamily`| `string` | `"Courier"` | CSS font family for labels. |
| `labelFontStyle` | `string` | `"normal"` | Font weight/style (e.g., "bold", "italic"). |
| `characterPadding`| `number` | `0.3` | Additional spacing between characters in curved text. |
| `outerLabelPadding`| `number` | `0` | Extra distance for `"outside"` labels from the chart edge. |

### Visual Styling (Slices & Grid)
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxVisibleSlices` | `number` | `10` | Maximum number of individual slices to show before grouping. |
| `enableOthersSlice`| `boolean` | `true` | If true, small values are collapsed into an "Others" slice. |
| `showBorders` | `boolean` | `false` | Whether to show borders around slices. |
| `borderColor` | `string` | `"auto"` | Border color. `"auto"` uses a darker version of the slice color. |
| `showRadialLines` | `boolean` | `true` | Shows the lines extending from the center to the edges. |
| `radialLineColor` | `string` | `"#cccccc"` | Color of the radial axis lines. |
| `gridColor` | `string` | `"#eeeeee"` | Color of the concentric circular rings (grid). |

### Recency-Based Coloring
The component includes a "Luminescence-Based" coloring logic that represents the "freshness" or "recency" of data points.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `recencyGradientMode`| `"single"` \| `"gradient"` | `"single"` | **single**: Fades from `Start Color` to white based on recency. <br>**gradient**: Interpolates between `Start` and `End` colors. |
| `recencyToneCount` | `number` | `3` | Divides the 0-100 recency score into discrete color steps (tones). |
| `recencyColorStart` | `string` (Hex) | `"#0cb678"` | Anchor color for low recency (freshest data). |
| `recencyColorEnd` | `string` (Hex) | `"#eab308"` | Anchor color for high recency (in `gradient` mode). |
| `recencyColorException`| `string` (Hex) | `"#ef4444"` | Color used for data points marked with recency `-1`. |

---

## 2. Special Features

### The Outer Radial Labeling Logic
This is the most advanced feature of the component. It uses a custom logic to place text:
1.  **Direct Placement**: It first attempts to fit the entire label on the outer edge of the slice segment.
2.  **Splitting**: If the label contains separators (space, `-`, `&`) and doesn't fit, it splits it into two lines.
3.  **Flip Awareness**: 
    -   On the **upper half** of the chart, line 1 is outside and line 2 is inside.
    -   On the **lower half** (anti-clockwise), line 1 is inside and line 2 is outside to ensure reading parity.
4.  **Auto-Truncation**: If a word or line cannot fit even after splitting, it is intelligently truncated with `...`.

### The Recency Legend
Automatically generated based on the `recencyToneCount`. 
-   If `toneCount = 3`, it provides semantic labels: **Most Recent**, **Mid Career**, and **Early Career**.
-   Displays the calculated color for each range.

---

## 3. Examples

### Example 1: Classic Professional Look
```tsx
import AccessiblePolarChart from './components/AccessiblePolarChart';

const data = [
  { label: "Revenue Growth", value: 85, recency: 10 },
  { label: "Customer Experience", value: 70, recency: 45 },
  { label: "Market Operations", value: 50, recency: 90 },
];

export default function App() {
  return (
    <AccessiblePolarChart 
      data={data}
      recencyToneCount={3}
      recencyGradientMode="single"
      labelPosition="outer-radial"
      fontSize={12}
    />
  );
}
```
**Output Description**: A 500x500 chart where "Revenue Growth" is a vibrant emerald green. "Customer Experience" is split into two curved lines on its segment. "Market Operations" is a lighter, faded version of the emerald.

### Example 2: Heatmap Gradient Style
```tsx
<AccessiblePolarChart 
  data={data}
  recencyGradientMode="gradient"
  recencyColorStart="#3b82f6" // Blue
  recencyColorEnd="#ef4444"   // Red
  recencyToneCount={5}
  showBorders={true}
  borderColor="#000000"
/>
```
**Output Description**: Slices transition through 5 distinct color steps from blue (recent) to red (old). Each slice has a sharp black border for high contrast.

---

## 4. Usage Requirements
- **Dependencies**: `react-chartjs-2`, `chart.js`, `lucide-react`, `motion/react`.
- **Environment**: Performance is optimized for React 18+. The component uses `useMemo` for heavy data preparation and canvas calculations.
