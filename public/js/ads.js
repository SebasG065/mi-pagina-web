let adsConfigPromise = null;

function getAdsConfig() {
  if (!adsConfigPromise) {
    adsConfigPromise = fetch("/api/ads-config")
      .then((res) => res.json())
      .catch(() => ({ clientId: "", slots: {} }));
  }
  return adsConfigPromise;
}

function loadAdsenseScript(clientId) {
  if (document.querySelector("script[data-adsbygoogle-loader]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  script.crossOrigin = "anonymous";
  script.dataset.adsbygoogleLoader = "true";
  document.head.appendChild(script);
}

function renderAdPlaceholder(container) {
  container.classList.add("ad-slot", "ad-placeholder");
  container.textContent = "Espacio publicitario (configura tu AdSense en data/config.json)";
}

async function renderAdSlot(container, slotKey) {
  if (!container) return;
  const { clientId, slots } = await getAdsConfig();
  const slotId = slots ? slots[slotKey] : "";

  if (!clientId || !slotId) {
    renderAdPlaceholder(container);
    return;
  }

  loadAdsenseScript(clientId);

  container.classList.add("ad-slot");
  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.style.display = "block";
  ins.dataset.adClient = clientId;
  ins.dataset.adSlot = slotId;
  ins.dataset.adFormat = "auto";
  ins.dataset.fullWidthResponsive = "true";
  container.appendChild(ins);

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (error) {
    // El script de AdSense puede no estar listo aún; se ignora el error silenciosamente.
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-ad-slot-key]").forEach((el) => {
    renderAdSlot(el, el.dataset.adSlotKey);
  });
});
