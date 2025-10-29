// ✅ form-handler.js — handles all NoteEase forms safely and correctly

document.addEventListener("DOMContentLoaded", () => {
  console.log("📡 form-handler.js loaded and active!");

  // Helper function for form submission
  async function submitForm(event, endpoint, fieldIds) {
    event.preventDefault();

    const form = event.target;
    const data = {};

    // Collect field values
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

      // Show success message
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

  // 🚀 Change this base URL to your Railway backend URL
  const BASE_URL = "https://your-app-name.up.railway.app";

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

  // ✅ Writer Form
  const writerForm = document.getElementById("writerForm");
  if (writerForm) {
    writerForm.addEventListener("submit", (e) =>
      submitForm(e, `${BASE_URL}/api/writer`, {
        name: "writerName",
        email: "writerEmail",
        qualification: "writerEducation",
        experience: "writerMotivation",
      })
    );
    console.log("✅ writerForm active");
  }

  // ✅ Order Form
  const orderForm = document.getElementById("requestForm");
  if (orderForm) {
    orderForm.addEventListener("submit", (e) =>
      submitForm(e, `${BASE_URL}/api/order`, {
        name: "requestName",
        email: "requestEmail",
        topic: "requestTopic",
        pages: "requestPages",
        budget: "requestBudget",
        instructions: "requestMessage",
      })
    );
    console.log("✅ orderForm active");
  }
});
