/* ============================================================
   firebase.js — Configuración e inicialización de Firebase
   Se carga DESPUÉS de los scripts compat de Firebase.
   Expone los globales: app, db (Firestore) y auth (Auth).
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAsmV-p-wewJXLGNKO7Z5WiOCoBXVJlsZs",
  authDomain: "itemsdb-5ecf4.firebaseapp.com",
  projectId: "itemsdb-5ecf4",
  storageBucket: "itemsdb-5ecf4.firebasestorage.app",
  messagingSenderId: "81292903349",
  appId: "1:81292903349:web:6a9c5fe9c157eaec968ffc"
};

// Inicializa la aplicación de Firebase
const app = firebase.initializeApp(firebaseConfig);

// Instancias que usan el resto de scripts
const db = firebase.firestore();
// auth solo se inicializa si la página cargó el SDK de auth (firebase-auth-compat);
// en páginas sin login (p. ej. stock.html) queda en null.
const auth = typeof firebase.auth === "function" ? firebase.auth() : null;

// Nombre de la colección de productos
const PRODUCTS_COLLECTION = "productos";

/* ------------------------------------------------------------
   Utilidad: traduce los códigos de error de Firebase Auth
   a mensajes en español para mostrar al usuario.
   ------------------------------------------------------------ */
function authErrorMessage(error) {
  const code = (error && error.code) || "";
  const map = {
    "auth/operation-not-allowed":
      "El inicio de sesión por correo/contraseña NO está habilitado en tu proyecto. " +
      "Consola de Firebase → Authentication → Sign-in method → Email/Password → Enable.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/invalid-credential": "Credenciales incorrectas. Revisa tu correo y contraseña.",
    "auth/missing-password": "Debes ingresar tu contraseña.",
    "auth/missing-email": "Debes ingresar tu correo electrónico.",
    "auth/email-already-in-use": "Ese correo ya está registrado. Inicia sesión.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/too-many-requests": "Demasiados intentos. Intenta de nuevo más tarde.",
    "auth/network-request-failed": "Error de red. Revisa tu conexión e inténtalo de nuevo.",
    "auth/invalid-api-key": "La API key no es válida. Revisa la configuración de Firebase.",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      "La API key no es válida. Revisa la configuración de Firebase."
  };
  // El código de referer bloqueado incluye la URL, así se detecta por prefijo
  if (code.indexOf("auth/requests-from-referer") === 0) {
    return "La API key de Firebase tiene restricciones de HTTP referrer que bloquean esta página. " +
      "Consola de Google Cloud → APIs y servicios → Credenciales → API key → Restricciones de la aplicación → " +
      "HTTP referrers: agrega http://localhost:8080/* (o quita las restricciones para desarrollo local).";
  }
  // Si el código no está en la lista, lo mostramos para poder diagnosticarlo
  return map[code] || "Ocurrió un error inesperado (código: " + (code || "desconocido") + "). Inténtalo de nuevo.";
}

/* ------------------------------------------------------------
   Utilidad: traduce códigos de error de Firestore a español.
   ------------------------------------------------------------ */
function firestoreErrorMessage(error) {
  const code = (error && error.code) || "";
  const map = {
    "permission-denied": "No tienes permiso para realizar esta operación. Revisa las reglas de Firestore.",
    "unavailable": "No se pudo conectar a Firestore. Revisa tu conexión a internet.",
    "failed-precondition": "Operación inválida. Recarga la página e inténtalo de nuevo.",
    "not-found": "El documento no existe."
  };
  return map[code] || "Error de Firestore: " + (error && error.message ? error.message : "desconocido");
}
