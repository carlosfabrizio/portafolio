/* ============================================================
   login.js — Página de inicio de sesión (login.html)
   Maneja el inicio de sesión con Firebase Authentication
   (correo y contraseña).
   ============================================================ */

(function () {
  "use strict";

  const form = document.getElementById("auth-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("auth-submit");
  const alertBox = document.getElementById("auth-alert");

  /* ---------- Redirigir si ya hay sesión activa ---------- */
  auth.onAuthStateChanged(function (user) {
    if (user) {
      window.location.replace("panel.html");
    }
  });

  /* ---------- Utilidades ---------- */

  function showAlert(type, message) {
    alertBox.hidden = false;
    alertBox.className = "alert alert-" + type;
    alertBox.textContent = message;
  }

  function hideAlert() {
    alertBox.hidden = true;
    alertBox.textContent = "";
  }

  /* ---------- Envío del formulario ---------- */

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hideAlert();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showAlert("error", "Completa el correo y la contraseña.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Iniciando…";

    try {
      await auth.signInWithEmailAndPassword(email, password);
      // onAuthStateChanged redirige a panel.html automáticamente
      window.location.replace("panel.html");
    } catch (error) {
      console.error("Error de autenticación:", error);
      showAlert("error", authErrorMessage(error));
      submitBtn.disabled = false;
      submitBtn.textContent = "Iniciar sesión";
    }
  });
})();
