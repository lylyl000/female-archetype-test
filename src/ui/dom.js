export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function setHtml(el, html) {
  el.innerHTML = html;
}

export function qs(sel, root = document) {
  return root.querySelector(sel);
}

export function on(el, event, handler, opts) {
  el.addEventListener(event, handler, opts);
  return () => el.removeEventListener(event, handler, opts);
}

