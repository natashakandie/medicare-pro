/**
 * Role-based access map. Admin can reach everything.
 * Each page lists the roles that may open it; the sidebar and route guards share this map.
 */
const ROLES = ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Patient"];

const PAGES = [
  { key: "dashboard", label: "Overview", href: "/dashboard", roles: ROLES },
  { key: "patients", label: "Patients", href: "/patients", roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
  { key: "appointments", label: "Appointments", href: "/appointments", roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Patient"] },
  { key: "doctors", label: "Doctors", href: "/doctors", roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Patient"] },
  { key: "staff", label: "Staff", href: "/staff", roles: ["Admin"] },
  { key: "pharmacy", label: "Pharmacy", href: "/pharmacy", roles: ["Admin", "Pharmacist", "Doctor", "Nurse"] },
  { key: "billing", label: "Billing", href: "/billing", roles: ["Admin", "Receptionist", "Patient"] },
  { key: "reports", label: "Reports", href: "/reports", roles: ["Admin", "Doctor", "Pharmacist"] },
  { key: "notifications", label: "Notifications", href: "/notifications", roles: ROLES },
  { key: "settings", label: "Settings", href: "/settings", roles: ROLES },
];

function rolesFor(pageKey) {
  const page = PAGES.find((item) => item.key === pageKey);
  return page ? page.roles : ROLES;
}

function canAccess(role, pageKey) {
  if (role === "Admin") return true;
  return rolesFor(pageKey).includes(role);
}

function pagesFor(role) {
  return PAGES.filter((page) => canAccess(role, page.key));
}

module.exports = { ROLES, PAGES, rolesFor, canAccess, pagesFor };
