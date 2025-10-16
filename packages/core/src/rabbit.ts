import amqp from "amqplib";

const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost:5672";
export const QUEUE_NAME = "promptflow_steps";

export async function createChannel() {
  const conn = await amqp.connect(RABBIT_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE_NAME, { durable: true });
  return ch;
}

export async function sendJob(ch: amqp.Channel, job: any) {
  ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(job)), {
    persistent: true,
  });
}
