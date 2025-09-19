export function formatDate(
  dateInput: string | Date | null | undefined,
  format = "DD-MM-YYYY hh:mm A"
): string {
  if (!dateInput) return "";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  const hour24 = date.getHours();
  const hour12Num = hour24 % 12 || 12;
  const hour12 = hour12Num.toString().padStart(2, "0");
  const hour24Str = hour24.toString().padStart(2, "0");

  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hour24 >= 12 ? "PM" : "AM";

  // Replace tokens in the format string
  return format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", year)
    .replace("HH", hour24Str)
    .replace("hh", hour12)
    .replace("mm", minutes)
    .replace("A", ampm);
}
