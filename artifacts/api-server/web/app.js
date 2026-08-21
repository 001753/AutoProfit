const modal = document.querySelector("#detail-modal");
const liveToast = document.querySelector("#live-toast");
let toastTimer;

function announce(message) {
  window.clearTimeout(toastTimer);
  liveToast.textContent = message;
  liveToast.classList.add("show");
  toastTimer = window.setTimeout(() => liveToast.classList.remove("show"), 3200);
}

document.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const action = actionElement.dataset.action;
  if (action === "open-modal") modal.showModal();
  if (action === "close-modal") modal.close();
  if (action === "confirm-modal") {
    modal.close();
    announce("Perubahan dikonfirmasi.");
  }
  if (action === "hide-toast") actionElement.closest(".toast-demo").hidden = true;
  if (action === "toast-success") announce("Perubahan tersimpan dengan aman.");
  if (action === "toast-info") announce("Contoh interaksi tersedia.");
  if (action === "toast-danger") announce("Tindakan dibatalkan.");
  if (action === "toggle-theme") {
    const pressed = actionElement.getAttribute("aria-pressed") === "true";
    actionElement.setAttribute("aria-pressed", String(!pressed));
    document.body.classList.toggle("soft-contrast", !pressed);
    actionElement.textContent = !pressed ? "Mode standar" : "Mode tenang";
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

document.querySelector("#sample-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector("#form-status");
  if (!form.name.value.trim()) {
    form.name.focus();
    status.textContent = "Nama perlu diisi.";
    status.style.color = "var(--red)";
    return;
  }
  status.textContent = "Form valid.";
  status.style.color = "var(--teal)";
  announce("Form berhasil divalidasi.");
});

const breakpointLabel = document.querySelector("#breakpoint-label");
const updateBreakpoint = () => {
  const width = window.innerWidth;
  breakpointLabel.textContent = width < 640 ? "Breakpoint: <640" : width < 1024 ? "Breakpoint: 640–1024" : width <= 1440 ? "Breakpoint: 1024–1440" : "Breakpoint: >1440";
};
window.addEventListener("resize", updateBreakpoint, { passive: true });
updateBreakpoint();