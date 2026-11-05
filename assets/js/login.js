const $ = (id) => document.getElementById(id);
const err = $("e"),
  btn = $("go"),
  label = $("gol"),
  pw = $("p"),
  eye = $("show");

// Already signed in? Skip the login page.
fetch("api/me.php")
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => {
    if (j && j.success) location.href = j.data.redirect;
  })
  .catch(() => {});

eye.addEventListener("click", () => {
  const reveal = pw.type === "password";
  pw.type = reveal ? "text" : "password";
  eye.setAttribute("aria-pressed", reveal);
  eye.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
});

$("fp").addEventListener("click", () => $("fh").classList.toggle("hidden"));

$("lf").addEventListener("submit", async (e) => {
  e.preventDefault();
  err.textContent = "";
  btn.disabled = true;
  label.textContent = "Signing in…";
  try {
    const r = await fetch("api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: $("u").value, password: pw.value }),
    });
    const j = await r.json();
    if (j.success) {
      location.href = j.data.redirect;
      return;
    }
    err.textContent = j.message;
  } catch (x) {
    err.textContent =
      "Cannot reach the server. Check that Apache and MySQL are running in XAMPP.";
  }
  btn.disabled = false;
  label.textContent = "Sign in";
});
