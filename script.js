// Site-wide script (mobile-first build).
//
// Behavior only: all visible UI is server-rendered by build.py and the
// hand-built HTML pages. This file wires event handlers to existing nodes.
// The only DOM this file creates is the lightbox overlay (modal pattern).

// --- Footer year ----------------------------------------------------------

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// --- Snipcart (modern v3.4+ install) -------------------------------------
//
// Replace publicApiKey with your real key from the Snipcart dashboard:
// Store management > API keys.
window.SnipcartSettings = {
  publicApiKey: "YOUR_SNIPCART_API_KEY",
  loadStrategy: "on-user-interaction",
  version: "3.7.1",
};

(() => {
  var c, d;
  (d = (c = window.SnipcartSettings).version) != null || (c.version = "3.0");
  var s, S;
  (S = (s = window.SnipcartSettings).timeoutDuration) != null ||
    (s.timeoutDuration = 2750);
  var l, p;
  (p = (l = window.SnipcartSettings).domain) != null ||
    (l.domain = "cdn.snipcart.com");
  var w, u;
  (u = (w = window.SnipcartSettings).protocol) != null ||
    (w.protocol = "https");
  var m =
    window.SnipcartSettings.version.includes("v3.0.0-ci") ||
    (window.SnipcartSettings.version != "3.0" &&
      window.SnipcartSettings.version.localeCompare("3.4.0", void 0, {
        numeric: true,
        sensitivity: "base",
      }) === -1);
  var f = ["focus", "mouseover", "touchmove", "scroll", "keydown"];
  window.LoadSnipcart = o;
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", r)
    : r();
  function r() {
    window.SnipcartSettings.loadStrategy
      ? window.SnipcartSettings.loadStrategy === "on-user-interaction" &&
        (f.forEach((t) => document.addEventListener(t, o)),
        setTimeout(o, window.SnipcartSettings.timeoutDuration))
      : o();
  }
  var a = false;
  function o() {
    if (a) return;
    a = true;
    let t = document.getElementsByTagName("head")[0],
      e = document.querySelector("#snipcart"),
      i = document.querySelector(
        `src[src^="${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}"][src$="snipcart.js"]`,
      ),
      n = document.querySelector(
        `link[href^="${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}"][href$="snipcart.css"]`,
      );
    e ||
      ((e = document.createElement("div")),
      (e.id = "snipcart"),
      e.setAttribute("hidden", "true"),
      document.body.appendChild(e));
    v(e);
    i ||
      ((i = document.createElement("script")),
      (i.src = `${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}/themes/v${window.SnipcartSettings.version}/default/snipcart.js`),
      (i.async = true),
      t.appendChild(i));
    n ||
      ((n = document.createElement("link")),
      (n.rel = "stylesheet"),
      (n.type = "text/css"),
      (n.href = `${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}/themes/v${window.SnipcartSettings.version}/default/snipcart.css`),
      t.prepend(n));
    f.forEach((c) => document.removeEventListener(c, o));
  }
  function v(t) {
    if (!m) return;
    t.dataset.apiKey = window.SnipcartSettings.publicApiKey;
    t.dataset.configModalStyle = "side";
  }
})();

// --- Drawer nav (behavior only; toggle is server-rendered) ---------------
(function () {
  function wireDrawer(container, menu, toggle) {
    if (!container || !menu || !toggle) return;
    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    }
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!menu.classList.contains("is-open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Inner pages: the .nav is both container and menu; its first child is
    // the server-rendered .nav-toggle button.
    var inner = document.querySelector(".nav");
    if (inner) wireDrawer(inner, inner, inner.querySelector(".nav-toggle"));
    // Home: toggle lives in .site-header; the .anchor-nav is the drawer.
    var header = document.querySelector(".site-header");
    var anchor = header && header.querySelector(".anchor-nav");
    var headerToggle = header && header.querySelector(".nav-toggle");
    if (header && anchor && headerToggle) wireDrawer(header, anchor, headerToggle);
  });
})();

// --- Sticky add-to-cart bar (product detail pages) -----------------------
//
// The bar markup is rendered by build.py (.product-sticky-cta). This module
// just toggles .is-visible via IntersectionObserver on the in-page button.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var detail = document.querySelector(".product-detail");
    var bar = document.querySelector(".product-sticky-cta");
    if (!detail || !bar) return;
    var addBtn = detail.querySelector(".snipcart-add-item");
    if (!addBtn) return;

    function show(visible) {
      bar.classList.toggle("is-visible", visible);
      bar.setAttribute("aria-hidden", String(!visible));
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          show(!entries[0].isIntersecting);
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(addBtn);
    }
  });
})();

// --- Shop controls: search + sort (shop.html) ---------------------------
//
// Controls and empty-state markup are rendered by build.py. This module
// reads the values, sorts/filters the product cards, and updates the count.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var controls = document.querySelector(".shop-controls");
    var grid = document.querySelector(".product-grid");
    if (!controls || !grid) return;

    var cards = Array.prototype.slice.call(
      grid.querySelectorAll(".product-card"),
    );
    if (cards.length < 2) return;

    var items = cards.map(function (card) {
      var nameEl = card.querySelector("h3");
      var priceEl = card.querySelector(".price");
      var priceText = priceEl
        ? priceEl.textContent.replace(/[^0-9.]/g, "")
        : "0";
      return {
        card: card,
        name: nameEl ? nameEl.textContent.trim().toLowerCase() : "",
        price: parseFloat(priceText) || 0,
      };
    });

    var searchEl = controls.querySelector("#shop-search");
    var sortEl = controls.querySelector("#shop-sort");
    var countEl = controls.querySelector("[data-shop-count]");
    var empty = document.querySelector(".shop-empty");

    function apply() {
      var q = searchEl.value.trim().toLowerCase();
      var s = sortEl.value;
      var ordered = items.slice();
      if (s === "price-asc")
        ordered.sort(function (a, b) { return a.price - b.price; });
      else if (s === "price-desc")
        ordered.sort(function (a, b) { return b.price - a.price; });
      else if (s === "name")
        ordered.sort(function (a, b) { return a.name.localeCompare(b.name); });

      ordered.forEach(function (it) { grid.appendChild(it.card); });

      var visible = 0;
      ordered.forEach(function (it) {
        var match = !q || it.name.indexOf(q) !== -1;
        it.card.classList.toggle("is-hidden", !match);
        if (match) visible++;
      });
      if (countEl) countEl.textContent = visible + " of " + items.length;
      if (empty) empty.hidden = visible !== 0;
    }

    searchEl.addEventListener("input", apply);
    sortEl.addEventListener("change", apply);
    apply();
  });
})();

// --- Quantity selector (product detail pages) ---------------------------
//
// The stepper markup is rendered by build.py (.qty-selector). This module
// wires the +/- buttons and syncs data-item-quantity to every Snipcart
// button on the page (including the sticky-bar's duplicate).
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.querySelector(".qty-selector");
    if (!wrap) return;
    var input = wrap.querySelector("input");
    if (!input) return;

    function syncAll() {
      var v = Math.max(1, Math.min(99, parseInt(input.value, 10) || 1));
      input.value = v;
      var all = document.querySelectorAll(".snipcart-add-item");
      for (var i = 0; i < all.length; i++)
        all[i].setAttribute("data-item-quantity", v);
    }

    wrap.querySelectorAll("button[data-qty]").forEach(function (b) {
      b.addEventListener("click", function () {
        input.value =
          (parseInt(input.value, 10) || 1) +
          parseInt(b.getAttribute("data-qty"), 10);
        syncAll();
      });
    });
    input.addEventListener("input", syncAll);
    input.addEventListener("change", syncAll);
    syncAll();
  });
})();

// --- Image lightbox (product detail pages) -------------------------------
//
// The lightbox is a modal overlay; per standard practice it is JS-created
// (not in the document at rest). Click/Enter/Space the detail image to open.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var img = document.querySelector(".product-detail-img");
    if (!img) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">✕</button>' +
      '<img alt="" />';
    document.body.appendChild(box);

    var bigImg = box.querySelector("img");
    var closeBtn = box.querySelector(".lightbox-close");

    function open() {
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt || "";
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
    }
    function close() {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
    }

    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.addEventListener("click", open);
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
    closeBtn.addEventListener("click", close);
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("is-open")) close();
    });
  });
})();
