// Sincronización con la nube (Firebase): login con Google y progreso en Firestore, en users/{uid}.
// La app funciona igual sin esto (por ejemplo, offline): solo se agrega la sección «Cuenta» en Ajustes.
// Estrategia: al entrar (y al volver a la app) se baja el progreso remoto y se combina con el local
// (E.store.merge, sin perder nada); cada cambio local se sube al rato (debounce).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// configuración pública de la app web (no es secreta: el acceso lo controlan las reglas de Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyBsvH3PCOiwAMt14ob9fk6yqsgrm11_PY4",
  authDomain: "efecen-46bfd.firebaseapp.com",
  projectId: "efecen-46bfd",
  storageBucket: "efecen-46bfd.firebasestorage.app",
  messagingSenderId: "747552107375",
  appId: "1:747552107375:web:43b62755c914888536969a"
};

const E = window.Efecen;
const fb = initializeApp(firebaseConfig);
const auth = getAuth(fb);
auth.languageCode = "es";
const db = getFirestore(fb);

const sync = E.sync = {
  user: null, busy: false, pending: false, error: null, lastSync: null,
  changed() { if (sync.user) schedule(); },
  async signIn() {
    sync.busy = true; sync.error = null; notify();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try { await signInWithPopup(auth, provider); }
    catch (e) {
      // si el navegador no deja abrir ventanas (algunas apps instaladas), se hace por redirección
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(e.code)) { await signInWithRedirect(auth, provider); return; }
      if (e.code !== "auth/popup-closed-by-user") sync.error = "No se pudo entrar: " + (e.code || e.message);
    }
    sync.busy = false; notify();
  },
  async signOut() { await flush(); await signOut(auth); }
};
const notify = () => E.syncHooks && E.syncHooks.status();
const ref = () => doc(db, "users", sync.user.uid);

let timer = null;
function schedule() { sync.pending = true; clearTimeout(timer); timer = setTimeout(push, 2000); notify(); }
async function push() {
  if (!sync.user) return;
  clearTimeout(timer);
  try {
    await setDoc(ref(), { data: JSON.stringify(E.syncHooks.get()), updatedAt: serverTimestamp(), app: "efecen" });
    sync.pending = false; sync.error = null; sync.lastSync = Date.now();
  } catch (e) { sync.error = navigator.onLine ? "No se pudo guardar en la nube (" + (e.code || e.message) + ")" : "Sin conexión: se sube cuando vuelva."; }
  notify();
}
const flush = () => (sync.pending ? push() : Promise.resolve());

// baja lo remoto, lo combina con lo local y sube el resultado
async function pull() {
  if (!sync.user) return;
  try {
    const snap = await getDoc(ref());
    const local = E.syncHooks.get();
    let merged = local;
    if (snap.exists()) {
      const remote = JSON.parse(snap.data().data);
      if (E.store.valid(remote)) merged = E.store.merge(local, remote);
    }
    if (JSON.stringify(merged) !== JSON.stringify(local)) E.syncHooks.set(merged);
    await push();
  } catch (e) { sync.error = navigator.onLine ? "No se pudo sincronizar (" + (e.code || e.message) + ")" : "Sin conexión: se sincroniza cuando vuelva."; notify(); }
}

getRedirectResult(auth).catch(e => { sync.error = "No se pudo entrar: " + (e.code || e.message); notify(); });
onAuthStateChanged(auth, u => {
  sync.user = u ? { uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL } : null;
  sync.busy = false; sync.lastSync = null;
  notify();
  if (u) pull();
});
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") pull(); else flush(); });
window.addEventListener("online", () => { if (sync.user) pull(); });
notify();
