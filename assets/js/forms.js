(() => {
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const api = async url => {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!j || !j.success) throw new Error((j && j.message) || "Request failed");
  return j.data;
};

// [field, heading] per tab. details = reason (drop), term and reason (loa), scholarship name.
const COLS = {
  drop: [["student_no", "Student no."], ["name", "Student"], ["subject", "Subject"], ["details", "Reason"], ["date_filed", "Filed"], ["status", "Status"]],
  loa: [["student_no", "Student no."], ["name", "Student"], ["details", "Term and reason"], ["date_filed", "Filed"], ["status", "Status"]],
  scholarship: [["student_no", "Student no."], ["name", "Student"], ["details", "Scholarship"], ["amount", "Amount"], ["date_filed", "Filed"], ["status", "Status"]],
};
const cell = (f, k) => k === "amount" ? "₱" + Number(f.amount).toLocaleString() : esc(f[k]);

function subjects(rows) {
  const mx = Math.max(1, ...rows.map(r => r[1]));
  $("#subjects").innerHTML = `<h2 class="text-sm font-medium mb-3">Dropping forms per subject</h2>` + rows.map(([s, n]) =>
    `<div class="grid grid-cols-[minmax(120px,220px)_1fr_2rem] items-center gap-3 text-sm mb-1.5">
       <span>${esc(s)}</span>
       <span class="h-2 rounded bg-gray-100"><i class="block h-2 rounded bg-[#1E3A5F]" style="width:${n / mx * 100}%"></i></span>
       <b class="text-right">${n}</b></div>`).join("");
}

async function show(type) {
  const cols = COLS[type];
  document.querySelectorAll("#tabs button").forEach(b => {
    const on = b.dataset.type === type;
    b.className = "pb-2 -mb-px border-b-2 " + (on ? "border-[#1E3A5F] text-[#1E3A5F] font-medium" : "border-transparent text-gray-500");
    b.setAttribute("aria-selected", on);
  });
  $("#subjects").classList.toggle("hidden", type !== "drop");
  $("#head").innerHTML = "<tr>" + cols.map(c => `<th class="py-2 pr-4 font-medium">${c[1]}</th>`).join("") + "</tr>";
  $("#rows").innerHTML = `<tr><td colspan="${cols.length}" class="py-8 text-center text-gray-500">Loading…</td></tr>`;
  try {
    const d = await api("api/forms.php?type=" + type);
    if (d.subjects) subjects(d.subjects);
    $("#rows").innerHTML = d.forms.length
      ? d.forms.map(f => `<tr class="border-b border-gray-100">${cols.map(([k]) => `<td class="py-2 pr-4">${cell(f, k)}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${cols.length}" class="py-8 text-center text-gray-500">No forms yet.</td></tr>`;
  } catch (e) {
    $("#rows").innerHTML = `<tr><td colspan="${cols.length}" class="py-8 text-center text-red-700">${esc(e.message)}</td></tr>`;
  }
}

$("#tabs").addEventListener("click", e => e.target.dataset.type && show(e.target.dataset.type));
show("drop");
})();