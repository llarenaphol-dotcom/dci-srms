// Shared dashboard shell (header, sidebar, footer) for every signed-in page.
// A page only needs: <main id="content" data-title="..." data-sub="...">its content</main>
// The sidebar is built from the signed-in user's role. This check is for the UI only;
// the real protection is require_role() in each api/*.php file.

const svg = p => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  cap:   '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  file:  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17V9M13 17V5M18 17v-6"/>',
  out:   '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
};

// What each role can open: [file, label, icon]
const NAV = {
  admin: [['accounts.html', 'Accounts', 'users']],
  staff: [['students.html', 'Students', 'cap'], ['forms.html', 'Forms', 'file']],
  dean:  [['dashboard.html', 'Dashboard', 'chart'], ['students.html', 'Students', 'cap'], ['forms.html', 'Forms', 'file']]
};

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

(async () => {
  let u;
  try {
    const r = await fetch('api/me.php');
    if (!r.ok) return location.replace('login.html');
    u = (await r.json()).data;
  } catch (e) { return location.replace('login.html'); }

  const nav = NAV[u.role] || [];
  const file = location.pathname.split('/').pop();
  if (!nav.some(n => n[0] === file)) return location.replace(u.redirect); // wrong role for this page

  const c = document.getElementById('content');
  const shell = document.createElement('div');
  shell.className = 'min-h-screen flex flex-col';
  shell.innerHTML = `
<header class="topbar">
  <div class="flex items-center gap-3 px-6 md:px-14 h-20">
    <div class="w-8 h-8 rounded-lg bg-white text-side text-[8px] font-bold grid place-items-center">SRMS</div>
    <span class="font-bold text-lg">SRMS</span>
    <span class="hidden sm:block h-8 w-px bg-white/20 mx-2"></span>
    <span class="hidden sm:block text-sm">Student Record Management System</span>
  </div>
</header>

<div class="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-14 py-10 flex flex-col md:flex-row gap-6">
  <aside class="md:w-[248px] shrink-0 bg-card border border-line rounded-xl p-6 flex flex-col md:min-h-[640px]">
    <nav class="flex flex-col gap-1" aria-label="Main">
      ${nav.map(n => `<a href="${n[0]}" class="navb ${n[0] === file ? 'on' : ''}" ${n[0] === file ? 'aria-current="page"' : ''}>${svg(ICON[n[2]])}${n[1]}</a>`).join('')}
    </nav>
    <div class="mt-auto pt-8">
      <div class="font-semibold text-base">${esc(u.full_name)}</div>
      <div class="text-xs text-mut mb-4">${esc(u.role)}</div>
      <button id="out" class="btn g w-full flex items-center justify-center gap-2">${svg(ICON.out)}Sign out</button>
    </div>
  </aside>
  <div class="flex-1 min-w-0 flex flex-col">
    <h1 class="text-3xl font-semibold leading-tight">${esc(c.dataset.title || '')}</h1>
    <p class="text-mut text-sm mt-1">${esc(c.dataset.sub || '')}</p>
    <div id="slot" class="flex-1 flex flex-col mt-6"></div>
  </div>
</div>

<footer class="footbar">
  <div class="flex flex-wrap items-center justify-center md:justify-between gap-x-6 gap-y-2 px-6 md:px-14 py-6 text-xs">
    <span>© 2026 SRMS. All rights reserved.</span>
    <span>For authorized personnel only.</span>
    <span class="flex gap-6"><a href="#" class="hover:underline">Privacy policy</a><a href="#" class="hover:underline">Terms of use</a></span>
  </div>
</footer>`;

  shell.querySelector('#slot').append(c); // move the page content in (keeps any references the page script holds)
  document.body.prepend(shell);
  document.getElementById('out').addEventListener('click', async () => {
    await fetch('api/logout.php', { method: 'POST' }).catch(() => {});
    location.href = 'login.html';
  });
  document.body.style.visibility = 'visible';
})();