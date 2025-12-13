// auth-guard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ========= Firebase 設定 ========= */
const firebaseConfig = {
  apiKey: "AIzaSyDQziEhhw0dPu_io9sfWT-a3sADgIKFSd4",
  authDomain: "system-b4d2d.firebaseapp.com",
  projectId: "system-b4d2d"
};
/* ================================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ===== 各角色首頁 ===== */
const ROLE_HOME_PAGE = {
  user: "user.html",
  government: "gov.html",
  vendor: "vendor.html",
  admin: "admin.html"
};

/* ===== 各角色允許頁面 ===== */
const ROLE_ALLOWED_PAGES = {
  user: [
    "user.html",
    "report-create.html",
    "my-reports.html",
    "report-detail.html"
  ],
  government: [
    "gov.html",
    "report-detail.html"
  ],
  vendor: [
    "vendor.html",
    "report-detail.html"
  ],
  admin: [
    "admin.html"
  ]
};

/* ===== 登入守門 + 導頁 ===== */
onAuthStateChanged(auth, async (user) => {

  // ❌ 未登入
  if (!user) {
    location.href = "auth.html";
    return;
  }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      await signOut(auth);
      location.href = "auth.html";
      return;
    }

    const data = snap.data();

    if (data.status !== "active") {
      await signOut(auth);
      location.href = "auth.html";
      return;
    }

    const role = data.role;
    const homePage = ROLE_HOME_PAGE[role];
    const allowedPages = ROLE_ALLOWED_PAGES[role];
    const currentPage = location.pathname.split("/").pop() || "index.html";

    if (!homePage || !allowedPages) {
      await signOut(auth);
      location.href = "auth.html";
      return;
    }

    /* 🔥 關鍵：index.html 一律導向角色首頁 */
    if (currentPage === "index.html") {
      location.href = homePage;
      return;
    }

    /* ❌ 進入不屬於該角色的頁面 */
    if (!allowedPages.includes(currentPage)) {
      location.href = homePage;
      return;
    }

    // ✅ 合法頁面 → 放行

  } catch (err) {
    console.error(err);
    await signOut(auth);
    location.href = "auth.html";
  }
});
