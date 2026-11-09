const $ = (id) => document.getElementById(id);
const filters = ["q", "program", "year", "standing", "status"];
let timer,
  staff = false, // only staff can add / edit / delete (the api checks this too)
  students = [],
  programs = [],
  currentPage = 1,
  limit = 10; // Number of items per page

async function load(targetPage = 1) {
  currentPage = targetPage;
  const cols = staff ? 8 : 7;
  const msg = (text, cls) =>
    `<tr><td colspan="${cols}" class="text-center ${cls}">${esc(text)}</td></tr>`;
  $("rows").innerHTML = msg("Loading…", "text-mut");

  const params = new URLSearchParams(
    filters.map((f) => [f, $(f).value.trim()]),
  );
  params.set("page", currentPage);
  params.set("limit", limit);

  try {
    const res = await api("api/students.php?" + params);
    const d = res.data || res;
    students = d.students;
    programs = d.programs;
    
    const totalCount = d.total !== undefined ? d.total : students.length;
    const totalPages = d.totalPages !== undefined ? d.totalPages : Math.ceil(totalCount / limit) || 1;

    // Ensure currentPage doesn't exceed totalPages after filters change
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
      return load(currentPage);
    }

    $("count").textContent =
      `${totalCount} student${totalCount === 1 ? "" : "s"} found`;

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

    // Update Pagination UI Info & Buttons
    $("page-info").textContent = `Page ${currentPage} of ${totalPages || 1}`;
    $("prev-page").disabled = currentPage <= 1;
    $("next-page").disabled = currentPage >= totalPages;

    // Update jump input placeholder or value indicator
    $("jump-page-input").max = totalPages;

    // Render progressive sliding page numbers (e.g., 1-4 sliding forward, then ellipses)
    renderPageNumbers(totalPages, currentPage);

  } catch (e) {
    $("count").textContent = "";
    $("rows").innerHTML = msg(e.message, "text-bad");
    $("page-info").textContent = "";
    $("prev-page").disabled = true;
    $("next-page").disabled = true;
    $("page-numbers").innerHTML = "";
  }
}

// Progressive sliding pagination builder (1-4 progressing forward with ellipses)
function renderPageNumbers(totalPages, current) {
  const container = $("page-numbers");
  container.innerHTML = "";

  if (totalPages <= 1) return;

  let pages = [];

  if (totalPages <= 5) {
    // Show all if total pages are 5 or fewer
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Progressive sliding logic: 
    // If we are in the early pages, show 1 to 4, then '...', then last page.
    // As 'current' increases, the window shifts forward.
    if (current <= 3) {
      pages = [1, 2, 3, 4, '...', totalPages];
    } else if (current >= totalPages - 2) {
      pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', current - 1, current, current + 1, '...', totalPages];
    }
  }

  pages.forEach(p => {
    if (p === '...') {
      const span = document.createElement("span");
      span.className = "px-2 text-mut text-sm self-center";
      span.textContent = "...";
      container.appendChild(span);
    } else {
      const btn = document.createElement("button");
      btn.className = `btn sm ${p === current ? 'bg-primary text-white font-semibold' : 'g'}`;
      btn.textContent = p;
      btn.onclick = () => load(p);
      container.appendChild(btn);
    }
  });
}

// Arrow Button Handlers
$("prev-page").onclick = () => {
  if (currentPage > 1) load(currentPage - 1);
};

$("next-page").onclick = () => {
  load(currentPage + 1);
};

// Jump to specific page via typing input (triggers on Enter key)
$("jump-page-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const target = parseInt(e.target.value);
    const max = parseInt(e.target.max) || 1;
    if (!isNaN(target) && target >= 1 && target <= max) {
      load(target);
      e.target.value = ""; // Clear input after jump
    } else {
      toast(`Please enter a page number between 1 and ${max}`);
    }
  }
});

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
      input("middle_name", "Middle name (optional)", s.middle_name, 'maxlength="50"') +
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
      load(currentPage); // Stay on current page after modification
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
        load(currentPage);
        return "";
      },
      true,
    );
});

// Reset back to page 1 whenever search query inputs or filter selects change
$("q").addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => load(1), 250);
});

filters.slice(1).forEach((f) => $(f).addEventListener("change", () => load(1)));

api("api/me.php")
  .then((u) => (staff = u.role === "staff"))
  .catch(() => {}) // layout.js already sends signed-out users to login
  .then(() => {
    $("add").classList.toggle("hidden", !staff);
    $("act").classList.toggle("hidden", !staff);
    load(1);
  });