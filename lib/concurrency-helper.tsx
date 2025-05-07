export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then((result) => {
      results.push(result);
    });
    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Clean up finished tasks
      for (let i = executing.length - 1; i >= 0; i--) {
        executing.splice(i, 1);
      }
    }
  }

  await Promise.all(executing);
  return results;
}
