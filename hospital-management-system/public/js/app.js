document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".mobile-nav-toggle");
  const backdrop = document.getElementById("sidebarBackdrop");

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  if (backdrop) backdrop.addEventListener("click", closeNav);

  document.querySelectorAll(".sidebar .nav-links a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.querySelectorAll("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!window.confirm(form.dataset.confirm)) event.preventDefault();
    });
  });

  document.querySelectorAll(".alert-box").forEach((box, index) => {
    if (box.classList.contains("muted")) return; // persistent DB status banner
    setTimeout(() => {
      box.style.transition = "opacity 0.3s ease, transform 0.3s ease, margin 0.3s ease, padding 0.3s ease";
      box.style.opacity = "0";
      box.style.transform = "translateY(-6px)";
      setTimeout(() => {
        box.style.margin = "0";
        box.style.padding = "0";
        box.style.height = "0";
        box.style.overflow = "hidden";
      }, 300);
    }, 5000 + index * 400);
  });
});
