import axios from "axios";

describe("Integration: runtime endpoints", () => {
  const PY = process.env.PY_RUNTIME_URL || "http://localhost:8000";
  const JAVA = process.env.JAVA_RUNTIME_URL || "http://localhost:8080";

  it("should respond from Python runtime", async () => {
    const res = await axios.get(`${PY}/health`);
    expect(res.data.ok).toBe(true);
  });

  it("should respond from Java runtime", async () => {
    const res = await axios.get(`${JAVA}/health`);
    expect(res.data.ok).toBe(true);
  });
});
