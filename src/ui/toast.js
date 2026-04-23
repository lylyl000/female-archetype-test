let timer = null;

export function showToast(message, ms = 1600) {
  let el = document.querySelector("[data-toast]");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("data-toast", "true");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");

  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    el.classList.remove("show");
  }, ms);
}

