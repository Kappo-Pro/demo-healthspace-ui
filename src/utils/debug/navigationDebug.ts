/**
 * Navigation Debug Utilities
 *
 * Comprehensive debugging system to trace navigation flickering issues.
 * Tracks re-renders, state changes, and navigation updates.
 */

export class NavigationDebugger {
  private static instance: NavigationDebugger;
  private logs: Array<{ timestamp: number; type: string; data: unknown }> = [];
  private renderCounts = new Map<string, number>();
  private enabled = true;

  private constructor() {}

  static getInstance(): NavigationDebugger {
    if (!NavigationDebugger.instance) {
      NavigationDebugger.instance = new NavigationDebugger();
    }
    return NavigationDebugger.instance;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  log(type: string, data: unknown) {
    if (!this.enabled) return;

    const timestamp = Date.now();
    const log = { timestamp, type, data };
    this.logs.push(log);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    // Color-coded console output
    const colors: Record<string, string> = {
      'RENDER': '🎨',
      'ACTIVE_KEY': '🎯',
      'NAVIGATION': '🧭',
      'REDUX': '📦',
      'HOVER': '👆',
      'CLICK': '🖱️',
      'PATH_CHANGE': '🛣️',
      'MEMO_HIT': '✅',
      'MEMO_MISS': '❌',
      'STATE_UPDATE': '🔄',
    };

    // Emoji mapping for future console output enhancement
    colors[type] || '📝';
  }

  trackRender(componentName: string, props?: unknown) {
    const count = (this.renderCounts.get(componentName) || 0) + 1;
    this.renderCounts.set(componentName, count);

    this.log('RENDER', {
      component: componentName,
      count,
      props: this.sanitizeProps(props),
    });

    // Warn if component is rendering too frequently
    if (count > 5) {
       
      console.warn(`⚠️ ${componentName} has rendered ${count} times!`);
    }
  }

  trackActiveKey(activeKey: string, currentPath: string) {
    this.log('ACTIVE_KEY', {
      activeKey,
      currentPath,
      timestamp: new Date().toISOString(),
    });
  }

  trackNavigation(from: string, to: string) {
    this.log('NAVIGATION', {
      from,
      to,
      timestamp: new Date().toISOString(),
    });
  }

  trackReduxUpdate(slice: string, value: unknown) {
    this.log('REDUX', {
      slice,
      value,
      timestamp: new Date().toISOString(),
    });
  }

  trackHover(itemId: string, isActive: boolean) {
    this.log('HOVER', {
      itemId,
      isActive,
      timestamp: new Date().toISOString(),
    });
  }

  trackClick(itemId: string, path: string) {
    this.log('CLICK', {
      itemId,
      path,
      timestamp: new Date().toISOString(),
    });
  }

  trackPathChange(oldPath: string, newPath: string) {
    this.log('PATH_CHANGE', {
      oldPath,
      newPath,
      timestamp: new Date().toISOString(),
    });
  }

  trackMemoization(componentName: string, hit: boolean, reason?: string) {
    this.log(hit ? 'MEMO_HIT' : 'MEMO_MISS', {
      component: componentName,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  trackStateUpdate(componentName: string, stateName: string, value: unknown) {
    this.log('STATE_UPDATE', {
      component: componentName,
      state: stateName,
      value,
      timestamp: new Date().toISOString(),
    });
  }

  // Analyze logs for patterns
  analyze() {
    // eslint-disable-next-line no-console
    console.group('📊 Navigation Debug Analysis');

    // Render counts
    // eslint-disable-next-line no-console
    console.group('🎨 Render Counts');
    this.renderCounts.forEach(() => {
      // Render count analysis placeholder
    });
    // eslint-disable-next-line no-console
    console.groupEnd();

    // Recent logs
    // eslint-disable-next-line no-console
    console.group('📝 Recent Logs (last 20)');
    const recentLogs = this.logs.slice(-20);
    recentLogs.forEach(() => {
      // Recent log analysis placeholder
    });
    // eslint-disable-next-line no-console
    console.groupEnd();

    // Pattern detection
    // eslint-disable-next-line no-console
    console.group('🔍 Pattern Detection');
    this.detectPatterns();
    // eslint-disable-next-line no-console
    console.groupEnd();

    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  private detectPatterns() {
    // Check for rapid re-renders
    const recentRenders = this.logs
      .filter(log => log.type === 'RENDER')
      .slice(-10);

    if (recentRenders.length >= 5) {
      const timeSpan = recentRenders[recentRenders.length - 1].timestamp - recentRenders[0].timestamp;
      if (timeSpan < 1000) {
         
        console.warn(`  ⚠️ Detected rapid re-renders: ${recentRenders.length} renders in ${timeSpan}ms`);
      }
    }

    // Check for multiple active key calculations
    const recentActiveKeys = this.logs
      .filter(log => log.type === 'ACTIVE_KEY')
      .slice(-5);

    if (recentActiveKeys.length >= 3) {
      const timeSpan = recentActiveKeys[recentActiveKeys.length - 1].timestamp - recentActiveKeys[0].timestamp;
      if (timeSpan < 500) {
         
        console.warn(`  ⚠️ Active key calculated ${recentActiveKeys.length} times in ${timeSpan}ms`);
      }
    }

    // Check for memo misses
    const memoMisses = this.logs
      .filter(log => log.type === 'MEMO_MISS')
      .slice(-10);

    if (memoMisses.length > 5) {
       
      console.warn(`  ⚠️ High memo miss rate: ${memoMisses.length} misses recently`);
      memoMisses.forEach(() => {
        // Memo miss analysis placeholder
      });
    }
  }

  private sanitizeProps(props: unknown): unknown {
    if (!props) return null;

    // Remove functions and complex objects for cleaner logging
    const sanitized: unknown = {};
    for (const key in props) {
      const value = props[key];
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          sanitized[key] = `[Array(${value.length})]`;
        } else {
          sanitized[key] = '[Object]';
        }
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  clear() {
    this.logs = [];
    this.renderCounts.clear();
  }

  export() {
    return {
      logs: this.logs,
      renderCounts: Object.fromEntries(this.renderCounts),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const navDebug = NavigationDebugger.getInstance();

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as unknown).navDebug = navDebug;
}
