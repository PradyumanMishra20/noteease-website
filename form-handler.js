document.addEventListener("DOMContentLoaded", () => {
  console.log("📡 form-handler.js loaded and active!");

  const BASE_URL = "http://localhost:3000";

  // -------------------------
  // Generic JSON form submit helper
  // -------------------------
  async function submitForm(event, endpoint, fieldIds, isFormData = false) {
    event.preventDefault();
    const form = event.target;

    let body;
    let headers = {};

    if (isFormData) {
      // Use FormData (for writer form with file upload)
      body = new FormData();
      for (const [key, id] of Object.entries(fieldIds)) {
        const el = document.getElementById(id);
        if (el && el.value) body.append(key, el.value.trim());
      }
      // Add file if exists
      const fileInput = form.querySelector('input[type="file"]');
      if (fileInput && fileInput.files[0]) {
        body.append(fileInput.name, fileInput.files[0]);
      }
    } else {
      // Use JSON
      body = {};
      for (const [key, id] of Object.entries(fieldIds)) {
        const el = document.getElementById(id);
        body[key] = el ? el.value.trim() : "";
      }
      headers["Content-Type"] = "application/json";
    }

    console.log("📦 Sending Data to", endpoint, body);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: isFormData ? body : JSON.stringify(body),
      });

      const result = await res.json();
      console.log("✅ Server Response:", result);

      alert(result.message || "Form submitted successfully! We will contact you asap!");
      form.reset();

      // Show success message
      const confirmMsg = form.nextElementSibling;
      if (confirmMsg && confirmMsg.classList.contains("success-msg")) {
        confirmMsg.style.display = "block";
        setTimeout(() => (confirmMsg.style.display = "none"), 4000);
      }

    } catch (err) {
      console.error("❌ Form submission error:", err);
      alert(
        "Server error while submitting the form! Please try again later or contact us via WhatsApp."
      );
    }
  }

  // -------------------------
  // Contact Form
  // -------------------------
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

  // -------------------------
  // Writer Form
  // -------------------------
  const writerForm = document.getElementById("writerForm");
  if (writerForm) {
    writerForm.addEventListener("submit", (e) =>
      submitForm(
        e,
        `${BASE_URL}/api/writer`,
        {
          name: "writerName",
          email: "writerEmail",
          phone: "writerPhone",
          education: "writerEducation",
          motivation: "writerMotivation",
        },
        true // use FormData because of file
      )
    );
    console.log("✅ writerForm active");
  }

  // -------------------------
// Order Form
// -------------------------
const orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const data = {
      student_name: getVal("studentName"),
      student_email: getVal("studentEmail"),
      student_phone: getVal("studentPhone"),
      subject: getVal("subject"),
      topic: getVal("topic"),
      notes_type: getVal("notesType"),
      pages: getVal("pages"),
      deadline: getVal("deadline"),
      instructions: getVal("instructions")
    };

    // Check if any required field is empty
    for (let key in data) {
      if (!data[key] && key !== "instructions") {
        alert(`Please fill in all required fields (${key})`);
        return;
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const result = await res.json();
      alert(result.message || "Order submitted successfully!");
      orderForm.reset();

      // Show success message
      const confirmMsg = orderForm.nextElementSibling;
      if (confirmMsg && confirmMsg.classList.contains("success-msg")) {
        confirmMsg.style.display = "block";
        setTimeout(() => (confirmMsg.style.display = "none"), 4000);
      }

    } catch (err) {
      console.error("❌ Order submit error:", err);
      alert("Server error! Please try again later or contact us via WhatsApp.");
    }
  });
}

  // -------------------------
  // Request Form
  // -------------------------
  const requestForm = document.getElementById("requestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const params = new URLSearchParams();
      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
      };
      params.append("name", getVal("requestName"));
      params.append("phone", getVal("requestPhone"));
      params.append("address", getVal("requestAddress"));
      params.append("message", getVal("requestMessage"));

      fetch(`${BASE_URL}/api/request`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      })
        .then((res) => res.json())
        .then((result) => {
          alert(result.message || "Form submitted successfully!");
          form.reset();
          const confirmMsg = form.nextElementSibling;
          if (confirmMsg && confirmMsg.classList.contains("success-msg")) {
            confirmMsg.style.display = "block";
            setTimeout(() => (confirmMsg.style.display = "none"), 4000);
          }
        })
        .catch((err) => {
          console.error("❌ Request form error:", err);
          alert(
            "Server error while submitting the form! Please try again later or contact us via WhatsApp."
          );
        });
    });
    console.log("✅ requestForm active");
  }
});
