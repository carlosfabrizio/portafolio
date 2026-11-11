/* ============================================================
   panel.js — Panel de administración (panel.html)
   CRUD completo sobre la colección "productos" de Firestore:
   ver, añadir, editar y borrar productos.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Referencias del DOM ---------- */
  const userChip = document.getElementById("user-chip");
  const userEmail = document.getElementById("user-email");
  const btnLogout = document.getElementById("btn-logout");

  const form = document.getElementById("product-form");
  const nombreInput = document.getElementById("nombre");
  const cantidadInput = document.getElementById("cantidad");
  const btnSave = document.getElementById("btn-save");
  const formTitle = document.getElementById("form-title");

  const editingBanner = document.getElementById("editing-banner");
  const editingName = document.getElementById("editing-name");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");

  const panelAlert = document.getElementById("panel-alert");
  const panelLoading = document.getElementById("panel-loading");
  const panelEmpty = document.getElementById("panel-empty");
  const tableWrap = document.getElementById("table-wrap");
  const tbody = document.getElementById("products-tbody");
  const searchInput = document.getElementById("search");

  /* ---------- Estado ---------- */
  let products = [];        // [{ id, nombre, cantidad }]
  let editingId = null;     // id del producto en edición (o null)
  let searchTerm = "";

  /* ---------- Utilidades ---------- */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showAlert(type, message) {
    panelAlert.hidden = false;
    panelAlert.className = "alert alert-" + type;
    panelAlert.textContent = message;
    // Auto-ocultar tras 5 segundos
    clearTimeout(showAlert._t);
    showAlert._t = setTimeout(function () {
      panelAlert.hidden = true;
      panelAlert.textContent = "";
    }, 5000);
  }

  function hideAlert() {
    panelAlert.hidden = true;
    panelAlert.textContent = "";
  }

  /* ---------- Guardar estado de edición en el formulario ---------- */

  function setEditing(id, nombre) {
    editingId = id;
    if (id) {
      formTitle.textContent = "Editar producto";
      btnSave.textContent = "💾 Guardar cambios";
      editingBanner.classList.add("visible");
      editingName.textContent = nombre;
    } else {
      formTitle.textContent = "Añadir producto";
      btnSave.textContent = "➕ Añadir producto";
      editingBanner.classList.remove("visible");
    }
  }

  function resetForm() {
    form.reset();
    setEditing(null, "");
  }

  /* ---------- Renderizado de la tabla ---------- */

  function renderTable() {
    tbody.innerHTML = "";

    const term = searchTerm.trim().toLowerCase();
    const visible = term
      ? products.filter(function (p) {
          return p.nombre.toLowerCase().indexOf(term) !== -1;
        })
      : products;

    if (!visible.length) {
      panelEmpty.hidden = products.length === 0;
      tableWrap.style.display = products.length === 0 ? "none" : "block";
      if (products.length > 0) {
        // Hay productos pero la búsqueda no coincide
        const row = document.createElement("tr");
        row.innerHTML = '<td colspan="3" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Sin resultados para "' + escapeHtml(searchTerm) + '"</td>';
        tbody.appendChild(row);
      }
      return;
    }

    panelEmpty.hidden = true;
    tableWrap.style.display = "block";

    const fragment = document.createDocumentFragment();
    visible.forEach(function (p) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(p.nombre) + "</td>" +
        "<td>" + p.cantidad + "</td>" +
        '<td><div class="row-actions">' +
        '<button class="icon-btn" data-action="edit" data-id="' + escapeHtml(p.id) + '" title="Editar" type="button">✏️</button>' +
        '<button class="icon-btn danger" data-action="delete" data-id="' + escapeHtml(p.id) + '" title="Borrar" type="button">🗑️</button>' +
        "</div></td>";
      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
  }

  /* ---------- Carga de datos (escucha en tiempo real) ---------- */

  function startListening() {
    db.collection(PRODUCTS_COLLECTION)
      .onSnapshot(
        function (snapshot) {
          products = snapshot.docs.map(function (doc) {
            const data = doc.data();
            return {
              id: doc.id,
              nombre: data.nombre != null ? String(data.nombre) : "(sin nombre)",
              cantidad: data.cantidad != null ? Number(data.cantidad) : 0
            };
          });
          products.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre, "es");
          });
          panelLoading.hidden = true;
          renderTable();
        },
        function (error) {
          console.error("Error al escuchar la colección:", error);
          panelLoading.hidden = true;
          showAlert("error", firestoreErrorMessage(error));
        }
      );
  }

  /* ---------- Acciones CRUD ---------- */

  async function addProduct(nombre, cantidad) {
    await db.collection(PRODUCTS_COLLECTION).add({
      nombre: nombre,
      cantidad: cantidad // número entero → Firestore lo guarda como int64
    });
  }

  async function updateProduct(id, nombre, cantidad) {
    await db.collection(PRODUCTS_COLLECTION).doc(id).update({
      nombre: nombre,
      cantidad: cantidad
    });
  }

  async function deleteProduct(id) {
    await db.collection(PRODUCTS_COLLECTION).doc(id).delete();
  }

  /* ---------- Eventos ---------- */

  // Envío del formulario (añadir o editar)
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hideAlert();

    const nombre = nombreInput.value.trim();
    const cantidadRaw = cantidadInput.value.trim();
    const cantidad = parseInt(cantidadRaw, 10);

    if (!nombre) {
      showAlert("error", "El nombre del producto es obligatorio.");
      return;
    }
    if (cantidadRaw === "" || isNaN(cantidad) || cantidad < 0) {
      showAlert("error", "La cantidad debe ser un número entero mayor o igual a 0.");
      return;
    }

    btnSave.disabled = true;
    try {
      if (editingId) {
        await updateProduct(editingId, nombre, cantidad);
        showAlert("success", "Producto actualizado correctamente.");
      } else {
        await addProduct(nombre, cantidad);
        showAlert("success", "Producto añadido correctamente.");
      }
      resetForm();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      showAlert("error", firestoreErrorMessage(error));
    } finally {
      btnSave.disabled = false;
    }
  });

  // Botones de la tabla (delegación de eventos)
  tbody.addEventListener("click", async function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "edit") {
      const product = products.find(function (p) {
        return p.id === id;
      });
      if (!product) return;
      nombreInput.value = product.nombre;
      cantidadInput.value = product.cantidad;
      setEditing(id, product.nombre);
      nombreInput.focus();
      // En pantallas pequeñas, llevar al usuario al formulario
      if (window.innerWidth <= 860) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (action === "delete") {
      const product = products.find(function (p) {
        return p.id === id;
      });
      const nombre = product ? product.nombre : id;
      if (!window.confirm('¿Borrar el producto "' + nombre + '"? Esta acción no se puede deshacer.')) {
        return;
      }
      try {
        await deleteProduct(id);
        if (editingId === id) resetForm();
        showAlert("success", "Producto borrado.");
      } catch (error) {
        console.error("Error al borrar el producto:", error);
        showAlert("error", firestoreErrorMessage(error));
      }
    }
  });

  // Cancelar edición
  btnCancelEdit.addEventListener("click", resetForm);

  // Búsqueda en vivo
  searchInput.addEventListener("input", function () {
    searchTerm = searchInput.value;
    renderTable();
  });

  // Cerrar sesión
  btnLogout.addEventListener("click", async function () {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    window.location.replace("index.html");
  });

  /* ---------- Inicio: verificar sesión ---------- */

  auth.onAuthStateChanged(function (user) {
    if (!user) {
      // Sin sesión: no se permite acceder al panel
      window.location.replace("login.html");
      return;
    }
    userChip.hidden = false;
    userEmail.textContent = user.email || "usuario";
    startListening();
  });
})();
