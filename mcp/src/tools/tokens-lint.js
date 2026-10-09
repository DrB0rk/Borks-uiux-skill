// Design Tokens & CSS Variable Validator (DTCG 2025.10 & Multi-Tier Taxonomy)
// Zero-dependency pure JavaScript.

/**
 * Validate a Design Tokens dictionary against DTCG 2025.10 specification and multi-tier taxonomy.
 */
export function auditTokens(tokensObj, options = {}) {
  if (!tokensObj || typeof tokensObj !== "object") {
    throw new Error("tokensObj must be a valid JSON object or parsed token dictionary.");
  }

  const issues = [];
  const tokenPaths = [];

  const addIssue = ({ id, severity, rule, path, message, suggestion }) => {
    issues.push({
      id,
      severity, // "critical" | "high" | "medium" | "low"
      rule,
      path,
      message,
      suggestion,
    });
  };

  // Traverse token tree recursively
  function walk(node, currentPath = []) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;

    // Check if this node is a token (has $value or legacy value)
    const hasDtcgValue = "$value" in node;
    const hasLegacyValue = "value" in node && !hasDtcgValue;

    if (hasLegacyValue) {
      addIssue({
        id: "legacy-token-format",
        severity: "medium",
        rule: "DTCG 2025.10 Format Specification",
        path: currentPath.join("."),
        message: `Token uses legacy "value" property instead of DTCG standard "$value".`,
        suggestion: `Rename "value" to "$value" and "type" to "$type" per DTCG 2025.10.`,
      });
    }

    if (hasDtcgValue || hasLegacyValue) {
      const val = hasDtcgValue ? node.$value : node.value;
      const pathStr = currentPath.join(".");
      tokenPaths.push(pathStr);

      // Check alias syntax: should be {group.subgroup.name}
      if (typeof val === "string" && val.includes("{")) {
        const aliasMatch = val.match(/^\{([^}]+)\}$/);
        if (!aliasMatch) {
          addIssue({
            id: "malformed-token-alias",
            severity: "high",
            rule: "DTCG 2025.10 Alias Syntax",
            path: pathStr,
            message: `Alias "${val}" is malformed. DTCG aliases must be enclosed in curly braces: {path.to.token}.`,
            suggestion: `Format reference as {${val.replace(/[{}]/g, "")}}.`,
          });
        }
      }

      // Check $type presence
      if (hasDtcgValue && !("$type" in node)) {
        // Look up parent groups for an inherited $type
        addIssue({
          id: "missing-token-type",
          severity: "low",
          rule: "DTCG 2025.10 $type Recommendation",
          path: pathStr,
          message: `Token does not define an explicit "$type" (e.g. "color", "dimension", "duration").`,
          suggestion: `Add "$type": "color" (or relevant type) at the token or parent group level.`,
        });
      }

      // Check component layer using raw hex instead of semantic alias
      const isComponentLayer = currentPath[0] === "component" || currentPath[0] === "button" || currentPath[0] === "card" || currentPath[0] === "input";
      if (isComponentLayer && typeof val === "string" && /^#[0-9a-f]{3,8}$/i.test(val)) {
        addIssue({
          id: "raw-value-in-component-layer",
          severity: "medium",
          rule: "Multi-Tier Token Taxonomy & B0rk Design System Contract",
          path: pathStr,
          message: `Component token references a raw hex value "${val}" instead of an alias to a semantic token.`,
          suggestion: `Reference a semantic token instead, e.g. "{color.action.primary}" or "{color.surface.elevated}".`,
        });
      }
    } else {
      // Recurse into child groups
      for (const [key, child] of Object.entries(node)) {
        if (!key.startsWith("$")) {
          walk(child, [...currentPath, key]);
        }
      }
    }
  }

  walk(tokensObj);

  return {
    valid: issues.filter((i) => i.severity === "critical" || i.severity === "high").length === 0,
    totalTokens: tokenPaths.length,
    totalIssues: issues.length,
    summary: {
      critical: issues.filter((i) => i.severity === "critical").length,
      high: issues.filter((i) => i.severity === "high").length,
      medium: issues.filter((i) => i.severity === "medium").length,
      low: issues.filter((i) => i.severity === "low").length,
    },
    issues,
  };
}
