(async () => {
  const q = document.getElementById('q');
  const program = document.getElementById('program');
  const year = document.getElementById('year');
  const standing = document.getElementById('standing');
  const status = document.getElementById('status');
  const rows = document.getElementById('rows');
  const count = document.getElementById('count');
  let timer;

  const load = async () => {
    rows.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">Loading…</td></tr>';
    const params = new URLSearchParams({
      q: q.value.trim(),
      program: program.value,
      year: year.value,
      standing: standing.value,
      status: status.value
    });

    try {
      const response = await fetch(`api/students.php?${params}`);
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Unable to load students.');

      const students = payload.data.students;
      count.textContent = `${students.length} student${students.length === 1 ? '' : 's'}`;
      rows.innerHTML = students.length ? students.map(student => `
        <tr class="border-b border-gray-100">
          <td class="py-3 pr-4">${student.student_no}</td>
          <td class="pr-4">${student.name}</td>
          <td class="pr-4">${student.program}</td>
          <td class="pr-4">${student.year_level}</td>
          <td class="pr-4">${student.standing}</td>
          <td class="pr-4">${student.status}</td>
          <td>${student.email || ''}</td>
        </tr>`).join('') : '<tr><td colspan="7" class="py-8 text-center text-gray-500">No students found.</td></tr>';

      if (!program.options.length || program.options.length === 1) {
        payload.data.programs.forEach(item => program.add(new Option(item.code, item.id)));
      }
      if (!standing.options.length || standing.options.length === 1) {
        payload.data.standings.forEach(item => standing.add(new Option(item, item)));
      }
      if (!status.options.length || status.options.length === 1) {
        payload.data.statuses.forEach(item => status.add(new Option(item, item)));
      }
    } catch (error) {
      count.textContent = '';
      rows.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-red-700">${error.message}</td></tr>`;
    }
  };

  q.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(load, 250);
  });
  [program, year, standing, status].forEach(select => select.addEventListener('change', load));
  load();
})();
