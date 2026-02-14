export function getDateString(date, time) {
  const now = new Date();
  const postDate = new Date(`${date} ${time}`);
  const diffTime = Math.abs(now - postDate);
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffYears = Math.floor(diffSeconds / (60 * 60 * 24 * 365));
  const diffDays = Math.floor(diffSeconds / (60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffHours = Math.floor(diffSeconds / (60 * 60));
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffYears >= 1) {
    return `${diffYears}y`;
  }
  if (diffMonths >= 1) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  }
  if (diffDays >= 1) {
    return `${diffDays}d`;
  }
  if (diffHours >= 1) {
    return `${diffHours}h`;
  }
  if (diffMinutes >= 1) {
    return `${diffMinutes}m`;
  }
  if (diffSeconds >= 1) {
    return `${diffSeconds}s`;
  }
  return "just now";
}
