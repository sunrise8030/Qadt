// =========================
// FILE: src/App.jsx (FULL - BOTTOM FIXED HORIZONTAL DOCK + TOP SEEK + BIG SELECT + VISIBLE WHEEL + REPEAT)
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
 * SEGMENTS (unchanged behavior from your original):
 * - ar: highlight + color
 * - tr/de: color only (segment if found, otherwise no coloring)
 */
const SEGMENTS = {
  6: {
    color: "green",
    ar: "إِنَّ رَبَّكَ عَلِيمٌ حَكِيمٌۭ",
    de: "Gewiß, dein Herr ist Allwissend und Allweise.",
    tr: "“Şüphesiz ki Rabbin, (her şeyi) hakkıyla bilendir; her hüküm ve icraatında pek çok hikmetler bulunandır.”",
  },
  18: {
    color: "green",
    ar: "فَصَبْرٌۭ جَمِيلٌۭ ۖ وَٱللَّهُ ٱلْمُسْتَعَانُ عَلَىٰ مَا تَصِفُونَ",
    de: "(So gilt es,) schöne Geduld (zu üben). Allah ist Derjenige, bei Dem Hilfe zu suchen ist gegen das, was ihr beschreibt.",
    tr: "“Artık bana düşen, güzelce sabretmektir. Sizin bu anlattıklarınız karşısında yardımına müracaat edilecek sadece Allah var.”",
  },
  21: {
    color: "green",
    ar: "وَٱللَّهُ غَالِبٌ عَلَىٰٓ أَمْرِهِۦ وَلَٰكِنَّ أَكْثَرَ ٱلنَّاسِ لَا يَعْلَمُونَ",
    de: "Und Allah ist in Seiner Angelegenheit überlegen. Aber die meisten Menschen wissen nicht.",
    tr: "“Allah, neyi diler, neye hükmederse onu muhakkak yerine getirir. Ne var ki, insanların çoğu bunu bilmez.”",
  },
  22: {
    color: "green",
    ar: "وَكَذَٰلِكَ نَجْزِى ٱلْمُحْسِنِينَ",
    de: "So vergelten Wir den Gutes Tuenden.",
    tr: "“Kendilerini iyiliğe adamış, daima Allah’ı görüyormuşçasına ve Allah’ın kendilerini gördüğünün şuuru içinde davrananları işte böyle mükâfatlandırırız.”",
  },
  23: { color: "red", ar: "مَعَاذَ ٱللَّهِ", de: "Allah schütze mich (davor)!", tr: "“Allah korusun!”" },
  34: {
    color: "green",
    ar: "إِنَّهُۥ هُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ",
    de: "Er ist ja der Allhörende und Allwissende.",
    tr: "Hiç şüphesiz O’dur Semî‘ (her şeyi, her duayı hakkıyla işiten); Alîm (her şeyi, herkesin durumunu hakkıyla bilen).”",
  },
  40: {
    color: "green",
    ar: "إِنِ ٱلْحُكْمُ إِلَّا لِلَّهِ ۚ أَمَرَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ ۚ ذَٰلِكَ ٱلدِّينُ ٱلْقَيِّمُ وَلَٰكِنَّ أَكْثَرَ ٱلنَّاسِ لَا يَعْلَمُونَ",
    de: "Das Urteil ist allein Allahs. Er hat befohlen, daß ihr nur Ihm dienen sollt. Das ist die richtige Religion. Aber die meisten Menschen wissen nicht.",
    tr: "“Şurası bir gerçek ki, mutlak manâda hükmetme yetkisi sadece Allah’a aittir. O, Kendisinden başka hiç bir varlığa ibadet etmemenizi emretmiştir. Budur doğru ve her bakımdan sağlam din. Ne var ki, insanların çoğu bilmemekte ve bilgisizce hareket etmektedir.”",
  },
  53: {
    color: "green",
    ar: "إِنَّ ٱلنَّفْسَ لَأَمَّارَةٌۢ بِٱلسُّوٓءِ إِلَّا مَا رَحِمَ رَبِّىٓ ۚ إِنَّ رَبِّى غَفُورٌۭ رَّحِيمٌۭ",
    de: "Die Seele gebietet fürwahr mit Nachdruck das Böse, außer daß mein Herr Sich erbarmt. Mein Herr ist Allvergebend und Barmherzig.",
    tr: "“Çünkü nefis, daima ve ısrarla kötülüğü emreder; meğer ki Rabbim, hususî olarak merhamet edip koruya. Şurası bir gerçek ki Rabbim, günahları pek çok bağışlayandır; (bilhassa inanmış kullarına karşı) hususî rahmeti pek bol olandır.”",
  },
  56: {
    color: "green",
    ar: "نُصِيبُ بِرَحْمَتِنَا مَن نَّشَآءُ ۖ وَلَا نُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ",
    de: "Wir treffen mit Unserer Barmherzigkeit, wen Wir wollen, und Wir lassen den Lohn der Gutes Tuenden nicht verlorengehen.",
    tr: "“Kimi dilersek ona bu şekilde hususî rahmetimizle muamele eder ve bütünüyle iyiliğe adanmış olarak, Allah’ı görür gibi, en azından O’nun kendilerini gördüğünün şuuru içinde davrananların mükâfatını asla zayi etmeyiz.”",
  },
  64: {
    color: "green",
    ar: "فَٱللَّهُ خَيْرٌ حَٰفِظًۭا ۖ وَهُوَ أَرْحَمُ ٱلرَّٰحِمِينَ",
    de: "Allah ist besser als Behütender, und Er ist der Barmherzigste der Barmherzigen.",
    tr: "“Ama Allah’tır gerçek hayırlı koruyucu ve O, bütün merhamet edenlerin üstünde mutlak merhamet sahibidir.”",
  },
  66: {
    color: "green",
    ar: "قَالَ ٱللَّهُ عَلَىٰ مَا نَقُولُ وَكِيلٌۭ",
    de: "Allah ist Sachwalter über das, was wir (hier) sagen.",
    tr: "“Allah konuştuklarımıza şahit ve gözeticidir; verilen sözlerin yerine gelip gelmemesi nihayette yine O’nun iznine ve kudretine bağlıdır.”",
  },
  67: {
    color: "green",
    ar: "إِنِ ٱلْحُكْمُ إِلَّا لِلَّهِ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَعَلَيْهِ فَلْيَتَوَكَّلِ ٱلْمُتَوَكِّلُونَ",
    de: "Das Urteil ist allein Allahs. Auf Ihn verlasse ich mich; und auf Ihn sollen sich diejenigen verlassen, die sich (überhaupt auf jemanden) verlassen (wollen).",
    tr: "“Mutlak manâda bütün hüküm ve hakimiyet ancak Allah’ındır. Ancak O’na dayanır, O’na güvenirim. Kendisine dayanıp güvenecek bir güç ve makam arayan herkes (bütün insanlar), ancak O’na dayanıp güvenmelidirler.”",
  },
  76: {
    color: "green",
    ar: "إِلَّآ أَن يَشَآءَ ٱللَّهُ ۚ نَرْفَعُ دَرَجَٰتٍۢ مَّن نَّشَآءُ ۗ وَفَوْقَ كُلِّ ذِى عِلْمٍ عَلِيمٌۭ",
    de: "außer daß Allah es wollte. Wir erhöhen, wen Wir wollen, um Rangstufen. Und über jedem, der Wissen besitzt, steht einer, der (noch mehr) weiß.",
    tr: "“fakat Allah ne dilerse o olur (ve Allah, bir şeyi dileyince onun sebeplerini de hazırlar). Biz, kimi dilersek onu böyle mertebe mertebe yükseltiriz. Ve her bir bilgi sahibinin üstünde daha iyi bir bilen (ve hepsinin üstünde her şeyi bilen olarak Allah) vardır.”",
  },
  80: { color: "green", ar: "وَهُوَ خَيْرُ ٱلْحَٰكِمِينَ", de: "Er ist der Beste derer, die Urteile fällen.", tr: "“Allah, her zaman en hayırlı hükmü verendir.”" },
  86: { color: "red", ar: "إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِىٓ إِلَى ٱللَّهِ", de: "Ich klage meinen unerträglichen Kummer und meine Trauer nur Allah (allein)", tr: "“Ben, bütün dertlerimi, keder ve hüznümü Allah’a arz ediyor, O’na şikâyette bulunuyorum.”" },
  87: { color: "green", ar: "وَلَا تَا۟يْـَٔسُوا۟ مِن رَّوْحِ ٱللَّهِ ۖ إِنَّهُۥ لَا يَا۟يْـَٔسُ مِن رَّوْحِ ٱللَّهِ إِلَّا ٱلْقَوْمُ ٱلْكَٰفِرُونَ", de: "Und gebt nicht die Hoffnung auf das Erbarmen Allahs auf. Es gibt die Hoffnung auf das Erbarmen Allahs nur das ungläubige Volk auf.", tr: "“Allah’ın rahmetinden asla ümidinizi kesmeyin. Şurası bir gerçek ki, O’na inanmayan kâfirler güruhu dışında hiç kimse Allah’ın rahmetinden ümit kesmez.”" },
  88: { color: "green", ar: "إِنَّ ٱللَّهَ يَجْزِى ٱلْمُتَصَدِّقِينَ", de: "Allah vergilt denjenigen, die Almosen geben.", tr: "“Hiç kuşkusuz Allah, fazladan iyilikte bulunanları bol bol mükâfatlandırır.”" },
  90: { color: "green", ar: "إِنَّ ٱللَّهُ لَا يُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ", de: "Gewiß, Allah läßt den Lohn der Gutes Tuenden nicht verlorengehen.", tr: "“Doğrusu şu ki, kim O’na karşı derin saygı duyar, O’na karşı gelmekten sakınır ve O’na itaatla birlikte başına gelenlere de sabrederse, hiç şüphesiz Allah, böyle iyiliğe adanmış ve O’nu görürcesine davranan kimselerin mükâfatını asla zayi etmez.”" },
  91: { color: "green", ar: "تَٱللَّهِ لَقَدْ ءَاثَرَكَ ٱللَّهُ عَلَيْنَا وَإِن كُنَّا لَخَٰطِـِٔينَ", de: "Bei Allah, Allah hat dich uns vorgezogen. Und wir haben wahrlich Verfehlungen begangen.", tr: "“Allah’a yemin olsun ki, gerçekten Allah seni bize tercih etti; biz, başka değil, ancak bir yanlış içinde idik.”" },
  92: { color: "green", ar: "لَا تَثْرِيبَ عَلَيْكُمُ ٱلْيَوْمَ ۖ يَغْفِرُ ٱللَّهُ لَكُمْ ۖ وَهُوَ أَرْحَمُ ٱلرَّٰحِمِينَ", de: "Keine Schelte soll heute über euch kommen. Allah vergibt euch, Er ist ja der Barmherzigste der Barmherzigen.", tr: "“Hayır! Bugün size hiçbir kınama yok! (Ben hakkımı çoktan helâl ettim;) Allah da sizi affetsin. Çünkü O, bütün merhamet edenlerin üstünde mutlak merhamet sahibidir.”" },
  98: { color: "green", ar: "إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ", de: "Er ist ja der Allvergebende und Barmherzige.", tr: "“Hiç şüphesiz O, Ğafûr (günahları çok bağışlayan)dır; Rahîm (bilhassa tevbe ile Kendisine yönelen mü’ min kullarına karşı hususî rahmeti pek bol olan)dır.”" },
  100: { color: "green", ar: "إِنَّ رَبِّى لَطِيفٌۭ لِّمَا يَشَآءُ ۚ إِنَّهُۥ هُوَ ٱلْعَلِيمُ ٱلْحَكِيمُ", de: "Gewiß, mein Herr ist feinfühlig (in der Durchführung dessen), was Er will. Er ist ja der Allwissende und Allweise.", tr: "“Gerçekten Rabbim, her ne dilerse onu pek güzel şekilde ve insanların göremeyeceği bir incelik içinde yerine getirir. Şüphesiz O, evet O, Alîm (her şeyi hakkıyla bilen)dir; Hakîm (bütün hüküm ve icraatında pek çok hikmetler bulunan)dır.”" },
  101: { color: "red", ar: "تَوَفَّنِى مُسْلِمًۭا وَأَلْحِقْنِى بِٱلصَّٰلِحِينَ", de: "Berufe mich als (Dir) ergeben ab und nimm mich unter die Rechtschaffenen auf.", tr: "“Beni Müslüman olarak vefat ettir ve beni salihler içine kat!”" },
    // ✅ 101: birden fazla segment -> array
  101: [
    {
      color: "red",
      ar: "تَوَفَّنِى مُسْلِمًۭا وَأَلْحِقْنِى بِٱلصَّٰلِحِينَ",
      de: "Berufe mich als (Dir) ergeben ab und nimm mich unter die Rechtschaffenen auf.",
      tr: "“Beni Müslüman olarak vefat ettir ve beni salihler içine kat!”",
    },
    {
      color: "green",
      ar: "فَاطِرَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ أَنتَ وَلِىِّۦ فِى ٱلدُّنْيَا وَٱلْءَاخِرَةِ",
      de: "(O Du) Erschaffer der Himmel und der Erde, Du bist mein Schutzherr im Diesseits und Jenseits.",
      tr: "“Ey gökleri ve yeri yaratıp, değişmez bir sistem ve prensipler üzerine oturtan! Sen, dünyada da Âhiret’te de benim sahibim ve gerçek koruyucumsun.”",
    },
  ],

  108: { color: "green", ar: "قُلْ هَٰذِهِۦ سَبِيلِىٓ أَدْعُوٓا۟ إِلَى ٱللَّهِ ۚ عَلَىٰ بَصِيرَةٍ أَنَا۠ وَمَنِ ٱتَّبَعَنِى ۖ وَسُبْحَٰنَ ٱللَّهِ وَمَآ أَنَا۠ مِنَ ٱلْمُشْرِكِينَ", de: "Sag: Das ist mein Weg: Ich rufe zu Allah aufgrund eines sichtbaren Hinweises, ich und diejenigen, die mir folgen. Preis sei Allah! Und ich gehöre nicht zu den Götzendienern.", tr: "“İşte benim (iman, ihlâs ve Tevhid) yolum: Ben, (körü körüne ve taklide dayalı olarak değil,) görerek, delile dayanarak ve insanların idrakine hitap ederek Allah’a çağırıyorum: ben ve bana tâbi olanlar. Ve Allah’ı şirkin her türlüsünden tenzih ederim, asla O’na ortak tanıyanlardan değilim ben.”" },
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
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(ms);
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
function escapeRegexLiteral(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function normalizeArabicSnippet(snippet) {
  return String(snippet || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .trim();
}
function buildArabicLooseRegex(snippet) {
  const base = normalizeArabicSnippet(snippet);
  if (!base) return null;

  const DIACR = "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*";
  const TAT = "\\u0640*";
  const WS = "\\s*";

  const chars = Array.from(base);
  const parts = [];
  for (const ch of chars) {
    if (/\s/.test(ch)) {
      parts.push(WS);
      continue;
    }
    const esc = escapeRegexLiteral(ch);
    parts.push(`${TAT}${esc}${DIACR}`);
  }
  return new RegExp(parts.join(""), "g");
}
function isArabicIgnorable(ch) {
  return /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/.test(ch);
}
function foldArabicChar(ch) {
  switch (ch) {
    case "ٱ":
    case "أ":
    case "إ":
    case "آ":
      return "ا";
    case "ى":
      return "ي";
    case "ؤ":
      return "و";
    case "ئ":
      return "ي";
    case "ة":
      return "ه";
    default:
      return ch;
  }
}
function normalizeArabicForSearch(original) {
  const s = String(original ?? "");
  let norm = "";
  const map = [];

  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (isArabicIgnorable(ch)) continue;

    if (/\s/.test(ch)) {
      if (norm.length && norm[norm.length - 1] !== " ") {
        map.push(i);
        norm += " ";
      }
      continue;
    }

    const folded = foldArabicChar(ch);
    map.push(i);
    norm += folded;
  }

  return { norm: norm.trim().replace(/\s+/g, " "), map };
}
function extendArabicMatchEnd(original, endIndexExclusive) {
  const s = String(original ?? "");
  let end = endIndexExclusive;
  while (end < s.length && isArabicIgnorable(s[end])) end += 1;
  return end;
}
function markArabicByNormalizedMapping(text, snippet, className) {
  const s = String(text ?? "");
  const needleRaw = String(snippet ?? "");
  if (!s || !needleRaw) return null;

  const { norm: textN, map: textMap } = normalizeArabicForSearch(s);
  const { norm: needleN } = normalizeArabicForSearch(needleRaw);
  if (!textN || !needleN) return null;

  const idxN = textN.indexOf(needleN);
  if (idxN < 0) return null;

  const startOrig = textMap[idxN];
  const lastNormPos = idxN + needleN.length - 1;
  const lastOrig = textMap[lastNormPos];
  if (startOrig == null || lastOrig == null) return null;

  const endOrigExclusive = extendArabicMatchEnd(s, lastOrig + 1);

  return (
    <>
      {s.slice(0, startOrig)}
      <span className={className}>{s.slice(startOrig, endOrigExclusive)}</span>
      {s.slice(endOrigExclusive)}
    </>
  );
}
function applyRegexMarkFirst(text, regex, className) {
  const s = String(text ?? "");
  if (!s || !regex) return s;

  regex.lastIndex = 0;
  const m = regex.exec(s);
  if (!m) return s;

  const start = m.index;
  const matchText = m[0] ?? "";
  const end = start + matchText.length;

  return (
    <>
      {s.slice(0, start)}
      <span className={className}>{matchText}</span>
      {s.slice(end)}
    </>
  );
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
  const a = Number(ayah);
  const seg = SEGMENTS[a];
  if (!seg) return s;

  const color = seg.color === "green" ? "green" : "red";
  const rawNeedle = seg[lang];
  if (!rawNeedle) return s;

  if (lang === "ar") {
    const cls = color === "green" ? "mark markGreen" : "mark markRed";
    const mapped = markArabicByNormalizedMapping(s, rawNeedle, cls);
    if (mapped) return mapped;
    const rx = buildArabicLooseRegex(rawNeedle);
    return applyRegexMarkFirst(s, rx, cls);
  }

  const cls = color === "green" ? "fontGreen" : "fontRed";
  const needle = stripOuterQuotes(rawNeedle);

  const direct = splitAndMarkFirst(s, needle, cls);
  if (direct !== s) return direct;

  const sN = normalizeCommon(s);
  const nN = normalizeCommon(needle);
  if (!sN || !nN) return s;
  if (sN.includes(nN)) return <span className={cls}>{s}</span>;

  return s;
}
function useMarkSegmentCached() {
  const cacheRef = useRef(new Map());
  const clear = useCallback(() => cacheRef.current.clear(), []);

  const markSegment = useCallback((text, ayah, lang) => {
    const s = String(text ?? "");
    const key = `${Number(ayah) || 0}|${lang}|${s}`;
    const hit = cacheRef.current.get(key);
    if (hit !== undefined) return hit;

    const out = markSegmentUncached(s, ayah, lang);
    cacheRef.current.set(key, out);
    return out;
  }, []);

  return { markSegment, clearCache: clear };
}

/**
 * Smooth inertial wheel (non-linear).
 */
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

  const RELEASE_MIN_V = 0.10;
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
  const [duration, setDuration] = useState(0);

  const currentTimeRef = useRef(0);
  const [timeUi, setTimeUi] = useState(0);

  const [activeIndex, setActiveIndex] = useState(-1);

  const [repeatMode, setRepeatMode] = useState(0);
  const repeatStateRef = useRef({ idx: -1, done: 0, armed: true, lastFire: 0 });

  const versesRef = useRef(verses);
  const activeIndexRef = useRef(activeIndex);
  const durationRef = useRef(duration);

  const rafRef = useRef(0);
  const lastUiTsRef = useRef(0);
  const UI_FPS = 12;

  const dockRef = useRef(null);

  const { markSegment, clearCache } = useMarkSegmentCached();

  useEffect(() => {
    document.title = "Türkçe-Almanca Kur’an Player";
  }, []);

  useEffect(() => {
    try {
      const ua = navigator.userAgent || "";
      const isSafari = /safari/i.test(ua) && !/chrome|crios|chromium|android/i.test(ua);
      document.documentElement.classList.toggle("isSafari", isSafari);
    } catch {}
  }, []);

  useEffect(() => {
    versesRef.current = verses;
    activeIndexRef.current = activeIndex;
    durationRef.current = duration;
  }, [verses, activeIndex, duration]);

  const audioSrc = useMemo(
    () => (selectedSurah ? resolvePublicUrl(selectedSurah.audioUrl) : ""),
    [selectedSurah]
  );
  const versesSrc = useMemo(
    () => (selectedSurah ? resolvePublicUrl(selectedSurah.versesUrl) : ""),
    [selectedSurah]
  );

  // Only measure dock height on resize (no observer loops)
  useEffect(() => {
    const update = () => {
      const dock = dockRef.current;
      if (!dock) return;
      const h = Math.ceil(dock.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--dockH", `${h}px`);
    };
    const onResize = () => requestAnimationFrame(update);
    update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const seekTo = useCallback((t, autoPlay = false) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(t)) return;

    const d = Number.isFinite(a.duration) ? a.duration : durationRef.current;
    const nextT = Number.isFinite(d) && d > 0 ? clamp(t, 0, d - 0.01) : Math.max(0, t);

    a.currentTime = nextT;
    currentTimeRef.current = nextT;
    setTimeUi(nextT);

    if (autoPlay) a.play().catch(() => {});
  }, []);

  const seekVerse = useCallback(
    (idx, autoPlay = true) => {
      const vs = versesRef.current;
      const v = vs[idx];
      if (!v) return;

      const start = Number(v.start);
      if (!Number.isFinite(start)) return;

      repeatStateRef.current = { idx, done: 0, armed: true, lastFire: 0 };

      seekTo(start, autoPlay);
      setActiveIndex(idx);
      activeIndexRef.current = idx;
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
          throw new Error(
            `Fetch failed: ${res.status} ${res.statusText} | url=${versesSrc} | body=${text.slice(0, 160)}`
          );
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
  }, [versesSrc, clearCache, seekVerse]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const scheduleUi = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame((ts) => {
        rafRef.current = 0;
        const minDt = 1000 / UI_FPS;
        if (ts - (lastUiTsRef.current || 0) < minDt) return;
        lastUiTsRef.current = ts;
        setTimeUi(a.currentTime || 0);
      });
    };

    const onTime = () => {
      currentTimeRef.current = a.currentTime || 0;
      scheduleUi();
    };

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  // repeat loop (interval, lightweight)
  useEffect(() => {
    if (!repeatMode) return;
    const id = window.setInterval(() => {
      const a = audioRef.current;
      if (!a) return;

      const versesNow = versesRef.current;
      if (!versesNow.length) return;

      let idx = activeIndexRef.current;
      const t = currentTimeRef.current;

      if (idx < 0 || !versesNow[idx]) idx = 0;

      const v = versesNow[idx];
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

  const activeVerse = useMemo(() => (activeIndex >= 0 ? verses[activeIndex] : null), [activeIndex, verses]);

  const header = selectedSurah ? (
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
  ) : null;

  const canSeek = Number.isFinite(duration) && duration > 0;
  const currentTime = canSeek ? timeUi : 0;

  return (
    <div className="appShell appShellSolo">
      <main className="content">
        {header}
        {error ? <div className="errorBox">{error}</div> : null}
        <SinglePlayerMain verse={activeVerse} markSegment={markSegment} />
      </main>

      <div className="bottomDock" ref={dockRef} aria-label="Bottom Player">
        <audio ref={audioRef} src={audioSrc} preload="metadata" playsInline />

        {/* SEEK BAR TOP */}
        <div className="dockSeekTop">
          <input
            className="dockSeek"
            type="range"
            min={0}
            max={canSeek ? duration : 0}
            step={0.01}
            value={canSeek ? currentTime : 0}
            disabled={!canSeek}
            onChange={(e) => seekTo(Number(e.target.value), isPlaying)}
            aria-label="MP3 seek bar"
          />
        </div>

        {/* ONE HORIZONTAL ROW */}
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
                seekVerse(next, isPlaying);
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
