// Live Google Business data for a site, via the official Google Maps JavaScript API
// (Places library, "Places API (New)"). Loads the business's real rating, reviews,
// photos, hours, address and phone at view time, with the attribution Google requires.
//
// Nothing here is copied or stored: Google's terms don't allow caching Places content,
// so it is fetched live in the visitor's browser. Only the Place ID is kept in config.
//
// Needs window.SITE_KEYS.googleMaps (keys.js) and SITE.googlePlaceId or SITE.googlePlaceQuery.
// See docs/google-setup.md.
(function () {
  const cache = {}; // per language: one Place Details call per language per page view
  let libPromise = null;

  function loadMapsApi(key) {
    if (libPromise) return libPromise;
    if (window.google && google.maps && google.maps.importLibrary) {  // already loaded on this page
      return (libPromise = google.maps.importLibrary("places"));
    }
    libPromise = new Promise((resolve, reject) => {
      window.__gmapsReady = () => resolve();
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__gmapsReady`;
      s.async = true;
      s.onerror = () => reject(new Error("Google Maps JavaScript API could not load"));
      document.head.append(s);
    }).then(() => google.maps.importLibrary("places"));
    return libPromise;
  }

  async function resolvePlace(Place, site, lang) {
    if (site.googlePlaceId) return new Place({ id: site.googlePlaceId, requestedLanguage: lang });
    const { places } = await Place.searchByText({
      textQuery: site.googlePlaceQuery, fields: ["id", "displayName"], language: lang, maxResultCount: 1,
    });
    if (!places || !places.length) throw new Error(`No Google place found for "${site.googlePlaceQuery}"`);
    // Log it so the ID can be pinned in the JSON (searching every view costs an extra call).
    console.info(`[google.js] "${site.googlePlaceQuery}" -> ${places[0].displayName}: googlePlaceId "${places[0].id}"`);
    return new Place({ id: places[0].id, requestedLanguage: lang });
  }

  window.loadGooglePlace = async function (site, lang) {
    const key = window.SITE_KEYS && window.SITE_KEYS.googleMaps;
    if (!key || !(site.googlePlaceId || site.googlePlaceQuery)) return null;
    if (cache[lang]) return cache[lang];

    cache[lang] = (async () => {
      const { Place } = await loadMapsApi(key);
      const place = await resolvePlace(Place, site, lang);
      await place.fetchFields({
        fields: ["displayName", "rating", "userRatingCount", "reviews", "photos", "regularOpeningHours",
                 "formattedAddress", "nationalPhoneNumber", "googleMapsURI"],
      });
      const skip = new Set(site.googlePhotoSkip || []); // indexes of photos to hide (blurry, off-topic...)
      const photos = (place.photos || [])
        .map((p, i) => ({ p, i }))
        .filter(({ i }) => !skip.has(i))
        .map(({ p }) => ({
          src: p.getURI({ maxWidth: 1600 }),
          thumb: p.getURI({ maxWidth: 800 }),
          credit: (p.authorAttributions || []).map((a) => ({ name: a.displayName, uri: a.uri })),
        }));
      return {
        name: place.displayName,
        rating: place.rating,
        count: place.userRatingCount,
        mapsUri: place.googleMapsURI,
        address: place.formattedAddress,
        phone: place.nationalPhoneNumber,
        hours: place.regularOpeningHours ? place.regularOpeningHours.weekdayDescriptions : null,
        photos,
        reviews: (place.reviews || [])
          .filter((r) => r.text)
          .map((r) => ({
            rating: r.rating,
            text: r.text,
            translated: !!(r.originalTextLanguageCode && r.textLanguageCode && r.originalTextLanguageCode !== r.textLanguageCode),
            when: r.relativePublishTimeDescription,
            author: r.authorAttribution ? r.authorAttribution.displayName : "",
            authorUri: r.authorAttribution ? r.authorAttribution.uri : "",
            authorPhoto: r.authorAttribution ? r.authorAttribution.photoURI : "",
          })),
      };
    })().catch((e) => { delete cache[lang]; throw e; });
    return cache[lang];
  };
})();
