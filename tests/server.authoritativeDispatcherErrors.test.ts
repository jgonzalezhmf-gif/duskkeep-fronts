import { describe, expect, it } from "vitest";
import {
  INVALID_AUTHORITATIVE_SERVER_RESPONSE_REASON,
  authoritativeResponseMismatch,
  invalidAuthoritativeServerResponse,
} from "@/features/server/authoritativeDispatcherErrors";

describe("authoritative dispatcher errors", () => {
  it("returns a generic invalid server response failure", () => {
    expect(invalidAuthoritativeServerResponse()).toEqual({
      ok: false,
      mode: "authoritative",
      reason: INVALID_AUTHORITATIVE_SERVER_RESPONSE_REASON,
    });
  });

  it("keeps mismatch failures generic and scoped to the mismatched entity", () => {
    expect(authoritativeResponseMismatch("hero")).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response hero mismatch",
    });
  });
});
