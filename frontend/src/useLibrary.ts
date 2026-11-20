import { useEffect, useState, useRef } from "react";
import type { Model, Clip, ServerState } from "./libraryTypes";
const samples: Clip[] = [
  { id: 91, title: "Дворец в вечернем свете", category: "Архитектура", slug: "palace" },
  { id: 92, title: "Ботаника крупным планом", category: "Природа", slug: "petals" },
].map(({ slug, ...video }) => ({
  ...video,
  source: "/catalog/" + slug + ".mp4",
  image: "/catalog/" + slug + ".jpg",
  author: "Mediary Studio",
  owner: "Mediary Studio",
  views: "Коллекция студии",
  date: "Фотоэтюд",
  duration: "0:09",
  privacy: "Публичное",
  tags: [video.category],
  folder: "",
  invites: [],
}));
function modelOf(state: ServerState): Model {
  return { ...state.model, clips: [...state.model.clips, ...samples] };
}
function personal(model: Model, user: string) {
  const account = model.accounts.find((account) => account.id === user);
  return {
    name: account?.name,
    doc: {
      interests: account?.interests || [],
      brand: model.branding[user] || {},
      clips: model.clips.filter((v) => v.owner === user),
      groups: model.groups.filter((g) => g.owner === user),
      folderList: model.folders[user] || [],
      visits: model.visits.filter((v) => v.user === user),
      posts: model.posts.filter((v) => v.owner === user),
      comments: model.comments.filter((v) => v.authorId === user),
      ...Object.fromEntries(
        (["likes", "dislikes", "saved", "follows"] as const).map((k) => [
          k,
          model[k].filter((x) => x.startsWith(user + ":")),
        ]),
      ),
    },
  };
}
export function useLibrary(state: ServerState, onError: (message: string) => void) {
  const user = state.user;
  const [model, setModel] = useState(() => modelOf(state));
  const version = useRef(state.version);
  const pending = useRef(Promise.resolve());
  const last = useRef(JSON.stringify(personal(modelOf(state), user)));
  const dirty = useRef(0);
  useEffect(() => {
    if (user === "guest") return;
    const update = personal(model, user),
      key = JSON.stringify(update);
    if (last.current === key) return;
    last.current = key;
    dirty.current++;
    pending.current = pending.current
      .then(async () => {
        const res = await fetch("/api/library", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...update, version: version.current }),
        });
        if (!res.ok) throw Error();
        version.current = (await res.json()).version;
      })
      .catch(() => onError("Сохранение не удалось. Обновите страницу."))
      .finally(() => {
        dirty.current--;
      });
  }, [model, user, onError]);
  useEffect(() => {
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (dirty.current || refreshing) return;
      refreshing = true;
      const current = last.current;
      try {
        const response = await fetch("/api/state");
        if (!response.ok) return;
        const next: ServerState = await response.json();
        if (!active || dirty.current || last.current !== current) return;
        if (next.user !== user) {
          location.reload();
          return;
        }
        version.current = next.version;
        const merged = modelOf(next);
        last.current = JSON.stringify(personal(merged, user));
        setModel((prev) => ({ ...merged, jobs: prev.jobs }));
      } catch {
        /* Retry on the next polling interval. */
      } finally {
        refreshing = false;
      }
    };
    const timer = setInterval(refresh, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user]);
  async function logout() {
    await pending.current;
    await fetch("/api/logout", { method: "POST" });
    location.reload();
  }
  return { model, setModel, logout };
}
