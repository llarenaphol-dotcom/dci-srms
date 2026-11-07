const $ = (id) => document.getElementById(id);

// [field, heading] per tab. details = reason (drop), term and reason (loa), scholarship name.
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
    ["details", "Term and reason"],
    ["date_filed", "Filed"],
    ["status", "Status"],
  ],
  scholarship: [
    ["student_no", "Student no."],
    ["name", "Student"],
    ["details", "Scholarship"],
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

function subjects(rows) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  $("subjects").innerHTML =
    '<h2 class="text-sm font-medium mb-3">Dropping forms per subject</h2>' +
    rows
      .map(
        ([s, n]) =>
          `<div class="grid grid-cols-[minmax(120px,220px)_1fr_2rem] items-center gap-3 text-sm mb-1.5">
       <span>${esc(s)}</span>
       <span class="h-2 rounded bg-tint"><i class="block h-2 rounded bg-pri" style="width:${(n / max) * 100}%"></i></span>
       <b class="text-right">${n}</b></div>`,
      )
      .join("");
}

async function show(type) {
  const cols = COLS[type];
  const msg = (text, cls) =>
    `<tr><td colspan="${cols.length}" class="text-center ${cls}">${esc(text)}</td></tr>`;
  document.querySelectorAll("#tabs button").forEach((b) => {
    const on = b.dataset.type === type;
    b.className =
      "pb-2 -mb-px border-b-2 " +
      (on ? "border-pri text-pri font-medium" : "border-transparent text-mut");
    b.setAttribute("aria-selected", on);
  });
  $("subjects").classList.toggle("hidden", type !== "drop");
  $("head").innerHTML =
    "<tr>" + cols.map((c) => `<th>${c[1]}</th>`).join("") + "</tr>";
  $("rows").innerHTML = msg("Loading…", "text-mut");
  try {
    const d = await api("api/forms.php?type=" + type);
    if (d.subjects) subjects(d.subjects);
    $("rows").innerHTML =
      d.forms
        .map(
          (f) =>
            "<tr>" +
            cols.map(([k]) => `<td>${cell(f, k)}</td>`).join("") +
            "</tr>",
        )
        .join("") || msg("No forms yet.", "text-mut");
  } catch (e) {
    $("rows").innerHTML = msg(e.message, "text-bad");
  }
}

$("tabs").addEventListener(
  "click",
  (e) => e.target.dataset.type && show(e.target.dataset.type),
);
show("drop");
