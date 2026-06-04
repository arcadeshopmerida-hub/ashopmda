
(function(){
  const ENDPOINT = "https://arcade-stats.arcade-shop-merida.workers.dev/track";
  const SESSION_KEY = "asm_session_id";
  const DEBUG = false;

  function getSessionId(){
    try{
      let id = sessionStorage.getItem(SESSION_KEY);
      if(!id){
        id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    }catch(e){
      return "no-session";
    }
  }

  function safeText(el){
    return (el && (el.innerText || el.textContent) || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function productIdFrom(el){
    const card = el.closest && el.closest(".product-card[data-id]");
    if(card) return card.dataset.id;
    const modal = el.closest && el.closest(".modal-overlay[id^='modal-']");
    if(modal) return modal.id.replace("modal-", "");
    return "";
  }

  function optionFromButton(el){
    const btns = Array.from((el.parentElement || document).querySelectorAll("button"));
    const index = btns.indexOf(el);
    return index >= 0 ? String(index + 1) : "";
  }

  function eventName(el){
    if(!el) return null;

    const href = el.getAttribute && (el.getAttribute("href") || "");
    const text = safeText(el).toLowerCase();
    const pid = productIdFrom(el);

    if(href.includes("wa.me") || href.includes("whatsapp")) {
      if(el.closest(".price-card")) return "whatsapp_modal_" + (pid || "general");
      if(el.id && el.id.startsWith("wa-")) return "whatsapp_tarjeta_" + (pid || el.id.replace("wa-",""));
      return "whatsapp_contacto";
    }

    if(href.includes("facebook.com")) return "facebook_contacto";

    if(el.matches && el.matches("button[onclick*='openModal']")) return "ver_detalles_" + (pid || "producto");

    if(el.classList && el.classList.contains("close")) return "cerrar_modal_" + (pid || "producto");

    if(el.classList && el.classList.contains("gprev")) return "galeria_anterior_" + (pid || "producto");
    if(el.classList && el.classList.contains("gnext")) return "galeria_siguiente_" + (pid || "producto");
    if(el.classList && el.classList.contains("dot")) return "galeria_punto_" + (pid || "producto");

    if(el.matches && el.matches(".tab[data-filter]")) return "filtro_" + el.dataset.filter;

    if(el.closest && el.closest(".product-card") && el.closest(".option-buttons")) {
      return "selector_tarjeta_" + (pid || "producto") + "_" + optionFromButton(el);
    }

    if(el.closest && el.closest(".modal-box") && el.closest(".selector-box") && el.closest(".option-buttons")) {
      return "selector_modal_" + (pid || "producto") + "_" + optionFromButton(el);
    }

    if(href === "#equipos") return "nav_equipos";
    if(href === "#servicios") return "nav_servicios";
    if(href === "#contacto") return "nav_contacto";

    if(el.tagName === "BUTTON" || el.tagName === "A") {
      return "click_" + safeText(el).toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 60);
    }

    return null;
  }

  function send(event, el, extra){
    if(!event) return;

    const payload = {
      event,
      product: productIdFrom(el),
      text: safeText(el),
      href: el && el.getAttribute ? (el.getAttribute("href") || "") : "",
      path: location.pathname,
      url: location.href,
      session: getSessionId(),
      ts: new Date().toISOString(),
      ...extra
    };

    const qs = new URLSearchParams(payload).toString();
    const url = ENDPOINT + "?" + qs;

    if(DEBUG) console.log("[ASM analytics]", payload);

    try{
      if(navigator.sendBeacon){
        navigator.sendBeacon(url);
      }else{
        fetch(url, {method:"POST", mode:"no-cors", keepalive:true}).catch(()=>{});
      }
    }catch(e){}
  }

  function scanButtons(){
    const items = Array.from(document.querySelectorAll("a, button"));
    const summary = items.map((el, i) => ({
      i: i + 1,
      tag: el.tagName.toLowerCase(),
      text: safeText(el),
      href: el.getAttribute("href") || "",
      product: productIdFrom(el),
      event: eventName(el)
    }));

    window.ASM_ANALYTICS_SCAN = summary;

    if(DEBUG) console.table(summary);
    return summary;
  }

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){
      scanButtons();
      send("visita_pagina", document.body, {title: document.title});
    }, 0);
  });

  document.addEventListener("click", function(e){
    const el = e.target.closest && e.target.closest("a, button");
    if(!el) return;
    send(eventName(el), el);
  }, true);

  window.asmTrack = function(eventName){
    send(eventName, document.body);
  };

  window.ASM_ANALYTICS = {
    scan: scanButtons,
    send
  };
})();
