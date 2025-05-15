export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      try {
        const result = await tasks[i]();
        results.push(result);
      } catch (err) {
        console.warn("Task failed:", err);
        // still continue — maybe log or handle error if needed
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}
