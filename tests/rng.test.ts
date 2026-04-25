import { describe, it, expect } from "vitest";
import { createRng, hashSeed } from "@/lib/rng";

describe("rng", () => {
  it("is deterministic for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("produces different streams for different seeds", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it("int respects maxExclusive", () => {
    const r = createRng(7);
    for (let i = 0; i < 500; i++) {
      const v = r.int(10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it("hashSeed is stable", () => {
    expect(hashSeed("hello")).toEqual(hashSeed("hello"));
    expect(hashSeed("hello")).not.toEqual(hashSeed("world"));
  });
});
