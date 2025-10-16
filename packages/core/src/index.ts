import fs from "fs";
import yaml from "js-yaml";
import { v4 as uuid } from "uuid";
import { createChannel, sendJob } from "./rabbit";
import { FlowExecutor } from "./FlowExecutor";
import { initContext, getContext } from "./redisStore";
import { extractDeps } from "./utils/interpolate";

type Step = {
  id: string;
  runtime: "python" | "java" | "ts";
  provider?: string;
  prompt: string;
};

function topoLevels(steps: Step[]): Step[][] {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const inDeg = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const s of steps) {
    const deps = extractDeps(s.prompt);
    inDeg.set(s.id, deps.length);
    for (const d of deps) {
      if (!adj.has(d)) adj.set(d, []);
      adj.get(d)!.push(s.id);
    }
  }

  const levels: Step[][] = [];
  let frontier = steps.filter((s) => (inDeg.get(s.id) ?? 0) === 0);

  while (frontier.length) {
    levels.push(frontier);
    const next: Step[] = [];
    for (const s of frontier) {
      for (const v of adj.get(s.id) ?? []) {
        inDeg.set(v, (inDeg.get(v) ?? 0) - 1);
        if ((inDeg.get(v) ?? 0) === 0) next.push(byId.get(v)!);
      }
    }
    frontier = next;
  }
  return levels;
}

async function runFlow(flowPath: string, input: any) {
  const flow = yaml.load(fs.readFileSync(flowPath, "utf-8")) as {
    steps: Step[];
  };
  const runId = uuid();
  await initContext(runId, input);

  const levels = topoLevels(flow.steps);
  const ch = await createChannel();

  console.log(`▶️ runId=${runId} levels=${levels.length}`);
  for (const layer of levels) {
    await Promise.all(
      layer.map(async (s) => {
        const job = {
          runId,
          stepId: s.id,
          runtime: s.runtime,
          provider: s.provider,
          promptTemplate: s.prompt,
        };
        await sendJob(ch, job);
      })
    );

    // wait until workers mark all layer steps done
    let pending = layer.length;
    while (pending > 0) {
      const ctx = await getContext(runId);
      pending = layer.filter((l) => !ctx[`${l.id}.output`]).length;
      if (pending > 0) await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`✅ layer done: [${layer.map((s) => s.id).join(", ")}]`);
  }

  const final = await getContext(runId);
  console.log("🎉 flow finished", final);
}

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
