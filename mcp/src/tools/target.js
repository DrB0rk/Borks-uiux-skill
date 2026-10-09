// WCAG 2.5.8 Target Size (Minimum) & Platform Touch Ergonomics Validator
// Zero-dependency pure JavaScript.

const WCAG_AA_MIN = 24; // 24 x 24 CSS px
const APPLE_HIG_MIN = 44; // 44 x 44 pt / CSS px
const ANDROID_MIN = 48; // 48 x 48 dp / CSS px

/**
 * Audit an interactive element's dimensions and hit area against WCAG 2.5.8 and platform standards.
 */
export function auditTargetSize({
  width,
  height,
  padding = 0,
  spacing = 0,
  isInline = false,
  isEssential = false,
  isUserAgent = false,
}) {
  const w = parseFloat(width);
  const h = parseFloat(height);

  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    throw new Error(`Invalid target dimensions: width=${width}, height=${height}. Both must be positive numbers.`);
  }

  // Resolve padding
  let padX = 0, padY = 0;
  if (typeof padding === "number") {
    padX = padding;
    padY = padding;
  } else if (typeof padding === "object" && padding !== null) {
    padX = parseFloat(padding.x ?? padding.horizontal ?? 0) || 0;
    padY = parseFloat(padding.y ?? padding.vertical ?? 0) || 0;
  }

  const effectiveWidth = w + padX * 2;
  const effectiveHeight = h + padY * 2;
  const effectiveSpacing = parseFloat(spacing) || 0;

  // Check WCAG 2.5.8 Target Size (Minimum) - Level AA
  let wcagPass = false;
  let wcagException = null;

  if (isInline) {
    wcagPass = true;
    wcagException = "Inline: target is in a sentence or text block (WCAG 2.5.8 exception).";
  } else if (isEssential) {
    wcagPass = true;
    wcagException = "Essential: target presentation is essential to information or functionality (e.g. map pin).";
  } else if (isUserAgent) {
    wcagPass = true;
    wcagException = "User Agent: target size is determined by user agent without author modification.";
  } else if (effectiveWidth >= WCAG_AA_MIN && effectiveHeight >= WCAG_AA_MIN) {
    wcagPass = true;
  } else if (effectiveSpacing >= (WCAG_AA_MIN - Math.min(effectiveWidth, effectiveHeight)) / 2) {
    wcagPass = true;
    wcagException = "Spacing: 24 CSS px diameter circle centered on bounding box does not intersect another target.";
  }

  // Platform ergonomics
  const passesApple = effectiveWidth >= APPLE_HIG_MIN && effectiveHeight >= APPLE_HIG_MIN;
  const passesAndroid = effectiveWidth >= ANDROID_MIN && effectiveHeight >= ANDROID_MIN;

  const result = {
    target: {
      visibleWidth: `${w}px`,
      visibleHeight: `${h}px`,
      effectiveHitArea: `${effectiveWidth}px × ${effectiveHeight}px`,
      padding: `${padY}px ${padX}px`,
      spacing: `${effectiveSpacing}px`,
    },
    standards: {
      wcag_2_2_AA_2_5_8: {
        minimum: `${WCAG_AA_MIN}px × ${WCAG_AA_MIN}px`,
        pass: wcagPass,
        criterion: "2.5.8 Target Size (Minimum) (Level AA)",
        ...(wcagException ? { exception: wcagException } : {}),
      },
      apple_hig: {
        minimum: `${APPLE_HIG_MIN}px × ${APPLE_HIG_MIN}px`,
        pass: passesApple,
        standard: "Apple HIG Touch Target (44x44 pt)",
      },
      android_material: {
        minimum: `${ANDROID_MIN}px × ${ANDROID_MIN}px`,
        pass: passesAndroid,
        standard: "Android Material Interactive Target (48x48 dp)",
      },
    },
  };

  // Recommendations for undersized targets
  const recommendations = [];
  if (!wcagPass) {
    const needX = Math.max(0, Math.ceil((WCAG_AA_MIN - effectiveWidth) / 2));
    const needY = Math.max(0, Math.ceil((WCAG_AA_MIN - effectiveHeight) / 2));
    recommendations.push(
      `Fails WCAG 2.5.8 AA (${effectiveWidth}x${effectiveHeight}px < 24x24px). Add at least padding: ${needY}px ${needX}px or 12px perimeter spacing to pass conformance.`
    );
  }
  if (!passesApple) {
    const needX = Math.max(0, Math.ceil((APPLE_HIG_MIN - effectiveWidth) / 2));
    const needY = Math.max(0, Math.ceil((APPLE_HIG_MIN - effectiveHeight) / 2));
    recommendations.push(
      `Below Apple/Web touch target (44x44px). Add padding: ${needY}px ${needX}px or a transparent ::before touch target expander for touch comfort.`
    );
  }
  if (!passesAndroid) {
    const needX = Math.max(0, Math.ceil((ANDROID_MIN - effectiveWidth) / 2));
    const needY = Math.max(0, Math.ceil((ANDROID_MIN - effectiveHeight) / 2));
    recommendations.push(
      `Below Android Material target (48x48dp). Add padding: ${needY}px ${needX}px for comfortable coarse-pointer acquisition.`
    );
  }

  if (recommendations.length > 0) {
    result.recommendations = recommendations;
  }

  return result;
}
