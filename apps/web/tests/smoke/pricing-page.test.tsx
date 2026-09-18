import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PricingPage from "@/app/pricing/page";

describe("pricing page", () => {
  it("renders pricing headline and paid plan scaffolding", () => {
    render(<PricingPage />);

    expect(screen.getByRole("heading", { name: /choose a plan/i })).toBeInTheDocument();
    expect(screen.getByText(/starter/i)).toBeInTheDocument();
    expect(screen.getByText(/pro/i)).toBeInTheDocument();
  });
});
