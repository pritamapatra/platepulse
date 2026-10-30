const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function businessDate(at: Date = new Date()): string {
  if (Number.isNaN(at.getTime())) {
    throw new Error("Invalid date");
  }
  return formatter.format(at);
}
