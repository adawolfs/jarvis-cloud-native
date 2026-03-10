import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JarvisParticleCore } from "./JarvisParticleCore";

describe("JarvisParticleCore", () => {
  it("exposes visual mode as data attribute", () => {
    render(<JarvisParticleCore mode="listening" />);

    expect(screen.getByTestId("jarvis-particle-core")).toHaveAttribute(
      "data-mode",
      "listening",
    );
  });
});
