// Fast static accessibility and anti-pattern linter for HTML/JSX snippets.
// Zero-dependency pure JavaScript regex and DOM-structure analysis.

const MARKETING_FILLER_PATTERNS = [
  /\bstreamline your workflow\b/i,
  /\bunlock (actionable )?insights?\b/i,
  /\bseamless (experience|integration|productivity)\b/i,
  /\beverything you need\b/i,
  /\bbuilt for modern teams\b/i,
  /\bexperience seamless\b/i,
  /\ball-in-one platform\b/i,
  /\bnext-gen(eration)?\b/i,
  /\brevolutionize your\b/i,
  /\bcutting-edge\b/i,
];

const AMBIGUOUS_LINK_TEXT = [
  /^click here$/i,
  /^here$/i,
  /^more$/i,
  /^read more$/i,
  /^learn more$/i,
  /^link$/i,
  /^go$/i,
];

const LAYOUT_ANIMATION_PROPS = [
  /\btransition:\s*[^;]*\b(height|width|top|left|right|bottom|margin|padding)\b/i,
  /\banimate-(height|width|top|left)\b/i,
];

/**
 * Scan an HTML or JSX string for accessibility violations and UI anti-patterns.
 */
export function auditHtml(snippet, options = {}) {
  if (!snippet || typeof snippet !== "string") {
    throw new Error("snippet must be a non-empty string of HTML or JSX.");
  }

  const issues = [];
  const lines = snippet.split("\n");

  const addIssue = ({ id, severity, rule, message, line, snippetText, suggestion }) => {
    issues.push({
      id,
      severity, // "critical" | "high" | "medium" | "low"
      rule,
      message,
      line: line != null ? line : null,
      snippet: snippetText ? snippetText.trim().slice(0, 160) : null,
      suggestion,
    });
  };

  // 1. Unnamed icon buttons: <button>...<svg>...</button> with no text/aria-label
  const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let btnMatch;
  while ((btnMatch = buttonRegex.exec(snippet)) !== null) {
    const [fullBtn, attrs, content] = btnMatch;
    const hasAriaLabel = /\baria-label\s*=\s*["'][^"']+["']/i.test(attrs);
    const hasAriaLabelledBy = /\baria-labelledby\s*=\s*["'][^"']+["']/i.test(attrs);
    const textContent = content.replace(/<[^>]+>/g, "").trim();
    const hasSvgOrIcon = /<svg\b|<i\b|<Lucide/i.test(content);

    if (!hasAriaLabel && !hasAriaLabelledBy && !textContent) {
      if (hasSvgOrIcon) {
        addIssue({
          id: "unnamed-icon-button",
          severity: "critical",
          rule: "WCAG 4.1.2 Name, Role, Value",
          message: "Icon-only button has no accessible name. Screen readers announce an empty or unlabeled button.",
          snippetText: fullBtn,
          suggestion: 'Add aria-label="Description of action" or a visually hidden <span class="sr-only">Description</span> inside the button.',
        });
      } else {
        addIssue({
          id: "empty-button",
          severity: "critical",
          rule: "WCAG 4.1.2 Name, Role, Value",
          message: "Button element is completely empty with no visible or accessible text.",
          snippetText: fullBtn,
          suggestion: "Add visible text or an aria-label explaining the button's action.",
        });
      }
    }
  }

  // 2. Unlabeled form controls: <input>, <select>, <textarea>
  const inputRegex = /<(input|textarea|select)\b([^>]*)\/?>/gi;
  let inpMatch;
  while ((inpMatch = inputRegex.exec(snippet)) !== null) {
    const [fullTag, tagType, attrs] = inpMatch;
    // Skip hidden, submit, button, reset inputs
    if (/type\s*=\s*["'](hidden|submit|button|reset)["']/i.test(attrs)) continue;

    const hasAriaLabel = /\baria-label\s*=\s*["'][^"']+["']/i.test(attrs);
    const hasAriaLabelledBy = /\baria-labelledby\s*=\s*["'][^"']+["']/i.test(attrs);
    const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
    const hasId = Boolean(idMatch);

    let hasAssociatedLabel = false;
    if (hasId) {
      const idVal = idMatch[1];
      const labelForRegex = new RegExp(`<label\\b[^>]*\\bfor\\s*=\\s*["']${idVal}["']`, "i");
      hasAssociatedLabel = labelForRegex.test(snippet);
    }

    if (!hasAriaLabel && !hasAriaLabelledBy && !hasAssociatedLabel) {
      addIssue({
        id: "unlabeled-form-control",
        severity: "critical",
        rule: "WCAG 1.3.1 Info and Relationships & 4.1.2 Name, Role, Value",
        message: `<${tagType}> control lacks an associated <label for="...">, aria-label, or aria-labelledby. Placeholders do not replace labels.`,
        snippetText: fullTag,
        suggestion: `Associate with <label for="${idMatch ? idMatch[1] : 'field-id'}">Label text</label> or add an aria-label.`,
      });
    }
  }

  // 3. Non-semantic clickable elements: <div onclick=...> without role="button" or tabindex
  const clickableRegex = /<(div|span)\b([^>]*\b(onclick|onClick|@click)\b[^>]*)>/gi;
  let clickMatch;
  while ((clickMatch = clickableRegex.exec(snippet)) !== null) {
    const [fullTag, tagType, attrs] = clickMatch;
    const hasRoleBtn = /\brole\s*=\s*["']button["']/i.test(attrs);
    const hasTabIndex = /\btabindex\s*=\s*["']0["']/i.test(attrs);

    if (!hasRoleBtn || !hasTabIndex) {
      addIssue({
        id: "non-semantic-clickable",
        severity: "critical",
        rule: "WCAG 2.1.1 Keyboard & 4.1.2 Name, Role, Value",
        message: `<${tagType}> has a click handler but lacks native button semantics and keyboard accessibility.`,
        snippetText: fullTag,
        suggestion: `Replace <${tagType}> with a native <button type="button">, or add role="button" and tabindex="0" with Enter/Space keyboard handlers.`,
      });
    }
  }

  // 4. Ambiguous link text
  const linkRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(snippet)) !== null) {
    const [fullLink, attrs, content] = linkMatch;
    const textContent = content.replace(/<[^>]+>/g, "").trim();
    const hasAriaLabel = /\baria-label\s*=\s*["'][^"']+["']/i.test(attrs);

    if (!hasAriaLabel) {
      if (!textContent) {
        addIssue({
          id: "empty-link",
          severity: "high",
          rule: "WCAG 2.4.4 Link Purpose (In Context)",
          message: "Link <a> has no text content and no aria-label.",
          snippetText: fullLink,
          suggestion: "Add descriptive destination text or an aria-label explaining where the link navigates.",
        });
      } else if (AMBIGUOUS_LINK_TEXT.some((pattern) => pattern.test(textContent))) {
        addIssue({
          id: "ambiguous-link-text",
          severity: "medium",
          rule: "WCAG 2.4.4 Link Purpose (In Context)",
          message: `Link text "${textContent}" is ambiguous out of context. Screen reader link lists cannot differentiate it.`,
          snippetText: fullLink,
          suggestion: `Make link destination explicit: e.g. "Read more about pricing" instead of "${textContent}".`,
        });
      }
    }
  }

  // 5. Images missing alt attribute
  const imgRegex = /<img\b([^>]*)\/?>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(snippet)) !== null) {
    const [fullImg, attrs] = imgMatch;
    const hasAlt = /\balt\s*=\s*["'][^"']*["']/i.test(attrs);
    if (!hasAlt) {
      addIssue({
        id: "missing-image-alt",
        severity: "critical",
        rule: "WCAG 1.1.1 Non-text Content",
        message: "<img> element is missing an alt attribute. Screen readers will read the raw image URL.",
        snippetText: fullImg,
        suggestion: 'Add alt="Description of image" for informative images, or alt="" for decorative images.',
      });
    }
  }

  // 6. Prohibited interactive nesting: button inside a, or a inside button
  const linkContentRegex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let linkContentMatch;
  while ((linkContentMatch = linkContentRegex.exec(snippet)) !== null) {
    if (/<button\b/i.test(linkContentMatch[1])) {
      addIssue({
        id: "prohibited-interactive-nesting",
        severity: "high",
        rule: "HTML5 & WCAG 4.1.2 Spec Violation",
        message: "Interactive element <button> is nested inside an <a> link. This breaks assistive tech hit-testing and keyboard focus.",
        snippetText: linkContentMatch[0].slice(0, 120),
        suggestion: "Separate the controls or use individual targets rather than wrapping links around buttons.",
      });
    }
  }

  const btnContentRegex = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  let btnContentMatch;
  while ((btnContentMatch = btnContentRegex.exec(snippet)) !== null) {
    if (/<a\b/i.test(btnContentMatch[1])) {
      addIssue({
        id: "prohibited-interactive-nesting",
        severity: "high",
        rule: "HTML5 & WCAG 4.1.2 Spec Violation",
        message: "Interactive element <a> is nested inside a <button>. This breaks assistive tech hit-testing and keyboard focus.",
        snippetText: btnContentMatch[0].slice(0, 120),
        suggestion: "Separate the controls or use individual targets rather than wrapping buttons around links.",
      });
    }
  }
  // 7. Layout property transitions in styles
  for (const pattern of LAYOUT_ANIMATION_PROPS) {
    const match = snippet.match(pattern);
    if (match) {
      addIssue({
        id: "layout-thrash-animation",
        severity: "high",
        rule: "Performance & B0rk Baseline Rejection #7",
        message: `Animation or transition targets layout property "${match[1]}", causing layout reflow thrash on every frame.`,
        snippetText: match[0],
        suggestion: "Animate transform (translateX, scaleY, etc.) and opacity instead of layout properties.",
      });
    }
  }

  // 8. Stacked active-state indicators (leading rail + card fill)
  if (
    /(border-left|border-inline-start)\s*:\s*[^;]*(accent|[0-9a-f]{6}|rgb|hsl)/i.test(snippet) &&
    /background(-color)?\s*:\s*[^;]*(accent|[0-9a-f]{6}|rgb|hsl)/i.test(snippet) &&
    /(active|selected|aria-current)/i.test(snippet)
  ) {
    addIssue({
      id: "stacked-active-indicator",
      severity: "medium",
      rule: "Visual Hierarchy & B0rk Baseline Rejection #3",
      message: "Selected nav/card element appears to stack both a filled background and a colored leading-edge accent rail.",
      suggestion: "Use a single primary emphasis signal (either label weight/contrast or background lift), not competing stacked indicators.",
    });
  }

  // 9. Marketing filler phrases
  for (const pattern of MARKETING_FILLER_PATTERNS) {
    const match = snippet.match(pattern);
    if (match) {
      addIssue({
        id: "marketing-filler-language",
        severity: "low",
        rule: "Content Purity & B0rk Baseline Rejection #2",
        message: `Generic marketing filler phrase detected: "${match[0]}".`,
        snippetText: match[0],
        suggestion: "Replace with concrete, domain-specific text explaining what the user will actually see or do.",
      });
    }
  }

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  return {
    clean: issues.length === 0,
    totalIssues: issues.length,
    summary: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount },
    issues,
  };
}
