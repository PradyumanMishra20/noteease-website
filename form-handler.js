// ✅ form-handler.js — handles all NoteEase forms safely and correctly

document.addEventListener("DOMContentLoaded", () => {
  console.log("📡 form-handler.js loaded and active!");

  const BASE_URL = "https://noteease.up.railway.app";

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
  } // ✅ ← this was missing

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
    writerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      const fd = new FormData();
      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
      };
      fd.append("name", getVal("writerName"));
      fd.append("email", getVal("writerEmail"));
      fd.append("phone", getVal("writerPhone"));
      fd.append("education", getVal("writerEducation"));
      fd.append("motivation", getVal("writerMotivation"));
      const fileEl =
        form.querySelector('input[name="writing_sample"]') ||
        document.getElementById("writing_sample") ||
        document.getElementById("writerSample") ||
        form.querySelector('input[type="file"]');
      if (fileEl && fileEl.files && fileEl.files[0]) {
        fd.append("writing_sample", fileEl.files[0]);
      }
      try {
        const res = await fetch(`${BASE_URL}/api/writer`, {
          method: "POST",
          body: fd,
        });
        const result = await res.json();
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
    });
    console.log("✅ writerForm active");
  }

  // ✅ Request Form
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
}); // ✅ ← this was also missing
