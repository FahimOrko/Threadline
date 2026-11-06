import { beforeEach, describe, expect, it } from "vitest";
import { useRoleStore } from "@/store/role-store";

describe("role store", () => {
  beforeEach(() => useRoleStore.setState({ role: "kam" }));

  it("defaults to kam", () => {
    expect(useRoleStore.getState().role).toBe("kam");
  });

  it("switches to customer and back", () => {
    useRoleStore.getState().setRole("customer");
    expect(useRoleStore.getState().role).toBe("customer");
    useRoleStore.getState().setRole("kam");
    expect(useRoleStore.getState().role).toBe("kam");
  });
});
