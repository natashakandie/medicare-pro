/**
 * Tiny inline-SVG icon set (Feather-style, MIT-licensed shapes redrawn by hand)
 * so the UI has real iconography with zero extra network requests.
 * Usage in EJS: <%- icon('dashboard') %>
 */
const ICONS = {
  dashboard: '<path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/>',
  patients: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/><circle cx="18" cy="8" r="3" fill="none"/><path d="M22 21v-1.5a4 4 0 0 0-3-3.87" fill="none"/>',
  appointments: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" fill="none"/>',
  doctors: '<path d="M11 2v6a2 2 0 0 0 2 2h6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 14a5 5 0 1 0 5 5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="17" r="1.5"/>',
  pharmacy: '<path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12v6M9 15h6" stroke="currentColor" stroke-width="2"/>',
  billing: '<rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 10h20" stroke="currentColor" stroke-width="2"/><path d="M6 15h4" stroke="currentColor" stroke-width="2"/>',
  reports: '<path d="M3 3v18h18" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 15l4-5 3 3 5-7" fill="none" stroke="currentColor" stroke-width="2"/>',
  notifications: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13.7 21a2 2 0 0 1-3.4 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  staff: '<circle cx="9" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18 8h4M20 6v4" stroke="currentColor" stroke-width="2"/>',
  settings: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  search: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13.7 21a2 2 0 0 1-3.4 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 17 5-5-5-5M21 12H9" fill="none" stroke="currentColor" stroke-width="2"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2"/>',
  chevron: '<path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="2"/>',
};

function icon(name, className = "icon") {
  const body = ICONS[name] || "";
  return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${body}</svg>`;
}

module.exports = icon;
