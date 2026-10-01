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
      perBed: "por cama / noche", choose: "Elegir", checkDates: "Ver fechas y precios",
      bookTitle: "Solicitar reserva", checkin: "Llegada", checkout: "Salida", room: "Habitación", guests: "Huéspedes",
      guestsShort: "personas", yourName: "Su nombre", nameLabel: "Nombre", estimate: "total estimado", estimateTotal: "Total estimado",
      requestBtn: "Enviar solicitud por WhatsApp", nightsLabel: (n) => `${n} ${n === 1 ? "noche" : "noches"}`,
      bookingNote: "Sin pago en línea. Le confirmamos disponibilidad por WhatsApp, normalmente en menos de una hora.",
      askConfirm: "¿Tienen disponibilidad? ¡Gracias!",
      errDates: "Elija una fecha de salida posterior a la de llegada.", errMin: (n) => `Estadía mínima: ${n} noches.`,
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
      perBed: "per bed / night", choose: "Choose", checkDates: "Check dates & prices",
      bookTitle: "Request a booking", checkin: "Check-in", checkout: "Check-out", room: "Room", guests: "Guests",
      guestsShort: "guests", yourName: "Your name", nameLabel: "Name", estimate: "estimated total", estimateTotal: "Estimated total",
      requestBtn: "Send request on WhatsApp", nightsLabel: (n) => `${n} ${n === 1 ? "night" : "nights"}`,
      bookingNote: "No online payment. We confirm availability on WhatsApp, usually within an hour.",
      askConfirm: "Do you have availability? Thanks!",
      errDates: "Pick a check-out date after check-in.", errMin: (n) => `Minimum stay: ${n} nights.`,
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
    const mainCta = kind === "tours" ? wa(`${u.bookMsg} — ${S.name}`) : wa(`${u.hello} — ${S.name}`);
    $("hero-cta").innerHTML =
      (kind === "rooms" ? `<a class="btn btn-primary" href="#book">${esc(u.checkDates)}</a>`
        : mainCta ? `<a class="btn btn-primary" href="${mainCta}" target="_blank" rel="noopener">${esc(kind === "tours" ? u.book : u.whatsapp)}</a>` : "") +
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
    if (kind === "rooms") wireBooking(u);

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
    const rooms = kind === "rooms";
    const unitOf = (i) => rooms ? (i.perPerson ? u.perBed : u.perNight) : kind === "tours" ? u.perPerson : "";
    const cards = `<div class="cards">${items.map((i, idx) => {
      const unit = unitOf(i);
      const button = rooms
        ? `<a class="btn" href="#book" data-pick-room="${idx}">${esc(u.choose)}</a>`
        : (() => { const link = wa(`${u.bookMsg}: ${t(i.name)} — ${S.name}`);
            return link ? `<a class="btn" href="${link}" target="_blank" rel="noopener">${esc(kind === "services" ? u.whatsapp : u.book)}</a>` : ""; })();
      return `<div class="card">
        <h3>${esc(t(i.name))}</h3>
        <p>${esc(t(i.desc))}</p>
        ${i.price ? `<div class="price">${esc(i.price)} ${unit ? `<small>${esc(unit)}</small>` : ""}</div>` : ""}
        ${button}
      </div>`;
    }).join("")}</div>`;
    return rooms ? cards + renderBookingForm(u, items) : cards;
  }

  // ---- Booking request form (rooms) -------------------------------------
  // Collects dates / room / guests, shows an estimated total, and opens WhatsApp
  // with the request pre-filled. The owner confirms availability by reply.
  const bk = { checkin: "", checkout: "", room: 0, guests: 2, name: "" }; // survives language switches
  const priceNum = (p) => Number(String(p || "").replace(/[^0-9.]/g, "")) || 0;
  const currency = (p) => (String(p || "").match(/^[^0-9]*/) || [""])[0].trim() || "Q";
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseDay = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  function renderBookingForm(u, rooms) {
    const today = new Date();
    if (!bk.checkin) { bk.checkin = isoDay(addDays(today, 7)); bk.checkout = isoDay(addDays(today, 9)); }
    const maxGuests = S.booking?.maxGuests || 6;
    return `
    <form class="booking" id="book" novalidate>
      <h3>${esc(u.bookTitle)}</h3>
      <div class="booking-grid">
        <label>${esc(u.checkin)}<input type="date" name="checkin" min="${isoDay(today)}" value="${bk.checkin}" required></label>
        <label>${esc(u.checkout)}<input type="date" name="checkout" min="${isoDay(addDays(today, 1))}" value="${bk.checkout}" required></label>
        <label class="room-field">${esc(u.room)}<select name="room">${rooms.map((r, i) =>
          `<option value="${i}" ${i === bk.room ? "selected" : ""}>${esc(t(r.name))}${r.price ? ` — ${esc(r.price)}` : ""}</option>`).join("")}</select></label>
        <label>${esc(u.guests)}<select name="guests">${Array.from({ length: maxGuests }, (_, k) => k + 1).map((n) =>
          `<option ${n === bk.guests ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label class="wide">${esc(u.yourName)}<input type="text" name="name" value="${esc(bk.name)}" autocomplete="name"></label>
      </div>
      <div class="booking-summary" id="booking-summary" aria-live="polite"></div>
      <button class="btn btn-book" type="submit">${esc(u.requestBtn)}</button>
      <p class="booking-note">${esc(t(S.booking?.note) || u.bookingNote)}</p>
    </form>`;
  }

  function quote(u) {
    const room = (S.rooms || [])[bk.room] || {};
    if (!bk.checkin || !bk.checkout) return { error: u.errDates };
    const nights = Math.round((parseDay(bk.checkout) - parseDay(bk.checkin)) / 86400000);
    if (nights < 1) return { error: u.errDates };
    const minN = S.booking?.minNights || 1;
    if (nights < minN) return { error: u.errMin(minN) };
    const units = room.perPerson ? bk.guests : 1;
    const total = priceNum(room.price) * nights * units;
    return { room, nights, total, cur: currency(room.price) };
  }

  function wireBooking(u) {
    const form = $("book");
    if (!form) return;
    const summary = $("booking-summary");
    const fmtDate = (s) => parseDay(s).toLocaleDateString(lang === "es" ? "es-GT" : "en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    const money = (cur, n) => `${cur}${n.toLocaleString(lang === "es" ? "es-GT" : "en-US")}`;

    const update = () => {
      bk.checkin = form.checkin.value; bk.checkout = form.checkout.value;
      bk.room = Number(form.room.value); bk.guests = Number(form.guests.value); bk.name = form.name.value;
      if (bk.checkin) form.checkout.min = isoDay(addDays(parseDay(bk.checkin), 1));
      const q = quote(u);
      summary.classList.toggle("error", !!q.error);
      summary.innerHTML = q.error ? esc(q.error)
        : `${esc(u.nightsLabel(q.nights))} × ${esc(q.room.price)}${q.room.perPerson ? ` × ${bk.guests} ${esc(u.guestsShort)}` : ""}
           = <strong>${esc(money(q.cur, q.total))}</strong> <small>${esc(u.estimate)}</small>`;
      return q;
    };

    form.addEventListener("input", update);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = update();
      if (q.error) return;
      const lines = [
        `${u.bookMsg} — ${S.name}:`,
        `• ${u.room}: ${t(q.room.name)}`,
        `• ${u.checkin}: ${fmtDate(bk.checkin)}`,
        `• ${u.checkout}: ${fmtDate(bk.checkout)} (${u.nightsLabel(q.nights)})`,
        `• ${u.guests}: ${bk.guests}`,
        `• ${u.estimateTotal}: ${money(q.cur, q.total)}`,
      ];
      if (bk.name.trim()) lines.push(`${u.nameLabel}: ${bk.name.trim()}`);
      lines.push(u.askConfirm);
      const link = wa(lines.join("\n"));
      if (link) window.open(link, "_blank", "noopener");
    });

    document.querySelectorAll("[data-pick-room]").forEach((a) => a.addEventListener("click", () => {
      form.room.value = a.dataset.pickRoom;
      update();
    }));
    update();
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
