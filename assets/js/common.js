// Helpers shared by every signed-in page. Load this before layout.js.

// Escape text before putting it inside innerHTML
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// GET a JSON api and return its data, or throw its error message
async function api(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!j || !j.success) throw new Error((j && j.message) || "Request failed");
  return j.data;
}

// Colored pill for a status value (colors come from app.css)
const TAG = {
  Active: "text-ok",
  Approved: "text-ok",
  Pending: "text-warn",
  Transferred: "text-warn",
  Dropped: "text-bad",
  Rejected: "text-bad",
};
const tag = (s) => `<span class="tag ${TAG[s] || "text-mut"}">${esc(s)}</span>`;
