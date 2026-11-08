// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Notice } from "@/components/notice";

afterEach(cleanup);

describe("Notice", () => {
  it("renders its text as a status", () => {
    render(<Notice>hello</Notice>);
    expect(screen.getByRole("status").textContent).toBe("hello");
  });
});
