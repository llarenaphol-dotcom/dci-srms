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

// POST / PUT / DELETE to an api. Always returns { success, message }.
async function send(url, method, body) {
  try {
    const r = await fetch(url, { method, body: body && JSON.stringify(body) });
    return await r.json();
  } catch (e) {
    return {
      success: false,
      message: "Something went wrong. Check that Apache and MySQL are running.",
    };
  }
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

function toast(m) {
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = m;
  document.body.append(t);
  setTimeout(() => t.remove(), 2500);
}

// One modal for every add / edit / delete. Needs <dialog id="dlg"> on the page.
// onSubmit gets the form values and returns an error message, or "" to close.
function dialog(title, fields, okLabel, onSubmit, danger = false) {
  const d = document.getElementById("dlg");
  d.innerHTML = `<form><h2 class="text-lg font-semibold">${title}</h2>${fields}
    <p class="err text-sm text-bad min-h-[20px] mt-3" role="alert"></p>
    <div class="flex justify-end gap-2 mt-2"><button type="button" data-x class="btn g">Cancel</button><button class="btn ${danger ? "d" : ""}">${okLabel}</button></div></form>`;
  d.showModal();
  d.querySelector("[data-x]").onclick = () => d.close();
  d.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    const msg = await onSubmit(Object.fromEntries(new FormData(e.target)));
    if (msg) d.querySelector(".err").textContent = msg;
    else d.close();
  };
}

// Labeled form fields for dialog(). attrs is extra HTML like 'required type="date"'.
const field = (id, label, input) =>
  `<div class="mt-4"><label for="${id}">${label}</label>${input}</div>`;
const input = (name, label, value = "", attrs = "") =>
  field(
    "f_" + name,
    label,
    `<input id="f_${name}" name="${name}" class="inp w-full" value="${esc(value)}" ${attrs}>`,
  );
// options = [[value, text], ...]
const select = (name, label, options, value = "") =>
  field(
    "f_" + name,
    label,
    `<select id="f_${name}" name="${name}" class="inp w-full">${options
      .map(
        ([v, t]) =>
          `<option value="${esc(v)}" ${v == value ? "selected" : ""}>${esc(t)}</option>`,
      )
      .join("")}</select>`,
  );
