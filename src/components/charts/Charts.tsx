import type { ReactNode } from "react";

/* ------------------------------------------------------------------ Donut */

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  segments,
  size = 196,
  thickness = 26,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={thickness}
          />
          {segments.map((segment, index) => {
            const fraction = segment.value / total;
            const dash = fraction * circumference;
            const circle = (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className="donut-seg"
              />
            );
            offset += dash;
            return circle;
          })}
        </g>
      </svg>
      <div className="donut-center">
        <strong>{centerValue}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

export function Legend({
  items,
}: {
  items: Array<{ label: ReactNode; color: string; value?: ReactNode }>;
}) {
  return (
    <ul className="legend">
      {items.map((item, index) => (
        <li key={index}>
          <span className="legend-dot" style={{ background: item.color }} />
          <span className="legend-label">{item.label}</span>
          {item.value !== undefined ? <strong>{item.value}</strong> : null}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------- Bar list */

export interface BarItem {
  key: string;
  label: ReactNode;
  value: number;
  display?: string;
  sub?: string;
  color?: string;
  onClick?: () => void;
}

export function BarList({
  items,
  max,
  unit = "",
}: {
  items: BarItem[];
  max?: number;
  unit?: string;
}) {
  const peak = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="barlist">
      {items.map((item) => {
        const width = `${Math.max(2, (item.value / peak) * 100)}%`;
        const Tag = item.onClick ? "button" : "div";
        return (
          <li key={item.key}>
            <Tag
              className={`barlist-row${item.onClick ? " is-button" : ""}`}
              onClick={item.onClick}
              type={item.onClick ? "button" : undefined}
            >
              <span className="barlist-label">{item.label}</span>
              <span className="barlist-track">
                <span
                  className="barlist-fill"
                  style={{ width, background: item.color ?? "var(--brand)" }}
                />
              </span>
              <span className="barlist-value">
                {item.display ?? item.value}
                {unit}
                {item.sub ? <em>{item.sub}</em> : null}
              </span>
            </Tag>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------ Column chart */

export interface Column {
  key: string;
  label: string;
  value: number;
  highlight?: number;
}

export function ColumnChart({
  columns,
  height = 180,
  color = "var(--brand)",
  highlightColor = "var(--accent)",
}: {
  columns: Column[];
  height?: number;
  color?: string;
  highlightColor?: string;
}) {
  const peak = Math.max(1, ...columns.map((c) => c.value));
  return (
    <div className="columns" style={{ height }}>
      {columns.map((column) => {
        const h = `${Math.max(3, (column.value / peak) * 100)}%`;
        const hl =
          column.highlight && column.value
            ? `${(column.highlight / column.value) * 100}%`
            : "0%";
        return (
          <div className="column" key={column.key}>
            <span className="column-value">{column.value}</span>
            <div className="column-bar-wrap">
              <div className="column-bar" style={{ height: h, background: color }}>
                <div
                  className="column-bar-hl"
                  style={{ height: hl, background: highlightColor }}
                />
              </div>
            </div>
            <span className="column-label">{column.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ Stacked bar */

export interface StackSegment {
  key: string;
  value: number;
  color: string;
  label?: string;
}

export function StackedBar({ segments }: { segments: StackSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="stacked" role="img">
      {segments
        .filter((s) => s.value > 0)
        .map((segment) => (
          <span
            key={segment.key}
            className="stacked-seg"
            style={{ width: `${(segment.value / total) * 100}%`, background: segment.color }}
            title={segment.label ? `${segment.label}: ${segment.value}` : undefined}
          />
        ))}
    </div>
  );
}

/* ------------------------------------------------------------- Area line */

export function AreaLine({
  points,
  width = 520,
  height = 150,
  stroke = "var(--brand)",
}: {
  points: number[];
  width?: number;
  height?: number;
  stroke?: string;
}) {
  const peak = Math.max(1, ...points);
  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map((value, index) => {
    const x = index * stepX;
    const y = height - 12 - (value / peak) * (height - 24);
    return [x, y] as const;
  });
  const linePath = coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      className="arealine"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
    >
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#area-grad)" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      {coords.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="3.4" fill="var(--surface)" stroke={stroke} strokeWidth="2" />
      ))}
    </svg>
  );
}
