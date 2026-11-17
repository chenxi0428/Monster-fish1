// Bundled game — works from file:// protocol
var _m = {};

// ======== config.js ========
(function() {
  var _m = window._m;
  _m.config = {};
// Monster Fish Exhibition - Configuration
// All constants, fish data, and text content

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
// Requirement: the kiosk restarts itself after 2 minutes without interaction.
const IDLE_TIMEOUT_MS = 120000;
// Safety net for the closing information page: returns to the start page by
// itself if the visitor walks away (the card no longer shows a hint line).
const THREATENED_APP_TIMEOUT_MS = 45000;
const CORRECTION_POPUP_DURATION_MS = 5000;
const ANIMATED_PAGE_DURATION_MS = 10000;
// Client review 2026-10-20: "将市场场景的结尾缩短约 2 秒，因为目前时长过长" —
// the market branch runs 2 s shorter than the river branch (the river fish still
// has to swim away, so that page keeps the full 10 s).
const KEEP_MARKET_DURATION_MS = ANIMATED_PAGE_DURATION_MS - 2000;
// Client review 2026-10-21: "我需要在市场卖鱼和放生鱼那部分文字的亮暗部分加一个过渡
// 动画，不要马上变暗" — and 2026-10-23 ("after the timer bar finished on this page it
// sort of flashes. can remove the flash?"). The dim now happens **inside the last
// ENDING_DIM_FADE_MS of the branch animation** — together with the top band, the
// credit line, the progress bar and (market branch) the flopping fish fading out —
// so when the closing information page takes over, its first frame already looks
// exactly like the animation's last frame. No brightness jump, no flash.
const ENDING_DIM_FADE_MS = 1200;
// The opacity of that dim layer, shared by the animated endings and the closing
// page so the hand-over frame matches.
const ENDING_DIM_ALPHA = 0.58;
// Client review 2026-10-22: "手机滑入取消掉，改成倒计时后手机滑出" — the install
// step now shows the phone in place, and it slides off to the right when the
// countdown ends. Keep in sync with --phone-slide-out in css/style.css.
const PHONE_SLIDE_OUT_MS = 1600;
// Client review 2026-10-23 (install step): "can we have the white text appear
// first, after 1 sec then have the phone slide in from the right" — the copy
// fades/slides in with the step, then the phone follows PHONE_SLIDE_IN_DELAY_MS
// later. Keep in sync with --phone-slide-in in css/style.css.
const PHONE_SLIDE_IN_DELAY_MS = 1000;
const PHONE_SLIDE_IN_MS = PHONE_SLIDE_OUT_MS;
// "Get ready to fish in: 3" — the install-complete countdown.
const COUNTDOWN_SECONDS = 3;
// Client review 2026-10-20: "将过渡动画的速度减慢约 2 秒，使其更加流畅" — every
// page cross-fade is now 2.4 s instead of 0.4 s. Keep in sync with the
// --scene-fade variable at the top of css/style.css (that is what actually
// animates; this constant is here so the JS-side delays can match it).
const SCENE_FADE_MS = 2400;

// ---------------------------------------------------------------------------
// The caught fish presentation (client comments 2026-09-22)
// ---------------------------------------------------------------------------
// "fish to remain same size throughout the interaction / fish should not change
// size from screen to screen" — every scene that shows the caught fish draws it
// at this one width, so it never grows or shrinks between pages.
// Raised from 460 after review ("调大一号"): the catch page, the scale and the
// later screens all share this value, so they stay in step.
const FISH_DISPLAY_W = 560;
// "fish should face the same direction" + "向左" — all fish face left.
const FISH_FACE_LEFT = true;
// "make fish brighter" / "should be different brightness from screensaver":
// the shoal on the attract screens runs at SCREENSAVER_FISH_ALPHA while the fish
// the visitor actually works with (catch page onward) is drawn at full strength.
//
// Fully opaque, by request. Any transparency lets the fish behind show through
// wherever two overlap, which reads as clipping ("鱼身不要是透明的，会把后面的
// 鱼显示出来"); overlaps are allowed and resolved by paint order instead.
const SCREENSAVER_FISH_ALPHA = [1, 1];   // [min, max] decorative
// "捕鱼的那页鱼的大小调大一号" — the tappable shoal is scaled up so it is
// easier to hit and reads clearly.
// Client review 2026-10-22: "所有的鱼在海里要按图中比例大小，稍微一点也不用太明显"
// — the shoal size is no longer random: each species gets a scale from its real
// length (client table 2026-11-02: 15 cm … 1.10 m, log-mapped) inside this
// deliberately narrow range, so the difference is a hint rather than a ranking.
// A little per-fish jitter is added in screensaver.js.
const SCREENSAVER_FISH_SCALE = [1.05, 1.9];     // [smallest species, largest]

// The scale dial's range. Client's fish data (2026-11-02) now tops out at 15 kg
// (Mekong freshwater stingray), so the dial sweeps 0-18 kg: a round 3 kg per
// major mark (0, 3, ... 18) and the heaviest species at five sixths, leaving
// headroom so the needle never pegs.
const SCALE_MAX_WEIGHT_KG = 18;

// Client-supplied backgrounds for the two ending animations
// ("Threatened fishes app" notes 1 + 2: real market / river photos with the
// animated fish composited into the image).
const BG_MARKET_IMAGE = 'assets/images/backgrounds/market.jpg';
const BG_RIVER_IMAGE = 'assets/images/backgrounds/river.jpg';
// Both photos are credited to the photographer in the client's comments.
const PHOTO_CREDIT = 'Photo: Tan Heok Hui';

// ---------------------------------------------------------------------------
// The eight species (client spreadsheet, 2026-10-18)
// ---------------------------------------------------------------------------
// "现在项目的鱼图只要图中这八种" — exactly these eight, nothing else. Length and
// weight are the client's own table values (they are catch records, i.e. the size
// of the animal in the visitor's hand, not the species maximum). Order follows the
// spreadsheet.
//
// Artwork: all eight are now photographs, cut into transparent PNGs at 1000 px wide.
//
//  - six came from the client's brief PDF
//    ("Monsterfish Exhibition Interactive Game_A Monster Mission"), pages 3-5,
//    cut by tools/build_fish_from_pdf.py:
//        pierre-labeo, mekong-tiger-perch, bump-headed-fish,
//        giant-freshwater-stingray, giant-gouramy   (white-background photos)
//        goonch                                     (black-background photo)
//
//  - giant-barb, iridescent-shark and giant-freshwater-stingray were AI-generated
//    replacements the client sent on 2026-10-20/22 (the PDF only carried
//    iStock-watermarked photos for these, with a translucent plate over the fish,
//    so they could not be cut). They arrived with a "豆包AI生成" mark and, for the
//    shark, checkerboard/water artifacts; those were cropped away and the fish cut
//    out in _preview. Sources are in source_photos/fish-originals/ai/ and the
//    replaced files in source_photos/fish-originals/{illustrations,previous-assets}/.
//    NOTE: they are AI-generated, so the client should be aware for the exhibit.
//
// Per-species size in the water: every entry has a `shoalScale` multiplier
// (1 = follow the species' real length automatically). Change ONE fish's size in
// the swimming shoal by editing just that entry, e.g. to make the Giant barb 20 %
// bigger there: `shoalScale: 1.2`. It affects the attract/catch shoal only — the
// caught fish on the other pages still uses the shared FISH_DISPLAY_W.
//
// ⚠️ 改这里（js/config.js）才是"默认值"；直接改 bundled/game.js 只是临时生效，
// 下次 bundle_all.py 重新打包会被覆盖回这个文件里的值。
// 客户 2026-10-30 定下来的两条：魟鱼 1.8、goonch 1.3。
const FISH_SPECIES = [
  {
    id: 'giant-barb',
    commonName: 'Giant barb',
    scientificName: 'Catlocarpio siamensis',
    lengthM: 0.74,
    weightKg: 8,
    location: 'Mekong River, Cambodia',
    image: 'assets/images/fish/giant-barb.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    shoalScale: 1.0,
  },
  {
    id: 'pierre-labeo',
    commonName: "Pierre's Labeo",
    scientificName: 'Labeo pierrei',
    lengthM: 0.8,
    weightKg: 4,
    location: 'Mekong River, Cambodia',
    image: 'assets/images/fish/pierre-labeo.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    shoalScale: 1.0,
  },
  {
    id: 'iridescent-shark',
    commonName: 'Iridescent Shark',
    scientificName: 'Pangasianodon hypophthalmus',
    lengthM: 0.54,
    weightKg: 4,
    location: 'Mekong River, Vietnam',
    image: 'assets/images/fish/iridescent-shark.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    shoalScale: 1.0,
  },
  {
    id: 'goonch',
    commonName: 'Goonch',
    scientificName: 'Bagarius bagarius',
    lengthM: 0.77,
    weightKg: 3.9,
    location: 'Mekong River, Laos',
    image: 'assets/images/fish/goonch.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    // 客户 2026-10-30 定的:1.3
    shoalScale: 1.3,
  },
  {
    id: 'mekong-tiger-perch',
    commonName: 'Mekong Tiger Perch',
    scientificName: 'Datnioides undecimradiatus',
    lengthM: 0.15,
    weightKg: 0.3,
    // 客户表格没有"捕获地点"这一列,这三条是暂按湄公河流域填的,待确认
    location: 'Mekong River, Thailand',
    image: 'assets/images/fish/mekong-tiger-perch.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    shoalScale: 1.0,
  },
  {
    id: 'bump-headed-fish',
    commonName: 'Bump-headed Fish',
    scientificName: 'Incisilabeo behri',
    lengthM: 0.76,
    weightKg: 8.1,
    location: 'Mekong River, Cambodia',
    image: 'assets/images/fish/bump-headed-fish.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    shoalScale: 1.0,
  },
  {
    id: 'giant-freshwater-stingray',
    commonName: 'Mekong Freshwater Stingray',
    scientificName: 'Urogymnus polylepis',
    lengthM: 1.1,
    weightKg: 15,
    location: 'Mekong River, Cambodia',
    image: 'assets/images/fish/giant-freshwater-stingray.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    // 客户 2026-10-30 定的:1.8
    shoalScale: 1.8,
  },
  {
    id: 'giant-gouramy',
    commonName: 'Elephant Ear Gourami',
    scientificName: 'Osphronemus gouramy',
    lengthM: 0.21,
    weightKg: 0.191,
    location: 'Mekong River, Cambodia',
    image: 'assets/images/fish/giant-gouramy.png',
    // 海里那条鱼的大小系数:1 = 按体长自动算,想单独调大/调小就改这个数
    shoalScale: 1.0,
  },
];

const THREATENED_APP_TEXT = `You have just experienced what a Cambodian fisherman goes through when helping researchers collect data on their catches using the Threatened Fishes App.

The Threatened Fishes App, developed in 2024, is part of a pilot program led by the Faculty of Fisheries and Aquaculture at the Royal University of Agriculture (RUA); where trained local fishers monitor catches and log data related to over 20 threatened fish species in the Mekong River, providing valuable information that will inform conservation policies and sustainable fishing practices.

For many communities along the Mekong River, fishing is an important source of food and income. The Threatened Fishes App and the training for fishermen to recognise endangered fish allows for more releases of endangered fish back to the river helping to sustain healthy populations and support conservation efforts.`;

const RIVER_GRADIENT = {
  top: '#2a4a80',
  bottom: '#14243f',
};

const UI_COLORS = {
  primary: '#5b9bd4',
  primaryDark: '#3a6ea8',
  accent: '#e0b84a',
  danger: '#d46a5b',
  bgPanel: 'rgba(20, 42, 74, 0.94)',
  bgButton: 'rgba(31, 56, 99, 0.9)',
  text: '#f7f9fd',
  textDim: '#9fb4d8',
};

// Client-supplied brand fonts (2026-10). The @font-face rules live in
// css/style.css; Canvas needs the family spelled out on every call, and it must
// match those rules exactly. FONT_DISPLAY is the condensed face for titles and
// big numbers; FONT_BODY is for everything else.
const FONT_BODY = "'Chivo', 'Segoe UI', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', 'Chivo', 'Segoe UI', system-ui, sans-serif";


_m.config.CANVAS_WIDTH = CANVAS_WIDTH;
_m.config.CANVAS_HEIGHT = CANVAS_HEIGHT;
_m.config.IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MS;
_m.config.THREATENED_APP_TIMEOUT_MS = THREATENED_APP_TIMEOUT_MS;
_m.config.CORRECTION_POPUP_DURATION_MS = CORRECTION_POPUP_DURATION_MS;
_m.config.ANIMATED_PAGE_DURATION_MS = ANIMATED_PAGE_DURATION_MS;
_m.config.KEEP_MARKET_DURATION_MS = KEEP_MARKET_DURATION_MS;
_m.config.ENDING_DIM_FADE_MS = ENDING_DIM_FADE_MS;
_m.config.ENDING_DIM_ALPHA = ENDING_DIM_ALPHA;
_m.config.PHONE_SLIDE_OUT_MS = PHONE_SLIDE_OUT_MS;
_m.config.PHONE_SLIDE_IN_DELAY_MS = PHONE_SLIDE_IN_DELAY_MS;
_m.config.PHONE_SLIDE_IN_MS = PHONE_SLIDE_IN_MS;
_m.config.COUNTDOWN_SECONDS = COUNTDOWN_SECONDS;
_m.config.SCENE_FADE_MS = SCENE_FADE_MS;
_m.config.FISH_DISPLAY_W = FISH_DISPLAY_W;
_m.config.FISH_FACE_LEFT = FISH_FACE_LEFT;
_m.config.SCREENSAVER_FISH_ALPHA = SCREENSAVER_FISH_ALPHA;
_m.config.SCREENSAVER_FISH_SCALE = SCREENSAVER_FISH_SCALE;
_m.config.SCALE_MAX_WEIGHT_KG = SCALE_MAX_WEIGHT_KG;
_m.config.BG_MARKET_IMAGE = BG_MARKET_IMAGE;
_m.config.BG_RIVER_IMAGE = BG_RIVER_IMAGE;
_m.config.PHOTO_CREDIT = PHOTO_CREDIT;
_m.config.FISH_SPECIES = FISH_SPECIES;
_m.config.THREATENED_APP_TEXT = THREATENED_APP_TEXT;
_m.config.RIVER_GRADIENT = RIVER_GRADIENT;
_m.config.UI_COLORS = UI_COLORS;
_m.config.FONT_BODY = FONT_BODY;
_m.config.FONT_DISPLAY = FONT_DISPLAY;
})();

// ======== utils/helpers.js ========
(function() {
  var _m = window._m;
  _m.utils_helpers = {};
// Utility helpers

var FISH_SPECIES = _m.config.FISH_SPECIES;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function randomFish() {
  return FISH_SPECIES[randomInt(0, FISH_SPECIES.length - 1)];
}

// 客户 2026-11-02："length 全部用 cm" —— 体长一律厘米，不再用米
// （魟鱼 1.1 m → 110 cm）。体重仍然按原来的习惯：≥1 kg 用 kg，不足 1 kg 用 g。
function formatLength(m) {
  return `${Math.round(m * 100)} cm`;
}

function formatWeight(kg) {
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  return `${parseFloat(kg.toFixed(2))} kg`;
}


_m.utils_helpers.randomInt = randomInt;
_m.utils_helpers.randomFloat = randomFloat;
_m.utils_helpers.lerp = lerp;
_m.utils_helpers.clamp = clamp;
_m.utils_helpers.randomFish = randomFish;
_m.utils_helpers.formatLength = formatLength;
_m.utils_helpers.formatWeight = formatWeight;
})();

// ======== utils/touch.js ========
(function() {
  var _m = window._m;
  _m.utils_touch = {};
// Touch handler — unify mouse/touch for kiosk interaction

const DEBOUNCE_MS = 400;

function setupTouchHandler(handlers) {
  let touchStartTime = 0;
  let lastTapTime = 0;
  let startX = 0;
  let startY = 0;
  const DRAG_THRESHOLD = 10;

  const onDown = (e) => {
    touchStartTime = Date.now();
    startX = e.clientX;
    startY = e.clientY;
  };

  const onUp = (e) => {
    const dt = Date.now() - touchStartTime;
    const sinceLastTap = Date.now() - lastTapTime;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dt > 800 || sinceLastTap < DEBOUNCE_MS || dist > DRAG_THRESHOLD) return;

    lastTapTime = Date.now();

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;

    for (const [selector, handler] of Object.entries(handlers)) {
      if (target.closest(selector)) {
        handler(target, e);
        return;
      }
    }
  };

  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerup', onUp, { passive: true });

  return () => {
    document.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerup', onUp);
  };
}


_m.utils_touch.setupTouchHandler = setupTouchHandler;
})();

// ======== utils/idle-timer.js ========
(function() {
  var _m = window._m;
  _m.utils_idle_timer = {};
// Idle timer — return to screensaver after inactivity
//
// The timer must fire repeatedly: a kiosk keeps running all day, so after an
// idle timeout the next round of activity has to arm a fresh countdown.
// (Previously a one-way `active` flag was cleared on the first fire and never
// restored, so idle handling worked exactly once per page load.)
//
// 2026-10-23 hardening, after the client reported "捕鱼页面挂机两分钟不回主页面":
//   * **只认真实交互**:按下/抬起/按键/滚轮都算;鼠标移动则必须超过 MOVE_THRESHOLD_PX
//     才算 —— 触摸屏的 IR 框、触摸板噪声会不停发 1~2 px 的 pointermove,
//     旧版把它们全当"有人",计时器被按回 0,于是永远等不到挂机。
//   * **抗节流**:浏览器在后台/休眠时会把 setTimeout 推迟(Chrome 后台标签最小 1 分钟,
//     更久还会冻结)。触发时用时间戳核对真实闲置时长,不够就补一次,不会被吞。
//   * 触发后自动重新计时,长时间无人操作也能反复触发。

const MOVE_THRESHOLD_PX = 6;

class IdleTimer {
  constructor(callback, timeoutMs = 60000, { moveThreshold = MOVE_THRESHOLD_PX } = {}) {
    this.callback = callback;
    this.timeoutMs = timeoutMs;
    this.moveThreshold = moveThreshold;
    this.timerId = null;
    this.stopped = false;
    this.lastActivityAt = 0;
    this.lastX = null;
    this.lastY = null;
    this.fireCount = 0;
  }

  start() {
    this.stopped = false;
    this.reset();
    // 点击(触摸屏的主交互)、键盘、滚轮:直接算
    document.addEventListener('pointerdown', this._onActivity, { passive: true });
    document.addEventListener('pointerup', this._onActivity, { passive: true });
    document.addEventListener('keydown', this._onActivity, { passive: true });
    document.addEventListener('wheel', this._onActivity, { passive: true });
    // 鼠标移动:超过阈值才算
    document.addEventListener('pointermove', this._onMove, { passive: true });
    // 页面重新可见时补一次计时(休眠/切换窗口回来后)
    document.addEventListener('visibilitychange', this._onVisibility, { passive: true });
  }

  _onActivity = () => {
    if (this.stopped) return;
    this.reset();
  };

  _onMove = (e) => {
    if (this.stopped) return;
    const { clientX: x, clientY: y } = e;
    if (this.lastX === null) {
      this.lastX = x;
      this.lastY = y;
      this.reset();
      return;
    }
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    if (dx * dx + dy * dy >= this.moveThreshold * this.moveThreshold) {
      this.lastX = x;
      this.lastY = y;
      this.reset();
    }
  };

  _onVisibility = () => {
    if (this.stopped) return;
    if (document.visibilityState === 'visible') this.reset();
  };

  reset() {
    if (this.stopped) return;
    this.lastActivityAt = Date.now();
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this._fire, this.timeoutMs);
  }

  /** 真实闲置了多久(毫秒),给调试/现场排查用。 */
  idleFor() {
    return Date.now() - this.lastActivityAt;
  }

  _fire = () => {
    if (this.stopped) return;
    const idleFor = Date.now() - this.lastActivityAt;
    // 定时器被浏览器节流/系统休眠推迟时,真实闲置时间还不够 -> 补一段再判
    if (idleFor + 300 < this.timeoutMs) {
      this.timerId = setTimeout(this._fire, this.timeoutMs - idleFor);
      return;
    }
    this.fireCount += 1;
    this.callback();
    // 重新计时:再一次长时间无人操作还会触发
    if (!this.stopped) this.reset();
  };

  stop() {
    this.stopped = true;
    clearTimeout(this.timerId);
    document.removeEventListener('pointerdown', this._onActivity);
    document.removeEventListener('pointerup', this._onActivity);
    document.removeEventListener('keydown', this._onActivity);
    document.removeEventListener('wheel', this._onActivity);
    document.removeEventListener('pointermove', this._onMove);
    document.removeEventListener('visibilitychange', this._onVisibility);
  }
}


_m.utils_idle_timer.MOVE_THRESHOLD_PX = MOVE_THRESHOLD_PX;
_m.utils_idle_timer.IdleTimer = IdleTimer;
})();

// ======== utils/images.js ========
(function() {
  var _m = window._m;
  _m.utils_images = {};
// Image preloader — loads all fish illustrations and background photos into
// memory for Canvas scenes.

var FISH_SPECIES = _m.config.FISH_SPECIES;
var BG_MARKET_IMAGE = _m.config.BG_MARKET_IMAGE;
var BG_RIVER_IMAGE = _m.config.BG_RIVER_IMAGE;

const imageCache = {};
let loadedCount = 0;
const totalCount = FISH_SPECIES.length;

// Background photos, keyed by id ('market' / 'river').
const photoCache = {};
const PHOTO_SOURCES = {
  market: BG_MARKET_IMAGE,
  river: BG_RIVER_IMAGE,
};

function preload() {
  FISH_SPECIES.forEach((fish) => {
    const img = new Image();
    img.onload = img.onerror = () => { loadedCount++; };
    img.src = fish.image;
    imageCache[fish.id] = img;
  });

  preloadPhotos();
}

function preloadPhotos() {
  for (const id in PHOTO_SOURCES) {
    if (photoCache[id]) continue;
    const img = new Image();
    img.src = PHOTO_SOURCES[id];
    photoCache[id] = img;
  }
}

function getFishImage(id) {
  const img = imageCache[id];
  if (img && img.complete && img.naturalWidth > 0) return img;
  return null;
}

function getPhoto(id) {
  const img = photoCache[id];
  if (img && img.complete && img.naturalWidth > 0) return img;
  return null;
}



_m.utils_images.preload = preload;
_m.utils_images.preloadPhotos = preloadPhotos;
_m.utils_images.getFishImage = getFishImage;
_m.utils_images.getPhoto = getPhoto;
})();

// ======== engine/animation.js ========
(function() {
  var _m = window._m;
  _m.engine_animation = {};
// Animation engine — lightweight tween system

const easings = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

class Tween {
  constructor(target, props, duration, easing = 'easeOutCubic') {
    this.target = target;
    this.startValues = {};
    this.endValues = props;
    this.duration = duration;
    this.easingFn = typeof easing === 'function' ? easing : easings[easing] || easings.easeOutCubic;
    this.elapsed = 0;
    this.completed = false;
    this.onComplete = null;
    this.onUpdate = null;

    for (const key in props) {
      this.startValues[key] = target[key] !== undefined ? target[key] : 0;
    }
  }

  update(dt) {
    if (this.completed) return;
    this.elapsed += dt;
    const progress = Math.min(this.elapsed / this.duration, 1);
    const easedProgress = this.easingFn(progress);

    for (const key in this.endValues) {
      this.target[key] = this.startValues[key] + (this.endValues[key] - this.startValues[key]) * easedProgress;
    }

    if (this.onUpdate) this.onUpdate(this.target, easedProgress);

    if (progress >= 1) {
      this.completed = true;
      if (this.onComplete) this.onComplete(this.target);
    }
  }

  then(callback) {
    this.onComplete = callback;
    return this;
  }

  progress(callback) {
    this.onUpdate = callback;
    return this;
  }
}

class Timeline {
  constructor() {
    this.tweens = [];
    this.currentIndex = 0;
    this.completed = false;
    this.onComplete = null;
  }

  add(target, props, duration, easing) {
    const tween = new Tween(target, props, duration, easing);
    this.tweens.push(tween);
    return this;
  }

  update(dt) {
    if (this.completed) return;

    // Process completed tweens to find current
    while (this.currentIndex < this.tweens.length && this.tweens[this.currentIndex].completed) {
      this.currentIndex++;
    }

    if (this.currentIndex < this.tweens.length) {
      this.tweens[this.currentIndex].update(dt);
    }

    if (this.currentIndex >= this.tweens.length) {
      this.completed = true;
      if (this.onComplete) this.onComplete();
    }
  }

  skipToEnd() {
    for (let i = this.currentIndex; i < this.tweens.length; i++) {
      const t = this.tweens[i];
      t.elapsed = t.duration;
      for (const key in t.endValues) {
        t.target[key] = t.endValues[key];
      }
      t.completed = true;
    }
    this.currentIndex = this.tweens.length;
    this.completed = true;
    if (this.onComplete) this.onComplete();
  }

  then(callback) {
    if (this.completed) {
      callback();
    } else {
      const origComplete = this.tweens[this.tweens.length - 1]?.onComplete;
      if (this.tweens.length > 0) {
        this.tweens[this.tweens.length - 1].onComplete = (...args) => {
          if (origComplete) origComplete(...args);
          this.completed = true;
          callback();
        };
      }
    }
    return this;
  }
}

// Active tweens
const activeTweens = [];

function tweenTo(target, props, duration, easing) {
  const t = new Tween(target, props, duration, easing);
  activeTweens.push(t);
  return t;
}

function tweenFrom(target, props, duration, easing) {
  // First set to end values, then animate from start
  const saved = {};
  for (const key in props) {
    saved[key] = target[key];
    target[key] = props[key];
  }
  const t = new Tween(target, saved, duration, easing);
  activeTweens.push(t);
  return t;
}

function createTimeline() {
  const tl = new Timeline();
  tl._active = true;
  activeTweens.push(tl);
  return tl;
}

function updateAllTweens(dt) {
  for (let i = activeTweens.length - 1; i >= 0; i--) {
    activeTweens[i].update(dt);
    if (activeTweens[i].completed) {
      activeTweens.splice(i, 1);
    }
  }
}



_m.engine_animation.tweenTo = tweenTo;
_m.engine_animation.tweenFrom = tweenFrom;
_m.engine_animation.createTimeline = createTimeline;
_m.engine_animation.updateAllTweens = updateAllTweens;
})();

// ======== engine/renderer.js ========
(function() {
  var _m = window._m;
  _m.engine_renderer = {};
// Renderer — Canvas 2D drawing utilities

var RIVER_GRADIENT = _m.config.RIVER_GRADIENT;
var FISH_DISPLAY_W = _m.config.FISH_DISPLAY_W;
var FISH_FACE_LEFT = _m.config.FISH_FACE_LEFT;
var FONT_BODY = _m.config.FONT_BODY;
var getFishImage = _m.utils_images.getFishImage;
var getPhoto = _m.utils_images.getPhoto;

function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function drawRoundedRectTop(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function drawText(ctx, text, x, y, options = {}) {
  const {
    font = `24px ${FONT_BODY}`,
    color = '#f7f9fd',
    align = 'left',
    baseline = 'top',
    maxWidth = undefined,
  } = options;

  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

function drawRiverBg(ctx, width, height, time = 0) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, RIVER_GRADIENT.top);
  grad.addColorStop(1, RIVER_GRADIENT.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle light rays
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const x = width * (0.1 + i * 0.18) + Math.sin(time * 0.0003 + i) * 60;
    const alpha = 0.02 + Math.sin(time * 0.0005 + i * 1.7) * 0.015;
    ctx.fillStyle = `rgba(150, 190, 230, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x - 40, 0);
    ctx.lineTo(x + 60, 0);
    ctx.lineTo(x + 200, height);
    ctx.lineTo(x - 120, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw a fish illustration.
 *
 * Sizing (client comments 2026-09-22): the caught fish must stay the same size
 * on every screen. Two ways to ask for it:
 *   - pass `widthPx` for an explicit pixel width (the shared FISH_DISPLAY_W),
 *     which is what the interaction scenes use;
 *   - or pass `scale`, kept for the decorative swimmers and animations that are
 *     deliberately a different size (e.g. the faint screensaver shoal).
 *
 * Facing: `facingRight` defaults to 'auto', which follows the project-wide
 * FISH_FACE_LEFT so every screen shows the fish pointing the same way.
 */
/**
 * Work out the drawn size of a fish at a given width.
 *
 * Nearly-square photos (the Mekong freshwater stingray is 593 x 556) come out very
 * tall if they are scaled by width alone: at the shared 560 px they would be 525 px
 * high, covering the measuring tape and letting the tail poke through the scale
 * platform. So very tall art is capped: it may not be taller than
 * MAX_TALL_RATIO x its width, and the width shrinks to keep the shape.
 *
 * Every caller that needs the drawn height (e.g. the measurement page parking the
 * tape above the fish's back) must use this, not width x aspect.
 */
const MAX_TALL_RATIO = 0.62;

function fishDrawSize(img, widthPx) {
  if (!img) return { w: widthPx, h: 0 };
  const ratio = img.naturalHeight / img.naturalWidth;
  let w = widthPx;
  let h = w * ratio;
  if (h > w * MAX_TALL_RATIO) {
    h = w * MAX_TALL_RATIO;
    w = h / ratio;
  }
  return { w, h };
}

function drawFishImage(ctx, fish, x, y, scale = 1, alpha = 1, facingRight = 'auto', anchor = 'center', widthPx = null) {
  const img = getFishImage(fish.id);
  if (!img) return;

  const size = widthPx !== null
    ? fishDrawSize(img, widthPx)
    : { w: 160 * scale, h: 160 * scale * (img.naturalHeight / img.naturalWidth) };
  const w = size.w;
  const h = size.h;
  const offY = anchor === 'bottom' ? -h : -h / 2;
  const faceRight = facingRight === 'auto' ? !FISH_FACE_LEFT : facingRight;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  // Drawings face left natively; flip when the head should point right.
  if (faceRight) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, offY, w, h);
  ctx.restore();
}

/**
 * Photographer credit for the client-supplied background photos
 * ("Photo: Tan Heok Hui" appears on the originals).
 */
function drawPhotoCredit(ctx, text, width, height) {
  ctx.save();
  ctx.font = `20px ${FONT_BODY}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(10, 20, 36, 0.85)';
  ctx.strokeText(text, 26, height - 20);
  ctx.fillStyle = '#f2f6fc';
  ctx.fillText(text, 26, height - 20);
  ctx.restore();
}

/**
 * Draw a full-bleed photo, scaled so it covers the whole canvas without
 * distortion (same idea as CSS `object-fit: cover`), centred on the canvas.
 * Returns true when the photo was available and painted.
 */
function drawPhotoCover(ctx, photoId, width, height) {
  const img = getPhoto(photoId);
  if (!img) return false;

  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  return true;
}

/**
 * Soft elliptical shadow used to seat an animated fish on a surface.
 */
function drawGroundShadow(ctx, x, y, radiusX, radiusY, alpha = 0.3) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#0b1626';
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBubble(ctx, x, y, radius, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(150, 190, 230, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Highlight
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(200, 220, 250, 0.6)';
  ctx.fill();
  ctx.restore();
}

/**
 * 收尾交接用的暗罩。
 *
 * 结尾动画页(市场/放生)和收尾信息页都调这一个函数,只是传入的强度不同:
 * 动画页在最后 ENDING_DIM_FADE_MS 里把 k 从 0 拉到 1,收尾页一进来就是 k = 1。
 * 这样两页"切页那一帧"的画面完全一致,不会再闪一下。
 */
function drawEndingDim(ctx, k, width, height, maxAlpha) {
  const a = Math.min(1, Math.max(0, k)) * maxAlpha;
  if (a <= 0) return;
  ctx.fillStyle = `rgba(8, 18, 34, ${a.toFixed(4)})`;
  ctx.fillRect(0, 0, width, height);
}

/** 交接进度:0 = 离结束还远,1 = 已经结束(供三个收尾相关页面共用)。 */
function endingHandoffK(elapsedMs, durationMs, fadeMs) {
  const left = durationMs - elapsedMs;
  if (left >= fadeMs) return 0;
  const t = Math.min(1, Math.max(0, 1 - left / fadeMs));
  return t * t * (3 - 2 * t);      // smoothstep
}


_m.engine_renderer.drawRoundedRect = drawRoundedRect;
_m.engine_renderer.drawRoundedRectTop = drawRoundedRectTop;
_m.engine_renderer.drawText = drawText;
_m.engine_renderer.drawRiverBg = drawRiverBg;
_m.engine_renderer.MAX_TALL_RATIO = MAX_TALL_RATIO;
_m.engine_renderer.fishDrawSize = fishDrawSize;
_m.engine_renderer.drawFishImage = drawFishImage;
_m.engine_renderer.drawPhotoCredit = drawPhotoCredit;
_m.engine_renderer.drawPhotoCover = drawPhotoCover;
_m.engine_renderer.drawGroundShadow = drawGroundShadow;
_m.engine_renderer.drawBubble = drawBubble;
_m.engine_renderer.drawEndingDim = drawEndingDim;
_m.engine_renderer.endingHandoffK = endingHandoffK;
})();

// ======== engine/canvas.js ========
(function() {
  var _m = window._m;
  _m.engine_canvas = {};
// Canvas engine — dual canvas setup + requestAnimationFrame loop

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;

let bgCanvas;
let fgCanvas;
let bgCtx;
let fgCtx;

let animFrameId = null;
let lastTimestamp = 0;
let updateCallback = null;
let renderCallback = null;
let bgUpdateCallback = null;

function init() {
  bgCanvas = document.getElementById('bg-canvas');
  fgCanvas = document.getElementById('fg-canvas');

  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  bgCanvas.width = CANVAS_WIDTH;
  bgCanvas.height = CANVAS_HEIGHT;
  fgCanvas.width = CANVAS_WIDTH;
  fgCanvas.height = CANVAS_HEIGHT;

  const scaleX = w / CANVAS_WIDTH;
  const scaleY = h / CANVAS_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  [bgCanvas, fgCanvas].forEach(canvas => {
    canvas.style.width = `${CANVAS_WIDTH * scale}px`;
    canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
    canvas.style.left = `${(w - CANVAS_WIDTH * scale) / 2}px`;
    canvas.style.top = `${(h - CANVAS_HEIGHT * scale) / 2}px`;
  });

  // Hand the same factor to the DOM overlay so panels, fonts and buttons scale
  // exactly like the canvas. Everything downstream is written as calc(Npx *
  // var(--ui-scale)), which is simply N on a 1920x1080 display.
  document.documentElement.style.setProperty('--ui-scale', String(scale));

  bgCtx = bgCanvas.getContext('2d');
  fgCtx = fgCanvas.getContext('2d');
}

function startLoop(onUpdate, onRender, onBgUpdate) {
  updateCallback = onUpdate;
  renderCallback = onRender;
  bgUpdateCallback = onBgUpdate;

  lastTimestamp = performance.now();
  animFrameId = requestAnimationFrame(frame);
}

function stopLoop() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

function frame(timestamp) {
  const dt = Math.min(timestamp - lastTimestamp, 50);
  lastTimestamp = timestamp;

  if (bgUpdateCallback) bgUpdateCallback(dt);

  bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  fgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (updateCallback) updateCallback(dt);
  if (renderCallback) renderCallback(fgCtx);

  animFrameId = requestAnimationFrame(frame);
}


_m.engine_canvas.bgCanvas = bgCanvas;
_m.engine_canvas.fgCanvas = fgCanvas;
_m.engine_canvas.bgCtx = bgCtx;
_m.engine_canvas.fgCtx = fgCtx;
_m.engine_canvas.init = init;
_m.engine_canvas.resize = resize;
_m.engine_canvas.startLoop = startLoop;
_m.engine_canvas.stopLoop = stopLoop;
})();

// ======== engine/particles.js ========
(function() {
  var _m = window._m;
  _m.engine_particles = {};
// Particle system — ambient water bubbles

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var drawBubble = _m.engine_renderer.drawBubble;

const BUBBLE_COUNT = 60;

class Bubble {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * CANVAS_WIDTH;
    this.y = initial ? Math.random() * CANVAS_HEIGHT : CANVAS_HEIGHT + 20;
    this.radius = 2 + Math.random() * 6;
    this.opacity = 0.03 + Math.random() * 0.08;
    this.speed = 0.15 + Math.random() * 0.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.0005 + Math.random() * 0.002;
  }

  update(dt) {
    this.y -= this.speed * (dt / 16);
    this.wobble += this.wobbleSpeed * dt;
    this.x += Math.sin(this.wobble) * 0.3 * (dt / 16);

    if (this.y < -20) {
      this.y = CANVAS_HEIGHT + 20;
      this.x = Math.random() * CANVAS_WIDTH;
    }

    if (this.x < -10) this.x = CANVAS_WIDTH + 10;
    if (this.x > CANVAS_WIDTH + 10) this.x = -10;
  }
}

const bubbles = [];

function init() {
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    bubbles.push(new Bubble());
  }
}

function update(dt) {
  for (const b of bubbles) {
    b.update(dt);
  }
}

function render(ctx) {
  for (const b of bubbles) {
    drawBubble(ctx, b.x, b.y, b.radius, b.opacity);
  }
}


_m.engine_particles.init = init;
_m.engine_particles.update = update;
_m.engine_particles.render = render;
})();

// ======== state.js ========
(function() {
  var _m = window._m;
  _m.state = {};
// State machine — game state management + event bus

const GameState = Object.freeze({
  SCREENSAVER:    'SCREENSAVER',
  FISH_APPEARED:  'FISH_APPEARED',
  FISH_SELECTION: 'FISH_SELECTION',
  MEASUREMENT:    'MEASUREMENT',
  CHOICE:         'CHOICE',
  KEEP_MARKET:    'KEEP_MARKET',
  RETURN_RIVER:   'RETURN_RIVER',
  THREATENED_APP: 'THREATENED_APP',
});

// Client comments 2026-09-22: the "A Monster Mission" ending card was removed,
// so both branches play their animation and then go straight to the closing
// information page.
const transitions = {
  SCREENSAVER:    { CATCH_FISH:    GameState.FISH_APPEARED },
  FISH_APPEARED:  { TAP_LOGIN:     GameState.FISH_SELECTION },
  FISH_SELECTION: { SELECT_FISH:   GameState.MEASUREMENT },
  MEASUREMENT:    { SUBMIT:        GameState.CHOICE },
  CHOICE:         { KEEP:          GameState.KEEP_MARKET,
                    RETURN:        GameState.RETURN_RIVER },
  KEEP_MARKET:    { DONE:          GameState.THREATENED_APP },
  RETURN_RIVER:   { DONE:          GameState.THREATENED_APP },
  THREATENED_APP: { CLOSE:         GameState.SCREENSAVER },
};

const appState = {
  currentState: GameState.SCREENSAVER,
  selectedFish: null,
  correctFish: null,
  playerChoice: null,
  isCorrect: false,
  correctionShown: false,
};

const sceneModules = {};

function registerScene(state, module) {
  sceneModules[state] = module;
}

const listeners = {};

function on(event, fn) {
  (listeners[event] = listeners[event] || []).push(fn);
}

function off(event, fn) {
  const list = listeners[event];
  if (list) {
    const idx = list.indexOf(fn);
    if (idx !== -1) list.splice(idx, 1);
  }
}

function emit(event, data) {
  (listeners[event] || []).forEach(fn => fn(data));
}

function transition(eventType) {
  const current = appState.currentState;
  const next = transitions[current]?.[eventType];

  if (!next) {
    console.warn(`No transition: ${current} -> ${eventType}`);
    return;
  }

  const currentScene = sceneModules[current];
  if (currentScene?.exit) currentScene.exit();

  const prev = current;
  appState.currentState = next;

  const nextScene = sceneModules[next];
  if (nextScene?.enter) nextScene.enter();

  // Update DOM scene visibility
  document.querySelectorAll('#ui-overlay > .scene').forEach(el => {
    el.classList.remove('active');
  });

  const sceneMap = {
    [GameState.SCREENSAVER]: 'scene-screensaver',
    [GameState.FISH_APPEARED]: 'scene-fish-appear',
    [GameState.FISH_SELECTION]: 'scene-fish-selection',
    [GameState.MEASUREMENT]: 'scene-measurement',
    [GameState.CHOICE]: 'scene-choice',
    [GameState.KEEP_MARKET]: 'scene-keep-market',
    [GameState.RETURN_RIVER]: 'scene-return-river',
    [GameState.THREATENED_APP]: 'scene-threatened-app',
  };

  const sceneId = sceneMap[next];
  if (sceneId) {
    const el = document.getElementById(sceneId);
    if (el) el.classList.add('active');
  }

  emit('state-changed', { from: prev, to: next, event: eventType });
  emit('idle-reset');
}

function resetAppState() {
  appState.selectedFish = null;
  appState.correctFish = null;
  appState.playerChoice = null;
  appState.isCorrect = false;
  appState.correctionShown = false;
}


_m.state.GameState = GameState;
_m.state.appState = appState;
_m.state.registerScene = registerScene;
_m.state.on = on;
_m.state.off = off;
_m.state.emit = emit;
_m.state.transition = transition;
_m.state.resetAppState = resetAppState;
})();

// ======== scenes/screensaver.js ========
(function() {
  var _m = window._m;
  _m.scenes_screensaver = {};
// Screensaver / Attract scene — poster → install → countdown → tap a fish
// (flow revised from the client's 2026-09-22 comments)

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var FISH_SPECIES = _m.config.FISH_SPECIES;
var COUNTDOWN_SECONDS = _m.config.COUNTDOWN_SECONDS;
var PHONE_SLIDE_OUT_MS = _m.config.PHONE_SLIDE_OUT_MS;
var PHONE_SLIDE_IN_DELAY_MS = _m.config.PHONE_SLIDE_IN_DELAY_MS;
var SCREENSAVER_FISH_ALPHA = _m.config.SCREENSAVER_FISH_ALPHA;
var SCREENSAVER_FISH_SCALE = _m.config.SCREENSAVER_FISH_SCALE;
var FONT_DISPLAY = _m.config.FONT_DISPLAY;
var drawRiverBg = _m.engine_renderer.drawRiverBg;
var drawFishImage = _m.engine_renderer.drawFishImage;
var transition = _m.state.transition;
var emit = _m.state.emit;
var appState = _m.state.appState;

const PANEL_STEP = {
  title: 'Help Wanted!',
  text: 'Looking for fishers!\nRecord data using the Threatened Fish App.',
  // 客户 2026-10-31：按钮文字 Start → Learn more
  btn: 'Learn more',
};

const SPLIT_STEP = {
  title: 'Threatened Fishes App',
  text: 'Researchers need data about fishes living in the Mekong Delta.\nThey have created an app called the Threatened Fishes App.',
  hint: 'Tap Install on the phone →',
  phoneDesc: 'Monitor threatened fish in the Mekong Delta.',
};

/**
 * Attract steps
 *   0  poster (Help Wanted! + Start)
 *   1  install (panel on the left, phone on the right)
 *   2  install complete — "Installation complete." then a 3 second countdown
 *   3  catch — wordless river, tap a fish
 */
const STEP = { POSTER: 0, INSTALL: 1, COUNTDOWN: 2, CATCH: 3 };

/**
 * 体长 → 海里那条鱼画多大。
 *
 * 客户 2026-10-22:"所有的鱼在海里要按图中比例大小，稍微一点也不用太明显"。
 * 八条鱼的体长从 15 cm(老虎鲈)到 1.10 m(魟鱼,客户 2026-11-02 新表),差 7.3 倍,
 * 直接线性映射会让小鱼小得看不清,所以按**对数**归一化,映射到
 * SCREENSAVER_FISH_SCALE 这个窄区间(1.05–1.9,只有 1.8 倍差),再叠一点随机抖动,
 * 同一物种不同个体也不完全一样。
 *
 * 想**单独**调某一条鱼,不用碰这里:改 js/config.js 里那条鱼的 `shoalScale`
 * (1 = 按体长自动算,1.2 = 大 20%,0.85 = 小 15%)。
 */
const SHOAL_LENGTHS = FISH_SPECIES.map((f) => f.lengthM).filter((v) => v > 0);
const SHOAL_LOG_MIN = Math.log(Math.min(...SHOAL_LENGTHS));
const SHOAL_LOG_MAX = Math.log(Math.max(...SHOAL_LENGTHS));
const SHOAL_SCALE_JITTER = 0.06;

function shoalScaleFor(species) {
  const lengthM = species.lengthM;
  const t = SHOAL_LOG_MAX > SHOAL_LOG_MIN
    ? (Math.log(Math.max(lengthM, 0.01)) - SHOAL_LOG_MIN) / (SHOAL_LOG_MAX - SHOAL_LOG_MIN)
    : 0.5;
  const clamped = Math.min(1, Math.max(0, t));
  const lo = SCREENSAVER_FISH_SCALE[0];
  const hi = SCREENSAVER_FISH_SCALE[1];
  const base = lo + clamped * (hi - lo);
  const jitter = (Math.random() * 2 - 1) * SHOAL_SCALE_JITTER;
  // 抖动不许把结果顶出配置区间,这样"最大/最小"始终可控
  const auto = Math.min(hi, Math.max(lo, base + jitter));
  // 单条鱼的单独比例(config.js 里的 shoalScale,默认 1)
  const override = Number(species.shoalScale);
  const mul = Number.isFinite(override) && override > 0 ? override : 1;
  return +(auto * mul).toFixed(3);
}

class SwimmingFish {
  constructor(species) {
    this.species = species;
    this.x = Math.random() * CANVAS_WIDTH;
    this.y = 150 + Math.random() * (CANVAS_HEIGHT - 350);
    this.speed = 0.4 + Math.random() * 1.2;
    this.amplitude = 15 + Math.random() * 35;
    this.frequency = 0.0008 + Math.random() * 0.0015;
    // Fish cross the screen in both directions — some swim in from the right,
    // some from the left ("鱼不止要从右边游出来，还要从左边游出来").
    this.facingRight = Math.random() < 0.5;
    // Decorative shoal — dimmer than the fish the visitor handles, but turned
    // up per review ("亮度调高一点").
    this.opacity = SCREENSAVER_FISH_ALPHA[0] +
      Math.random() * (SCREENSAVER_FISH_ALPHA[1] - SCREENSAVER_FISH_ALPHA[0]);
    // Bigger so they read clearly and are easier to tap ("大小调大一号").
    // Client review 2026-10-22: "所有的鱼在海里要按图中比例大小，稍微一点也不用太
    // 明显" — the shoal size now follows the species' real length from the client's
    // table (19 cm Mekong Tiger Perch … 1.45 m stingray), mapped onto a deliberately
    // narrow scale range so the size difference reads as a hint, not a ranking.
    // Log mapping: length spans ~7.6x, so linear would make the perch tiny.
    this.scale = shoalScaleFor(species);
  }

  update(dt) {
    const dir = this.facingRight ? 1 : -1;
    this.x += this.speed * dir * (dt / 16);
    this.y += Math.sin(performance.now() * this.frequency) * 0.4 * (dt / 16);

    if (this.x > CANVAS_WIDTH + 200) this.x = -200;
    if (this.x < -200) this.x = CANVAS_WIDTH + 200;
    if (this.y < 80) this.y = 80;
    if (this.y > CANVAS_HEIGHT - 150) this.y = CANVAS_HEIGHT - 150;
  }
}

let fishes = [];
let time = 0;
let attractStep = 0;
let panelEl = null;
let titleEl = null;
let textEl = null;
let btnEl = null;
let splitTextEl = null;
let splitTextBodyEl = null;
let splitHintEl = null;
let splitLeftBtnEl = null;
let splitPhoneEl = null;
let splitPhoneDescEl = null;
let splitPhoneInstalledEl = null;
let splitBtnEl = null;
let countdownEl = null;
let countdownLine1El = null;
let countdownLine2El = null;
let countdownNumEl = null;
// 第一页背景视频（客户 2026-10-30）
let videoEl = null;
let panelHandler = null;
let installHandler = null;
let leftBtnHandler = null;
let tapHandler = null;
let countdownTimer = null;
let countdownStartTimer = null;
let phoneHideTimer = null;
let phoneSlideTimer = null;
// 两个说明行各 300 ms 淡入,数字(和读秒)在第 600 ms 出现。
const COUNTDOWN_LEAD_MS = 600;

/**
 * Restart a one-shot CSS entrance animation.
 *
 * The element is already in the DOM, so simply adding the class the first time
 * works — but when the visitor comes back to this step (idle reset) the class is
 * still there and the animation would never replay. Removing it, forcing a
 * reflow, then adding it back makes the browser treat it as a fresh animation.
 */
function restartSlide(el) {
  if (!el) return;
  el.classList.remove('slide-in');
  void el.offsetWidth;          // 强制重排,否则下面重新加类不会重新播动画
  el.classList.add('slide-in');
}

/**
 * 第一页背景视频（客户 2026-10-30）：只在 POSTER 这一步显示。
 * 离开第一页时淡出（CSS 0.8 s），露出画布上原本画的河流和鱼群；
 * 视频是 muted + loop，展台不需要声音。
 */
function showPosterVideo() {
  if (!videoEl) return;

  videoEl.classList.add('visible');

  const playing = videoEl.play();

  if (playing && typeof playing.catch === 'function') {
    // 自动播放被浏览器拦掉也没关系：poster 图仍然在，不会白屏
    playing.catch(() => {});
  }
}

function hidePosterVideo() {
  if (!videoEl) return;

  videoEl.classList.remove('visible');

  try {
    videoEl.pause();
  } catch (error) {
    /* 忽略 */
  }
}

function showAttract(step) {
  // 第一页才有实拍视频；其它步骤回到画布上画的河流 + 鱼群
  if (step === 0) {
    showPosterVideo();
  } else {
    hidePosterVideo();
  }

  if (step === 0) {
    if (splitTextEl) splitTextEl.style.display = 'none';
    if (splitPhoneEl) {
      clearTimeout(phoneHideTimer);
      clearTimeout(phoneSlideTimer);
      splitPhoneEl.classList.remove('slide-out', 'slide-in', 'phone-pending');
      splitPhoneEl.style.display = 'none';
    }
    if (countdownEl) countdownEl.style.display = 'none';
    if (titleEl) titleEl.textContent = PANEL_STEP.title;
    if (textEl) textEl.textContent = PANEL_STEP.text;
    if (btnEl) btnEl.textContent = PANEL_STEP.btn;
    if (panelEl) panelEl.classList.add('visible');
  } else if (step === STEP.INSTALL) {
    // Install: explanation on the left, phone with the Install button on the right.
    if (panelEl) panelEl.classList.remove('visible');
    if (countdownEl) countdownEl.style.display = 'none';

    if (splitTextBodyEl) splitTextBodyEl.textContent = SPLIT_STEP.text;
    // Note: the "Threatened Fishes App" heading was removed from this step on
    // request — the phone panel on the right already shows the app name.
    // Hint now sits under the phone's Install button, next to what it points at.
    if (splitHintEl) { splitHintEl.style.display = 'block'; splitHintEl.textContent = SPLIT_STEP.hint; splitHintEl.classList.add('visible'); }
    if (splitPhoneDescEl) { splitPhoneDescEl.style.display = 'block'; splitPhoneDescEl.textContent = SPLIT_STEP.phoneDesc; }
    if (splitPhoneInstalledEl) splitPhoneInstalledEl.style.display = 'none';
    if (splitBtnEl) { splitBtnEl.style.display = 'inline-block'; }
    if (splitLeftBtnEl) splitLeftBtnEl.style.display = 'none';

    // 'flex' (not 'block'): the stylesheet centres this panel with flex, and an
    // inline display would otherwise override it.
    if (splitTextEl) {
      splitTextEl.style.display = 'flex';
      restartSlide(splitTextEl);
    }
    if (splitPhoneEl) {
      // 客户 2026-10-23:"can we have the white text appear first, after 1 sec then
      // have the phone slide in from the right" —— 先让左边这段白字滑入(0.9 s),
      // 1 秒后手机再从右边滑进来(1.6 s)。手机先藏在屏幕外(.phone-pending)。
      clearTimeout(phoneHideTimer);
      clearTimeout(phoneSlideTimer);
      splitPhoneEl.classList.remove('slide-out', 'slide-in');
      splitPhoneEl.classList.add('phone-pending');
      splitPhoneEl.style.display = 'block';
      phoneSlideTimer = setTimeout(() => {
        if (!splitPhoneEl) return;
        splitPhoneEl.classList.remove('phone-pending');
        void splitPhoneEl.offsetWidth;      // 强制重排,保证动画从屏幕外开始
        splitPhoneEl.classList.add('slide-in');
      }, PHONE_SLIDE_IN_DELAY_MS);
    }
  } else if (step === STEP.COUNTDOWN) {
    // Install complete — lines appear one by one, then a 3 second countdown.
    if (panelEl) panelEl.classList.remove('visible');
    if (splitTextEl) splitTextEl.style.display = 'none';
    if (splitHintEl) splitHintEl.style.display = 'none';
    if (splitPhoneDescEl) splitPhoneDescEl.style.display = 'none';
    if (splitPhoneInstalledEl) splitPhoneInstalledEl.style.display = 'block';
    if (splitBtnEl) splitBtnEl.style.display = 'none';
    if (splitPhoneEl) {
      // 手机就位显示;万一滑入还没播完(手快在第 1 秒内就点了 Install),直接摆回原位。
      clearTimeout(phoneSlideTimer);
      splitPhoneEl.classList.remove('phone-pending', 'slide-in', 'slide-out');
      splitPhoneEl.style.display = 'block';
    }
    if (countdownEl) countdownEl.style.display = 'flex';
  } else {
    // CATCH (and anything past it): 倒计时结束后手机滑出屏幕,再清掉其它叠层,
    // 只留河流和"Tap a fish to catch it"。
    if (panelEl) panelEl.classList.remove('visible');
    if (splitTextEl) splitTextEl.style.display = 'none';
    if (countdownEl) countdownEl.style.display = 'none';
    slidePhoneOut();
  }
}

/**
 * 手机滑出:加 .slide-out 播 CSS 动画(1.6 s),动画结束再 display:none。
 * 客户 2026-10-22:"改成倒计时后手机滑出"。
 */
function slidePhoneOut() {
  if (!splitPhoneEl || splitPhoneEl.style.display === 'none') return;
  clearTimeout(phoneHideTimer);
  clearTimeout(phoneSlideTimer);
  splitPhoneEl.classList.remove('slide-out', 'slide-in', 'phone-pending');
  void splitPhoneEl.offsetWidth;      // 强制重排,保证动画能重新播
  splitPhoneEl.classList.add('slide-out');
  phoneHideTimer = setTimeout(() => {
    if (!splitPhoneEl) return;
    splitPhoneEl.style.display = 'none';
    splitPhoneEl.classList.remove('slide-out');
  }, PHONE_SLIDE_OUT_MS);
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (countdownStartTimer) {
    clearTimeout(countdownStartTimer);
    countdownStartTimer = null;
  }
}

/**
 * Step 2: "Installation complete." / "Get ready to fish in:" then 3, 2, 1 —
 * the lines fade in one after another, the number ticks down once per second,
 * and the catch step starts on its own.
 *
 * Client review 2026-10-20: "将倒计时从 2-1 改为 3-2-1". The number used to be
 * revealed after the two lines (1.05 s in), by which time the clock had already
 * counted one second away — so the visitor only ever saw 2 and 1. The clock now
 * starts at the moment the number appears, so 3, 2 and 1 each get a full second.
 */
function startCountdown() {
  clearCountdown();
  attractStep = STEP.COUNTDOWN;
  showAttract(STEP.COUNTDOWN);

  // Line-by-line reveal: two lines first, the number last.
  [countdownLine1El, countdownLine2El, countdownNumEl].forEach((el) => {
    if (el) el.classList.remove('visible');
  });
  const reveal = (el, delayMs) => {
    if (el) setTimeout(() => el.classList.add('visible'), delayMs);
  };
  reveal(countdownLine1El, 0);
  reveal(countdownLine2El, 300);
  reveal(countdownNumEl, COUNTDOWN_LEAD_MS);
  if (countdownNumEl) countdownNumEl.textContent = String(COUNTDOWN_SECONDS);

  // One clock for the whole countdown, started with the number.
  countdownStartTimer = setTimeout(() => {
    countdownStartTimer = null;
    const startedAt = performance.now();
    const render = () => {
      const elapsed = performance.now() - startedAt;
      const left = COUNTDOWN_SECONDS - Math.floor(elapsed / 1000);
      if (left > 0) {
        if (countdownNumEl) countdownNumEl.textContent = String(left);
        return;
      }
      // Countdown finished → straight into the catch step, no button needed.
      clearCountdown();
      attractStep = STEP.CATCH;
      showAttract(STEP.CATCH);
      emit('idle-reset');
    };
    countdownTimer = setInterval(render, 100);
  }, COUNTDOWN_LEAD_MS);

  emit('idle-reset');
}

function onPanelNext(e) {
  e.preventDefault();
  e.stopPropagation();
  attractStep = STEP.INSTALL;
  showAttract(attractStep);
  emit('idle-reset');
}

/** Pressing Install on the phone kicks off the countdown. */
function onInstall(e) {
  e.preventDefault();
  e.stopPropagation();
  startCountdown();
}

function onTapFish(e) {
  if (attractStep < STEP.CATCH) return;

  const canvas = document.getElementById('fg-canvas');
  const rect = canvas.getBoundingClientRect();
  const cx = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
  const cy = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

  for (const f of fishes) {
    // Hit radius follows the drawn size (160px * scale) so a clearly visible
    // fish is never "missed" by the tap.
    const hitR = 160 * f.scale * 0.55;
    const dx = cx - f.x;
    const dy = cy - f.y;
    if (dx * dx + dy * dy <= hitR * hitR) {
      e.preventDefault();
      e.stopPropagation();
      appState.correctFish = f.species;
      transition('CATCH_FISH');
      return;
    }
  }
}

/**
 * True only when the attract flow is sitting on its very first page.
 * Used by the idle handler: the install / go-fish / catch steps live in the
 * same scene as the poster, so the scene id is not enough to tell them apart.
 */
function isAtStart() {
  return attractStep === 0;
}

/**
 * Read-only view of the swimming shoal, for setup checks and QA: lets a test
 * confirm the fish really do travel in both directions.
 */
function getFishes() {
  return fishes;
}

function enter() {
  fishes = [];
  const count = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const species = FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
    fishes.push(new SwimmingFish(species));
  }
  time = 0;
  attractStep = STEP.POSTER;
  clearCountdown();

  panelEl = document.getElementById('attract-panel');
  titleEl = document.getElementById('attract-title');
  textEl = document.getElementById('attract-text');
  btnEl = document.getElementById('btn-attract-next');
  splitTextEl = document.getElementById('attract-install-text');
  splitTextBodyEl = document.getElementById('split-text');
  splitHintEl = document.getElementById('split-hint');
  splitLeftBtnEl = document.getElementById('split-left-btn');
  splitPhoneEl = document.getElementById('attract-install-phone');
  splitPhoneDescEl = document.getElementById('split-phone-desc');
  splitPhoneInstalledEl = document.getElementById('split-phone-installed');
  splitBtnEl = document.getElementById('btn-attract-install');
  countdownEl = document.getElementById('attract-countdown');
  countdownLine1El = document.getElementById('countdown-line1');
  countdownLine2El = document.getElementById('countdown-line2');
  countdownNumEl = document.getElementById('countdown-number');
  videoEl = document.getElementById('attract-video');

  // Listeners are bound with stable module-level handlers and removed in
  // exit(), so re-entering the scene never stacks duplicates.
  removeListeners();

  if (btnEl) {
    panelHandler = onPanelNext;
    btnEl.addEventListener('pointerup', panelHandler);
  }
  if (splitBtnEl) {
    installHandler = onInstall;
    splitBtnEl.addEventListener('pointerup', installHandler);
  }

  const sceneEl = document.getElementById('scene-screensaver');
  if (sceneEl) {
    tapHandler = onTapFish;
    sceneEl.addEventListener('pointerup', tapHandler);
  }

  showAttract(STEP.POSTER);
}

function removeListeners() {
  if (panelHandler && btnEl) btnEl.removeEventListener('pointerup', panelHandler);
  if (installHandler && splitBtnEl) splitBtnEl.removeEventListener('pointerup', installHandler);
  if (leftBtnHandler && splitLeftBtnEl) splitLeftBtnEl.removeEventListener('pointerup', leftBtnHandler);
  if (tapHandler) {
    const sceneEl = document.getElementById('scene-screensaver');
    if (sceneEl) sceneEl.removeEventListener('pointerup', tapHandler);
  }
  panelHandler = null;
  installHandler = null;
  leftBtnHandler = null;
  tapHandler = null;
}

function update(dt) {
  time += dt;
  for (const f of fishes) {
    f.update(dt);
  }
}

function render(ctx) {
  drawRiverBg(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, time);

  // Back-to-front by size: the small fish are painted first so a larger fish
  // crossing the same spot covers them, instead of the two intersecting
  // ("把小的鱼放在大的鱼后面").
  const sorted = [...fishes].sort((a, b) => a.scale - b.scale);
  for (const f of sorted) {
    drawFishImage(ctx, f.species, f.x, f.y, f.scale, f.opacity, f.facingRight);
  }

  // Catch step: the only prompt is this one line (kept by request).
  if (attractStep >= STEP.CATCH) {
    ctx.save();
    ctx.font = `38px ${FONT_DISPLAY}`;
    ctx.fillStyle = '#b4d2eb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap a fish to catch it', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    ctx.restore();
  }
}

function exit() {
  clearCountdown();
  clearTimeout(phoneHideTimer);
  phoneHideTimer = null;
  clearTimeout(phoneSlideTimer);
  phoneSlideTimer = null;
  hidePosterVideo();
  removeListeners();
}


_m.scenes_screensaver.isAtStart = isAtStart;
_m.scenes_screensaver.getFishes = getFishes;
_m.scenes_screensaver.enter = enter;
_m.scenes_screensaver.update = update;
_m.scenes_screensaver.render = render;
_m.scenes_screensaver.exit = exit;
})();

// ======== scenes/fish-appear.js ========
(function() {
  var _m = window._m;
  _m.scenes_fish_appear = {};
// Fish Appear scene — caught fish on the left, login phone on the right

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var FISH_DISPLAY_W = _m.config.FISH_DISPLAY_W;
var drawRiverBg = _m.engine_renderer.drawRiverBg;
var drawFishImage = _m.engine_renderer.drawFishImage;
var appState = _m.state.appState;
var transition = _m.state.transition;
var randomFish = _m.utils_helpers.randomFish;

let correctFish = null;
let loginHandler = null;

function onLogin(e) {
  e.preventDefault();
  e.stopPropagation();
  transition('TAP_LOGIN');
}

/**
 * 客户 2026-10-22:"捕鱼页面点一个鱼之后，手机再滑出来" —— 捕鱼那一步手机已经滑出
 * 屏幕了,所以点中鱼之后,这一页的手机要从右侧重新滑进来(动画在 css/style.css)。
 */
function slidePhoneIn() {
  const el = document.querySelector('#scene-fish-appear .phone-frame');
  if (!el) return;
  el.classList.remove('phone-enter');
  void el.offsetWidth;          // 强制重排,保证动画能重新播
  el.classList.add('phone-enter');
}

function enter() {
  correctFish = appState.correctFish || randomFish();
  appState.correctFish = correctFish;

  const btn = document.getElementById('btn-login');
  if (btn) {
    loginHandler = onLogin;
    btn.addEventListener('pointerup', loginHandler);
  }

  slidePhoneIn();
}

function update() {}

function render(ctx) {
  drawRiverBg(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (!correctFish) return;

  // "fish should fill this area of the screen" — centre it in the free space
  // left of the phone, at the one shared size used by every scene.
  const fishX = CANVAS_WIDTH * 0.3;
  const fishY = CANVAS_HEIGHT * 0.5;

  const glow = ctx.createRadialGradient(fishX, fishY, 20, fishX, fishY, 330);
  glow.addColorStop(0, 'rgba(91, 155, 212, 0.3)');
  glow.addColorStop(1, 'rgba(91, 155, 212, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(fishX - 380, fishY - 380, 760, 760);

  drawFishImage(ctx, correctFish, fishX, fishY, 1, 1, 'auto', 'center', FISH_DISPLAY_W);
}

function exit() {
  if (loginHandler) {
    const btn = document.getElementById('btn-login');
    if (btn) btn.removeEventListener('pointerup', loginHandler);
    loginHandler = null;
  }
}


_m.scenes_fish_appear.enter = enter;
_m.scenes_fish_appear.update = update;
_m.scenes_fish_appear.render = render;
_m.scenes_fish_appear.exit = exit;
})();

// ======== scenes/fish-selection.js ========
(function() {
  var _m = window._m;
  _m.scenes_fish_selection = {};
// Fish Selection scene — species grid for identifying the fish just caught.
//
// Requirement (client note 2): the caught fish stays on screen while the
// visitor picks its species, so the canvas keeps drawing it on the left while
// the app UI sits on the right.

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var FISH_SPECIES = _m.config.FISH_SPECIES;
var FISH_DISPLAY_W = _m.config.FISH_DISPLAY_W;
var drawRiverBg = _m.engine_renderer.drawRiverBg;
var drawFishImage = _m.engine_renderer.drawFishImage;
var appState = _m.state.appState;
var transition = _m.state.transition;
var emit = _m.state.emit;

let gridEl = null;
let cards = [];
let time = 0;

function enter() {
  time = 0;
  gridEl = document.getElementById('fish-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';
  cards = [];

  FISH_SPECIES.forEach((fish, index) => {
    const card = document.createElement('div');
    card.className = 'fish-card';
    card.dataset.fishId = fish.id;
    card.style.animationDelay = `${index * 60}ms`;
    card.style.animation = 'card-appear 0.4s ease-out both';

    card.innerHTML = `
      <img class="fish-card-img" src="${fish.image}" alt="${fish.commonName}" loading="eager">
      <p class="fish-card-name">${fish.commonName}</p>
      <p class="fish-card-scientific"><em>${fish.scientificName}</em></p>
    `;

    card.addEventListener('pointerup', (e) => {
      e.preventDefault();
      handleSelection(fish);
    });

    gridEl.appendChild(card);
    cards.push(card);
  });

  // Add card-appear keyframes dynamically
  if (!document.getElementById('card-appear-style')) {
    const style = document.createElement('style');
    style.id = 'card-appear-style';
    style.textContent = `
      @keyframes card-appear {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
}

function update(dt) {
  time += dt;
}

function render(ctx) {
  drawRiverBg(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, time);

  const fish = appState.correctFish;
  if (!fish) return;

  // Same spot and same size as the previous page, so the fish does not jump
  // or resize between screens ("fish to remain same size throughout").
  const fishX = CANVAS_WIDTH * 0.3;
  const fishY = CANVAS_HEIGHT * 0.5;

  const glow = ctx.createRadialGradient(fishX, fishY, 20, fishX, fishY, 330);
  glow.addColorStop(0, 'rgba(91, 155, 212, 0.3)');
  glow.addColorStop(1, 'rgba(91, 155, 212, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(fishX - 380, fishY - 380, 760, 760);

  drawFishImage(ctx, fish, fishX, fishY, 1, 1, 'auto', 'center', FISH_DISPLAY_W);
}

function handleSelection(fish) {
  appState.selectedFish = fish;
  appState.isCorrect = fish.id === appState.correctFish.id;
  emit('fish-selected', { selected: fish, correct: appState.correctFish, isCorrect: appState.isCorrect });
  transition('SELECT_FISH');
}

function exit() {
  if (gridEl) gridEl.innerHTML = '';
  cards = [];
}


_m.scenes_fish_selection.enter = enter;
_m.scenes_fish_selection.update = update;
_m.scenes_fish_selection.render = render;
_m.scenes_fish_selection.exit = exit;
})();

// ======== scenes/measurement.js ========
(function() {
  var _m = window._m;
  _m.scenes_measurement = {};
// Measurement scene — animated measuring tape + weighing scale + data fill + correction popup

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var SCALE_MAX_WEIGHT_KG = _m.config.SCALE_MAX_WEIGHT_KG;
var FISH_DISPLAY_W = _m.config.FISH_DISPLAY_W;
var FONT_BODY = _m.config.FONT_BODY;
var FONT_DISPLAY = _m.config.FONT_DISPLAY;
var drawRiverBg = _m.engine_renderer.drawRiverBg;
var drawFishImage = _m.engine_renderer.drawFishImage;
var drawRoundedRect = _m.engine_renderer.drawRoundedRect;
var fishDrawSize = _m.engine_renderer.fishDrawSize;
var appState = _m.state.appState;
var transition = _m.state.transition;
var tweenTo = _m.engine_animation.tweenTo;
var formatLength = _m.utils_helpers.formatLength;
var formatWeight = _m.utils_helpers.formatWeight;
var getFishImage = _m.utils_images.getFishImage;

let tapeProgress = 0;
let scaleAngle = -30;
let submitBtn = null;
let submitHandler = null;
let correctionEl = null;
let correctionDismissHandler = null;
let dataTargets = {};
let animationDone = false;
let correctionVisible = false;
// Guards the tape/scale/data animation so it runs exactly once per visit —
// either on entry (correct pick) or after OK on the note (wrong pick).
let measurementStarted = false;
// Fade-in used to blend in from the "you caught a fish" page.
let fadeIn = 0;
const FADE_MS = 650;
// How far the equipment travels during the entry animation.
const PLAT_RISE_FROM = 300;   // scale starts this far below its final spot
const TAPE_DROP_FROM = 240;   // tape starts this far above its final spot
// Dial geometry — the needle and the printed ticks MUST use the same sweep,
// otherwise a 15 kg fish stops short of the "15" mark. (130° over 0…18 kg.)
const DIAL_START_ANGLE = -65;
const DIAL_SWEEP_DEG = 130;
let dataFieldEls = [];

function showCorrection() {
  correctionEl = document.getElementById('correction-overlay');
  if (correctionEl) {
    correctionEl.style.display = 'flex';
    correctionVisible = true;

    const dismissBtn = document.getElementById('btn-correction-dismiss');
    if (dismissBtn) {
      correctionDismissHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCorrectionAcknowledged();
      };
      dismissBtn.addEventListener('pointerup', correctionDismissHandler);
    }
  }
}

/**
 * The species whose record the phone is showing.
 *
 * Until the visitor gets the identification corrected, the app is showing THEIR
 * record — i.e. the fish they picked, which may be the wrong one (client review:
 * "选择错的鱼先要在手机上显示错的鱼图，点击后才换成正确的"). After the correction
 * it shows the true species. The canvas is unaffected: the fish on the scale is
 * the real fish either way.
 */
function recordFish() {
  if (appState.isCorrect) return appState.correctFish;
  if (appState.correctionShown) return appState.correctFish;
  return appState.selectedFish || appState.correctFish;
}

/** Species picture above the Common Name row. */
function paintRecordFish(fish) {
  if (!fish) return;
  const statusFish = document.getElementById('status-fish-img');
  if (statusFish) {
    statusFish.src = fish.image;
    statusFish.alt = fish.commonName;
  }
}

/** Row order, shared by the staggered reveal and the correction swap. */
const RECORD_FIELDS = ['commonName', 'scientificName', 'length', 'weight', 'location'];

/**
 * 客户 2026-11-04:"如果有人选错了鱼，重量和长度应该保持不变，只有名称会改变，
 * 这意味着即使你选错了物种，重量和长度也应该是正确的。"
 *
 * 所以一行的取值规则是：
 *   - 名称（Common Name / Scientific Name）→ 访客选的那条鱼（纠正前是错的）；
 *   - Length / Weight / Location → **真正捞到的那条鱼**（秤和卷尺量出来的事实）。
 *
 * 顺带修掉一个旧的矛盾：卷尺和表盘一直画的是真鱼的数据，而面板显示的是选错那条的，
 * 于是"110 cm 的卷尺 + 74 cm 的面板"会同时出现。现在两边一致了。
 * 点 OK 纠正之后，名称也换成真鱼（paintRecord(correctFish)）。
 */
function recordValues(fish) {
  const measured = appState.correctFish || fish;

  return [
    fish.commonName,
    fish.scientificName,
    formatLength(measured.lengthM),
    formatWeight(measured.weightKg),
    measured.location,
  ];
}

/**
 * Fish picture + all five rows at once. Only used when the record is corrected —
 * on entering the page the rows are filled one by one by runMeasurement(), so
 * calling this early would dump every value on screen at the same moment
 * (client review: "一下子全部数据都出来了").
 */
function paintRecord(fish) {
  if (!fish) return;
  paintRecordFish(fish);
  const values = recordValues(fish);
  RECORD_FIELDS.forEach((key, i) => {
    const el = dataTargets[key];
    if (el) el.textContent = values[i];
  });
}

/**
 * OK on the note: the record is corrected as the visitor watches, then the note
 * goes away and they can move on with Submit.
 */
function onCorrectionAcknowledged() {
  hideCorrection();
  paintRecord(appState.correctFish);
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.animation = 'go-fish-pulse 2s ease-in-out infinite';
  }
}

function hideCorrection() {
  if (correctionEl) {
    correctionEl.style.display = 'none';
    correctionVisible = false;

    const dismissBtn = document.getElementById('btn-correction-dismiss');
    if (dismissBtn && correctionDismissHandler) {
      dismissBtn.removeEventListener('pointerup', correctionDismissHandler);
      correctionDismissHandler = null;
    }
  }
}

function onSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!animationDone) return;

  // Wrong species: the record is shown first; the note appears once Submit is
  // pressed ("纠错标签页放在点击 submit 后"). Tapping OK dismisses it and the
  // visitor presses Submit again to continue.
  if (!appState.isCorrect && !appState.correctionShown) {
    appState.correctionShown = true;
    showCorrection();
    return;
  }

  // Proceed to choice
  transition('SUBMIT');
}

function enter() {
  const displayFish = appState.correctFish;

  tapeProgress = 0;
  scaleAngle = -30;
  animationDone = false;
  correctionVisible = false;
  measurementStarted = false;
  // Start the scale view transparent and fade it up (blends in from the
  // "you caught a fish" page).
  fadeIn = 0;

  // "add image of fish" — species picture above the Common Name row. This is the
  // visitor's OWN record at first, so a wrong pick shows the wrong fish until the
  // correction is acknowledged (see recordFish).
  const statusFish = document.getElementById('status-fish-img');
  if (statusFish && displayFish) {
    statusFish.style.display = 'block';
  }

  submitBtn = document.getElementById('btn-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.animation = '';
    submitHandler = onSubmit;
    submitBtn.addEventListener('pointerup', submitHandler);
  }

  hideCorrection();

  dataTargets = {
    commonName: document.getElementById('data-common-name'),
    scientificName: document.getElementById('data-scientific-name'),
    length: document.getElementById('data-length'),
    weight: document.getElementById('data-weight'),
    location: document.getElementById('data-location'),
  };
  Object.values(dataTargets).forEach(el => { if (el) { el.textContent = '--'; el.classList.remove('revealed'); } });

  // Rows fade in together with the canvas.
  dataFieldEls = Array.from(document.querySelectorAll('#scene-measurement .data-field'));
  for (const el of dataFieldEls) el.style.opacity = '0';
  if (submitBtn) submitBtn.style.opacity = '0';
  dataFieldEls.push(submitBtn);

  // The measurement always plays. The correction note is not shown here any
  // more — it waits until the visitor presses Submit (see onSubmit).
  // Only the PICTURE is painted here: the five rows are filled one by one by
  // runMeasurement() further down, and pre-filling them would show every value
  // at once.
  paintRecordFish(recordFish() || displayFish);
  runMeasurement();
}

/** Tape + scale animation, then the data fields fill in one by one. */
function runMeasurement() {
  const displayFish = appState.correctFish;
  if (!displayFish) return;
  measurementStarted = true;

  // Start animations
  const tapeObj = { progress: 0 };

  // Calculate target scale angle based on fish weight.
  // Dial sweep must match the tick marks below (-65° … +65°), otherwise the needle
  // stops a degree or two short of its own label: -65 = 0 kg, +65 = 18 kg.
  const maxDisplayWeight = SCALE_MAX_WEIGHT_KG;
  const weightFraction = Math.min(displayFish.weightKg / maxDisplayWeight, 1);
  const targetScaleAngle = DIAL_START_ANGLE + weightFraction * DIAL_SWEEP_DEG;

  const scaleObj = { angle: DIAL_START_ANGLE };

  tweenTo(tapeObj, { progress: 1 }, 1500, 'easeOutCubic')
    .progress((t) => { tapeProgress = t.progress; });

  tweenTo(scaleObj, { angle: targetScaleAngle }, 1400, 'easeOutBack')
    .progress((t) => { scaleAngle = t.angle; });

  // Reveal data fields sequentially. These are the RECORD's values (the visitor's
  // pick), not the real fish's — the canvas above is what shows the real fish.
  const record = recordFish() || displayFish;
  const fields = RECORD_FIELDS;
  const values = recordValues(record);

  fields.forEach((key, i) => {
    setTimeout(() => {
      const el = dataTargets[key];
      if (el) {
        el.textContent = values[i];
        el.classList.add('revealed');
      }

      if (i === fields.length - 1) {
        setTimeout(() => {
          animationDone = true;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.animation = 'go-fish-pulse 2s ease-in-out infinite';
          }
        }, 400);
      }
    }, 800 + i * 500);
  });
}

function update(dt) {
  // Entry animation: the scale rises from below and the measuring tape drops
  // in from above while the whole page fades up, so it blends in from the
  // "you caught a fish" page instead of cutting in.
  if (fadeIn < 1) {
    fadeIn = Math.min(1, fadeIn + dt / FADE_MS);
    // Data lines ride the same fade, so the form arrives with the equipment.
    for (const el of dataFieldEls) {
      if (el) el.style.opacity = fadeIn.toFixed(3);
    }
  }
}

/**
 * Read-only view of the entry animation, for setup checks and QA: reports the
 * current progress plus where the scale and tape currently sit. Nothing in the
 * game reads this.
 */
function getEntryLayout() {
  const p = fadeIn;
  const slide = 1 - Math.pow(1 - p, 3);
  const platYBase = CANVAS_HEIGHT * 0.65;
  const fishBase = platYBase - 6;
  const f = appState.correctFish;
  const img = f ? getFishImage(f.id) : null;
  const fishDrawH = img ? fishDrawSize(img, FISH_DISPLAY_W).h : 0;
  const fishTop = fishBase - fishDrawH;
  const tapeSettle = Math.max(CANVAS_HEIGHT * 0.10, fishTop - 70);
  return {
    progress: p,
    slide,
    platY: platYBase + (1 - slide) * PLAT_RISE_FROM,
    tapeY: tapeSettle - (1 - slide) * TAPE_DROP_FROM,
    fishBase,          // constant: the fish does not travel
    fishTop,           // constant too
    fishDrawH,
  };
}

function render(ctx) {
  ctx.save();
  ctx.globalAlpha = fadeIn;

  drawRiverBg(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

  const fish = appState.correctFish;
  if (!fish) { ctx.restore(); return; }

  const cx = CANVAS_WIDTH * 0.38;
  const platW = 620;
  const platH = 24;
  const platX = cx - platW / 2;

  // Entry motion: ease-out so the equipment "settles" into place.
  const p = fadeIn;
  const slide = 1 - Math.pow(1 - p, 3);

  // The fish is now 560px wide (~436px tall for the deep-bodied species), so
  // the platform sits lower and the tape higher to keep the two clear of it.
  // The fish stays put at this height while the scale rises to meet it and the
  // tape drops in above it, so the two pieces close around the fish.
  const platYBase = CANVAS_HEIGHT * 0.65;
  const platY = platYBase + (1 - slide) * PLAT_RISE_FROM;
  // Fish sits IN the tray, not on top of it: seating it slightly below the tray
  // surface stops the belly fins from hanging past the bar (which read as the
  // fish sitting in a basket).
  const fishBase = platYBase - 6;
  // 这条鱼画出来多高 / 多宽(高图会被 fishDrawSize 收窄,见 renderer.js)。
  // 卷尺就停在这条鱼背上方固定距离的地方。
  const fishImg = getFishImage(fish.id);
  const fishSize = fishDrawSize(fishImg, FISH_DISPLAY_W);
  const fishDrawH = fishSize.h;

  // === 1. Horizontal Measuring Tape ===
  // Rides just above whatever species was caught, so it always reads as
  // measuring THIS fish instead of floating away from a shallow-bodied one.
  const TAPE_GAP_ABOVE_FISH = 70;
  const fishTop = fishBase - fishDrawH;
  const tapeSettle = Math.max(CANVAS_HEIGHT * 0.10, fishTop - TAPE_GAP_ABOVE_FISH);
  const tapeY = tapeSettle - (1 - slide) * TAPE_DROP_FROM;
  const tapeLeft = cx - 300;
  const tapeRight = cx + 300;
  const tapeFullW = tapeRight - tapeLeft;
  const tapeRevealW = tapeFullW * tapeProgress;
  const tapeThickness = 30;

  // Tape unrolls from right. The clip has to be taller than the band itself:
  // the metre labels are drawn just BELOW the band (y + tapeThickness + 12), so
  // a clip of exactly `tapeThickness` silently threw every one of them away.
  ctx.save();
  ctx.beginPath();
  ctx.rect(tapeRight - tapeRevealW, tapeY, tapeRevealW, tapeThickness + 22);
  ctx.clip();
  ctx.fillStyle = '#f5d442';
  ctx.fillRect(tapeLeft, tapeY, tapeFullW, tapeThickness);

  ctx.strokeStyle = '#333';
  // Was monospace; the client's Chivo carries the tape labels now. They are
  // centred on their tick marks, so proportional figures still line up.
  ctx.font = `11px ${FONT_DISPLAY}`;
  // Labels sit BELOW the band, on the page's dark blue, so they need a light
  // fill — the dark grey is right for the ticks (on yellow) but unreadable on
  // blue. (The ticks use strokeStyle, so this does not affect them.)
  ctx.fillStyle = '#b4d2eb';
  ctx.textAlign = 'center';
  const fishLenCm = fish.lengthM * 100;
  const pxPerCm = tapeFullW / fishLenCm;
  // Label interval follows the specimen. The client's catches run from 15 cm to
  // 110 cm (2026-11-02 table), and a 15 cm fish has no 25 cm mark to label, so
  // short fish are ruled every 10 cm and the longer ones every 25 cm.
  // 客户 2026-11-02："length 全部用 cm" —— 卷尺标号也统一成 cm（不再出现 0.25m/1m）。
  const majorCm = fishLenCm <= 50 ? 10 : 25;
  for (let cm = 0; cm <= fishLenCm; cm += 5) {
    const mx = tapeLeft + cm * pxPerCm;
    if (mx > tapeLeft + tapeRevealW) continue;
    const isMajor = cm % majorCm === 0;
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(mx, tapeY + (isMajor ? 1 : 6));
    ctx.lineTo(mx, tapeY + tapeThickness - 1);
    ctx.stroke();
    // Only INTERIOR marks are labelled. The clip that unrolls the tape spans
    // exactly the tape, so a label centred on either end loses half of itself:
    // the origin one rendered as a stray "m", and the last one disappears behind
    // the end cap / housing. The red caps mark the two ends, as on a real tape,
    // and the exact length is shown in the phone panel.
    if (isMajor && cm > 0 && cm < fishLenCm) {
      ctx.fillText(`${cm}cm`, mx, tapeY + tapeThickness + 12);
    }
  }
  ctx.restore();

  // Tape end caps
  for (const capX of [tapeLeft, tapeRight]) {
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(capX - 2, tapeY - 3, 4, tapeThickness + 6);
  }
  // Tape housing
  ctx.fillStyle = '#666';
  drawRoundedRect(ctx, tapeRight, tapeY - 6, 30, tapeThickness + 26, 4, '#666', null);
  ctx.fillStyle = '#555';
  drawRoundedRect(ctx, tapeRight + 3, tapeY - 1, 24, tapeThickness + 16, 3, '#555', null);
  ctx.fillStyle = '#777';
  ctx.beginPath();
  ctx.arc(tapeRight + 15, tapeY + tapeThickness / 2 + 7, 8, 0, Math.PI * 2);
  ctx.fill();

  // === 2. Fish — held still while the scale and tape close in around it ===
  // Anchored to the platform's FINAL height, so it does not travel with the
  // rising scale; the equipment comes to the fish, not the other way round.
  ctx.save();
  ctx.translate(cx, fishBase);
  ctx.rotate(-0.06);
  drawFishImage(ctx, fish, 0, 0, 1, 1, 'auto', 'bottom', FISH_DISPLAY_W);  ctx.restore();

  // === 3. Scale Platform (metal tray, below fish) ===
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  drawRoundedRect(ctx, platX - 4, platY + 4, platW + 8, platH + 4, 10, 'rgba(0,0,0,0.35)', null);

  // Tray
  const trayGrad = ctx.createLinearGradient(0, platY, 0, platY + platH);
  trayGrad.addColorStop(0, '#c8c8c8');
  trayGrad.addColorStop(0.3, '#e4e4e4');
  trayGrad.addColorStop(0.6, '#d0d0d0');
  trayGrad.addColorStop(1, '#999');
  drawRoundedRect(ctx, platX, platY, platW, platH, 8, null, '#777');
  ctx.fillStyle = trayGrad;
  ctx.beginPath();
  ctx.moveTo(platX + 8, platY);
  ctx.lineTo(platX + platW - 8, platY);
  ctx.quadraticCurveTo(platX + platW, platY, platX + platW, platY + 8);
  ctx.lineTo(platX + platW, platY + platH - 8);
  ctx.quadraticCurveTo(platX + platW, platY + platH, platX + platW - 8, platY + platH);
  ctx.lineTo(platX + 8, platY + platH);
  ctx.quadraticCurveTo(platX, platY + platH, platX, platY + platH - 8);
  ctx.lineTo(platX, platY + 8);
  ctx.quadraticCurveTo(platX, platY, platX + 8, platY);
  ctx.fill();
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Top edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(platX + 14, platY + 2);
  ctx.lineTo(platX + platW - 14, platY + 2);
  ctx.stroke();

  // === 4. Support bracket (below platform) ===
  const bracketTop = platY + platH;
  const bracketW = 110;
  const bracketH = 60;
  const bracketX = cx - bracketW / 2;

  const bracketGrad = ctx.createLinearGradient(0, bracketTop, 0, bracketTop + bracketH);
  bracketGrad.addColorStop(0, '#8a8a8a');
  bracketGrad.addColorStop(0.4, '#9c9c9c');
  bracketGrad.addColorStop(1, '#6a6a6a');
  ctx.fillStyle = bracketGrad;
  ctx.beginPath();
  ctx.moveTo(bracketX, bracketTop);
  ctx.lineTo(bracketX + bracketW, bracketTop);
  ctx.lineTo(bracketX + bracketW + 24, bracketTop + bracketH);
  ctx.lineTo(bracketX - 24, bracketTop + bracketH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bracketX + bracketW * 0.3, bracketTop + 2);
  ctx.lineTo(bracketX + bracketW * 0.3 + 22, bracketTop + bracketH - 3);
  ctx.stroke();

  // === 5. Scale dial ===
  const dialCX = cx;
  const dialCY = bracketTop + bracketH + 50;
  const dialR = 74;

  // Outer casing
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(dialCX, dialCY, dialR + 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(dialCX, dialCY, dialR + 6, 0, Math.PI * 2);
  ctx.stroke();

  // Face
  ctx.fillStyle = '#fafaf5';
  ctx.beginPath();
  ctx.arc(dialCX, dialCY, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(dialCX, dialCY, dialR, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.fillStyle = '#f2f2ec';
  ctx.beginPath();
  ctx.arc(dialCX, dialCY, dialR - 8, 0, Math.PI * 2);
  ctx.fill();

  // Tick marks
  const maxDisplayWeight = SCALE_MAX_WEIGHT_KG;
  for (let i = 0; i <= 30; i++) {
    // 与指针共用同一套角度常量（DIAL_START_ANGLE / DIAL_SWEEP_DEG）
    const angleDeg = DIAL_START_ANGLE + (i / 30) * DIAL_SWEEP_DEG;
    const rad = (angleDeg * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const innerR = dialR - (isMajor ? 22 : 14);
    const outerR = dialR - 4;
    ctx.strokeStyle = isMajor ? '#333' : '#999';
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(dialCX + Math.cos(rad) * innerR, dialCY + Math.sin(rad) * innerR);
    ctx.lineTo(dialCX + Math.cos(rad) * outerR, dialCY + Math.sin(rad) * outerR);
    ctx.stroke();
    if (isMajor) {
      ctx.fillStyle = '#333';
      ctx.font = `bold 10px ${FONT_DISPLAY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(maxDisplayWeight * i / 30)}`, dialCX + Math.cos(rad) * (dialR - 32), dialCY + Math.sin(rad) * (dialR - 32));
    }
  }

  ctx.fillStyle = '#666';
  ctx.font = `12px ${FONT_BODY}`;
  ctx.textAlign = 'center';
  ctx.fillText('kg', dialCX, dialCY + 28);

  // Needle
  ctx.save();
  ctx.translate(dialCX, dialCY);
  ctx.rotate((scaleAngle * Math.PI) / 180);
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.lineTo(dialR - 16, 0);
  ctx.lineTo(0, -3);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#222';
  ctx.fill();
  ctx.restore();

  // === 6. Base / stand (bottom) ===
  const baseY = dialCY + dialR + 18;
  const baseW = 240;
  const baseX = cx - baseW / 2;

  // Base shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  drawRoundedRect(ctx, baseX + 4, baseY + 4, baseW, 16, 6, 'rgba(0,0,0,0.3)', null);

  // Base body
  const baseGrad = ctx.createLinearGradient(0, baseY, 0, baseY + 16);
  baseGrad.addColorStop(0, '#777');
  baseGrad.addColorStop(0.5, '#888');
  baseGrad.addColorStop(1, '#555');
  drawRoundedRect(ctx, baseX, baseY, baseW, 16, 6, null, '#444');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.moveTo(baseX + 6, baseY);
  ctx.lineTo(baseX + baseW - 6, baseY);
  ctx.quadraticCurveTo(baseX + baseW, baseY, baseX + baseW, baseY + 6);
  ctx.lineTo(baseX + baseW, baseY + 10);
  ctx.quadraticCurveTo(baseX + baseW, baseY + 16, baseX + baseW - 6, baseY + 16);
  ctx.lineTo(baseX + 6, baseY + 16);
  ctx.quadraticCurveTo(baseX, baseY + 16, baseX, baseY + 10);
  ctx.lineTo(baseX, baseY + 6);
  ctx.quadraticCurveTo(baseX, baseY, baseX + 6, baseY);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Base feet
  for (const fx of [baseX + 20, baseX + baseW - 50]) {
    ctx.fillStyle = '#666';
    drawRoundedRect(ctx, fx, baseY + 16, 30, 10, 3, '#666', null);
    ctx.fillStyle = '#555';
    drawRoundedRect(ctx, fx + 3, baseY + 16, 24, 6, 2, '#555', null);
  }

  // Screws on dial casing
  for (const ang of [45, 135, 225, 315]) {
    const rad = (ang * Math.PI) / 180;
    const sr = dialR + 8;
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(dialCX + Math.cos(rad) * sr, dialCY + Math.sin(rad) * sr, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.arc(dialCX + Math.cos(rad) * sr, dialCY + Math.sin(rad) * sr, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();   // ends the fade-in alpha
}

function exit() {
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.animation = '';
    if (submitHandler) {
      submitBtn.removeEventListener('pointerup', submitHandler);
      submitHandler = null;
    }
  }
  hideCorrection();
  tapeProgress = 0;
  scaleAngle = -30;
  animationDone = false;
}


_m.scenes_measurement.enter = enter;
_m.scenes_measurement.update = update;
_m.scenes_measurement.getEntryLayout = getEntryLayout;
_m.scenes_measurement.render = render;
_m.scenes_measurement.exit = exit;
})();

// ======== scenes/correction.js ========
(function() {
  var _m = window._m;
  _m.scenes_correction = {};
// Correction scene — popup when wrong fish selected

var CORRECTION_POPUP_DURATION_MS = _m.config.CORRECTION_POPUP_DURATION_MS;
var transition = _m.state.transition;

let dismissTimer = null;
let dismissHandler = null;

function onDismiss(e) {
  e.preventDefault();
  e.stopPropagation();
  clearTimeout(dismissTimer);
  transition('DISMISS');
}

function enter() {
  dismissTimer = setTimeout(() => {
    transition('DISMISS');
  }, CORRECTION_POPUP_DURATION_MS);

  const btn = document.getElementById('btn-correction-dismiss');
  if (btn) {
    dismissHandler = onDismiss;
    btn.addEventListener('pointerup', dismissHandler);
  }
}

function exit() {
  clearTimeout(dismissTimer);
  dismissTimer = null;

  if (dismissHandler) {
    const btn = document.getElementById('btn-correction-dismiss');
    if (btn) btn.removeEventListener('pointerup', dismissHandler);
    dismissHandler = null;
  }
}


_m.scenes_correction.enter = enter;
_m.scenes_correction.exit = exit;
})();

// ======== scenes/choice.js ========
(function() {
  var _m = window._m;
  _m.scenes_choice = {};
// Choice scene — Sell at market or Return to river
//
// "add image of fish caught" — the caught fish stays on screen here too, in the
// same spot and at the same size as the earlier pages.

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var FISH_DISPLAY_W = _m.config.FISH_DISPLAY_W;
var drawRiverBg = _m.engine_renderer.drawRiverBg;
var drawFishImage = _m.engine_renderer.drawFishImage;
var appState = _m.state.appState;
var transition = _m.state.transition;
var emit = _m.state.emit;

let keepHandler = null;
let returnHandler = null;
let time = 0;

function onKeep(e) {
  e.preventDefault();
  e.stopPropagation();
  appState.playerChoice = 'keep';
  emit('idle-reset');
  transition('KEEP');
}

function onReturn(e) {
  e.preventDefault();
  e.stopPropagation();
  appState.playerChoice = 'return';
  emit('idle-reset');
  transition('RETURN');
}

function enter() {
  time = 0;

  const keepBtn = document.getElementById('btn-keep');
  const returnBtn = document.getElementById('btn-return');

  if (keepBtn) {
    keepHandler = onKeep;
    keepBtn.addEventListener('pointerup', keepHandler);
  }
  if (returnBtn) {
    returnHandler = onReturn;
    returnBtn.addEventListener('pointerup', returnHandler);
  }
}

function update(dt) {
  time += dt;
}

function render(ctx) {
  drawRiverBg(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, time);

  const fish = appState.correctFish;
  if (!fish) return;

  const fishX = CANVAS_WIDTH * 0.3;
  const fishY = CANVAS_HEIGHT * 0.5;

  const glow = ctx.createRadialGradient(fishX, fishY, 20, fishX, fishY, 330);
  glow.addColorStop(0, 'rgba(91, 155, 212, 0.3)');
  glow.addColorStop(1, 'rgba(91, 155, 212, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(fishX - 380, fishY - 380, 760, 760);

  drawFishImage(ctx, fish, fishX, fishY, 1, 1, 'auto', 'center', FISH_DISPLAY_W);
}

function exit() {
  if (keepHandler) {
    const btn = document.getElementById('btn-keep');
    if (btn) btn.removeEventListener('pointerup', keepHandler);
    keepHandler = null;
  }
  if (returnHandler) {
    const btn = document.getElementById('btn-return');
    if (btn) btn.removeEventListener('pointerup', returnHandler);
    returnHandler = null;
  }
}


_m.scenes_choice.enter = enter;
_m.scenes_choice.update = update;
_m.scenes_choice.render = render;
_m.scenes_choice.exit = exit;
})();

// ======== scenes/keep-market.js ========
(function() {
  var _m = window._m;
  _m.scenes_keep_market = {};
// Keep for Market animated page — the caught fish flopping on the real
// market-stall photo the client supplied (then the closing information page).
//
// Requirement ("Threatened fishes app" note 1 & 2): use the supplied market
// photo as the background and animate the fish into the image as part of the
// ending sequence.
//
// Client review 2026-10-20: the ending was too long, so this page runs 2 s
// shorter than the river branch (KEEP_MARKET_DURATION_MS = 8 s).
//
// Client review 2026-10-23: "after the timer bar finished on this page it sort of
// flashes. can remove the flash?" — the last ENDING_DIM_FADE_MS of this page now
// fades in the same dim layer the closing page uses, and fades out everything the
// closing page does not draw (top band, credit, progress bar, the flopping fish),
// so the hand-over frame is identical and nothing flashes.

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var KEEP_MARKET_DURATION_MS = _m.config.KEEP_MARKET_DURATION_MS;
var PHOTO_CREDIT = _m.config.PHOTO_CREDIT;
var THREATENED_APP_TEXT = _m.config.THREATENED_APP_TEXT;
var ENDING_DIM_FADE_MS = _m.config.ENDING_DIM_FADE_MS;
var ENDING_DIM_ALPHA = _m.config.ENDING_DIM_ALPHA;
var drawFishImage = _m.engine_renderer.drawFishImage;
var drawRoundedRect = _m.engine_renderer.drawRoundedRect;
var drawPhotoCover = _m.engine_renderer.drawPhotoCover;
var drawGroundShadow = _m.engine_renderer.drawGroundShadow;
var drawPhotoCredit = _m.engine_renderer.drawPhotoCredit;
var drawEndingDim = _m.engine_renderer.drawEndingDim;
var endingHandoffK = _m.engine_renderer.endingHandoffK;
var appState = _m.state.appState;
var transition = _m.state.transition;

let startTime = 0;
let doneTimer = null;
let copyTimer = null;

// Client review 2026-10-20: the closing copy has to show up the moment the catch
// lands — on top of the photo, while the animation is still playing, with no
// extra delay. The fish is already in the basin at t=0, so the copy comes in just
// after the first flop (500 ms) instead of waiting for the page to end.
const COPY_AT_MS = 500;

function showCopy() {
  const el = document.getElementById('market-ending');
  if (!el) return;
  const p = el.querySelector('.ending-text');
  if (p) p.textContent = THREATENED_APP_TEXT;
  el.classList.add('visible');
}

function hideCopy() {
  const el = document.getElementById('market-ending');
  if (el) el.classList.remove('visible');
}

// The catch goes into the stainless basin on the scale, to the RIGHT of the
// pink baskets ("捕到的鱼不要放在篮子里，放篮子右边一点的铁盆里").
const FISH_CX = CANVAS_WIDTH * 0.35;    // ≈672px — the basin sitting on the scale
// Measured on the photo: the basin's opening is centred near (672, 725) and is
// about 280 x 130 px; the green scale body below it runs from y≈810 to y≈1010.
// The fish sits a little below the basin centre so its belly overlaps the near
// rim — but high enough that it does not bury the scale underneath (client
// review: "move it up a bit, don't completely cover the scale"). 705 keeps that
// true now that the fish is smaller: its belly still lands on the rim.
const FISH_CY = CANVAS_HEIGHT * 0.655;  // ≈705px
// Size history: the client asked three times to make this fish bigger, up to 520
// ("as big as the fish on the stall" → "bigger" → "bigger again"), then twice to
// bring it back down: 2026-10-18 "秤上的鱼图稍微调小一点" → 460, and "这个鱼的鱼图
// 在秤上还是有点大…再调小一点" → 400.
// 400 is the top of the range the fish lying on the blue tarpaulin measure
// (275-400 px nose to tail), so the catch now reads as the biggest real fish in
// the frame instead of dwarfing the whole stall, while still overhanging the
// 280 px basin on both sides.
const MARKET_FISH_W = 400;
// Contact shadow, scaled with the fish (was 82 x 18 back when the fish was 200 px,
// 148 x 33 at 460; the ratio is kept so the shadow tracks the body).
const SHADOW_W = 129;
const SHADOW_H = 28;

function enter() {
  startTime = performance.now();
  doneTimer = setTimeout(() => transition('DONE'), KEEP_MARKET_DURATION_MS);
  // 文字在鱼落进铁盆后立刻出现(客户:鱼入水的瞬间立即显示)
  hideCopy();
  clearTimeout(copyTimer);
  copyTimer = setTimeout(showCopy, COPY_AT_MS);
}

function update() {}

function render(ctx) {
  const t = performance.now() - startTime;
  const progress = Math.min(t / KEEP_MARKET_DURATION_MS, 1);
  // 交接进度:最后 ENDING_DIM_FADE_MS 里从 0 到 1(见文件头注释)
  const hand = endingHandoffK(t, KEEP_MARKET_DURATION_MS, ENDING_DIM_FADE_MS);
  const keep = 1 - hand;

  // === 1. Photo backdrop (falls back to the gradient while it loads) ===
  if (!drawPhotoCover(ctx, 'market', CANVAS_WIDTH, CANVAS_HEIGHT)) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#2a4a80');
    grad.addColorStop(1, '#14243f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Darkened top band so the page title stays legible over the photo.
  // 收尾页没有这条暗带,所以交接时一起淡出。
  if (keep > 0.01) {
    const topBand = ctx.createLinearGradient(0, 0, 0, 260);
    topBand.addColorStop(0, `rgba(10, 22, 40, ${(0.85 * keep).toFixed(3)})`);
    topBand.addColorStop(1, 'rgba(10, 22, 40, 0)');
    ctx.fillStyle = topBand;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 260);
  }

  // === 2. The fish, flopping inside the metal basin ===
  const fish = appState.correctFish;
  if (fish) {
    const flop = Math.abs(Math.sin(t * 0.006));
    const rot = Math.sin(t * 0.004) * 0.35;
    const fishY = FISH_CY - flop * 46;

    // Contact shadow inside the basin, shrinking as the fish flops upward.
    if (keep > 0.01) {
      drawGroundShadow(ctx, FISH_CX, FISH_CY + 10,
                       SHADOW_W - flop * 18, SHADOW_H - flop * 6, (0.4 - flop * 0.12) * keep);
    }

    // 收尾页不画鱼,交接时让它淡出,而不是"啪"地消失
    if (keep > 0.01) {
      ctx.save();
      ctx.translate(FISH_CX, fishY);
      ctx.rotate(rot);
      drawFishImage(ctx, fish, 0, 0, 1, keep, 'auto', 'center', MARKET_FISH_W);
      ctx.restore();
    }
  }

  // === 3. Photographer credit（收尾页没有,交接时淡出）===
  if (keep > 0.01) {
    ctx.save();
    ctx.globalAlpha = keep;
    drawPhotoCredit(ctx, PHOTO_CREDIT, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  // === 4. Progress bar（收尾页没有,交接时淡出）===
  if (keep > 0.01) {
    ctx.save();
    ctx.globalAlpha = keep;
    drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT - 70, 600, 10, 5, 'rgba(255,255,255,0.15)', null);
    drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT - 70, 600 * progress, 10, 5, '#b4d2eb', null);
    ctx.restore();
  }

  // === 5. 交接暗罩:和收尾页第一帧完全一致 ===
  drawEndingDim(ctx, hand, CANVAS_WIDTH, CANVAS_HEIGHT, ENDING_DIM_ALPHA);
}

function exit() {
  clearTimeout(doneTimer);
  doneTimer = null;
  clearTimeout(copyTimer);
  copyTimer = null;
  hideCopy();
}


_m.scenes_keep_market.enter = enter;
_m.scenes_keep_market.update = update;
_m.scenes_keep_market.render = render;
_m.scenes_keep_market.exit = exit;
})();

// ======== scenes/return-river.js ========
(function() {
  var _m = window._m;
  _m.scenes_return_river = {};
// Return to River animated page — the fish is released back into the real
// Mekong river photo the client supplied (10s, then the ending card).
//
// This animation was rewritten after the client called the old water entry
// fake. Four separate defects were responsible, and all four are fixed here:
//
//   1. SHAPE. The body used to travel one path while its nose angle was
//      interpolated on a separate clock, so the head pointed somewhere other
//      than where the fish was going. Worse, the old "bow" was a fraction of the
//      chord, which left the fish heading almost HORIZONTALLY out of the splash
//      (4 deg below) before it nosed down — a double swing no fish makes, and
//      one that a fixed-endpoint Bezier could not fix either: the tangent
//      reached +2 deg, i.e. the fish rose again mid-path. The swim is now a
//      STEERING curve, integrated forward from a heading that rotates once,
//      monotonically, from the plunge to a shallow glide, so the nose angle IS
//      the heading and x can only fall while y can only rise.
//
//   2. TIMING. |B'(u)| varies roughly sixfold along a Bezier, so the fish
//      crawled away from the splash at 21 px/s and sprinted into the fade at
//      150 px/s — exactly backwards. Distance now comes from an explicit
//      profile over arc length: it bursts out of the splash, then coasts.
//
//   3. AIR. The drop was linear in time, so the fish floated down. It now
//      accelerates, starts clear of the frame, and softens with speed.
//
//   4. MATERIAL. The fish was pasted on as a crisp, fully opaque sticker while
//      the photo around it was soft and hazy. It is now tinted towards the
//      colour actually sampled from the river photo and softened with a blur
//      that grows with depth, so it sits IN the water instead of on it, and the
//      fade-out reads as sinking into the murk rather than a ghost dissolve.

var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var ANIMATED_PAGE_DURATION_MS = _m.config.ANIMATED_PAGE_DURATION_MS;
var PHOTO_CREDIT = _m.config.PHOTO_CREDIT;
var THREATENED_APP_TEXT = _m.config.THREATENED_APP_TEXT;
var ENDING_DIM_FADE_MS = _m.config.ENDING_DIM_FADE_MS;
var ENDING_DIM_ALPHA = _m.config.ENDING_DIM_ALPHA;
var drawRoundedRect = _m.engine_renderer.drawRoundedRect;
var drawPhotoCover = _m.engine_renderer.drawPhotoCover;
var drawPhotoCredit = _m.engine_renderer.drawPhotoCredit;
var drawEndingDim = _m.engine_renderer.drawEndingDim;
var endingHandoffK = _m.engine_renderer.endingHandoffK;
var getFishImage = _m.utils_images.getFishImage;
var appState = _m.state.appState;
var transition = _m.state.transition;
var emit = _m.state.emit;

let startTime = 0;
let doneTimer = null;
let copyTimer = null;

/**
 * Client review 2026-10-20: the closing copy has to show up the instant the fish
 * hits the water, on top of the photo, with no extra delay — not after the whole
 * page has played. The splash happens at RELEASE.dropFrac of the page, so that is
 * when the copy fades in.
 */
function copyAtMs() {
  return ANIMATED_PAGE_DURATION_MS * RELEASE.dropFrac;
}

function showCopy() {
  const el = document.getElementById('river-ending');
  if (!el) return;
  const p = el.querySelector('.ending-text');
  if (p) p.textContent = THREATENED_APP_TEXT;
  el.classList.add('visible');
}

function hideCopy() {
  const el = document.getElementById('river-ending');
  if (el) el.classList.remove('visible');
}

// Open water in the photo starts around 58% down; the fish splashes in there and
// sinks into the haze below. It comes in from the LEFT and leaves to the RIGHT
// (client review), so the splash sits left of centre and the fish has the long
// right-hand stretch of river to swim into.
const WATER_Y = CANVAS_HEIGHT * 0.58;
const SPLASH_X = CANVAS_WIDTH * 0.30;
const SPLASH_Y = WATER_Y + 10;

// Where the swim starts, a little below the splash so the body clears it.
const SWIM_Y = SPLASH_Y + 18;

/**
 * Tuning for the release. Everything the client might want to nudge lives here;
 * `setReleaseParams()` overrides it so candidate looks can be compared without
 * editing code. Angles are degrees BELOW horizontal (the fish swims down-left).
 */
const RELEASE = {
  // --- the airborne arc --------------------------------------------------
  // It flies in from off-screen LEFT, curving down to the right. The curve is a
  // parabola through those two points, so the entry slope below is the only
  // free choice; the angle it meets the water at falls out of it.
  dropFrac: 0.16,      // share of the page spent in the air
  airStartX: -260,     // fully off-screen to the left at t=0
  airStartY: -230,     // and above the top edge
  airLaunch: 25,       // heading as it enters the frame, degrees below horizontal
  airBlur: 1.2,        // px of motion softening at the moment of impact

  // --- the shape of the swim ---------------------------------------------
  // A plunge enters steeply and straightens out: most of the turn happens in
  // the first third of the path, which is what the turnQ exponent controls.
  entryAngle: 66,      // heading as the fish leaves the splash
  exitAngle: 7,        // heading it settles into
  turnQ: 2.4,          // higher = straightens out sooner
  pathLen: 748,        // how far it travels, in canvas px (see note below)
  settle: 0.07,        // share of the swim spent turning out of the dive pose

  // --- how big the fish is on THIS page ----------------------------------
  // Smaller than the interactive scenes' FISH_DISPLAY_W (560). A 560 px fish is
  // nearly half the frame height, which made it dominate the wide river vista,
  // pushed its tail into the far bank's tree line at the moment of impact, and
  // left too little room to sink before its belly met the bottom edge.
  fishWidth: 360,

  // --- timing and fade ---------------------------------------------------
  speed: 2.4,          // 1 = constant drift, >1 = bursts away from the splash
  fadeHold: 0.22,      // share of the swim it stays fully solid for
  fadeAt: 0.46,        // share of the swim at which it has vanished
  fadeCurve: 1.2,      // >1 keeps it solid longer, then drops away quickly
  hazeAt: 0.46,        // share of the swim at which the water has taken it
  hazeMax: 0.42,       // how much of the water colour it picks up by then
  blurPx: 2.8,         // px of depth-of-water softening at the end
  waterTint: '146, 152, 155',   // sampled from the river photo behind the path

  // --- the life in it ----------------------------------------------------
  bobAmp: 6,           // px of body undulation, perpendicular to the heading
  bobSpeed: 0.005,
  swayAmp: 0.022,      // rad of yaw sway, as if the tail were driving it
  swaySpeed: 0.0075,
};

// pathLen sets the pace (px/s) as much as the distance now: the fish fades out
// at 46% of the swim, about 584 px in, so it never reaches the far end of the
// path. The old ceiling still applies to the shape — with the fish at 440 px the
// body reached the bottom of the 1080 px canvas after about 748 px — so 748 keeps
// the curve inside the frame with room to spare at the current, smaller size.
function setReleaseParams(p) {
  Object.assign(RELEASE, p);
  pathCache = null;
  airCache = null;
}

// Kept as the name the earlier QA scripts already use.
const setSwimParams = setReleaseParams;

// === the airborne arc ======================================================

let airCache = null;

/**
 * y = startY + a*s + b*s² through the launch point and the splash, where s is
 * the horizontal distance travelled. `a` is the launch slope (chosen); `b`
 * follows from the two fixed end points, which is what makes it a projectile
 * arc rather than a straight dive.
 */
function getAirPath() {
  if (airCache) return airCache;
  const dx = SPLASH_X - RELEASE.airStartX;
  const drop = SPLASH_Y - RELEASE.airStartY;
  const a = Math.tan((RELEASE.airLaunch * Math.PI) / 180);
  const b = (drop / dx - a) / dx;
  airCache = {
    dx,
    a,
    b,
    // Heading where it meets the water — reused as the pose the swim starts
    // from, so the splash does not snap the head round.
    endAngle: Math.atan2(a + 2 * b * dx, 1),
  };
  return airCache;
}

// === the steering path, rebuilt only when a parameter changes ==============

const PATH_STEPS = 180;
let pathCache = null;

/**
 * Turn schedule: theta runs from the entry angle to the exit angle, fast at
 * first so the fish whips out of the plunge and then flattens into a glide.
 */
function headingAt(f) {
  const k = 1 - Math.pow(1 - Math.min(Math.max(f, 0), 1), RELEASE.turnQ);
  return RELEASE.entryAngle + (RELEASE.exitAngle - RELEASE.entryAngle) * k;
}

function getPath() {
  if (pathCache) return pathCache;

  const rad = Math.PI / 180;
  const ds = RELEASE.pathLen / PATH_STEPS;
  const xs = new Float64Array(PATH_STEPS + 1);
  const ys = new Float64Array(PATH_STEPS + 1);
  const ths = new Float64Array(PATH_STEPS + 1);

  xs[0] = SPLASH_X;
  ys[0] = SWIM_Y;
  ths[0] = -RELEASE.entryAngle * rad;

  for (let i = 1; i <= PATH_STEPS; i++) {
    // Integrate with the heading sampled at the step midpoint, which keeps the
    // polyline accurate without needing a tiny step count.
    const th = -headingAt((i - 0.5) / PATH_STEPS) * rad;
    xs[i] = xs[i - 1] - Math.cos(th) * ds;
    ys[i] = ys[i - 1] - Math.sin(th) * ds;
    ths[i] = th;
  }
  ths[PATH_STEPS] = -RELEASE.exitAngle * rad;

  pathCache = { xs, ys, ths, n: PATH_STEPS };
  return pathCache;
}

/**
 * Position and heading at `f` — a fraction of the path's LENGTH, because the
 * samples are integrated at a constant step. That is what lets the speed be
 * chosen independently of the shape.
 */
function pointAt(f) {
  const p = getPath();
  const i = Math.min(Math.max(f, 0), 1) * p.n;
  const lo = Math.min(Math.floor(i), p.n - 1);
  const t = i - lo;
  return {
    x: p.xs[lo] + (p.xs[lo + 1] - p.xs[lo]) * t,
    y: p.ys[lo] + (p.ys[lo + 1] - p.ys[lo]) * t,
    angle: p.ths[lo] + (p.ths[lo + 1] - p.ths[lo]) * t,
  };
}

// === drawing the fish as something that is IN the water ====================

// The tint has to land on the fish's own pixels only, so it is built on a
// scratch canvas and the result is blitted. Rebuilt only when the depth or the
// species changes; it is one small (440x242 at the default fishWidth) canvas.
let tintCanvas = null;
let tintCtx = null;
let tintFishId = '';
let tintKey = '';

function drawFishInWater(ctx, fish, x, y, angle, alpha, haze, blur, faceRight) {
  const img = getFishImage(fish.id);
  if (!img) return;

  const cw = Math.ceil(RELEASE.fishWidth);
  const ch = Math.ceil(RELEASE.fishWidth * (img.naturalHeight / img.naturalWidth));

  const key = fish.id + '|' + cw + '|' + Math.round(haze * 100);
  if (!tintCanvas || tintFishId !== fish.id ||
      tintCanvas.width !== cw || tintCanvas.height !== ch) {
    tintCanvas = tintCanvas || document.createElement('canvas');
    tintCtx = tintCtx || tintCanvas.getContext('2d');
    tintCanvas.width = cw;
    tintCanvas.height = ch;
    tintFishId = fish.id;
    tintKey = '';
  }
  if (tintKey !== key) {
    tintCtx.clearRect(0, 0, cw, ch);
    tintCtx.globalCompositeOperation = 'source-over';
    tintCtx.drawImage(img, 0, 0, cw, ch);
    if (haze > 0.001) {
      // 'source-atop' keeps the water colour inside the fish's silhouette.
      tintCtx.globalCompositeOperation = 'source-atop';
      tintCtx.fillStyle = `rgba(${RELEASE.waterTint}, ${haze})`;
      tintCtx.fillRect(0, 0, cw, ch);
    }
    tintCtx.globalCompositeOperation = 'source-over';
    tintKey = key;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  if (blur > 0.2) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  ctx.translate(x, y);
  ctx.rotate(angle);
  // The artwork faces left; mirror it when the fish is travelling right.
  if (faceRight) ctx.scale(-1, 1);
  ctx.drawImage(tintCanvas, -cw / 2, -ch / 2, cw, ch);
  ctx.restore();
}

/** Soft, very flat splash — the surface is seen from a low angle. */
function drawSplash(ctx, age) {
  if (age < 0 || age > 1) return;
  const e = 1 - Math.pow(1 - age, 2.2);        // spreads fast, then settles
  const fade = Math.pow(1 - age, 1.5);
  const r = 70 + e * 470;

  ctx.save();
  ctx.translate(SPLASH_X, SPLASH_Y);
  ctx.scale(1, 0.26);                          // squashed by the viewing angle

  const foam = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  foam.addColorStop(0, `rgba(244, 249, 251, ${0.70 * fade})`);
  foam.addColorStop(0.40, `rgba(236, 243, 246, ${0.34 * fade})`);
  foam.addColorStop(1, 'rgba(228, 236, 240, 0)');
  ctx.fillStyle = foam;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Ripples. Blurred, because a hard 1 px ellipse reads as a target graphic
  // rather than as water.
  ctx.filter = 'blur(4px)';
  for (let i = 0; i < 3; i++) {
    const rr = r * (0.34 + i * 0.33);
    ctx.globalAlpha = fade * (0.42 - i * 0.11);
    ctx.strokeStyle = 'rgba(248, 252, 254, 1)';
    ctx.lineWidth = 6 - i * 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The spray thrown up by the impact. Deterministic offsets, so the droplets are
 * identical every run — an exhibit must not look different each time.
 */
function drawSpray(ctx, age) {
  if (age < 0 || age > 1) return;
  const t = age * 1.05;                        // seconds since impact
  const fade = Math.pow(1 - age, 1.2);

  ctx.save();
  ctx.fillStyle = 'rgba(247, 252, 254, 1)';
  for (let i = 0; i < 12; i++) {
    const r1 = ((i * 37) % 17) / 17;
    const r2 = ((i * 61) % 23) / 23;
    const vx = (r1 - 0.42) * 880;
    const vy = -(420 + r2 * 560);
    const x = SPLASH_X + vx * t;
    const y = SPLASH_Y + (vy * t + 780 * t * t) * 0.78;
    if (y > SPLASH_Y + 30) continue;
    const s = (1 - age) * (4 + r1 * 7);
    ctx.globalAlpha = fade * 0.9;
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.8, s * 1.7, 0, 0, Math.PI * 2);   // stretched by motion
    ctx.fill();
  }
  ctx.restore();
}

// A tap anywhere on this page abandons the release and goes back to the very
// first page ("放生的过程中点击屏幕要可以直接回到主界面"). The scene element is
// full-screen and only gets pointer events while it is the active scene, so the
// listener is bound in enter() and removed in exit() to avoid stacking.
let tapHandler = null;

function onTapScreen() {
  emit('go-home');
}

function bindTap() {
  const el = document.getElementById('scene-return-river');
  if (!el || tapHandler) return;
  tapHandler = onTapScreen;
  el.addEventListener('pointerup', tapHandler);
}

function unbindTap() {
  const el = document.getElementById('scene-return-river');
  if (el && tapHandler) el.removeEventListener('pointerup', tapHandler);
  tapHandler = null;
}

function enter() {
  startTime = performance.now();
  doneTimer = setTimeout(() => transition('DONE'), ANIMATED_PAGE_DURATION_MS);
  // 文字在鱼入水的瞬间出现(客户 2026-10-20),不等整页播完
  hideCopy();
  clearTimeout(copyTimer);
  copyTimer = setTimeout(showCopy, copyAtMs());
  bindTap();
}

function update() {}

function render(ctx) {
  const t = performance.now() - startTime;
  const progress = Math.min(t / ANIMATED_PAGE_DURATION_MS, 1);
  // 交接进度:最后 ENDING_DIM_FADE_MS 里把暗罩拉满、把收尾页没有的元素淡出
  // (客户 2026-10-23:"after the timer bar finished on this page it sort of flashes")
  const hand = endingHandoffK(t, ANIMATED_PAGE_DURATION_MS, ENDING_DIM_FADE_MS);
  const keep = 1 - hand;

  // === 1. Photo backdrop (falls back to the gradient while it loads) ===
  if (!drawPhotoCover(ctx, 'river', CANVAS_WIDTH, CANVAS_HEIGHT)) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#2a4a80');
    grad.addColorStop(0.6, '#1f3863');
    grad.addColorStop(1, '#14243f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Darkened top band so the page title stays legible over the photo.
  // 收尾页没有这条暗带,交接时一起淡出。
  if (keep > 0.01) {
    const topBand = ctx.createLinearGradient(0, 0, 0, 260);
    topBand.addColorStop(0, `rgba(10, 22, 40, ${(0.85 * keep).toFixed(3)})`);
    topBand.addColorStop(1, 'rgba(10, 22, 40, 0)');
    ctx.fillStyle = topBand;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 260);
  }

  // === 2. The fish — it flies in from the left, splashes down and swims off
  //        to the right ===
  const fish = appState.correctFish;
  const dropMs = ANIMATED_PAGE_DURATION_MS * RELEASE.dropFrac;
  const airT = Math.min(t / dropMs, 1);

  if (fish && airT < 1) {
    // Airborne: a projectile arc from off-screen left. Horizontal speed is
    // constant, so the growing slope gives the fall its own acceleration; the
    // body follows the tangent, so it noses down-right into the water.
    const air = getAirPath();
    const s = air.dx * airT;
    const x = RELEASE.airStartX + s;
    const y = RELEASE.airStartY + air.a * s + air.b * s * s;
    const slope = air.a + 2 * air.b * s;
    drawFishInWater(ctx, fish, x, y, Math.atan2(slope, 1), 1, 0,
                    RELEASE.airBlur * airT * airT, true);
  } else if (fish) {
    const swimT = Math.min(Math.max((t - dropMs) / (ANIMATED_PAGE_DURATION_MS - dropMs), 0), 1);

    // Distance travelled, not path parameter: 1-(1-s)^p starts fast and eases
    // off, so the fish bursts out of the splash and coasts to a stop.
    const pos = pointAt(1 - Math.pow(1 - swimT, RELEASE.speed));
    let angle = pos.angle;

    // It entered the water already angled down-right; ease that pose into the
    // swim heading over the first sliver so the splash does not snap the head.
    const entryPose = -getAirPath().endAngle;
    const settle = Math.min(1, swimT / Math.max(0.01, RELEASE.settle));
    const blend = settle * settle * (3 - 2 * settle);
    angle = entryPose + (angle - entryPose) * blend;
    angle += Math.sin(t * RELEASE.swaySpeed) * RELEASE.swayAmp;

    // Body undulation, perpendicular to the heading rather than straight down.
    const bob = Math.sin(t * RELEASE.bobSpeed) * RELEASE.bobAmp;
    const px = pos.x + Math.sin(angle) * bob;
    const py = pos.y - Math.cos(angle) * bob;

    const fadeFrom = RELEASE.fadeHold;
    const alpha = swimT <= fadeFrom ? 1
      : Math.max(0, 1 - Math.pow((swimT - fadeFrom) / Math.max(0.01, RELEASE.fadeAt - fadeFrom),
                                 RELEASE.fadeCurve));
    const depth = Math.min(1, swimT / Math.max(0.01, RELEASE.hazeAt));
    // ^0.85 brings the water colour on a little sooner than linearly, so the
    // fish reads as submerged while it is still the subject of the frame.
    //
    // The whole swim is computed as a LEFTWARD path (that is the convention the
    // steering maths and the nose angles are written in), then mirrored about the
    // splash and drawn facing right, so the fish leaves to the right exactly as
    // it arrived.
    drawFishInWater(ctx, fish, 2 * SPLASH_X - px, py, -angle, alpha,
                    Math.pow(depth, 0.85) * RELEASE.hazeMax,
                    Math.pow(depth, 1.2) * RELEASE.blurPx, true);
  }

  // === 3. Splash where the fish hits the water ===
  if (airT >= 1 && progress < 0.95) {
    const since = t - dropMs;
    drawSplash(ctx, since / 1500);
    drawSpray(ctx, since / 1050);
  }

  // === 4. Photographer credit（收尾页没有,交接时淡出）===
  if (keep > 0.01) {
    ctx.save();
    ctx.globalAlpha = keep;
    drawPhotoCredit(ctx, PHOTO_CREDIT, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  // === 5. Progress bar（收尾页没有,交接时淡出）===
  if (keep > 0.01) {
    ctx.save();
    ctx.globalAlpha = keep;
    drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT - 70, 600, 10, 5, 'rgba(255,255,255,0.15)', null);
    drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT - 70, 600 * progress, 10, 5, '#b4d2eb', null);
    ctx.restore();
  }

  // === 6. 交接暗罩:和收尾页第一帧完全一致 ===
  drawEndingDim(ctx, hand, CANVAS_WIDTH, CANVAS_HEIGHT, ENDING_DIM_ALPHA);
}

function exit() {
  clearTimeout(doneTimer);
  doneTimer = null;
  clearTimeout(copyTimer);
  copyTimer = null;
  hideCopy();
  unbindTap();
}


_m.scenes_return_river.setReleaseParams = setReleaseParams;
_m.scenes_return_river.setSwimParams = setSwimParams;
_m.scenes_return_river.enter = enter;
_m.scenes_return_river.update = update;
_m.scenes_return_river.render = render;
_m.scenes_return_river.exit = exit;
})();

// ======== scenes/threatened-app.js ========
(function() {
  var _m = window._m;
  _m.scenes_threatened_app = {};
// Threatened Fishes App — closing information page
//
// Requirement ("Threatened fishes app" note 3) only asked to drop the
// "This screen will close automatically" line from the *ending card* above
// this page, so this page keeps its own line and still closes on its own
// after THREATENED_APP_TIMEOUT_MS.
//
// This page closes BOTH branches, so its background follows whichever one the
// visitor took (client review): selling at the market leaves the market photo
// behind the text, returning the fish to the river leaves the river photo.
// Which one is known from appState.playerChoice, set on the choice page.

var THREATENED_APP_TEXT = _m.config.THREATENED_APP_TEXT;
var THREATENED_APP_TIMEOUT_MS = _m.config.THREATENED_APP_TIMEOUT_MS;
var ENDING_DIM_ALPHA = _m.config.ENDING_DIM_ALPHA;
var CANVAS_WIDTH = _m.config.CANVAS_WIDTH;
var CANVAS_HEIGHT = _m.config.CANVAS_HEIGHT;
var drawPhotoCover = _m.engine_renderer.drawPhotoCover;
var drawEndingDim = _m.engine_renderer.drawEndingDim;
var appState = _m.state.appState;
var transition = _m.state.transition;
var resetAppState = _m.state.resetAppState;

let closeTimer = null;
let closeHandler = null;

function onClose(e) {
  e.preventDefault();
  e.stopPropagation();
  clearTimeout(closeTimer);
  resetAppState();
  transition('CLOSE');
}

/**
 * Full-bleed copy of the photo the branch just used. The scrim is deliberately
 * light (client review: "let the background show more") — the text panel does
 * the legibility work now, with its own translucent fill and backdrop blur.
 * Falls back to the plain river gradient while the photo is still decoding.
 *
 * 2026-10-23 客户:"after the timer bar finished on this page it sort of flashes"
 * —— 改成两条动画页**自己在最后 1.2 秒压暗**(keep-market.js / return-river.js),
 * 这一页进来时暗罩已经是满的,切页那一帧两页画面一致,不再有亮度跳变。
 */
function render(ctx) {
  const photo = appState.playerChoice === 'keep' ? 'market' : 'river';
  if (drawPhotoCover(ctx, photo, CANVAS_WIDTH, CANVAS_HEIGHT)) {
    drawEndingDim(ctx, 1, CANVAS_WIDTH, CANVAS_HEIGHT, ENDING_DIM_ALPHA);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#2a4a80');
    grad.addColorStop(0.6, '#1f3863');
    grad.addColorStop(1, '#14243f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

function enter() {
  // 注意:两条动画页现在也有 .threatened-text(压在照片上的那份),所以必须限定在
  // 收尾页的卡片里取,否则 document.querySelector 会先拿到市场页那份,
  // 收尾页的正文就永远是空的(2026-10-20 实测踩到)。
  const textEl = document.querySelector(
    '#scene-threatened-app .threatened-container .threatened-text');
  if (textEl) textEl.textContent = THREATENED_APP_TEXT;

  const btn = document.getElementById('btn-close-threatened');
  if (btn) {
    closeHandler = onClose;
    btn.addEventListener('pointerup', closeHandler);
  }

  closeTimer = setTimeout(() => {
    resetAppState();
    transition('CLOSE');
  }, THREATENED_APP_TIMEOUT_MS);
}

function exit() {
  clearTimeout(closeTimer);
  closeTimer = null;

  if (closeHandler) {
    const btn = document.getElementById('btn-close-threatened');
    if (btn) btn.removeEventListener('pointerup', closeHandler);
    closeHandler = null;
  }
}






_m.scenes_threatened_app.render = render;
_m.scenes_threatened_app.enter = enter;
_m.scenes_threatened_app.exit = exit;
})();

// ======== main.js ========
(function() {
  var _m = window._m;
  _m.main = {};
// A Monster Mission — Main entry point

var IDLE_TIMEOUT_MS = _m.config.IDLE_TIMEOUT_MS;
var GameState = _m.state.GameState;
var appState = _m.state.appState;
var registerScene = _m.state.registerScene;
var transition = _m.state.transition;
var resetAppState = _m.state.resetAppState;
var on = _m.state.on;
var initCanvas = _m.engine_canvas.init;
var startLoop = _m.engine_canvas.startLoop;
var fgCtx = _m.engine_canvas.fgCtx;
var drawRiverBg = _m.engine_renderer.drawRiverBg;
var initParticles = _m.engine_particles.init;
var updateParticles = _m.engine_particles.update;
var renderParticles = _m.engine_particles.render;
var updateAllTweens = _m.engine_animation.updateAllTweens;
var IdleTimer = _m.utils_idle_timer.IdleTimer;
var preload = _m.utils_images.preload;
var preloadPhotos = _m.utils_images.preloadPhotos;

// Scene imports
var screensaver = _m.scenes_screensaver;
var fishAppear = _m.scenes_fish_appear;
var fishSelection = _m.scenes_fish_selection;
var measurement = _m.scenes_measurement;
var choice = _m.scenes_choice;
var keepMarket = _m.scenes_keep_market;
var returnRiver = _m.scenes_return_river;
var threatenedApp = _m.scenes_threatened_app;

// Register scenes
registerScene(GameState.SCREENSAVER, screensaver);
registerScene(GameState.FISH_APPEARED, fishAppear);
registerScene(GameState.FISH_SELECTION, fishSelection);
registerScene(GameState.MEASUREMENT, measurement);
registerScene(GameState.CHOICE, choice);
registerScene(GameState.KEEP_MARKET, keepMarket);
registerScene(GameState.RETURN_RIVER, returnRiver);
registerScene(GameState.THREATENED_APP, threatenedApp);

// Idle timer — return to screensaver
let idleTimer = null;

/**
 * Return to the very first page (the attract poster).
 *
 * Two things beyond swapping the visible panel:
 *  - exit() the scene being left. Several scenes arm a one-shot timer (the
 *    release page arms a 10 s "go to the app page" timer) and without exit()
 *    that timer would still fire after we are already home.
 *  - put appState.currentState back to SCREENSAVER. This path does not go
 *    through transition(), so without it the state stays on whatever page we
 *    left; the next session's first transition would then be looked up from the
 *    wrong row of the table and silently refuse to advance.
 */
function goHome() {
  const active = getCurrentScene();
  if (active?.exit) active.exit();

  resetAppState();
  appState.currentState = GameState.SCREENSAVER;

  document.querySelectorAll('#ui-overlay > .scene').forEach(el => el.classList.remove('active'));
  const ssEl = document.getElementById('scene-screensaver');
  if (ssEl) ssEl.classList.add('active');

  screensaver.enter();
}

// A scene can ask to be abandoned (e.g. tapping the screen during the release).
on('go-home', () => {
  if (idleTimer) idleTimer.reset();
  goHome();
});

function setupIdleTimer() {
  if (idleTimer) idleTimer.stop();

  // 现场排查用:index.html?idle=15 可以把挂机时间临时改成 15 秒,不用等两分钟。
  // 不带参数时用配置里的 120 秒。
  let timeoutMs = IDLE_TIMEOUT_MS;
  const override = new URLSearchParams(location.search).get('idle');
  if (override && Number(override) > 0) {
    timeoutMs = Number(override) * 1000;
    console.info(`[idle] 本次用 URL 参数覆盖挂机时间:${timeoutMs} ms`);
  }

  idleTimer = new IdleTimer(() => {
    // The attract flow (poster / install / go-fish / catch) all lives inside
    // #scene-screensaver, so scene-id alone cannot tell "already at the start
    // page" from "half-way through the attract flow". Ask the scene itself —
    // but ONLY when the screensaver is the page on screen: on any other page
    // (fish, selection, scale, choice, endings) the visitor must be sent home
    // even if the attract step happens to still read 0.
    const activeId = document.querySelector('#ui-overlay > .scene.active')?.id;
    const onScreensaver = activeId === 'scene-screensaver';
    const atStart = onScreensaver && screensaver.isAtStart();
    console.info('[idle] 挂机超时:', {
      超时毫秒: timeoutMs,
      实际闲置毫秒: idleTimer.idleFor(),
      当前场景: activeId,
      已在起始页: atStart,
    });
    if (atStart) return;

    goHome();
  }, timeoutMs);

  idleTimer.start();

  // 方便现场用 F12 检查:__kioskIdle.idleFor() / .timeoutMs / .fireCount
  window.__kioskIdle = idleTimer;
}

// Listen for idle resets from user interaction
on('idle-reset', () => {
  if (idleTimer) idleTimer.reset();
});

// Init and boot
function boot() {
  initCanvas();
  initParticles();
  preload();
  preloadPhotos();

  // Enter screensaver
  screensaver.enter();

  // Canvas does NOT trigger a webfont download the way DOM text does: if a face
  // is still loading when ctx.fillText runs, that call silently paints in a
  // system font. So ask for each face we draw with and only then start the loop.
  // Bounded, because a kiosk must never sit on a blank canvas.
  const wanted = [
    `500 30px Chivo`, `700 30px Chivo`, `900 30px Chivo`,
    `400 30px Oswald`, `700 30px Oswald`,
  ];
  const fontsReady = Promise.all(
    wanted.map(spec => document.fonts.load(spec).catch(() => null))
  );
  const giveUp = new Promise(resolve => setTimeout(resolve, 2000));

  Promise.race([fontsReady, giveUp]).then(startGameLoop);
}

function startGameLoop() {
  // Start the game loop
  startLoop(
    // update
    (dt) => {
      updateAllTweens(dt);
      updateParticles(dt);
      invokeScene('update', dt);
    },
    // render
    (ctx) => {
      // Background (particles)
      renderParticles(ctx);

      // Foreground scene render
      const scene = getCurrentScene();
      if (scene?.render) {
        scene.render(ctx);
      } else {
        // Default background
        drawRiverBg(ctx, 1920, 1080);
      }
    },
    // bgUpdate — none needed, particles handle themselves
    null
  );

  setupIdleTimer();
}

function getCurrentScene() {
  const active = document.querySelector('#ui-overlay > .scene.active');
  if (!active) return null;

  const sceneMap = {
    'scene-screensaver': screensaver,
    'scene-fish-appear': fishAppear,
    'scene-fish-selection': fishSelection,
    'scene-measurement': measurement,
    'scene-choice': choice,
    'scene-keep-market': keepMarket,
    'scene-return-river': returnRiver,
    'scene-threatened-app': threatenedApp,
  };

  return sceneMap[active.id] || null;
}

function invokeScene(method, ...args) {
  // Find all scenes registered in the state or get current scene from DOM
  const scene = getCurrentScene();
  if (scene?.[method]) {
    scene[method](...args);
  }
}

// Error handling — reset to screensaver on error
window.addEventListener('error', (e) => {
  console.error('Game error:', e.error);
  goHome();
});

// Prevent default browser behaviors
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
