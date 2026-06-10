export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const PASSWORD_HINT =
  "At least 8 characters with uppercase, lowercase, number, and special character";

export function isValidPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}
