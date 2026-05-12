/**
 * Test to verify Web Worker configuration is working correctly
 *
 * This test validates:
 * 1. TypeScript recognizes Worker types (WebWorker lib added to tsconfig)
 * 2. Worker instantiation pattern works
 * 3. Worker type declarations are accessible
 */

describe('Web Worker Configuration', () => {
  it('should allow Worker type declarations', () => {
    // This compiles only if TypeScript recognizes Worker types
    const workerType: typeof Worker = Worker;
    expect(workerType).toBe(Worker);
  });

  it('should support Worker constructor pattern', () => {
    // Test that URL constructor pattern is recognized by TypeScript
    // This is the modern Webpack 5 pattern for workers
    const createWorker = () => {
      // Note: In actual usage, this would be:
      // new Worker(new URL('./example.worker.ts', import.meta.url))
      // But in test environment, we just verify the types compile
      const workerUrl = new URL('data:text/javascript,console.log("test")', import.meta.url);
      expect(workerUrl).toBeInstanceOf(URL);
    };

    expect(createWorker).not.toThrow();
  });

  it('should have Worker globals in scope', () => {
    // Verify Worker constructor is available
    expect(typeof Worker).toBe('function');
  });
});
