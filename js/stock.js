/* ============================================================
   stock.js — Página de stock (stock.html)
   Muestra el stock disponible consultando Firestore.
   ============================================================ */

(function () {
  "use strict";

  const stockGrid = document.getElementById("stock-grid");
  const stockCount = document.getElementById("stock-count");
  const stockAlert = document.getElementById("stock-alert");
  const stockLoading = document.getElementById("stock-loading");
  const stockEmpty = document.getElementById("stock-empty");

  /* ---------- Utilidades de UI ---------- */

  function showAlert(type, message) {
    stockAlert.hidden = false;
    stockAlert.className = "alert alert-" + type;
    stockAlert.textContent = message;
  }

  function hideAlert() {
    stockAlert.hidden = true;
    stockAlert.textContent = "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------- Renderizado ---------- */

  function qtyBadge(cantidad) {
    const n = Number(cantidad) || 0;
    if (n <= 0) return '<span class="qty-badge out">Agotado</span>';
    if (n <= 5) return '<span class="qty-badge low">' + n + " · bajo stock</span>";
    return '<span class="qty-badge">' + n + " unidades</span>";
  }

  function renderProducts(products) {
    stockGrid.innerHTML = "";

    if (!products.length) {
      stockEmpty.hidden = false;
      return;
    }
    stockEmpty.hidden = true;

    const fragment = document.createDocumentFragment();
    products.forEach((p) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML =
        '<div class="p-name">' + escapeHtml(p.nombre) + "</div>" +
        '<div class="p-qty">Cantidad: ' + qtyBadge(p.cantidad) + "</div>" +
        '<div class="p-id">ID: ' + escapeHtml(p.id) + "</div>";
      fragment.appendChild(card);
    });
    stockGrid.appendChild(fragment);

    stockCount.textContent = products.length + (products.length === 1 ? " producto" : " productos");
  }

  /* ---------- Carga de datos desde Firestore ---------- */

  async function loadStock() {
    hideAlert();
    stockLoading.hidden = false;
    stockEmpty.hidden = true;
    stockGrid.innerHTML = "";

    try {
      const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
      const products = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre != null ? data.nombre : "(sin nombre)",
          cantidad: data.cantidad != null ? Number(data.cantidad) : 0
        };
      });

      // Ordenar por nombre para una presentación estable
      products.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      renderProducts(products);
    } catch (error) {
      console.error("Error al cargar el stock:", error);
      showAlert("error", firestoreErrorMessage(error));
    } finally {
      stockLoading.hidden = true;
    }
  }

  // Carga el stock al abrir la página
  loadStock();
})();
