export function initNavigation() {
  const toggle = document.querySelector("#menuToggle");
  const nav = document.querySelector("#navLinks");
  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      close();
      toggle.focus();
    }
  });
}

export function initPreferences() {
  const themeButton = document.querySelector("#themeToggle");
  let theme = "dark";
  try {
    theme = localStorage.getItem("ignouos-theme") || "dark";
  } catch {
    /* optional preference */
  }
  const applyTheme = () => {
    document.body.classList.toggle("light-theme", theme === "light");
    themeButton.setAttribute(
      "aria-label",
      theme === "light" ? "Switch to dark theme" : "Switch to light theme",
    );
    themeButton.textContent = theme === "light" ? "☾" : "☼";
  };
  applyTheme();
  themeButton.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme();
    try {
      localStorage.setItem("ignouos-theme", theme);
    } catch {
      /* preference is optional */
    }
  });

  const key = "ignouos-contribution-checklist";
  const checks = [
    ...document.querySelectorAll(".checklist input[type=checkbox]"),
  ];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    checks.forEach((check, index) => {
      check.checked = Boolean(saved[index]);
    });
  } catch {
    /* optional preference */
  }
  const persist = () => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(checks.map((check) => check.checked)),
      );
    } catch {
      /* optional preference */
    }
  };
  checks.forEach((check) => check.addEventListener("change", persist));
  document.querySelector("#resetChecklist").addEventListener("click", () => {
    checks.forEach((check) => {
      check.checked = false;
    });
    persist();
  });
}

export function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, current) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          current.unobserve(entry.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
  );
  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 5, 4) * 65}ms`;
    observer.observe(item);
  });
}

export function toast(message) {
  const region = document.querySelector("#toastRegion");
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.remove(), 3200);
}
