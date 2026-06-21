export function isDarkInJapan(): boolean {
  const now = new Date();
  // JST = UTC+9
  const jstHour = ((now.getUTCHours() + 9) % 24) + now.getUTCMinutes() / 60;
  // Approximate sunset hour in Tokyo (35.6°N)
  // Winter (Dec solstice): ~16.5h / Summer (Jun solstice): ~19.2h
  const dayOfYear = Math.floor((+now - +new Date(now.getUTCFullYear(), 0, 0)) / 86400000);
  const sunsetHour = 17.85 - 1.35 * Math.cos(2 * Math.PI * (dayOfYear - 172) / 365);
  return jstHour >= sunsetHour || jstHour < 6;
}
