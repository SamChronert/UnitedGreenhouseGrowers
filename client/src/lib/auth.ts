export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*/.test(error.message) || error.message.includes("Unauthorized");
}

export function redirectToLogin() {
  window.location.href = "/login";
}
