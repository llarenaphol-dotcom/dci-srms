const $ = (id) => document.getElementById(id);
let courses = [];
const row = (html, cls = "text-mut") =>
  `<tr><td colspan="5" class="text-center ${cls}">${esc(html)}</td></tr>`;

async function load() {
  try {
    courses = await api("api/courses.php");
  } catch (e) {
    $("rows").innerHTML = row(e.message, "text-bad");
    return;
  }
  $("rows").innerHTML =
    courses
      .map(
        (c) => `<tr>
      <td>${esc(c.course_code)}</td>
      <td>${esc(c.course_title)}</td>
      <td>${esc(c.units)}</td>
      <td>${esc(c.n)}</td>
      <td><div class="flex gap-2">
        <button class="btn g s" data-edit="${c.course_id}">Edit</button>
        <button class="btn d s" data-del="${c.course_id}">Delete</button>
      </div></td></tr>`,
      )
      .join("") || row("No subjects yet.");
}

// Add (c = {}) or edit (c = a subject row)
function subjectDialog(c = {}) {
  const editing = !!c.course_id;
  dialog(
    editing ? "Edit subject" : "Add subject",
    input("course_code", "Subject code", c.course_code, 'maxlength="50" placeholder="CC103" required') +
      input("course_title", "Subject title", c.course_title, 'maxlength="100" required') +
      input("units", "Units", c.units, 'type="number" min="1" max="10" required'),
    editing ? "Save changes" : "Add subject",
    async (v) => {
      const j = await send("api/courses.php", editing ? "PUT" : "POST", { ...v, course_id: c.course_id });
      if (!j.success) return j.message;
      toast(j.message);
      load();
      return "";
    },
  );
}

$("add").onclick = () => subjectDialog();

$("rows").addEventListener("click", (e) => {
  const { edit, del } = e.target.dataset;
  const c = courses.find((x) => x.course_id == (edit || del));
  if (edit) subjectDialog(c);
  if (del)
    dialog(
      "Delete subject",
      `<p class="text-mut text-sm mt-2">Delete ${esc(c.course_code)} ${esc(c.course_title)}? This cannot be undone.</p>`,
      "Delete",
      async () => {
        const j = await send("api/courses.php?id=" + del, "DELETE");
        if (!j.success) return j.message;
        toast(j.message);
        load();
        return "";
      },
      true,
    );
});

load();
