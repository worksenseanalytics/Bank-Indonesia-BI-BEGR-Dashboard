// html2canvas is loaded globally via cdn script tag in index.html
const html2canvas = (window as any).html2canvas;

// ── Colour Resolution via Canvas Pixel Sampling ──────────────────────
// html2canvas v1.4.1 crashes on oklch/oklab/color-mix colour functions.
// Modern browsers may return oklch from getComputedStyle, so we cannot
// rely on that.  Instead we draw the colour to a 1x1 canvas and read
// the pixel back — this ALWAYS returns RGBA regardless of browser.
const _resolveCanvas = document.createElement("canvas");
_resolveCanvas.width = 1;
_resolveCanvas.height = 1;
const _resolveCtx = _resolveCanvas.getContext("2d", { willReadFrequently: true })!;

function resolveColorToRgb(colorValue: string): string {
  try {
    _resolveCtx.clearRect(0, 0, 1, 1);
    _resolveCtx.fillStyle = "rgba(0,0,0,0)"; // Reset to transparent
    _resolveCtx.clearRect(0, 0, 1, 1);
    _resolveCtx.fillStyle = colorValue;
    _resolveCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = _resolveCtx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return "transparent";
    return a < 255
      ? `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
      : `rgb(${r}, ${g}, ${b})`;
  } catch (_) {
    return colorValue;
  }
}

// ── CSS Colour Expression Extraction ─────────────────────────────────
const MODERN_COLOR_KEYWORDS = ["oklch(", "oklab(", "color-mix(", "lab(", "lch(", "hwb(", "color("];

function extractCSSColorExpressions(cssText: string): string[] {
  const expressions: string[] = [];
  for (const keyword of MODERN_COLOR_KEYWORDS) {
    let pos = 0;
    while ((pos = cssText.indexOf(keyword, pos)) !== -1) {
      let openBrackets = 0;
      let endPos = pos;
      for (let i = pos; i < cssText.length; i++) {
        if (cssText[i] === "(") openBrackets++;
        else if (cssText[i] === ")") {
          openBrackets--;
          if (openBrackets === 0) { endPos = i + 1; break; }
        }
      }
      if (endPos > pos) { expressions.push(cssText.substring(pos, endPos)); pos = endPos; }
      else { pos += keyword.length; }
    }
  }
  return expressions;
}

/**
 * Replaces ALL oklch/oklab/color-mix/lab/lch/hwb/color() expressions
 * in a CSS text string with resolved rgb() values via canvas sampling.
 */
function convertCssColors(cssText: string): string {
  const expressions = extractCSSColorExpressions(cssText);
  if (expressions.length === 0) return cssText;

  // Deduplicate and sort longest-first to prevent partial replacement
  const unique = Array.from(new Set(expressions)).sort((a, b) => b.length - a.length);
  let result = cssText;

  for (const expr of unique) {
    const rgb = resolveColorToRgb(expr);
    // Only replace if we got a valid rgb/rgba back (not the original oklch)
    if (rgb !== expr) {
      const escaped = expr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), rgb);
    } else {
      // Fallback: replace with a safe neutral grey
      const escaped = expr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), "rgb(100, 116, 139)");
    }
  }
  return result;
}

// ── Properties whose computed values are baked as inline styles ───────
const BAKE_PROPERTIES: string[] = [
  "color",
  "background-color",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
];

const BAKE_PROPERTIES_CAMEL: string[] = [
  "color",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
];

/**
 * Walks the live element tree, reads getComputedStyle for every colour
 * property, resolves oklch→rgb via canvas, and writes each value as an
 * inline style on the corresponding cloned element.
 */
function bakeComputedColors(
  originalRoot: HTMLElement,
  clonedRoot: HTMLElement
): void {
  const originals = originalRoot.querySelectorAll("*");
  const clones = clonedRoot.querySelectorAll("*");
  const count = Math.min(originals.length, clones.length);

  for (let i = 0; i < count; i++) {
    const origEl = originals[i] as HTMLElement;
    const cloneEl = clones[i] as HTMLElement;
    if (!origEl || !cloneEl) continue;

    try {
      const cs = window.getComputedStyle(origEl);

      for (let p = 0; p < BAKE_PROPERTIES.length; p++) {
        const value = cs.getPropertyValue(BAKE_PROPERTIES[p]);
        if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") continue;

        // Check if value contains unsupported colour functions
        const hasModern = MODERN_COLOR_KEYWORDS.some(kw => value.includes(kw.replace("(", "")));
        const finalValue = hasModern ? resolveColorToRgb(value) : value;

        if (finalValue && finalValue !== "transparent") {
          (cloneEl.style as any)[BAKE_PROPERTIES_CAMEL[p]] = finalValue;
        }
      }
    } catch (_) {
      // Skip elements that throw (e.g. SVG foreignObject children)
    }
  }

  // Also bake the root element itself
  try {
    const rootCs = window.getComputedStyle(originalRoot);
    for (let p = 0; p < BAKE_PROPERTIES.length; p++) {
      const value = rootCs.getPropertyValue(BAKE_PROPERTIES[p]);
      if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") continue;
      const hasModern = MODERN_COLOR_KEYWORDS.some(kw => value.includes(kw.replace("(", "")));
      const finalValue = hasModern ? resolveColorToRgb(value) : value;
      if (finalValue && finalValue !== "transparent") {
        (clonedRoot.style as any)[BAKE_PROPERTIES_CAMEL[p]] = finalValue;
      }
    }
  } catch (_) {
    // Ignore
  }
}

/**
 * Captures an HTML element as a high-quality image and exports it as a
 * multi-page PDF document using canvas-slicing.
 *
 * Key design decisions:
 * 1. Canvas pixel sampling for colour resolution (always produces rgb).
 * 2. Style tag replacement (remove+create) to force CSSOM reparse.
 * 3. Computed style baking to guarantee inline rgb on every element.
 * 4. Per-page canvas slicing for clean page transitions.
 */
export async function captureAndPrint(elementId: string, fileName = "Dashboard"): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Print target element not found:", elementId);
    return;
  }

  // ── Loading Overlay ───────────────────────────────────────────────────
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "print-loading-overlay";
  loadingDiv.style.position = "fixed";
  loadingDiv.style.inset = "0";
  loadingDiv.style.backgroundColor = "rgba(15, 23, 42, 0.9)";
  loadingDiv.style.color = "#fff";
  loadingDiv.style.display = "flex";
  loadingDiv.style.flexDirection = "column";
  loadingDiv.style.alignItems = "center";
  loadingDiv.style.justifyContent = "center";
  loadingDiv.style.zIndex = "999999";
  loadingDiv.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const spinnerContainer = document.createElement("div");
  spinnerContainer.style.position = "relative";
  spinnerContainer.style.width = "50px";
  spinnerContainer.style.height = "50px";

  const spinner = document.createElement("div");
  spinner.style.boxSizing = "border-box";
  spinner.style.width = "100%";
  spinner.style.height = "100%";
  spinner.style.border = "3px solid rgba(255, 255, 255, 0.08)";
  spinner.style.borderTop = "3px solid #f59e0b";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite";

  const text = document.createElement("p");
  text.textContent = "Mengekspor Dokumen PDF Premium...";
  text.style.marginTop = "20px";
  text.style.fontSize = "13px";
  text.style.fontWeight = "600";
  text.style.letterSpacing = "0.05em";
  text.style.color = "#f8fafc";

  const subtext = document.createElement("p");
  subtext.textContent = "Mengonversi visualisasi dasbor resolusi tinggi";
  subtext.style.marginTop = "6px";
  subtext.style.fontSize = "11px";
  subtext.style.color = "#94a3b8";

  const styleSheet = document.createElement("style");
  styleSheet.id = "print-spinner-style";
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);

  spinnerContainer.appendChild(spinner);
  loadingDiv.appendChild(spinnerContainer);
  loadingDiv.appendChild(text);
  loadingDiv.appendChild(subtext);
  document.body.appendChild(loadingDiv);

  try {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const backgroundColor = "#f8fafc";

    // Release scroll constraints
    const originalOverflow = element.style.overflow;
    const originalHeight = element.style.height;
    const originalMaxHeight = element.style.maxHeight;

    element.style.overflow = "visible";
    element.style.height = "auto";
    element.style.maxHeight = "none";

    // ── Capture DOM to Canvas ─────────────────────────────────────────
    const canvas: HTMLCanvasElement = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      logging: false,
      scrollY: 0,
      scrollX: 0,
      windowWidth: element.scrollWidth || window.innerWidth,
      windowHeight: element.scrollHeight || window.innerHeight,
      onclone: (clonedDocument: Document) => {
        // ─── Step 1: Force Light Mode ─────────────────────────────
        const clonedHtml = clonedDocument.documentElement;
        if (clonedHtml) {
          clonedHtml.classList.remove("dark");
          clonedHtml.classList.add("light");
          clonedHtml.setAttribute("data-theme", "light");
          clonedHtml.style.colorScheme = "light";
        }
        if (clonedDocument.body) {
          clonedDocument.body.classList.remove("dark");
          clonedDocument.body.classList.add("light");
          clonedDocument.body.style.backgroundColor = "#f8fafc";
          clonedDocument.body.style.color = "#0f172a";
        }
        const clonedTarget = clonedDocument.getElementById(elementId);
        if (clonedTarget) {
          clonedTarget.classList.remove("dark");
          clonedTarget.classList.add("light");
          clonedTarget.style.backgroundColor = "#f8fafc";
          clonedTarget.style.color = "#0f172a";
        }

        // ─── Step 2: Replace <style> tags to purge oklch ──────────
        // We REPLACE (remove + create new) each <style> tag so the
        // browser fully reparses the CSSOM without any oklch values.
        // This prevents html2canvas's CSS parser from crashing.
        const styleTags = Array.from(clonedDocument.querySelectorAll("style"));
        for (const oldTag of styleTags) {
          if (!oldTag.textContent) continue;
          const hasModernColor = MODERN_COLOR_KEYWORDS.some(
            kw => oldTag.textContent!.includes(kw.replace("(", ""))
          );
          if (!hasModernColor) continue;

          const convertedText = convertCssColors(oldTag.textContent);
          const newTag = clonedDocument.createElement("style");
          newTag.textContent = convertedText;
          // Copy attributes (media, id, etc.)
          for (const attr of Array.from(oldTag.attributes)) {
            newTag.setAttribute(attr.name, attr.value);
          }
          oldTag.parentNode?.replaceChild(newTag, oldTag);
        }

        // ─── Step 3: Convert oklch in inline style attributes ─────
        clonedDocument.querySelectorAll("*").forEach((el: any) => {
          if (el.style) {
            const inline = el.getAttribute("style");
            if (inline && MODERN_COLOR_KEYWORDS.some(kw => inline.includes(kw.replace("(", "")))) {
              el.setAttribute("style", convertCssColors(inline));
            }
          }
        });

        // ─── Step 4: Fix SVG fill/stroke attributes ───────────────
        clonedDocument.querySelectorAll("svg, svg *").forEach((svgEl: any) => {
          for (const attrName of ["fill", "stroke", "stop-color", "flood-color"]) {
            const val = svgEl.getAttribute(attrName);
            if (val && MODERN_COLOR_KEYWORDS.some(kw => val.includes(kw.replace("(", "")))) {
              svgEl.setAttribute(attrName, resolveColorToRgb(val));
            }
          }
        });

        // ─── Step 5: Bake computed colours from live DOM ──────────
        if (clonedTarget) {
          bakeComputedColors(element, clonedTarget);
        }

        // ─── Step 6: Force comfortable line-height on text to prevent glyph clipping ───
        const lineStyle = clonedDocument.createElement("style");
        lineStyle.id = "html2canvas-line-height-fix";
        lineStyle.textContent = `
          p, span, h1, h2, h3, h4, h5, h6, th, td, a {
            line-height: 1.45 !important;
          }
        `;
        clonedDocument.head.appendChild(lineStyle);
      }
    });

    // Restore scroll constraints
    element.style.overflow = originalOverflow;
    element.style.height = originalHeight;
    element.style.maxHeight = originalMaxHeight;

    // ── PDF Generation with Canvas Slicing ────────────────────────────
    const { jsPDF } = (window as any).jspdf;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const PAGE_W = 297;
    const PAGE_H = 210;
    const MARGIN = 10;

    const usableW = PAGE_W - 2 * MARGIN;
    const usableH = PAGE_H - 2 * MARGIN;

    const scaleFactor = canvas.width / element.offsetWidth;
    const pageHeightDom = element.offsetWidth * (usableH / usableW);
    const totalHeightDom = canvas.height / scaleFactor;

    const elementRect = element.getBoundingClientRect();
    const pages: { srcY: number; srcH: number }[] = [];

    // Prioritize explicit page-block elements if defined
    const pageElements = Array.from(element.querySelectorAll('[data-print-page]'));
    if (pageElements.length > 0) {
      // Sort elements by their DOM layout position (top-to-bottom)
      const sortedPageEls = pageElements.map((el) => {
        const rect = el.getBoundingClientRect();
        const top = rect.top - elementRect.top;
        const bottom = rect.bottom - elementRect.top;
        return { top, bottom };
      }).sort((a, b) => a.top - b.top);

      for (const pEl of sortedPageEls) {
        pages.push({
          srcY: Math.round(pEl.top * scaleFactor),
          srcH: Math.round((pEl.bottom - pEl.top) * scaleFactor)
        });
      }
    } else {
      // Fallback: smart page-break detection
      const cardElements = Array.from(element.querySelectorAll('.bg-white, [class*="rounded-"], [class*="border"]'));
      const cards = cardElements.map((el) => {
        const rect = el.getBoundingClientRect();
        const top = rect.top - elementRect.top;
        const bottom = rect.bottom - elementRect.top;
        return { top, bottom, height: rect.height };
      }).filter(c => c.height > 20);

      let currentY = 0; // in DOM pixels
      while (currentY < totalHeightDom) {
        let targetY = currentY + pageHeightDom;

        if (targetY >= totalHeightDom) {
          pages.push({
            srcY: Math.round(currentY * scaleFactor),
            srcH: Math.round((totalHeightDom - currentY) * scaleFactor)
          });
          break;
        }

        // Check if targetY cuts through any card
        let bestCutY = targetY;
        let intersectedCard = null;

        for (const card of cards) {
          if (card.top < targetY - 5 && card.bottom > targetY + 5) {
            if (card.height <= pageHeightDom) {
              if (card.top > currentY) {
                if (!intersectedCard || card.top < intersectedCard.top) {
                  intersectedCard = card;
                  bestCutY = card.top;
                }
              }
            }
          }
        }

        const cutY = bestCutY;
        pages.push({
          srcY: Math.round(currentY * scaleFactor),
          srcH: Math.round((cutY - currentY) * scaleFactor)
        });

        currentY = cutY;
      }
    }

    const pxPerMm = canvas.width / usableW;
    const totalPages = pages.length;

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      const { srcY, srcH } = pages[page];
      const srcW = canvas.width;

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = srcW;
      sliceCanvas.height = srcH;
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) continue;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, srcW, srcH);
      ctx.drawImage(canvas, 0, srcY, srcW, srcH, 0, 0, srcW, srcH);

      const sliceDataUrl = sliceCanvas.toDataURL("image/jpeg", 0.92);
      const destW = usableW;
      const destH = srcH / pxPerMm;

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
      pdf.addImage(sliceDataUrl, "JPEG", MARGIN, MARGIN, destW, destH);
    }

    pdf.save(`${fileName}.pdf`);

  } catch (error) {
    console.error("Failed to execute PDF export capture:", error);
    alert("Gagal mengekspor dokumen PDF. Silakan coba kembali.");
  } finally {
    const overlay = document.getElementById("print-loading-overlay");
    if (overlay) document.body.removeChild(overlay);
    const style = document.getElementById("print-spinner-style");
    if (style) document.head.removeChild(style);
  }
}
