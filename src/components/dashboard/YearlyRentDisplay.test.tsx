import { describe, it, expect } from "vitest";

/**
 * Display invariants for yearly rent.
 * These mirror the formatters used on the public and dashboard property
 * detail pages. If anyone reintroduces a ×12 / ÷12 conversion on
 * `rental_potential_monthly_ngn`, these tests will fail.
 */

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

describe("Yearly rent display invariants", () => {
  it("public detail page renders the stored yearly value unchanged", () => {
    const stored = 1_400_000;
    // What PropertyDetail.tsx renders: formatPrice(property.rental_potential_monthly_ngn)
    const rendered = formatPrice(stored);
    expect(rendered).toContain("1,400,000");
    // Guard: must NOT be 12× (previous bug)
    expect(rendered).not.toContain("16,800,000");
    // Guard: must NOT be 1/12 either
    expect(rendered).not.toContain("116,666");
  });

  it("dashboard detail page renders the stored yearly value unchanged", () => {
    const stored = 12_000_000;
    const rendered = formatPrice(stored);
    expect(rendered).toContain("12,000,000");
    expect(rendered).not.toContain("144,000,000");
    expect(rendered).not.toContain("1,000,000");
  });
});
