const $ = (id) => document.getElementById(id);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const ROLES = ["admin", "staff", "dean"];
let me = null,
  users = [];

// Send a change to api/users.php. Always returns { success, message }.
async function call(method, body, query = "") {
  try {
    const r = await fetch("api/users.php" + query, {
      method,
      body: body && JSON.stringify(body),
    });
    return await r.json();
  } catch (e) {
    return {
      success: false,
      message: "Something went wrong. Check that Apache and MySQL are running.",
    };
  }
}

function toast(m) {
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = m;
  document.body.append(t);
  setTimeout(() => t.remove(), 2500);
}

async function load() {
  try {
    me = me || (await api("api/me.php"));
    users = await api("api/users.php");
  } catch (e) {
    $("rows").innerHTML =
      `<tr><td colspan="4" class="text-center text-bad">${esc(e.message)}</td></tr>`;
    return;
  }
  $("rows").innerHTML =
    users
      .map((u) => {
        const self = u.user_id == me.user_id;
        return `<tr>
      <td>${esc(u.username)}</td>
      <td>${esc(u.full_name)}</td>
      <td><select class="inp sm min-w-[110px]" data-role="${u.user_id}" aria-label="Role for ${esc(u.username)}" ${self ? "disabled" : ""}>
        ${ROLES.map((r) => `<option value="${r}" ${r === u.role ? "selected" : ""}>${cap(r)}</option>`).join("")}
      </select></td>
      <td><div class="flex gap-2">
        <button class="btn g s" data-reset="${u.user_id}">Reset password</button>
        ${self ? "" : `<button class="btn d s" data-del="${u.user_id}">Remove</button>`}
      </div></td></tr>`;
      })
      .join("") ||
    '<tr><td colspan="4" class="text-center text-mut">No accounts yet.</td></tr>';
}

// One dialog for add / reset / remove. onSubmit returns an error message, or '' to close.
function dialog(title, fields, okLabel, onSubmit, danger = false) {
  const d = $("dlg");
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
const field = (id, label, input) =>
  `<div class="mt-4"><label for="${id}">${label}</label>${input}</div>`;

$("add").onclick = () =>
  dialog(
    "Add account",
    field(
      "f_u",
      "Username",
      '<input id="f_u" name="username" class="inp w-full" autocapitalize="none" autofocus required>',
    ) +
      field(
        "f_n",
        "Full name",
        '<input id="f_n" name="full_name" class="inp w-full" required>',
      ) +
      field(
        "f_r",
        "Role",
        `<select id="f_r" name="role" class="inp w-full">${ROLES.map((r) => `<option value="${r}">${cap(r)}</option>`).join("")}</select>`,
      ) +
      field(
        "f_p",
        "Password",
        '<input id="f_p" name="password" type="password" class="inp w-full" minlength="8" autocomplete="new-password" required>',
      ),
    "Add account",
    async (v) => {
      const j = await call("POST", v);
      if (!j.success) return j.message;
      toast(j.message);
      load();
      return "";
    },
  );

$("rows").addEventListener("change", async (e) => {
  const id = e.target.dataset.role;
  if (!id) return;
  const j = await call("PUT", { user_id: +id, role: e.target.value });
  toast(j.message);
  if (!j.success) load(); // put the dropdown back
});

$("rows").addEventListener("click", (e) => {
  const reset = e.target.dataset.reset,
    del = e.target.dataset.del;
  if (reset) {
    const u = users.find((x) => x.user_id == reset);
    dialog(
      "Reset password",
      `<p class="text-mut text-sm mt-1">Set a new password for ${esc(u.username)}.</p>` +
        field(
          "f_p",
          "New password",
          '<input id="f_p" name="password" type="password" class="inp w-full" minlength="8" autocomplete="new-password" autofocus required>',
        ),
      "Reset password",
      async (v) => {
        const j = await call("PUT", { user_id: +reset, password: v.password });
        if (!j.success) return j.message;
        toast(j.message);
        return "";
      },
    );
  }
  if (del) {
    const u = users.find((x) => x.user_id == del);
    dialog(
      "Remove account",
      `<p class="text-mut text-sm mt-2">Remove ${esc(u.username)} (${esc(u.full_name)})? This cannot be undone.</p>`,
      "Remove",
      async () => {
        const j = await call("DELETE", null, "?id=" + del);
        if (!j.success) return j.message;
        toast(j.message);
        load();
        return "";
      },
      true,
    );
  }
});

load();
