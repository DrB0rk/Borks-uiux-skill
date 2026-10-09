// WCAG 2.2 Relative Luminance and Contrast Calculator
// Zero-dependency pure JavaScript supporting Hex, RGB, HSL, OKLCH, and named colors.
// Evaluates against WCAG 1.4.3 (text), 1.4.11 (non-text), and suggests passing values.

// Standard named colors
const NAMED_COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  lightgray: [211, 211, 211],
  darkgray: [169, 169, 169],
  transparent: [0, 0, 0, 0],
};

/**
 * Parse any CSS color string into [r, g, b, a] where r,g,b in 0..255 and a in 0..1.
 */
export function parseColor(colorStr) {
  if (!colorStr || typeof colorStr !== "string") {
    throw new Error(`Invalid color string: ${String(colorStr)}`);
  }
  const s = colorStr.trim().toLowerCase();

  if (NAMED_COLORS[s]) {
    const [r, g, b, a = 1] = NAMED_COLORS[s];
    return { r, g, b, a };
  }

  // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
    throw new Error(`Invalid hex color: ${colorStr}`);
  }

  // rgb(...) or rgba(...)
  const rgbMatch = s.match(/^rgba?\s*\(\s*([0-9.]+)\s*[,/ ]\s*([0-9.]+)\s*[,/ ]\s*([0-9.]+)(?:\s*[,/ ]\s*([0-9.%]+))?\s*\)$/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseFloat(rgbMatch[1])));
    const g = Math.min(255, Math.max(0, parseFloat(rgbMatch[2])));
    const b = Math.min(255, Math.max(0, parseFloat(rgbMatch[3])));
    let a = 1;
    if (rgbMatch[4]) {
      a = rgbMatch[4].endsWith("%") ? parseFloat(rgbMatch[4]) / 100 : parseFloat(rgbMatch[4]);
      a = Math.min(1, Math.max(0, a));
    }
    return { r, g, b, a };
  }

  // hsl(...) or hsla(...)
  const hslMatch = s.match(/^hsla?\s*\(\s*([0-9.]+)(?:deg)?\s*[,/ ]\s*([0-9.]+)%\s*[,/ ]\s*([0-9.]+)%(?:\s*[,/ ]\s*([0-9.%]+))?\s*\)$/);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]) % 360;
    const sat = parseFloat(hslMatch[2]) / 100;
    const l = parseFloat(hslMatch[3]) / 100;
    let a = 1;
    if (hslMatch[4]) {
      a = hslMatch[4].endsWith("%") ? parseFloat(hslMatch[4]) / 100 : parseFloat(hslMatch[4]);
      a = Math.min(1, Math.max(0, a));
    }
    const { r, g, b } = hslToRgb(h, sat, l);
    return { r, g, b, a };
  }

  // oklch(L C H [/ A])
  const oklchMatch = s.match(/^oklch\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?(?:\s*[/ ]\s*([0-9.%]+))?\s*\)$/);
  if (oklchMatch) {
    let L = oklchMatch[1].endsWith("%") ? parseFloat(oklchMatch[1]) / 100 : parseFloat(oklchMatch[1]);
    const C = parseFloat(oklchMatch[2]);
    const H = parseFloat(oklchMatch[3]);
    let a = 1;
    if (oklchMatch[4]) {
      a = oklchMatch[4].endsWith("%") ? parseFloat(oklchMatch[4]) / 100 : parseFloat(oklchMatch[4]);
    }
    const { r, g, b } = oklchToRgb(L, C, H);
    return { r, g, b, a };
  }

  throw new Error(`Unsupported color format: ${colorStr}. Use hex, rgb(), hsl(), or oklch().`);
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h >= 0 && h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h >= 60 && h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h >= 120 && h < 180) [r1, g1, b1] = [0, c, x];
  else if (h >= 180 && h < 240) [r1, g1, b1] = [0, x, c];
  else if (h >= 240 && h < 300) [r1, g1, b1] = [x, 0, c];
  else if (h >= 300 && h < 360) [r1, g1, b1] = [c, 0, x];
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/**
 * Convert OKLCH to sRGB (0..255) using Björn Ottosson's canonical matrix.
 */
export function oklchToRgb(L, C, H) {
  const hRad = (H * Math.PI) / 180;
  const aLab = C * Math.cos(hRad);
  const bLab = C * Math.sin(hRad);

  const l_ = Math.cbrt ? Math.pow(L + 0.3963377774 * aLab + 0.2158037573 * bLab, 3) : Math.pow(Math.max(0, L + 0.3963377774 * aLab + 0.2158037573 * bLab), 3);
  const m_ = Math.pow(Math.max(0, L - 0.1055613458 * aLab - 0.0638541728 * bLab), 3);
  const s_ = Math.pow(Math.max(0, L - 0.0894841775 * aLab - 1.291485548 * bLab), 3);

  const rLin = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gLin = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bLin = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

  const gamma = (val) => {
    if (val <= 0.0031308) return 12.92 * val;
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const r = Math.min(255, Math.max(0, Math.round(gamma(Math.max(0, rLin)) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(gamma(Math.max(0, gLin)) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(gamma(Math.max(0, bLin)) * 255)));
  return { r, g, b };
}

/**
 * Relative luminance per WCAG 2.x specification (0 = black, 1 = white).
 */
export function getRelativeLuminance({ r, g, b }) {
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * lin(sR) + 0.7152 * lin(sG) + 0.0722 * lin(sB);
}

/**
 * Contrast ratio between two parsed colors (1 to 21).
 */
export function getContrastRatio(colorA, colorB) {
  const l1 = getRelativeLuminance(colorA);
  const l2 = getRelativeLuminance(colorB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex({ r, g, b }) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * Suggest a passing color by adjusting lightness in sRGB space.
 */
function suggestPassingColor(fgRgb, bgRgb, targetRatio) {
  const bgLum = getRelativeLuminance(bgRgb);
  // Decide whether to go lighter or darker
  const shouldLighten = bgLum < 0.5;

  let best = fgRgb;
  let bestRatio = getContrastRatio(fgRgb, bgRgb);

  // Binary search for passing lightness
  for (let step = 1; step <= 255; step += 3) {
    const candidate = shouldLighten
      ? {
          r: Math.min(255, fgRgb.r + step),
          g: Math.min(255, fgRgb.g + step),
          b: Math.min(255, fgRgb.b + step),
        }
      : {
          r: Math.max(0, fgRgb.r - step),
          g: Math.max(0, fgRgb.g - step),
          b: Math.max(0, fgRgb.b - step),
        };
    const ratio = getContrastRatio(candidate, bgRgb);
    if (ratio >= targetRatio) {
      return {
        hex: rgbToHex(candidate),
        ratio: Math.round(ratio * 100) / 100,
      };
    }
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }

  // Extreme fallback: white or black
  const fallback = shouldLighten ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  return {
    hex: rgbToHex(fallback),
    ratio: Math.round(getContrastRatio(fallback, bgRgb) * 100) / 100,
  };
}

/**
 * Audit a single foreground/background color pair against WCAG 2.2.
 */
export function auditContrast(foregroundStr, backgroundStr, role = "normal-text") {
  const fg = parseColor(foregroundStr);
  const bg = parseColor(backgroundStr);

  const ratio = Math.round(getContrastRatio(fg, bg) * 100) / 100;
  const fgLum = Math.round(getRelativeLuminance(fg) * 1000) / 1000;
  const bgLum = Math.round(getRelativeLuminance(bg) * 1000) / 1000;

  // Thresholds
  const isLarge = role === "large-text";
  const isComponent = role === "ui-component" || role === "non-text";

  const aaMin = isComponent || isLarge ? 3.0 : 4.5;
  const aaaMin = isComponent ? 3.0 : isLarge ? 4.5 : 7.0;

  const passesAA = ratio >= aaMin;
  const passesAAA = ratio >= aaaMin;

  const result = {
    foreground: foregroundStr,
    background: backgroundStr,
    contrastRatio: `${ratio}:1`,
    ratioNumeric: ratio,
    relativeLuminance: { foreground: fgLum, background: bgLum },
    role,
    standards: {
      wcag_2_2_AA: {
        required: `${aaMin}:1`,
        pass: passesAA,
        criterion: isComponent ? "1.4.11 Non-text Contrast" : "1.4.3 Contrast (Minimum)",
      },
      wcag_2_2_AAA: {
        required: `${aaaMin}:1`,
        pass: passesAAA,
        criterion: isComponent ? "1.4.11 Non-text Contrast" : "1.4.6 Contrast (Enhanced)",
      },
    },
  };

  if (!passesAA) {
    const suggestion = suggestPassingColor(fg, bg, aaMin);
    result.suggestion = {
      recommendedForeground: suggestion.hex,
      achievedRatio: `${suggestion.ratio}:1`,
      action: `Update foreground from ${foregroundStr} to ${suggestion.hex} to achieve ${suggestion.ratio}:1 (>= ${aaMin}:1).`,
    };
  }

  return result;
}

/**
 * Batch audit multiple color pairs in a palette.
 */
export function auditPalette(pairs) {
  if (!Array.isArray(pairs)) {
    throw new Error("pairs must be an array of { foreground, background, role? }");
  }
  const results = pairs.map(({ foreground, background, role }) =>
    auditContrast(foreground, background, role)
  );
  const totalFails = results.filter((r) => !r.standards.wcag_2_2_AA.pass).length;
  return {
    totalChecked: results.length,
    failingAA: totalFails,
    passingAA: results.length - totalFails,
    allPassAA: totalFails === 0,
    results,
  };
}
