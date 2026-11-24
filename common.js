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
  if (d.videoUrl && !parseVideo(d.videoUrl)) return "Link video harus YouTube atau TikTok (format .../video/angka).";
  if (d.screenshots && d.screenshots.length > 6) return "Screenshot maksimal 6 gambar.";
  return null;
}

export function validateUpd(d) {
  if (!d.version || d.version.length > 20) return "Versi wajib diisi (maks. 20 karakter).";
  if (!(d.sizeValue > 0 && d.sizeValue < 100000)) return "Ukuran tidak valid.";
  if (!["MB", "GB"].includes(d.sizeUnit)) return "Satuan ukuran harus MB atau GB.";
  if (!/^https?:\/\/\S+$/i.test(d.downloadUrl) || d.downloadUrl.length > 500) return "Link download harus diawali http:// atau https://";
  return null;
}

// ---- Statistik, rating, video ----
export const fmtCount = n => {
  n = Number(n) || 0;
  const f = (v, u) => v.toFixed(1).replace(/\.0$/, "").replace(".", ",") + " " + u;
  return n >= 1e6 ? f(n / 1e6, "jt") : n >= 1e3 ? f(n / 1e3, "rb") : String(n);
};
export const fmtAvg = v => (Number(v) || 0).toFixed(1).replace(".", ",");
export const stars = v => `<span class="stars" style="--p:${Math.max(0, Math.min(5, v)) / 5 * 100}%" aria-label="${fmtAvg(v)} dari 5">★★★★★</span>`;

// Terima link YouTube / TikTok (bentuk panjang). Link pendek TikTok (vm.tiktok.com) tidak bisa di-embed.
export function parseVideo(u) {
  u = String(u || "").trim();
  let m = u.match(/^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})(?:[?&#/]|$)/);
  if (m) return { type: "yt", id: m[1], thumb: `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`, embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0` };
  m = u.match(/^https:\/\/(?:www\.)?tiktok\.com\/@[\w.\-]+\/video\/(\d{8,25})/);
  if (m) return { type: "tt", id: m[1], thumb: "", embed: `https://www.tiktok.com/player/v1/${m[1]}?autoplay=1` };
  return null;
}
