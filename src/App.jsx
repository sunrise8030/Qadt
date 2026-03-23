// =========================
// FILE: src/App.jsx (FULL - SMOOTH SEEK + AYAH SYNC + MOBILE DOCK FIX)
// =========================
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

const SURAHES = [
  {
    id: 12,
    slug: "yusuf",
    nameAr: "يوسف",
    nameTr: "Yusuf",
    nameDe: "Yusuf",
    ayahCount: 111,
    audioUrl: "/audio/yusuf.mp3",
    versesUrl: "/data/yusuf.json",
  },
  {
    id: 19,
    slug: "meryem",
    nameAr: "مريم",
    nameTr: "Meryem",
    nameDe: "Maryam",
    ayahCount: 98,
    audioUrl: "/audio/meryem.mp3",
    versesUrl: "/data/meryem.json",
  },
];

/**
 * ✅ Buraya senin büyük SEGMENTS objeni (mevcut projendeki) aynen yapıştırabilirsin.
 * Aşağıdaki minimal örnek sadece dosyanın çalışması için.
 */
const SEGMENTS = {
  6: {
    color: "green",
    ar: "إِنَّ رَبَّكَ عَلِيمٌ حَكِيمٌۭ",
    de: "Gewiß, dein Herr ist Allwissend und Allweise.",
    tr: "Şüphesiz ki Rabbin, (her şeyi) hakkıyla bilendir; her hüküm ve icraatında hikmetler bulunandır.",
  },
};

function resolvePublicUrl(path) {
  const base = import.meta.env.BASE_URL || "/";
  const p = String(path || "").replace(/^\//, "");
  const b = String(base || "/");
  return new URL(`${b}${p}`, window.location.origin).toString();
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function tactilePulse(ms = 8) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(ms);
    }
  } catch {}
}

function formatTime(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function parseJsonTolerant(text, urlForMsg = "") {
  const raw = String(text ?? "");
  let s = raw.replace(/^\uFEFF/, "").trim();

  if (s.startsWith("<!doctype") || s.startsWith("<html") || s.startsWith("<head") || s.startsWith("<")) {
    throw new Error(`Expected JSON but got HTML | url=${urlForMsg} | head=${s.slice(0, 80)}`);
  }

  s = s.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(s);
}

/* ---------------------------
   AYAH INDEX SYNC (binary)
--------------------------- */
function isMonotonicNonDecreasing(arr) {
  for (let i = 1; i < arr.length; i += 1) {
    if (!(arr[i] >= arr[i - 1])) return false;
  }
  return true;
}

function findActiveVerseIndexBinary(starts, ends, t) {
  if (!Number.isFinite(t) || !starts.length || starts.length !== ends.length) return -1;

  let lo = 0;
  let hi = starts.length - 1;
  let best = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = starts[mid];
    if (s <= t) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (best < 0) return 0;
  const e = ends[best];
  if (Number.isFinite(e) && t < e) return best;
  return best;
}

/* ---------------------------
   MARK SEGMENT (light but cached)
--------------------------- */
function stripOuterQuotes(s) {
  const t = String(s ?? "").trim();
  return t.replace(/^[\"“”]+/, "").replace(/[\"“”]+$/, "").trim();
}

function normalizeCommon(s) {
  return String(s ?? "")
    .replaceAll("\u00A0", " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function splitAndMarkFirst(text, needle, className) {
  const s = String(text ?? "");
  const n = String(needle ?? "");
  if (!s || !n) return s;

  const idx = s.indexOf(n);
  if (idx < 0) return s;

  return (
    <>
      {s.slice(0, idx)}
      <span className={className}>{n}</span>
      {s.slice(idx + n.length)}
    </>
  );
}

function markSegmentUncached(text, ayah, lang) {
  const s = String(text ?? "");
  const seg = SEGMENTS[Number(ayah)];
  if (!seg) return s;

  const rawNeedle = seg[lang];
  if (!rawNeedle) return s;

  const cls = seg.color === "green" ? "fontGreen" : "fontRed";

  if (lang === "ar") {
    // basit: ar'da tüm satırı renklendir (istersen eski gelişmiş arabic matcher'ı geri koyabilirsin)
    return <span className={cls}>{s}</span>;
  }

  const needle = stripOuterQuotes(rawNeedle);
  const direct = splitAndMarkFirst(s, needle, cls);
  if (direct !== s) return direct;

  const sN = normalizeCommon(s);
  const nN = normalizeCommon(needle);
  if (sN && nN && sN.includes(nN)) return <span className={cls}>{s}</span>;

  return s;
}

function useMarkSegmentCached() {
  const cacheRef = useRef(new Map());

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const markSegment = useCallback((text, ayah, lang) => {
    const s = String(text ?? "");
    const key = `${Number(ayah) || 0}|${lang}|${s}`;
    const hit = cacheRef.current.get(key);
    if (hit !== undefined) return hit;

    const out = markSegmentUncached(s, ayah, lang);
    cacheRef.current.set(key, out);
    return out;
  }, []);

  return { markSegment, clearCache };
}

/* ---------------------------
   WHEEL (inertial)
--------------------------- */
function IOSPickerWheelVertical3D({ disabled, value, onStep }) {
  const ref = useRef(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef(null);

  const lastYRef = useRef(0);
  const lastTsRef = useRef(0);

  const velRef = useRef(0);
  const accumPxRef = useRef(0);
  const rafRef = useRef(0);

  const STEP_PX = 10;
  const MAX_STEPS_PER_FRAME = 14;

  const RELEASE_MIN_V = 0.1;
  const VEL_LIMIT = 2.2;
  const DECAY_PER_MS = 0.0065;
  const STOP_V = 0.05;
  const MAX_MS = 900;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    velRef.current = 0;
    accumPxRef.current = 0;
  };

  const tickSteps = () => {
    let steps = 0;
    while (accumPxRef.current <= -STEP_PX && steps < MAX_STEPS_PER_FRAME) {
      onStep(+1);
      accumPxRef.current += STEP_PX;
      steps += 1;
    }
    while (accumPxRef.current >= STEP_PX && steps < MAX_STEPS_PER_FRAME) {
      onStep(-1);
      accumPxRef.current -= STEP_PX;
      steps += 1;
    }
    if (steps) tactilePulse(6);
  };

  const startInertia = () => {
    const v0 = velRef.current;
    if (!Number.isFinite(v0) || Math.abs(v0) < RELEASE_MIN_V) {
      stop();
      return;
    }

    velRef.current = clamp(v0, -VEL_LIMIT, VEL_LIMIT);

    const startTs = performance.now();
    let last = startTs;

    const frame = () => {
      const now = performance.now();
      const dt = Math.max(1, now - last);
      last = now;

      const sign = Math.sign(velRef.current || 1);
      const sp = Math.abs(velRef.current);

      const nextSp = sp * Math.exp(-DECAY_PER_MS * dt);
      velRef.current = sign * nextSp;

      const boost = clamp(1 + Math.pow(nextSp / 1.2, 1.25) * 0.35, 1, 2.2);

      accumPxRef.current += velRef.current * dt * boost;
      tickSteps();

      if (nextSp < STOP_V || now - startTs > MAX_MS) {
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
  };

  const onPointerDown = (e) => {
    if (disabled) return;
    stop();
    draggingRef.current = true;
    pointerIdRef.current = e.pointerId;

    lastYRef.current = e.clientY;
    lastTsRef.current = performance.now();

    try {
      ref.current?.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e) => {
    if (disabled || !draggingRef.current) return;
    if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return;

    const now = performance.now();
    const dy = e.clientY - lastYRef.current;
    const dt = Math.max(1, now - (lastTsRef.current || now));

    lastYRef.current = e.clientY;
    lastTsRef.current = now;

    const v = dy / dt;
    velRef.current = velRef.current * 0.62 + v * 0.38;

    const speed = Math.abs(velRef.current);
    const accel = clamp(1 + Math.pow(speed / 0.9, 1.2) * 0.55, 1, 2.8);

    accumPxRef.current += dy * accel;
    tickSteps();
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    pointerIdRef.current = null;
    startInertia();
  };

  const onWheel = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    stop();

    const dy = e.deltaY;
    const dir = dy < 0 ? +1 : -1;
    const raw = Math.abs(dy);
    const steps = clamp(Math.round(Math.pow(raw / 18, 1.05)), 1, 22);

    for (let i = 0; i < steps; i += 1) onStep(dir);
    tactilePulse(7);

    velRef.current = clamp((dy / 520) * -1, -VEL_LIMIT, VEL_LIMIT);
    startInertia();
  };

  const items = useMemo(() => {
    const v = Number(value) || 0;
    return [v - 3, v - 2, v - 1, v, v + 1, v + 2, v + 3];
  }, [value]);

  const angles = [-82, -54, -28, 0, 28, 54, 82];
  const radius = 90;

  return (
    <div className={`spPicker3D ${disabled ? "disabled" : ""}`}>
      <div
        ref={ref}
        className="spPickerViewport"
        role="slider"
        aria-label="Ayet çarkı"
        tabIndex={disabled ? -1 : 0}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div className="spPickerItems3D">
          {items.map((n, i) => {
            const ang = angles[i] ?? 0;
            const active = n === Number(value);

            const abs = Math.abs(ang);
            const opacity = clamp(1 - abs / 92, 0.12, 1);
            const blur = clamp(abs / 55, 0, 1.4);
            const scale = clamp(1 - abs / 220, 0.86, 1);

            return (
              <div
                key={n}
                className={`spPickerItem3D ${active ? "active" : ""}`}
                style={{
                  opacity,
                  filter: `blur(${blur}px)`,
                  transform: `rotateX(${ang}deg) translateZ(${radius}px) scale(${scale})`,
                }}
              >
                {n <= 0 ? "—" : String(n).padStart(2, "0")}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SinglePlayerMain({ verse, markSegment }) {
  const ay = Number(verse?.ayah || 0);

  return (
    <div className="singlePlayerMain" aria-label="Single Player Main">
      <div className="singlePlayerCard">
        <div className="singlePlayerLines">
          <div className="singlePlayerLine singlePlayerLineAr" dir="rtl">
            {markSegment((verse?.ar || "—").trim(), ay, "ar")}
          </div>

          <div className="singlePlayerLine singlePlayerLineDe">
            {markSegment((verse?.de || "—").trim(), ay, "de")}
          </div>

          <div className="singlePlayerLine singlePlayerLineTr">
            {markSegment((verse?.tr || "—").trim(), ay, "tr")}
          </div>

          <div style={{ height: 240 }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedSurah, setSelectedSurah] = useState(
    () => SURAHES.find((s) => s.slug === "meryem") ?? SURAHES[0]
  );

  const [verses, setVerses] = useState([]);
  const [error, setError] = useState("");

  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const [duration, setDuration] = useState(0);
  const durationRef = useRef(0);

  const currentTimeRef = useRef(0);
  const [timeUi, setTimeUi] = useState(0);

  const [activeIndex, setActiveIndex] = useState(-1);
  const activeIndexRef = useRef(-1);

  const versesRef = useRef(verses);

  const dockRef = useRef(null);

  const { markSegment, clearCache } = useMarkSegmentCached();

  // seek UX state
  const seekingRef = useRef(false);
  const wasPlayingOnSeekRef = useRef(false);
  const seekRafRef = useRef(0);
  const pendingSeekRef = useRef(null);

  // repeat
  const [repeatMode, setRepeatMode] = useState(0);
  const repeatStateRef = useRef({ idx: -1, done: 0, armed: true, lastFire: 0 });

  useEffect(() => {
    document.title = "Türkçe-Almanca Kur’an Player";
  }, []);

  useEffect(() => {
    versesRef.current = verses;
    activeIndexRef.current = activeIndex;
    durationRef.current = duration;
    isPlayingRef.current = isPlaying;
  }, [verses, activeIndex, duration, isPlaying]);

  const audioSrc = useMemo(() => (selectedSurah ? resolvePublicUrl(selectedSurah.audioUrl) : ""), [selectedSurah]);
  const versesSrc = useMemo(() => (selectedSurah ? resolvePublicUrl(selectedSurah.versesUrl) : ""), [selectedSurah]);

  const { starts, ends, monotonic } = useMemo(() => {
    const s = [];
    const e = [];
    for (const v of verses) {
      s.push(Number(v?.start));
      e.push(Number(v?.end));
    }
    const ok =
      s.length > 0 &&
      s.every((x) => Number.isFinite(x)) &&
      e.every((x) => Number.isFinite(x)) &&
      isMonotonicNonDecreasing(s);
    return { starts: s, ends: e, monotonic: ok };
  }, [verses]);

  const syncAyahByTime = useCallback(
    (t) => {
      if (!monotonic || !versesRef.current.length) return;
      const idx = findActiveVerseIndexBinary(starts, ends, t);
      if (idx !== -1 && idx !== activeIndexRef.current) {
        setActiveIndex(idx);
        activeIndexRef.current = idx;
      }
    },
    [ends, monotonic, starts]
  );

  // ✅ Dock height: mobile browsers need visualViewport (address bar changes)
  useEffect(() => {
    const setDockH = () => {
      const dock = dockRef.current;
      if (!dock) return;

      const h = Math.ceil(dock.getBoundingClientRect().height);
      const prev =
        Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dockH") || "0", 10) || 0;

      if (Math.abs(h - prev) >= 2) {
        document.documentElement.style.setProperty("--dockH", `${h}px`);
      }
    };

    const rafSet = () => requestAnimationFrame(setDockH);

    rafSet();
    const t1 = setTimeout(rafSet, 120);
    const t2 = setTimeout(rafSet, 420);

    window.addEventListener("resize", rafSet);
    window.addEventListener("orientationchange", rafSet);

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", rafSet);
      vv.addEventListener("scroll", rafSet);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", rafSet);
      window.removeEventListener("orientationchange", rafSet);
      if (vv) {
        vv.removeEventListener("resize", rafSet);
        vv.removeEventListener("scroll", rafSet);
      }
    };
  }, []);

  const seekTo = useCallback(
    (t, autoPlay = false) => {
      const a = audioRef.current;
      if (!a || !Number.isFinite(t)) return;

      const d = Number.isFinite(a.duration) ? a.duration : durationRef.current;
      const nextT = Number.isFinite(d) && d > 0 ? clamp(t, 0, d - 0.01) : Math.max(0, t);

      a.currentTime = nextT;
      currentTimeRef.current = nextT;
      setTimeUi(nextT);

      // ✅ seek => ayah sync
      syncAyahByTime(nextT);

      if (autoPlay) a.play().catch(() => {});
    },
    [syncAyahByTime]
  );

  const seekVerse = useCallback(
    (idx, autoPlay = true) => {
      const v = versesRef.current[idx];
      if (!v) return;
      const start = Number(v?.start);
      if (!Number.isFinite(start)) return;

      repeatStateRef.current = { idx, done: 0, armed: true, lastFire: 0 };
      setActiveIndex(idx);
      activeIndexRef.current = idx;
      seekTo(start, autoPlay);
    },
    [seekTo]
  );

  const onPlayPause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }, []);

  const prevAyah = useCallback(() => {
    const vs = versesRef.current;
    if (!vs.length) return;
    const cur = activeIndexRef.current;
    const idx = cur > 0 ? cur - 1 : 0;
    seekVerse(idx, true);
  }, [seekVerse]);

  const nextAyah = useCallback(() => {
    const vs = versesRef.current;
    if (!vs.length) return;
    const cur = activeIndexRef.current;
    const idx = cur >= 0 ? Math.min(vs.length - 1, cur + 1) : 0;
    seekVerse(idx, true);
  }, [seekVerse]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((m) => {
      const next = m === 0 ? 1 : m === 1 ? 2 : 0;

      if (next <= 0) {
        repeatStateRef.current = { idx: -1, done: 0, armed: true, lastFire: 0 };
        return next;
      }

      const vs = versesRef.current;
      if (!vs.length) return next;

      let idx = activeIndexRef.current;
      if (idx < 0 || !vs[idx]) idx = 0;

      repeatStateRef.current = { idx, done: 0, armed: true, lastFire: 0 };

      const v = vs[idx];
      const s = Number(v?.start);
      if (Number.isFinite(s)) seekTo(s, true);

      return next;
    });
  }, [seekTo]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        onPlayPause();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prevAyah();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nextAyah();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        toggleRepeat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextAyah, onPlayPause, prevAyah, toggleRepeat]);

  // load verses on surah change
  useEffect(() => {
    let cancelled = false;

    setError("");
    setVerses([]);
    setActiveIndex(-1);
    setDuration(0);
    setTimeUi(0);

    setRepeatMode(0);
    repeatStateRef.current = { idx: -1, done: 0, armed: true, lastFire: 0 };

    clearCache();

    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    currentTimeRef.current = 0;

    (async () => {
      try {
        const res = await fetch(versesSrc, { cache: "no-store" });
        const text = await res.text();

        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status} ${res.statusText} | body=${text.slice(0, 160)}`);
        }

        const data = parseJsonTolerant(text, versesSrc);
        if (!Array.isArray(data)) throw new Error("Invalid verses JSON (expected array)");

        if (!cancelled) {
          setVerses(data);
          setActiveIndex(0);
          activeIndexRef.current = 0;
          requestAnimationFrame(() => seekVerse(0, false));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[verses] load failed:", e);
        if (!cancelled) setError(`Verses could not be loaded: ${e.message}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearCache, seekVerse, versesSrc]);

  // audio listeners + continuous ayah sync while playing
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const UI_FPS = 30; // seek feel
    let raf = 0;
    let last = 0;

    const pump = (ts) => {
      raf = 0;
      const minDt = 1000 / UI_FPS;
      if (ts - last < minDt) return;
      last = ts;

      if (seekingRef.current) return;

      const t = a.currentTime || 0;
      currentTimeRef.current = t;
      setTimeUi(t);
      syncAyahByTime(t);
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(pump);
    };

    const onTime = () => schedule();
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onErr = () => setError("Audio could not be played. Check console for details.");

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onErr);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onErr);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [syncAyahByTime]);

  // repeat logic
  useEffect(() => {
    if (!repeatMode) return;

    const id = window.setInterval(() => {
      const a = audioRef.current;
      if (!a) return;

      const vs = versesRef.current;
      if (!vs.length) return;

      let idx = activeIndexRef.current;
      const t = currentTimeRef.current;

      if (idx < 0 || !vs[idx]) idx = 0;

      const v = vs[idx];
      const s = Number(v?.start);
      const e = Number(v?.end);
      if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return;

      const st = repeatStateRef.current;

      if (st.idx !== idx) {
        repeatStateRef.current = { idx, done: 0, armed: true, lastFire: 0 };
        return;
      }

      if (t < e - 0.12) {
        repeatStateRef.current.armed = true;
        return;
      }

      const nearEnd = t >= e - 0.02;
      if (!nearEnd || !repeatStateRef.current.armed) return;

      const now = performance.now();
      if (now - (repeatStateRef.current.lastFire || 0) < 350) return;
      repeatStateRef.current.lastFire = now;

      repeatStateRef.current.armed = false;

      const done = repeatStateRef.current.done || 0;
      if (done < repeatMode) {
        repeatStateRef.current.done = done + 1;
        a.currentTime = s;
        currentTimeRef.current = s;
        setTimeUi(s);
        a.play().catch(() => {});
        return;
      }

      repeatStateRef.current.done = 0;
      a.pause();
      a.currentTime = s;
      currentTimeRef.current = s;
      setTimeUi(s);
    }, 90);

    return () => window.clearInterval(id);
  }, [repeatMode]);

  // ✅ SMOOTH SEEK: onInput + rAF write to audio.currentTime
  const flushSeek = useCallback(() => {
    if (seekRafRef.current) return;
    seekRafRef.current = requestAnimationFrame(() => {
      seekRafRef.current = 0;
      const v = pendingSeekRef.current;
      pendingSeekRef.current = null;
      if (v == null) return;
      seekTo(v, false);
    });
  }, [seekTo]);

  const onSeekPointerDown = useCallback(() => {
    seekingRef.current = true;
    wasPlayingOnSeekRef.current = isPlayingRef.current;
    // iOS'ta daha stabil: seek sırasında çalma durdur
    const a = audioRef.current;
    if (a && !a.paused) a.pause();
  }, []);

  const onSeekPointerUp = useCallback(() => {
    seekingRef.current = false;
    // bırakınca eğer çalıyorduysa devam
    if (wasPlayingOnSeekRef.current) {
      audioRef.current?.play?.().catch(() => {});
    }
  }, []);

  const onSeekInput = useCallback(
    (e) => {
      const v = Number(e.target.value);
      if (!Number.isFinite(v)) return;

      // UI anında aksın
      setTimeUi(v);
      currentTimeRef.current = v;
      syncAyahByTime(v);

      // audio write rAF ile (takıntı azalır)
      pendingSeekRef.current = v;
      flushSeek();
    },
    [flushSeek, syncAyahByTime]
  );

  const activeVerse = useMemo(() => (activeIndex >= 0 ? verses[activeIndex] : null), [activeIndex, verses]);

  const canSeek = Number.isFinite(duration) && duration > 0;
  const currentTime = canSeek ? timeUi : 0;
  const seekPct = canSeek ? clamp((currentTime / duration) * 100, 0, 100) : 0;

  return (
    <div className="appShell appShellSolo">
      <main className="content">
        <div className="surahHeader">
          <div className="surahHeaderLeft">
            <h2 className="surahTitle">
              #{selectedSurah.id} — {selectedSurah.nameTr}
            </h2>
            <div className="surahSub">{selectedSurah.nameDe}</div>
          </div>
          <div className="surahHeaderRight" dir="rtl">
            {selectedSurah.nameAr}
          </div>
        </div>

        {error ? <div className="errorBox">{error}</div> : null}

        <SinglePlayerMain verse={activeVerse} markSegment={markSegment} />
      </main>

      {/* ✅ ONLY BOTTOM DOCK */}
      <div className="bottomDock" ref={dockRef} aria-label="Bottom Player">
        <audio ref={audioRef} src={audioSrc} preload="metadata" playsInline />

        {/* ✅ TOP SEEK (smooth) */}
        <div className="dockSeekTop">
          <input
            className="dockSeek"
            type="range"
            min={0}
            max={canSeek ? duration : 0}
            step={0.01}
            value={canSeek ? currentTime : 0}
            disabled={!canSeek}
            onInput={onSeekInput}
            onChange={onSeekInput}
            onPointerDown={onSeekPointerDown}
            onPointerUp={onSeekPointerUp}
            onPointerCancel={onSeekPointerUp}
            style={{ "--seekP": `${seekPct}%` }}
            aria-label="MP3 seek"
          />
        </div>

        {/* ✅ ONE HORIZONTAL ROW */}
        <div className="dockRow">
          <select
            className="dockSelectBig"
            value={selectedSurah.slug}
            onChange={(e) => {
              const slug = e.target.value;
              const next = SURAHES.find((s) => s.slug === slug);
              if (next) setSelectedSurah(next);
            }}
            aria-label="Sûre seç"
          >
            {SURAHES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.id} — {s.nameTr}
              </option>
            ))}
          </select>

          <button className="spBtn" type="button" onClick={prevAyah} aria-label="Prev">
            ◀
          </button>

          <button className="spBtn spBtnPrimary" type="button" onClick={onPlayPause} aria-label="Play/Pause">
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button className="spBtn" type="button" onClick={nextAyah} aria-label="Next">
            ▶
          </button>

          <div className="dockWheelWrap">
            <IOSPickerWheelVertical3D
              disabled={!verses.length}
              value={Number(activeVerse?.ayah || 0)}
              onStep={(dir) => {
                const cur = activeIndexRef.current >= 0 ? activeIndexRef.current : 0;
                const next = clamp(cur + dir, 0, Math.max(0, verses.length - 1));
                seekVerse(next, isPlayingRef.current);
              }}
            />
          </div>

          <button
            className={`spRBtn ${repeatMode ? "on" : "off"}`}
            type="button"
            onClick={() => {
              tactilePulse(10);
              toggleRepeat();
            }}
            aria-label="Repeat"
            title="Repeat (R)"
          >
            {repeatMode === 2 ? "rr" : "r"}
          </button>

          <span className="dockTimeBig mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
