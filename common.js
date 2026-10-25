import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, IMGBB_API_KEY } from "./config.js";

export const configured = !String(firebaseConfig.apiKey).startsWith("ISI_");
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { IMGBB_API_KEY };

export const CATS = ["Game", "Produktivitas", "Sosial", "Hiburan", "Edukasi", "Alat", "Lainnya"];

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const safeUrl = u => (/^https?:\/\//i.test(u) ? u : "#");
export const sizeText = a => `${a.sizeValue} ${a.sizeUnit}`;
export const icon = a => a.iconUrl
  ? `<img class="ic" src="${esc(safeUrl(a.iconUrl))}" alt="" loading="lazy" referrerpolicy="no-referrer">`
  : `<div class="ic ph">${esc((a.name || "?")[0])}</div>`;

export function toast(msg, ok = true) {
  const t = document.createElement("div");
  t.className = "toast " + (ok ? "ok" : "err");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

export function validateApp(d) {
  if (d.name.length < 2 || d.name.length > 40) return "Nama aplikasi 2–40 karakter.";
  if (!CATS.includes(d.category)) return "Pilih kategori.";
  if (d.description.length < 20 || d.description.length > 1000) return "Deskripsi 20–1000 karakter.";
  if (!d.version || d.version.length > 20) return "Versi wajib diisi (maks. 20 karakter).";
  if (!(d.sizeValue > 0 && d.sizeValue < 100000)) return "Ukuran tidak valid.";
  if (!["MB", "GB"].includes(d.sizeUnit)) return "Satuan ukuran harus MB atau GB.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.supportEmail) || d.supportEmail.length > 100) return "Email dukungan tidak valid.";
  if (!/^https?:\/\/\S+$/i.test(d.downloadUrl) || d.downloadUrl.length > 500) return "Link download harus diawali http:// atau https://";
  return null;
}

export function validateUpd(d) {
  if (!d.version || d.version.length > 20) return "Versi wajib diisi (maks. 20 karakter).";
  if (!(d.sizeValue > 0 && d.sizeValue < 100000)) return "Ukuran tidak valid.";
  if (!["MB", "GB"].includes(d.sizeUnit)) return "Satuan ukuran harus MB atau GB.";
  if (!/^https?:\/\/\S+$/i.test(d.downloadUrl) || d.downloadUrl.length > 500) return "Link download harus diawali http:// atau https://";
  return null;
}
