import { useEffect, useState } from "react";
type Account = { id: string; name: string };
type Entry = { id: number; name: string; message: string };
export default function Live({ user, accounts }: { user: string; accounts: Account[] }) {
  const [channel, setChannel] = useState(user === "guest" ? accounts[0]?.id : user);
  const [key, setKey] = useState(""),
    [items, setItems] = useState<Entry[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    if (!channel) return;
    let active = true;
    const update = async () => {
      try {
        const r = await fetch("/api/live/" + channel + "/chat");
        if (r.ok) {
          const rows = await r.json();
          if (active) setItems(rows);
        }
      } catch {
        if (active) setError("Чат недоступен");
      }
    };
    setItems([]);
    void update();
    const timer = setInterval(update, 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [channel]);
  return (
    <section>
      <h1>Прямые эфиры</h1>
      {user !== "guest" && (
        <details>
          <summary>Настроить эфир в OBS</summary>
          <p>Сервер RTMP · rtmp://{location.hostname}:1935</p>
          <button
            onClick={async () => {
              const r = await fetch("/api/live/key");
              if (r.ok) setKey(await r.text());
            }}
          >
            Показать ключ трансляции
          </button>
          {key && (
            <code>
              {user}?key={key}
            </code>
          )}
        </details>
      )}
      <label>
        Канал{" "}
        <select value={channel || ""} onChange={(e) => setChannel(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      {channel && (
        <>
          <iframe
            title="Прямой эфир"
            className="studio-player"
            src={"/stream/" + channel + "/"}
            allowFullScreen
          />
          <h2>Чат</h2>
          {items.map((x) => (
            <p key={x.id}>
              <b>{x.name}</b> {x.message}
            </p>
          ))}
          {user !== "guest" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const message = new FormData(form).get("message");
                try {
                  const r = await fetch("/api/live/" + channel + "/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message }),
                  });
                  if (!r.ok) throw Error();
                  form.reset();
                } catch {
                  setError("Сообщение не отправлено");
                }
              }}
            >
              <input name="message" maxLength={2000} required />
              <button>Отправить</button>
            </form>
          )}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
