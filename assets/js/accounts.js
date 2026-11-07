const $ = (id) => document.getElementById(id);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const ROLES = ["admin", "staff", "dean"];
let me = null,
  users = [];

const call = (method, body, query = "") =>
  send("api/users.php" + query, method, body);

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

$("add").onclick = () =>
  dialog(
    "Add account",
    input(
      "username",
      "Username",
      "",
      'autocapitalize="none" autofocus required',
    ) +
      input("full_name", "Full name", "", "required") +
      select(
        "role",
        "Role",
        ROLES.map((r) => [r, cap(r)]),
      ) +
      input(
        "password",
        "Password",
        "",
        'type="password" minlength="8" autocomplete="new-password" required',
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
        input(
          "password",
          "New password",
          "",
          'type="password" minlength="8" autocomplete="new-password" autofocus required',
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
