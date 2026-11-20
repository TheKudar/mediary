import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { number, compact } from "./data";
type Series = { label: string; data: number[]; secondary?: boolean; previous?: boolean };
export function Plot({
  labels,
  series,
  title,
  bars = false,
  mini = false,
  unit = "",
  previousDates,
}: {
  labels: string[];
  series: Series[];
  title: string;
  bars?: boolean;
  mini?: boolean;
  unit?: string;
  previousDates?: string[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const fill = ctx.createLinearGradient(0, 0, 0, 260);
    fill.addColorStop(0, "rgba(181,255,54,.25)");
    fill.addColorStop(1, "rgba(181,255,54,0)");
    const chart = new Chart(ctx, {
      type: bars ? "bar" : "line",
      data: {
        labels,
        datasets: series.map((s) => ({
          label: s.label,
          data: s.data,
          borderColor: s.previous ? "#8893a7" : s.secondary ? "#10b981" : "#b5ff36",
          backgroundColor: bars ? "#10b981" : s.previous || s.secondary ? "transparent" : fill,
          borderWidth: bars ? 0 : 2,
          borderDash: s.previous ? [4, 5] : [],
          fill: !bars && !s.previous && !s.secondary,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: series.length > 1,
            position: "bottom",
            labels: { color: "#aeb6c4", boxWidth: 12, boxHeight: 2 },
          },
          tooltip: {
            backgroundColor: "#222b37",
            padding: 12,
            callbacks: {
              label: (c) => c.dataset.label + ": " + number(Number(c.raw), 2) + unit,
              afterTitle: (cs) =>
                previousDates?.[cs[0].dataIndex]
                  ? "Сравнение: " + previousDates[cs[0].dataIndex]
                  : "",
            },
          },
        },
        scales: {
          x: {
            display: !mini,
            grid: { display: false },
            ticks: { color: "#9ca3af", maxTicksLimit: 7, maxRotation: 0 },
          },
          y: {
            display: !mini,
            beginAtZero: true,
            grid: { color: "#ffffff0c" },
            ticks: {
              color: "#9ca3af",
              maxTicksLimit: 5,
              callback: (v) => compact(Number(v)) + unit,
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [labels, series, bars, mini, unit, previousDates]);
  return (
    <div className={mini ? "plot mini-plot" : "plot"}>
      <canvas role="img" aria-label={title} ref={ref} />
    </div>
  );
}
