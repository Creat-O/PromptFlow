import { FlowExecutor } from "./FlowExecutor";

async function main() {
  const flowPath = process.env.FLOW_PATH || "examples/flow.yaml";
  const inputStr = process.env.FLOW_INPUT || '{"text":"Hello world"}';
  const input = JSON.parse(inputStr);

  const exec = new FlowExecutor(flowPath);
  const ctx = await exec.run(input);

  // (옵션) 최소 헬스 서버
  const http = await import("http");
  const server = http.createServer((_, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, lastOutput: ctx }));
  });
  server.listen(3001, () => console.log("Core health on :3001"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
