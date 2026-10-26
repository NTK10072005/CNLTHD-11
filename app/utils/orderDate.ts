const orderDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  calendar: "gregory",
  numberingSystem: "latn",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function formatOrderDate(value: string): string {
  // API lưu ISO có Z/offset. Không suy diễn ngày thiếu múi giờ theo máy đang chạy.
  if (
    typeof value !== "string" ||
    !value.includes("T") ||
    !/(Z|[+-]\d{2}:\d{2})$/i.test(value)
  )
    return "Không rõ thời gian";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Không rõ thời gian";

  const parts = Object.fromEntries(
    orderDateFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );
  // Ghép cùng một định dạng, không phụ thuộc dấu phân cách của ICU trên mỗi máy.
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}
