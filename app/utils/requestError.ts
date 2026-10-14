export function requestErrorStatus(error: unknown): number {
  if (!error || typeof error !== "object") return 0;
  const value = error as { statusCode?: number; status?: number; response?: { status?: number }; data?: { statusCode?: number } };
  const code = value.response?.status ?? value.data?.statusCode ?? value.statusCode ?? value.status;
  return typeof code === "number" && Number.isInteger(code) && code >= 400 && code <= 599 ? code : 0;
}

export function authErrorMessage(error: unknown, action: "login" | "register" | "logout"): string {
  const code = requestErrorStatus(error);
  if (!code) return "Không thể kết nối đến dịch vụ tài khoản. Kiểm tra kết nối và thử lại.";
  if (code >= 500) return "Dịch vụ tài khoản tạm thời gặp sự cố. Vui lòng thử lại sau.";
  if (code === 429) return "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ rồi thử lại.";
  if (code === 401) return action === "login" ? "Tên đăng nhập hoặc mật khẩu chưa chính xác." : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (code === 403) return "Yêu cầu bị từ chối. Vui lòng tải lại trang và thử lại.";
  if (code === 409 && action === "register") return "Tên đăng nhập hoặc email đã được sử dụng.";
  if (code === 400) {
    const data = (error as { data?: { message?: unknown; statusMessage?: unknown } }).data;
    const message = data?.message ?? data?.statusMessage;
    if (typeof message === "string" && message.length <= 300) return message;
    return "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.";
  }
  return "Không thể xử lý yêu cầu tài khoản. Vui lòng thử lại.";
}

export function orderErrorMessage(error: unknown): string {
  const code = requestErrorStatus(error);
  if (code === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (code === 403) return "Bạn không có quyền xem đơn hàng này.";
  if (code === 404) return "Không tìm thấy đơn hàng.";
  if (code === 400) return "Mã đơn hàng không hợp lệ.";
  if (code === 429) return "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ rồi thử lại.";
  return code >= 500 ? "Dịch vụ đơn hàng tạm thời gặp sự cố. Vui lòng thử lại."
    : "Không thể kết nối để tải đơn hàng. Kiểm tra kết nối và thử lại.";
}

export function canRetryOrder(error: unknown): boolean {
  return ![400, 401, 403, 404].includes(requestErrorStatus(error));
}
