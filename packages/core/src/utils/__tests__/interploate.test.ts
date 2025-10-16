import interpolate from "../interpolate";
import { extractDeps } from "../interpolate";

describe("interpolate()", () => {
  it("should replace variables", () => {
    const ctx = { input: { text: "hello" } };
    expect(interpolate("Say: {{input.text}}", ctx)).toBe("Say: hello");
  });
});

describe("extractDeps()", () => {
  it("should find dependency steps", () => {
    const deps = extractDeps("Translate {{summarize.output}} to Korean");
    expect(deps).toEqual(["summarize"]);
  });
});
