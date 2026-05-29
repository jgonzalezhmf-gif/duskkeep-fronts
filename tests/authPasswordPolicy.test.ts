import { describe, expect, it } from "vitest";
import {
  doRegistrationPasswordsMatch,
  getRegistrationPasswordStrength,
  isRegistrationPasswordFormatValid,
  REGISTRATION_PASSWORD_MIN_LENGTH,
} from "@/features/server/authPasswordPolicy";

describe("registration password policy", () => {
  it("requires more than eight characters for registration", () => {
    expect(REGISTRATION_PASSWORD_MIN_LENGTH).toBe(9);
    expect(isRegistrationPasswordFormatValid("12345678")).toBe(false);
    expect(isRegistrationPasswordFormatValid("123456789")).toBe(true);
  });

  it("grades weak, medium and strong registration passwords", () => {
    expect(getRegistrationPasswordStrength("short").level).toBe("weak");
    expect(getRegistrationPasswordStrength("Longpass1").level).toBe("medium");
    expect(getRegistrationPasswordStrength("Longpass1!").level).toBe("strong");
  });

  it("requires a non-empty matching confirmation", () => {
    expect(doRegistrationPasswordsMatch("Longpass1!", "")).toBe(false);
    expect(doRegistrationPasswordsMatch("Longpass1!", "Longpass1")).toBe(false);
    expect(doRegistrationPasswordsMatch("Longpass1!", "Longpass1!")).toBe(true);
  });
});
