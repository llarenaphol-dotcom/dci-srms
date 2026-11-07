const $ = (id) => document.getElementById(id);
const filters = ["q", "program", "year", "standing", "status"];
let timer;

async function load() {
  $("rows").innerHTML =
    '<tr><td colspan="7" class="text-center text-mut">Loading…</td></tr>';
  const params = new URLSearchParams(
    filters.map((f) => [f, $(f).value.trim()]),
  );
  try {
    const d = await api("api/students.php?" + params);
    $("count").textContent =
      `${d.students.length} student${d.students.length === 1 ? "" : "s"}`;
    $("rows").innerHTML =
      d.students
        .map(
          (s) => `<tr>
      <td>${esc(s.student_no)}</td>
      <td>${esc(s.name)}</td>
      <td>${esc(s.program)}</td>
      <td>${esc(s.year_level)}</td>
      <td>${esc(s.standing)}</td>
      <td>${tag(s.status)}</td>
      <td>${esc(s.email)}</td>
    </tr>`,
        )
        .join("") ||
      '<tr><td colspan="7" class="text-center text-mut">No students found.</td></tr>';
    if ($("program").options.length === 1)
      d.programs.forEach((p) => $("program").add(new Option(p.code, p.id)));
  } catch (e) {
    $("count").textContent = "";
    $("rows").innerHTML =
      `<tr><td colspan="7" class="text-center text-bad">${esc(e.message)}</td></tr>`;
  }
}

$("q").addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(load, 250);
});
filters.slice(1).forEach((f) => $(f).addEventListener("change", load));
load();
