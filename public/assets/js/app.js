import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let isAdmin = false;
const ADMIN_EMAILS = ["it.swp01@gmail.com", "admin2@example.com", "admin3@example.com"];

onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = user && ADMIN_EMAILS.includes(user.email);

  if (user) {
    console.log("\u2705 currentUser:", user.email);
  } else {
    console.log("\u274C ผู้ใช้ไม่ได้ล็อกอิน");
  }

  const adminLink = document.getElementById("adminLink");
  if (adminLink) {
    adminLink.style.display = isAdmin ? "block" : "none";
  }

  cleanupOldBookings();
});

const form = document.getElementById("bookingForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userNameInput = document.getElementById("userName");
    const roomId = document.getElementById("roomSelect").value;
    const date = document.getElementById("dateInput").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    const user = userNameInput.value.trim();

    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกชื่อผู้จอง',
      });
      return;
    }

    Swal.fire({
      html: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("roomId", "==", roomId), where("date", "==", date));
      const snapshot = await getDocs(q);

      const conflict = snapshot.docs.some(doc => {
        const data = doc.data();
        return (startTime < data.endTime && endTime > data.startTime);
      });

      Swal.close();

      if (conflict) {
        Swal.fire({
          icon: "error",
          title: "ห้องถูกจองแล้ว",
          text: "\u274C ห้องถูกจองในช่วงเวลาดังกล่าวแล้ว กรุณาเลือกเวลาอื่น",
          confirmButtonText: "ตกลง"
        });
        return;
      }

      await addDoc(bookingsRef, {
        roomId,
        user,
        date,
        startTime,
        endTime,
        uid: currentUser ? currentUser.uid : null,
        isGuest: currentUser ? false : true,
      });

      Swal.fire({
        icon: "success",
        title: "จองห้องสำเร็จ!",
        confirmButtonText: "ตกลง",
        customClass: { confirmButton: 'swal-ok-btn' }
      });

      form.reset();
    } catch (error) {
      console.error(error);
      Swal.close();
      Swal.fire({
        icon: "warning",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถจองห้องได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        customClass: { confirmButton: 'swal-ok-btn' }
      });
    }
  });
}

// แสดงสถานะห้องประชุม
async function checkRoomStatusNow() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  function formatThaiDate(dateStr) {
    const [yyyy, mm, dd] = dateStr.split("-");
    const buddhistYear = parseInt(yyyy) + 543;
    return `${dd}/${mm}/${buddhistYear}`;
  }

  const rooms = [
    "ห้องประชุม SWP",
    "ห้องประชุม Moshi & DIY",
    "ห้องประชุม GM",
    "ห้องประชุม MD",
    "ห้องประชุม ERP",
    "ห้องประชุม QM",
    "ห้องประ ESK",
    "ห้องอบรมสัมมนา"
  ];

  const roomStatusList = document.getElementById("roomStatus");
  if (!roomStatusList) return;

  let statusHtml = "";
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("date", ">=", today));
  const snapshot = await getDocs(q);

  for (const roomId of rooms) {
    const roomBookings = snapshot.docs.map(doc => doc.data()).filter(data => data.roomId === roomId);
    const isOccupied = roomBookings.some(data => data.date === today && data.startTime <= currentTime && data.endTime > currentTime);

    let statusText = "";
    let color = isOccupied ? 'red' : 'green';

    if (isOccupied) {
      statusText = `\u274C ${roomId}: ไม่ว่าง`;
    } else {
      const nextBooking = roomBookings.filter(b => b.date > today || (b.date === today && b.startTime > currentTime)).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0];
      statusText = nextBooking ? `\u2705 ${roomId}: ว่าง (รอบถัดไป: วันที่ ${formatThaiDate(nextBooking.date)} ${nextBooking.startTime} - ${nextBooking.endTime})` : `\u2705 ${roomId}: ว่าง (ไม่มีรอบถัดไป)`;
    }

    statusHtml += `<p style=\"color:${color}; margin: 4px 0;\">${statusText}</p>`;
  }

  roomStatusList.innerHTML = statusHtml;
}

checkRoomStatusNow();
setInterval(checkRoomStatusNow, 60000);

// ลบข้อมูลย้อนหลัง --------------------------------------------------------------------------------------
async function cleanupOldBookings() {
  console.log("\uD83E\uDEC1 เรียก cleanupOldBookings()");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingsRef = collection(db, "bookings");
  const snapshot = await getDocs(bookingsRef);

  let deleteCount = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!data.date) continue;

    const bookingDate = new Date(`${data.date}T00:00:00`);
    if (!isNaN(bookingDate) && bookingDate < today) {
      await deleteDoc(doc(db, "bookings", docSnap.id));
      deleteCount++;
    }
  }

  if (deleteCount > 0) {
    console.log(`\uD83D\uDDD1\uFE0F ลบข้อมูลการจองย้อนหลัง ${deleteCount} รายการแล้ว`);
  }
}

// naveigation menu toggle -----------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('nav .link');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
});