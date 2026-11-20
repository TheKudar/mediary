export const metrics = [
  "Просмотры",
  "Время просмотра",
  "Подписчики",
  "Положительные оценки",
] as const;
export const periods = [
  [7, "Последние 7 дней"],
  [28, "Последние 28 дней"],
  [90, "90 дней"],
  [365, "365 дней"],
  [0, "За всё время"],
] as const;
export const sources = ["Рекомендованные видео", "Поиск по сайту", "Внешние переходы", "Плейлисты"];
export const titles = [
  "Дворец в вечернем свете",
  "Ботаника крупным планом",
  "За облаками: путешествие по Алтаю",
];
const day = 86400000;
const now = new Date();
const end = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
export const rows = Array.from({ length: 730 }, (_, i) => {
  const cycle = Math.sin(i * 1.83) + Math.cos(i * 0.59) * 0.8 + Math.sin(i * 0.17) * 1.1;
  const views = Math.round(1200 + i * 5.8 + cycle * 630);
  const impressions = Math.round(views * (7.8 + 0.8 * Math.sin(i * 0.11)));
  const from = Math.round(impressions * (0.078 + 0.006 * Math.cos(i * 0.05)));
  const seconds = views * Math.round(94 + cycle * 6 + i * 0.015);
  const positive = Math.round(views * (0.042 + cycle * 0.002)),
    negative = Math.round(positive * (0.017 + 0.004 * Math.sin(i)));
  const traffic = [
    0.52 + 0.045 * Math.sin(i * 0.05),
    0.24 + 0.025 * Math.cos(i * 0.08),
    0.14 + 0.017 * Math.sin(i * 0.13),
  ].map((x) => Math.round(x * views));
  traffic.push(views - traffic.reduce((a, b) => a + b));
  return {
    date: new Date(end - (729 - i) * day).toISOString().slice(0, 10),
    views,
    seconds,
    subs: Math.round(views * (0.012 + 0.002 * Math.cos(i * 0.2))),
    positive,
    negative,
    impressions,
    from,
    traffic,
    newViewers: Math.round(views * (0.48 + 0.06 * Math.cos(i * 0.09))),
    returning: Math.round(views * (0.29 + 0.04 * Math.sin(i * 0.2))),
  };
});
export type Row = (typeof rows)[number];
export const sum = (r: Row[], f: (d: Row) => number) => r.reduce((n, d) => n + f(d), 0);
export function values(r: Row[]) {
  const p = sum(r, (d) => d.positive),
    n = sum(r, (d) => d.negative);
  return [
    sum(r, (d) => d.views),
    sum(r, (d) => d.seconds) / 3600,
    sum(r, (d) => d.subs),
    (100 * p) / (p + n || 1),
  ];
}
export function windowData(n: number) {
  return { current: n ? rows.slice(-n) : rows, previous: n ? rows.slice(-2 * n, -n) : [] };
}
export const number = (v: number, d = 0) => v.toLocaleString("ru-RU", { maximumFractionDigits: d });
export const compact = (v: number) =>
  new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(v);
export const date = (s: string) =>
  new Date(s + "T12:00:00Z").toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
export const duration = (n: number) =>
  Math.floor(n / 60) + ":" + String(Math.floor(n % 60)).padStart(2, "0");
