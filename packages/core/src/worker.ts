import amqp from "amqplib";
import axios from "axios";
import { getContext, mergeContext } from "./redisStore";
import interpolate from "./utils/interpolate";
import { QUEUE_NAME } from "./rabbit";

const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost:5672";
const PY = process.env.PY_RUNTIME_URL || "http://localhost:8000";
const JAVA = process.env.JAVA_RUNTIME_URL || "http://localhost:8080";

function runtimeUrl(rt: string) {
  if (rt === "python") return PY;
  if (rt === "java") return JAVA;
  return "http://localhost:3000";
}

(async () => {
  const conn = await amqp.connect(RABBIT_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE_NAME, { durable: true });
  ch.prefetch(4);

  console.log("⚙️ worker listening for jobs...");

  ch.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;
    try {
      const job = JSON.parse(msg.content.toString());
      const { runId, stepId, runtime, provider, promptTemplate } = job;

      const ctx = await getContext(runId);
      const prompt = interpolate(promptTemplate, ctx);
      const { data } = await axios.post(`${runtimeUrl(runtime)}/execute`, {
        id: stepId,
        prompt,
        provider,
        context: ctx,
      });

      await mergeContext(runId, { [`${stepId}.output`]: data.output });
      ch.ack(msg);
      console.log(`✅ ${stepId} done`);
    } catch (e) {
      console.error("❌ Worker error:", e);
      ch.nack(msg, false, true);
    }
  });
})();
