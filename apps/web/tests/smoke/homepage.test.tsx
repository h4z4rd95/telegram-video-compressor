import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("homepage", () => {
  it("shows the product headline", () => {
    render(<HomePage />);
    expect(screen.getByText(/compress videos on the web/i)).toBeInTheDocument();
  });
});
