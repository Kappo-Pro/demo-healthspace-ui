/**
 * RateLimiter Service Tests
 *
 * Comprehensive test suite including DoS simulation and performance tests
 */

import { RateLimiter, RateLimitError, MaxCommandsError } from '../RateLimiter';

describe('RateLimiter Service', () => {
  beforeEach(() => {
    // Reset rate limiter state before each test
    RateLimiter.reset();
  });

  describe('Window Rate Limiting (DoS Prevention)', () => {
    it('allows 50 registrations in 100ms window', () => {
      // Should not throw for 50 registrations
      for (let i = 0; i < 50; i++) {
        expect(() => RateLimiter.register()).not.toThrow();
      }
    });

    it('blocks 51st registration in same window', () => {
      // Fill up the window
      for (let i = 0; i < 50; i++) {
        RateLimiter.register();
      }

      // 51st registration should throw RateLimitError
      expect(() => RateLimiter.register()).toThrow(RateLimitError);
    });

    it('throws RateLimitError with correct message format', () => {
      // Fill up the window
      for (let i = 0; i < 50; i++) {
        RateLimiter.register();
      }

      // Verify error message includes count and window duration
      expect(() => RateLimiter.register()).toThrow(
        /Rate limit exceeded: \d+ registrations in \d+ms/
      );
    });

    it('allows more registrations after window expires', async () => {
      // Fill up the window
      for (let i = 0; i < 50; i++) {
        RateLimiter.register();
      }

      // Wait for window to expire (100ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 110));

      // Should allow registration in new window
      expect(() => RateLimiter.register()).not.toThrow();
    });

    it('handles rapid successive registrations correctly', () => {
      // Simulate rapid-fire registrations (DoS attack pattern)
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < 100; i++) {
        try {
          RateLimiter.register();
          successCount++;
        } catch (error) {
          if (error instanceof RateLimitError) {
            errorCount++;
          }
        }
      }

      // Should allow exactly 50 and block 50
      expect(successCount).toBe(50);
      expect(errorCount).toBe(50);
    });
  });

  describe('Total Commands Limit', () => {
    it('allows 500 total registrations across multiple windows', async () => {
      // Use fake timers to speed up test
      jest.useFakeTimers();

      for (let i = 0; i < 500; i++) {
        RateLimiter.register();

        // Advance time to avoid window limit (every 50 registrations)
        if ((i + 1) % 50 === 0) {
          jest.advanceTimersByTime(110);
        }
      }

      // Should have exactly 500 registrations
      expect((RateLimiter as unknown).totalRegistrations).toBe(500);

      jest.useRealTimers();
    });

    it('blocks 501st registration with MaxCommandsError', () => {
      // Simulate 500 registrations without actually waiting
      (RateLimiter as unknown).totalRegistrations = 500;

      // 501st registration should throw MaxCommandsError
      expect(() => RateLimiter.register()).toThrow(MaxCommandsError);
    });

    it('throws MaxCommandsError with correct message', () => {
      // Simulate max limit reached
      (RateLimiter as unknown).totalRegistrations = 500;

      // Verify error message includes max limit
      expect(() => RateLimiter.register()).toThrow(
        /Maximum commands limit reached: 500 commands/
      );
    });

    it('enforces total limit even after window expires', async () => {
      // Simulate 500 total registrations
      (RateLimiter as unknown).totalRegistrations = 500;

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 110));

      // Should still block due to total limit
      expect(() => RateLimiter.register()).toThrow(MaxCommandsError);
    });
  });

  describe('Sliding Window Algorithm', () => {
    it('correctly expires old timestamps', async () => {
      // Register 25 commands
      for (let i = 0; i < 25; i++) {
        RateLimiter.register();
      }

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 110));

      // Old timestamps should be cleaned
      // Should allow 50 new registrations (not 25)
      for (let i = 0; i < 50; i++) {
        expect(() => RateLimiter.register()).not.toThrow(RateLimitError);
      }
    });

    it('maintains accurate count during window', () => {
      // Register 30 commands
      for (let i = 0; i < 30; i++) {
        RateLimiter.register();
      }

      // Should have 20 remaining slots
      expect(RateLimiter.getRemainingSlots()).toBe(20);

      // Register 20 more
      for (let i = 0; i < 20; i++) {
        RateLimiter.register();
      }

      // Should have 0 remaining slots
      expect(RateLimiter.getRemainingSlots()).toBe(0);
    });

    it('handles window reset correctly', async () => {
      jest.useFakeTimers();

      // Register commands
      for (let i = 0; i < 50; i++) {
        RateLimiter.register();
      }

      // Advance time past window
      jest.advanceTimersByTime(110);

      // Check that window is reset
      expect(RateLimiter.getRemainingSlots()).toBe(50);

      jest.useRealTimers();
    });

    it('handles partial window overlap', async () => {
      jest.useFakeTimers();

      // Register 25 commands
      for (let i = 0; i < 25; i++) {
        RateLimiter.register();
      }

      // Advance time 50ms (half window)
      jest.advanceTimersByTime(50);

      // Register 25 more
      for (let i = 0; i < 25; i++) {
        RateLimiter.register();
      }

      // Advance another 60ms (first 25 should expire)
      jest.advanceTimersByTime(60);

      // Should have space for more (first batch expired)
      expect(RateLimiter.getRemainingSlots()).toBeGreaterThan(0);

      jest.useRealTimers();
    });
  });

  describe('Helper Methods', () => {
    describe('checkLimit()', () => {
      it('returns true when within limits', () => {
        expect(RateLimiter.checkLimit()).toBe(true);

        // Register some commands
        for (let i = 0; i < 25; i++) {
          RateLimiter.register();
        }

        expect(RateLimiter.checkLimit()).toBe(true);
      });

      it('returns false when window limit exceeded', () => {
        // Fill up the window
        for (let i = 0; i < 50; i++) {
          RateLimiter.register();
        }

        expect(RateLimiter.checkLimit()).toBe(false);
      });

      it('returns false when total limit reached', () => {
        // Simulate max total reached
        (RateLimiter as unknown).totalRegistrations = 500;

        expect(RateLimiter.checkLimit()).toBe(false);
      });
    });

    describe('getRemainingSlots()', () => {
      it('returns 50 when no registrations', () => {
        expect(RateLimiter.getRemainingSlots()).toBe(50);
      });

      it('returns correct count after registrations', () => {
        // Register 20 commands
        for (let i = 0; i < 20; i++) {
          RateLimiter.register();
        }

        expect(RateLimiter.getRemainingSlots()).toBe(30);
      });

      it('returns 0 when window is full', () => {
        // Fill up the window
        for (let i = 0; i < 50; i++) {
          RateLimiter.register();
        }

        expect(RateLimiter.getRemainingSlots()).toBe(0);
      });

      it('returns 0 when total limit is reached', () => {
        // Simulate max total reached
        (RateLimiter as unknown).totalRegistrations = 500;

        expect(RateLimiter.getRemainingSlots()).toBe(0);
      });
    });

    describe('reset()', () => {
      it('clears all registrations', () => {
        // Register commands
        for (let i = 0; i < 30; i++) {
          RateLimiter.register();
        }

        // Reset
        RateLimiter.reset();

        // Should be back to initial state
        expect(RateLimiter.getRemainingSlots()).toBe(50);
        expect(RateLimiter.checkLimit()).toBe(true);
      });

      it('resets total registrations counter', () => {
        // Register commands
        for (let i = 0; i < 100; i++) {
          try {
            RateLimiter.register();
          } catch {
            // Ignore rate limit errors
          }
        }

        // Reset
        RateLimiter.reset();

        // Total should be 0
        expect((RateLimiter as unknown).totalRegistrations).toBe(0);
      });
    });
  });

  describe('Error Classes', () => {
    it('RateLimitError has correct name', () => {
      const error = new RateLimitError(50, 100);
      expect(error.name).toBe('RateLimitError');
    });

    it('MaxCommandsError has correct name', () => {
      const error = new MaxCommandsError(500);
      expect(error.name).toBe('MaxCommandsError');
    });

    it('errors are instances of Error', () => {
      const rateLimitError = new RateLimitError(50, 100);
      const maxCommandsError = new MaxCommandsError(500);

      expect(rateLimitError).toBeInstanceOf(Error);
      expect(maxCommandsError).toBeInstanceOf(Error);
    });
  });

  describe('Performance & Edge Cases', () => {
    it('handles concurrent registrations in same window', () => {
      const registrations: Promise<void>[] = [];

      // Attempt 60 concurrent registrations
      for (let i = 0; i < 60; i++) {
        registrations.push(
          Promise.resolve().then(() => {
            try {
              RateLimiter.register();
            } catch {
              // Expected for some registrations
            }
          })
        );
      }

      return Promise.all(registrations).then(() => {
        // Should have stopped at 50
        expect((RateLimiter as unknown).totalRegistrations).toBeLessThanOrEqual(50);
      });
    });

    it('maintains performance with large window cleanup', async () => {
      jest.useFakeTimers();

      // Register many commands across multiple windows
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 50; j++) {
          RateLimiter.register();
        }
        jest.advanceTimersByTime(110);
      }

      // Cleanup should still be fast
      const start = Date.now();
      RateLimiter.checkLimit();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Should be near-instant

      jest.useRealTimers();
    });
  });
});
