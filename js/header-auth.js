/* ============================================================
   header-auth.js — Barra superior según el estado de sesión
   (index.html y otras páginas públicas)
   - Sin sesión: muestra solo "Iniciar sesión" (oculta el botón al panel).
   - Con sesión: oculta "Iniciar sesión" y muestra el correo del
     usuario + un botón "Gestionar stock" que lleva a panel.html.
   Requiere que la página cargue los SDK compat de Firebase y
   js/firebase.js (expone `auth`).
   ============================================================ */

(function () {
  "use strict";

  const btnLogin = document.getElementById("btn-header-login");
  const userChip = document.getElementById("user-chip");
  const userEmail = document.getElementById("user-email");
  const btnPanel = document.getElementById("btn-header-panel");

  if (!auth) return; // página sin Firebase Auth, nada que hacer

  auth.onAuthStateChanged(function (user) {
    if (user) {
      // Sesión iniciada: oculta "Iniciar sesión", muestra correo + panel
      if (btnLogin) btnLogin.hidden = true;
      if (userChip) userChip.hidden = false;
      if (userEmail) userEmail.textContent = user.email || "usuario";
      if (btnPanel) btnPanel.hidden = false;
    } else {
      // Sin sesión: solo "Iniciar sesión"
      if (btnLogin) btnLogin.hidden = false;
      if (userChip) userChip.hidden = true;
      if (userEmail) userEmail.textContent = "";
      if (btnPanel) btnPanel.hidden = true;
    }
  });
})();
