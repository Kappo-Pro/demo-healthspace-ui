# Web Workers Configuration

This project is configured to support Web Workers using Webpack 5's native worker support.

## Configuration

### TypeScript Support
- `tsconfig.json`: Added `"WebWorker"` to the `lib` array for worker API types
- `mediapipe.worker.d.ts`: Type declarations for worker imports

### Webpack Configuration
- `craco.config.js`: Configured Webpack 5 parser to recognize Worker constructors
- No additional loader required - Webpack 5 handles workers natively

## Usage

### Creating a Worker

**Worker file** (`src/workers/example.worker.ts`):
```typescript
// Worker code runs in a separate thread
self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;

  // Process data
  const result = processData(data);

  // Send result back to main thread
  self.postMessage({ type: 'result', data: result });
};
```

### Using a Worker

**Main thread** (`src/components/MyComponent.tsx`):
```typescript
import { useEffect, useRef } from 'react';

function MyComponent() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker using URL constructor (Webpack 5 pattern)
    workerRef.current = new Worker(
      new URL('./workers/example.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Listen for messages from worker
    workerRef.current.onmessage = (e: MessageEvent) => {
      console.log('Worker result:', e.data);
    };

    // Send data to worker
    workerRef.current.postMessage({ type: 'process', data: someData });

    // Cleanup
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return <div>Processing in worker...</div>;
}
```

## MediaPipe Worker Example

For MediaPipe pose estimation offloading:

```typescript
// src/workers/mediapipe.worker.ts
import { Holistic } from '@mediapipe/holistic';

let holistic: Holistic | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, imageData, config } = e.data;

  if (type === 'init') {
    // Initialize MediaPipe in worker
    holistic = new Holistic({
      locateFile: (file) => `holistic/${file}`
    });

    holistic.setOptions(config);

    holistic.onResults((results) => {
      // Send results back to main thread
      self.postMessage({ type: 'results', data: results });
    });

    self.postMessage({ type: 'ready' });
  }

  if (type === 'process' && holistic) {
    // Process frame in worker
    await holistic.send({ image: imageData });
  }

  if (type === 'cleanup') {
    holistic?.close();
    holistic = null;
  }
};
```

## Benefits

1. **Non-blocking UI**: Heavy processing runs in background thread
2. **Better Performance**: Utilizes multiple CPU cores
3. **Type Safety**: Full TypeScript support for worker APIs
4. **Modern Pattern**: Uses Webpack 5 native support (no loader needed)

## Important Notes

- Workers run in separate context (no access to DOM, window, document)
- Use `postMessage` for communication (structured clone algorithm)
- Transferable objects can be used for zero-copy data transfer
- Always terminate workers when component unmounts to prevent memory leaks
