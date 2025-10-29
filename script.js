/* =========================================================
   NOTEASE - Main JavaScript
   Handles animations, forms, navigation & UI interactions
   ========================================================= */

// ---------- 1️⃣ Initialize AOS Animations ----------
document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }
});

// ---------- 2️⃣ Smooth Scroll for Anchor Links ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: "smooth",
      });
    }
  });
});

// ---------- 3️⃣ Navbar Active Link Highlight ----------
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll("nav a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active-link");
  }
});

// ---------- 4️⃣ Contact Form Handling ----------
const contactForm = document.getElementById("contactForm");
const contactConfirm = document.getElementById("contactConfirm");

if (contactForm && contactConfirm) {
  contactForm.addEventListener("submit", e => {
    e.preventDefault();

    contactConfirm.style.display = "block";
    contactForm.reset();

    // Hide confirmation message after 4 seconds
    setTimeout(() => {
      contactConfirm.style.display = "none";
    }, 4000);
  });
}

// ---------- 5️⃣ Optional Order Page Script (Future Use) ----------
const orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("Your order request has been submitted successfully!");
    orderForm.reset();
  });
}

// ---------- 6️⃣ Floating Social Button Hover Effect ----------
document.querySelectorAll(".social-floating a").forEach(btn => {
  btn.addEventListener("mouseenter", () => btn.classList.add("hover"));
  btn.addEventListener("mouseleave", () => btn.classList.remove("hover"));
});

// ---------- 7️⃣ Writer Application Form (if exists) ----------
const writerForm = document.getElementById("writerForm");
if (writerForm) {
  writerForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("Thank you for applying to join the NoteEase team!");
    writerForm.reset();
  });
}

// ---------- 8️⃣ Mobile Menu Toggle (Optional) ----------
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector("nav");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    menuToggle.classList.toggle("active");
  });
}
