const $ = (id) => document.getElementById(id);

const NAVY = ["#1E3A5F", "#4F6D92", "#8FA6C2", "#C5D2E2"];
const FORM = {
  drop: "Dropping",
  loa: "Leave of absence",
  scholarship: "Scholarship",
};
Chart.defaults.font.family = "Inter, sans-serif";

function draw(id, type, rows, fmt = String) {
  const doughnut = type === "doughnut";
  const total = rows.reduce((t, r) => t + +r[1], 0) || 1;
  new Chart($(id), {
    type,
    data: {
      // doughnut legend shows the numbers, e.g. "Active: 25 (83%)"
      labels: rows.map((r) =>
        doughnut
          ? `${fmt(r[0])}: ${r[1]} (${Math.round((r[1] / total) * 100)}%)`
          : fmt(r[0]),
      ),
      datasets: [
        {
          data: rows.map((r) => r[1]),
          backgroundColor: doughnut
            ? rows.map((_, i) => NAVY[i % NAVY.length])
            : NAVY[0],
          maxBarThickness: 48,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: doughnut, position: "bottom" } },
      scales: doughnut
        ? {}
        : {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
    },
  });
}

(async () => {
  try {
    const d = await api("api/stats.php");
    $("total").textContent = d.total;
    $("first").textContent = d.first_year;
    $("irregular").textContent = d.irregular;
    $("pending").textContent = d.pending;

    // year level, stacked by standing: d.year rows are [year, standing, count]
    const years = [1, 2, 3, 4];
    const n = (y, s) => {
      const r = d.year.find((r) => r[0] == y && r[1] === s);
      return r ? r[2] : 0;
    };
    new Chart($("c-year"), {
      type: "bar",
      data: {
        labels: years.map((y) => "Year " + y),
        datasets: [
          {
            label: "Regular",
            data: years.map((y) => n(y, "Regular")),
            backgroundColor: NAVY[0],
            maxBarThickness: 48,
          },
          {
            label: "Irregular",
            data: years.map((y) => n(y, "Irregular")),
            backgroundColor: NAVY[2],
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });

    draw("c-status", "doughnut", d.status);
    draw("c-program", "bar", d.program);
    draw("c-forms", "bar", d.forms, (t) => FORM[t] || t);
  } catch (e) {
    $("err").textContent = e.message;
    $("err").classList.remove("hidden");
  }
})();
