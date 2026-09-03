import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidSessionCookie } from "./auth";

export function isAdminRequest(): boolean {
  const cookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return isValidSessionCookie(cookie);
}
