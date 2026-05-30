"use client";

import { MapStat } from "@/types/types";
import {
  ArcElement, Chart as ChartJS, Legend, LineElement,
  PointElement, RadialLinearScale, Title, Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend, Title, PointElement, LineElement);

const MAP_NAMES = ["Dust II", "Mirage", "Inferno", "Anubis", "Nuke", "Train", "Ancient"];

function prepareData(mapsStats: MapStat[]) {
  const byMap = new Map(mapsStats.map(m => [m.map, m]));
  return MAP_NAMES.map(name => {
    const d = byMap.get(name);
    return { map: name, winrate: d?.winrate || 0, matches: d?.matches || 0, avgRating: d?.avgRating || 0 };
  });
}

export const WindroseChart = ({ maps }: { maps: MapStat[] }) => {
  const normalized = prepareData(maps);
  const byMap = new Map(normalized.map(m => [m.map, m]));

  const data = {
    labels: normalized.map(m => m.map.toUpperCase()),
    datasets: [{
      data: normalized.map(m => m.winrate),
      backgroundColor: "rgba(255,255,255,0.06)",
      borderColor: "rgba(255,255,255,0.7)",
      borderWidth: 1,
      pointBackgroundColor: "#fff",
      pointBorderColor: "#000",
      pointRadius: 3,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        angleLines: { color: "rgba(255,255,255,0.08)" },
        grid: { color: "rgba(255,255,255,0.08)" },
        pointLabels: {
          color: "var(--zinc-500)",
          font: { size: 9, family: "ui-monospace,monospace" },
        },
        ticks: { display: false, backdropColor: "transparent" },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const d = byMap.get(ctx.label?.replace(/_/g, " ") || "");
            return d ? `WR ${ctx.raw}% · ${d.matches} maps · RTG ${d.avgRating?.toFixed(2)}` : `${ctx.raw}%`;
          },
        },
      },
    },
  };

  return (
    <div className="card ticks" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <span className="cap cap--xs">// MAP_WINRATE</span>
      <div style={{ width: 280, height: 280 }}>
        <Radar data={data} options={options} />
      </div>
      {/* legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {normalized.filter(m => m.matches > 0).slice(0, 4).map(m => (
          <div key={m.map} style={{ display: "grid", gridTemplateColumns: "80px 1fr 36px", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: ".1em", color: "var(--zinc-500)", textTransform: "uppercase" }}>
              {m.map.split(" ")[0]}
            </span>
            <div style={{ height: 2, background: "var(--zinc-900)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: m.winrate + "%", background: "#fff", transition: "width 1s" }} />
            </div>
            <span className="num" style={{ fontSize: 12, textAlign: "right" }}>{m.winrate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WindroseChart;
