// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA9T_Ai-SNZaoP7WSC3eIBHgMJHfnw5J_E",
  authDomain: "itsupportswp.firebaseapp.com",
  projectId: "itsupportswp",
  storageBucket: "itsupportswp.firebasestorage.app",
  messagingSenderId: "782971532",
  appId: "1:782971532:web:e394f211af0abe597b01a9",
  measurementId: "G-1D3N4KQ7J1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get elements (ถ้ามี)
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const statusText = document.getElementById("authStatus") || document.getElementById("userStatus");

// ✅ Login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire("สำเร็จ", "เข้าสู่ระบบเรียบร้อย", "success").then(() => {
        window.location.href = "index.html";
      });
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
    }
  });
}

// ✅ Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    Swal.fire("ออกจากระบบแล้ว", "", "success").then(() => {
      location.reload();
    });
  });
}

// ✅ Auth State
onAuthStateChanged(auth, user => {
  if (user) {
    if (loginForm) loginForm.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    if (statusText) statusText.textContent = `คุณล็อกอินเป็น: ${user.email}`;
  } else {
    if (loginForm) loginForm.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (statusText) statusText.textContent = "ยังไม่ได้เข้าสู่ระบบ";
  }
});

// เปลี่ยนจาก เข้าสู่ระบบ เป็น ออกจากระบบ
const loginLink = document.getElementById("loginLink");

onAuthStateChanged(auth, user => {
  if (user) {
    // ✅ เปลี่ยนลิงก์เป็น "ออกจากระบบ"
    if (loginLink) {
      loginLink.textContent = "ออกจากระบบ";
      loginLink.href = "#"; // ไม่ไปไหน
      loginLink.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        Swal.fire("ออกจากระบบแล้ว", "", "success").then(() => {
          location.reload();
        });
      });
    }

    if (loginForm) loginForm.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    if (statusText) statusText.textContent = `คุณล็อกอินเป็น: ${user.email}`;

  } else {
    if (loginLink) {
      loginLink.textContent = "เข้าสู่ระบบ";
      loginLink.href = "login.html";
    }

    if (loginForm) loginForm.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (statusText) statusText.textContent = "ยังไม่ได้เข้าสู่ระบบ";
  }
});