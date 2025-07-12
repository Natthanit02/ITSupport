// register.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    Swal.fire("รหัสผ่านไม่ตรงกัน", "กรุณากรอกให้ตรงกัน", "warning");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    await signOut(auth); // ❗️ออกจากระบบทันทีหลังสมัคร
    Swal.fire("สำเร็จ", "สมัครสมาชิกเรียบร้อย กรุณาเข้าสู่ระบบ", "success").then(() => {
      window.location.href = "login.html";
    });
  } catch (error) {
    Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
  }
});