const $ = (id) => document.getElementById(id);
let type = "drop",
  staff = false, // only staff can add / edit / delete (the api checks this too)
  forms = [],
  courses = [], // [{id, name, n}] from the drop tab, fills the Subject dropdown
  scholarships = []; // [{id, name, amount}] from the scholarship tab

// [field, heading] per tab. details is always the reason.
const COLS = {
  drop: [
    ["student_no", "Student no."],
    ["name", "Student"],
    ["subject", "Subject"],
    ["details", "Reason"],
    ["date_filed", "Filed"],
    ["status", "Status"],
  ],
  loa: [
    ["student_no", "Student no."],
    ["name", "Student"],
    ["academic_year", "Academic year"],
    ["semester", "Semester"],
    ["details", "Reason"],
    ["date_filed", "Filed"],
    ["status", "Status"],
  ],
  scholarship: [
    ["student_no", "Student no."],
    ["name", "Student"],
    ["scholarship", "Scholarship"],
    ["amount", "Amount"],
    ["date_filed", "Filed"],
    ["status", "Status"],
  ],
};
const cell = (f, k) =>
  k === "amount"
    ? "₱" + Number(f.amount).toLocaleString()
    : k === "status"
      ? tag(f.status)
      : esc(f[k]);

function subjects() {
  const max = Math.max(1, ...courses.map((c) => c.n));
  $("subjects").innerHTML =
    '<h2 class="text-sm font-medium mb-3">Dropping forms per subject</h2>' +
    courses
      .map(
        (c) =>
          `<div class="grid grid-cols-[minmax(120px,220px)_1fr_2rem] items-center gap-3 text-sm mb-1.5">
       <span>${esc(c.name)}</span>
       <span class="h-2 rounded bg-tint"><i class="block h-2 rounded bg-pri" style="width:${(c.n / max) * 100}%"></i></span>
       <b class="text-right">${c.n}</b></div>`,
      )
      .join("");
}

async function show() {
  const cols = COLS[type];
  const span = cols.length + (staff ? 1 : 0);
  const msg = (text, cls) =>
    `<tr><td colspan="${span}" class="text-center ${cls}">${esc(text)}</td></tr>`;
  document.querySelectorAll("#tabs button").forEach((b) => {
    const on = b.dataset.type === type;
    b.className =
      "pb-2 -mb-px border-b-2 " +
      (on ? "border-pri text-pri font-medium" : "border-transparent text-mut");
    b.setAttribute("aria-selected", on);
  });
  $("subjects").classList.toggle("hidden", type !== "drop");
  $("head").innerHTML =
    "<tr>" +
    cols.map((c) => `<th>${c[1]}</th>`).join("") +
    (staff ? "<th>Actions</th>" : "") +
    "</tr>";
  $("rows").innerHTML = msg("Loading…", "text-mut");
  try {
    const d = await api("api/forms.php?type=" + type);
    forms = d.forms;
    if (d.subjects) {
      courses = d.subjects;
      subjects();
    }
    if (d.scholarships) scholarships = d.scholarships;
    $("rows").innerHTML =
      forms
        .map(
          (f) =>
            "<tr>" +
            cols.map(([k]) => `<td>${cell(f, k)}</td>`).join("") +
            (staff
              ? `<td><div class="flex gap-2"><button class="btn g s" data-edit="${f.form_id}">Edit</button><button class="btn d s" data-del="${f.form_id}">Delete</button></div></td>`
              : "") +
            "</tr>",
        )
        .join("") || msg("No forms yet.", "text-mut");
  } catch (e) {
    $("rows").innerHTML = msg(e.message, "text-bad");
  }
}

// Add (f = {}) or edit (f = a form row). The fields depend on the current tab.
function formDialog(f = {}) {
  const editing = !!f.form_id;
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
  const fields = {
    drop:
      select(
        "course_id",
        "Subject",
        courses.map((c) => [c.id, c.name]),
        f.course_id,
      ) + input("details", "Reason", f.details, "required"),
    loa:
      input(
        "academic_year",
        "Academic year",
        f.academic_year,
        'placeholder="2026-2027" pattern="\\d{4}-\\d{4}" required',
      ) +
      select(
        "semester",
        "Semester",
        ["1st Semester", "2nd Semester", "Summer"].map((v) => [v, v]),
        f.semester,
      ) +
      input("details", "Reason", f.details, "required"),
    scholarship:
      select(
        "scholarship_id",
        "Scholarship",
        scholarships
          .map((s) => [
            s.id,
            `${s.name} (₱${Number(s.amount).toLocaleString()})`,
          ])
          .concat([["new", "+ New scholarship…"]]),
        f.scholarship_id,
      ) +
      `<div id="new_schol" class="hidden">${input("new_name", "New scholarship name", "", 'maxlength="100"')}${input("new_amount", "Amount (₱)", "", 'type="number" min="1" step="0.01"')}</div>`,
  };
  dialog(
    editing ? "Edit form" : "New form",
    input(
      "student_no",
      "Student no.",
      f.student_no,
      'placeholder="2024-0001" required',
    ) +
      fields[type] +
      input(
        "date_filed",
        "Date filed",
        f.date_filed || today,
        'type="date" required',
      ) +
      select(
        "status",
        "Status",
        ["Pending", "Approved", "Rejected"].map((v) => [v, v]),
        f.status,
      ),
    editing ? "Save changes" : "Add form",
    async (v) => {
      const j = await send("api/forms.php", editing ? "PUT" : "POST", {
        ...v,
        type,
        form_id: f.form_id,
      });
      if (!j.success) return j.message;
      toast(j.message);
      show();
      return "";
    },
  );
  // show the name / amount fields only when "+ New scholarship…" is picked
  const pick = $("f_scholarship_id");
  if (pick)
    (pick.onchange = () => {
      const on = pick.value === "new";
      $("new_schol").classList.toggle("hidden", !on);
      $("f_new_name").required = $("f_new_amount").required = on;
    })();
}

$("add").onclick = () => formDialog();

$("rows").addEventListener("click", (e) => {
  const { edit, del } = e.target.dataset;
  const f = forms.find((x) => x.form_id == (edit || del));
  if (edit) formDialog(f);
  if (del)
    dialog(
      "Delete form",
      `<p class="text-mut text-sm mt-2">Delete this form for ${esc(f.name)}? This cannot be undone.</p>`,
      "Delete",
      async () => {
        const j = await send("api/forms.php?id=" + del, "DELETE");
        if (!j.success) return j.message;
        toast(j.message);
        show();
        return "";
      },
      true,
    );
});

$("tabs").addEventListener("click", (e) => {
  if (!e.target.dataset.type) return;
  type = e.target.dataset.type;
  show();
});

api("api/me.php")
  .then((u) => (staff = u.role === "staff"))
  .catch(() => {}) // layout.js already sends signed-out users to login
  .then(() => {
    $("add").classList.toggle("hidden", !staff);
    show();
  });
