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
});
