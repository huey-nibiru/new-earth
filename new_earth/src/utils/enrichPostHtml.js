/**
 * Sanitizes stored post HTML, turns plain http(s) URLs into links, and embeds YouTube.
 * Safe for dangerouslySetInnerHTML after processing.
 */

const YT_ID = /^[\w-]{11}$/;

function isYoutubeId(id) {
  return typeof id === "string" && YT_ID.test(id);
}

export function getYoutubeVideoId(urlStr) {
  const s = String(urlStr).trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return isYoutubeId(id) ? id : null;
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const v = u.searchParams.get("v");
      if (isYoutubeId(v)) return v;
      const segs = u.pathname.split("/").filter(Boolean);
      if (segs[0] === "embed" && isYoutubeId(segs[1])) return segs[1];
      if (segs[0] === "shorts" && isYoutubeId(segs[1])) return segs[1];
      if (segs[0] === "live" && isYoutubeId(segs[1])) return segs[1];
    }
  } catch {
    /* ignore */
  }
  const m = s.match(
    /(?:youtube\.com\/watch\?[^#]*\bv=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]{11})\b/,
  );
  return m && isYoutubeId(m[1]) ? m[1] : null;
}

function isSafeHttpUrl(s) {
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return Boolean(u.hostname);
  } catch {
    return false;
  }
}

function trimUrlBoundaries(s) {
  let t = s;
  while (t.length && /[.,;:!?)'"\]}>]$/.test(t)) t = t.slice(0, -1);
  return t;
}

function stripUnsafeAttributes(el) {
  [...el.attributes].forEach((attr) => {
    const n = attr.name.toLowerCase();
    const v = attr.value;
    if (n.startsWith("on")) el.removeAttribute(attr.name);
    if (
      (n === "href" || n === "src" || n === "xlink:href") &&
      /^\s*javascript:/i.test(v)
    ) {
      el.removeAttribute(attr.name);
    }
  });
}

function isOurYoutubeIframe(el) {
  const src = el.getAttribute("src") || "";
  return /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}(\?|$)/.test(
    src,
  );
}

function removeDangerousElements(doc) {
  doc
    .querySelectorAll("script, object, embed, link, meta, frame, style")
    .forEach((el) => el.remove());
  doc.querySelectorAll("iframe").forEach((iframe) => {
    if (!isOurYoutubeIframe(iframe)) iframe.remove();
  });
}

function sanitizeExistingTree(doc) {
  removeDangerousElements(doc);
  doc.querySelectorAll("*").forEach(stripUnsafeAttributes);
}

function buildYoutubeEmbed(doc, videoId) {
  const wrap = doc.createElement("div");
  wrap.className = "post-embed-youtube";
  const iframe = doc.createElement("iframe");
  iframe.setAttribute(
    "src",
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  );
  iframe.setAttribute("title", "YouTube video");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  );
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  wrap.appendChild(iframe);
  return wrap;
}

function linkifyTextNode(doc, textNode) {
  const text = textNode.nodeValue;
  if (!text) return;

  const parentEl = textNode.parentElement;
  if (!parentEl) return;
  if (parentEl.closest("a, code, pre, script, style, textarea")) return;

  const urlRe = /https?:\/\/[^\s<>"']+/gi;
  const matches = [...text.matchAll(urlRe)];
  if (matches.length === 0) return;

  const frag = doc.createDocumentFragment();
  let pos = 0;

  for (const m of matches) {
    const idx = m.index;
    const raw = m[0];
    const clean = trimUrlBoundaries(raw);
    if (idx > pos) frag.appendChild(doc.createTextNode(text.slice(pos, idx)));
    const suffix = raw.slice(clean.length);

    const yt = getYoutubeVideoId(clean);
    if (yt) {
      frag.appendChild(buildYoutubeEmbed(doc, yt));
    } else if (isSafeHttpUrl(clean)) {
      const a = doc.createElement("a");
      a.setAttribute("href", clean);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      a.textContent = clean;
      frag.appendChild(a);
    } else {
      frag.appendChild(doc.createTextNode(raw));
    }
    if (suffix) frag.appendChild(doc.createTextNode(suffix));
    pos = idx + raw.length;
  }
  if (pos < text.length) frag.appendChild(doc.createTextNode(text.slice(pos)));

  textNode.parentNode.replaceChild(frag, textNode);
}

function linkifyAllTextNodes(doc) {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) linkifyTextNode(doc, node);
}

function enforceSafeLinksAndIframes(doc) {
  doc.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || !isSafeHttpUrl(href)) {
      const t = doc.createTextNode(a.textContent || "");
      a.replaceWith(t);
    } else {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  doc.querySelectorAll("iframe").forEach((iframe) => {
    if (!isOurYoutubeIframe(iframe)) iframe.remove();
  });
}

/**
 * @param {string | null | undefined} html
 * @returns {string}
 */
export function enrichPostHtml(html) {
  const raw = html == null ? "" : String(html);
  if (!raw.trim()) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");

  sanitizeExistingTree(doc);
  linkifyAllTextNodes(doc);
  enforceSafeLinksAndIframes(doc);

  return doc.body.innerHTML;
}
