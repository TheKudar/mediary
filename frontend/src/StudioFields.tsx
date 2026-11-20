import { useRef, useState, type ReactNode } from "react";
import { Upload, MoreHorizontal, X, Plus } from "lucide-react";
import type { Chapter } from "./videoDetails";

export function DropZone({
  accept,
  onFile,
  label,
  detail,
  button,
}: {
  accept: string;
  onFile: (f: File) => void;
  label: string;
  detail: string;
  button: string;
}) {
  const picker = useRef<HTMLInputElement>(null),
    [over, setOver] = useState(false);
  return (
    <div
      className="drop-zone"
      data-over={over}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <Upload size={22} />
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
      <button type="button" onClick={() => picker.current?.click()}>
        {button}
      </button>
      <input
        hidden
        ref={picker}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function Metadata({
  title = "",
  tags = [],
  category = "",
  chapters = [],
}: {
  title?: string;
  tags?: string[];
  category?: string;
  chapters?: Chapter[];
}) {
  const [name, setName] = useState(title),
    [chips, setChips] = useState(tags),
    [draft, setDraft] = useState("");
  const [rows, setRows] = useState(
    chapters.map((c) => ({
      id: crypto.randomUUID(),
      time:
        String(Math.floor(c.time / 60)).padStart(2, "0") +
        ":" +
        String(c.time % 60).padStart(2, "0"),
      name: c.title,
    })),
  );
  const nextFocus = useRef("");
  function add() {
    const id = crypto.randomUUID();
    nextFocus.current = id;
    setRows([...rows, { id, time: "", name: "" }]);
  }
  function commit() {
    if (draft.trim()) setChips([...new Set([...chips, draft.trim()])]);
    setDraft("");
  }
  return (
    <div className="meta-fields">
      <label>
        <span>
          Название <small>{name.length}/100</small>
        </span>
        <input
          required
          maxLength={100}
          name="title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название видео"
        />
      </label>
      <label>
        Категория
        <input
          required
          name="category"
          defaultValue={category}
          placeholder="Например, путешествия"
        />
      </label>
      <div>
        <label>
          Теги
          <input
            value={draft}
            placeholder="Введите тег и нажмите Enter"
            onBlur={commit}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commit();
              }
            }}
          />
        </label>
        <div className="chip-line">
          {chips.map((t) => (
            <button
              type="button"
              key={t}
              aria-label={"Удалить тег " + t}
              onClick={() => setChips(chips.filter((x) => x !== t))}
            >
              {t}
              <X size={12} />
            </button>
          ))}
        </div>
        <input type="hidden" name="tags" value={chips.join(",")} />
      </div>
      <fieldset>
        <legend>Главы видео</legend>
        {rows.map((r) => (
          <div className="chapter-row" key={r.id}>
            <input
              ref={(el) => {
                if (el && nextFocus.current === r.id) {
                  el.focus();
                  nextFocus.current = "";
                }
              }}
              aria-label="Начало главы"
              placeholder="00:00"
              inputMode="numeric"
              value={r.time}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 7);
                setRows(
                  rows.map((x) =>
                    x === r
                      ? {
                          ...x,
                          time:
                            digits.length > 2
                              ? digits.slice(0, -2) + ":" + digits.slice(-2)
                              : digits,
                        }
                      : x,
                  ),
                );
              }}
            />
            <input
              aria-label="Название главы"
              placeholder="Название главы"
              value={r.name}
              onChange={(e) =>
                setRows(rows.map((x) => (x === r ? { ...x, name: e.target.value } : x)))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <button
              type="button"
              aria-label="Удалить главу"
              onClick={() => setRows(rows.filter((x) => x !== r))}
            >
              <X size={15} />
            </button>
          </div>
        ))}
        <button type="button" onClick={add}>
          <Plus size={14} /> Добавить главу
        </button>
        <input
          type="hidden"
          name="chapters"
          value={rows
            .filter((r) => r.time || r.name.trim())
            .map((r) => r.time + " " + r.name)
            .join("\n")}
        />
      </fieldset>
    </div>
  );
}

export function CardTools({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details
      className="clip-menu"
      ref={ref}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.open = false;
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current) {
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary aria-label="Действия с видео">
        <MoreHorizontal size={18} />
      </summary>
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button") && ref.current) ref.current.open = false;
        }}
      >
        {children}
      </div>
    </details>
  );
}
