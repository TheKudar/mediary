import { useState, useEffect } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Clock3,
  Download,
  Eye,
  GitCompareArrows,
  Layers,
  Play,
  ThumbsUp,
  Users,
  Video,
} from "lucide-react";
import { Plot } from "./Plot";
import {
  compact,
  date,
  duration,
  metrics,
  number,
  periods,
  sources,
  sum,
  titles,
  values,
  windowData,
} from "./data";
import "./studio.css";
const tabs = ["Обзор", "Охват и источники", "Вовлеченность", "Аудитория"];
function Bars({ items }: { items: [string, number][] }) {
  return (
    <div className="a-bars">
      {items.map(([label, n]) => (
        <div key={label}>
          <span>
            {label}
            <b>{number(n, 1)}%</b>
          </span>
          <i>
            <em style={{ width: n + "%" }} />
          </i>
        </div>
      ))}
    </div>
  );
}
function Table({ head, items }: { head: string[]; items: (string | number)[][] }) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function Realtime() {
  const [minute, setMinute] = useState(() => Math.floor(Date.now() / 60000)),
    [range, setRange] = useState(48);
  useEffect(() => {
    const t = setInterval(() => setMinute(Math.floor(Date.now() / 60000)), 15000);
    return () => clearInterval(t);
  }, []);
  const event = (m: number) => Math.round(3 + 2 * Math.sin(m * 0.09) + 1.1 * Math.cos(m * 0.013));
  const minutes = Array.from({ length: 2880 }, (_, i) => event(minute - 2879 + i));
  const buckets =
    range === 48
      ? Array.from({ length: 48 }, (_, i) =>
          minutes.slice(i * 60, i * 60 + 60).reduce((a, b) => a + b, 0),
        )
      : minutes.slice(-60);
  const total = buckets.reduce((a, b) => a + b, 0);
  return (
    <aside className="a-panel live-panel">
      <div className="live-label">
        <i />
        LIVE
      </div>
      <h2>Аналитика в реальном времени</h2>
      <div className="a-switch">
        {[48, 60].map((n) => (
          <button aria-pressed={range === n} key={n} onClick={() => setRange(n)}>
            {n === 48 ? "48 часов" : "60 минут"}
          </button>
        ))}
      </div>
      <strong className="live-num">{number(total)}</strong>
      <small>просмотров за {range === 48 ? "48 часов" : "60 минут"}</small>
      <Plot
        title="Активность по времени"
        bars
        mini
        labels={buckets.map((_, i) =>
          new Date(
            (minute - (buckets.length - 1 - i) * (range === 48 ? 60 : 1)) * 60000,
          ).toLocaleString("ru-RU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        )}
        series={[{ label: "Просмотры", data: buckets }]}
      />
      <h3>Популярные видео</h3>
      {titles.map((name, i) => (
        <div className="a-top" key={name}>
          <span>0{i + 1}</span>
          <b>{name}</b>
          <strong>{number(Math.round(total * [0.38, 0.29, 0.18][i]))}</strong>
        </div>
      ))}
    </aside>
  );
}
export default function Analytics({ back }: { back: () => void }) {
  const [tab, T] = useState(0),
    [days, D] = useState(28),
    [metric, M] = useState(0),
    [compare, C] = useState(false),
    [exp, E] = useState(false),
    [stage, F] = useState(0),
    [heat, H] = useState([4, 20]);
  const { current: r, previous: p } = windowData(days),
    v = values(r),
    prev = values(p),
    show = compare && p.length > 0;
  const labels = r.map((d) => date(d.date)),
    sumImp = sum(r, (d) => d.impressions),
    from = sum(r, (d) => d.from),
    avg = sum(r, (d) => d.seconds) / v[0],
    traffic = sources.map((_, i) => sum(r, (d) => d.traffic[i])),
    search = traffic[1],
    skew = sum(r, (d) => d.returning) / v[0] - 0.29;
  const funnel = [
    number(sumImp),
    number((100 * from) / sumImp, 2) + "%",
    number(from),
    number(sum(r, (d) => (d.from * d.seconds) / d.views) / 3600, 1) + " ч",
  ];
  const series = [
    { label: metrics[metric], data: r.map((d) => values([d])[metric]) },
    ...(show
      ? [{ label: "Предыдущий период", previous: true, data: p.map((d) => values([d])[metric]) }]
      : []),
  ];
  const bounds =
    date(r[0].date) + " — " + date(r[r.length - 1].date) + " " + r[r.length - 1].date.slice(0, 4);
  function csv() {
    const header = [
      "Период",
      "Дата",
      "Просмотры",
      "Часы просмотра",
      "Изменение подписчиков",
      "Положительные оценки, %",
      "Показы",
      "Просмотры из показов",
      ...sources,
      "Средний просмотр, с",
      "Новые зрители",
      "Постоянные зрители",
    ];
    const lines = [
      header,
      ...[[r, "Выбранный"], ...(show ? [[p, "Предыдущий"]] : [])].flatMap((pair) =>
        (pair[0] as typeof r).map((d) => [
          String(pair[1]),
          d.date,
          ...values([d]).map((x) => Number(x.toFixed(2))),
          d.impressions,
          d.from,
          ...d.traffic,
          Math.round(d.seconds / d.views),
          d.newViewers,
          d.returning,
        ]),
      ),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(["\ufeff" + lines.map((line) => line.join(";")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    a.download = "Mediary-analytics-" + r[0].date + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
    E(false);
  }
  useEffect(() => {
    document.title = "Аналитика канала · Mediary Studio";
    return () => {
      document.title = "Mediary";
    };
  }, []);
  return (
    <div className="analytics-shell">
      <header className="a-mast">
        <div>
          <span className="a-mark">
            <Play fill="currentColor" size={14} />
          </span>
          <strong>Mediary</strong>
          <span className="studio-word">Studio</span>
        </div>
        <button onClick={back}>
          <ArrowLeft size={15} />
          На Mediary
        </button>
      </header>
      <main className="a-main">
        <div className="a-heading">
          <div>
            <small>СТУДИЯ АВТОРА</small>
            <h1>Аналитика канала</h1>
            <p>{bounds} · Демоданные</p>
          </div>
          <div className="a-actions">
            <select aria-label="Период" value={days} onChange={(e) => D(+e.target.value)}>
              {periods.map(([n, s]) => (
                <option key={n} value={n}>
                  {s}
                </option>
              ))}
            </select>
            <button
              aria-pressed={!!show}
              disabled={!days}
              title={days ? "Сравнить с предыдущим периодом" : "Выбрана вся доступная история"}
              onClick={() => C(!compare)}
            >
              <GitCompareArrows size={16} />
              Сравнить
            </button>
            <div className="a-export">
              <button onClick={() => E(!exp)} aria-expanded={exp}>
                <Download size={15} />
                Экспорт данных
              </button>
              {exp && (
                <div>
                  <button onClick={csv}>Скачать CSV</button>
                  <button
                    onClick={() => {
                      E(false);
                      setTimeout(() => window.print(), 100);
                    }}
                  >
                    Печать / PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <nav className="a-tabs">
          {tabs.map((s, i) => (
            <button key={s} aria-pressed={tab === i} onClick={() => T(i)}>
              {s}
            </button>
          ))}
        </nav>
        {show && (
          <p className="compare-note">
            Сравнение с {date(p[0].date)} — {date(p[p.length - 1].date)}{" "}
            {p[p.length - 1].date.slice(0, 4)} · {number((v[0] / prev[0] - 1) * 100, 1)}% по
            просмотрам
          </p>
        )}
        <section className="a-content" key={tab}>
          {tab === 0 && (
            <>
              <div className="kpis">
                {metrics.map((s, i) => {
                  const Icon = [Eye, Clock3, Users, ThumbsUp][i],
                    delta = i === 3 ? v[i] - prev[i] : (v[i] / prev[i] - 1) * 100;
                  const Arrow = delta >= 0 ? ArrowUpRight : ArrowDownRight;
                  return (
                    <button key={s} aria-pressed={metric === i} onClick={() => M(i)}>
                      <span>
                        <Icon size={16} />
                        {s}
                      </span>
                      <strong>
                        {i === 2 ? "+" : ""}
                        {i === 3 ? number(v[i], 1) + "%" : compact(v[i])}
                        {i === 1 ? " ч" : ""}
                      </strong>
                      {p.length > 0 && (
                        <small className={delta >= 0 ? "positive" : "negative"}>
                          <Arrow size={14} />
                          {number(Math.abs(delta), 1)}
                          {i === 3 ? " п. п." : "%"} <em>к прошлому периоду</em>
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="a-overview">
                <article className="a-panel">
                  <div className="chart-heading">
                    <div>
                      <small>ДИНАМИКА</small>
                      <h2>{metrics[metric]}</h2>
                    </div>
                    <BarChart3 size={18} />
                  </div>
                  <Plot
                    title={metrics[metric]}
                    labels={labels}
                    series={series}
                    previousDates={show ? p.map((d) => date(d.date)) : undefined}
                    unit={metric === 1 ? " ч" : metric === 3 ? "%" : ""}
                  />
                </article>
                <Realtime />
              </div>
            </>
          )}
          {tab === 1 && (
            <>
              <div className="a-pair">
                <article className="a-panel">
                  <h2>Воронка показов</h2>
                  <div className="funnel">
                    {[
                      "Показы значков",
                      "CTR значков",
                      "Просмотры из показов",
                      "Время из показов",
                    ].map((s, i) => (
                      <button
                        key={s}
                        aria-pressed={stage === i}
                        style={{ width: 100 - i * 7 + "%" }}
                        onClick={() => F(i)}
                      >
                        <span>{s}</span>
                        <b>{funnel[i]}</b>
                      </button>
                    ))}
                  </div>
                  <p>
                    {
                      [
                        "Сколько раз зрители увидели обложки ваших видео.",
                        "Доля показов, после которых зритель открыл видео.",
                        "Просмотры, начавшиеся с показа обложки.",
                        "Сколько часов смотрели видео после клика по обложке.",
                      ][stage]
                    }
                  </p>
                </article>
                <article className="a-panel">
                  <h2>Источники трафика</h2>
                  <Bars items={sources.map((s, i) => [s, (traffic[i] / v[0]) * 100])} />
                </article>
              </div>
              <article className="a-panel">
                <h2>Топ поисковых запросов</h2>
                <Table
                  head={["Запрос", "Просмотры из поиска"]}
                  items={[
                    "Алтай путешествие",
                    "Архитектура города",
                    "Как снимать кино",
                    "Макросъёмка",
                    "Дагестан маршрут",
                  ].map((s, i) => [
                    s,
                    number(Math.round(search * [0.26, 0.21, 0.18, 0.11, 0.07][i])),
                  ])}
                />
              </article>
            </>
          )}
          {tab === 2 && (
            <>
              <article className="a-panel">
                <small>СРЕДНЯЯ ПРОДОЛЖИТЕЛЬНОСТЬ</small>
                <h2>
                  {duration(avg)} <em>на просмотр</em>
                </h2>
                <Plot
                  title="Средняя продолжительность просмотра"
                  unit=" с"
                  labels={labels}
                  series={[
                    { label: "Средний просмотр", data: r.map((d) => d.seconds / d.views) },
                    ...(show
                      ? [
                          {
                            label: "Предыдущий период",
                            previous: true,
                            data: p.map((d) => d.seconds / d.views),
                          },
                        ]
                      : []),
                  ]}
                />
              </article>
              <article className="a-panel"><h2>Удержание по ходу видео</h2><p>Доля зрителей, продолжающих просмотр, от начала до конца ролика.</p><Plot title="Удержание аудитории" unit="%" labels={Array.from({length:11},(_,i)=>i*10+"% видео")} series={[{label:"Остались на видео",data:Array.from({length:11},(_,i)=>100*Math.exp(-i/(avg/19)))}]}/></article>
              <div className="a-pair">
                <article className="a-panel">
                  <h2>Эффективность элементов видео</h2>
                  <Table
                    head={["Элемент", "Показы", "CTR"]}
                    items={["Конечные заставки", "Подсказки"].map((s, i) => [
                      s,
                      number(Math.round(v[0] * (i ? 0.42 : 0.57))),
                      number((i ? 2.7 : 4.8) + skew * 40, 2) + "%",
                    ])}
                  />
                </article>
                <article className="a-panel">
                  <h2>Плейлисты по времени просмотра</h2>
                  <Table
                    head={["Плейлист", "Часы"]}
                    items={["Путевые заметки", "Короткий метр", "Практика съёмки"].map((s, i) => [
                      s,
                      number(v[1] * [0.32, 0.21, 0.14][i], 1),
                    ])}
                  />
                </article>
              </div>
            </>
          )}
          {tab === 3 && (
            <>
              <article className="a-panel">
                <h2>Новые и постоянные зрители</h2>
                <Plot
                  title="Зрители по дням"
                  labels={labels}
                  series={[
                    { label: "Новые", data: r.map((d) => d.newViewers) },
                    { label: "Постоянные", secondary: true, data: r.map((d) => d.returning) },
                  ]}
                />
              </article>
              <article className="a-panel">
                <h2>Когда ваши зрители онлайн</h2>
                <p>По местному времени · относительная активность</p>
                <div className="heat-scroll">
                  <div className="heat">
                    <span />
                    {Array.from({ length: 24 }, (_, h) => (
                      <small key={h}>{String(h).padStart(2, "0")}</small>
                    ))}
                    {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((s, d) => (
                      <HeatRow
                        key={s}
                        name={s}
                        day={d}
                        scale={r.length}
                        choose={H}
                        selected={heat}
                      />
                    ))}
                  </div>
                </div>
                <p>
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][heat[0]]},{" "}
                  {String(heat[1]).padStart(2, "0")}:00 · активность{" "}
                  {intensity(heat[0], heat[1], r.length)} из 5
                </p>
              </article>
              <div className="a-three">
                <article className="a-panel">
                  <h2>Возраст и пол</h2>
                  <Bars
                    items={[
                      ["18–24", 31+skew*100],
                      ["25–34", 38-skew*100],
                      ["35–44", 19],
                      ["45+", 12],
                    ]}
                  />
                  <hr />
                  <Bars
                    items={[
                      ["Мужчины", 54+skew*100],
                      ["Женщины", 43-skew*100],
                      ["Не указан", 3],
                    ]}
                  />
                </article>
                <article className="a-panel">
                  <h2>География</h2>
                  <Bars
                    items={[
                      ["🇷🇺 Россия", 64+skew*100],
                      ["🇰🇿 Казахстан", 14-skew*100],
                      ["🇧🇾 Беларусь", 10],
                      ["🇩🇪 Германия", 7],
                      ["🇦🇲 Армения", 5],
                    ]}
                  />
                </article>
                <article className="a-panel">
                  <h2>Устройства</h2>
                  <Bars
                    items={[
                      ["ПК", 62+skew*100],
                      ["Мобильные", 34-skew*100],
                      ["ТВ", 4],
                    ]}
                  />
                </article>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
function intensity(d: number, h: number, n: number) {
  return Math.max(
    1,
    Math.min(
      5,
      Math.round(
        2.3 +
          1.7 * Math.cos(((h - 20) * Math.PI) / 12) +
          (d > 4 ? 0.7 : 0) +
          0.5 * Math.sin(d + h + n),
      ),
    ),
  );
}
function HeatRow({
  name,
  day,
  scale,
  choose,
  selected,
}: {
  name: string;
  day: number;
  scale: number;
  choose: (x: number[]) => void;
  selected: number[];
}) {
  return (
    <>
      <b>{name}</b>
      {Array.from({ length: 24 }, (_, h) => {
        const val = intensity(day, h, scale);
        return (
          <button
            key={h}
            style={{ background: "rgba(16,185,129," + (0.07 + val * 0.17) + ")" }}
            aria-pressed={selected[0] === day && selected[1] === h}
            title={name + " " + h + ":00 · " + val + "/5"}
            aria-label={name + " " + h + " часов"}
            onClick={() => choose([day, h])}
          />
        );
      })}
    </>
  );
}
