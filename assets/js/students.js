const $ = (id) => document.getElementById(id);
const filters = ["q", "program", "year", "standing", "status"];
let timer,
  staff = false, // only staff can add / edit / delete (the api checks this too)
  students = [],
  programs = [];

async function load() {
  const cols = staff ? 8 : 7;
  const msg = (text, cls) =>
    `<tr><td colspan="${cols}" class="text-center ${cls}">${esc(text)}</td></tr>`;
  $("rows").innerHTML = msg("Loading…", "text-mut");
  const params = new URLSearchParams(
    filters.map((f) => [f, $(f).value.trim()]),
  );
  try {
    const d = await api("api/students.php?" + params);
    students = d.students;
    programs = d.programs;
    $("count").textContent =
      `${students.length} student${students.length === 1 ? "" : "s"}`;
    $("rows").innerHTML =
      students
        .map(
          (s) => `<tr>
      <td>${esc(s.student_no)}</td>
      <td>${esc(s.name)}</td>
      <td>${esc(s.program)}</td>
      <td>${esc(s.year_level)}</td>
      <td>${esc(s.standing)}</td>
      <td>${tag(s.status)}</td>
      <td>${esc(s.email)}</td>
      ${staff ? `<td><div class="flex gap-2"><button class="btn g s" data-edit="${s.student_id}">Edit</button><button class="btn d s" data-del="${s.student_id}">Delete</button></div></td>` : ""}
    </tr>`,
        )
        .join("") || msg("No students found.", "text-mut");
    if ($("program").options.length === 1)
      programs.forEach((p) => $("program").add(new Option(p.code, p.id)));
  } catch (e) {
    $("count").textContent = "";
    $("rows").innerHTML = msg(e.message, "text-bad");
  }
}

// Add (s = {}) or edit (s = a student row)
function studentForm(s = {}) {
  const editing = !!s.student_id;
  dialog(
    editing ? "Edit student" : "Add student",
    input(
      "student_no",
      "Student no.",
      s.student_no,
      'placeholder="2024-0001" required',
    ) +
      input("last_name", "Last name", s.last_name, "required") +
      input("first_name", "First name", s.first_name, "required") +
      input("email", "Email (optional)", s.email, 'type="email"') +
      select(
        "program_id",
        "Program",
        programs.map((p) => [p.id, p.code]),
        s.program_id,
      ) +
      select(
        "year_level",
        "Year level",
        [1, 2, 3, 4].map((y) => [y, "Year " + y]),
        s.year_level,
      ) +
      select(
        "standing",
        "Standing",
        [
          ["Regular", "Regular"],
          ["Irregular", "Irregular"],
        ],
        s.standing,
      ) +
      select(
        "status",
        "Status",
        ["Active", "Transferred", "Dropped"].map((v) => [v, v]),
        s.status,
      ),
    editing ? "Save changes" : "Add student",
    async (v) => {
      const j = await send("api/students.php", editing ? "PUT" : "POST", {
        ...v,
        student_id: s.student_id,
      });
      if (!j.success) return j.message;
      toast(j.message);
      load();
      return "";
    },
  );
}

$("add").onclick = () => studentForm();

$("rows").addEventListener("click", (e) => {
  const { edit, del } = e.target.dataset;
  const s = students.find((x) => x.student_id == (edit || del));
  if (edit) studentForm(s);
  if (del)
    dialog(
      "Delete student",
      `<p class="text-mut text-sm mt-2">Delete ${esc(s.name)} (${esc(s.student_no)})? Their forms are deleted too. This cannot be undone.</p>`,
      "Delete",
      async () => {
        const j = await send("api/students.php?id=" + del, "DELETE");
        if (!j.success) return j.message;
        toast(j.message);
        load();
        return "";
      },
      true,
    );
});

$("q").addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(load, 250);
});
filters.slice(1).forEach((f) => $(f).addEventListener("change", load));

api("api/me.php")
  .then((u) => (staff = u.role === "staff"))
  .catch(() => {}) // layout.js already sends signed-out users to login
  .then(() => {
    $("add").classList.toggle("hidden", !staff);
    $("act").classList.toggle("hidden", !staff);
    load();
  });
