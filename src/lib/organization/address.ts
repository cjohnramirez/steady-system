/**
 * The campus street address. The organization row only stores the office's room
 * (`office_location`), which is shown beneath this; the maps link searches for
 * the campus, since a room name alone finds nothing.
 */
export const CAMPUS_ADDRESS =
  "Claro M. Recto Avenue, Lapasan 9000 Cagayan de Oro City, Philippines";

export const campusMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CAMPUS_ADDRESS)}`;
