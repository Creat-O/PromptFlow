export default function interpolate<T extends Record<string, any>>(
  template: string,
  ctx: T
): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const path = key.trim().split(".");
    const value = path.reduce(
      (acc: unknown, cur: string) =>
        acc != null && typeof acc === "object"
          ? (acc as Record<string, unknown>)[cur]
          : null,
      ctx as unknown
    );
    return value != null ? String(value) : "";
  });
}
