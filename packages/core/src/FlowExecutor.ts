import fs from "fs";
import yaml from "js-yaml";
import axios from "axios";
import interpolate from "./utils/interpolate";

type Step = {
  id: string;
  runtime: "python" | "java" | "ts";
  provider?: string;
  prompt: string;
};

export class FlowExecutor {
  private context: Record<string, any> = {};
  private pyUrl = process.env.PY_RUNTIME_URL || "http://localhost:8000";
  private javaUrl = process.env.JAVA_RUNTIME_URL || "http://localhost:8080";

  constructor(private flowPath: string) {}

  private getRuntimeUrl(runtime: string) {
    if (runtime === "python") return this.pyUrl;
    if (runtime === "java") return this.javaUrl;
    return "http://localhost:3000";
  }

  async run(input: Record<string, any>) {
    const flow = yaml.load(fs.readFileSync(this.flowPath, "utf-8")) as any;
    const steps: Step[] = flow.steps;
    this.context.input = input;

    for (const step of steps) {
      const prompt = interpolate(step.prompt, this.context);
      const runtimeUrl = this.getRuntimeUrl(step.runtime);

      const { data } = await axios.post(`${runtimeUrl}/execute`, {
        id: step.id,
        prompt,
        provider: step.provider,
        context: this.context,
      });

      this.context[`${step.id}.output`] = data.output;
      console.log(`✅ [${step.id}] ${String(data.output).slice(0, 140)}`);
    }

    return this.context;
  }
}
