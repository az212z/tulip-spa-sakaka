const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const menuButton = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("[data-nav-menu]");
const revealItems = document.querySelectorAll("[data-reveal]");
const bookingForm = document.querySelector("[data-booking-form]");
const bookingResult = document.querySelector("[data-booking-result]");
const serviceSelect = bookingForm?.querySelector('select[name="service"]');
const pickButtons = document.querySelectorAll("[data-pick-service]");
const publicPhone = "966538533309";

document.body.classList.add("reveal-ready");

function setScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 12);
  if (progress) {
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  }
}

window.addEventListener("scroll", setScrollState, { passive: true });
setScrollState();

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.classList.toggle("is-open", !isOpen);
  navMenu?.classList.toggle("is-open", !isOpen);
});

navMenu?.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement) {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.classList.remove("is-open");
    navMenu.classList.remove("is-open");
  }
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

pickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const service = button.getAttribute("data-pick-service") || "";
    if (serviceSelect) {
      serviceSelect.value = service;
    }
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function createButton(label, href, variant = "secondary") {
  const link = document.createElement("a");
  link.className = `button button-${variant}`;
  link.href = href;
  link.textContent = label;
  if (href.startsWith("https://")) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function buildBookingMessage(data) {
  return [
    "السلام عليكم، أرغب بحجز موعد في سبا توليب سكاكا.",
    `الاسم: ${data.get("name")}`,
    `رقم التواصل: ${data.get("phone")}`,
    `الخدمة: ${data.get("service")}`,
    `الوقت المفضل: ${data.get("time")}`,
    "أرجو تأكيد التوفر والسعر النهائي. شكرًا لكم."
  ].join("\n");
}

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const message = buildBookingMessage(formData);
  const whatsAppUrl = `https://wa.me/${publicPhone}?text=${encodeURIComponent(message)}`;

  if (!bookingResult) return;
  bookingResult.hidden = false;
  bookingResult.replaceChildren();

  const title = document.createElement("p");
  title.textContent = "رسالة الحجز جاهزة";

  const textarea = document.createElement("textarea");
  textarea.readOnly = true;
  textarea.value = message;
  textarea.setAttribute("aria-label", "نص رسالة الحجز");

  const actions = document.createElement("div");
  actions.className = "result-actions";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "button button-secondary";
  copyButton.textContent = "نسخ الرسالة";
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(message);
      copyButton.textContent = "تم النسخ";
      window.setTimeout(() => {
        copyButton.textContent = "نسخ الرسالة";
      }, 2200);
    } catch {
      textarea.focus();
      textarea.select();
    }
  });

  actions.append(
    copyButton,
    createButton("إرسال رسالة جاهزة", whatsAppUrl, "primary"),
    createButton("اتصال مباشر", "tel:+966538533309", "secondary")
  );

  bookingResult.append(title, textarea, actions);
  bookingResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
