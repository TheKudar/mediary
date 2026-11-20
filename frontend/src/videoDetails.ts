export type Chapter = { time: number; title: string };

export function parseChapters(text: string, duration: number): Chapter[] {
  const chapters: Chapter[] = [];
  for (const line of text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const match = /^(?:(\d+):)?(\d+):([0-5]\d)\s+(.+)$/.exec(line);
    if (!match || (match[1] && Number(match[2]) >= 60))
      throw new Error("Введите время и название главы, например 01:20 Интервью.");
    const time = Number(match[1] || 0) * 3600 + Number(match[2]) * 60 + Number(match[3]);
    if (time >= duration) throw new Error("Таймкод должен быть раньше конца видео.");
    if (chapters.some((c) => c.time === time))
      throw new Error("Две главы начинаются в одно время.");
    chapters.push({ time, title: match[4].trim() });
  }
  return chapters.sort((a, b) => a.time - b.time);
}

function thumbnail(source: CanvasImageSource, w: number, h: number, width = 512, height = 288) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const scale = Math.max(canvas.width / w, canvas.height / h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось подготовить обложку");
  ctx.drawImage(source, (width - w * scale) / 2, (height - h * scale) / 2, w * scale, h * scale);
  return canvas.toDataURL("image/jpeg", 0.78);
}

export async function imageCover(file: File, width = 512, height = 288) {
  const url = URL.createObjectURL(file),
    img = new Image();
  try {
    img.src = url;
    await img.decode();
    return thumbnail(img, img.naturalWidth, img.naturalHeight, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function inspectVideo(
  src: string,
): Promise<{ image: string; frames: string[]; seconds: number; width:number;height:number }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    const clean = () => {
      clearTimeout(timer);
      v.onloadeddata = null;
      v.onseeked = null;
      v.onerror = null;
      v.removeAttribute("src");
      v.load();
    };
    const fail = () => {
      clean();
      reject(new Error("Не удалось прочитать кадр видео."));
    };
    const timer = setTimeout(fail, 12000);
    const frames: string[] = [];
    const positions = [0.14, 0.5, 0.84];
    const capture = () => {
      try {
        frames.push(thumbnail(v, v.videoWidth, v.videoHeight));
        if (frames.length < positions.length) {
          v.currentTime = v.duration * positions[frames.length];
          return;
        }
        const result = {
          frames,
          image: frames[Math.floor(Math.random() * frames.length)],
          seconds: v.duration,width:v.videoWidth,height:v.videoHeight,
        };
        clean();
        resolve(result);
      } catch {
        fail();
      }
    };
    v.onerror = fail;
    v.onloadeddata = () => {
      v.onloadeddata = null;
      if (!Number.isFinite(v.duration) || v.duration <= 0) {
        fail();
        return;
      }
      const target = v.duration * positions[0];
      v.onseeked = capture;
      v.currentTime = target;
    };
    v.src = src;
  });
}
