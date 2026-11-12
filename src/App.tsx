import {CreateDialog,CreateButton,EmptyShelf,type CreateKind} from "./LibraryControls";
import { DropZone, Metadata, CardTools } from "./StudioFields";
import { inspectVideo, imageCover, parseChapters, type Chapter } from "./videoDetails";
import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Activity,
  Airplay,
  BarChart3,
  Bell,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Eye,
  FileText,
  Folder,
  FolderPlus,
  Globe2,
  Grid2X2,
  HardDrive,
  Heart,
  History,
  Home,
  Languages,
  Library,
  List,
  Lock,
  Menu,
  MessageCircle,
  Mic2,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  PlaySquare,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Video,
  Volume2,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

type Page =
  | "channel"
  | "home"
  | "recommended"
  | "subscriptions"
  | "history"
  | "library"
  | "collections"
  | "playlists"
  | "live"
  | "analytics"
  | "settings"
  | "player"
  | "upload"
  | "ai"
  | "search"
  | "profile";

type VideoItem = {
  source?: string;
  id: number;
  title: string;
  author: string;
  views: string;
  date: string;
  duration: string;
  image: string;
  category: string;
  progress?: number;
  privacy?: "Публичное" | "Приватное" | "По приглашению";
  size?: string;
};

const photos = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1604068029337-deb9bb324426?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1781707327958-463557e9a619?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1753958510003-c8fef43ac998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1782925343826-26c1f5e4009e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1759086434721-2e3d1c935280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1776391853674-92d8ee2369b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1766021736652-f6593f02cc7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200",
];

const videos: VideoItem[] = [
  ...(
    [
      [91, "Дворец в вечернем свете", "Архитектура", "palace"],
      [92, "Ботаника крупным планом", "Природа", "petals"],
    ] as const
  ).map(([id, title, category, slug]) => ({
    id,
    title,
    category,
    author: "Mediary Studio",
    date: "Фотоэтюд",
    views: "Коллекция студии",
    duration: "0:09",
    image: "./catalog/" + slug + ".jpg",
    source: "./catalog/" + slug + ".mp4",
  })),

  {
    id: 1,
    title: "За облаками: путешествие по Алтаю",
    author: "Максим Ветров",
    views: "1,2 млн просмотров",
    date: "3 дня назад",
    duration: "18:24",
    image: photos[0],
    category: "Путешествия",
    progress: 36,
    privacy: "Публичное",
    size: "2,4 ГБ",
  },
  {
    id: 2,
    title: "Как снимать кино на обычную камеру",
    author: "Кадр за кадром",
    views: "842 тыс. просмотров",
    date: "неделю назад",
    duration: "24:08",
    image: photos[1],
    category: "Обучение",
    privacy: "Публичное",
    size: "4,1 ГБ",
  },
  {
    id: 3,
    title: "Тишина гор: короткий фильм",
    author: "Северная студия",
    views: "486 тыс. просмотров",
    date: "2 дня назад",
    duration: "12:40",
    image: photos[2],
    category: "Кино",
    progress: 72,
    privacy: "Приватное",
    size: "1,8 ГБ",
  },
  {
    id: 4,
    title: "Дорога в Дагестан. Большой выпуск",
    author: "Путь открыт",
    views: "2,1 млн просмотров",
    date: "месяц назад",
    duration: "38:12",
    image: photos[3],
    category: "Путешествия",
    privacy: "По приглашению",
    size: "6,2 ГБ",
  },
  {
    id: 5,
    title: "Архитектура ночного города",
    author: "Город говорит",
    views: "321 тыс. просмотров",
    date: "вчера",
    duration: "09:16",
    image: photos[4],
    category: "Документальное",
    privacy: "Публичное",
    size: "920 МБ",
  },
  {
    id: 6,
    title: "Свет в большом городе: практикум",
    author: "Ирина Левина",
    views: "128 тыс. просмотров",
    date: "5 дней назад",
    duration: "16:45",
    image: photos[5],
    category: "Творчество",
    privacy: "Приватное",
    size: "1,3 ГБ",
  },
  {
    id: 7,
    title: "Рабочее пространство без отвлечений",
    author: "Точка фокуса",
    views: "95 тыс. просмотров",
    date: "8 часов назад",
    duration: "11:02",
    image: photos[6],
    category: "Технологии",
    privacy: "Публичное",
    size: "780 МБ",
  },
  {
    id: 8,
    title: "Команда будущего: люди и технологии",
    author: "Новый контекст",
    views: "670 тыс. просмотров",
    date: "4 дня назад",
    duration: "21:30",
    image: photos[7],
    category: "Технологии",
    privacy: "Публичное",
    size: "2,9 ГБ",
  },
];

const navTop: [Page, string, ComponentType<{ size?: number; strokeWidth?: number }>][] = [
  ["home", "Главная", Home],
  ["recommended", "Для вас", Sparkles],
  ["subscriptions", "Подписки", Users],
  ["history", "История просмотров", History],
];
const navLibrary: [Page, string, ComponentType<{ size?: number; strokeWidth?: number }>][] = [
  ["library", "Видеотека", Library],
  ["collections", "Коллекции", Folder],
  ["playlists", "Плейлисты", PlaySquare],
];
const navBottom: [Page, string, ComponentType<{ size?: number; strokeWidth?: number }>][] = [
  ["live", "Прямые эфиры", Radio],
  ["analytics", "Студия автора", BarChart3],
  ["settings", "Настройки", Settings],
];

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-[var(--text)] text-[var(--bg)] hover:opacity-85 ",
    secondary:
      "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-3)]",
    ghost: "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
    danger: "bg-red-500/12 text-red-400 hover:bg-red-500/20",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "violet" | "green" | "orange";
}) {
  const tones = {
    neutral: "bg-[var(--surface-3)] text-[var(--muted)]",
    violet: "bg-[var(--surface-2)] text-[var(--text)]",
    green: "bg-emerald-500/15 text-emerald-400",
    orange: "bg-orange-500/15 text-orange-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Header({
  onNavigate,
  query,
  setQuery,
  theme,
  toggleTheme,
  avatar,
  initials,
  notices,
  notificationsOpen,
  setNotificationsOpen,
  menuOpen,
  setMenuOpen,
}: {
  onNavigate: (p: Page) => void;
  query: string;
  setQuery: (v: string) => void;
  theme: string;
  toggleTheme: () => void;
  initials: string;
  avatar?: string;
  notices: string[];
  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[72px] items-center border-b border-[var(--border)] bg-[color:var(--header)] px-4  md:px-6">
      <div className="flex md:w-[240px] shrink-0 items-center gap-3">
        <button
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setMenuOpen(!menuOpen)}
          className="icon-btn lg:hidden"
        >
          <Menu size={20} />
        </button>
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5">
          <span className="brand-mark grid h-9 w-9 place-items-center rounded-xl bg-[var(--text)] text-[var(--bg)] ">
            <Play size={17} fill="currentColor" />
          </span>
          <span className="text-[25px] font-semibold tracking-[-.06em]">Mediary</span>
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNavigate("search");
        }}
        className="mx-auto hidden w-full max-w-[620px] md:block"
      >
        <div className="flex h-11 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 transition focus-within:border-[var(--muted)]  ">
          <button type="submit" className="action-glyph" aria-label="Поиск" title="Поиск">
            <Search size={19} aria-hidden="true" />
          </button>
          <input
            aria-label="Поисковый запрос"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
            placeholder="Поиск видео, авторов и фраз из транскрипций"
          />
        </div>
      </form>
      <div className="ml-auto flex w-auto items-center justify-end gap-1.5 lg:w-[300px]">
        <Button onClick={() => onNavigate("upload")} className="hidden sm:inline-flex">
          <Upload size={17} />
          Загрузить
        </Button>
        <button
          className="action-glyph mobile-lookup"
          aria-label="Поиск"
          title="Поиск"
          onClick={() => onNavigate("search")}
        >
          <Search size={20} aria-hidden="true" />
        </button>
        <button
          className="action-glyph ai-glyph"
          aria-label="ИИ-анализ"
          title="ИИ-анализ"
          onClick={() => onNavigate("ai")}
        >
          <Sparkles size={20} aria-hidden="true" />
        </button>
        <button aria-label="Сменить тему" onClick={toggleTheme} className="icon-btn">
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <div className="relative">
          <button
            aria-label="Уведомления"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="icon-btn relative"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--muted)] ring-2 ring-[var(--header)]" />
          </button>
          {notificationsOpen && (
            <div className="notice-box">
              <strong>Уведомления</strong>
              {notices.length ? (
                notices.map((n, i) => <p key={i}>{n}</p>)
              ) : (
                <p>Новых уведомлений нет</p>
              )}
            </div>
          )}
        </div>
        <button
          aria-label="Личный кабинет"
          title="Личный кабинет"
          onClick={() => onNavigate("profile")}
          className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-3)] text-xs font-bold text-white "
        >
          {avatar ? <img className="channel-mini" src={avatar} alt="" /> : initials}
        </button>
      </div>
    </header>
  );
}

function Notifications({ onClose }: { onClose: () => void }) {
  const items = [
    ["Видео обработано", "«Архитектура ночного города» готово к публикации", "2 мин"],
    ["Новый комментарий", "Мария ответила на ваш комментарий", "18 мин"],
    ["Субтитры готовы", "ИИ создал русские и английские субтитры", "1 ч"],
  ];
  return (
    <div className="absolute right-0 top-12 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] ">
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <h3 className="font-semibold">Уведомления</h3>
        <button onClick={onClose} className="text-xs text-[var(--text)]">
          Отметить прочитанными
        </button>
      </div>
      <div>
        {items.map((item, i) => (
          <div
            key={item[0]}
            className="flex gap-3 border-b border-[var(--border)] p-4 last:border-0 hover:bg-[var(--surface-2)]"
          >
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i < 2 ? "bg-[var(--muted)]" : "bg-transparent"}`}
            />
            <div>
              <p className="text-sm font-semibold">{item[0]}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{item[1]}</p>
              <p className="mt-1.5 text-[11px] text-[var(--muted)]">{item[2]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sidebar({
  page,
  onNavigate,
  open,
  close,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  open: boolean;
  close: () => void;
}) {
  const section = (items: typeof navTop) =>
    items.map(([id, label, Icon]) => (
      <button
        key={id}
        onClick={() => {
          onNavigate(id);
          close();
        }}
        className={`sidebar-link ${page === id ? "active" : ""}`}
      >
        <Icon size={19} strokeWidth={page === id ? 2.3 : 1.8} />
        <span>{label}</span>
        {id === "live" && <span className="ml-auto h-2 w-2 rounded-full bg-[var(--accent)]" />}
      </button>
    ));
  return (
    <>
      {open && (
        <button
          onClick={close}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Закрыть меню"
        />
      )}
      <aside
        className={`fixed bottom-0 left-0 top-[72px] z-40 flex w-[248px] flex-col border-r border-[var(--border)] bg-[var(--bg)] p-3 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <nav className="space-y-1">{section(navTop)}</nav>
        <div className="my-3 border-t border-[var(--border)]" />
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
          Личное
        </p>
        <nav className="space-y-1">{section(navLibrary)}</nav>
        <div className="my-3 border-t border-[var(--border)]" />
        <nav className="space-y-1">{section(navBottom)}</nav>
      </aside>
    </>
  );
}

function DurationBadge({ video }: { video: VideoItem }) {
  const clip = video as Clip;
  const [measured, setMeasured] = useState<number>();
  useEffect(() => {
    setMeasured(undefined);
    if (!clip.local || clip.seconds || /^\d+:\d{2}$/.test(clip.duration)) return;
    let active = true,
      url = "";
    const v = document.createElement("video");
    v.preload = "metadata";
    mediaFile(clip.id)
      .then((blob) => {
        if (!blob || !active) return;
        url = URL.createObjectURL(blob);
        v.onloadedmetadata = () => {
          if (active && Number.isFinite(v.duration)) setMeasured(v.duration);
        };
        v.src = url;
      })
      .catch(() => {});
    return () => {
      active = false;
      v.onloadedmetadata = null;
      v.removeAttribute("src");
      v.load();
      if (url) URL.revokeObjectURL(url);
    };
  }, [clip.id, clip.local, clip.seconds, clip.duration]);
  const seconds = clip.local ? clip.seconds || measured : 9;
  const value = seconds === undefined ? clip.duration : clock(seconds);
  return /^\d{1,}:\d{2}(:\d{2})?$/.test(value) ? (
    <span className="duration-badge" aria-label={"Длительность " + value}>
      {value}
    </span>
  ) : null;
}
function VideoCard({
  video,
  onOpen,
  selected = false,
  onSelect,
  compact = false,
}: {
  video: VideoItem;
  onOpen: () => void;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`group min-w-0 ${selected ? "rounded-2xl ring-2 ring-[var(--text)] ring-offset-4 ring-offset-[var(--bg)]" : ""}`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-[var(--surface-2)] ${compact ? "aspect-[16/9]" : "aspect-video"}`}
      >
        <img
          src={video.image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />

        {onSelect && (
          <button
            aria-label="Выбрать видео"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-lg border transition ${selected ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]" : "border-white/50 bg-black/35 text-transparent opacity-0  group-hover:opacity-100"}`}
          >
            <Check size={14} />
          </button>
        )}
        <button
          onClick={onOpen}
          aria-label={`Открыть: ${video.title}`}
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid h-12 w-12 scale-90 place-items-center rounded-full bg-white/90 text-black opacity-0  transition group-hover:scale-100 group-hover:opacity-100">
            <Play size={18} fill="currentColor" />
          </span>
        </button>
        <DurationBadge video={video} />
        {video.progress && (
          <div className="clip-progress absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div style={{ width: `${video.progress}%` }} className="h-full bg-[var(--accent)]" />
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2.5">
        {!compact && (
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--surface-3)] text-[10px] font-bold text-[var(--text)]">
            {video.author
              .split(" ")
              .map((x) => x[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3
            onClick={onOpen}
            className="line-clamp-2 cursor-pointer text-[14px] font-semibold leading-[1.35] tracking-[-.01em]"
          >
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">{video.author}</p>
          <p className="film-meta mt-0.5 truncate text-[11px] text-[var(--muted)]">
            {video.views} · {video.date}
          </p>
        </div>
      </div>
    </article>
  );
}

function PageTitle({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-head mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--text)]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-[-.035em] sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

function HomePage({
  videos,
  openVideo,
  navigate,
}: {
  videos: Clip[];
  openVideo: (v: VideoItem) => void;
  navigate: (p: Page) => void;
}) {
  const [category, setCategory] = useState("Все");
  const [slide, setSlide] = useState(0);
  const hero = videos[slide % videos.length];
  if (!hero) return <p>Публичных видео пока нет</p>;
  const cats = ["Все", ...new Set(videos.map((v) => v.category))];
  const shown = category === "Все" ? videos : videos.filter((v) => v.category === category);
  return (
    <div>
      <section className="editorial-feature">
        <div className="feature-copy">
          <div className="feature-kicker">
            <span>Выбор редакции</span>
            <span>
              {String((slide % videos.length) + 1).padStart(2, "0")} /{" "}
              {String(videos.length).padStart(2, "0")}
            </span>
          </div>
          <h1>{hero.title}</h1>
          <p className="feature-credit">
            {hero.author} <span>/</span> {hero.category}
          </p>
          <div className="feature-actions">
            <Button onClick={() => openVideo(hero)}>
              <Play size={14} fill="currentColor" />
              Смотреть
            </Button>
            <div>
              <button
                className="hero-arrow"
                aria-label="Предыдущий ролик"
                onClick={() => setSlide(slide + videos.length - 1)}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="hero-arrow"
                aria-label="Следующий ролик"
                onClick={() => setSlide(slide + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
        <button
          className="feature-image"
          onClick={() => openVideo(hero)}
          aria-label={"Смотреть: " + hero.title}
        >
          <img src={hero.image} alt="" />
          <DurationBadge video={hero} />
        </button>
      </section>
      <div className="category-strip scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-1">
        {cats.map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${category === c ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <section>
        <div className="section-rule mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-[-.025em]">Рекомендуем вам</h2>
          </div>
          <button
            onClick={() => navigate("recommended")}
            className="text-sm font-semibold text-[var(--text)] hover:text-[var(--text)]"
          >
            Смотреть все
          </button>
        </div>
        <div className="home-video-grid grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shown.slice(0, 8).map((v) => (
            <VideoCard key={v.id} video={v} onOpen={() => openVideo(v)} />
          ))}
        </div>
      </section>
      <section className="mt-11">
        <div className="section-rule mb-5 flex items-center gap-2">
          <h2 className="text-xl font-bold">Сейчас в тренде</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.slice(4, 7).map((v, i) => (
            <button
              key={v.id}
              onClick={() => openVideo(v)}
              className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--muted)]"
            >
              <span className="w-7 text-center text-xl font-bold text-[var(--muted)]">
                0{i + 1}
              </span>
              <span className="thumb-wrap trend-thumb">
                <img src={v.image} alt="" />
                <DurationBadge video={v} />
              </span>
              <span className="min-w-0">
                <strong className="line-clamp-2 text-sm">{v.title}</strong>
                <span className="film-meta mt-1 block text-[11px] text-[var(--muted)]">
                  {v.views}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

type Clip = VideoItem & {
  chapters?: Chapter[];
  seconds?: number;
  coverMode?: "auto" | "custom";
  owner: string;
  tags: string[];
  invites: string[];
  folder: string;
  local?: boolean;
};
type Account = {
  interests?: string[];
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
};
type Group = {
  description?: string;
  visibility?: string;
  id: string;
  name: string;
  items: number[];
  kind: string;
  owner: string;
};
type Visit = { user: string; id: number; time: number; duration: number; date: number };
type Note = { authorId?: string; key?: string; user: string; text: string; id: number };
type ChannelPost = { id: string; owner: string; text: string; date: number };
type Model = {
  studioCatalog?: boolean;
  posts: ChannelPost[];
  branding: Record<string, { avatar?: string; banner?: string }>;
  accounts: Account[];
  clips: Clip[];
  groups: Group[];
  folders: Record<string, string[]>;
  saved: string[];
  dislikes: string[];
  likes: string[];
  follows: string[];
  comments: Note[];
  visits: Visit[];
  jobs: Record<number, string>;
  notices: Record<string, string[]>;
  chat: string[];
};
const interestOptions = [
  "Игры",
  "Природа",
  "Путешествия",
  "Спорт",
  "Музыка",
  "Кино",
  "Технологии",
  "Наука",
  "Обучение",
  "Творчество",
  "Кулинария",
];
function InterestFields({ selected = [] }: { selected?: string[] }) {
  return (
    <fieldset className="topics">
      <legend>Что вам интересно?</legend>
      {interestOptions.map((t) => (
        <label key={t}>
          <input type="checkbox" name="interests" value={t} defaultChecked={selected.includes(t)} />
          {t}
        </label>
      ))}
    </fieldset>
  );
}
function rankVideos(candidates: Clip[], history: Clip[], interests: string[]) {
  const weights = new Map<string, number>();
  const topics = (v: Clip) =>
    new Set(
      [v.category, ...v.tags, ...(!v.local && [1, 3, 4].includes(v.id) ? ["Природа"] : [])].map(
        (x) => x.trim().toLocaleLowerCase(),
      ),
    );
  for (const t of interests) weights.set(t.toLocaleLowerCase(), 5);
  for (const v of history) for (const t of topics(v)) weights.set(t, (weights.get(t) || 0) + 1);
  const score = (v: Clip) => Array.from(topics(v)).reduce((a, t) => a + (weights.get(t) || 0), 0);
  return [...candidates].sort((a, b) => score(b) - score(a));
}
const demo = "demo";
const seed: Model = {
  studioCatalog: true,
  posts: [],
  branding: {},
  accounts: [],
  clips: videos.map((v) => ({
    ...v,
    owner: v.id <= 2 ? demo : v.author,
    privacy: "Публичное",
    tags: [v.category],
    folder: "",
    invites: [],
  })),
  groups: [],
  folders: {},
  saved: [],
  dislikes: [],
  likes: [],
  follows: [],
  comments: [],
  visits: [],
  jobs: {},
  notices: {},
  chat: [],
};
function initialModel(): Model {
  try {
    const saved = localStorage.getItem("mediary.studio.1");
    if (saved) {
      const old = JSON.parse(saved);
      return {
        ...seed,
        ...old,
        clips: [
          ...seed.clips.filter(
            (c) => c.source && !old.clips.some((v: Clip) => v.id === c.id) && !old.studioCatalog,
          ),
          ...old.clips.filter((v:Clip)=>v.local||v.id!==93),
        ],
        groups:(old.groups as Group[]).map(g=>({...g,items:g.items.filter(id=>id!==93)})),
        studioCatalog: true,
        saved: old.saved ?? [
          ...new Set(
            (old.groups as Group[]).flatMap((g) => g.items.map((id) => g.owner + ":" + id)),
          ),
        ],
      };
    }
    const old = JSON.parse(localStorage.getItem("mediary.collections.v1") || "[]") as Group[];
    return { ...seed, groups: old.map((c) => ({ ...c, owner: demo, kind: "collections" })) };
  } catch {
    return seed;
  }
}
function filesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("mediary.files", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("files");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function mediaFile(id: number, file?: File): Promise<Blob | undefined> {
  const db = await filesDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("files", file ? "readwrite" : "readonly");
      const store = tx.objectStore("files");
      const req = file ? store.put(file, id) : store.get(id);
      tx.oncomplete = () => resolve(file || req.result);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
async function passwordHash(password: string, salt: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bytes = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 120000, hash: "SHA-256" },
    key,
    256,
  );
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}
const phrases = [
  ["Добро пожаловать в Mediary.", "Welcome to Mediary."],
  ["Откройте свою видеотеку.", "Open your video library."],
  ["Сохраните любимые моменты.", "Save your favourite moments."],
];
function subtitles(lang: number, srt = false) {
  return (
    (srt ? "" : "WEBVTT\n\n") +
    phrases
      .map((p, i) => {
        const sep = srt ? "," : ".";
        return (
          i +
          1 +
          "\n00:00:0" +
          i * 3 +
          sep +
          "000 --> 00:00:0" +
          (i + 1) * 3 +
          sep +
          "000\n" +
          p[lang] +
          "\n"
        );
      })
      .join("\n")
  );
}
const clock = (n: number) => Math.floor(n / 60) + ":" + String(Math.floor(n % 60)).padStart(2, "0");
function Media({
  clip,
  start,
  onProgress,
  ready,
}: {
  clip: Clip;
  start: number;
  onProgress: (time: number, duration: number) => void;
  ready: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState("-1");
  useEffect(() => {
    let alive = true,
      url = "";
    if (clip.local)
      mediaFile(clip.id)
        .then((blob) => {
          if (alive && blob) {
            url = URL.createObjectURL(blob);
            setSrc(url);
          } else if (alive) setError("Файл не найден в этом браузере");
        })
        .catch(() => setError("Не удалось открыть файл"));
    else setSrc(clip.source || "./mediary-demo.mp4");
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [clip.id]);
  useEffect(() => {
    const v = ref.current;
    if (!v || !ready) return;
    const tracks = [0, 1].map((i) => {
      const t = document.createElement("track");
      t.kind = "subtitles";
      t.label = i ? "English" : "Русский";
      t.srclang = i ? "en" : "ru";
      t.src = URL.createObjectURL(new Blob([subtitles(i)], { type: "text/vtt" }));
      v.append(t);
      t.track.mode = String(i) === lang ? "showing" : "disabled";
      return t;
    });
    return () =>
      tracks.forEach((t) => {
        URL.revokeObjectURL(t.src);
        t.remove();
      });
  }, [lang, ready, src]);
  return (
    <>
      <video
        poster={clip.image}
        ref={ref}
        controls
        src={src || undefined}
        className="studio-player"
        onError={() => setError("Браузер не смог воспроизвести файл")}
        onLoadedMetadata={(e) => {
          e.currentTarget.currentTime = start;
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (Number.isFinite(v.duration)) onProgress(v.currentTime, v.duration);
        }}
      />
      {!!clip.chapters?.length && (
        <section aria-label="Главы видео">
          <h2>Главы видео</h2>
          <div className="tools">
            {clip.chapters.map((c) => (
              <button
                key={c.time}
                onClick={() => {
                  if (ref.current) ref.current.currentTime = c.time;
                }}
              >
                {clock(c.time)} · {c.title}
              </button>
            ))}
          </div>
        </section>
      )}
      {error && <p role="alert">{error}</p>}
      {ready && (
        <details open>
          <summary>Демонстрационные субтитры и расшифровка</summary>
          <select
            aria-label="Язык субтитров"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="-1">Субтитры выключены</option>
            <option value="0">Русский</option>
            <option value="1">English</option>
          </select>
          {phrases.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                if (ref.current) ref.current.currentTime = i * 3;
              }}
            >
              {clock(i * 3)} · {p[lang === "1" ? 1 : 0]}
            </button>
          ))}
        </details>
      )}
    </>
  );
}
export default function App() {
  const [m, setM] = useState(initialModel);
  const [user, setUser] = useState(() => sessionStorage.getItem("mediary.user") || demo);
  const account = m.accounts.find((a) => a.id === user);
  const name = account?.name || (user === demo ? "Демоавтор" : "Гость");
  const [page, setPage] = useState<Page>("home"),
    [theme, setTheme] = useState(() =>
      localStorage.getItem("mediary.theme") === "light" ? "light" : "dark",
    ),
    [cardSize, setCardSize] = useState(() =>
      localStorage.getItem("mediary.cards") === "compact" ? "compact" : "normal",
    ),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false),
    [bell, setBell] = useState(false),
    [msg, setMsg] = useState("");
  const [id, setId] = useState(1),
    [start, setStart] = useState(0),
    [group, setGroup] = useState(""),
    [folder, setFolder] = useState(""),
    [category, setCategory] = useState(""),
    [tag, setTag] = useState(""),
    [auth, setAuth] = useState("login"),
    [period, setPeriod] = useState(7),
    [analysisId, setAnalysisId] = useState(1),
    [statsId, setStatsId] = useState(0),
    [list, setList] = useState(false);
  const [step, setStep] = useState(1),
    [savedTab, setSavedTab] = useState(false),
    [aiTab, setAiTab] = useState("Расшифровка");
  const [edit, setEdit] = useState<Clip | null>(null),
    [remove, setRemove] = useState<Clip | null>(null),
    [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [busy, setBusy] = useState(false),
    [privacy, setPrivacy] = useState("Приватное"),
    [live, setLive] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem("mediary.studio.1", JSON.stringify(m));
    } catch {
      setMsg("Недостаточно места для сохранения изменений");
    }
  }, [m]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("mediary.theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.cards = cardSize;
    try {
      localStorage.setItem("mediary.cards", cardSize);
    } catch {}
  }, [cardSize]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3500);
    return () => clearTimeout(t);
  }, [msg]);
  const navigate = (p: Page) => {
    if(p==="analytics"){location.hash="studio";return}
    setPage(p);
    setStep(1);
    setSavedTab(false);
    setPrivacy("Приватное");
    setMenu(false);
    setBell(false);
    setGroup("");setPickVideo(false);
    setFolder("");
    setEdit(null);
    setFile(null);
    setLive(false);
    window.scrollTo(0, 0);
  };
  const session = (u: string) => {
    setUser(u);
    sessionStorage.setItem("mediary.user", u);
    navigate("profile");
  };
  const visible = m.clips.filter(
    (v) => v.privacy === "Публичное" || v.owner === user || v.invites.includes(user),
  );
  const clip = visible.find((v) => v.id === id);
  const own = visible.filter((v) => v.owner === user);
  const groups = m.groups.filter((g) => g.owner === user);
  const folders = m.folders[user] || [];
  const open = (v: VideoItem, time = 0) => {
    setId(v.id);
    setStart(time);
    navigate("player");
    setM((s) => ({
      ...s,
      visits: [...s.visits, { id: v.id, user, time, duration: 0, date: Date.now() }],
    }));
  };
  const changeClip = (updated: Clip) =>
    setM((s) => ({ ...s, clips: s.clips.map((v) => (v.id === updated.id ? updated : v)) }));
  const updateGroup = (g: Group) =>
    setM((s) => ({ ...s, groups: s.groups.map((x) => (x.id === g.id ? g : x)) }));
  const toggle = (key: "saved" | "follows", value: string) =>
    setM((s) => ({
      ...s,
      [key]: s[key].includes(value) ? s[key].filter((x) => x !== value) : [...s[key], value],
    }));
  const groupsSelect = (v: Clip) => (
    <select
      aria-label="Добавить в подборку"
      value=""
      onChange={(e) => {
        const g = groups.find((g) => g.id === e.target.value);
        if (g) {
          updateGroup({ ...g, items: [...new Set([...g.items, v.id])] });
          setMsg("Сохранено в «" + g.name + "»");
        } else navigate("collections");
      }}
    >
      <option value="" disabled>
        Добавить в подборку
      </option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
      <option value="+">Создать подборку…</option>
    </select>
  );
  const savedIds = new Set(
    visible.filter((v) => m.saved.includes(user + ":" + v.id)).map((v) => v.id),
  );
  function reactTo(key: "likes" | "dislikes") {
    const pair = user + ":" + id,
      opposite = key === "likes" ? "dislikes" : "likes";
    setM((s) => ({
      ...s,
      [key]: s[key].includes(pair) ? s[key].filter((v) => v !== pair) : [...s[key], pair],
      [opposite]: s[opposite].filter((v) => v !== pair),
    }));
  }
  const grid = (items: Clip[]) =>
    items.length ? (
      <div className={list ? "studio-list" : "studio-grid"}>
        {items.map((v) => (
          <VideoCard key={v.id} video={v} onOpen={() => open(v)} />
        ))}
      </div>
    ) : (
      <p className="empty">Здесь пока нет видео</p>
    );
  const authForm = (
    <form
      key={auth}
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget),
          email = String(f.get("email")).trim().toLowerCase(),
          pw = String(f.get("password"));
        const a = m.accounts.find((a) => a.email === email);
        try {
          if (auth === "register") {
            if (a) {
              setMsg("Эта почта уже зарегистрирована");
              return;
            }
            const salt = crypto.randomUUID(),
              id = crypto.randomUUID(),
              hash = await passwordHash(pw, salt);
            setM((s) => ({
              ...s,
              accounts: [
                ...s.accounts,
                {
                  id,
                  salt,
                  hash,
                  email,
                  interests: f.getAll("interests").map(String),
                  name: String(f.get("name")).trim(),
                },
              ],
            }));
            session(id);
          } else if (a && (await passwordHash(pw, a.salt)) === a.hash) session(a.id);
          else setMsg("Проверьте почту и пароль");
        } catch {
          setMsg("Не удалось открыть локальный аккаунт");
        }
      }}
    >
      <h2>{auth === "login" ? "Вход" : "Регистрация"}</h2>
      {auth === "register" && (
        <label>
          Имя
          <input name="name" required />
        </label>
      )}
      {auth === "register" && <InterestFields />}
      <label>
        Почта
        <input name="email" type="email" required />
      </label>
      <label>
        Пароль
        <input name="password" type="password" minLength={8} required />
      </label>
      <button className="primary">{auth === "login" ? "Войти" : "Зарегистрироваться"}</button>
      <button type="button" onClick={() => setAuth(auth === "login" ? "register" : "login")}>
        {auth === "login" ? "Создать аккаунт" : "Уже есть аккаунт"}
      </button>
    </form>
  );
  const [custom, setCustom] = useState<string | null>(null),
    [frame, setFrame] = useState(""),
    [seconds, setSeconds] = useState(0),
    [detailError, setDetailError] = useState(""),
    [readingImage, setReadingImage] = useState(false);
  const imgVersion = useRef(0);
  useEffect(() => {
    setCustom(edit && edit.coverMode !== "auto" ? edit.image : null);
    setDetailError("");
    setReadingImage(false);
    imgVersion.current++;
    return () => {
      imgVersion.current++;
    };
  }, [page, edit]);
  useEffect(() => {
    let active = true,
      url = "";
    setFrame("");
    setFrames([]);
    setSeconds(edit?.seconds || 0);
    if (page === "upload" && (file || edit)) {
      (async () => {
        const blob = file || (edit?.local ? await mediaFile(edit.id) : undefined);
        if (!active) return;
        if (!blob && edit?.local) throw Error();
        url = blob ? URL.createObjectURL(blob) : "";
        const details = await inspectVideo(url || edit?.source || "./mediary-demo.mp4");
        if (active) {
          if(file&&(Math.max(details.width,details.height)>4096||Math.min(details.width,details.height)>2160)){setFile(null);setDetailError("Максимальное разрешение видео — 4K.");return}
          setFrame(edit?.coverMode === "auto" ? edit.image : details.image);
          setSeconds(details.seconds);
          setFrames(details.frames);
        }
      })().catch(() => {
        if (active) setDetailError("Не удалось извлечь кадр. Можно выбрать свою обложку.");
      });
    }
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, edit, page]);
  const [frames, setFrames] = useState<string[]>([]);
  const upload = (
    <form
      className="publish-form"
      key={edit?.id || "new"}
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        if (!edit && !file) {
          setDetailError("Выберите видео для загрузки.");
          setStep(1);
          return;
        }
        let chapters: Chapter[];
        try {
          chapters = parseChapters(
            String(new FormData(e.currentTarget).get("chapters") || ""),
            seconds,
          );
        } catch (err) {
          setDetailError((err as Error).message);
          setStep(1);
          return;
        }
        if(file&&!seconds){setDetailError("Дождитесь чтения видео или выберите файл в поддерживаемом формате.");return}
        if (!custom && !frame) {
          setDetailError("Дождитесь кадра или выберите изображение.");
          setStep(1);
          return;
        }
        setDetailError("");
        if (!edit && step < 3) {
          setStep(step + 1);
          return;
        }
        const f = new FormData(e.currentTarget);
        const title = String(f.get("title")).trim();
        if (!title || (!file && !edit)) return;
        setBusy(true);
        try {
          const key = edit?.id || Date.now();
          if (file) await mediaFile(key, file);
          const v: Clip = {
            ...(edit || {
              id: key,
              author: name,
              owner: user,
              image: photos[4],
              views: "0 просмотров",
              date: "Сегодня",
              duration: "Видео",
              folder: "",
              local: true,
            }),
            title,
            image: custom || frame,
            coverMode: custom ? "custom" : "auto",
            seconds,
            chapters,
            duration: seconds ? clock(seconds) : edit?.duration || "Видео",
            category: String(f.get("category")),
            tags: String(f.get("tags"))
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
            privacy: privacy as Clip["privacy"],
            invites: privacy === "По приглашению" ? f.getAll("invites").map(String) : [],
          };
          if (edit) changeClip(v);
          else setM((s) => ({ ...s, clips: [v, ...s.clips] }));
          navigate("library");
          setMsg("Видео сохранено");
        } catch {
          setMsg("Файл не сохранён. Проверьте свободное место");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>{edit ? "Редактирование видео" : "Загрузить видео"}</h2>
      {!edit && (
        <div className="publish-steps">
          <progress aria-label="Этап загрузки" max={3} value={step} />
          <div>
            {["Файл и описание", "Доступ", "Проверка"].map((x, i) => (
              <span key={x} aria-current={step === i + 1 ? "step" : undefined}>
                {i + 1}. {x}
              </span>
            ))}
          </div>
        </div>
      )}
      <div hidden={!edit && step !== 1}>
        {!edit && (
          <DropZone
            accept="video/*"
            label={file?.name || "Перетащите видео сюда"}
            detail={file ? (file.size / 1048576).toFixed(1) + " МБ" : "Видео до 4K · до 10 ГБ"}
            button="Обзор"
            onFile={(f) => {
              if (
                f.size > 10_000_000_000 ||
                (!f.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v)$/i.test(f.name))
              ) {
                setDetailError("Выберите видео размером до 10 ГБ.");
                return;
              }
              setDetailError("");
              setFile(f);
            }}
          />
        )}
        <fieldset className="frame-pick">
          <legend>Обложка видео</legend>
          {frames.length > 0 && (
            <div className="frame-strip">
              {frames.map((image, i) => (
                <button
                  type="button"
                  key={i}
                  aria-label={"Выбрать кадр " + (i + 1)}
                  aria-pressed={!custom && frame === image}
                  onClick={() => {
                    imgVersion.current++;
                    setReadingImage(false);
                    setFrame(image);
                    setCustom(null);
                  }}
                >
                  <img src={image} alt="" />
                  <span>{clock(seconds * [0.14, 0.5, 0.84][i])}</span>
                </button>
              ))}
            </div>
          )}
          {custom && <img className="custom-cover" src={custom} alt="Своя обложка" />}
          <DropZone
            accept="image/jpeg,image/png,image/webp"
            button="Загрузить свой файл"
            label="Своя обложка"
            detail="JPG, PNG или WebP"
            onFile={async (f) => {
              const version = ++imgVersion.current;
              setReadingImage(true);
              try {
                if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) throw Error();
                const image = await imageCover(f);
                if (version === imgVersion.current) {
                  setCustom(image);
                  setDetailError("");
                }
              } catch {
                if (version === imgVersion.current)
                  setDetailError("Не удалось открыть изображение.");
              } finally {
                if (version === imgVersion.current) setReadingImage(false);
              }
            }}
          />
        </fieldset>
        <Metadata
          title={edit?.title}
          category={edit?.category}
          tags={edit?.tags}
          chapters={edit?.chapters}
        />
        {preview && (
          <details>
            <summary>Предпросмотр видео</summary>
            <video className="studio-player" controls src={preview} />
          </details>
        )}
        {detailError && <p role="alert">{detailError}</p>}
      </div>
      <div hidden={!edit && step !== 2}>
        <label>
          Видимость
          <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
            {["Публичное", "Приватное", "По приглашению"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        {privacy === "По приглашению" && (
          <label>
            Кто может смотреть
            <select multiple name="invites" defaultValue={edit?.invites}>
              {[{ id: demo, name: "Демоавтор" }, ...m.accounts]
                .filter((a) => a.id !== user)
                .map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </label>
        )}
      </div>
      {!edit && step === 3 && (
        <p>
          {file?.name} · {privacy}
        </p>
      )}
      {!edit && step > 1 && (
        <button type="button" onClick={() => setStep(step - 1)}>
          Назад
        </button>
      )}
      <button className="primary" disabled={busy || readingImage}>
        {busy ? "Сохранение…" : !edit && step < 3 ? "Далее" : "Сохранить видео"}
      </button>
    </form>
  );
  const job = m.jobs[analysisId];
  useEffect(() => {
    const pending = Object.entries(m.jobs).filter(
      ([, s]) => s === "В очереди" || s === "Обрабатывается",
    );
    if (!pending.length) return;
    const t = setTimeout(
      () =>
        setM((s) => ({
          ...s,
          jobs: {
            ...s.jobs,
            ...Object.fromEntries(
              pending.map(([k, j]) => [k, j === "В очереди" ? "Обрабатывается" : "Готово"]),
            ),
          },
        })),
      1300,
    );
    return () => clearTimeout(t);
  }, [m.jobs]);
  const matches = visible.filter(
    (v) =>
      v.privacy === "Публичное" &&
      (category === "" || v.category === category) &&
      (!tag || v.tags.includes(tag)),
  );
  const q = query.trim().toLowerCase();
  const hasTranscript = (v: Clip) => !v.local || m.jobs[v.id] === "Готово";
  const visits = m.visits.filter((h) => h.user === user);
  const recent = [...new Map(visits.map((h) => [h.id, h])).values()].sort(
    (a, b) => b.date - a.date,
  );
  const recommended = rankVideos(
    visible.filter((v) => v.privacy === "Публичное" && !m.dislikes.includes(user + ":" + v.id)),
    recent.slice(0, 40).flatMap((h) => visible.filter((v) => v.id === h.id)),
    account?.interests || [],
  );
  const [channel, setChannel] = useState(user),
    [channelTab, setChannelTab] = useState("Видео"),
    [customizing, setCustomizing] = useState(false);
  const showChannel = (owner: string) => {
    setChannel(owner);
    setChannelTab("Видео");
    setCustomizing(false);
    navigate("channel");
  };
  const channelName =
    m.accounts.find((a) => a.id === channel)?.name || (channel === demo ? "Демоавтор" : channel);
  const brand = m.branding[channel] || {};
  const isOwner = channel === user && user !== "guest";
  function libraryProgress(v: Clip) {
    const last = recent.find((h) => h.id === v.id);
    return last?.duration ? Math.min(100, (last.time / last.duration) * 100) : v.progress;
  }
  const [createKind,setCreateKind]=useState<CreateKind|null>(null);
  const [pickVideo,setPickVideo]=useState(false);
  const pickRef=useRef<HTMLSelectElement>(null);
  useEffect(()=>{if(pickVideo)pickRef.current?.focus()},[pickVideo]);
  const activeGroup = groups.find((g) => g.id === group);
  let body;
  if (page === "home")
    body = <HomePage videos={recommended} openVideo={open} navigate={navigate} />;
  else if (page === "channel")
    body = (
      <section className="channel-page">
        <div className="channel-banner">
          {brand.banner && <img src={brand.banner} alt="Обложка канала" />}
        </div>
        <div className="channel-heading">
          <span className="channel-avatar">
            {brand.avatar ? (
              <img src={brand.avatar} alt="Аватар канала" />
            ) : (
              channelName.slice(0, 1)
            )}
          </span>
          <h1>{channelName}</h1>
          {isOwner && (
            <button onClick={() => setCustomizing(!customizing)}>
              {customizing ? "Готово" : "Оформить канал"}
            </button>
          )}
        </div>
        {isOwner && customizing && (
          <div className="channel-settings">
            {(["avatar", "banner"] as const).map((key) => (
              <label key={key}>
                {key === "avatar" ? "Аватар канала" : "Обложка канала"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const data = await imageCover(
                        file,
                        key === "avatar" ? 192 : 1200,
                        key === "avatar" ? 192 : 320,
                      );
                      setM((s) => ({
                        ...s,
                        branding: {
                          ...s.branding,
                          [channel]: { ...s.branding[channel], [key]: data },
                        },
                      }));
                    } catch {
                      setMsg("Не удалось прочитать изображение");
                    }
                  }}
                />
              </label>
            ))}
          </div>
        )}
        <nav className="tools">
          {["Видео", "Сообщество"].map((tab) => (
            <button key={tab} aria-pressed={channelTab === tab} onClick={() => setChannelTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>
        {channelTab === "Видео" ? (
          grid(visible.filter((v) => v.owner === channel))
        ) : (
          <>
            {isOwner && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = String(new FormData(e.currentTarget).get("post")).trim();
                  if (!text) return;
                  const post = { id: crypto.randomUUID(), owner: user, text, date: Date.now() };
                  setM((s) => ({ ...s, posts: [post, ...s.posts] }));
                  e.currentTarget.reset();
                }}
              >
                <label>
                  Новая запись
                  <textarea
                    name="post"
                    required
                    maxLength={5000}
                    rows={3}
                    placeholder="Чем хотите поделиться?"
                  />
                </label>
                <button className="primary">Опубликовать</button>
              </form>
            )}
            {!m.posts.some((p) => p.owner === channel) && (
              <p className="empty">На канале пока нет записей</p>
            )}
            {m.posts
              .filter((p) => p.owner === channel)
              .map((post) => (
                <article className="channel-post" key={post.id}>
                  <header>
                    {brand.avatar && <img className="post-avatar" src={brand.avatar} alt="" />}
                    <strong>{channelName}</strong> ·{" "}
                    <time dateTime={new Date(post.date).toISOString()}>
                      {new Date(post.date).toLocaleString("ru-RU")}
                    </time>
                  </header>
                  <p>{post.text}</p>
                  {isOwner && (
                    <button
                      onClick={() =>
                        setM((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== post.id) }))
                      }
                    >
                      Удалить запись
                    </button>
                  )}
                </article>
              ))}
          </>
        )}
      </section>
    );
  else if (page === "settings")
    body = (
      <>
        <PageTitle title="Настройки" subtitle="Оформление Mediary на этом устройстве" />
        <div className="preferences">
          <fieldset>
            <legend>Тема оформления</legend>
            <div>
              {[
                ["dark", "Тёмная", Moon],
                ["light", "Светлая", Sun],
              ].map((entry) => {
                const [value, label, Icon] = entry as [string, string, typeof Moon];
                return (
                  <label key={value}>
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === value}
                      onChange={() => setTheme(value)}
                    />
                    <Icon size={18} />
                    {label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend>Размер карточек видео</legend>
            <div>
              {[
                ["normal", "Обычные"],
                ["compact", "Компактные"],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="cards"
                    checked={cardSize === value}
                    onChange={() => setCardSize(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </>
    );
  else if (page === "profile")
    body = (
      <>
        <PageTitle
          title={name}
          subtitle="Личный профиль"
          actions={user !== "guest" && <button onClick={() => showChannel(user)}>Мой канал</button>}
        />
        {account ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fields = new FormData(e.currentTarget);
              const n = String(fields.get("name")).trim();
              const interests = fields.getAll("interests").map(String);
              if (n)
                setM((s) => ({
                  ...s,
                  accounts: s.accounts.map((a) =>
                    a.id === user ? { ...a, name: n, interests } : a,
                  ),
                  clips: s.clips.map((v) => (v.owner === user ? { ...v, author: n } : v)),
                }));
              setMsg("Профиль сохранён");
            }}
          >
            <label>
              Имя профиля
              <input required name="name" defaultValue={name} />
            </label>
            <p>{account.email}</p>
            <InterestFields key={account.id} selected={account.interests} />
            <button>Сохранить изменения</button>
            <button type="button" onClick={() => session("guest")}>
              Выйти
            </button>
          </form>
        ) : (
          authForm
        )}
      </>
    );
  else if (page === "upload") body = user === "guest" ? authForm : upload;
  else if (page === "library")
    body = (
      <>
        <PageTitle title="Видеотека" />
        <div className="shelf-toolbar"><nav className="segment" aria-label="Разделы видеотеки">{["Мои видео","Сохранённые"].map((label,i)=><button key={label} aria-pressed={savedTab===Boolean(i)} onClick={()=>setSavedTab(Boolean(i))}>{label}</button>)}</nav>
        <div className="toolbar-right">{!savedTab&&<select aria-label="Фильтр по разделу" value={folder} onChange={e=>setFolder(e.target.value)}><option value="">Все разделы</option>{folders.map(x=><option key={x}>{x}</option>)}</select>}
        <div className="segment">{[{icon:Grid2X2,label:"Сетка",value:false},{icon:List,label:"Список",value:true}].map(({icon:Icon,label,value})=><button key={label} title={label} aria-label={label} aria-pressed={list===value} onClick={()=>setList(value)}><Icon size={17}/></button>)}</div>
        {!savedTab&&<CreateButton kind="folder" onClick={()=>setCreateKind("folder")}/>}</div></div>
        <div className={list ? "studio-list" : "studio-grid"}>
          {savedTab &&
            (savedIds.size ? (
              visible
                .filter((v) => savedIds.has(v.id))
                .map((v) => (
                  <div className="shelf-card" key={v.id}>
                    <VideoCard
                      video={{ ...v, progress: libraryProgress(v) }}
                      onOpen={() => open(v)}
                    />
                    <CardTools>
                      <button onClick={() => toggle("saved", user + ":" + v.id)}>
                        Убрать из сохранённых
                      </button>
                    </CardTools>
                  </div>
                ))
            ) : (
              <EmptyShelf kind="saved" title="Пока нет сохранённых видео" text="Сохраняйте ролики во время просмотра, чтобы вернуться к ним позже." action="Найти видео" onClick={()=>navigate("search")}/>
            ))}
          {!savedTab &&
            own
              .filter((v) => !folder || v.folder === folder)
              .map((v) => (
                <div className="shelf-card" key={v.id}>
                  <VideoCard
                    video={{ ...v, progress: libraryProgress(v) }}
                    onOpen={() => open(v)}
                  />
                  
                  <CardTools>
                    <button
                      onClick={() => {
                        navigate("upload");
                        setEdit(v);
                        setPrivacy(v.privacy || "Приватное");
                      }}
                    >
                      Изменить
                    </button>
                    <button onClick={() => setRemove(v)}>Удалить</button>
                    <select
                      aria-label="Раздел видео"
                      value={v.folder}
                      onChange={(e) => changeClip({ ...v, folder: e.target.value })}
                    >
                      <option value="">Без раздела</option>
                      {folders.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </CardTools>
                </div>
              ))}
        </div>
        {!savedTab && !own.some((v) => !folder || v.folder === folder) && (
          <EmptyShelf kind="folder" title={folder?"Раздел пока пуст":"Ваша видеотека пока пуста"} text={folder?"Перенесите ролик сюда через меню на его обложке.":"Добавьте первый ролик с компьютера."} action={folder?"Все видео":"Загрузить видео"} onClick={()=>folder?setFolder(""):navigate("upload")}/>
        )}
      </>
    );
  else if (page === "player" && clip)
    body = (
      <>
        <div className="watch-layout">
          <section className="watch-main">
            <Media
              key={id}
              clip={clip}
              start={start}
              ready={hasTranscript(clip)}
              onProgress={(time, duration) =>
                setM((s) => {
                  const h = s.visits[s.visits.length - 1];
                  if (
                    !h ||
                    h.id !== id ||
                    h.user !== user ||
                    (Math.floor(h.time) === Math.floor(time) && h.duration === duration)
                  )
                    return s;
                  return { ...s, visits: [...s.visits.slice(0, -1), { ...h, time, duration }] };
                })
              }
            />
            <PageTitle title={clip.title} subtitle={clip.category} />
            <button className="channel-link" onClick={() => showChannel(clip.owner)}>
              {m.branding[clip.owner]?.avatar && (
                <img className="post-avatar" src={m.branding[clip.owner].avatar} alt="" />
              )}
              Канал · {clip.owner === demo ? "Демоавтор" : clip.author}
            </button>
            <div className="tools">
              {(["likes", "dislikes"] as const).map((key) => (
                <button
                  key={key}
                  aria-pressed={m[key].includes(user + ":" + id)}
                  className="reaction-glyph"
                  aria-label={key === "likes" ? "Нравится" : "Не нравится"}
                  title={key === "likes" ? "Нравится" : "Не нравится"}
                  onClick={() => reactTo(key)}
                >
                  {key === "likes" ? (
                    <ThumbsUp size={18} aria-hidden="true" />
                  ) : (
                    <ThumbsDown size={18} aria-hidden="true" />
                  )}
                  {m[key].filter((x) => x.endsWith(":" + id)).length}
                </button>
              ))}
              <button
                aria-pressed={savedIds.has(id)}
                onClick={() => toggle("saved", user + ":" + id)}
              >
                {savedIds.has(id) ? "В сохранённых ✓" : "Сохранить видео"}
              </button>
              {clip.owner !== user && (
                <button onClick={() => toggle("follows", user + ":" + clip.owner)}>
                  {m.follows.includes(user + ":" + clip.owner) ? "Отписаться" : "Подписаться"}
                </button>
              )}
              {groupsSelect(clip)}
            </div>
            <h2>Комментарии</h2>
            {m.comments
              .filter((c) => c.id === id)
              .map((c, i) => (
                <p key={i}>
                  <b>{m.accounts.find((a) => a.id === c.authorId)?.name || c.user}</b> · {c.text}{" "}
                  {c.authorId === user && (
                    <button
                      onClick={() =>
                        setM((s) => ({ ...s, comments: s.comments.filter((n) => n.key !== c.key) }))
                      }
                    >
                      Удалить
                    </button>
                  )}
                </p>
              ))}
            <form
              className="inline"
              onSubmit={(e) => {
                e.preventDefault();
                const text = String(new FormData(e.currentTarget).get("text")).trim();
                if (text)
                  setM((s) => ({
                    ...s,
                    comments: [
                      ...s.comments,
                      { id, authorId: user, key: crypto.randomUUID(), user: name, text },
                    ],
                  }));
                e.currentTarget.reset();
              }}
            >
              <input name="text" required placeholder="Ваш комментарий" />
              <button>Отправить</button>
            </form>
          </section>
          <aside className="watch-related">
            <h2>Рекомендуем вам</h2>
            {recommended
              .filter((v) => v.id !== id)
              .slice(0, 6)
              .map((v) => (
                <button key={v.id} onClick={() => open(v)}>
                  <span className="thumb-wrap related-thumb">
                    <img src={v.image} alt="" />
                    <DurationBadge video={v} />
                  </span>
                  <span>
                    <strong>{v.title}</strong>
                    <small>
                      {v.author} · {v.category}
                    </small>
                  </span>
                </button>
              ))}
            {!recommended.some((v) => v.id !== id) && <p>Пока нет других видео</p>}
          </aside>
        </div>
      </>
    );
  else if (page === "collections" || page === "playlists")
    body = (
      <>
        <PageTitle actions={!activeGroup&&<CreateButton kind={page} onClick={()=>setCreateKind(page)}/>}
          subtitle={
            activeGroup
              ? [activeGroup.visibility, activeGroup.description].filter(Boolean).join(" · ")
              : undefined
          }
          title={activeGroup?.name || (page === "collections" ? "Коллекции" : "Плейлисты")}
        />
        {activeGroup ? (
          <>
            <button onClick={() => setGroup("")}>← Назад</button>
            {(!activeGroup.items.length&&!pickVideo)?<EmptyShelf kind={page} title="Здесь пока нет видео" text="Выберите первый ролик для этой подборки." action="Добавить видео" onClick={()=>setPickVideo(true)}/>:<select ref={pickRef}
              value=""
              aria-label="Добавить видео"
              onChange={(e) =>
                updateGroup({
                  ...activeGroup,
                  items: [...activeGroup.items, Number(e.target.value)],
                })
              }
            >
              <option value="">Добавить видео…</option>
              {visible
                .filter((v) => !activeGroup.items.includes(v.id))
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
            </select>}
            {activeGroup.items.map((id, i) => {
              const v = visible.find((v) => v.id === id);
              if (!v) return null;
              return (
                <div className="row" key={id}>
                  <button onClick={() => open(v)}>
                    {i + 1}. {v.title}
                  </button>
                  <button
                    disabled={!i}
                    onClick={() => {
                      const a = [...activeGroup.items];
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                      updateGroup({ ...activeGroup, items: a });
                    }}
                  >
                    Выше
                  </button>
                  <button
                    onClick={() =>
                      updateGroup({
                        ...activeGroup,
                        items: activeGroup.items.filter((x) => x !== id),
                      })
                    }
                  >
                    Убрать
                  </button>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {!groups.some(g=>g.kind===page)&&<EmptyShelf kind={page} title={page==="playlists"?"Плейлистов пока нет":"Коллекций пока нет"} text={page==="playlists"?"Соберите ролики и задайте порядок просмотра.":"Соберите свои и сохранённые видео по одной теме."} action={page==="playlists"?"Создать плейлист":"Создать коллекцию"} onClick={()=>setCreateKind(page)}/>}
            {groups
              .filter((g) => g.kind === page)
              .map((g) => (
                <button key={g.id} onClick={() => {setPickVideo(false);setGroup(g.id)}}>
                  {g.name} · {g.items.length} видео
                </button>
              ))}
          </>
        )}
      </>
    );
  else if (page === "search") {
    const results = matches.filter(
      (v) =>
        [v.title, v.author, v.category, ...v.tags].join(" ").toLowerCase().includes(q) ||
        (hasTranscript(v) && phrases.some((p) => p.join(" ").toLowerCase().includes(q))),
    );
    body = (
      <>
        <PageTitle title="Поиск" />
        <div className="tools">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Видео, автор или фраза"
          />
          {[
            [
              category,
              setCategory,
              [...new Set(matches.concat(visible).map((v) => v.category))],
              "Все категории",
            ],
            [tag, setTag, [...new Set(visible.flatMap((v) => v.tags))], "Все теги"],
          ].map((row, i) => {
            const [value, set, options, label] = row as [
              string,
              (v: string) => void,
              string[],
              string,
            ];
            return (
              <select
                key={i}
                aria-label={label}
                value={value}
                onChange={(e) => set(e.target.value)}
              >
                <option value="">{label}</option>
                {options.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            );
          })}
        </div>
        {results.length ? (
          <div className="studio-grid">
            {results.map((v) => (
              <div key={v.id}>
                <VideoCard video={v} onOpen={() => open(v)} />
                {q &&
                  hasTranscript(v) &&
                  phrases.map(
                    (p, i) =>
                      p.join(" ").toLowerCase().includes(q) && (
                        <button key={i} onClick={() => open(v, i * 3)}>
                          {clock(i * 3)} · {p[0]}
                        </button>
                      ),
                  )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">Ничего не найдено</p>
        )}
      </>
    );
  } else if (page === "ai") {
    const target = visible.find((v) => v.id === analysisId);
    body = (
      <>
        <PageTitle
          title="Анализ видео"
          subtitle="Демонстрация обработки и перевода на примере тестовой расшифровки"
        />
        <select value={target?.id || ""} onChange={(e) => setAnalysisId(Number(e.target.value))}>
          <option value="" disabled>
            Выберите видео
          </option>
          {visible.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
        <p role="status">{job || "Ожидает запуска"}</p>
        <button
          disabled={!target || job === "В очереди" || job === "Обрабатывается"}
          onClick={async () => {
            let state = "В очереди";
            try {
              if (target?.local && !(await mediaFile(target.id))) state = "Ошибка";
            } catch {
              state = "Ошибка";
            }
            setM((s) => ({
              ...s,
              jobs: { ...s.jobs, [analysisId]: state },
              notices: {
                ...s.notices,
                [user]: ["Анализ: " + target?.title, ...(s.notices[user] || [])],
              },
            }));
          }}
        >
          {job === "Ошибка" ? "Повторить попытку" : "Запустить обработку"}
        </button>
        {job === "Обрабатывается" && (
          <button
            onClick={() => setM((s) => ({ ...s, jobs: { ...s.jobs, [analysisId]: "Ошибка" } }))}
          >
            Смоделировать ошибку
          </button>
        )}
        {job === "Готово" && target && (
          <>
            <div className="tools">
              {["Расшифровка", "Субтитры", "Перевод", "Содержание"].map((t) => (
                <button key={t} onClick={() => setAiTab(t)}>
                  {t}
                </button>
              ))}
            </div>
            <h2>{aiTab}</h2>
            {aiTab === "Содержание" ? (
              <p>
                {target.category} · {target.tags.join(", ")} · Демопример о личной видеотеке.
              </p>
            ) : (
              phrases.map((p, i) => (
                <p key={i}>
                  {clock(i * 3)} · {aiTab === "Перевод" ? p[1] : p[0]}
                </p>
              ))
            )}
            {[0, 1].map((lang) =>
              [false, true].map((srt) => (
                <button
                  key={lang + String(srt)}
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(
                      new Blob([subtitles(lang, srt)], { type: "text/plain;charset=utf-8" }),
                    );
                    a.download = (lang ? "en" : "ru") + (srt ? ".srt" : ".vtt");
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                  }}
                >
                  {lang ? "English" : "Русский"} · {srt ? "SRT" : "VTT"} ↓
                </button>
              )),
            )}
          </>
        )}
      </>
    );
  } else if (page === "history")
    body = (
      <>
        <PageTitle title="История просмотров" />
        {!recent.some((h) => visible.some((v) => v.id === h.id)) && (
          <p>Вы пока не смотрели доступные видео</p>
        )}
        {recent.map((h) => {
          const video = visible.find((v) => v.id === h.id);
          if (!video) return null;
          return (
            <button className="history-entry" key={h.id} onClick={() => open(video, h.time)}>
              <span className="history-cover">
                <img src={video.image} alt="" loading="lazy" />
                <DurationBadge video={video} />
                {h.duration > 0 && (
                  <progress aria-label="Прогресс просмотра" value={h.time} max={h.duration} />
                )}
              </span>
              <span className="history-caption">
                <strong>{video.title}</strong>
                <small>{video.author}</small>
                <span>Продолжить с {clock(h.time)}</span>
              </span>
            </button>
          );
        })}
      </>
    );
  else if (page === "analytics") {
    const rows = m.visits.filter(
      (h) =>
        own.some((v) => v.id === h.id) &&
        (!statsId || h.id === statsId) &&
        h.date > Date.now() - period * 86400000,
    );
    body = (
      <>
        <PageTitle title="Статистика канала" />
        <select value={statsId} onChange={(e) => setStatsId(+e.target.value)}>
          <option value={0}>Все мои видео</option>
          {own.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
        <select value={period} onChange={(e) => setPeriod(+e.target.value)}>
          {[7, 30, 90].map((n) => (
            <option key={n} value={n}>
              {n} дней
            </option>
          ))}
        </select>
        <div className="row">
          <strong>Просмотры · {rows.length}</strong>
          <strong>Зрители · {new Set(rows.map((h) => h.user)).size}</strong>
        </div>
      </>
    );
  } else if (page === "live")
    body = (
      <>
        <PageTitle title="Прямые эфиры" />
        {!live ? (
          <button onClick={() => setLive(true)}>Открыть демоэфир Mediary</button>
        ) : (
          <>
            <video controls loop className="studio-player" src="./mediary-demo.mp4" />
            <h2>Чат демоэфира</h2>
            {m.chat.map((x, i) => (
              <p key={i}>{x}</p>
            ))}
            <form
              className="inline"
              onSubmit={(e) => {
                e.preventDefault();
                const t = String(new FormData(e.currentTarget).get("text")).trim();
                if (t) setM((s) => ({ ...s, chat: [...s.chat, name + ": " + t] }));
                e.currentTarget.reset();
              }}
            >
              <input name="text" required placeholder="Сообщение" />
              <button>Отправить</button>
            </form>
          </>
        )}
      </>
    );
  else {
    const subs = page === "subscriptions";

    body = (
      <>
        <PageTitle title={subs ? "Подписки" : "Для вас"} />
        {grid(subs ? visible.filter((v) => m.follows.includes(user + ":" + v.owner)) : recommended)}
      </>
    );
  }
  return (
    <>
      <Header
        onNavigate={navigate}
        avatar={m.branding[user]?.avatar}
        initials={name.slice(0, 1)}
        notices={m.notices[user] || []}
        query={query}
        setQuery={setQuery}
        theme={theme}
        toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        notificationsOpen={bell}
        setNotificationsOpen={setBell}
        menuOpen={menu}
        setMenuOpen={setMenu}
      />
      <Sidebar page={page} onNavigate={navigate} open={menu} close={() => setMenu(false)} />
      <main className="min-h-screen px-4 pb-16 pt-[96px] md:px-7 lg:ml-[248px] xl:px-9">
        <div className={page === "home" ? "" : "studio"}>{body}</div>
      </main>
      {createKind&&<CreateDialog kind={createKind} close={()=>setCreateKind(null)} save={(name,description,visibility)=>{
        if(createKind==="folder"){if(folders.some(x=>x.toLocaleLowerCase()===name.toLocaleLowerCase()))return "Раздел с таким названием уже есть";setM(s=>({...s,folders:{...s.folders,[user]:[...(s.folders[user]||[]),name]}}));setFolder(name);setSavedTab(false)}
        else{const id=crypto.randomUUID();const g={id,name,description,visibility,items:[],kind:createKind,owner:user};setM(s=>({...s,groups:[...s.groups,g]}));setPickVideo(false);setGroup(id)}
      }}/>}
      {remove && (
        <div className="confirm studio" role="alertdialog">
          <div>
            <h2>Удалить «{remove.title}»?</h2>
            <button onClick={() => setRemove(null)}>Отмена</button>
            <button
              onClick={() => {
                setM((s) => ({
                  ...s,
                  clips: s.clips.filter((v) => v.id !== remove.id),
                  groups: s.groups.map((g) => ({
                    ...g,
                    items: g.items.filter((id) => id !== remove.id),
                  })),
                }));
                if (remove.local)
                  filesDb().then((db) => {
                    const tx = db.transaction("files", "readwrite");
                    tx.objectStore("files").delete(remove.id);
                    tx.oncomplete = () => db.close();
                  });
                setRemove(null);
              }}
            >
              Удалить видео
            </button>
          </div>
        </div>
      )}
      {msg && (
        <div role="status" className="toast">
          {msg}
        </div>
      )}
    </>
  );
}
