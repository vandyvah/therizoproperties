import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// --- Mocks -----------------------------------------------------------------
const updateMock = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});
const insertMock = vi.fn().mockReturnValue({
  select: () => ({ single: () => Promise.resolve({ data: { id: "new-id" }, error: null }) }),
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      update: updateMock,
      insert: insertMock,
    }),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ profile: { id: "user-1" } }),
}));

vi.mock("@/components/dashboard/PropertyMediaUpload", () => ({
  PropertyMediaUpload: () => null,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { PropertyForm } from "@/components/dashboard/PropertyForm";

function renderForm(initial: any) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <PropertyForm
        open
        onClose={() => {}}
        onSuccess={() => {}}
        initialData={initial}
      />
    </QueryClientProvider>
  );
}

describe("PropertyForm yearly rent round-trip", () => {
  beforeEach(() => {
    updateMock.mockClear();
    insertMock.mockClear();
  });

  it("renders the saved yearly rent value exactly (no ×12 or ÷12)", () => {
    renderForm({
      id: "p1",
      title: "Test",
      property_type: "Detached House",
      city: "Abuja",
      asking_price_ngn: 150000000,
      rental_potential_monthly_ngn: 12000000,
      risk_rating: "low",
      status: "listed",
    });

    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    expect(input.value).toBe("12000000");
    // Live preview shows the same yearly figure
    expect(screen.getByText(/₦12,000,000 \/ year/)).toBeInTheDocument();
  });

  it("saves the yearly rent value exactly as typed", async () => {
    const user = userEvent.setup();
    renderForm({
      id: "p1",
      title: "Test",
      property_type: "Detached House",
      city: "Abuja",
      asking_price_ngn: 150000000,
      rental_potential_monthly_ngn: 12000000,
      risk_rating: "low",
      status: "listed",
    });

    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "1400000");
    expect(input.value).toBe("1400000");

    await user.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    const payload = updateMock.mock.calls[0][0];
    expect(payload.rental_potential_monthly_ngn).toBe(1400000);
  });

  it("blocks save and shows an error when yearly rent looks monthly (yield > 25%)", async () => {
    const user = userEvent.setup();
    renderForm({
      id: "p1",
      title: "Test",
      property_type: "Detached House",
      city: "Abuja",
      asking_price_ngn: 100_000_000,
      rental_potential_monthly_ngn: 0,
      risk_rating: "low",
      status: "listed",
    });

    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "30000000"); // 30% yield → monthly-looking
    await user.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/ANNUAL rent/i)
    );
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("blocks save when yearly rent is implausibly low (< ₦200,000)", async () => {
    const user = userEvent.setup();
    renderForm({
      id: "p1",
      title: "Test",
      property_type: "Detached House",
      city: "Abuja",
      asking_price_ngn: 100_000_000,
      rental_potential_monthly_ngn: 0,
      risk_rating: "low",
      status: "listed",
    });

    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "50000");
    await user.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/monthly amount|too low/i)
    );
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("preserves the yearly value on a full re-render (save → reload round-trip)", () => {
    // First mount = save; second mount simulates reopening the form after refetch
    const { unmount } = renderForm({
      id: "p1",
      title: "Test",
      property_type: "Detached House",
      city: "Abuja",
      asking_price_ngn: 150000000,
      rental_potential_monthly_ngn: 7200000,
      risk_rating: "low",
      status: "listed",
    });
    expect((screen.getByLabelText(/Rental Potential/i) as HTMLInputElement).value).toBe("7200000");
    unmount();

    renderForm({
      id: "p1",
      title: "Test",
      property_type: "Detached House",
      city: "Abuja",
      asking_price_ngn: 150000000,
      rental_potential_monthly_ngn: 7200000,
      risk_rating: "low",
      status: "listed",
    });
    expect((screen.getByLabelText(/Rental Potential/i) as HTMLInputElement).value).toBe("7200000");
  });

  const basePayload = {
    id: "p1",
    title: "Test",
    property_type: "Detached House",
    city: "Abuja",
    asking_price_ngn: 100_000_000,
    rental_potential_monthly_ngn: 0,
    risk_rating: "low" as const,
    status: "listed" as const,
  };

  async function typeAndSave(value: string) {
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    await user.clear(input);
    if (value) await user.type(input, value);
    await user.click(screen.getByRole("button", { name: /Update/i }));
    return { user, input };
  }

  it("accepts exactly 25% yield (boundary — not > 25%)", async () => {
    renderForm(basePayload);
    await typeAndSave("25000000"); // 25% of 100M
    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0].rental_potential_monthly_ngn).toBe(25_000_000);
  });

  it("rejects 25.01% yield (just over threshold)", async () => {
    renderForm(basePayload);
    await typeAndSave("25010000");
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/ANNUAL/i)
    );
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("accepts exactly ₦200,000/year (low boundary — not < 200,000)", async () => {
    renderForm(basePayload);
    await typeAndSave("200000");
    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0].rental_potential_monthly_ngn).toBe(200_000);
  });

  it("rejects ₦199,999/year (just under low boundary)", async () => {
    renderForm(basePayload);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "199999");
    expect(input.value).toBe("199999");
    await user.click(screen.getByRole("button", { name: /Update/i }));
    const alert = await screen.findByRole("alert", {}, { timeout: 3000 });
    expect(alert.textContent).toMatch(/monthly|ANNUAL/i);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("ignores commas and spaces in typed input (number input strips them)", async () => {
    renderForm(basePayload);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "7,200 000"); // commas + space
    // <input type="number"> discards non-numeric characters
    expect(input.value).toBe("7200000");
    await user.click(screen.getByRole("button", { name: /Update/i }));
    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0].rental_potential_monthly_ngn).toBe(7_200_000);
  });

  it("offers a Convert to yearly (×12) action and applies it", async () => {
    renderForm(basePayload);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Rental Potential/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "600000"); // < 200k? no — 600k > 200k. Use monthly-looking against price.

    // Force suspicious via low-value scenario
    await user.clear(input);
    await user.type(input, "150000"); // below 200k threshold → suspicious
    const btn = await screen.findByRole("button", { name: /Convert to yearly/i });
    await user.click(btn);
    expect(input.value).toBe("1800000"); // 150,000 × 12
    // Preview reflects new yearly figure
    expect(screen.getByText(/₦1,800,000 \/ year/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Update/i }));
    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0].rental_potential_monthly_ngn).toBe(1_800_000);
  });

  it("round-trips reload values through many magnitudes without alteration", () => {
    for (const v of [200_000, 1_400_000, 7_200_000, 12_000_000, 25_000_000, 99_999_999]) {
      const { unmount } = renderForm({ ...basePayload, rental_potential_monthly_ngn: v });
      expect(
        (screen.getByLabelText(/Rental Potential/i) as HTMLInputElement).value
      ).toBe(String(v));
      unmount();
    }
  });
});
