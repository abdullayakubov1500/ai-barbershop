export function isLocalDevRequest(request) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  const host = String(request.headers.get("host") || "");
  return /^localhost:\d+$/i.test(host) || /^127\.0\.0\.1:\d+$/i.test(host);
}
