const DATE_OPTIONS = { year: "numeric", month: "short", day: "numeric" };
const TIME_OPTIONS = { hour: "2-digit", minute: "2-digit" };

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  // MySQL returns "YYYY-MM-DD HH:MM:SS"; make it ISO-ish so Date parses it as local time.
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);
  return date ? date.toLocaleDateString("en-GB", DATE_OPTIONS) : "-";
}

function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "-";
  return `${date.toLocaleDateString("en-GB", DATE_OPTIONS)}, ${date.toLocaleTimeString("en-GB", TIME_OPTIONS)}`;
}

function formatTime(value) {
  const date = toDate(value);
  return date ? date.toLocaleTimeString("en-GB", TIME_OPTIONS) : "-";
}

function formatMoney(value, currency = "KES") {
  const amount = Number(value) || 0;
  return `${currency} ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function relativeTime(value) {
  const date = toDate(value);
  if (!date) return String(value || "");
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return minutes > 0 ? `${minutes} min ago` : `in ${-minutes} min`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return hours > 0 ? `${hours} h ago` : `in ${-hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days === -1) return "tomorrow";
  return days > 0 ? `${days} days ago` : `in ${-days} days`;
}

function ageFrom(dateOfBirth) {
  const date = toDate(dateOfBirth);
  if (!date) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const beforeBirthday =
    now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** Value for <input type="datetime-local"> from a Date or MySQL string. */
function toInputDateTime(value) {
  const date = toDate(value) || new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function initials(name = "") {
  return String(name)
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

module.exports = { toDate, formatDate, formatDateTime, formatTime, formatMoney, relativeTime, ageFrom, toInputDateTime, initials };
