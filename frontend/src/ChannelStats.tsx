import { useEffect, useState } from "react";
import { Plot } from "./analytics/Plot";
import "./analytics/studio.css";
type Day = { day: string; views: number; viewers: number };
export default function ChannelStats({ clips }: { clips: { id: number; title: string }[] }) {
  const [days, setDays] = useState(28),
    [video, setVideo] = useState(0),
    [rows, setRows] = useState<Day[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    async function read() {
      try {
        const res = await fetch("/api/stats?days=" + days + "&video=" + video, {
          signal: abort.signal,
        });
        if (!res.ok) throw Error();
        setRows(await res.json());
        setError("");
      } catch {
        if (!abort.signal.aborted) setError("Не удалось получить статистику");
      }
    }
    void read();
    const timer = setInterval(read, 15000);
    return () => {
      abort.abort();
      clearInterval(timer);
    };
  }, [days, video]);
  return (
    <section className="analytics-shell">
      <div className="a-main">
        <h1>Аналитика канала</h1>
        <div className="tools">
          <label>
            Видео{" "}
            <select value={video} onChange={(e) => setVideo(+e.target.value)}>
              <option value={0}>Все мои видео</option>
              {clips.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Период{" "}
            <select value={days} onChange={(e) => setDays(+e.target.value)}>
              {[7, 28, 90, 365].map((n) => (
                <option key={n} value={n}>
                  {n} дней
                </option>
              ))}
            </select>
          </label>
        </div>
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          <>
            <h2>Просмотры · {rows.reduce((n, r) => n + Number(r.views), 0)}</h2>
            {rows.length ? (
              <Plot
                labels={rows.map((d) => d.day)}
                series={[
                  { label: "Просмотры", data: rows.map((d) => Number(d.views)) },
                  {
                    label: "Уникальные зрители за день",
                    secondary: true,
                    data: rows.map((d) => Number(d.viewers)),
                  },
                ]}
                title="Просмотры и зрители по дням"
              />
            ) : (
              <p>За этот период просмотров пока нет.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
