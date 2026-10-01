// Renders a bilingual (ES/EN) one-page business site from window.SITE (config.js).
(function () {
  const S = window.SITE;
  if (!S) { document.body.innerHTML = "<p style='padding:40px'>Missing config.js</p>"; return; }

  const UI = {
    es: {
      about: "Nosotros", reviews: "Lo que dicen nuestros clientes", reviewsShort: "Reseñas", visit: "Visítanos",
      menu: "Menú", rooms: "Habitaciones", tours: "Tours", services: "Servicios",
      whatsapp: "Escríbenos por WhatsApp", book: "Reservar por WhatsApp", call: "Llamar",
      seeMenu: "Ver menú", seeRooms: "Ver habitaciones", seeTours: "Ver tours", seeServices: "Ver servicios",
      perNight: "por noche", perPerson: "por persona", reviewsOnGoogle: "reseñas en Google",
      hello: "¡Hola! Vi su sitio web y quisiera información", bookMsg: "¡Hola! Quisiera reservar",
      demo: "Sitio de demostración — creado como ejemplo. Los datos pueden no ser exactos.",
      photo: "Foto", rights: "Todos los derechos reservados.",
    },
    en: {
      about: "About us", reviews: "What our guests say", reviewsShort: "Reviews", visit: "Visit us",
      menu: "Menu", rooms: "Rooms", tours: "Tours", services: "Services",
      whatsapp: "Message us on WhatsApp", book: "Book on WhatsApp", call: "Call",
      seeMenu: "See the menu", seeRooms: "See rooms", seeTours: "See tours", seeServices: "See services",
      perNight: "per night", perPerson: "per person", reviewsOnGoogle: "reviews on Google",
      hello: "Hi! I saw your website and would like some information", bookMsg: "Hi! I'd like to book",
      demo: "Demo site — built as an example. Details may not be accurate.",
      photo: "Photo", rights: "All rights reserved.",
    },
  };

  // Which kind of offer section to show, by business type.
  const KIND = { restaurant: "menu", cafe: "menu", bar: "menu", lodging: "rooms", tours: "tours", shop: "services", services: "services" };
  const kind = KIND[S.type] || "services";

  let lang = pickLang();
  const $ = (id) => document.getElementById(id);
  const t = (v) => (v && typeof v === "object" ? (v[lang] ?? v.es ?? v.en ?? "") : (v ?? ""));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wa = (msg) => S.whatsapp ? `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}` : null;
  const stars = (n) => "★".repeat(Math.round(n || 5)).padEnd(5, "☆");

  function pickLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "es" || q === "en") return q;
    try { const saved = localStorage.getItem("lang"); if (saved) return saved; } catch (e) {}
    return (navigator.language || "es").toLowerCase().startsWith("es") ? "es" : (S.defaultLang || "es");
  }

  function applyTheme() {
    const r = document.documentElement.style;
    if (S.theme?.primary) r.setProperty("--primary", S.theme.primary);
    if (S.theme?.accent) r.setProperty("--accent", S.theme.accent);
    if (S.theme?.bg) r.setProperty("--bg", S.theme.bg);
    if (S.theme?.bgAlt) r.setProperty("--bg-alt", S.theme.bgAlt);
  }

  function render() {
    const u = UI[lang];
    document.documentElement.lang = lang;
    document.title = `${S.name} — ${t(S.tagline)}`;
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = u[el.dataset.i18n]));
    document.querySelectorAll(".lang-toggle button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));

    $("demo-banner").textContent = S.isDemo === false ? "" : u.demo;
    $("brand").textContent = S.name;
    $("nav-links").innerHTML = [["#about", u.about], ["#offer", u[kind]], ["#reviews", u.reviewsShort], ["#visit", u.visit]]
      .map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join("");

    // hero
    $("hero-eyebrow").textContent = t(S.eyebrow) || S.city || "";
    $("hero-title").textContent = S.name;
    $("hero-tagline").textContent = t(S.tagline);
    const seeKey = { menu: "seeMenu", rooms: "seeRooms", tours: "seeTours", services: "seeServices" }[kind];
    const mainCta = kind === "rooms" || kind === "tours" ? wa(`${u.bookMsg} — ${S.name}`) : wa(`${u.hello} — ${S.name}`);
    $("hero-cta").innerHTML =
      (mainCta ? `<a class="btn btn-primary" href="${mainCta}" target="_blank" rel="noopener">${esc(kind === "rooms" || kind === "tours" ? u.book : u.whatsapp)}</a>` : "") +
      `<a class="btn btn-ghost" href="#offer">${esc(u[seeKey])}</a>`;
    $("hero-rating").innerHTML = S.rating
      ? `<span class="stars">${stars(S.rating)}</span> ${S.rating} · ${Number(S.reviewCount || 0).toLocaleString(lang)} ${u.reviewsOnGoogle}` : "";

    // about
    $("about-text").textContent = t(S.about);
    const photos = S.photoLabels || [{ es: "Foto del local", en: "Our place" }, { es: "Nuestros platillos", en: "Our food" }];
    $("photo-grid").innerHTML = photos.slice(0, 2).map((p) => `<div>${esc(u.photo)}: ${esc(t(p))}</div>`).join("");

    // offer
    $("offer-title").textContent = t(S.offerTitle) || u[kind];
    $("offer-body").innerHTML = kind === "menu" ? renderMenu(u) : renderCards(u);

    // reviews
    $("review-grid").innerHTML = (S.reviews || []).map((r) =>
      `<div class="review"><div class="stars">${stars(r.stars || 5)}</div><p>“${esc(t(r.text))}”</p><cite>— ${esc(r.author || "")}</cite></div>`).join("");
    $("reviews").style.display = (S.reviews || []).length ? "" : "none";

    // visit
    $("address").textContent = S.address || "";
    $("hours").innerHTML = (S.hours || []).map((h) => `<tr><td>${esc(t(h.days))}</td><td>${esc(t(h.time))}</td></tr>`).join("");
    const links = [];
    if (S.whatsapp) links.push(`<a href="${wa(`${u.hello} — ${S.name}`)}" target="_blank" rel="noopener">WhatsApp</a>`);
    if (S.phone) links.push(`<a href="tel:${S.phone.replace(/\s/g, "")}">${esc(u.call)} ${esc(S.phone)}</a>`);
    if (S.instagram) links.push(`<a href="https://instagram.com/${S.instagram}" target="_blank" rel="noopener">Instagram</a>`);
    if (S.facebook) links.push(`<a href="https://facebook.com/${S.facebook}" target="_blank" rel="noopener">Facebook</a>`);
    $("contact-links").innerHTML = links.join("");
    $("map").src = `https://maps.google.com/maps?q=${encodeURIComponent(S.mapQuery || S.address || S.name)}&output=embed`;

    $("footer-text").textContent = `© ${new Date().getFullYear()} ${S.name}. ${u.rights}`;
    const waFloat = wa(`${u.hello} — ${S.name}`);
    $("wa-float").style.display = waFloat ? "" : "none";
    if (waFloat) $("wa-float").href = waFloat;
  }

  function renderMenu() {
    return (S.menu || []).map((g) => `
      <div class="menu-group">
        <h3>${esc(t(g.group))}</h3>
        <div class="menu-items">${(g.items || []).map((i) => `
          <div class="menu-item">
            <div><div class="name">${esc(t(i.name))}</div>${i.desc ? `<div class="desc">${esc(t(i.desc))}</div>` : ""}</div>
            <div class="price">${esc(i.price || "")}</div>
          </div>`).join("")}
        </div>
      </div>`).join("");
  }

  function renderCards(u) {
    const items = S[kind] || [];
    const unit = kind === "rooms" ? u.perNight : kind === "tours" ? u.perPerson : "";
    return `<div class="cards">${items.map((i) => {
      const link = wa(`${u.bookMsg}: ${t(i.name)} — ${S.name}`);
      return `<div class="card">
        <h3>${esc(t(i.name))}</h3>
        <p>${esc(t(i.desc))}</p>
        ${i.price ? `<div class="price">${esc(i.price)} ${unit ? `<small>${esc(unit)}</small>` : ""}</div>` : ""}
        ${link ? `<a class="btn" href="${link}" target="_blank" rel="noopener">${esc(kind === "services" ? u.whatsapp : u.book)}</a>` : ""}
      </div>`;
    }).join("")}</div>`;
  }

  document.querySelectorAll(".lang-toggle button").forEach((b) =>
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      try { localStorage.setItem("lang", lang); } catch (e) {}
      render();
    }));

  applyTheme();
  render();
})();
