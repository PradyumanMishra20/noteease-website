// ✅ form-handler.js — handles all NoteEase forms safely and correctly

document.addEventListener("DOMContentLoaded", () => {
  console.log("📡 form-handler.js loaded and active!");

  // Helper function for JSON form submission
  async function submitForm(event, endpoint, fieldIds) {
    event.preventDefault();

    const form = event.target;
    const data = {};

    for (const [key, id] of Object.entries(fieldIds)) {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`⚠️ Missing element: ${id}`);
        continue;
      }
      data[key] = el.value.trim();
      if (!data[key]) console.warn(`⚠️ Missing value for: ${key}`);
    }

    console.log("📦 Sending Data:", data);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("✅ Server Response:", result);

      alert(result.message || "Form submitted successfully!");
      form.reset();

      const confirmMsg = form.nextElementSibling;
      if (confirmMsg && confirmMsg.classList.contains("success-msg")) {
        confirmMsg.style.display = "block";
        setTimeout(() => (confirmMsg.style.display = "none"), 4000);
      }
    } catch (err) {
      console.error("❌ Form submission error:", err);
      alert("Server error while submitting the form!");
    }
  }

  // Helper for FILE upload form (writer)
  async function submitFileForm(event, endpoint) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    console.log("📎 Sending file form data...");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log("✅ Server Response:", result);
      alert(result.message || "Form submitted successfully!");
      form.reset();
    } catch (err) {
      console.error("❌ File form submission error:", err);
      alert("Server error while submitting the form!");
    }
  }

  // 🚀 Replace this with your deployed backend URL
  const BASE_URL = "https://noteease.up.railway.app";

  // ✅ Contact Form
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) =>
      submitForm(e, `${BASE_URL}/api/contact`, {
        name: "contactName",
        email: "contactEmail",
        message: "contactMessage",
      })
    );
    console.log("✅ contactForm active");
  }

  // ✅ Writer Form (uses file upload)
  const writerForm = document.getElementById("writerForm");
  if (writerForm) {
    writerForm.addEventListener("submit", (e) =>
      submitFileForm(e, `${BASE_URL}/api/writer`)
    );
    console.log("✅ writerForm active");
  }

  // ✅ Request Form (corrected endpoint)
  const requestForm = document.getElementById("requestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", (e) =>
      submitForm(e, `${BASE_URL}/api/request`, {
        name: "requestName",
        phone: "requestPhone",
        address: "requestAddress",
        message: "requestMessage",
      })
    );
    console.log("✅ requestForm active");
  }
});
