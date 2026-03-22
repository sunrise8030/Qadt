// =========================
// FILE: src/App.jsx
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
];

/**
 * SEGMENTS:
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
  87: {
    color: "green",
    ar: "وَلَا تَا۟يْـَٔسُوا۟ مِن رَّوْحِ ٱللَّهِ ۖ إِنَّهُۥ لَا يَا۟يْـَٔسُ مِن رَّوْحِ ٱللَّهِ إِلَّا ٱلْقَوْمُ ٱلْكَٰفِرُونَ",
    de: "Und gebt nicht die Hoffnung auf das Erbarmen Allahs auf. Es gibt die Hoffnung auf das Erbarmen Allahs nur das ungläubige Volk auf.",
    tr: "“Allah’ın rahmetinden asla ümidinizi kesmeyin. Şurası bir gerçek ki, O’na inanmayan kâfirler güruhu dışında hiç kimse Allah’ın rahmetinden ümit kesmez.”",
  },
  88: { color: "green", ar: "إِنَّ ٱللَّهَ يَجْزِى ٱلْمُتَصَدِّقِينَ", de: "Allah vergilt denjenigen, die Almosen geben.", tr: "“Hiç kuşkusuz Allah, fazladan iyilikte bulunanları bol bol mükâfatlandırır.”" },
  90: { color: "green", ar: "إِنَّ ٱللَّهُ لَا يُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ", de: "Gewiß, Allah läßt den Lohn der Gutes Tuenden nicht verlorengehen.", tr: "“Doğrusu şu ki, kim O’na karşı derin saygı duyar, O’na karşı gelmekten sakınır ve O’na itaatla birlikte başına gelenlere de sabrederse, hiç şüphesiz Allah, böyle iyiliğe adanmış ve O’nu görürcesine davranan kimselerin mükâfatını asla zayi etmez.”" },
  91: { color: "green", ar: "تَٱللَّهِ لَقَدْ ءَاثَرَكَ ٱللَّهُ عَلَيْنَا وَإِن كُنَّا لَخَٰطِـِٔينَ", de: "Bei Allah, Allah hat dich uns vorgezogen. Und wir haben wahrlich Verfehlungen begangen.", tr: "“Allah’a yemin olsun ki, gerçekten Allah seni bize tercih etti; biz, başka değil, ancak bir yanlış içinde idik.”" },
  92: { color: "green", ar: "لَا تَثْرِيبَ عَلَيْكُمُ ٱلْيَوْمَ ۖ يَغْفِرُ ٱللَّهُ لَكُمْ ۖ وَهُوَ أَرْحَمُ ٱلرَّٰحِمِينَ", de: "Keine Schelte soll heute über euch kommen. Allah vergibt euch, Er ist ja der Barmherzigste der Barmherzigen.", tr: "“Hayır! Bugün size hiçbir kınama yok! (Ben hakkımı çoktan helâl ettim;) Allah da sizi affetsin. Çünkü O, bütün merhamet edenlerin üstünde mutlak merhamet sahibidir.”" },
  98: { color: "green", ar: "إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ", de: "Er ist ja der Allvergebende und Barmherzige.", tr: "“Hiç şüphesiz O, Ğafûr (günahları çok bağışlayan)dır; Rahîm (bilhassa tevbe ile Kendisine yönelen mü’ min kullarına karşı hususî rahmeti pek bol olan)dır.”" },
  100: { color: "green", ar: "إِنَّ رَبِّى لَطِيفٌۭ لِّمَا يَشَآءُ ۚ إِنَّهُۥ هُوَ ٱلْعَلِيمُ ٱلْحَكِيمُ", de: "Gewiß, mein Herr ist feinfühlig (in der Durchführung dessen), was Er will. Er ist ja der Allwissende und Allweise.", tr: "“Gerçekten Rabbim, her ne dilerse onu pek güzel şekilde ve insanların göremeyeceği bir incelik içinde yerine getirir. Şüphesiz O, evet O, Alîm (her şeyi hakkıyla bilen)dir; Hakîm (bütün hüküm ve icraatında pek çok hikmetler bulunan)dır.”" },
  101: { color: "red", ar: "تَوَفَّنِى مُسْلِمًۭا وَأَلْحِقْنِى بِٱلصَّٰلِحِينَ", de: "Berufe mich als (Dir) ergeben ab und nimm mich unter die Rechtschaffenen auf.", tr: "“Beni Müslüman olarak vefat ettir ve beni salihler içine kat!”" },
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
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(ms);
    }
  } catch {}
}

/* active verse index */

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

function findActiveVerseIndexLinearOverlapSafe(verses, t) {
  if (!Array.isArray(verses) || verses.length === 0 || !Number.isFinite(t)) return -1;

  let bestIdx = -1;
  let bestStart = -Infinity;

  for (let i = 0; i < verses.length; i += 1) {
    const v = verses[i];
    const start = Number(v?.start);
    const end = Number(v?.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    if (start <= t && t < end && start > bestStart) {
      bestStart = start;
      bestIdx = i;
    }
  }
  if (bestIdx !== -1) return bestIdx;

  let closest = -1;
  let bestDelta = Infinity;
  for (let i = 0; i < verses.length; i += 1) {
    const start = Number(verses[i]?.start);
    if (!Number.isFinite(start)) continue;
    const d = Math.abs(t - start);
    if (d < bestDelta) {
      bestDelta = d;
      closest = i;
    }
  }
  return closest;
}

/* sticky scroll helper */
function getStickyOverlayTopPx() {
  const el = document.querySelector(".playerSticky");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.height <= 0) return null;
  if (r.bottom <= 0 || r.top >= window.innerHeight) return null;
  return r.top;
}

function ensureRowVisible(el, padding = 10) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const overlayTop = getStickyOverlayTopPx();

  const viewportTop = padding;
  const viewportBottom = window.innerHeight - padding;
  const effectiveBottom =
    overlayTop != null ? Math.min(viewportBottom, overlayTop - padding) : viewportBottom;

  const above = r.top < viewportTop;
  const below = r.bottom > effectiveBottom;

  if (above || below) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* JSON tolerant */
function parseJsonTolerant(text, urlForMsg = "") {
  const raw = String(text ?? "");
  let s = raw.replace(/^\uFEFF/, "").trim();

  if (
    s.startsWith("<!doctype") ||
    s.startsWith("<html") ||
    s.startsWith("<head") ||
    s.startsWith("<")
  ) {
    throw new Error(`Expected JSON but got HTML | url=${urlForMsg} | head=${s.slice(0, 80)}`);
  }

  s = s.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(s);
  } catch (e) {
    const msg = String(e?.message || e);
    const m = msg.match(/position\s+(\d+)/i);
    if (m) {
      const pos = Number(m[1]);
      const from = Math.max(0, pos - 80);
      const to = Math.min(s.length, pos + 80);
      const ctx = s.slice(from, to).replaceAll("\n", "\\n");
      throw new Error(`JSON parse failed | url=${urlForMsg} | pos=${pos} | ctx=...${ctx}...`);
    }
    throw new Error(`JSON parse failed | url=${urlForMsg} | msg=${msg}`);
  }
}

/* segment marking */

function stripOuterQuotes(s) {
  const t = String(s ?? "").trim();
  return t.replace(/^["“”]+/, "").replace(/["“”]+$/, "").trim();
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

  const clear = useCallback(() => {
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

  return { markSegment, clearCache: clear };
}

/* UI */

function MinimalPlayerBar({ isPlaying, onPlayPause, onPrev, onNext, onOpenSingle }) {
  return (
    <div className="playerControls">
      <div className="liveTimeBar">
        <div className="liveTime">
          <span className="liveLabel">PLAYER</span>
        </div>
        <div className="liveActions">
          <button className="btnPrimary" type="button" onClick={onPlayPause}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button className="btnSmall" type="button" onClick={onPrev} title="Prev ayah">
            ◀
          </button>
          <button className="btnSmall" type="button" onClick={onNext} title="Next ayah">
            ▶
          </button>
          <button className="btnSinglePlayer" type="button" onClick={onOpenSingle}>
            Single Player
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * iOS-like vertical wheel (3D) - accel + inertia tuned
 */
function IOSPickerWheelVertical3D({ disabled, value, onStep }) {
  const ref = useRef(null);

  const draggingRef = useRef(false);
  const lastYRef = useRef(0);
  const lastTsRef = useRef(0);

  const velRef = useRef(0);
  const accumPxRef = useRef(0);
  const rafRef = useRef(0);

  const lastVibeRef = useRef(0);

  const STEP_PX = 8;
  const MAX_STEPS_PER_TICK = 18;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    velRef.current = 0;
    accumPxRef.current = 0;
  };

  const tickSteps = () => {
    let did = false;
    let steps = 0;

    while (accumPxRef.current <= -STEP_PX && steps < MAX_STEPS_PER_TICK) {
      onStep(+1);
      accumPxRef.current += STEP_PX;
      did = true;
      steps += 1;
    }

    while (accumPxRef.current >= STEP_PX && steps < MAX_STEPS_PER_TICK) {
      onStep(-1);
      accumPxRef.current -= STEP_PX;
      did = true;
      steps += 1;
    }

    if (did) {
      const now = performance.now();
      if (now - (lastVibeRef.current || 0) > 70) {
        lastVibeRef.current = now;
        tactilePulse(8);
      }
    }
  };

  const startInertia = () => {
    const v0 = velRef.current;

    // boost fling inertia
    velRef.current = v0 * 2.8;

    if (!Number.isFinite(v0) || Math.abs(v0) < 0.03) {
      stop();
      return;
    }

    const DECAY = 0.0016;
    const MAX_MS = 2600;

    const startTs = performance.now();
    let last = performance.now();

    const frame = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;

      const sign = Math.sign(velRef.current || v0);
      const sp = Math.abs(velRef.current || v0);
      const nextSp = Math.max(0, sp * (1 - DECAY * dt));
      velRef.current = sign * nextSp;

      accumPxRef.current += velRef.current * dt;
      tickSteps();

      if (nextSp < 0.03 || now - startTs > MAX_MS) {
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
    lastYRef.current = e.clientY;
    lastTsRef.current = performance.now();
    ref.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (disabled || !draggingRef.current) return;

    const now = performance.now();
    const dy = e.clientY - lastYRef.current;
    const dt = Math.max(1, now - (lastTsRef.current || now));

    lastYRef.current = e.clientY;
    lastTsRef.current = now;

    velRef.current = dy / dt;

    // acceleration: faster drag => faster stepping
    const sp = Math.abs(velRef.current); // px/ms
    const mult = clamp(1 + sp * 26, 1, 7.5);

    accumPxRef.current += dy * mult;
    tickSteps();
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    startInertia();
  };

  const onWheel = (e) => {
    if (disabled) return;
    e.preventDefault();
    stop();

    const dy = e.deltaY;
    const steps = clamp(Math.round(Math.abs(dy) / 9), 1, 28);
    const dir = dy < 0 ? +1 : -1;

    for (let i = 0; i < steps; i += 1) onStep(dir);

    const now = performance.now();
    if (now - (lastVibeRef.current || 0) > 70) {
      lastVibeRef.current = now;
      tactilePulse(8);
    }

    velRef.current = clamp(dy / 360, -3.6, 3.6);
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
      <div className="spPickerShine" />
      <div className="spPickerFadeTop" />
      <div className="spPickerFadeBottom" />
      <div className="spPickerBar" />

      <div
        ref={ref}
        className="spPickerViewport"
        role="slider"
        aria-label="Ayet çarkı"
        tabIndex={disabled ? -1 : 0}
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
            const scale = clamp(1 - abs / 220, 0.86, 1);

            return (
              <div
                key={n}
                className={`spPickerItem3D ${active ? "active" : ""}`}
                style={{
                  opacity,
                  filter: "none",
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

function SinglePlayerPanel({
  open,
  verse,
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  onClose,
  dialDisabled,
  onDialStep,
  repeatMode,
  onToggleRepeat,
  markSegment,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.code === "Space") {
        e.preventDefault();
        onPlayPause();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNext();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        onToggleRepeat();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPlayPause, onPrev, onNext, onToggleRepeat]);

  if (!open) return null;

  const ay = Number(verse?.ayah || 0);

  return (
    <div className="singlePlayerBackdrop" role="dialog" aria-modal="true" aria-label="Single Player">
      <div className="singlePlayerCard" role="document">
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

          <div style={{ height: 140 }} />
        </div>
      </div>

      <div className="singlePlayerDockBottom" aria-label="Player Dock">
        <div className="singlePlayerDockRow">
          <button className="spBtn" type="button" onClick={onPrev} aria-label="Prev">
            ◀
          </button>

          <button className="spBtn spBtnPrimary" type="button" onClick={onPlayPause} aria-label="Play/Pause">
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button className="spBtn" type="button" onClick={onNext} aria-label="Next">
            ▶
          </button>

          <IOSPickerWheelVertical3D disabled={dialDisabled} value={ay} onStep={onDialStep} />

          <button
            className={`spRBtn ${repeatMode ? "on" : "off"}`}
            type="button"
            onClick={() => {
              tactilePulse(10);
              onToggleRepeat();
            }}
            aria-label="Repeat"
            title="Repeat (R)"
          >
            {repeatMode === 2 ? "rr" : "r"}
          </button>

          <button className="spBtn spBtnClose" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

const VerseRow = React.memo(function VerseRow({ v, idx, active, onRowClick, setRowRef, markSegment }) {
  const ay = Number(v?.ayah || 0);

  const arText = (v.ar || "").trimStart();
  const deText = (v.de || "").replace(/\s*\n+\s*/g, " ").trim();
  const trText = (v.tr || "").replace(/\s*\n+\s*/g, " ").trim();

  return (
    <button
      type="button"
      className={`row ${active ? "active" : ""}`}
      onClick={() => onRowClick(idx)}
      ref={(el) => setRowRef(idx, el)}
    >
      <div className="cell colNo">{v.ayah}</div>

      <div className="cell colAr" dir="rtl">
        {markSegment(arText, ay, "ar")}
      </div>

      <div className="cell colDe">{markSegment(deText, ay, "de")}</div>
      <div className="cell colTr">{markSegment(trText, ay, "tr")}</div>
    </button>
  );
});

const VersesTable = React.memo(function VersesTable({ verses, activeIndex, onRowClick, setRowRef, markSegment }) {
  return (
    <div className="tableWrap" role="region" aria-label="Verses">
      <div className="tableHeader">
        <div className="colNo">No</div>
        <div className="colAr">Arabic</div>
        <div className="colDe">German</div>
        <div className="colTr">Turkish</div>
      </div>

      <div className="tableBody" role="table">
        {verses.map((v, idx) => (
          <VerseRow
            key={`${v.ayah}-${idx}`}
            v={v}
            idx={idx}
            active={idx === activeIndex}
            onRowClick={onRowClick}
            setRowRef={setRowRef}
            markSegment={markSegment}
          />
        ))}
      </div>
    </div>
  );
});

export default function App() {
  const selectedSurah = SURAHES[0];

  const [verses, setVerses] = useState([]);
  const [error, setError] = useState("");

  const audioRef = useRef(null);
  const rowRefs = useRef([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [singleOn, setSingleOn] = useState(true);

  // repeat: 0 off, 1 => 1 tekrar, 2 => 2 tekrar
  const [repeatMode, setRepeatMode] = useState(0);
  const repeatStateRef = useRef({ idx: -1, done: 0, armed: true, lastFire: 0 });

  const versesRef = useRef(verses);
  const activeIndexRef = useRef(activeIndex);
  const durationRef = useRef(duration);
  const isPlayingRef = useRef(isPlaying);

  const currentTimeRef = useRef(0);

  const [tick, setTick] = useState(0);
  const rafRef = useRef(0);
  const lastUiTsRef = useRef(0);
  const UI_FPS = 12;

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
    isPlayingRef.current = isPlaying;
  }, [verses, activeIndex, duration, isPlaying]);

  // Lock background while single player open (scroll freeze)
  useEffect(() => {
    if (!singleOn) {
      document.body.classList.remove("spOpen");
      return;
    }

    const y = window.scrollY || 0;
    document.body.dataset.spScrollY = String(y);
    document.body.style.top = `-${y}px`;
    document.body.classList.add("spOpen");

    return () => {
      const saved = Number(document.body.dataset.spScrollY || 0);
      document.body.classList.remove("spOpen");
      document.body.style.top = "";
      delete document.body.dataset.spScrollY;
      window.scrollTo(0, saved);
    };
  }, [singleOn]);

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

  // Load verses
  useEffect(() => {
    let cancelled = false;

    setError("");
    setVerses([]);
    setActiveIndex(-1);

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
          rowRefs.current = [];
          setVerses(data);
          setSingleOn(true);
        }
      } catch (e) {
        console.error("[verses] load failed:", e);
        if (!cancelled) setError(`Verses could not be loaded: ${e.message}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [versesSrc, clearCache]);

  // Audio listeners (tick throttled)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const scheduleTick = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame((ts) => {
        rafRef.current = 0;
        const minDt = 1000 / UI_FPS;
        if (ts - (lastUiTsRef.current || 0) < minDt) return;
        lastUiTsRef.current = ts;
        setTick((x) => x + 1);
      });
    };

    const onTime = () => {
      currentTimeRef.current = a.currentTime || 0;
      scheduleTick();
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

  const seekTo = useCallback((t, autoPlay = false) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(t)) return;

    const d = Number.isFinite(a.duration) ? a.duration : durationRef.current;
    const nextT = Number.isFinite(d) && d > 0 ? clamp(t, 0, d - 0.01) : Math.max(0, t);

    a.currentTime = nextT;
    currentTimeRef.current = nextT;

    if (autoPlay) a.play().catch(() => {});
  }, []);

  const seekVerse = useCallback(
    (idx, autoPlay = true) => {
      const v = versesRef.current[idx];
      if (!v) return;
      const start = Number(v.start);
      if (!Number.isFinite(start)) return;

      repeatStateRef.current = { idx, done: 0, armed: true, lastFire: 0 };
      seekTo(start, autoPlay);
    },
    [seekTo]
  );

  useEffect(() => {
    if (!singleOn) return;
    if (!verses.length) return;
    if (activeIndexRef.current >= 0) return;
    seekVerse(0, false);
  }, [singleOn, verses.length, seekVerse]);

  const onPlayPause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }, []);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
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

  // Active index update + repeat engine (tick-driven)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    // Active verse
    if (verses.length) {
      const t = currentTimeRef.current;
      const idx = monotonic ? findActiveVerseIndexBinary(starts, ends, t) : findActiveVerseIndexLinearOverlapSafe(verses, t);

      if (idx !== -1 && idx !== activeIndexRef.current) {
        setActiveIndex(idx);
        const el = rowRefs.current[idx];
        if (el) ensureRowVisible(el, 10);
      }
    }

    // Repeat engine
    if (!verses.length) return;
    if (repeatMode <= 0) return;

    let idx = activeIndexRef.current;
    const t = currentTimeRef.current;

    if (idx < 0 || !verses[idx]) idx = 0;

    const v = verses[idx];
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
      a.play().catch(() => {});
      return;
    }

    repeatStateRef.current.done = 0;
    a.pause();
    a.currentTime = s;
    currentTimeRef.current = s;
  }, [tick, verses, monotonic, starts, ends, repeatMode]);

  const activeVerse = useMemo(() => (activeIndex >= 0 ? verses[activeIndex] : null), [activeIndex, verses]);
  const dialDisabled = !verses.length;

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
      <div className="surahBadges">
        <span className="badge">Slug: {selectedSurah.slug}</span>
        <span className="badge">Ayahs: {selectedSurah.ayahCount}</span>
        <span className="badge">Loaded: {verses.length}</span>
      </div>
    </div>
  ) : null;

  const onRowClick = useCallback(
    (idx) => {
      seekVerse(idx, true);
    },
    [seekVerse]
  );

  const setRowRef = useCallback((idx, el) => {
    rowRefs.current[idx] = el;
  }, []);

  return (
    <div className="appShell appShellSolo">
      <main className="content">
        {header}
        {error ? <div className="errorBox">{error}</div> : null}

        <SinglePlayerPanel
          open={singleOn}
          verse={activeVerse}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onPrev={prevAyah}
          onNext={nextAyah}
          onClose={() => {
            setSingleOn(false);
            pause();
          }}
          dialDisabled={dialDisabled}
          onDialStep={(dir) => {
            const vs = versesRef.current;
            if (!vs.length) return;
            const cur = activeIndexRef.current;
            const base = cur >= 0 ? cur : 0;
            const next = clamp(base + dir, 0, Math.max(0, vs.length - 1));
            seekVerse(next, isPlayingRef.current);
          }}
          repeatMode={repeatMode}
          onToggleRepeat={toggleRepeat}
          markSegment={markSegment}
        />

        <div className="playerCard playerSticky">
          <audio ref={audioRef} src={audioSrc} preload="metadata" />
          <MinimalPlayerBar
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onPrev={prevAyah}
            onNext={nextAyah}
            onOpenSingle={() => setSingleOn(true)}
          />
        </div>

        <VersesTable
          verses={verses}
          activeIndex={activeIndex}
          onRowClick={onRowClick}
          setRowRef={setRowRef}
          markSegment={markSegment}
        />
      </main>
    </div>
  );
}


// =========================
// FILE: src/styles.css
// =========================
:root{
  --bg:#0b0f16;
  --panel:#0f1520;
  --border:rgba(255,255,255,0.08);
  --text:rgba(255,255,255,0.92);
  --muted:rgba(255,255,255,0.62);
  --accent:rgba(99,179,237,1);
  --danger:rgba(255,120,120,0.18);

  --w-no: 70px;
  --w-ar: 1.1fr;
  --w-de: 1fr;
  --w-tr: 1fr;

  --markRed: rgba(235, 78, 62, 1);
  --markRedBg: rgba(235, 78, 62, 0.18);
  --markGreen: rgba(82, 210, 140, 1);
  --markGreenBg: rgba(82, 210, 140, 0.16);
}

*{ box-sizing:border-box; }

html,body{
  height:100%;
  margin:0;
  background:
    radial-gradient(1200px 800px at 30% 15%, rgba(120,120,255,0.12), transparent 55%),
    radial-gradient(1200px 800px at 70% 35%, rgba(255,120,120,0.10), transparent 55%),
    var(--bg);
  color:var(--text);
  font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,"Noto Sans","Apple Color Emoji","Segoe UI Emoji";
}

.muted{ color:var(--muted); }
.mono{ font-variant-numeric:tabular-nums; }

.appShell{ display:grid; grid-template-columns: 1fr; min-height:100vh; }
.appShellSolo{ grid-template-columns: 1fr !important; }

.content{ padding:16px; }

/* header */
.surahHeader{
  border:1px solid var(--border);
  background:rgba(15,21,32,0.55);
  border-radius:16px;
  padding:14px 16px;
  display:grid;
  grid-template-columns:1fr auto;
  gap:10px;
}
.surahTitle{ margin:0; font-size:20px; }
.surahSub{ color:var(--muted); margin-top:3px; }
.surahHeaderRight{ font-size:18px; align-self:start; }
.surahBadges{ grid-column:1 / -1; display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
.badge{
  font-size:12px;
  color:var(--muted);
  border:1px solid var(--border);
  background:rgba(0,0,0,0.18);
  padding:6px 10px;
  border-radius:999px;
}

.errorBox{
  margin-top:12px;
  border:1px solid rgba(255,120,120,0.35);
  background:var(--danger);
  border-radius:12px;
  padding:10px 12px;
}

/* Player bar */
.playerCard{
  margin-top:14px;
  border:1px solid var(--border);
  background:rgba(15,21,32,0.55);
  border-radius:16px;
  padding:12px;
  position:relative;
}
.playerSticky{
  position:sticky;
  top:10px;
  z-index:20;
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
}
.playerControls{ display:grid; gap:10px; }

.liveTimeBar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
}
.liveTime{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
.liveActions{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.liveLabel{
  font-size:12px;
  color:var(--muted);
  border:1px solid var(--border);
  background:rgba(0,0,0,0.18);
  padding:4px 8px;
  border-radius:999px;
}

.btnSmall,.btnPrimary{
  border:1px solid var(--border);
  background:rgba(0,0,0,0.22);
  color:var(--text);
  cursor:pointer;
  border-radius:10px;
}
.btnSmall{ padding:8px 10px; }
.btnPrimary{
  padding:12px 18px;
  border-radius:12px;
  font-size:14px;
  font-weight:800;
  border-color: rgba(99,179,237,0.35);
  box-shadow: 0 0 0 2px rgba(99,179,237,0.10) inset;
}
.btnSmall:hover,.btnPrimary:hover{ border-color:rgba(255,255,255,0.16); }

/* Single Player button */
.btnSinglePlayer{
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 950;
  cursor: pointer;
  color: rgba(10,14,22,0.98);
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(180deg, rgba(170,220,255,1), rgba(99,179,237,1));
  box-shadow:
    0 10px 22px rgba(0,0,0,0.35),
    0 3px 0 rgba(255,255,255,0.22) inset,
    0 -6px 10px rgba(0,0,0,0.25) inset;
  transform: translateY(0);
}
.btnSinglePlayer:hover{ filter: brightness(1.06); }
.btnSinglePlayer:active{
  transform: translateY(2px);
  box-shadow:
    0 6px 14px rgba(0,0,0,0.30),
    0 2px 0 rgba(255,255,255,0.18) inset,
    0 -4px 8px rgba(0,0,0,0.22) inset;
}

/* Table */
.tableWrap{
  margin-top:14px;
  border:1px solid var(--border);
  background:rgba(15,21,32,0.55);
  border-radius:16px;
  overflow:auto;
}
.tableHeader, .row{ min-width:980px; }

.tableHeader{
  display:grid;
  grid-template-columns: var(--w-no) var(--w-ar) var(--w-de) var(--w-tr);
  padding:12px;
  border-bottom:1px solid var(--border);
  color:var(--muted);
  font-size:13px;
  position:sticky;
  top:0;
  background:rgba(15,21,32,0.90);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  z-index:2;
}

.row{
  display:grid;
  grid-template-columns: var(--w-no) var(--w-ar) var(--w-de) var(--w-tr);
  border-bottom:1px solid rgba(255,255,255,0.06);
  padding:10px 12px;
  text-align:left;
  color:inherit;
  cursor:pointer;
  align-items: stretch;
}
.tableBody .row:nth-child(odd){ background-color: rgba(255,255,255,0.05); }
.tableBody .row:nth-child(even){ background-color: rgba(0,0,0,0.18); }
.row:hover{ filter: brightness(1.06); }
.row.active{
  background-color: rgba(99,179,237,0.14) !important;
  box-shadow: 0 0 0 1px rgba(99,179,237,0.35) inset;
}

.cell{
  padding-right:10px;
  border-right:1px solid rgba(255,255,255,0.06);
  display:flex;
  align-items:flex-start;
  min-height: 100%;
  white-space: normal;
}
.cell:last-child{ border-right:none; }

.colNo{ color:var(--muted); font-variant-numeric:tabular-nums; }
.colAr{
  display:block !important;
  direction: rtl;
  unicode-bidi: isolate-override;
  text-align: right;
  font-size: 18px;
  line-height: 1.55;
  padding-left: 12px;
  font-family: "Noto Naskh Arabic","Amiri","Scheherazade New","Noto Sans Arabic", serif;
  white-space: normal;
}
.colDe, .colTr{
  font-size:14px;
  line-height:1.5;
  text-align:left;
}

/* Single line in table for TR/DE (no paragraph look) */
.colDe, .colTr{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Single Player overlay */
@keyframes spBackdropIn{
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0px); }
}

.singlePlayerBackdrop{
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.78); /* less transparent */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: 14px;
  animation: spBackdropIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
  overflow: hidden;
  pointer-events: auto;
}

.singlePlayerCard{
  width: min(1100px, 100%);
  background: rgba(15,21,32,0.86);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  box-shadow: 0 30px 90px rgba(0,0,0,0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 14px;
  max-height: 86vh;
  overflow: auto;
}

.singlePlayerLines{ display: grid; gap: 10px; }

.singlePlayerLine{
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(0,0,0,0.14);
}
.singlePlayerLines > :nth-child(odd){ background: rgba(255,255,255,0.06); }

.singlePlayerLineAr{
  direction: rtl;
  unicode-bidi: isolate-override;
  text-align: right;
  font-family: "Noto Naskh Arabic","Amiri","Scheherazade New","Noto Sans Arabic", serif;
  font-size: clamp(44px, 7.0vw, 78px);
  line-height: 1.75;
  white-space: pre-wrap;
}
.singlePlayerLineDe,
.singlePlayerLineTr{
  font-size: clamp(26px, 4.0vw, 40px);
  line-height: 1.55;
  white-space: pre-wrap;
}
.singlePlayerLineDe{ color: rgba(255,255,255,0.82); }

/* Buttons */
.spBtn{
  min-width: 66px;
  height: 66px;
  padding: 0 16px;
  border-radius: 18px;
  cursor:pointer;
  font-weight: 950;
  font-size: 26px;
  color: rgba(10,14,22,0.98);
  border: 1px solid rgba(255,255,255,0.22);
  background: linear-gradient(180deg, rgba(210,235,255,1), rgba(145,205,250,1));
  box-shadow:
    0 10px 22px rgba(0,0,0,0.38),
    0 3px 0 rgba(255,255,255,0.22) inset,
    0 -6px 10px rgba(0,0,0,0.22) inset;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  touch-action: manipulation;
}
.spBtn:active{
  transform: translateY(2px);
  box-shadow:
    0 6px 14px rgba(0,0,0,0.32),
    0 2px 0 rgba(255,255,255,0.18) inset,
    0 -4px 8px rgba(0,0,0,0.20) inset;
}
.spBtnPrimary{
  min-width: 118px;
  height: 74px;
  font-size: 30px;
  background: linear-gradient(180deg, rgba(200,255,220,1), rgba(110,230,165,1));
}
.spBtnClose{
  background: linear-gradient(180deg, rgba(255,220,220,1), rgba(255,150,150,1));
}

/* Wheel */
.spPicker3D{
  width: 120px;
  height: 160px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(0,0,0,0.18);
  box-shadow:
    0 14px 28px rgba(0,0,0,0.35),
    0 3px 0 rgba(255,255,255,0.14) inset,
    0 -10px 16px rgba(0,0,0,0.22) inset;
  position: relative;
  overflow: hidden;
  touch-action: none;
  flex: 0 0 auto;
}
.spPicker3D.disabled{ opacity: 0.55; pointer-events:none; }
.spPickerViewport{
  width: 100%;
  height: 100%;
  outline: none;
  display:grid;
  place-items:center;
  perspective: 980px;
}
.spPickerItems3D{
  width: 100%;
  height: 100%;
  display:grid;
  place-items:center;
  transform-style: preserve-3d;
}
.spPickerItem3D{
  position:absolute;
  width: 100%;
  text-align:center;
  font-variant-numeric: tabular-nums;
  font-weight: 950;
  font-size: 34px;
  letter-spacing: 0.6px;
  color: rgba(255,255,255,0.20);
  transform-origin: center center;
  text-shadow: 0 2px 10px rgba(0,0,0,0.25);
}
.spPickerItem3D.active{
  color: rgba(255,255,255,0.96);
  text-shadow: 0 2px 14px rgba(0,0,0,0.38);
}
.spPickerShine{
  position:absolute;
  inset:-10px;
  background:
    radial-gradient(120px 220px at 30% 45%, rgba(255,255,255,0.10), transparent 60%),
    radial-gradient(120px 220px at 70% 55%, rgba(99,179,237,0.10), transparent 60%);
  pointer-events:none;
  mix-blend-mode: screen;
  opacity: 0.9;
}
.spPickerBar{
  position:absolute;
  left: 10px;
  right: 10px;
  top: 50%;
  height: 46px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.18) inset,
    0 10px 24px rgba(0,0,0,0.22);
  pointer-events:none;
}
.spPickerFadeTop{
  position:absolute;
  left:0; right:0; top:0;
  height: 46%;
  background: linear-gradient(180deg, rgba(15,21,32,0.95), rgba(15,21,32,0.00));
  pointer-events:none;
}
.spPickerFadeBottom{
  position:absolute;
  left:0; right:0; bottom:0;
  height: 46%;
  background: linear-gradient(0deg, rgba(15,21,32,0.95), rgba(15,21,32,0.00));
  pointer-events:none;
}

/* Repeat button */
.spRBtn{
  min-width: 56px;
  height: 56px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(0,0,0,0.18);
  color: rgba(255,255,255,0.70);
  font-weight: 950;
  font-size: 18px;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 10px 22px rgba(0,0,0,0.30),
    0 3px 0 rgba(255,255,255,0.12) inset,
    0 -6px 10px rgba(0,0,0,0.20) inset;
}
.spRBtn.off{ opacity: 0.55; }
.spRBtn.on{
  color: rgba(10,14,22,0.98);
  background: linear-gradient(180deg, rgba(170,220,255,1), rgba(99,179,237,1));
  border-color: rgba(255,255,255,0.22);
}
.spRBtn:active{ transform: translateY(1px); }

/* Bottom dock */
.singlePlayerDockBottom{
  position: fixed !important;
  right: 14px !important;
  left: auto !important;
  bottom: calc(14px + env(safe-area-inset-bottom)) !important;
  top: auto !important;
  transform: none !important;
  z-index: 10001 !important;
  width: min(640px, calc(100% - 28px)) !important;
  max-width: calc(100% - 28px) !important;
  padding: 10px !important;
  border-radius: 18px !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  background: rgba(0,0,0,0.24) !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  white-space: nowrap !important;
}
.singlePlayerDockRow{
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* Segment styles */
.mark{
  display:inline;
  padding: 0.10em 0.34em;
  border-radius: 0.55em;
  margin: 0 0.06em;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.10) inset,
    0 18px 50px rgba(0,0,0,0.18);
  text-shadow: 0 2px 16px rgba(0,0,0,0.40);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.markRed{ color: var(--markRed) !important; background: var(--markRedBg); }
.markGreen{ color: var(--markGreen) !important; background: var(--markGreenBg); }
.fontRed{ color: var(--markRed) !important; }
.fontGreen{ color: var(--markGreen) !important; }

/* Body freeze when single player open */
body.spOpen{
  position: fixed;
  width: 100%;
  overflow: hidden;
}

/* Safari fallback */
.isSafari .playerSticky,
.isSafari .singlePlayerBackdrop,
.isSafari .singlePlayerCard{
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
.isSafari .row:hover{ filter: none !important; }

@media (max-width:700px){
  :root{
    --w-no: 60px;
    --w-ar: 1.2fr;
    --w-tr: 1fr;
    --w-de: 0fr;
  }

  .tableHeader, .row{
    min-width:680px;
    grid-template-columns: var(--w-no) var(--w-ar) var(--w-tr);
  }
  .colDe{ display:none; }
}
